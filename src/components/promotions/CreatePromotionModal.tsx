import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  X,
  Sparkles,
  TrendingUp,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../../types';

export const CreatePromotionModal: React.FC = () => {
  const {
    currentUser,
    posts,
    postToPromote,
    isCreatePromotionOpen,
    setIsCreatePromotionOpen,
    setPostToPromote,
    createPromotion,
    t,
  } = useSocial();

  const userPosts = posts.filter((p) => p.authorId === currentUser?.id);
  const [selectedPostId, setSelectedPostId] = useState<string>(
    postToPromote?.id || (userPosts[0]?.id || '')
  );

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('المهتمون بالتقنية، رواد الأعمال، والمصممون');
  const [targetLocation, setTargetLocation] = useState<string>('السعودية، الإمارات، الخليج العربي');
  const [ageRange, setAgeRange] = useState<string>('20 - 45');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [budget, setBudget] = useState<number>(100);
  const [objective, setObjective] = useState<'reach' | 'traffic' | 'engagement' | 'sales'>('reach');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreatePromotionOpen) return null;

  const activePost = posts.find((p) => p.id === (postToPromote?.id || selectedPostId)) || userPosts[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activePost) return;

    setIsSubmitting(true);
    try {
      await createPromotion({
        postId: activePost.id,
        postContent: activePost.content,
        postMediaUrl: activePost.media?.[0]?.url,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatarUrl,
        title: title || `حملة ترويج: ${activePost.content.slice(0, 30)}...`,
        description,
        targetAudience,
        targetLocation,
        ageRange,
        startDate: new Date().toISOString().split('T')[0],
        durationDays,
        budget,
        objective,
      });
      setIsCreatePromotionOpen(false);
      setPostToPromote(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A2846] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t('createPromotion')}
              </h3>
              <p className="text-xs text-blue-400/80 font-medium">
                وصول حقيقي وموجه لآلاف المهتمين في Zorvexa
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCreatePromotionOpen(false);
              setPostToPromote(null);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1A2846] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Post Selection & Preview */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              المنشور المراد ترويجه
            </label>
            {userPosts.length > 0 ? (
              <div className="bg-[#070D1E] border border-[#1A2846] rounded-2xl p-3.5 flex items-start gap-3">
                {activePost?.media?.[0]?.url ? (
                  <img
                    src={activePost.media[0].url}
                    alt="media"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-blue-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-950/60 border border-blue-900/40 flex items-center justify-center text-blue-400 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold mb-1 inline-block">
                    معاينة الإعلان الممول
                  </span>
                  <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                    {activePost?.content || 'منشور بدون نص'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>يرجى نشر منشور أولاً لتتمكن من ترويجه.</span>
              </div>
            )}
          </div>

          {/* Campaign Title & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t('campaignTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: حملة إطلاق المتجر أو المنشور"
                className="w-full px-3.5 py-2.5 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t('campaignObjective')}
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="reach">{t('objectiveReach')}</option>
                <option value="traffic">{t('objectiveTraffic')}</option>
                <option value="engagement">{t('objectiveEngagement')}</option>
                <option value="sales">{t('objectiveSales')}</option>
              </select>
            </div>
          </div>

          {/* Targeting: Audience, Location, Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('targetAudience')}</span>
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('targetLocation')}</span>
              </label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>{t('ageRange')}</span>
              </label>
              <input
                type="text"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Duration & Budget Slider */}
          <div className="p-4 bg-[#070D1E] border border-[#1A2846] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{t('durationDays')}: {durationDays} أيام</span>
              </span>
              <div className="flex gap-1.5">
                {[3, 7, 14, 30].map((days) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => setDurationDays(days)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      durationDays === days
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#0D162B] text-zinc-400 hover:text-white border border-[#1A2846]'
                    }`}
                  >
                    {days}د
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('proposedBudget')}</span>
                </span>
                <span className="text-emerald-400 font-bold text-sm font-mono">
                  ${budget} USD
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>$20 (اقتصادي)</span>
                <span>متوسط الوصول المتوقع: {(budget * 110).toLocaleString()} مستخدم</span>
                <span>$1000 (أقصى وصول)</span>
              </div>
            </div>
          </div>

          {/* Security & Moderation Notice */}
          <div className="text-[11px] text-zinc-400 flex items-start gap-2 bg-blue-950/20 border border-blue-900/30 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              سيتم إرسال الطلب إلى لوحة تدقيق Zorvexa لمراجعة الإعلان والموافقة عليه للتأكد من موافقته للسياسات وتفعيله مباشرة في خلاصة المنشورات.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreatePromotionOpen(false);
                setPostToPromote(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !activePost}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 active:scale-95 transition disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإرسال...' : t('submitPromotion')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
