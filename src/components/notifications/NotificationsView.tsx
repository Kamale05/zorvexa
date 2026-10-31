import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Repeat2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NotificationItem } from '../../types';

export const NotificationsView: React.FC = () => {
  const {
    currentUser,
    notifications,
    markNotificationsAsRead,
    setSelectedUserProfile,
    setActiveTab,
    setSelectedPost,
    posts,
    language,
    t,
  } = useSocial();

  // Filter pills matching Screen 10: 'all' | 'likes' | 'comments' | 'follows'
  const [activeFilter, setActiveFilter] = useState<'all' | 'likes' | 'comments' | 'follows'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (currentUser && n.recipientId && n.recipientId !== currentUser.id) return false;
    if (activeFilter === 'likes') return n.type === 'like';
    if (activeFilter === 'comments') return n.type === 'comment';
    if (activeFilter === 'follows') return n.type === 'follow';
    return true;
  });

  const handleNotificationClick = (notif: NotificationItem) => {
    if (notif.postId) {
      const foundPost = posts.find((p) => p.id === notif.postId);
      if (foundPost) {
        setSelectedPost(foundPost);
        return;
      }
    }
    setSelectedUserProfile(notif.sender);
    setActiveTab('profile');
  };

  const getNotifIconBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
            <Heart className="w-3 h-3 fill-rose-500" />
          </div>
        );
      case 'comment':
        return (
          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
            <MessageCircle className="w-3 h-3 fill-blue-500" />
          </div>
        );
      case 'follow':
        return (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <UserPlus className="w-3 h-3" />
          </div>
        );
      case 'repost':
        return (
          <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <Repeat2 className="w-3 h-3" />
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 fill-amber-500" />
          </div>
        );
    }
  };

  const isRtl = language === 'ar';
  const BackChevron = isRtl ? ChevronRight : ChevronLeft;

  return (
    <div
      className="bg-white dark:bg-[#070D1E] rounded-3xl border border-slate-200 dark:border-[#1A2846] shadow-sm p-4 sm:p-6 space-y-4 max-w-xl mx-auto"
      id="notifications-view"
    >
      {/* Header matching Screen 10 */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1A2846]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('feed')}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
          >
            <BackChevron className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            الإشعارات
          </h2>
        </div>

        <button
          onClick={markNotificationsAsRead}
          className="p-1.5 text-xs text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1"
          title="تحديد الكل كمقروء"
        >
          <CheckCheck className="w-4 h-4" />
          <span className="hidden sm:inline">مقروء الكل</span>
        </button>
      </div>

      {/* Filter Pills matching Screen 10: [الكل] [الإعجابات] [التعليقات] [المتابعة] */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter('all')}
          className={`py-1.5 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
              : 'bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-[#1A2846]'
          }`}
        >
          الكل
        </button>

        <button
          onClick={() => setActiveFilter('likes')}
          className={`py-1.5 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
            activeFilter === 'likes'
              ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
              : 'bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-[#1A2846]'
          }`}
        >
          الإعجابات
        </button>

        <button
          onClick={() => setActiveFilter('comments')}
          className={`py-1.5 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
            activeFilter === 'comments'
              ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
              : 'bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-[#1A2846]'
          }`}
        >
          التعليقات
        </button>

        <button
          onClick={() => setActiveFilter('follows')}
          className={`py-1.5 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
            activeFilter === 'follows'
              ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
              : 'bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-[#1A2846]'
          }`}
        >
          المتابعة
        </button>
      </div>

      {/* Notifications List matching Screen 10 */}
      <div className="divide-y divide-slate-100 dark:divide-[#1A2846]">
        {filteredNotifs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            لا توجد إشعارات في هذا التصنيف حالياً
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`py-3.5 px-2 flex items-center justify-between gap-3 cursor-pointer transition rounded-2xl ${
                !notif.isRead
                  ? 'bg-blue-50/50 dark:bg-blue-950/20'
                  : 'hover:bg-slate-50 dark:hover:bg-[#0D162B]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar with action badge */}
                <div className="relative shrink-0">
                  <img
                    src={notif.sender.avatarUrl}
                    alt={notif.sender.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-[#1A2846]"
                  />
                  <div className="absolute -bottom-1 -end-1">
                    {getNotifIconBadge(notif.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    <span className="font-extrabold">{notif.sender.name}</span>{' '}
                    <span className="font-normal text-slate-600 dark:text-slate-300">
                      {notif.type === 'like' && 'أعجب بمنشورك'}
                      {notif.type === 'comment' && 'علق على منشورك'}
                      {notif.type === 'follow' && 'بدأ في متابعتك'}
                      {notif.type === 'repost' && 'أعاد نشر فكرتك'}
                      {notif.type === 'mention' && 'أشار إليك في منشور'}
                    </span>
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {notif.createdAt}
                  </span>
                </div>
              </div>

              {/* Unread blue dot */}
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
