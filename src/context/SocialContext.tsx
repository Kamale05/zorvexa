import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
  Post,
  Comment,
  Story,
  NotificationItem,
  Conversation,
  Message,
  HashtagItem,
  Language,
  ThemeMode,
  ActiveTab,
  MediaItem,
  MarketplaceProduct,
  MarketplaceReport,
  PromotionRequest,
  PromotionStatus,
  AdminRole,
  AdminLog,
  CallSession,
  CallType,
  CallStatus,
} from '../types';
import {
  INITIAL_USERS,
  CURRENT_USER_DEFAULT,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_STORIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_HASHTAGS,
  INITIAL_MARKETPLACE_PRODUCTS,
  INITIAL_PROMOTIONS,
  INITIAL_ADMIN_LOGS,
} from '../data/mockData';
import { translations } from '../i18n/translations';
import {
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  subscribeToAuth,
  saveUserToDb,
  savePostToDb,
  updatePostInDb,
  deletePostFromDb,
  subscribeToPosts,
  saveCommentToDb,
  deleteCommentFromDb,
  recordLike,
  recordFollow,
  recordSavePost,
  recordRepost,
  saveNotificationToDb,
  saveConversationToDb,
  saveMessageToDb,
  saveMarketplaceProductToDb,
  deleteMarketplaceProductFromDb,
  updateMarketplaceProductStatus,
  saveMarketplaceReport,
  subscribeToMarketplaceProducts,
  savePromotionRequestToDb,
  updatePromotionStatus,
  incrementPromotionMetric,
  subscribeToPromotions,
  checkUserAdminRole,
  setAdminRole,
  removeAdminRole,
  recordAdminLog,
  subscribeToAdminLogs,
  OWNER_EMAIL,
} from '../services/firebaseService';
import { webrtcManager, ringtone } from '../services/webrtcService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface SocialContextType {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  comments: Comment[];
  stories: Story[];
  notifications: NotificationItem[];
  conversations: Conversation[];
  messages: Message[];
  hashtags: HashtagItem[];
  activeTab: ActiveTab;
  language: Language;
  theme: ThemeMode;
  searchQuery: string;
  selectedPost: Post | null;
  selectedUserProfile: User | null;
  activeConversationId: string | null;
  isCreatePostModalOpen: boolean;
  isAuthModalOpen: boolean;
  isLogoutConfirmOpen: boolean;
  authModalView: 'login' | 'register' | 'forgot_password';
  blockedUsers: string[];
  toasts: ToastMessage[];

  // Marketplace
  marketplaceProducts: MarketplaceProduct[];
  selectedProduct: MarketplaceProduct | null;
  isAddProductModalOpen: boolean;
  setSelectedProduct: (p: MarketplaceProduct | null) => void;
  setIsAddProductModalOpen: (open: boolean) => void;
  saveProduct: (productData: Omit<MarketplaceProduct, 'id' | 'createdAt' | 'views' | 'savesCount'>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductStatus: (productId: string, status: 'active' | 'sold') => Promise<void>;
  toggleSaveProduct: (productId: string) => void;
  reportProduct: (productId: string, reason: string) => Promise<void>;

  // Promotions & Ads
  promotions: PromotionRequest[];
  isCreatePromotionOpen: boolean;
  postToPromote: Post | null;
  isMyPromotionsOpen: boolean;
  setIsCreatePromotionOpen: (open: boolean) => void;
  setPostToPromote: (post: Post | null) => void;
  setIsMyPromotionsOpen: (open: boolean) => void;
  createPromotion: (data: Omit<PromotionRequest, 'id' | 'status' | 'impressions' | 'clicks' | 'engagement' | 'createdAt'>) => Promise<void>;
  updatePromotionStatusAction: (promoId: string, status: PromotionStatus, reason?: string) => Promise<void>;
  recordAdClick: (promoId: string) => void;

  // Admin & RBAC
  adminRole: AdminRole | null;
  adminLogs: AdminLog[];
  isAdmin: boolean;
  isOwner: boolean;
  assignStaffRole: (targetUid: string, email: string, role: 'admin' | 'moderator') => Promise<void>;
  removeStaffRole: (targetUid: string) => Promise<void>;
  moderateDeletePost: (postId: string, reason: string) => Promise<void>;
  moderateDeleteProduct: (productId: string, reason: string) => Promise<void>;
  toggleUserBan: (targetUserId: string, reason: string) => Promise<void>;
  recordAdminAction: (action: string, targetType: any, targetId: string, details: string) => Promise<void>;

  // WebRTC Audio & Video Calls
  activeCall: CallSession | null;
  incomingCall: CallSession | null;
  isCallActive: boolean;
  callType: CallType;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMicMuted: boolean;
  isVideoDisabled: boolean;
  startAudioCall: (targetUser: User) => Promise<void>;
  startVideoCall: (targetUser: User) => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  rejectIncomingCall: () => Promise<void>;
  endActiveCall: () => Promise<void>;
  toggleCallAudio: () => void;
  toggleCallVideo: () => void;
  switchCallCamera: () => Promise<void>;

  // Setters & Navigation
  setActiveTab: (tab: ActiveTab) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPost: (post: Post | null) => void;
  setSelectedUserProfile: (user: User | null) => void;
  setActiveConversationId: (id: string | null) => void;
  setIsCreatePostModalOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsLogoutConfirmOpen: (open: boolean) => void;
  setAuthModalView: (view: 'login' | 'register' | 'forgot_password') => void;
  requestLogout: () => void;

  // Actions
  login: (emailOrUsername: string, password?: string) => boolean;
  register: (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    birthDate?: string;
    interests: string[];
    avatarUrl?: string;
  }) => boolean;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  updateCurrentUser: (data: Partial<User>) => void;
  
  createPost: (data: {
    content: string;
    media?: MediaItem[];
    location?: string;
    hashtags?: string[];
    privacy: 'public' | 'followers' | 'private';
  }) => void;
  updatePost: (
    postId: string,
    data: {
      content: string;
      media?: MediaItem[];
      location?: string;
      hashtags?: string[];
      privacy: 'public' | 'followers' | 'private';
    }
  ) => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleRepost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  toggleLikeComment: (commentId: string) => void;
  
  toggleFollowUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;

  sendMessage: (conversationId: string, text: string, mediaUrl?: string) => void;
  startOrOpenConversationWith: (user: User) => string;
  markNotificationsAsRead: () => void;
  addStory: (mediaUrl: string, caption?: string) => void;
  
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  t: (key: keyof typeof translations['ar'], params?: Record<string, string | number>) => string;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme & Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('zorvexa_lang') as Language) || 'ar';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('zorvexa_theme') as ThemeMode) || 'dark';
  });

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zorvexa_current_user');
    return saved ? JSON.parse(saved) : CURRENT_USER_DEFAULT;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('zorvexa_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Content State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('zorvexa_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('zorvexa_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('zorvexa_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('zorvexa_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('zorvexa_convs');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('zorvexa_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [hashtags] = useState<HashtagItem[]>(INITIAL_HASHTAGS);

  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('zorvexa_blocked');
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [activeTab, setActiveTabState] = useState<ActiveTab>('feed');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ==================== MARKETPLACE STATE ====================
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>(() => {
    const saved = localStorage.getItem('zorvexa_marketplace');
    return saved ? JSON.parse(saved) : INITIAL_MARKETPLACE_PRODUCTS;
  });
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);

  // ==================== PROMOTIONS STATE ====================
  const [promotions, setPromotions] = useState<PromotionRequest[]>(() => {
    const saved = localStorage.getItem('zorvexa_promotions');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });
  const [isCreatePromotionOpen, setIsCreatePromotionOpen] = useState<boolean>(false);
  const [postToPromote, setPostToPromote] = useState<Post | null>(null);
  const [isMyPromotionsOpen, setIsMyPromotionsOpen] = useState<boolean>(false);

  // ==================== ADMIN & RBAC STATE ====================
  // Strictly null by default until authenticated and verified server-side
  const [adminRole, setAdminRoleState] = useState<AdminRole | null>(null);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(() => {
    const saved = localStorage.getItem('zorvexa_admin_logs');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_LOGS;
  });

  const isAdmin = !!adminRole && (adminRole.role === 'owner' || adminRole.role === 'admin' || adminRole.role === 'moderator');
  const isOwner = !!adminRole && adminRole.role === 'owner';

  // ==================== WEBRTC CALLS STATE ====================
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callType, setCallType] = useState<CallType>('audio');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('zorvexa_marketplace', JSON.stringify(marketplaceProducts));
  }, [marketplaceProducts]);

  useEffect(() => {
    localStorage.setItem('zorvexa_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('zorvexa_admin_logs', JSON.stringify(adminLogs));
  }, [adminLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('zorvexa_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('zorvexa_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('zorvexa_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('zorvexa_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('zorvexa_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('zorvexa_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('zorvexa_convs', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('zorvexa_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('zorvexa_blocked', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  // WebRTC Callback Handlers
  useEffect(() => {
    webrtcManager.onLocalStream = (stream) => {
      setLocalStream(stream);
    };
    webrtcManager.onRemoteStream = (stream) => {
      setRemoteStream(stream);
    };
    webrtcManager.onCallStateChange = (status) => {
      if (status === 'ended' || status === 'rejected' || status === 'busy') {
        setIsCallActive(false);
        setActiveCall(null);
        setLocalStream(null);
        setRemoteStream(null);
        showToast(status === 'busy' ? t('callBusy') : t('callEnded'), 'info');
      }
    };
    webrtcManager.onError = (err) => {
      showToast(err, 'error');
      setIsCallActive(false);
      setActiveCall(null);
    };
  }, []);

  // Listen for incoming calls for currentUser
  useEffect(() => {
    if (!currentUser) {
      setAdminRoleState(null);
      return;
    }

    // Check user admin role strictly from server token claims / verification
    checkUserAdminRole(currentUser.id, currentUser.email || '').then((role) => {
      setAdminRoleState(role);
    });
  }, [currentUser]);

  // Query for calls directed to current user
  useEffect(() => {
    // Only query Firestore calls if the user is authenticated in Firebase Auth
    // and is not a guest or fallback user
    if (
      !currentUser ||
      !auth.currentUser ||
      currentUser.id === 'current_user' ||
      currentUser.id !== auth.currentUser.uid
    ) {
      return;
    }

    try {
      const qCalls = query(
        collection(db, 'calls'),
        where('receiverId', '==', currentUser.id),
        where('status', '==', 'calling')
      );

      const unsubscribeIncomingCalls = onSnapshot(
        qCalls,
        (snapshot) => {
          if (!snapshot.empty) {
            const callDoc = snapshot.docs[0];
            const call = callDoc.data() as CallSession;
            if (!isCallActive && (!incomingCall || incomingCall.id !== call.id)) {
              setIncomingCall(call);
              setCallType(call.type);
              ringtone.startRinging();
            }
          } else {
            if (incomingCall) {
              setIncomingCall(null);
              ringtone.stop();
            }
          }
        },
        (err) => {
          console.warn('[Firebase Calls] Listener notice:', err?.message);
        }
      );

      return () => {
        unsubscribeIncomingCalls();
      };
    } catch (e) {
      console.warn('[Firebase Calls] Error setting up listener:', e);
    }
  }, [currentUser, isCallActive]);

  // Subscribe to Firebase Live Streams (Posts, Marketplace, Promotions)
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((fbUser) => {
      if (fbUser) {
        setCurrentUser(fbUser);
      }
    });

    const unsubscribePosts = subscribeToPosts((livePosts) => {
      if (livePosts && livePosts.length > 0) {
        setPosts(livePosts);
      }
    });

    const unsubscribeProducts = subscribeToMarketplaceProducts((liveProducts) => {
      if (liveProducts && liveProducts.length > 0) {
        setMarketplaceProducts(liveProducts);
      }
    });

    const unsubscribePromos = subscribeToPromotions((livePromos) => {
      if (livePromos && livePromos.length > 0) {
        setPromotions(livePromos);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
      unsubscribeProducts();
      unsubscribePromos();
    };
  }, []);

  // Subscribe to Admin Logs ONLY when verified admin/owner is logged in
  useEffect(() => {
    if (!isAdmin || !auth.currentUser) {
      return;
    }

    const unsubscribeLogs = subscribeToAdminLogs((liveLogs) => {
      if (liveLogs && liveLogs.length > 0) {
        setAdminLogs(liveLogs);
      }
    });

    return () => {
      unsubscribeLogs();
    };
  }, [isAdmin]);

  // Apply Theme and RTL
  useEffect(() => {
    localStorage.setItem('zorvexa_theme', theme);
    const root = document.documentElement;
    const body = document.body;

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        body.classList.remove('dark');
      }

      // Sync mobile and browser system header color
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', isDark ? '#09090b' : '#fafafa');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('zorvexa_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setActiveTab = (tab: ActiveTab) => {
    if (tab === 'admin') {
      if (!isAdmin) {
        showToast('غير مصرح بالدخول إلى لوحة المدير', 'error');
        return;
      }
    }
    setActiveTabState(tab);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTheme = (thm: ThemeMode) => {
    setThemeState(thm);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Translation helper
  const t = (key: keyof typeof translations['ar'], params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.ar;
    let text = dict[key] || translations.ar[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      });
    }
    return text;
  };

  // Auth Operations
  const login = async (emailOrUsername: string, password?: string) => {
    if (password && emailOrUsername.includes('@')) {
      try {
        const u = await loginWithEmail(emailOrUsername, password);
        if (u) {
          setCurrentUser(u);
          setIsAuthModalOpen(false);
          showToast(t('loginSuccess'));
          return true;
        }
      } catch (err: any) {
        console.warn('Firebase login attempt failed:', err);
      }
    }

    const found = users.find(
      (u) => u.email.toLowerCase() === emailOrUsername.toLowerCase() || u.username.toLowerCase() === emailOrUsername.toLowerCase()
    );
    if (found) {
      setCurrentUser(found);
      setIsAuthModalOpen(false);
      showToast(t('loginSuccess'));
      return true;
    } else {
      const demoUser: User = {
        ...CURRENT_USER_DEFAULT,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@zorvexa.app`,
        username: emailOrUsername.split('@')[0],
      };
      setCurrentUser(demoUser);
      saveUserToDb(demoUser).catch(() => {});
      setIsAuthModalOpen(false);
      showToast(t('loginSuccess'));
      return true;
    }
  };

  const register = async (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    birthDate?: string;
    interests: string[];
    avatarUrl?: string;
  }) => {
    if (userData.password) {
      try {
        const newUser = await registerWithEmail(
          userData.name,
          userData.username,
          userData.email,
          userData.password,
          userData.avatarUrl || '',
          userData.interests
        );
        setCurrentUser(newUser);
        setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
        setIsAuthModalOpen(false);
        showToast(t('createAccount') + ' - ' + t('loginSuccess'));
        return true;
      } catch (err: any) {
        console.warn('Firebase register error:', err);
      }
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name,
      username: userData.username.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
      email: userData.email,
      avatarUrl:
        userData.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: 'عضو جديد ومميز في مجتمع Zorvexa ✨ مهتم بالتقنية والتواصل العصري.',
      joinedDate: new Date().toISOString().split('T')[0],
      followersCount: 0,
      followingCount: 0,
      interests: userData.interests,
      isVerified: false,
      isOnline: true,
      birthDate: userData.birthDate,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    saveUserToDb(newUser).catch(() => {});
    setIsAuthModalOpen(false);
    showToast(t('createAccount') + ' - ' + t('loginSuccess'));
    return true;
  };

  const requestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Firebase logout notice:', err);
    }
    // Clear user and session state
    setCurrentUser(null);
    setAdminRoleState(null);
    localStorage.removeItem('zorvexa_current_user');
    setIsLogoutConfirmOpen(false);
    setActiveTab('feed');
    setSelectedUserProfile(null);
    setActiveConversationId(null);
    setAuthModalView('login');
    setIsAuthModalOpen(true);
    showToast(t('logoutSuccess'), 'info');
  };


  const switchDemoUser = (userId: string) => {
    if (userId === CURRENT_USER_DEFAULT.id) {
      setCurrentUser(CURRENT_USER_DEFAULT);
      showToast(`تم التبديل إلى ${CURRENT_USER_DEFAULT.name}`);
      return;
    }
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showToast(`تم التبديل إلى ${found.name}`);
    }
  };

  const updateCurrentUser = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    saveUserToDb(updated).catch(() => {});
    showToast(t('profileUpdated'));
  };

  // Post Actions
  const createPost = (data: {
    content: string;
    media?: MediaItem[];
    location?: string;
    hashtags?: string[];
    privacy: 'public' | 'followers' | 'private';
  }) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    // Extract hashtags from content if not explicitly supplied
    const matchedTags = data.content.match(/#[\p{L}\w_]+/gu) || [];
    const extractedTags = matchedTags.map((tag) => tag.replace('#', ''));
    const combinedTags = Array.from(new Set([...(data.hashtags || []), ...extractedTags]));

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      content: data.content,
      media: data.media && data.media.length > 0 ? data.media : undefined,
      location: data.location,
      hashtags: combinedTags,
      privacy: data.privacy,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      viewsCount: 1,
      isLiked: false,
      isSaved: false,
      isReposted: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    savePostToDb(newPost).catch(() => {});
    setIsCreatePostModalOpen(false);
    showToast(t('postCreatedSuccess'));
  };

  const updatePost = (
    postId: string,
    data: {
      content: string;
      media?: MediaItem[];
      location?: string;
      hashtags?: string[];
      privacy: 'public' | 'followers' | 'private';
    }
  ) => {
    if (!currentUser) return;

    // Extract hashtags from content if not explicitly provided
    const matchedTags = data.content.match(/#[\p{L}\w_]+/gu) || [];
    const extractedTags = matchedTags.map((tag) => tag.replace('#', ''));
    const combinedTags = Array.from(new Set([...(data.hashtags || []), ...extractedTags]));

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.authorId === currentUser.id) {
          const updated = {
            ...p,
            content: data.content,
            media: data.media,
            location: data.location,
            hashtags: combinedTags,
            privacy: data.privacy,
            isEdited: true,
            updatedAt: new Date().toISOString(),
          };
          updatePostInDb(postId, updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );

    if (selectedPost?.id === postId && selectedPost.authorId === currentUser.id) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              content: data.content,
              media: data.media,
              location: data.location,
              hashtags: combinedTags,
              privacy: data.privacy,
              isEdited: true,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
    }

    showToast(t('postUpdatedSuccess'));
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setComments((prev) => prev.filter((c) => c.postId !== postId));
    deletePostFromDb(postId).catch(() => {});
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
    }
    showToast(t('postDeletedSuccess'), 'info');
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          const newLikesCount = isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1);

          recordLike(currentUser.id, postId, isLiked).catch(() => {});
          updatePostInDb(postId, { likesCount: newLikesCount }).catch(() => {});

          // Add notification if not self-like
          if (isLiked && post.authorId !== currentUser.id) {
            const newNotif: NotificationItem = {
              id: `notif_${Date.now()}`,
              recipientId: post.authorId,
              sender: currentUser,
              type: 'like',
              postId: post.id,
              postContentPreview: post.content.substring(0, 45) + '...',
              isRead: false,
              createdAt: 'الآن',
            };
            setNotifications((n) => [newNotif, ...n]);
            saveNotificationToDb(newNotif).catch(() => {});
          }

          return { ...post, isLiked, likesCount: newLikesCount };
        }
        return post;
      })
    );

    if (selectedPost?.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likesCount: !prev.isLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1),
            }
          : null
      );
    }
  };

  const toggleSavePost = (postId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isSaved = !post.isSaved;
          recordSavePost(currentUser.id, postId, isSaved).catch(() => {});
          showToast(isSaved ? t('saved') : t('save'), 'info');
          return { ...post, isSaved };
        }
        return post;
      })
    );

    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null));
    }
  };

  const toggleRepost = (postId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isReposted = !post.isReposted;
          const newCount = isReposted ? post.repostsCount + 1 : Math.max(0, post.repostsCount - 1);

          recordRepost(currentUser.id, postId, isReposted).catch(() => {});
          updatePostInDb(postId, { repostsCount: newCount }).catch(() => {});

          if (isReposted && post.authorId !== currentUser.id) {
            const newNotif: NotificationItem = {
              id: `notif_${Date.now()}`,
              recipientId: post.authorId,
              sender: currentUser,
              type: 'repost',
              postId: post.id,
              postContentPreview: post.content.substring(0, 45) + '...',
              isRead: false,
              createdAt: 'الآن',
            };
            setNotifications((n) => [newNotif, ...n]);
            saveNotificationToDb(newNotif).catch(() => {});
          }

          showToast(isReposted ? t('reposted') : t('repost'), 'info');
          return { ...post, isReposted, repostsCount: newCount };
        }
        return post;
      })
    );
  };

  const addComment = (postId: string, content: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!content.trim()) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      author: currentUser,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
    };

    setComments((prev) => [...prev, newComment]);
    saveCommentToDb(newComment).catch(() => {});

    // Update post commentsCount
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const count = p.commentsCount + 1;
          updatePostInDb(postId, { commentsCount: count }).catch(() => {});
          return { ...p, commentsCount: count };
        }
        return p;
      })
    );

    // Notify post author
    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost && targetPost.authorId !== currentUser.id) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        recipientId: targetPost.authorId,
        sender: currentUser,
        type: 'comment',
        postId,
        postContentPreview: content,
        isRead: false,
        createdAt: 'الآن',
      };
      setNotifications((n) => [notif, ...n]);
      saveNotificationToDb(notif).catch(() => {});
    }

    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null));
    }
  };

  const deleteComment = (commentId: string) => {
    const targetComment = comments.find((c) => c.id === commentId);
    if (!targetComment) return;

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    deleteCommentFromDb(commentId).catch(() => {});

    // Decrement commentsCount on corresponding post
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === targetComment.postId) {
          const count = Math.max(0, p.commentsCount - 1);
          updatePostInDb(p.id, { commentsCount: count }).catch(() => {});
          return { ...p, commentsCount: count };
        }
        return p;
      })
    );

    if (selectedPost?.id === targetComment.postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) } : null
      );
    }

    showToast(t('commentDeletedSuccess'), 'info');
  };

  const toggleLikeComment = (commentId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likesCount: isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
          };
        }
        return c;
      })
    );
  };

  // Follow / Unfollow
  const toggleFollowUser = (userId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const isFollowing = !u.isFollowing;
          const followersCount = isFollowing ? u.followersCount + 1 : Math.max(0, u.followersCount - 1);

          recordFollow(currentUser.id, userId, isFollowing).catch(() => {});

          if (isFollowing) {
            const notif: NotificationItem = {
              id: `notif_${Date.now()}`,
              recipientId: userId,
              sender: currentUser,
              type: 'follow',
              isRead: false,
              createdAt: 'الآن',
            };
            setNotifications((n) => [notif, ...n]);
            saveNotificationToDb(notif).catch(() => {});
            showToast(`${t('following')} ${u.name}`);
          } else {
            showToast(`${t('unfollow')} ${u.name}`, 'info');
          }

          return { ...u, isFollowing, followersCount };
        }
        return u;
      })
    );

    if (selectedUserProfile?.id === userId) {
      setSelectedUserProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: !prev.isFollowing,
              followersCount: !prev.isFollowing ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1),
            }
          : null
      );
    }

    // Update currentUser followingCount
    setCurrentUser((prev) => {
      if (!prev) return null;
      const isNowFollowing = !users.find((u) => u.id === userId)?.isFollowing;
      const updated = {
        ...prev,
        followingCount: isNowFollowing ? prev.followingCount + 1 : Math.max(0, prev.followingCount - 1),
      };
      saveUserToDb(updated).catch(() => {});
      return updated;
    });
  };

  // Block / Unblock
  const blockUser = (userId: string) => {
    if (!blockedUsers.includes(userId)) {
      setBlockedUsers((prev) => [...prev, userId]);
      showToast(t('userBlocked'), 'info');
    }
  };

  const unblockUser = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((id) => id !== userId));
    showToast(t('userUnblocked'), 'success');
  };

  // Messaging
  const sendMessage = (conversationId: string, text: string, mediaUrl?: string) => {
    if (!currentUser || (!text.trim() && !mediaUrl)) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      text,
      mediaUrl,
      mediaType: mediaUrl ? 'image' : undefined,
      createdAt: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const updatedConv = {
            ...conv,
            lastMessage: newMsg,
            updatedAt: new Date().toISOString(),
          };
          saveConversationToDb(updatedConv).catch(() => {});
          return updatedConv;
        }
        return conv;
      })
    );

    setMessages((prev) => [...prev, newMsg]);
    saveMessageToDb(newMsg).catch(() => {});

    // Realistic auto-reply simulation from friend after 1.8 seconds!
    const targetConv = conversations.find((c) => c.id === conversationId);
    const otherParticipant = targetConv?.participants.find((p) => p.id !== currentUser.id);

    if (otherParticipant) {
      // Set typing indicator
      setTimeout(() => {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, isTyping: true } : c))
        );
      }, 700);

      setTimeout(() => {
        const repliesAr = [
          'رائع جداً! يسعدني دائماً التواصل معك على Zorvexa ✨',
          'شكراً لمشاركتك معي، سأطلع على هذا الأمر بالتفصيل 🚀',
          'مرحباً! فكرة ممتازة، أتفق معك تماماً 👏',
          'تم الاستلام، منصة Zorvexa سريعة وسلسة حقاً!',
        ];
        const repliesEn = [
          'Awesome! Always a pleasure chatting with you on Zorvexa ✨',
          'Thanks for sharing, I will definitely check it out in detail 🚀',
          'Hey! That is an incredible thought, fully agree 👏',
          'Received! Zorvexa is remarkably smooth and fast!',
        ];
        const chosenReply =
          language === 'ar'
            ? repliesAr[Math.floor(Math.random() * repliesAr.length)]
            : repliesEn[Math.floor(Math.random() * repliesEn.length)];

        const autoMsg: Message = {
          id: `msg_reply_${Date.now()}`,
          conversationId,
          senderId: otherParticipant.id,
          text: chosenReply,
          createdAt: new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isRead: false,
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                isTyping: false,
                lastMessage: autoMsg,
                unreadCount: conv.unreadCount + 1,
                updatedAt: new Date().toISOString(),
              };
            }
            return conv;
          })
        );

        setMessages((prev) => [...prev, autoMsg]);
      }, 2300);
    }
  };

  const startOrOpenConversationWith = (targetUser: User): string => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return '';
    }

    const existing = conversations.find((c) =>
      c.participants.some((p) => p.id === targetUser.id)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('messages');
      return existing.id;
    }

    const newConvId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participants: [targetUser],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      lastMessage: {
        id: `msg_${Date.now()}`,
        conversationId: newConvId,
        senderId: currentUser.id,
        text: language === 'ar' ? 'مرحباً! سررت بالتواصل معك على Zorvexa 👋' : 'Hello! Glad to connect on Zorvexa 👋',
        createdAt: 'الآن',
        isRead: true,
      },
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    setActiveTab('messages');
    return newConvId;
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast(t('markAllAsRead'), 'info');
  };

  const addStory = (mediaUrl: string, caption?: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const newStory: Story = {
      id: `story_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      mediaUrl,
      type: 'image',
      caption,
      createdAt: 'الآن',
      isViewed: false,
    };
    setStories((prev) => [newStory, ...prev]);
    showToast(t('addStory') + ' ✨');
  };

  // ==================== MARKETPLACE ACTIONS ====================
  const saveProduct = async (productData: Omit<MarketplaceProduct, 'id' | 'createdAt' | 'views' | 'savesCount'>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const newProduct: MarketplaceProduct = {
      ...productData,
      id: `prod_${Date.now()}`,
      views: 1,
      savesCount: 0,
      createdAt: new Date().toISOString(),
    };
    setMarketplaceProducts((prev) => [newProduct, ...prev]);
    await saveMarketplaceProductToDb(newProduct);
    showToast(language === 'ar' ? 'تم نشر إعلانك في المتجر بنجاح!' : 'Product listed successfully!', 'success');
  };

  const deleteProduct = async (productId: string) => {
    setMarketplaceProducts((prev) => prev.filter((p) => p.id !== productId));
    await deleteMarketplaceProductFromDb(productId);
    showToast(t('deleteListing') + ' ✓', 'info');
  };

  const toggleProductStatus = async (productId: string, status: 'active' | 'sold') => {
    setMarketplaceProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status } : p))
    );
    await updateMarketplaceProductStatus(productId, status);
    showToast(status === 'sold' ? t('markAsSold') : t('markAsAvailable'), 'success');
  };

  const toggleSaveProduct = (productId: string) => {
    setMarketplaceProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const isSaved = !p.isSaved;
          return {
            ...p,
            isSaved,
            savesCount: isSaved ? p.savesCount + 1 : Math.max(0, p.savesCount - 1),
          };
        }
        return p;
      })
    );
    showToast(t('savedProduct'), 'success');
  };

  const reportProduct = async (productId: string, reason: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const targetProduct = marketplaceProducts.find((p) => p.id === productId);
    const report: MarketplaceReport = {
      id: `report_${Date.now()}`,
      productId,
      productTitle: targetProduct?.title,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await saveMarketplaceReport(report);
    showToast(t('productReported'), 'info');
  };

  // ==================== PROMOTIONS ACTIONS ====================
  const createPromotion = async (
    data: Omit<PromotionRequest, 'id' | 'status' | 'impressions' | 'clicks' | 'engagement' | 'createdAt'>
  ) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const newPromo: PromotionRequest = {
      ...data,
      id: `promo_${Date.now()}`,
      status: 'pending', // Starts pending admin review
      impressions: 0,
      clicks: 0,
      engagement: 0,
      createdAt: new Date().toISOString(),
    };
    setPromotions((prev) => [newPromo, ...prev]);
    await savePromotionRequestToDb(newPromo);
    showToast(t('promotionSubmitted'), 'success');
  };

  const updatePromotionStatusAction = async (
    promoId: string,
    status: PromotionStatus,
    reason?: string
  ) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, status, rejectionReason: reason } : p))
    );
    await updatePromotionStatus(promoId, status, reason, currentUser?.id);
    if (adminRole) {
      recordAdminAction(
        status === 'approved' || status === 'active' ? 'الموافقة على حملة الترويج' : 'رفض أو تعديل حملة ترويج',
        'promotion',
        promoId,
        `الحالة الجديدة: ${status}${reason ? ' | السبب: ' + reason : ''}`
      );
    }
    showToast(t('adminActionSuccess'), 'success');
  };

  const recordAdClick = (promoId: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, clicks: p.clicks + 1 } : p))
    );
    incrementPromotionMetric(promoId, 'clicks');
  };

  // ==================== ADMIN & RBAC ACTIONS ====================
  const recordAdminAction = async (
    action: string,
    targetType: any,
    targetId: string,
    details: string
  ) => {
    if (!currentUser) return;
    const log: AdminLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      adminId: currentUser.id,
      adminName: currentUser.name + (isOwner ? ' (Owner)' : ' (Admin)'),
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAdminLogs((prev) => [log, ...prev]);
    await recordAdminLog(log);
  };

  const assignStaffRole = async (targetUid: string, email: string, role: 'admin' | 'moderator') => {
    if (!isOwner) {
      showToast('صلاحية تعيين الأدوار مقتصرة فقط على مالك المنصة', 'error');
      return;
    }
    await setAdminRole(targetUid, email, role, currentUser?.id || 'owner');
    await recordAdminAction('تعيين رتبة إدارية لموظف', 'user', targetUid, `تعيين رتبة ${role} للمستخدم ${email}`);
    showToast(t('adminActionSuccess'), 'success');
  };

  const removeStaffRole = async (targetUid: string) => {
    if (!isOwner) {
      showToast('صلاحية تعديل الأدوار مقتصرة فقط على مالك المنصة', 'error');
      return;
    }
    await removeAdminRole(targetUid);
    await recordAdminAction('سحب الرتبة الإدارية من موظف', 'user', targetUid, 'تم إلغاء صلاحيات الإدارة');
    showToast(t('adminActionSuccess'), 'info');
  };

  const moderateDeletePost = async (postId: string, reason: string) => {
    deletePost(postId);
    await recordAdminAction('حذف منشور مخالف بواسطة المشرف', 'post', postId, `السبب: ${reason}`);
    showToast(t('deleteViolatingPost') + ' ✓', 'info');
  };

  const moderateDeleteProduct = async (productId: string, reason: string) => {
    await deleteProduct(productId);
    await recordAdminAction('حذف منتج متجر مخالف بواسطة المشرف', 'product', productId, `السبب: ${reason}`);
    showToast(t('deleteViolatingProduct') + ' ✓', 'info');
  };

  const toggleUserBan = async (targetUserId: string, reason: string) => {
    const isBanned = blockedUsers.includes(targetUserId);
    if (isBanned) {
      unblockUser(targetUserId);
      await recordAdminAction('إلغاء حظر حساب مستخدم', 'user', targetUserId, `إلغاء الحظر`);
      showToast(t('userUnblocked'), 'success');
    } else {
      blockUser(targetUserId);
      await recordAdminAction('حظر حساب مستخدم مخالف', 'user', targetUserId, `السبب: ${reason}`);
      showToast(t('userBlocked'), 'info');
    }
  };

  // ==================== WEBRTC CALL ACTIONS ====================
  const startAudioCall = async (targetUser: User) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      setCallType('audio');
      setIsCallActive(true);
      const sessionData: CallSession = {
        id: `call_${Date.now()}`,
        callerId: currentUser.id,
        callerName: currentUser.name,
        callerAvatar: currentUser.avatarUrl,
        receiverId: targetUser.id,
        receiverName: targetUser.name,
        receiverAvatar: targetUser.avatarUrl,
        type: 'audio',
        status: 'calling',
        createdAt: new Date().toISOString(),
      };
      setActiveCall(sessionData);
      await webrtcManager.startCall(currentUser, targetUser, 'audio');
    } catch (e: any) {
      setIsCallActive(false);
      setActiveCall(null);
    }
  };

  const startVideoCall = async (targetUser: User) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      setCallType('video');
      setIsCallActive(true);
      const sessionData: CallSession = {
        id: `call_${Date.now()}`,
        callerId: currentUser.id,
        callerName: currentUser.name,
        callerAvatar: currentUser.avatarUrl,
        receiverId: targetUser.id,
        receiverName: targetUser.name,
        receiverAvatar: targetUser.avatarUrl,
        type: 'video',
        status: 'calling',
        createdAt: new Date().toISOString(),
      };
      setActiveCall(sessionData);
      await webrtcManager.startCall(currentUser, targetUser, 'video');
    } catch (e: any) {
      setIsCallActive(false);
      setActiveCall(null);
    }
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall || !currentUser) return;
    try {
      const ongoingCall = { ...incomingCall, status: 'ongoing' as CallStatus };
      setActiveCall(ongoingCall);
      setIsCallActive(true);
      setCallType(incomingCall.type);
      setIncomingCall(null);
      await webrtcManager.answerCall(ongoingCall, currentUser);
    } catch (e) {
      setIsCallActive(false);
      setActiveCall(null);
    }
  };

  const rejectIncomingCall = async () => {
    if (!incomingCall) return;
    const callId = incomingCall.id;
    setIncomingCall(null);
    await webrtcManager.rejectCall(callId);
  };

  const endActiveCall = async () => {
    setIsCallActive(false);
    setActiveCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    await webrtcManager.endCall();
  };

  const toggleCallAudio = () => {
    const next = !isMicMuted;
    setIsMicMuted(next);
    webrtcManager.toggleAudio(!next);
  };

  const toggleCallVideo = () => {
    const next = !isVideoDisabled;
    setIsVideoDisabled(next);
    webrtcManager.toggleVideo(!next);
  };

  const switchCallCamera = async () => {
    await webrtcManager.switchCamera();
  };

  return (
    <SocialContext.Provider
      value={{
        currentUser,
        users: users.filter((u) => !blockedUsers.includes(u.id)),
        posts: posts.filter((p) => !blockedUsers.includes(p.authorId)),
        comments,
        stories,
        notifications,
        conversations,
        messages,
        hashtags,
        activeTab,
        language,
        theme,
        searchQuery,
        selectedPost,
        selectedUserProfile,
        activeConversationId,
        isCreatePostModalOpen,
        isAuthModalOpen,
        authModalView,
        blockedUsers,
        toasts,

        // Marketplace
        marketplaceProducts,
        selectedProduct,
        isAddProductModalOpen,
        setSelectedProduct,
        setIsAddProductModalOpen,
        saveProduct,
        deleteProduct,
        toggleProductStatus,
        toggleSaveProduct,
        reportProduct,

        // Promotions
        promotions,
        isCreatePromotionOpen,
        postToPromote,
        isMyPromotionsOpen,
        setIsCreatePromotionOpen,
        setPostToPromote,
        setIsMyPromotionsOpen,
        createPromotion,
        updatePromotionStatusAction,
        recordAdClick,

        // Admin
        adminRole,
        adminLogs,
        isAdmin,
        isOwner,
        assignStaffRole,
        removeStaffRole,
        moderateDeletePost,
        moderateDeleteProduct,
        toggleUserBan,
        recordAdminAction,

        // WebRTC Calls
        activeCall,
        incomingCall,
        isCallActive,
        callType,
        localStream,
        remoteStream,
        isMicMuted,
        isVideoDisabled,
        startAudioCall,
        startVideoCall,
        acceptIncomingCall,
        rejectIncomingCall,
        endActiveCall,
        toggleCallAudio,
        toggleCallVideo,
        switchCallCamera,

        setActiveTab,
        setLanguage,
        setTheme,
        setSearchQuery,
        setSelectedPost,
        setSelectedUserProfile,
        setActiveConversationId,
        setIsCreatePostModalOpen,
        setIsAuthModalOpen,
        isLogoutConfirmOpen,
        setIsLogoutConfirmOpen,
        setAuthModalView,
        requestLogout,

        login,
        register,
        logout,
        switchDemoUser,
        updateCurrentUser,
        createPost,
        updatePost,
        deletePost,
        toggleLikePost,
        toggleSavePost,
        toggleRepost,
        addComment,
        deleteComment,
        toggleLikeComment,
        toggleFollowUser,
        blockUser,
        unblockUser,
        sendMessage,
        startOrOpenConversationWith,
        markNotificationsAsRead,
        addStory,
        showToast,
        t,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
