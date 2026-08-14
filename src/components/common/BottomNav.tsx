import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { Home, Compass, Plus, Bell, User as UserIcon } from 'lucide-react';
import { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    notifications,
    setIsCreatePostModalOpen,
    setIsAuthModalOpen,
    setAuthModalView,
    setSelectedUserProfile,
    t,
  } = useSocial();

  const unreadNotifsCount = notifications.filter(
    (n) => !n.isRead && (!n.recipientId || !currentUser || n.recipientId === currentUser.id)
  ).length;

  const handleTabClick = (tab: ActiveTab) => {
    if (tab === 'profile') {
      setSelectedUserProfile(null);
    }
    setActiveTab(tab);
  };

  const handleCreateClick = () => {
    if (!currentUser) {
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreatePostModalOpen(true);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 pb-safe transition-colors"
      id="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto relative">
        {/* Home */}
        <button
          onClick={() => handleTabClick('feed')}
          className={`flex flex-col items-center justify-center w-14 h-full relative transition-colors ${
            activeTab === 'feed'
              ? 'text-zinc-900 dark:text-zinc-100 font-bold'
              : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t('home')}</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => handleTabClick('explore')}
          className={`flex flex-col items-center justify-center w-14 h-full relative transition-colors ${
            activeTab === 'explore'
              ? 'text-zinc-900 dark:text-zinc-100 font-bold'
              : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t('explore')}</span>
        </button>

        {/* Floating Create Button */}
        <div className="relative -top-2">
          <button
            onClick={handleCreateClick}
            className="w-11 h-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-md active:scale-95 transition-transform"
            id="mobile-create-post-btn"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Notifications */}
        <button
          onClick={() => handleTabClick('notifications')}
          className={`flex flex-col items-center justify-center w-14 h-full relative transition-colors ${
            activeTab === 'notifications'
              ? 'text-zinc-900 dark:text-zinc-100 font-bold'
              : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'stroke-[2.5]' : ''}`} />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{t('notifications')}</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center w-14 h-full relative transition-colors ${
            activeTab === 'profile'
              ? 'text-zinc-900 dark:text-zinc-100 font-bold'
              : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          {currentUser ? (
            <div className="w-6 h-6 rounded-md overflow-hidden border border-zinc-400 dark:border-zinc-600">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-0.5">{t('profile')}</span>
        </button>
      </div>
    </nav>
  );
};
