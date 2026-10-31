import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CallSession, CallSignal, CallType, CallStatus, User } from '../types';

// WebRTC Configuration using reliable public STUN servers
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

// Web Audio Ringtone Synthesizer
class RingtonePlayer {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  startRinging() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    const playTone = () => {
      if (!this.ctx) return;
      try {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
        osc2.frequency.setValueAtTime(480, this.ctx.currentTime); // B4

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 1.2);
        osc2.stop(this.ctx.currentTime + 1.2);
      } catch (err) {
        // Audio policy ignore
      }
    };

    playTone();
    this.intervalId = setInterval(playTone, 2500);
  }

  playEndBeep() {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const ringtone = new RingtonePlayer();

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private activeCallId: string | null = null;
  private unsubscribeSignals: (() => void) | null = null;
  private unsubscribeCall: (() => void) | null = null;

  public onRemoteStream?: (stream: MediaStream) => void;
  public onLocalStream?: (stream: MediaStream) => void;
  public onCallStateChange?: (status: CallStatus) => void;
  public onError?: (errorMsg: string) => void;

  async startCall(
    caller: User,
    receiver: User,
    type: CallType
  ): Promise<string> {
    try {
      // 1. Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video:
          type === 'video'
            ? {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : false,
      });

      this.localStream = stream;
      if (this.onLocalStream) this.onLocalStream(stream);

      // 2. Initialize PeerConnection
      this.initPeerConnection();

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // 3. Create call document in Firestore
      const callRef = doc(collection(db, 'calls'));
      const callId = callRef.id;
      this.activeCallId = callId;

      const callData: CallSession = {
        id: callId,
        callerId: caller.id,
        callerName: caller.name,
        callerAvatar: caller.avatarUrl,
        receiverId: receiver.id,
        receiverName: receiver.name,
        receiverAvatar: receiver.avatarUrl,
        type,
        status: 'calling',
        createdAt: new Date().toISOString(),
      };

      await setDoc(callRef, callData);

      // Start ringing sound
      ringtone.startRinging();

      // 4. Create SDP Offer
      if (this.peerConnection) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        // Store offer in Firestore signals
        await addDoc(collection(db, 'calls', callId, 'signals'), {
          callId,
          senderId: caller.id,
          type: 'offer',
          data: JSON.stringify(offer),
          createdAt: new Date().toISOString(),
        });
      }

      // 5. Listen for answer & candidates and call status
      this.listenToSignals(callId, caller.id);
      this.listenToCallStatus(callId);

      return callId;
    } catch (err: any) {
      this.cleanup();
      const msg = err.name === 'NotAllowedError'
        ? 'تم رفض إذن الوصول إلى الكاميرا أو الميكروفون'
        : 'تعذر بدء المكالمة، يرجى التحقق من الشبكة والأجهزة';
      if (this.onError) this.onError(msg);
      throw err;
    }
  }

  async answerCall(call: CallSession, currentUser: User): Promise<void> {
    try {
      this.activeCallId = call.id;

      // 1. Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video:
          call.type === 'video'
            ? {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : false,
      });

      this.localStream = stream;
      if (this.onLocalStream) this.onLocalStream(stream);

      // 2. Initialize PeerConnection
      this.initPeerConnection();

      // Add local tracks
      stream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      ringtone.stop();

      // 3. Mark call ongoing in Firestore
      await updateDoc(doc(db, 'calls', call.id), {
        status: 'ongoing',
        startedAt: new Date().toISOString(),
      });

      // 4. Listen for offer from Firestore signals
      this.listenToSignals(call.id, currentUser.id, async (signal) => {
        if (signal.type === 'offer' && this.peerConnection && !this.peerConnection.currentRemoteDescription) {
          const offerDesc = new RTCSessionDescription(JSON.parse(signal.data));
          await this.peerConnection.setRemoteDescription(offerDesc);

          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);

          await addDoc(collection(db, 'calls', call.id, 'signals'), {
            callId: call.id,
            senderId: currentUser.id,
            type: 'answer',
            data: JSON.stringify(answer),
            createdAt: new Date().toISOString(),
          });
        }
      });

      this.listenToCallStatus(call.id);
    } catch (err: any) {
      this.cleanup();
      const msg = err.name === 'NotAllowedError'
        ? 'تم رفض إذن الوصول إلى الكاميرا أو الميكروفون'
        : 'تعذر قبول المكالمة';
      if (this.onError) this.onError(msg);
      throw err;
    }
  }

  async rejectCall(callId: string): Promise<void> {
    ringtone.stop();
    ringtone.playEndBeep();
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'rejected',
        endedAt: new Date().toISOString(),
      });
    } catch (e) {}
    this.cleanup();
  }

  async endCall(): Promise<void> {
    ringtone.stop();
    ringtone.playEndBeep();
    if (this.activeCallId) {
      try {
        await updateDoc(doc(db, 'calls', this.activeCallId), {
          status: 'ended',
          endedAt: new Date().toISOString(),
        });
      } catch (e) {}
    }
    this.cleanup();
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => (t.enabled = enabled));
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((t) => (t.enabled = enabled));
    }
  }

  async switchCamera(): Promise<void> {
    if (!this.localStream) return;
    const currentVideoTrack = this.localStream.getVideoTracks()[0];
    if (!currentVideoTrack) return;

    try {
      const currentFacing = currentVideoTrack.getSettings().facingMode;
      const targetFacing = currentFacing === 'environment' ? 'user' : 'environment';

      currentVideoTrack.stop();
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: targetFacing },
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (this.peerConnection) {
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      this.localStream.removeTrack(currentVideoTrack);
      this.localStream.addTrack(newVideoTrack);
      if (this.onLocalStream) this.onLocalStream(this.localStream);
    } catch (e) {
      console.warn('Switch camera not supported or failed', e);
    }
  }

  private initPeerConnection() {
    this.peerConnection = new RTCPeerConnection(RTC_CONFIG);
    this.remoteStream = new MediaStream();

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        if (this.remoteStream) {
          this.remoteStream.addTrack(track);
        }
      });
      if (this.onRemoteStream && this.remoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // ICE Candidate event
    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate && this.activeCallId) {
        try {
          await addDoc(collection(db, 'calls', this.activeCallId, 'signals'), {
            callId: this.activeCallId,
            senderId: 'current',
            type: 'candidate',
            data: JSON.stringify(event.candidate.toJSON()),
            createdAt: new Date().toISOString(),
          });
        } catch (e) {}
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === 'disconnected' ||
          this.peerConnection?.connectionState === 'failed' ||
          this.peerConnection?.connectionState === 'closed') {
        if (this.onCallStateChange) this.onCallStateChange('ended');
      }
    };
  }

  private listenToSignals(
    callId: string,
    currentUserId: string,
    onOfferCallback?: (signal: CallSignal) => void
  ) {
    try {
      const q = query(collection(db, 'calls', callId, 'signals'));
      this.unsubscribeSignals = onSnapshot(
        q,
        async (snapshot) => {
          for (const change of snapshot.docChanges()) {
            if (change.type === 'added') {
              const signal = change.doc.data() as CallSignal;
              if (signal.senderId === currentUserId) continue;

              if (signal.type === 'offer' && onOfferCallback) {
                onOfferCallback(signal);
              } else if (signal.type === 'answer' && this.peerConnection && !this.peerConnection.currentRemoteDescription) {
                ringtone.stop();
                const answerDesc = new RTCSessionDescription(JSON.parse(signal.data));
                await this.peerConnection.setRemoteDescription(answerDesc);
              } else if (signal.type === 'candidate' && this.peerConnection && this.peerConnection.remoteDescription) {
                try {
                  const candidate = new RTCIceCandidate(JSON.parse(signal.data));
                  await this.peerConnection.addIceCandidate(candidate);
                } catch (err) {
                  console.warn('Error adding ICE candidate', err);
                }
              }
            }
          }
        },
        (err) => {
          console.warn('[WebRTC] Signals subscription notice:', err?.message);
        }
      );
    } catch (e) {
      console.warn('[WebRTC] Error setting up signals listener:', e);
    }
  }

  private listenToCallStatus(callId: string) {
    try {
      this.unsubscribeCall = onSnapshot(
        doc(db, 'calls', callId),
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as CallSession;
            if (data.status === 'ongoing') {
              ringtone.stop();
            }
            if (data.status === 'ended' || data.status === 'rejected' || data.status === 'busy') {
              ringtone.stop();
              ringtone.playEndBeep();
              if (this.onCallStateChange) this.onCallStateChange(data.status);
              this.cleanup();
            }
          }
        },
        (err) => {
          console.warn('[WebRTC] Call status subscription notice:', err?.message);
        }
      );
    } catch (e) {
      console.warn('[WebRTC] Error setting up call status listener:', e);
    }
  }

  cleanup() {
    ringtone.stop();
    if (this.unsubscribeSignals) {
      this.unsubscribeSignals();
      this.unsubscribeSignals = null;
    }
    if (this.unsubscribeCall) {
      this.unsubscribeCall();
      this.unsubscribeCall = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.activeCallId = null;
  }
}

export const webrtcManager = new WebRTCManager();
