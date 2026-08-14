import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../services/firebaseService';

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
  authModalView: 'login' | 'register' | 'forgot_password';
  blockedUsers: string[];
  toasts: ToastMessage[];

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
  setAuthModalView: (view: 'login' | 'register' | 'forgot_password') => void;

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
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to LocalStorage
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

  // Subscribe to Firebase Auth state
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

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  // Apply Theme and RTL
  useEffect(() => {
    localStorage.setItem('zorvexa_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('zorvexa_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

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

  const logout = () => {
    logoutUser().catch(() => {});
    setCurrentUser(null);
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

        setActiveTab,
        setLanguage,
        setTheme,
        setSearchQuery,
        setSelectedPost,
        setSelectedUserProfile,
        setActiveConversationId,
        setIsCreatePostModalOpen,
        setIsAuthModalOpen,
        setAuthModalView,

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
