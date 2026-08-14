import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Post, Comment, NotificationItem, Conversation, Message } from '../types';

// ==================== AUTH SERVICES ====================

export const registerWithEmail = async (
  name: string,
  username: string,
  email: string,
  pass: string,
  avatarUrl: string,
  interests: string[]
): Promise<User> => {
  const userCred = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = userCred.user;

  const newUser: User = {
    id: fbUser.uid,
    name,
    username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
    email,
    avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'عضو جديد في مجتمع Zorvexa ✨',
    joinedDate: 'اليوم',
    followersCount: 0,
    followingCount: 0,
    interests: interests.length > 0 ? interests : ['تقنية', 'تصميم'],
    isVerified: false,
    isOnline: true,
  };

  await setDoc(doc(db, 'users', fbUser.uid), {
    ...newUser,
    createdAt: serverTimestamp(),
  });

  return newUser;
};

export const loginWithEmail = async (email: string, pass: string): Promise<User | null> => {
  const userCred = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = userCred.user;

  const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
  if (userDoc.exists()) {
    return userDoc.data() as User;
  }

  // If user document does not exist yet, build one
  const fallbackUser: User = {
    id: fbUser.uid,
    name: fbUser.displayName || 'مستخدم Zorvexa',
    username: (fbUser.email?.split('@')[0] || 'user').toLowerCase(),
    email: fbUser.email || '',
    avatarUrl: fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    bio: 'مرحباً بكم في حسابي على Zorvexa',
    joinedDate: 'سابقاً',
    followersCount: 0,
    followingCount: 0,
    interests: ['عام'],
    isVerified: false,
    isOnline: true,
  };

  await setDoc(doc(db, 'users', fbUser.uid), fallbackUser);
  return fallbackUser;
};

export const logoutUser = async (): Promise<void> => {
  await fbSignOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        callback(userDoc.data() as User);
      } else {
        callback({
          id: fbUser.uid,
          name: fbUser.displayName || 'مستخدم Zorvexa',
          username: (fbUser.email?.split('@')[0] || 'user').toLowerCase(),
          email: fbUser.email || '',
          avatarUrl: fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          bio: 'عضو في Zorvexa',
          joinedDate: 'اليوم',
          followersCount: 0,
          followingCount: 0,
          interests: [],
        });
      }
    } catch {
      callback(null);
    }
  });
};

// ==================== FIRESTORE DATA SERVICES ====================

export const saveUserToDb = async (user: User): Promise<void> => {
  await setDoc(doc(db, 'users', user.id), user, { merge: true });
};

export const getAllUsersFromDb = async (): Promise<User[]> => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => d.data() as User);
  } catch (err) {
    console.warn('Could not load users from Firestore:', err);
    return [];
  }
};

// Posts
export const savePostToDb = async (post: Post): Promise<void> => {
  await setDoc(doc(db, 'posts', post.id), post);
};

export const updatePostInDb = async (postId: string, data: Partial<Post>): Promise<void> => {
  await updateDoc(doc(db, 'posts', postId), data);
};

export const deletePostFromDb = async (postId: string): Promise<void> => {
  await deleteDoc(doc(db, 'posts', postId));
};

export const subscribeToPosts = (callback: (posts: Post[]) => void) => {
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(postsQuery, (snapshot) => {
    const postsList: Post[] = snapshot.docs.map((docSnap) => docSnap.data() as Post);
    callback(postsList);
  }, (err) => {
    console.warn('Posts subscription error:', err);
  });
};

// Comments
export const saveCommentToDb = async (comment: Comment): Promise<void> => {
  await setDoc(doc(db, 'comments', comment.id), comment);
};

export const deleteCommentFromDb = async (commentId: string): Promise<void> => {
  await deleteDoc(doc(db, 'comments', commentId));
};

export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
  try {
    const q = query(collection(db, 'comments'), where('postId', '==', postId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Comment);
  } catch {
    return [];
  }
};

// Likes, Follows, Reposts, Bookmarks
export const recordLike = async (userId: string, postId: string, isLike: boolean): Promise<void> => {
  const likeRef = doc(db, 'likes', `${userId}_${postId}`);
  if (isLike) {
    await setDoc(likeRef, { userId, postId, createdAt: new Date().toISOString() });
  } else {
    await deleteDoc(likeRef);
  }
};

export const recordFollow = async (followerId: string, followingId: string, isFollow: boolean): Promise<void> => {
  const followRef = doc(db, 'follows', `${followerId}_${followingId}`);
  if (isFollow) {
    await setDoc(followRef, { followerId, followingId, createdAt: new Date().toISOString() });
  } else {
    await deleteDoc(followRef);
  }
};

export const recordSavePost = async (userId: string, postId: string, isSaved: boolean): Promise<void> => {
  const saveRef = doc(db, 'saved_posts', `${userId}_${postId}`);
  if (isSaved) {
    await setDoc(saveRef, { userId, postId, createdAt: new Date().toISOString() });
  } else {
    await deleteDoc(saveRef);
  }
};

export const recordRepost = async (userId: string, postId: string, isRepost: boolean): Promise<void> => {
  const repostRef = doc(db, 'reposts', `${userId}_${postId}`);
  if (isRepost) {
    await setDoc(repostRef, { userId, postId, createdAt: new Date().toISOString() });
  } else {
    await deleteDoc(repostRef);
  }
};

// Notifications
export const saveNotificationToDb = async (notif: NotificationItem): Promise<void> => {
  await setDoc(doc(db, 'notifications', notif.id), notif);
};

export const markNotificationsReadInDb = async (notifIds: string[]): Promise<void> => {
  for (const id of notifIds) {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  }
};

// Messages & Conversations
export const saveConversationToDb = async (conv: Conversation): Promise<void> => {
  await setDoc(doc(db, 'conversations', conv.id), conv, { merge: true });
};

export const saveMessageToDb = async (msg: Message): Promise<void> => {
  await setDoc(doc(db, 'messages', msg.id), msg);
};
