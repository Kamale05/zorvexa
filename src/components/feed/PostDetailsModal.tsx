import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Send,
  Sparkles,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MapPin,
  Trash2,
} from 'lucide-react';

export const PostDetailsModal: React.FC = () => {
  const {
    currentUser,
    selectedPost,
    setSelectedPost,
    comments,
    addComment,
    deleteComment,
    toggleLikeComment,
    toggleLikePost,
    toggleSavePost,
    toggleRepost,
    setSelectedUserProfile,
    setActiveTab,
    setIsAuthModalOpen,
    setAuthModalView,
    t,
  } = useSocial();

  const [commentText, setCommentText] = useState('');

  if (!selectedPost) return null;

  const postComments = comments.filter((c) => c.postId === selectedPost.id);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      return;
    }
    if (!commentText.trim()) return;
    addComment(selectedPost.id, commentText);
    setCommentText('');
  };

  const handleUserClick = (user: any) => {
    setSelectedUserProfile(user);
    setSelectedPost(null);
    setActiveTab('profile');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" id="post-details-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#121215] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              <span>تفاصيل المنشور والتعليقات</span>
            </h3>
            <button
              onClick={() => setSelectedPost(null)}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Author */}
            <div
              onClick={() => handleUserClick(selectedPost.author)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img
                src={selectedPost.author.avatarUrl}
                alt={selectedPost.author.name}
                className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline transition">
                    {selectedPost.author.name}
                  </h4>
                  {selectedPost.author.isVerified && (
                    <Sparkles className="w-3 h-3 text-zinc-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-400">@{selectedPost.author.username}</p>
              </div>
            </div>

            {/* Content */}
            <p className="text-zinc-800 dark:text-zinc-100 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {selectedPost.content}
            </p>

            {/* Location */}
            {selectedPost.location && (
              <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{selectedPost.location}</span>
              </div>
            )}

            {/* Media if present */}
            {selectedPost.media && selectedPost.media.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 space-y-2">
                {selectedPost.media.map((media, i) => (
                  <div key={i} className="aspect-video bg-zinc-950">
                    {media.type === 'image' ? (
                      <img src={media.url} alt="Media" className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} controls className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post stats & actions */}
            <div className="flex items-center justify-between py-3 border-y border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{selectedPost.likesCount} {t('likes')}</span>
                <span>{postComments.length} {t('comments')}</span>
                <span>{selectedPost.repostsCount} {t('repost')}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleLikePost(selectedPost.id)}
                  className={`p-2 rounded-xl transition ${
                    selectedPost.isLiked ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedPost.isLiked ? 'fill-rose-500' : ''}`} />
                </button>
                <button
                  onClick={() => toggleSavePost(selectedPost.id)}
                  className={`p-2 rounded-xl transition ${
                    selectedPost.isSaved ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${selectedPost.isSaved ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-semibold text-zinc-400 tracking-wider">
                {t('comments')} ({postComments.length})
              </h4>

              {postComments.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">
                  كن أول من يعلق على هذا المنشور! ✨
                </p>
              ) : (
                postComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800/80"
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <img
                        src={comment.author.avatarUrl}
                        alt={comment.author.name}
                        onClick={() => handleUserClick(comment.author)}
                        className="w-7 h-7 rounded-lg object-cover shrink-0 cursor-pointer border border-zinc-200 dark:border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5
                            onClick={() => handleUserClick(comment.author)}
                            className="text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:underline"
                          >
                            {comment.author.name}
                          </h5>
                          <span className="text-[10px] text-zinc-400">
                            @{comment.author.username}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {currentUser && (currentUser.id === comment.author.id || currentUser.id === selectedPost.authorId) && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                          title={t('deleteComment')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => toggleLikeComment(comment.id)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition ${
                          comment.isLiked
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                            : 'text-zinc-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-rose-500' : ''}`} />
                        {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Comment Input Bar */}
          <form onSubmit={handleAddComment} className="p-3 sm:p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121215] shrink-0">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl px-3 py-1.5 border border-zinc-200 dark:border-zinc-800">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('writeComment')}
                className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 rounded-lg transition shrink-0"
              >
                <Send className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
