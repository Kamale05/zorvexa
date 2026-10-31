import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Share2,
  Copy,
  Check,
  QrCode,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isInstalled,
}) => {
  const { language } = useSocial();
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'instant' | 'apk'>('instant');
  const [isCopied, setIsCopied] = useState(false);

  // App direct URLs
  const directAppUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://ais-pre-bmhet5l4yiyfladqihb2mj-526467550388.europe-west2.run.app';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    directAppUrl
  )}&bgcolor=18181b&color=ffffff&margin=10`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(directAppUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Zorvexa — تطبيق التواصل الاجتماعي',
          text: 'قم بتثبيت تطبيق Zorvexa على هاتفك الأندرويد واستمتع بتجربة سريعة ومتكاملة!',
          url: directAppUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 max-h-[90vh] flex flex-col"
          id="android-install-modal"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 end-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition z-10"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          {/* App Header & Branding */}
          <div className="flex items-center gap-3.5 mb-5 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500 p-0.5 shadow-lg shadow-violet-500/20 shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Z
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  {isAr ? 'تثبيت Zorvexa على Android' : 'Install Zorvexa on Android'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isAr ? 'تطبيق هاتف رسمي متكامل يدعم التصفح السريع والعمل دون اتصال' : 'Official Android app with fast standalone & offline cache'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 p-1 mb-5 border border-zinc-200/80 dark:border-zinc-800/80 shrink-0">
            <button
              onClick={() => setActiveTab('instant')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'instant'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-violet-500" />
              <span>{isAr ? 'التثبيت الفوري للهاتف' : 'Instant Phone Install'}</span>
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                activeTab === 'apk'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-4 h-4 text-fuchsia-500" />
              <span>{isAr ? 'حزمة APK الأصلية' : 'Native APK Package'}</span>
            </button>
          </div>

          {/* Tab 1: Instant Install (Web APK / PWA) */}
          <div className="overflow-y-auto flex-1 pe-1 space-y-4">
            {activeTab === 'instant' && (
              <>
                {/* Highlights */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">{isAr ? 'تثبيت بنقرة واحدة' : '1-Click Install'}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                        {isAr ? 'بدون الحاجة لمتجر تطبيقات' : 'No store account needed'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">{isAr ? 'دعم كامل دون اتصال' : 'Offline Support'}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                        {isAr ? 'حفظ البيانات محلياً' : 'IndexedDB persistence'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                {isInstalled ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-medium">
                      {isAr ? 'تطبيق Zorvexa مثبت ويعمل بالفعل على هذا الجهاز!' : 'Zorvexa is installed and ready on this device!'}
                    </p>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={onInstall}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:opacity-95 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-violet-500/25 transition active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-sm">{isAr ? 'تثبيت التطبيق على هاتفك الآن' : 'Install Zorvexa App Now'}</span>
                  </button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300">
                    <div className="flex items-center gap-2 mb-2 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      <span>{isAr ? 'خطوات التثبيت المباشر من متصفح الهاتف:' : 'Instant Browser Install Steps:'}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 ps-1">
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                        <span>{isAr ? 'افتح قائمة المتصفح (⋮) في أعلى شاشة الهاتف' : 'Tap the browser menu (⋮) in Chrome/Samsung'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                        <span>{isAr ? 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"' : 'Select "Install app" or "Add to Home Screen"'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                        <span>{isAr ? 'تظهر أيقونة Zorvexa فوراً في قائمة تطبيقاتك' : 'Zorvexa icon appears in your phone app drawer'}</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Direct Link Sharing Section */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {isAr ? 'رابط التثبيت المباشر للهاتف:' : 'Direct Mobile Install Link:'}
                    </span>
                    <button
                      onClick={handleShare}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مشاركة عبر الهاتف' : 'Share'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <input
                      type="text"
                      readOnly
                      value={directAppUrl}
                      className="flex-1 bg-transparent text-xs text-zinc-600 dark:text-zinc-400 outline-none select-all font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5 shrink-0 hover:opacity-90 transition active:scale-95"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isAr ? 'نسخ' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Tab 2: Native APK & Gradle Build System */}
            {activeTab === 'apk' && (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  {/* QR Code */}
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 p-2 shrink-0 flex items-center justify-center">
                    <img
                      src={qrImageUrl}
                      alt="Zorvexa Mobile QR"
                      className="w-full h-full object-contain rounded-xl"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-1.5 text-center sm:text-start flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                      <QrCode className="w-4 h-4" />
                      <span>{isAr ? 'امسح بالهاتف للتحميل المباشر' : 'Scan with phone camera'}</span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {isAr ? 'مشروع أندرويد الأصلي جاهز بالكامل' : 'Native Android Project Ready'}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {isAr
                        ? 'تم تكوين مشروع Capacitor Android الرسمي بالمعرف app.zorvexa.social مع كامل الصلاحيات وشاشات الإقلاع.'
                        : 'Capacitor Android package configured with app.zorvexa.social, full permissions & splash screen.'}
                    </p>
                  </div>
                </div>

                {/* Automated GitHub CI/CD Build */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {isAr ? 'بناء تلقائي لحزمة APK عبر GitHub Actions' : 'Automated Cloud APK Build'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {isAr
                      ? 'تم تضمين ملف سير العمل .github/workflows/build-apk.yml لتجميع ملف app-debug.apk وتصديره للتحميل المباشر فور رفع الكود.'
                      : 'Workflow .github/workflows/build-apk.yml compiles and exports app-debug.apk directly.'}
                  </p>
                </div>

                {/* Local Terminal Build Instructions */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-zinc-400 pb-1 border-b border-zinc-800/80">
                    <div className="flex items-center gap-1.5 font-sans font-semibold text-xs">
                      <Terminal className="w-3.5 h-3.5 text-violet-400" />
                      <span>{isAr ? 'أوامر بناء حزمة APK محلياً:' : 'Local APK Build Commands:'}</span>
                    </div>
                  </div>
                  <p className="text-emerald-400"># 1. تزامن الأصول المبنية</p>
                  <p className="text-zinc-100 bg-zinc-900 px-2.5 py-1.5 rounded-lg select-all">
                    npm run build && npx cap sync android
                  </p>
                  <p className="text-emerald-400"># 2. تجميع ملف APK للأندرويد</p>
                  <p className="text-zinc-100 bg-zinc-900 px-2.5 py-1.5 rounded-lg select-all">
                    cd android && ./gradlew assembleDebug
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 mt-4 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-zinc-400 font-medium">
              Zorvexa • Android Ready
            </span>
            <button
              onClick={onClose}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition font-bold px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {isAr ? 'إغلاق النافذة' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
