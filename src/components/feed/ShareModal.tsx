import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Send,
  MessageSquare,
  Share2,
  Bookmark,
} from 'lucide-react';
import { Post, User } from '../../types';

interface ShareModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, isOpen, onClose }) => {
  const { currentUser, users, sendMessage, startOrOpenConversationWith, showToast, t } = useSocial();
  const [copied, setCopied] = useState(false);
  const [selectedUserToDm, setSelectedUserToDm] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const shareUrl = `${window.location.origin}/#post-${post.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast(t('linkCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectSend = (recipient: User) => {
    const convId = startOrOpenConversationWith(recipient);
    if (convId) {
      const previewText = `📢 شارك معك منشوراً بواسطة @${post.author.username}:\n"${post.content.substring(0, 70)}..."\n${shareUrl}`;
      sendMessage(convId, previewText);
      showToast(`تم إرسال المنشور إلى ${recipient.name}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="share-modal">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#121215] rounded-2xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-zinc-400" />
              <span>{t('share')} المنشور</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Copy link bar */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-zinc-600 dark:text-zinc-400 w-full focus:outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shrink-0 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : t('copyLink')}</span>
            </button>
          </div>

          {/* Send via Direct Message */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 mb-2">
              إرسال في رسالة خاصة إلى أصدقائك:
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {users
                .filter((u) => u.id !== currentUser?.id)
                .map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name}
                        className="w-8 h-8 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {friend.name}
                        </h5>
                        <p className="text-[10px] text-zinc-400 truncate">@{friend.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDirectSend(friend)}
                      className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg transition flex items-center gap-1"
                    >
                      <Send className="w-3 h-3 rtl:rotate-180" />
                      <span>إرسال</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
