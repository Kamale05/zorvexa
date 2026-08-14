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

export type ActiveTab = 'feed' | 'explore' | 'messages' | 'notifications' | 'profile' | 'settings';
