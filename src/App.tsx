import React from 'react';
import { SocialProvider, useSocial } from './context/SocialContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { RightSidebar } from './components/common/RightSidebar';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/Toast';
import { FeedView } from './components/feed/FeedView';
import { ExploreView } from './components/explore/ExploreView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { MessagesView } from './components/messages/MessagesView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CreatePostModal } from './components/feed/CreatePostModal';
import { PostDetailsModal } from './components/feed/PostDetailsModal';
import { AuthModal } from './components/auth/AuthModal';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { SplashScreen } from './components/common/SplashScreen';
import { IncomingCallModal } from './components/calls/IncomingCallModal';
import { ActiveCallModal } from './components/calls/ActiveCallModal';
import { CreatePromotionModal } from './components/promotions/CreatePromotionModal';
import { MyPromotionsModal } from './components/promotions/MyPromotionsModal';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Lock, ShieldCheck } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [showSplash, setShowSplash] = React.useState(true);
  const {
    activeTab,
    currentUser,
    selectedUserProfile,
    setIsCreatePostModalOpen,
    isLogoutConfirmOpen,
    setIsLogoutConfirmOpen,
    logout,
    setIsAuthModalOpen,
    setAuthModalView,
    isAdmin,
    t,
  } = useSocial();

  const isProtectedTab =
    !currentUser &&
    (activeTab === 'settings' ||
      activeTab === 'messages' ||
      activeTab === 'notifications' ||
      activeTab === 'admin' ||
      (activeTab === 'profile' && !selectedUserProfile));

  const renderActiveView = () => {
    if (isProtectedTab) {
      return (
        <div className="bg-white dark:bg-[#070D1E] rounded-3xl border border-slate-200 dark:border-[#1A2846] p-8 sm:p-10 text-center max-w-md mx-auto shadow-sm my-8 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200/50 dark:border-blue-900/40 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {t('protectedPageTitle')}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            {t('protectedPageDesc')}
          </p>

          <button
            onClick={() => {
              setAuthModalView('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            {t('login')} / {t('register')}
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'feed':
        return <FeedView />;
      case 'explore':
        return <ExploreView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'admin':
        return isAdmin ? <AdminDashboard /> : <FeedView />;
      case 'notifications':
        return <NotificationsView />;
      case 'messages':
        return <MessagesView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <FeedView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200" id="zorvexa-root">
      {/* 3D Zorvexa Splash Screen on Launch matching Screen 1 */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Top Navbar */}
      <Header />

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-6 pb-20 sm:pb-8 flex gap-4 lg:gap-6 items-start">
        {/* Left Nav Sidebar (Desktop & Tablet) */}
        <Sidebar />

        {/* Center Main Dynamic Stream/View */}
        <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}_${isProtectedTab}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right Aside Sidebar (Desktop only) */}
        <RightSidebar />
      </div>

      {/* Mobile Floating Action Button (Create Post) */}
      <div className="sm:hidden fixed end-5 bottom-20 z-30">
        <button
          onClick={() => {
            if (!currentUser) {
              setAuthModalView('login');
              setIsAuthModalOpen(true);
            } else {
              setIsCreatePostModalOpen(true);
            }
          }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-blue-500/40 flex items-center justify-center active:scale-95 transition"
          aria-label="إنشاء منشور"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals & Subsystems */}
      <CreatePostModal />
      <PostDetailsModal />
      <AuthModal />
      <CreatePromotionModal />
      <MyPromotionsModal />
      <IncomingCallModal />
      <ActiveCallModal />
      <ConfirmationModal
        isOpen={isLogoutConfirmOpen}
        title={t('logoutConfirmTitle')}
        message={t('logoutConfirmMessage')}
        confirmLabel={t('logout')}
        cancelLabel={t('cancel')}
        isDestructive={true}
        onConfirm={logout}
        onClose={() => setIsLogoutConfirmOpen(false)}
      />
      <OfflineIndicator />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <SocialProvider>
      <MainAppContent />
    </SocialProvider>
  );
}

export default App;
