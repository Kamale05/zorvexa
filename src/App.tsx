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
import { CreatePostModal } from './components/feed/CreatePostModal';
import { PostDetailsModal } from './components/feed/PostDetailsModal';
import { AuthModal } from './components/auth/AuthModal';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setIsCreatePostModalOpen } = useSocial();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedView />;
      case 'explore':
        return <ExploreView />;
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
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200" id="zorvexa-root">
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
              key={activeTab}
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
          onClick={() => setIsCreatePostModalOpen(true)}
          className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg border border-zinc-700/30 flex items-center justify-center active:scale-95 transition"
          aria-label="إنشاء منشور"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals & Notifications */}
      <CreatePostModal />
      <PostDetailsModal />
      <AuthModal />
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
