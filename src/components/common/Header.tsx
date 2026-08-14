import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { Logo } from './Logo';
import {
  Search,
  Bell,
  MessageSquare,
  Moon,
  Sun,
  Globe,
  PlusCircle,
  LogIn,
  SlidersHorizontal,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    notifications,
    conversations,
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    theme,
    setTheme,
    searchQuery,
    setSearchQuery,
    setIsCreatePostModalOpen,
    setIsAuthModalOpen,
    setAuthModalView,
    t,
  } = useSocial();

  const unreadNotifsCount = notifications.filter(
    (n) => !n.isRead && (!n.recipientId || !currentUser || n.recipientId === currentUser.id)
  ).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors"
      id="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Mobile Home link */}
        <div className="flex items-center gap-4">
          <div onClick={() => setActiveTab('feed')}>
            <Logo size="md" />
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-lg hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'explore') {
                  setActiveTab('explore');
                }
              }}
              onFocus={() => {
                if (activeTab !== 'explore') setActiveTab('explore');
              }}
              placeholder={t('search')}
              className="w-full ps-10 pe-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-900/90 hover:bg-zinc-200/70 dark:hover:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-zinc-400 dark:focus:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Actions, Theme, Language, Profile/Login */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Create Button on Tablet/Desktop */}
          {currentUser && (
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="hidden md:flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
              id="header-create-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('create')}</span>
            </button>
          )}

          {/* Messages button (mobile top shortcut) */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`p-2.5 rounded-xl relative text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition ${
              activeTab === 'messages' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100' : ''
            }`}
            title={t('messages')}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1.5 end-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications button */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`p-2.5 rounded-xl relative text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition ${
              activeTab === 'notifications'
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                : ''
            }`}
            title={t('notifications')}
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 end-1.5 w-4 h-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition border border-transparent dark:border-zinc-800"
            title="تبديل اللغة / Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Switch */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-zinc-300" /> : <Moon className="w-5 h-5 text-zinc-700" />}
          </button>

          {/* User Avatar / Login */}
          {currentUser ? (
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:ring-2 hover:ring-zinc-400/40 transition"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalView('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('login')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
