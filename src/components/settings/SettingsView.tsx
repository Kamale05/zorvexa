import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  User as UserIcon,
  Shield,
  Palette,
  Globe,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Check,
  Smartphone,
  Sparkles,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAndroidInstall } from '../../hooks/useAndroidInstall';
import { AndroidInstallModal } from '../common/AndroidInstallModal';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    logout,
    requestLogout,
    theme,
    setTheme,
    language,
    setLanguage,
    setActiveTab,
    showToast,
    t,
  } = useSocial();

  // Active view: 'main' list or sub-screen
  const [activeSubView, setActiveSubView] = useState<
    'main' | 'account' | 'privacy' | 'notifications' | 'appearance' | 'language' | 'help' | 'about'
  >('main');

  const { isInstallable, isInstalled, showInstallGuide, setShowInstallGuide, triggerInstall } =
    useAndroidInstall();

  // Account edit fields
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Privacy toggles
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [allowTags, setAllowTags] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // Notification toggles
  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFollows, setNotifFollows] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      username: username.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
      email,
      bio,
    });
    showToast('تم حفظ التغييرات بنجاح!');
  };

  const getThemeLabel = (mode: string) => {
    if (mode === 'dark') return 'الوضع الداكن';
    if (mode === 'light') return 'الوضع الفاتح';
    return 'تلقائي (النظام)';
  };

  const isRtl = language === 'ar';
  const BackChevron = isRtl ? ChevronRight : ChevronLeft;
  const ForwardChevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      className="bg-white dark:bg-[#070D1E] rounded-3xl border border-slate-200 dark:border-[#1A2846] shadow-sm overflow-hidden transition-colors max-w-xl mx-auto"
      id="settings-view"
    >
      {/* ----------------- SUB-VIEW: APPEARANCE (SCREEN 8) ----------------- */}
      {activeSubView === 'appearance' && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1A2846]">
            <button
              onClick={() => setActiveSubView('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
            >
              <BackChevron className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              المظهر
            </h2>
          </div>

          {/* 3 Selectable Cards matching Screen 8 */}
          <div className="space-y-3.5">
            {/* 1. Light Mode Card */}
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-[#1A2846] bg-slate-50 dark:bg-[#0D162B] hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">فاتح</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">واجهة بيضاء</p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-slate-400 dark:border-slate-600'
                }`}
              >
                {theme === 'light' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {/* 2. Dark Mode Card (Glowing active border in reference) */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                theme === 'dark'
                  ? 'border-blue-500 bg-[#0B1428] shadow-[0_0_20px_rgba(59,130,246,0.4)] ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-[#1A2846] bg-slate-50 dark:bg-[#0D162B] hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">داكن</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">واجهة سوداء</p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-slate-400 dark:border-slate-600'
                }`}
              >
                {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {/* 3. System Mode Card */}
            <div
              onClick={() => setTheme('system')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                theme === 'system'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-[#1A2846] bg-slate-50 dark:bg-[#0D162B] hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-500/20 text-slate-400 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">النظام</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">حسب إعدادات الهاتف</p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-slate-400 dark:border-slate-600'
                }`}
              >
                {theme === 'system' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
            سيتم تطبيق المظهر على جميع صفحات التطبيق
          </p>
        </div>
      )}

      {/* ----------------- SUB-VIEW: ACCOUNT ----------------- */}
      {activeSubView === 'account' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1A2846]">
            <button
              onClick={() => setActiveSubView('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
            >
              <BackChevron className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              إعدادات الحساب
            </h2>
          </div>

          <form onSubmit={handleUpdateAccount} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">الاسم الكامل</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">النبذة الشخصية (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
            >
              حفظ التغييرات
            </button>
          </form>
        </div>
      )}

      {/* ----------------- SUB-VIEW: PRIVACY ----------------- */}
      {activeSubView === 'privacy' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1A2846]">
            <button
              onClick={() => setActiveSubView('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
            >
              <BackChevron className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              الخصوصية والأمان
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">حساب خاص</h4>
                <p className="text-[11px] text-slate-400">فقط المتابعون الذين توافق عليهم يمكنهم رؤية منشوراتك</p>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => {
                  setIsPrivate(e.target.checked);
                  updateCurrentUser({ isPrivate: e.target.checked });
                }}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">إظهار حالة النشاط</h4>
                <p className="text-[11px] text-slate-400">إظهار الدائرة الخضراء عندما تكون متصلاً</p>
              </div>
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={(e) => setShowOnlineStatus(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">السماح بالإشارات في المنشورات</h4>
                <p className="text-[11px] text-slate-400">تمكين أصدقائك من الإشارة إليك في المنشورات</p>
              </div>
              <input
                type="checkbox"
                checked={allowTags}
                onChange={(e) => setAllowTags(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-VIEW: NOTIFICATIONS ----------------- */}
      {activeSubView === 'notifications' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1A2846]">
            <button
              onClick={() => setActiveSubView('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
            >
              <BackChevron className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              الإشعارات
            </h2>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <span className="text-xs font-bold text-slate-900 dark:text-white">إشعارات الإعجابات</span>
              <input
                type="checkbox"
                checked={notifLikes}
                onChange={(e) => setNotifLikes(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <span className="text-xs font-bold text-slate-900 dark:text-white">إشعارات التعليقات</span>
              <input
                type="checkbox"
                checked={notifComments}
                onChange={(e) => setNotifComments(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <span className="text-xs font-bold text-slate-900 dark:text-white">إشعارات المتابعين الجدد</span>
              <input
                type="checkbox"
                checked={notifFollows}
                onChange={(e) => setNotifFollows(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <span className="text-xs font-bold text-slate-900 dark:text-white">إشعارات الرسائل الفورية</span>
              <input
                type="checkbox"
                checked={notifMessages}
                onChange={(e) => setNotifMessages(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-VIEW: LANGUAGE ----------------- */}
      {activeSubView === 'language' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1A2846]">
            <button
              onClick={() => setActiveSubView('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
            >
              <BackChevron className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              اللغة (Language)
            </h2>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => setLanguage('ar')}
              className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                language === 'ar'
                  ? 'border-blue-500 bg-blue-50 dark:bg-[#0D162B] ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-[#1A2846] bg-slate-50 dark:bg-[#0D162B]'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">العربية (Arabic)</h4>
                <p className="text-[11px] text-slate-400">اللغة الافتراضية للتطبيق</p>
              </div>
              {language === 'ar' && <Check className="w-4 h-4 text-blue-500" />}
            </div>

            <div
              onClick={() => setLanguage('en')}
              className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                language === 'en'
                  ? 'border-blue-500 bg-blue-50 dark:bg-[#0D162B] ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-[#1A2846] bg-slate-50 dark:bg-[#0D162B]'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">English (الإنجليزية)</h4>
                <p className="text-[11px] text-slate-400">English Interface</p>
              </div>
              {language === 'en' && <Check className="w-4 h-4 text-blue-500" />}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-VIEW: ABOUT APP ----------------- */}
      {activeSubView === 'about' && (
        <div className="p-5 sm:p-6 space-y-6 text-center">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1A2846] text-start">
            <button
              onClick={() => setActiveSubView('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
            >
              <BackChevron className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              حول التطبيق
            </h2>
          </div>

          <div className="flex flex-col items-center py-4">
            <Logo size="xl" showText={true} />
            <span className="text-xs text-slate-400 mt-2">الإصدار 2.4.0 (Build 2026)</span>
            <p className="text-xs text-slate-300 max-w-sm mt-4 leading-relaxed">
              منصة Zorvexa الاجتماعية المتميزة — تواصل، شارك، واكتشف عالماً مليئاً بالإبداع والأصدقاء. مدعومة بالكامل بنظام سحابي فائق الأمان عبر Firebase وتصميم متطور للأندرويد.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846] text-xs text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>قاعدة البيانات</span>
              <span className="text-emerald-400 font-semibold">Firebase Firestore متصلة</span>
            </div>
            <div className="flex justify-between">
              <span>تخزين الصور</span>
              <span className="text-blue-400 font-semibold">Firebase Storage</span>
            </div>
            <div className="flex justify-between">
              <span>بيئة التشغيل</span>
              <span className="text-slate-200 font-semibold">Android & Web PWA</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-VIEW: HELP ----------------- */}
      {activeSubView === 'help' && (
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1A2846]">
            <button
              onClick={() => setActiveSubView('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
            >
              <BackChevron className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              المساعدة والدعم
            </h2>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">كيف أرفع الصور من هاتفي؟</h4>
              <p className="text-slate-400 leading-relaxed">
                اضغط على زر (+) في شريط التنقل السفلي أو من أعلى الصفحة، ثم اضغط على "إضافة صور" لاختيار صور من معرض هاتفك مباشرة ورفعها إلى السحابة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D162B] border border-slate-200 dark:border-[#1A2846]">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">كيف أغيّر مظهر التطبيق؟</h4>
              <p className="text-slate-400 leading-relaxed">
                من قائمة الإعدادات اضغط على "المظهر" واختر بين الوضع الفاتح، الداكن، أو التلقائي حسب نظام هاتفك.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MAIN SETTINGS VIEW (SCREEN 7) ----------------- */}
      {activeSubView === 'main' && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Header matching Screen 7 */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1A2846]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('feed')}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#0D162B] text-slate-400 hover:text-white transition"
              >
                <BackChevron className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                الإعدادات
              </h2>
            </div>
          </div>

          {/* Settings List matching Screen 7 */}
          <div className="divide-y divide-slate-100 dark:divide-[#1A2846]">
            {/* 1. الحساب */}
            <div
              onClick={() => setActiveSubView('account')}
              className="py-3.5 flex items-center justify-between cursor-pointer group hover:opacity-80 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  الحساب
                </span>
              </div>
              <ForwardChevron className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
            </div>

            {/* 2. الخصوصية والأمان */}
            <div
              onClick={() => setActiveSubView('privacy')}
              className="py-3.5 flex items-center justify-between cursor-pointer group hover:opacity-80 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  الخصوصية والأمان
                </span>
              </div>
              <ForwardChevron className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
            </div>

            {/* 3. الإشعارات */}
            <div
              onClick={() => setActiveSubView('notifications')}
              className="py-3.5 flex items-center justify-between cursor-pointer group hover:opacity-80 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600/10 text-amber-500 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  الإشعارات
                </span>
              </div>
              <ForwardChevron className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
            </div>

            {/* 4. المظهر (with sub-badge "الوضع الداكن") */}
            <div
              onClick={() => setActiveSubView('appearance')}
              className="py-3.5 flex items-center justify-between cursor-pointer group hover:opacity-80 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  المظهر
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1A2846]">
                  {getThemeLabel(theme)}
                </span>
                <ForwardChevron className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
              </div>
            </div>

            {/* 5. اللغة (with sub-badge "العربية") */}
            <div
              onClick={() => setActiveSubView('language')}
              className="py-3.5 flex items-center justify-between cursor-pointer group hover:opacity-80 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-500 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  اللغة
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1A2846]">
                  {language === 'ar' ? 'العربية' : 'English'}
                </span>
                <ForwardChevron className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
              </div>
            </div>

            {/* 6. المساعدة والدعم */}
            <div
              onClick={() => setActiveSubView('help')}
              className="py-3.5 flex items-center justify-between cursor-pointer group hover:opacity-80 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600/10 text-sky-400 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  المساعدة والدعم
                </span>
              </div>
              <ForwardChevron className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
            </div>

            {/* 7. حول التطبيق */}
            <div
              onClick={() => setActiveSubView('about')}
              className="py-3.5 flex items-center justify-between cursor-pointer group hover:opacity-80 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600/10 text-teal-400 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  حول التطبيق
                </span>
              </div>
              <ForwardChevron className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
            </div>
          </div>

          {/* Red Outlined Logout Card Button matching Screen 7 */}
          <div className="pt-4">
            <button
              onClick={requestLogout}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-rose-600/80 hover:border-rose-500 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 hover:text-rose-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition active:scale-98 shadow-sm"
              id="settings-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
