import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Post, User } from '../../types';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  MapPin,
  Sparkles,
  Trash2,
  Edit3,
  Ban,
  Eye,
  Globe,
  Users,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ShareModal } from './ShareModal';
import { EditPostModal } from './EditPostModal';
import confetti from 'canvas-confetti';

interface PostCardProps {
  post: Post;
  onCommentClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onCommentClick }) => {
  const {
    currentUser,
    toggleLikePost,
    toggleSavePost,
    toggleRepost,
    deletePost,
    blockUser,
    setSelectedUserProfile,
    setActiveTab,
    setSearchQuery,
    setSelectedPost,
    setPostToPromote,
    setIsCreatePromotionOpen,
    t,
  } = useSocial();

  const [showMenu, setShowMenu] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isOwner = currentUser?.id === post.authorId;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.isLiked) {
      // Trigger subtle particle burst near cursor
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 18,
        spread: 45,
        origin: { x, y },
        colors: ['#e11d48', '#f43f5e', '#8b5cf6'],
        disableForReducedMotion: true,
      });
    }
    toggleLikePost(post.id);
  };

  const handleUserClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setSelectedUserProfile(user);
    setActiveTab('profile');
  };

  const handleHashtagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setSearchQuery(`#${tag}`);
    setActiveTab('explore');
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffMin < 1) return 'الآن';
      if (diffMin < 60) return `منذ ${diffMin} د`;
      if (diffHour < 24) return `منذ ${diffHour} س`;
      if (diffDay < 7) return `منذ ${diffDay} يوم`;
      return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Render text with highlighted hashtags
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(#[\p{L}\w_]+)/gu);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        const cleanTag = part.replace('#', '');
        return (
          <span
            key={i}
            onClick={(e) => handleHashtagClick(e, cleanTag)}
            className="text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer transition-colors"
          >
            {part}{' '}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <article
      className="bg-white dark:bg-[#070D1E] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-[#1A2846] shadow-xs transition-all mb-4 relative"
      id={`post-card-${post.id}`}
    >
      {/* Header: Author info & options */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          onClick={(e) => handleUserClick(e, post.author)}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <div className="relative">
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 transition-all shrink-0"
              referrerPolicy="no-referrer"
            />
            {post.author.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:underline">
                {post.author.name}
              </h4>
              {post.author.isVerified && (
                <Sparkles className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{formatTimestamp(post.createdAt)}</span>
              {post.isEdited && (
                <>
                  <span>·</span>
                  <span className="text-[11px] text-zinc-400 italic">({t('edited')})</span>
                </>
              )}
              <span>·</span>
              {post.privacy === 'public' && <Globe className="w-3 h-3" title={t('public')} />}
              {post.privacy === 'followers' && <Users className="w-3 h-3" title={t('followersOnly')} />}
              {post.privacy === 'private' && <Lock className="w-3 h-3" title={t('privateOnly')} />}
            </div>
          </div>
        </div>

        {/* Options dropdown toggle */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute end-0 top-full mt-1 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1 z-30"
              onClick={() => setShowMenu(false)}
            >
              {isOwner ? (
                <>
                  <button
                    onClick={() => {
                      setPostToPromote(post);
                      setIsCreatePromotionOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 text-start transition"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>{t('promotePost')}</span>
                  </button>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-start transition"
                  >
                    <Edit3 className="w-4 h-4 text-zinc-400" />
                    <span>{t('editPost')}</span>
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-start transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('deletePost')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => blockUser(post.authorId)}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-start transition"
                >
                  <Ban className="w-4 h-4" />
                  <span>حظر @{post.author.username}</span>
                </button>
              )}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-start transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('share')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Text */}
      <p
        onClick={() => setSelectedPost(post)}
        className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-line mb-3 cursor-pointer"
      >
        {renderFormattedContent(post.content)}
      </p>

      {/* Location Badge if available */}
      {post.location && (
        <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{post.location}</span>
        </div>
      )}

      {/* Media Attachments Gallery */}
      {post.media && post.media.length > 0 && (
        <div
          onClick={() => setSelectedPost(post)}
          className="rounded-2xl overflow-hidden mb-3 border border-zinc-200/80 dark:border-zinc-800/80 cursor-pointer shadow-xs bg-zinc-950"
        >
          {post.media.length === 1 ? (
            <div className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[420px] overflow-hidden">
              <img
                src={post.media[0].url}
                alt="Post media"
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : post.media.length === 2 ? (
            <div className="grid grid-cols-2 gap-1 aspect-[16/10]">
              {post.media.map((item, idx) => (
                <div key={item.id || idx} className="relative h-full overflow-hidden">
                  <img
                    src={item.url}
                    alt="Post media"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : post.media.length === 3 ? (
            <div className="grid grid-cols-2 gap-1 aspect-[16/10]">
              <div className="relative h-full overflow-hidden">
                <img
                  src={post.media[0].url}
                  alt="Post media"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="grid grid-rows-2 gap-1 h-full">
                {post.media.slice(1, 3).map((item, idx) => (
                  <div key={item.id || idx} className="relative h-full overflow-hidden">
                    <img
                      src={item.url}
                      alt="Post media"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 aspect-[16/10]">
              {post.media.slice(0, 4).map((item, idx) => (
                <div key={item.id || idx} className="relative h-full overflow-hidden">
                  <img
                    src={item.url}
                    alt="Post media"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {idx === 3 && post.media!.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-base font-bold">
                      +{post.media!.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats bar (views & total engagement) */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pb-2.5 mb-2 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{post.viewsCount.toLocaleString()} {t('views')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{post.likesCount.toLocaleString()} {t('likes')}</span>
          <span>{post.commentsCount.toLocaleString()} {t('comments')}</span>
          <span>{post.repostsCount.toLocaleString()} {t('repostsCount' as any) || 'إعادة نشر'}</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold transition active:scale-90 ${
            post.isLiked
              ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
              : 'hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <motion.div
            animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </motion.div>
          <span>{post.likesCount > 0 ? post.likesCount : t('like')}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => {
            if (onCommentClick) onCommentClick();
            else setSelectedPost(post);
          }}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentsCount > 0 ? post.commentsCount : t('comment')}</span>
        </button>

        {/* Repost */}
        <button
          onClick={() => toggleRepost(post.id)}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
            post.isReposted
              ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
              : 'hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Repeat2 className="w-4 h-4" />
          <span>{post.repostsCount > 0 ? post.repostsCount : t('repost')}</span>
        </button>

        {/* Bookmark / Save */}
        <button
          onClick={() => toggleSavePost(post.id)}
          className={`p-1.5 rounded-lg transition active:scale-90 ${
            post.isSaved
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
              : 'hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
          title={post.isSaved ? t('saved') : t('save')}
        >
          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
        </button>

        {/* Share */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="p-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition active:scale-95"
          title={t('share')}
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title={t('deletePost')}
        message={t('deletePostConfirm')}
        confirmLabel={t('deletePost')}
        isDestructive={true}
        onConfirm={() => deletePost(post.id)}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Share Modal */}
      <ShareModal
        post={post}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Edit Post Modal */}
      {isOwner && (
        <EditPostModal
          post={post}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </article>
  );
};
