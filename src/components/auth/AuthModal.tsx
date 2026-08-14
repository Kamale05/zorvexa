import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalView,
    setAuthModalView,
    login,
    register,
    users,
    switchDemoUser,
    language,
    showToast,
    t,
  } = useSocial();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const interestsList = [
    '💻 التقنية والبرمجة',
    '🤖 الذكاء الاصطناعي',
    '🎨 التصميم والفنون',
    '🎮 ألعاب الفيديو',
    '⚽ الرياضة واللياقة',
    '🚀 ريادة الأعمال',
    '📚 كتب وثقافة',
    '🎬 سينما وتصوير',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({
      name,
      username,
      email,
      password,
      interests: selectedInterests,
    });
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('يرجى إدخال بريدك الإلكتروني', 'error');
      return;
    }
    setForgotSent(true);
    showToast(t('resetEmailSent'));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" id="auth-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-[#121215] rounded-2xl p-6 sm:p-7 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute end-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo Brand Header */}
          <div className="text-center mb-6 pt-1">
            <div className="inline-block mb-3">
              <Logo size="md" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {authModalView === 'login' && t('loginTitle')}
              {authModalView === 'register' && t('registerTitle')}
              {authModalView === 'forgot' && t('forgotPasswordTitle')}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {authModalView === 'login' && 'مرحباً بك مجدداً في مجتمع Zorvexa'}
              {authModalView === 'register' && 'أنشئ حسابك وتواصل مع المبدعين حول العالم'}
              {authModalView === 'forgot' && 'أدخل بريدك الإلكتروني لاستلام رابط استعادة الحساب'}
            </p>
          </div>

          {/* LOGIN VIEW */}
          {authModalView === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t('emailOrUsername')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tariq@zorvexa.app"
                    required
                    className="w-full ps-10 pe-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {t('password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthModalView('forgot')}
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline font-medium"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full ps-10 pe-10 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl shadow-xs transition active:scale-[0.99]"
              >
                {t('login')}
              </button>

              {/* Quick Demo Login Presets */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 block mb-2 text-center">
                  أو سجّل الدخول فوراً بحساب تجريبي بنقرة واحدة:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {users.slice(0, 2).map((demoUser) => (
                    <button
                      key={demoUser.id}
                      type="button"
                      onClick={() => switchDemoUser(demoUser.id)}
                      className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-start flex items-center gap-2 transition"
                    >
                      <img
                        src={demoUser.avatarUrl}
                        alt={demoUser.name}
                        className="w-7 h-7 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {demoUser.name.split(' ')[0]}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">@{demoUser.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle to Register */}
              <div className="text-center pt-2">
                <span className="text-xs text-zinc-500">{t('dontHaveAccount')} </span>
                <button
                  type="button"
                  onClick={() => setAuthModalView('register')}
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  {t('createAccount')}
                </button>
              </div>
            </form>
          )}

          {/* REGISTER VIEW */}
          {authModalView === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('name')}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: يوسف المنصوري"
                    required
                    className="w-full ps-10 pe-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('username')}
                </label>
                <div className="relative">
                  <span className="text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2 text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yousef_dev"
                    required
                    className="w-full ps-8 pe-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yousef@example.com"
                    required
                    className="w-full ps-10 pe-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full ps-10 pe-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Interests multi-select */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t('interests')} (اختر ما يهمك):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {interestsList.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        selectedInterests.includes(interest)
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl shadow-xs transition mt-2"
              >
                {t('createAccount')}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-zinc-500">{t('alreadyHaveAccount')} </span>
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  {t('login')}
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {authModalView === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full ps-10 pe-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-xl shadow-xs transition"
              >
                {t('sendResetLink')}
              </button>

              {forgotSent && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-900/50">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{t('resetEmailSent')}</span>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  {language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{t('backToLogin')}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
