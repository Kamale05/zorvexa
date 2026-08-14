import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { TrendingUp, Sparkles, UserPlus, Check, MessageSquare } from 'lucide-react';
import { User } from '../../types';

export const RightSidebar: React.FC = () => {
  const {
    currentUser,
    users,
    hashtags,
    toggleFollowUser,
    setSelectedUserProfile,
    setActiveTab,
    setSearchQuery,
    startOrOpenConversationWith,
    t,
  } = useSocial();

  // Filter out current user from suggestions
  const suggestedUsers = users.filter((u) => u.id !== currentUser?.id).slice(0, 3);
  const onlineFriends = users.filter((u) => u.id !== currentUser?.id && u.isOnline).slice(0, 4);
  const topHashtags = hashtags.slice(0, 5);

  const handleUserClick = (user: User) => {
    setSelectedUserProfile(user);
    setActiveTab('profile');
  };

  const handleHashtagClick = (tag: string) => {
    setSearchQuery(`#${tag}`);
    setActiveTab('explore');
  };

  return (
    <aside
      className="hidden xl:flex flex-col gap-4 w-80 shrink-0 h-[calc(100vh-4rem)] sticky top-16 p-4 overflow-y-auto"
      id="desktop-right-sidebar"
    >
      {/* Trending Topics Card */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3 px-1 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
          <TrendingUp className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <h3>{t('trendingNow')}</h3>
        </div>

        <div className="space-y-1.5">
          {topHashtags.map((ht, idx) => (
            <div
              key={ht.id}
              onClick={() => handleHashtagClick(ht.tag)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition group"
            >
              <div>
                <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  #{idx + 1} · {ht.category}
                </span>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition">
                  #{ht.tag}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {t('postsNumber', { count: ht.postsCount.toLocaleString() })}
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition">
                استكشف
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Who To Follow Card */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3 px-1 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <h3>{t('whoToFollow')}</h3>
        </div>

        <div className="space-y-2.5">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3">
              <div
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:underline">
                      {user.name}
                    </h5>
                    {user.isVerified && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">@{user.username}</p>
                </div>
              </div>

              <button
                onClick={() => toggleFollowUser(user.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition active:scale-95 flex items-center gap-1 shrink-0 ${
                  user.isFollowing
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 shadow-sm'
                }`}
              >
                {user.isFollowing ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>{t('following')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>{t('follow')}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Online Friends */}
      {onlineFriends.length > 0 && (
        <div className="bg-white dark:bg-[#121215] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1 text-zinc-900 dark:text-zinc-100 font-bold text-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t('activeNow')}</span>
            </span>
            <span className="text-[11px] font-normal text-zinc-400">{onlineFriends.length} متصل</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto py-1">
            {onlineFriends.map((f) => (
              <div
                key={f.id}
                onClick={() => startOrOpenConversationWith(f)}
                className="relative cursor-pointer group flex flex-col items-center gap-1 shrink-0"
                title={`محادثة مع ${f.name}`}
              >
                <div className="relative">
                  <img
                    src={f.avatarUrl}
                    alt={f.name}
                    className="w-9 h-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 transition"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                </div>
                <span className="text-[10px] text-zinc-600 dark:text-zinc-300 max-w-[48px] truncate text-center">
                  {f.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-zinc-400 dark:text-zinc-500 flex flex-wrap gap-x-3 gap-y-1">
        <span>© 2026 Zorvexa</span>
        <span>الخصوصية</span>
        <span>الشروط</span>
        <span>مركز المساعدة</span>
      </div>
    </aside>
  );
};
