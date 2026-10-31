export type Language = 'ar' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  coverUrl?: string;
  bio: string;
  birthDate?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  postsCount?: number;
  interests: string[];
  isVerified?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  isPrivate?: boolean;
  isFollowing?: boolean;
}

export type MediaItem = {
  id: string;
  type: 'image' | 'video';
  url: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  caption?: string;
};

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  media?: MediaItem[];
  location?: string;
  hashtags: string[];
  privacy: 'public' | 'followers' | 'private';
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isReposted?: boolean;
  originalPost?: Post; // For reposts with comment
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'repost';

export interface NotificationItem {
  id: string;
  recipientId: string;
  sender: User;
  type: NotificationType;
  postId?: string;
  postContentPreview?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isTyping?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  type: 'image' | 'video';
  caption?: string;
  createdAt: string;
  isViewed?: boolean;
}

export interface HashtagItem {
  id: string;
  tag: string;
  postsCount: number;
  category: 'tech' | 'design' | 'general' | 'sports' | 'gaming' | 'ai';
}

export type ActiveTab =
  | 'feed'
  | 'explore'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'marketplace'
  | 'admin';

// ==================== ADMIN & RBAC ====================
export type AdminRoleType = 'owner' | 'admin' | 'moderator';

export interface AdminRole {
  uid: string;
  email: string;
  role: AdminRoleType;
  createdAt: string;
  assignedBy?: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'post' | 'comment' | 'promotion' | 'product' | 'settings';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  totalProducts: number;
  totalAds: number;
  totalPromotionRequests: number;
  totalReports: number;
  dailyNewUsers: number;
  weeklyPosts: number;
  monthlyRevenueEst: number;
}

// ==================== PROMOTIONS & ADS ====================
export type PromotionStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'paused' | 'completed';

export interface PromotionRequest {
  id: string;
  postId: string;
  postContent?: string;
  postMediaUrl?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  description: string;
  targetAudience: string;
  targetLocation: string;
  ageRange: string;
  startDate: string;
  durationDays: number;
  budget: number;
  objective: 'reach' | 'traffic' | 'engagement' | 'sales';
  status: PromotionStatus;
  rejectionReason?: string;
  adminId?: string;
  reviewedAt?: string;
  impressions: number;
  clicks: number;
  engagement: number;
  createdAt: string;
}

// ==================== MARKETPLACE ====================
export type ProductCategory =
  | 'electronics'
  | 'vehicles'
  | 'realestate'
  | 'fashion'
  | 'furniture'
  | 'services'
  | 'other';

export type ProductCondition = 'new' | 'used';

export interface MarketplaceProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  description: string;
  price: number;
  currency: 'USD' | 'SAR' | 'AED' | 'EGP' | 'EUR';
  images: string[];
  category: ProductCategory;
  condition: ProductCondition;
  location: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  status: 'active' | 'sold' | 'pending' | 'rejected';
  views: number;
  savesCount: number;
  isSaved?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketplaceReport {
  id: string;
  productId: string;
  productTitle?: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

// ==================== WEBRTC CALLS ====================
export type CallType = 'audio' | 'video';
export type CallStatus = 'calling' | 'ongoing' | 'ended' | 'rejected' | 'busy' | 'missed';

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  createdAt: string;
}

export interface CallSignal {
  id: string;
  callId: string;
  senderId: string;
  type: 'offer' | 'answer' | 'candidate';
  data: string; // JSON string of RTCSessionDescriptionInit or RTCIceCandidateInit
  createdAt: string;
}
