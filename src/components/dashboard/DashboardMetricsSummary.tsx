import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Users,
  Share2,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  Calendar,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Flame,
  Layers,
  DollarSign,
} from 'lucide-react';

export const DashboardMetricsSummary: React.FC = () => {
  const { tasks, clients, contentPosts, language, setActiveTab } = useApp();

  const [isFetching, setIsFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState<string>(() => {
    return new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });
  const [showPostsDrawer, setShowPostsDrawer] = useState(false);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');

  // Month determination: current month in 2026-10 format
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1;
  const currentMonthPrefix = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
  const currentMonthName = today.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  // 1. Metric: Total Active Tasks
  const activeTasks = tasks.filter(
    (t) => t.status !== 'done' && t.status !== 'client_delivered'
  );
  const inProgressTasks = activeTasks.filter(
    (t) => t.status === 'in_progress' || t.status === 'changes_requested'
  );
  const inReviewTasks = activeTasks.filter((t) => t.status === 'review');
  const todoTasks = activeTasks.filter((t) => t.status === 'todo');
  const urgentTasks = activeTasks.filter(
    (t) => t.priority === 'urgent' || t.priority === 'high'
  );
  const completedTasksCount = tasks.filter(
    (t) => t.status === 'done' || t.status === 'client_delivered'
  ).length;

  // 2. Metric: Client Count
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'active');
  const negotiationClients = clients.filter((c) => c.status === 'negotiation');
  const leadClients = clients.filter((c) => c.status === 'lead');
  const totalMonthlyRetainer = activeClients.reduce(
    (sum, c) => sum + (c.monthlyRetainer || 0),
    0
  );

  // 3. Metric: Upcoming Social Media Posts for the Current Month
  const currentMonthPosts = contentPosts.filter((post) => {
    // Check if post belongs to current month (e.g. 2026-10)
    return post.scheduledDate && post.scheduledDate.startsWith(currentMonthPrefix);
  });

  // Upcoming in the current month: not yet published or scheduled/approved/review
  const upcomingMonthPosts = currentMonthPosts.filter(
    (post) => post.status !== 'published'
  );
  const approvedUpcomingPosts = upcomingMonthPosts.filter(
    (p) => p.status === 'approved' || p.status === 'scheduled'
  );
  const reviewUpcomingPosts = upcomingMonthPosts.filter(
    (p) => p.status === 'review'
  );

  // Filtered upcoming posts list for interactive preview
  const filteredUpcomingPosts = upcomingMonthPosts.filter((post) => {
    if (selectedPlatformFilter === 'all') return true;
    return post.platform.toLowerCase() === selectedPlatformFilter.toLowerCase();
  });

  // Fetch / Sync action handler
  const handleFetchMetrics = async () => {
    setIsFetching(true);
    setLastFetched(
      new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
    setIsFetching(false);
  };

  return (
    <div className="rounded-2xl border border-[#BDAF9C]/40 bg-[#FAF7F2] p-5 shadow-xs space-y-4">
      {/* Header Bar with Live Fetch Status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#BDAF9C]/25 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#4C5540]/10 px-2 py-0.5 text-[11px] font-bold text-[#4C5540] border border-[#4C5540]/20 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#4C5540]" />
              {currentMonthName}
            </span>
            <span className="text-xs text-[#24291F]/60">
              {language === 'ar' ? 'مزامنة حية ومؤشرات فورية' : 'Live Real-Time Indicators'}
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-[#24291F] mt-1 tracking-tight">
            {language === 'ar'
              ? 'ملخص المؤشرات التشغيلية للوكالة'
              : 'Agency Operational Metrics Summary'}
          </h2>
          <p className="text-xs text-[#4C5540]/85 mt-0.5">
            {language === 'ar'
              ? 'متابعة شاملة للمهام النشطة، إحصائيات العملاء، وجدول منشورات السوشيال للشهر الحالي'
              : 'Comprehensive tracking of active tasks, client roster, and current month upcoming social posts'}
          </p>
        </div>

        {/* Live Fetch Button & Last Synced Timestamp */}
        <div className="flex items-center gap-3">
          <div className="text-right sm:text-left text-[11px] text-[#4C5540]/80">
            <span className="text-slate-400">
              {language === 'ar' ? 'آخر جلب:' : 'Last fetched:'}{' '}
            </span>
            <span className="font-mono font-semibold text-[#24291F] tabular-nums">
              {lastFetched}
            </span>
          </div>

          <button
            onClick={handleFetchMetrics}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-xl border border-[#4C5540]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#4C5540] hover:bg-[#FAF7F2] transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            title={language === 'ar' ? 'جلب أحدث المؤشرات' : 'Fetch latest metrics'}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-[#4C5540] ${isFetching ? 'animate-spin' : ''}`}
            />
            <span>{isFetching ? (language === 'ar' ? 'جاري الجلب...' : 'Fetching...') : (language === 'ar' ? 'تحديث البيانات' : 'Fetch Metrics')}</span>
          </button>
        </div>
      </div>

      {/* The 3 Core Operational Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Total Active Tasks */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-[#8A927D] hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-[#4C5540]/10 p-2 text-[#4C5540]">
              <CheckSquare className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {inProgressTasks.length} {language === 'ar' ? 'جاري تنفيذه' : 'in progress'}
            </span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500">
              {language === 'ar' ? 'إجمالي المهام النشطة' : 'Total Active Tasks'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-[#24291F] font-mono tabular-nums">
                {activeTasks.length}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {language === 'ar' ? `من أصل ${tasks.length} مهمة` : `of ${tasks.length} total`}
              </span>
            </div>

            {/* Breakdown Sub-metrics */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="rounded-lg bg-slate-50 p-1.5">
                <span className="text-slate-400 block">{language === 'ar' ? 'مراجعة' : 'Review'}</span>
                <span className="font-bold text-slate-800 font-mono tabular-nums">
                  {inReviewTasks.length}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-1.5">
                <span className="text-slate-400 block">{language === 'ar' ? 'بالانتظار' : 'To Do'}</span>
                <span className="font-bold text-slate-800 font-mono tabular-nums">
                  {todoTasks.length}
                </span>
              </div>
              <div className="rounded-lg bg-rose-50 p-1.5 border border-rose-100">
                <span className="text-rose-600 font-bold block flex items-center justify-center gap-0.5">
                  <Flame className="h-2.5 w-2.5" />
                  {language === 'ar' ? 'عاجلة' : 'Urgent'}
                </span>
                <span className="font-black text-rose-700 font-mono tabular-nums">
                  {urgentTasks.length}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400">
                {completedTasksCount} {language === 'ar' ? 'مهمة منجزة' : 'done'}
              </span>
              <button
                onClick={() => setActiveTab('tasks')}
                className="font-bold text-[#4C5540] hover:underline flex items-center gap-0.5 cursor-pointer text-xs"
              >
                {language === 'ar' ? 'لوحة المهام' : 'Tasks Board'}
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Clients & Retainers */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-[#8A927D] hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-teal-50 p-2 text-teal-700">
              <Users className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {activeClients.length} {language === 'ar' ? 'تعاقد مستمر' : 'active retainers'}
            </span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500">
              {language === 'ar' ? 'إجمالي عدد العملاء' : 'Total Client Count'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-[#24291F] font-mono tabular-nums">
                {totalClients}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {language === 'ar' ? 'عميل مسجل' : 'clients'}
              </span>
            </div>

            {/* Breakdown Sub-metrics */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-lg bg-slate-50 p-1.5 flex items-center justify-between">
                <span className="text-slate-500">{language === 'ar' ? 'قيد التفاوض / ليدز' : 'Negotiation / Leads'}</span>
                <span className="font-bold text-slate-800 font-mono tabular-nums">
                  {negotiationClients.length + leadClients.length}
                </span>
              </div>
              <div className="rounded-lg bg-emerald-50/60 p-1.5 flex items-center justify-between border border-emerald-100">
                <span className="text-emerald-700 font-medium">{language === 'ar' ? 'عوائد شهرية MRR' : 'Monthly Retainer'}</span>
                <span className="font-bold text-emerald-800 font-mono tabular-nums">
                  {totalMonthlyRetainer.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'عقود تسويق وتطوير' : 'Retainers & Campaigns'}
              </span>
              <button
                onClick={() => setActiveTab('clients')}
                className="font-bold text-[#4C5540] hover:underline flex items-center gap-0.5 cursor-pointer text-xs"
              >
                {language === 'ar' ? 'إدارة العملاء CRM' : 'CRM Clients'}
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Metric 3: Upcoming Social Media Posts for Current Month */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-[#8A927D] hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-sky-50 p-2 text-sky-600">
              <Share2 className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
              {currentMonthName}
            </span>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500">
              {language === 'ar'
                ? `منشورات السوشيال القادمة (${currentMonthName})`
                : `Upcoming Social Posts (${currentMonthName})`}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-black text-[#24291F] font-mono tabular-nums">
                {upcomingMonthPosts.length}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {language === 'ar'
                  ? `منشور قادم من ${currentMonthPosts.length}`
                  : `upcoming of ${currentMonthPosts.length} posts`}
              </span>
            </div>

            {/* Breakdown Sub-metrics */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[10px]">
              <div className="rounded-lg bg-emerald-50 p-1.5 border border-emerald-100">
                <span className="text-emerald-700 block font-medium">
                  {language === 'ar' ? 'معتمد للنشر' : 'Approved / Scheduled'}
                </span>
                <span className="font-extrabold text-emerald-800 font-mono tabular-nums">
                  {approvedUpcomingPosts.length}
                </span>
              </div>
              <div className="rounded-lg bg-amber-50 p-1.5 border border-amber-100">
                <span className="text-amber-700 block font-medium">
                  {language === 'ar' ? 'مسودة قيد المراجعة' : 'Under Review'}
                </span>
                <span className="font-extrabold text-amber-800 font-mono tabular-nums">
                  {reviewUpcomingPosts.length}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => setShowPostsDrawer(!showPostsDrawer)}
                className="text-[11px] font-bold text-[#4C5540] hover:text-[#24291F] flex items-center gap-1 cursor-pointer"
              >
                {showPostsDrawer
                  ? language === 'ar' ? 'إخفاء المعاينة' : 'Hide Preview'
                  : language === 'ar' ? 'معاينة المنشورات' : 'Preview Posts'}
                {showPostsDrawer ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('social')}
                className="font-bold text-[#4C5540] hover:underline flex items-center gap-0.5 cursor-pointer text-xs"
              >
                {language === 'ar' ? 'التقويم الكامل' : 'Full Calendar'}
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Upcoming Social Posts Preview Drawer for Current Month */}
      {showPostsDrawer && (
        <div className="mt-2 rounded-xl border border-[#BDAF9C]/30 bg-white p-4 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#4C5540]" />
              <h4 className="text-xs font-bold text-[#24291F]">
                {language === 'ar'
                  ? `جدول منشورات السوشيال القادمة لشهر ${currentMonthName}`
                  : `Upcoming Social Posts Schedule for ${currentMonthName}`}
              </h4>
              <span className="text-[10px] text-slate-400">
                ({filteredUpcomingPosts.length} {language === 'ar' ? 'منشور' : 'posts'})
              </span>
            </div>

            {/* Platform Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              {['all', 'instagram', 'tiktok', 'x', 'linkedin', 'facebook'].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatformFilter(plat)}
                  className={`rounded-lg px-2 py-0.5 font-bold transition-colors cursor-pointer ${
                    selectedPlatformFilter === plat
                      ? 'bg-[#4C5540] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {plat === 'all'
                    ? language === 'ar' ? 'الكل' : 'All'
                    : plat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUpcomingPosts.length === 0 ? (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                {language === 'ar'
                  ? 'لا توجد منشورات قادمة مجدولة في هذا التصنيف لهذا الشهر.'
                  : 'No upcoming posts scheduled in this category for this month.'}
              </div>
            ) : (
              filteredUpcomingPosts.map((post) => {
                const isApproved =
                  post.status === 'approved' || post.status === 'scheduled';
                return (
                  <div
                    key={post.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[#FAF7F2]/60 p-3 hover:bg-[#FAF7F2] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-black text-slate-700 border border-slate-200">
                          {post.platform.toUpperCase()}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isApproved
                            ? language === 'ar' ? 'مجدول ومعتمد' : 'Scheduled'
                            : language === 'ar' ? 'مراجعة' : 'In Review'}
                        </span>
                      </div>

                      <h5 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">
                        {post.title}
                      </h5>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {post.caption}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#BDAF9C]/20 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{post.scheduledDate} {post.scheduledTime && `· ${post.scheduledTime}`}</span>
                      <button
                        onClick={() => setActiveTab('social')}
                        className="text-[#4C5540] font-bold hover:underline cursor-pointer"
                      >
                        {language === 'ar' ? 'معاينة بالتقويم' : 'Open'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
