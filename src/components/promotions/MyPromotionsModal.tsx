import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  X,
  TrendingUp,
  Eye,
  MousePointerClick,
  Heart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Play,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PromotionRequest, PromotionStatus } from '../../types';

export const MyPromotionsModal: React.FC = () => {
  const {
    currentUser,
    promotions,
    isMyPromotionsOpen,
    setIsMyPromotionsOpen,
    setIsCreatePromotionOpen,
    t,
  } = useSocial();

  const [filter, setFilter] = useState<'all' | PromotionStatus>('all');

  if (!isMyPromotionsOpen) return null;

  const myPromotions = promotions.filter(
    (p) => p.authorId === currentUser?.id || p.authorName === currentUser?.name
  );

  const displayedPromos = myPromotions.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusBadge = (status: PromotionStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('statusActive')}
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('statusApproved')}
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {t('statusPending')}
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('statusRejected')}
          </span>
        );
      case 'paused':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 flex items-center gap-1">
            <Pause className="w-3.5 h-3.5" />
            {t('statusPaused')}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {t('statusCompleted')}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-3xl bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A2846]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t('myPromotions')}
              </h3>
              <p className="text-xs text-blue-400/80">
                لوحة متابعة أداء الحملات والمشاهدات والنقرات الحقيقية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsMyPromotionsOpen(false);
                setIsCreatePromotionOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>حملة جديدة</span>
            </button>
            <button
              onClick={() => setIsMyPromotionsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1A2846] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none border-b border-[#1A2846]/60">
          {(['all', 'active', 'pending', 'rejected', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                filter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#070D1E] text-zinc-400 hover:text-white border border-[#1A2846]'
              }`}
            >
              {st === 'all'
                ? 'الكل'
                : st === 'active'
                ? t('statusActive')
                : st === 'pending'
                ? t('statusPending')
                : st === 'rejected'
                ? t('statusRejected')
                : t('statusCompleted')}
            </button>
          ))}
        </div>

        {/* Campaigns List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5">
          {displayedPromos.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-zinc-300 mb-1">{t('noPromotionsYet')}</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">{t('noPromotionsDesc')}</p>
              <button
                onClick={() => {
                  setIsMyPromotionsOpen(false);
                  setIsCreatePromotionOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition"
              >
                {t('createPromotion')}
              </button>
            </div>
          ) : (
            displayedPromos.map((promo) => (
              <div
                key={promo.id}
                className="bg-[#070D1E] border border-[#1A2846] rounded-2xl p-4 sm:p-5 transition hover:border-blue-500/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {promo.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400">
                      بدأت: {promo.startDate} | المدة: {promo.durationDays} أيام | الميزانية: ${promo.budget}
                    </span>
                  </div>
                  <div>{getStatusBadge(promo.status)}</div>
                </div>

                {/* Content preview if exists */}
                {promo.postContent && (
                  <p className="text-xs text-zinc-300 bg-[#0D162B] p-2.5 rounded-xl border border-[#1A2846] mb-3 line-clamp-2">
                    {promo.postContent}
                  </p>
                )}

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#1A2846]">
                  <div className="bg-[#0D162B] p-2.5 rounded-xl border border-[#1A2846] text-center">
                    <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] mb-0.5">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t('impressions')}</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      {(promo.impressions || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#0D162B] p-2.5 rounded-xl border border-[#1A2846] text-center">
                    <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] mb-0.5">
                      <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t('clicks')}</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      {(promo.clicks || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#0D162B] p-2.5 rounded-xl border border-[#1A2846] text-center">
                    <div className="flex items-center justify-center gap-1 text-zinc-400 text-[10px] mb-0.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>{t('engagementStats')}</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      {(promo.engagement || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Rejection Reason notice if rejected */}
                {promo.status === 'rejected' && promo.rejectionReason && (
                  <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">سبب عدم الموافقة من إدارة Zorvexa:</strong>
                      <span>{promo.rejectionReason}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
