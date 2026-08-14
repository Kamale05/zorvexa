import React from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  Bookmark,
  User as UserIcon,
  Settings,
  PlusCircle,
  LogOut,
  Users,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    notifications,
    conversations,
    setIsCreatePostModalOpen,
    logout,
    setSelectedUserProfile,
    t,
  } = useSocial();

  const unreadNotifsCount = notifications.filter(
    (n) => !n.isRead && (!n.recipientId || !currentUser || n.recipientId === currentUser.id)
  ).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const navItems = [
    {
      id: 'feed' as ActiveTab,
      label: t('home'),
      icon: Home,
      badge: 0,
    },
    {
      id: 'explore' as ActiveTab,
      label: t('explore'),
      icon: Compass,
      badge: 0,
    },
    {
      id: 'notifications' as ActiveTab,
      label: t('notifications'),
      icon: Bell,
      badge: unreadNotifsCount,
    },
    {
      id: 'messages' as ActiveTab,
      label: t('messages'),
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    {
      id: 'profile' as ActiveTab,
      label: t('profile'),
      icon: UserIcon,
      badge: 0,
    },
    {
      id: 'settings' as ActiveTab,
      label: t('settings'),
      icon: Settings,
      badge: 0,
    },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    if (tabId === 'profile') {
      setSelectedUserProfile(null); // Return to own profile
    }
    setActiveTab(tabId);
  };

  return (
    <aside
      className="hidden md:flex flex-col justify-between w-64 lg:w-72 shrink-0 h-[calc(100vh-4rem)] sticky top-16 p-4 border-e border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-[#09090b]/40 select-none"
      id="desktop-sidebar"
    >
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400'}`} />
                <span className="text-sm">{item.label}</span>
              </div>

              {item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md ${
                    isActive ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Big Create Post Button */}
        {currentUser && (
          <div className="pt-3">
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold py-2.5 px-4 rounded-xl shadow-sm active:scale-[0.99] transition-all text-sm"
              id="sidebar-create-post-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('create')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Logged in User Card */}
      {currentUser && (
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/80 transition">
            <div
              onClick={() => {
                setSelectedUserProfile(null);
                setActiveTab('profile');
              }}
              className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
            >
              <div className="relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {currentUser.name}
                  </h4>
                  {currentUser.isVerified && (
                    <Sparkles className="w-3 h-3 text-zinc-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  @{currentUser.username}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
