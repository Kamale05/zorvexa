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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import {
  User,
  Post,
  Comment,
  NotificationItem,
  Conversation,
  Message,
  MarketplaceProduct,
  MarketplaceReport,
  PromotionRequest,
  AdminRole,
  AdminLog,
  PlatformStats,
} from '../types';


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

// ==================== STORAGE SERVICES ====================

export const uploadImageToStorage = async (
  file: File,
  folder = 'posts',
  onProgress?: (progress: number) => void
): Promise<string> => {
  const currentUserId = auth.currentUser?.uid || 'guest';
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanFileName}`;
  const fileRef = ref(storage, `${folder}/${currentUserId}/${uniqueName}`);

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type || 'image/jpeg',
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) {
            onProgress(progress);
          }
        }
      },
      (error) => {
        console.warn('[Firebase Storage] Upload error, using high-fidelity local reader fallback:', error);
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(error);
          }
        };
        reader.onerror = () => reject(error);
        reader.readAsDataURL(file);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(err);
            }
          };
          reader.onerror = () => reject(err);
          reader.readAsDataURL(file);
        }
      }
    );
  });
};

// Alias export for marketplace and other modular consumers
export const uploadMediaFile = uploadImageToStorage;

// ==================== MARKETPLACE SERVICES ====================

export const saveMarketplaceProductToDb = async (product: MarketplaceProduct): Promise<void> => {
  try {
    await setDoc(doc(db, 'marketplaceProducts', product.id), {
      ...product,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('[Firebase] Error saving marketplace product:', error);
  }
};

export const deleteMarketplaceProductFromDb = async (productId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'marketplaceProducts', productId));
  } catch (error) {
    console.warn('[Firebase] Error deleting marketplace product:', error);
  }
};

export const updateMarketplaceProductStatus = async (
  productId: string,
  status: 'active' | 'sold' | 'pending' | 'rejected'
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'marketplaceProducts', productId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('[Firebase] Error updating product status:', error);
  }
};

export const saveMarketplaceReport = async (report: MarketplaceReport): Promise<void> => {
  try {
    await setDoc(doc(db, 'marketplaceReports', report.id), {
      ...report,
      createdAt: report.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    console.warn('[Firebase] Error submitting marketplace report:', error);
  }
};

export const subscribeToMarketplaceProducts = (
  callback: (products: MarketplaceProduct[]) => void
) => {
  const q = query(collection(db, 'marketplaceProducts'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const products: MarketplaceProduct[] = [];
      snapshot.forEach((docSnap) => {
        products.push(docSnap.data() as MarketplaceProduct);
      });
      callback(products);
    },
    (err) => {
      console.warn('[Firebase] Error fetching marketplace products:', err);
    }
  );
};

// ==================== PROMOTIONS & ADS SERVICES ====================

export const savePromotionRequestToDb = async (promo: PromotionRequest): Promise<void> => {
  try {
    await setDoc(doc(db, 'promotionRequests', promo.id), {
      ...promo,
      createdAt: promo.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    console.warn('[Firebase] Error saving promotion request:', error);
  }
};

export const updatePromotionStatus = async (
  promoId: string,
  status: PromotionRequest['status'],
  rejectionReason?: string,
  adminId?: string
): Promise<void> => {
  try {
    const updatePayload: any = {
      status,
      reviewedAt: new Date().toISOString(),
    };
    if (rejectionReason !== undefined) updatePayload.rejectionReason = rejectionReason;
    if (adminId) updatePayload.adminId = adminId;

    await updateDoc(doc(db, 'promotionRequests', promoId), updatePayload);
  } catch (error) {
    console.warn('[Firebase] Error updating promotion status:', error);
  }
};

export const incrementPromotionMetric = async (
  promoId: string,
  metric: 'impressions' | 'clicks' | 'engagement'
): Promise<void> => {
  try {
    const promoRef = doc(db, 'promotionRequests', promoId);
    const snap = await getDoc(promoRef);
    if (snap.exists()) {
      const currentVal = snap.data()[metric] || 0;
      await updateDoc(promoRef, { [metric]: currentVal + 1 });
    }
  } catch (e) {
    console.warn('[Firebase] Error incrementing promotion metric:', e);
  }
};

export const subscribeToPromotions = (
  callback: (promos: PromotionRequest[]) => void
) => {
  const q = query(collection(db, 'promotionRequests'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: PromotionRequest[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as PromotionRequest);
      });
      callback(items);
    },
    (err) => {
      console.warn('[Firebase] Error listening to promotions:', err);
    }
  );
};

// ==================== ADMIN & RBAC SERVICES ====================

// Super Admin authorized owner email (yasrepop@gmail.com)
export const OWNER_EMAILS = ['yasrepop@gmail.com'];
export const OWNER_EMAIL = OWNER_EMAILS[0];

export const checkUserAdminRole = async (
  uid: string,
  email: string
): Promise<AdminRole | null> => {
  const currentFbUser = auth.currentUser;
  if (!currentFbUser) return null;

  // Verify that the querying caller matches the authenticated UID
  if (currentFbUser.uid !== uid) {
    return null;
  }

  // Retrieve fresh ID token result to check custom claims issued by Firebase Admin SDK
  let customClaims: any = null;
  try {
    const tokenResult = await currentFbUser.getIdTokenResult(false);
    customClaims = tokenResult?.claims || {};
  } catch (err) {
    console.warn('[Firebase Auth] Error fetching idTokenResult:', err);
  }

  const isServerSuperAdmin = customClaims?.role === 'super_admin' || customClaims?.admin === true;
  const userEmail = (currentFbUser.email || email || '').toLowerCase();
  const isOwnerEmail = userEmail === OWNER_EMAIL.toLowerCase();

  // Strictly enforce trusted Custom Claims from Firebase Admin SDK and owner email verification.
  // Never grant Super Admin privileges solely on unverified client-side email matches.
  if (isServerSuperAdmin && isOwnerEmail) {
    return {
      uid: currentFbUser.uid,
      email: currentFbUser.email || email || OWNER_EMAIL,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const roleDoc = await getDoc(doc(db, 'adminRoles', uid));
    if (roleDoc.exists()) {
      return roleDoc.data() as AdminRole;
    }
  } catch (e) {
    console.warn('[Firebase] Error reading admin role:', e);
  }
  return null;
};

export const setAdminRole = async (
  targetUid: string,
  targetEmail: string,
  role: 'admin' | 'moderator',
  assignedByUid: string
): Promise<void> => {
  try {
    await setDoc(doc(db, 'adminRoles', targetUid), {
      uid: targetUid,
      email: targetEmail,
      role,
      assignedBy: assignedByUid,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('[Firebase] Error setting admin role:', e);
  }
};

export const removeAdminRole = async (targetUid: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'adminRoles', targetUid));
  } catch (e) {
    console.warn('[Firebase] Error removing admin role:', e);
  }
};

export const recordAdminLog = async (log: AdminLog): Promise<void> => {
  try {
    await setDoc(doc(db, 'adminLogs', log.id), log);
  } catch (e) {
    console.warn('[Firebase] Error recording admin log:', e);
  }
};

export const subscribeToAdminLogs = (callback: (logs: AdminLog[]) => void) => {
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: AdminLog[] = [];
        snapshot.forEach((docSnap) => items.push(docSnap.data() as AdminLog));
        callback(items);
      },
      (err) => {
        console.warn('[Firebase] Admin logs subscription notice:', err?.message);
      }
    );
  } catch (err) {
    console.warn('[Firebase] Could not subscribe to admin logs:', err);
    return () => {};
  }
};

