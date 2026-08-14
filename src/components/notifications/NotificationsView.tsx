import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Repeat2,
  CheckCheck,
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
    t,
  } = useSocial();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (currentUser && n.recipientId && n.recipientId !== currentUser.id) return false;
    if (filter === 'unread') return !n.isRead;
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

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-violet-500 fill-violet-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'repost':
        return <Repeat2 className="w-4 h-4 text-indigo-500" />;
      case 'mention':
        return <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />;
    }
  };

  return (
    <div
      className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-4"
      id="notifications-view"
    >
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-500" />
            <span>{t('notifications')}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Unread toggle */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500'
              }`}
            >
              {t('allNotifications')}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-md transition ${
                filter === 'unread'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500'
              }`}
            >
              {t('unreadOnly')}
            </button>
          </div>

          <button
            onClick={markNotificationsAsRead}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2.5 py-1 rounded-lg transition"
            title={t('markAllAsRead')}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('markAllAsRead')}</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {filteredNotifs.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            {t('noNotifications')}
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`py-3 px-2.5 rounded-xl flex items-start gap-3 cursor-pointer transition ${
                notif.isRead
                  ? 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  : 'bg-zinc-50 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="relative shrink-0 mt-0.5">
                <img
                  src={notif.sender.avatarUrl}
                  alt={notif.sender.name}
                  className="w-9 h-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -end-1 p-0.5 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  {getNotifIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-snug">
                  <strong className="font-bold text-zinc-900 dark:text-zinc-100">
                    {notif.sender.name}
                  </strong>{' '}
                  {notif.type === 'like' && t('likedYourPost')}
                  {notif.type === 'comment' &&
                    t('commentedOnYourPost', { comment: notif.postContentPreview || '' })}
                  {notif.type === 'follow' && t('startedFollowingYou')}
                  {notif.type === 'repost' && t('repostedYourPost')}
                  {notif.type === 'mention' && t('mentionedYou')}
                </p>

                {notif.postContentPreview && notif.type !== 'comment' && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 italic">
                    "{notif.postContentPreview}"
                  </p>
                )}

                <span className="text-[10px] text-zinc-400 mt-1 block">{notif.createdAt}</span>
              </div>

              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
