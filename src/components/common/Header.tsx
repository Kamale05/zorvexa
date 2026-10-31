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
  Smartphone,
  Download,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useAndroidInstall } from '../../hooks/useAndroidInstall';
import { AndroidInstallModal } from './AndroidInstallModal';

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
    isAdmin,
    setIsMyPromotionsOpen,
    t,
  } = useSocial();

  const { isInstallable, isInstalled, showInstallGuide, setShowInstallGuide, triggerInstall } = useAndroidInstall();

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
      className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#070D1E]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1A2846] transition-colors"
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
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              className="w-full ps-10 pe-4 py-2 text-sm bg-slate-100 dark:bg-[#0B1428] hover:bg-slate-200/70 dark:hover:bg-[#0E1A33] focus:bg-white dark:focus:bg-[#0B1428] border border-transparent focus:border-blue-500 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Actions matching Screen 3 */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Icon (triggers explore) */}
          <button
            onClick={() => setActiveTab('explore')}
            className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-[#0D162B] transition"
            title="بحث"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Create Button (Shown on mobile as circle + and desktop as button) */}
          <button
            onClick={() => {
              if (!currentUser) {
                setAuthModalView('login');
                setIsAuthModalOpen(true);
              } else {
                setIsCreatePostModalOpen(true);
              }
            }}
            className="p-2 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_2px_12px_rgba(37,99,235,0.4)] transition active:scale-95"
            id="header-create-btn"
            title="إنشاء منشور"
          >
            <PlusCircle className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('create')}</span>
          </button>

          {/* Marketplace Button */}
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`p-2 rounded-xl relative text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-[#0D162B] transition ${
              activeTab === 'marketplace' ? 'bg-blue-600 text-white dark:bg-blue-600' : ''
            }`}
            title={t('marketplace')}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>

          {/* My Promotions Button */}
          {currentUser && (
            <button
              onClick={() => setIsMyPromotionsOpen(true)}
              className="p-2 rounded-xl relative text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-[#0D162B] transition"
              title={t('myPromotions')}
            >
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </button>
          )}

          {/* Admin Dashboard Button (Only for Admins) */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`p-2 rounded-xl relative text-blue-400 hover:text-white hover:bg-blue-600/30 transition ${
                activeTab === 'admin' ? 'bg-blue-600 text-white' : ''
              }`}
              title={t('adminDashboard')}
            >
              <ShieldCheck className="w-5 h-5" />
            </button>
          )}

          {/* Messages button (matching Screen 3) */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`p-2 rounded-xl relative text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-[#0D162B] transition ${
              activeTab === 'messages' ? 'bg-slate-100 dark:bg-[#0D162B] text-white' : ''
            }`}
            title={t('messages')}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 end-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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

          {/* Android App Install Shortcut */}
          {!isInstalled && (
            <button
              onClick={() => setShowInstallGuide(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 transition border border-violet-200/60 dark:border-violet-800/50"
              title="تثبيت تطبيق أندرويد / Install Android App"
            >
              <Smartphone className="w-3.5 h-3.5 text-violet-500" />
              <span className="hidden sm:inline">تطبيق الهاتف</span>
            </button>
          )}

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

      {/* Android Install Guide Modal */}
      <AndroidInstallModal
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
        onInstall={triggerInstall}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
      />
    </header>
  );
};
