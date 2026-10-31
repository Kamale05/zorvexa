import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Check,
  Smartphone,
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
    showToast,
    t,
  } = useSocial();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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
    if (!email.trim() || !password.trim()) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    login(email, password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }
    register({
      name,
      username: username || email.split('@')[0],
      email,
      password,
      interests: selectedInterests,
    });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('يرجى كتابة البريد الإلكتروني أولاً', 'error');
      return;
    }
    setResetSent(true);
    showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!');
  };

  const handleGoogleSocial = () => {
    // Quick login as demo user or first user for instant testing
    const demoUser = users.find((u) => u.email === 'yasser@zorvexa.app') || users[0];
    if (demoUser) {
      switchDemoUser(demoUser.id);
      setIsAuthModalOpen(false);
      showToast(`مرحباً بك عبر Google، ${demoUser.name}!`);
    } else {
      showToast('جاري الاتصال بـ Google...');
    }
  };

  const handleFacebookSocial = () => {
    const demoUser = users.find((u) => u.email === 'lina@zorvexa.app') || users[1] || users[0];
    if (demoUser) {
      switchDemoUser(demoUser.id);
      setIsAuthModalOpen(false);
      showToast(`مرحباً بك عبر Facebook، ${demoUser.name}!`);
    } else {
      showToast('جاري الاتصال بـ Facebook...');
    }
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Box matching Screen 2 */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-sm sm:max-w-md bg-[#080E1E] dark:bg-[#070D1E] text-white border border-[#1A2846] rounded-3xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 end-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <Logo size="lg" showText={true} />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {isForgotPassword
                ? 'استعادة كلمة المرور'
                : authModalView === 'login'
                ? 'مرحباً بك مجدداً'
                : 'إنشاء حساب جديد في Zorvexa'}
            </p>
          </div>

          {!isForgotPassword ? (
            <>
              {/* Segmented Pills: [تسجيل الدخول] / [إنشاء حساب] */}
              <div className="flex bg-[#0B1428] p-1 rounded-2xl border border-[#1C2C4E] mb-6">
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                    authModalView === 'login'
                      ? 'bg-blue-600 text-white shadow-[0_2px_12px_rgba(37,99,235,0.45)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModalView('register')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                    authModalView === 'register'
                      ? 'bg-blue-600 text-white shadow-[0_2px_12px_rgba(37,99,235,0.45)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  إنشاء حساب
                </button>
              </div>

              {/* Login Form */}
              {authModalView === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email / Phone Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني أو رقم الهاتف"
                      className="w-full ps-10 pe-4 py-3 rounded-2xl bg-[#0D162B] border border-[#1A2846] text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="كلمة المرور"
                      className="w-full ps-10 pe-11 py-3 rounded-2xl bg-[#0D162B] border border-[#1A2846] text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Remember me & Forgot Password Row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#0D162B] border-[#1A2846] text-blue-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>تذكرني</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_4px_18px_rgba(37,99,235,0.45)] transition active:scale-98"
                  >
                    تسجيل الدخول
                  </button>

                  {/* Divider "أو" */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-[#1A2846] w-full" />
                    <span className="bg-[#080E1E] px-3 text-xs text-slate-400">أو</span>
                  </div>

                  {/* Social Buttons */}
                  <div className="space-y-2.5">
                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={handleGoogleSocial}
                      className="w-full py-2.5 px-4 rounded-2xl bg-[#0D162B] hover:bg-[#111C36] border border-[#1A2846] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition active:scale-98"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>متابعة باستخدام Google</span>
                    </button>

                    {/* Facebook Button */}
                    <button
                      type="button"
                      onClick={handleFacebookSocial}
                      className="w-full py-2.5 px-4 rounded-2xl bg-[#0D162B] hover:bg-[#111C36] border border-[#1A2846] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition active:scale-98"
                    >
                      <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>متابعة باستخدام Facebook</span>
                    </button>
                  </div>

                  {/* Bottom Toggle Link */}
                  <div className="text-center pt-3">
                    <button
                      type="button"
                      onClick={() => setAuthModalView('register')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                    >
                      ليس لديك حساب؟ إنشاء حساب جديد
                    </button>
                  </div>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-[#0D162B] border border-[#1A2846] text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="text-xs font-bold text-slate-500">@</span>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="اسم المستخدم (اختياري)"
                      className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-[#0D162B] border border-[#1A2846] text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-[#0D162B] border border-[#1A2846] text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="كلمة المرور (6 أحرف فأكثر)"
                      className="w-full ps-10 pe-11 py-2.5 rounded-2xl bg-[#0D162B] border border-[#1A2846] text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-slate-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Interests Selection */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">
                      اختر اهتماماتك المفضلة:
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {interestsList.map((interest) => {
                        const isSelected = selectedInterests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`text-[10px] px-2.5 py-1 rounded-xl transition ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-[#0D162B] text-slate-400 hover:text-white border border-[#1A2846]'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Register Submit */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-[0_4px_18px_rgba(37,99,235,0.45)] transition active:scale-98"
                  >
                    إنشاء الحساب
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthModalView('login')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                    >
                      لديك حساب بالفعل؟ تسجيل الدخول
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <p className="text-xs text-slate-400 text-center">
                أدخل عنوان بريدك الإلكتروني المسجل وسنرسل لك رابطاً لاستعادة كلمة المرور الخاصة بك.
              </p>

              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="w-full ps-10 pe-4 py-3 rounded-2xl bg-[#0D162B] border border-[#1A2846] text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition"
              >
                {resetSent ? 'تم الإرسال - إعادة الإرسال' : 'إرسال رابط الاستعادة'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
