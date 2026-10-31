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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#070D1E]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#1A2846] pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.5)] transition-colors"
      id="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around h-16 px-3 max-w-lg mx-auto relative">
        {/* Home Tab */}
        <button
          onClick={() => handleTabClick('feed')}
          className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 ${
            activeTab === 'feed'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{t('home')}</span>
          {activeTab === 'feed' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Explore Tab */}
        <button
          onClick={() => handleTabClick('explore')}
          className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 ${
            activeTab === 'explore'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">{t('explore')}</span>
          {activeTab === 'explore' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Floating Center Create Post */}
        <div className="relative -top-2.5">
          <button
            onClick={handleCreateClick}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.4)] border border-sky-400/30 active:scale-95 transition-all"
            id="mobile-create-post-btn"
            aria-label={t('create')}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Notifications Tab */}
        <button
          onClick={() => handleTabClick('notifications')}
          className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 ${
            activeTab === 'notifications'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 ${activeTab === 'notifications' ? 'stroke-[2.5]' : ''}`} />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -end-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{t('notifications')}</span>
          {activeTab === 'notifications' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center w-14 h-full relative transition-all duration-200 ${
            activeTab === 'profile'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {currentUser ? (
            <div className={`w-6 h-6 rounded-lg overflow-hidden border ${
              activeTab === 'profile' ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-zinc-300 dark:border-zinc-700'
            }`}>
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
          <span className="text-[10px] mt-0.5 tracking-tight">{t('profile')}</span>
          {activeTab === 'profile' && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5 animate-pulse" />
          )}
        </button>
      </div>
    </nav>
  );
};
