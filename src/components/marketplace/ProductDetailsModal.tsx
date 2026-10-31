import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  Bookmark,
  Share2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { MarketplaceProduct } from '../../types';

interface ProductDetailsModalProps {
  product: MarketplaceProduct | null;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
}) => {
  const {
    currentUser,
    users,
    startOrOpenConversationWith,
    toggleSaveProduct,
    reportProduct,
    showToast,
    t,
  } = useSocial();

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');

  if (!product) return null;

  const seller = users.find((u) => u.id === product.sellerId) || {
    id: product.sellerId,
    name: product.sellerName,
    username: 'seller',
    email: '',
    avatarUrl: product.sellerAvatar,
    bio: 'بائع معتمد في متجر Zorvexa',
    joinedDate: '2024',
    followersCount: 120,
    followingCount: 30,
    interests: [],
  };

  const handleContactSeller = () => {
    startOrOpenConversationWith(seller);
    onClose();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `تفقد هذا الإعلان المميز على متجر Zorvexa: ${product.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط المنتج بنجاح!', 'success');
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    await reportProduct(product.id, reportReason);
    setShowReportDialog(false);
    setReportReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-3xl bg-[#0D162B] border border-[#1A2846] rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col"
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Image Gallery */}
          <div className="relative w-full h-72 sm:h-96 bg-zinc-950 flex items-center justify-center overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-zinc-600 flex flex-col items-center">
                <Tag className="w-12 h-12 mb-2" />
                <span>لا توجد صور متوفرة</span>
              </div>
            )}

            {/* Gallery Navigation Arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute start-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute end-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        activeImageIndex === idx
                          ? 'bg-blue-500 scale-125'
                          : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details Body */}
          <div className="p-6 space-y-6">
            {/* Header: Price & Title */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    {product.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {product.condition === 'new' ? t('conditionNew') : t('conditionUsed')}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {product.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{product.location}</span>
                </div>
              </div>

              <div className="text-start sm:text-end">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
                  ${product.price.toLocaleString()}
                </span>
                <span className="block text-[11px] text-zinc-400 uppercase">
                  {product.currency}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#070D1E] p-4 rounded-2xl border border-[#1A2846]">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                {t('productDescription')}
              </h4>
              <p className="text-sm text-zinc-200 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Seller Information Card */}
            <div className="bg-[#070D1E] p-4 rounded-2xl border border-[#1A2846] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={product.sellerAvatar}
                  alt={product.sellerName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/40"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">
                      {product.sellerName}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs text-zinc-400">
                    بائع معتمد على متجر Zorvexa
                  </span>
                </div>
              </div>

              {product.contactPhone && (
                <a
                  href={`tel:${product.contactPhone}`}
                  className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition"
                  title="اتصال هاتف"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Report Dialog if open */}
            {showReportDialog && (
              <form onSubmit={handleSendReport} className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-3">
                <h5 className="text-xs font-bold text-rose-300">
                  الإبلاغ عن محتوى أو منتج مخالف
                </h5>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="وضح سبب البلاغ (مثال: محتوى مضلل، منتج مقلد، رقم هاتف احتيالي...)"
                  className="w-full p-2.5 text-xs bg-[#070D1E] border border-rose-500/40 rounded-xl text-white placeholder-zinc-500 focus:outline-none"
                  rows={2}
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportDialog(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    إرسال البلاغ للإدارة
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-5 bg-[#0D162B] border-t border-[#1A2846] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveProduct(product.id)}
              className={`p-2.5 rounded-xl transition ${
                product.isSaved
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#070D1E] text-zinc-400 hover:text-white border border-[#1A2846]'
              }`}
              title={product.isSaved ? t('savedProduct') : t('saveProduct')}
            >
              <Bookmark className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-[#070D1E] text-zinc-400 hover:text-white border border-[#1A2846] transition"
              title="مشاركة الإعلان"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowReportDialog(!showReportDialog)}
              className="p-2.5 rounded-xl bg-[#070D1E] text-zinc-400 hover:text-rose-400 border border-[#1A2846] transition"
              title={t('reportProduct')}
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleContactSeller}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 active:scale-95 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('contactSeller')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
