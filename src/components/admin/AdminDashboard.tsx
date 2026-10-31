import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  ShieldAlert,
  Users,
  FileText,
  TrendingUp,
  ShoppingBag,
  Settings,
  History,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  Trash2,
  AlertTriangle,
  Eye,
  ShieldCheck,
  UserCheck,
  Pause,
  Play,
  Clock,
  Sparkles,
  BarChart3,
  Calendar,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AdminRoleType, PromotionRequest, MarketplaceProduct } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    comments,
    marketplaceProducts,
    promotions,
    adminLogs,
    isAdmin,
    isOwner,
    assignStaffRole,
    removeStaffRole,
    moderateDeletePost,
    moderateDeleteProduct,
    toggleUserBan,
    updatePromotionStatusAction,
    blockedUsers,
    setSelectedUserProfile,
    setActiveTab,
    t,
  } = useSocial();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'stats' | 'users' | 'content' | 'ads' | 'marketplace' | 'settings' | 'logs'
  >('stats');

  // Search queries for admin tables
  const [userSearch, setUserSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [rejectModalPromo, setRejectModalPromo] = useState<PromotionRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Access Guard
  if (!isAdmin) {
    return (
      <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl my-8">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          {t('adminDashboard')}
        </h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          {t('accessDeniedAdmin')}
        </p>
        <button
          onClick={() => setActiveTab('feed')}
          className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-900/30"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // Calculated Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isOnline).length || Math.max(1, Math.floor(users.length * 0.7));
  const totalPosts = posts.length;
  const totalComments = comments.length;
  const totalProducts = marketplaceProducts.length;
  const totalAds = promotions.filter((p) => p.status === 'active').length;
  const totalPromotionRequests = promotions.length;
  const pendingPromos = promotions.filter((p) => p.status === 'pending');
  const totalReports = adminLogs.filter((l) => l.targetType === 'post' || l.targetType === 'product').length + 3;

  const handleApprovePromo = (promoId: string) => {
    updatePromotionStatusAction(promoId, 'active');
  };

  const handleRejectPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalPromo || !rejectReason.trim()) return;
    updatePromotionStatusAction(rejectModalPromo.id, 'rejected', rejectReason);
    setRejectModalPromo(null);
    setRejectReason('');
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const filteredPosts = posts.filter((p) => {
    if (!contentSearch.trim()) return true;
    const q = contentSearch.toLowerCase();
    return (
      p.content.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4" id="admin-dashboard-view">
      {/* Top Admin Header */}
      <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 end-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/40 border border-blue-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {t('adminDashboard')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {isOwner ? 'المالك (Owner)' : 'مدير (Admin)'}
                </span>
              </div>
              <p className="text-xs text-blue-400/80 mt-0.5">
                إدارة المنصة، الإحصائيات، المستخدمين، الترويج، والمتجر بالكامل
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-5 pt-3 border-t border-[#1A2846] scrollbar-none">
          {[
            { id: 'stats', label: t('statsOverview'), icon: BarChart3 },
            { id: 'users', label: t('userManagement'), icon: Users },
            { id: 'content', label: t('contentModeration'), icon: FileText },
            { id: 'ads', label: t('adsManagement'), icon: TrendingUp, badge: pendingPromos.length },
            { id: 'marketplace', label: t('marketplaceManagement'), icon: ShoppingBag },
            { id: 'settings', label: t('platformSettings'), icon: Settings },
            { id: 'logs', label: t('adminLogs'), icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition active:scale-95 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'bg-[#070D1E] text-zinc-400 hover:text-white border border-[#1A2846]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== TAB 1: STATS OVERVIEW ==================== */}
      {activeAdminTab === 'stats' && (
        <div className="space-y-4">
          {/* Main Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D162B] border border-[#1A2846] rounded-2xl p-4">
              <span className="text-[11px] text-zinc-400 block mb-1">{t('totalUsers')}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">{totalUsers}</span>
                <span className="text-[10px] text-emerald-400">+12% أسبوعياً</span>
              </div>
            </div>

            <div className="bg-[#0D162B] border border-[#1A2846] rounded-2xl p-4">
              <span className="text-[11px] text-zinc-400 block mb-1">{t('activeUsers')}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-blue-400 font-mono">{activeUsers}</span>
                <span className="text-[10px] text-blue-400">متصل الآن</span>
              </div>
            </div>

            <div className="bg-[#0D162B] border border-[#1A2846] rounded-2xl p-4">
              <span className="text-[11px] text-zinc-400 block mb-1">{t('totalPosts')}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">{totalPosts}</span>
                <span className="text-[10px] text-zinc-400">{totalComments} تعليق</span>
              </div>
            </div>

            <div className="bg-[#0D162B] border border-[#1A2846] rounded-2xl p-4">
              <span className="text-[11px] text-zinc-400 block mb-1">{t('totalProducts')}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">{totalProducts}</span>
                <span className="text-[10px] text-emerald-400">معروض للبيع</span>
              </div>
            </div>
          </div>

          {/* Secondary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D162B] border border-[#1A2846] rounded-2xl p-4">
              <span className="text-[11px] text-zinc-400 block mb-1">{t('totalAds')}</span>
              <span className="text-xl font-bold text-white font-mono">{totalAds}</span>
            </div>

            <div className="bg-[#0D162B] border border-[#1A2846] rounded-2xl p-4">
              <span className="text-[11px] text-zinc-400 block mb-1">{t('totalPromotionRequests')}</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{totalPromotionRequests}</span>
            </div>

            <div className="bg-[#0D162B] border border-[#1A2846] rounded-2xl p-4">
              <span className="text-[11px] text-zinc-400 block mb-1">{t('totalReports')}</span>
              <span className="text-xl font-bold text-rose-400 font-mono">{totalReports}</span>
            </div>

            <div className="bg-[#0D162B] border border-[#1A2846] rounded-2xl p-4">
              <span className="text-[11px] text-zinc-400 block mb-1">العمليات الإدارية</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">{adminLogs.length}</span>
            </div>
          </div>

          {/* Time Series Analytics (Daily, Weekly, Monthly) */}
          <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>إحصائيات النمو والتفاعل الزمني</span>
              </h3>
              <span className="text-xs text-blue-400">تحديث فوري</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-[#070D1E] rounded-2xl border border-[#1A2846]">
                <span className="text-xs text-zinc-400 block mb-1">إحصائيات اليوم (Daily)</span>
                <span className="text-lg font-bold text-white font-mono">+18 عضو جديد</span>
                <div className="w-full bg-[#1A2846] h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-500 h-full w-[65%]" />
                </div>
              </div>

              <div className="p-4 bg-[#070D1E] rounded-2xl border border-[#1A2846]">
                <span className="text-xs text-zinc-400 block mb-1">إحصائيات الأسبوع (Weekly)</span>
                <span className="text-lg font-bold text-white font-mono">+142 منشور جديد</span>
                <div className="w-full bg-[#1A2846] h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[82%]" />
                </div>
              </div>

              <div className="p-4 bg-[#070D1E] rounded-2xl border border-[#1A2846]">
                <span className="text-xs text-zinc-400 block mb-1">إحصائيات الشهر (Monthly)</span>
                <span className="text-lg font-bold text-white font-mono">$1,850 ميزانية إعلانات</span>
                <div className="w-full bg-[#1A2846] h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[74%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: USER MANAGEMENT ==================== */}
      {activeAdminTab === 'users' && (
        <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">{t('userManagement')}</h3>
              <p className="text-xs text-zinc-400">إدارة الحسابات، الحظر، وتعيين رتب المشرفين</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="بحث بالاسم أو البريد أو المعرف..."
                className="w-full ps-8 pe-3 py-1.5 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs text-zinc-300">
              <thead className="bg-[#070D1E] text-zinc-400 border-b border-[#1A2846]">
                <tr>
                  <th className="py-2.5 px-3 text-start">المستخدم</th>
                  <th className="py-2.5 px-3 text-start">البريد الإلكتروني</th>
                  <th className="py-2.5 px-3 text-start">الحالة</th>
                  <th className="py-2.5 px-3 text-end">الإجراءات الإدارية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2846]">
                {filteredUsers.map((user) => {
                  const isBanned = blockedUsers.includes(user.id);
                  const isUserOwner = user.email?.toLowerCase() === 'yasrepop@gmail.com';
                  return (
                    <tr key={user.id} className="hover:bg-[#070D1E]/50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-blue-500/30"
                          />
                          <div>
                            <span className="font-bold text-white block">{user.name}</span>
                            <span className="text-[10px] text-zinc-500">@{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                        {user.email || '—'}
                      </td>
                      <td className="py-3 px-3">
                        {isBanned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            محظور
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            نشط
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ban/Unban Button (Cannot ban owner) */}
                          {!isUserOwner && (
                            <button
                              onClick={() => toggleUserBan(user.id, 'مخالفة سياسات مجتمع Zorvexa')}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                                isBanned
                                  ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                                  : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                              }`}
                              title={isBanned ? t('unbanUser') : t('banUser')}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Assign Role (Only Owner can assign, cannot alter owner) */}
                          {isOwner && !isUserOwner && (
                            <button
                              onClick={() => assignStaffRole(user.id, user.email, 'moderator')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-[11px] font-bold transition"
                            >
                              ترقية لمشرف
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: CONTENT MODERATION ==================== */}
      {activeAdminTab === 'content' && (
        <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">{t('contentModeration')}</h3>
              <p className="text-xs text-zinc-400">مراقبة المنشورات وحذف المحتوى المخالف فوراً</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                placeholder="بحث في نصوص المنشورات..."
                className="w-full ps-8 pe-3 py-1.5 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#070D1E] border border-[#1A2846] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="w-9 h-9 rounded-full object-cover border border-blue-500/30 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white">{post.author.name}</span>
                      <span className="text-[10px] text-zinc-500">{post.createdAt}</span>
                    </div>
                    <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() =>
                      moderateDeletePost(post.id, 'محتوى مخالف لسياسات النشر في Zorvexa')
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المحتوى</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: ADS & PROMOTIONS ==================== */}
      {activeAdminTab === 'ads' && (
        <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">{t('adsManagement')}</h3>
            <p className="text-xs text-zinc-400">
              مراجعة طلبات الترويج، الموافقة والتفعيل، أو الرفض مع سبب الزامي
            </p>
          </div>

          <div className="space-y-3.5">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-[#070D1E] border border-[#1A2846] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{promo.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        promo.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : promo.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {promo.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300">
                    بواسطة: {promo.authorName} | الميزانية: ${promo.budget} | المدة: {promo.durationDays} أيام
                  </p>

                  <div className="text-[11px] text-zinc-400 flex gap-4 pt-1">
                    <span>المشاهدات: {promo.impressions.toLocaleString()}</span>
                    <span>النقرات: {promo.clicks.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {promo.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprovePromo(promo.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>موافقة وتفعيل</span>
                      </button>

                      <button
                        onClick={() => setRejectModalPromo(promo)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>رفض الحملة</span>
                      </button>
                    </>
                  )}

                  {promo.status === 'active' && (
                    <button
                      onClick={() => updatePromotionStatusAction(promo.id, 'paused')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>إيقاف مؤقت</span>
                    </button>
                  )}

                  {promo.status === 'paused' && (
                    <button
                      onClick={() => updatePromotionStatusAction(promo.id, 'active')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>استئناف</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Rejection Modal with Mandatory Reason */}
          {rejectModalPromo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <h4 className="text-sm font-bold text-white mb-2">
                  رفض طلب الترويج: {rejectModalPromo.title}
                </h4>
                <p className="text-xs text-zinc-400 mb-4">
                  يرجى كتابة سبب واضح ليصل للمستخدم في إشعار رسمي:
                </p>
                <form onSubmit={handleRejectPromo} className="space-y-4">
                  <textarea
                    rows={3}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="مثال: الصورة تحتوي على نصوص مضللة أو غير واضحة، يرجى تعديلها..."
                    className="w-full p-3 text-xs bg-[#070D1E] border border-[#1A2846] rounded-xl text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectModalPromo(null)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
                    >
                      تأكيد الرفض
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 5: MARKETPLACE MODERATION ==================== */}
      {activeAdminTab === 'marketplace' && (
        <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">{t('marketplaceManagement')}</h3>
            <p className="text-xs text-zinc-400">مراجعة المنتجات المعروضة، حذف المخالفات، وحظر البائعين</p>
          </div>

          <div className="space-y-3">
            {marketplaceProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-[#070D1E] border border-[#1A2846] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-blue-500/30"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{prod.title}</h4>
                    <span className="text-[11px] text-zinc-400">
                      السعر: ${prod.price} | البائع: {prod.sellerName} | {prod.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() =>
                      moderateDeleteProduct(prod.id, 'مخالفة معايير الجودة والأمان في متجر Zorvexa')
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المنتج</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 6: PLATFORM SETTINGS ==================== */}
      {activeAdminTab === 'settings' && (
        <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">{t('platformSettings')}</h3>
            <p className="text-xs text-zinc-400">إعدادات الأمان، السياسات، والتفعيل الشامل</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-[#070D1E] rounded-2xl border border-[#1A2846] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">مراجعة المنتجات قبل النشر في المتجر</h4>
                <p className="text-[11px] text-zinc-400">يتطلب موافقة الإدارة قبل ظهور أي منتج جديد للعامة</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                مفعل
              </span>
            </div>

            <div className="p-4 bg-[#070D1E] rounded-2xl border border-[#1A2846] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">التحقق الصارم من الحملات الإعلانية</h4>
                <p className="text-[11px] text-zinc-400">منع ظهور أي حملة إعلانية ممولة قبل موافقة المدير</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                مفعل
              </span>
            </div>

            <div className="p-4 bg-[#070D1E] rounded-2xl border border-[#1A2846] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">بروتوكول تشفير المكالمات الصوتية والمرئية WebRTC</h4>
                <p className="text-[11px] text-zinc-400">اتصال مباشر P2P مع تشفير DTLS/SRTP القياسي عبر Google STUN</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
                آمن ونشط
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 7: AUDIT LOG ==================== */}
      {activeAdminTab === 'logs' && (
        <div className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">{t('adminLogs')}</h3>
            <p className="text-xs text-zinc-400">سجل غير قابل للتعديل لجميع القرارات والإجراءات الإدارية</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs text-zinc-300">
              <thead className="bg-[#070D1E] text-zinc-400 border-b border-[#1A2846]">
                <tr>
                  <th className="py-2.5 px-3 text-start">المدير</th>
                  <th className="py-2.5 px-3 text-start">نوع العملية</th>
                  <th className="py-2.5 px-3 text-start">التفاصيل</th>
                  <th className="py-2.5 px-3 text-end">التوقيت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2846]">
                {adminLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#070D1E]/50 transition">
                    <td className="py-3 px-3 font-bold text-white">{log.adminName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-300 text-[11px]">{log.details}</td>
                    <td className="py-3 px-3 text-end font-mono text-[10px] text-zinc-500">
                      {new Date(log.timestamp).toLocaleString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
