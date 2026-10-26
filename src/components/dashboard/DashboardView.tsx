import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Plus,
  Sparkles,
  Palette,
  CheckSquare,
  Share2,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Image as ImageIcon,
  Check,
  FileCheck2,
  Activity,
  Filter,
  CheckCircle,
  MessageSquare,
  UploadCloud,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { RoleWorkspaceView } from '../workspace/RoleWorkspaceView';
import { DashboardMetricsSummary } from './DashboardMetricsSummary';
import { TeamAvailabilityWidget } from './TeamAvailabilityWidget';
import { QuickTaskShortcutModal } from '../common/QuickTaskShortcutModal';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    contentPosts,
    activityLogs,
    language,
    setActiveTab,
    approvePost,
    updateTaskStatus,
    hasPermission,
    currentUser,
    currentUserRole,
  } = useApp();

  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'design' | 'social'>('all');

  // Social & Design task filters
  const designTasks = tasks.filter(
    (t) => t.teamType === 'design' || (t.visualAttachments && t.visualAttachments.length > 0)
  );
  const socialTasks = tasks.filter((t) => t.teamType === 'social');

  const completedDesignTasks = designTasks.filter(
    (t) => t.status === 'done' || t.status === 'client_delivered'
  );
  const inReviewDesignTasks = designTasks.filter((t) => t.status === 'review');
  const inProgressDesignTasks = designTasks.filter(
    (t) => t.status === 'in_progress' || t.status === 'changes_requested'
  );

  const pendingReviewPosts = contentPosts.filter((p) => p.status === 'review');
  const scheduledPosts = contentPosts.filter(
    (p) => p.status === 'scheduled' || p.status === 'approved'
  );
  const publishedPosts = contentPosts.filter((p) => p.status === 'published');

  // Overall Task Completion
  const totalCompletedTasks = tasks.filter(
    (t) => t.status === 'done' || t.status === 'client_delivered'
  ).length;
  const deliveryRate = tasks.length === 0 ? 0 : Math.round((totalCompletedTasks / tasks.length) * 100);

  // Today's Schedule filter (Urgent / High Priority OR Due Today / Overdue)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayScheduleTasks = tasks.filter((t) => {
    if (t.status === 'done' || t.status === 'client_delivered') return false;
    const isHighOrUrgent = t.priority === 'urgent' || t.priority === 'high';
    const isDueTodayOrOverdue = Boolean(t.dueDate && t.dueDate <= todayStr);
    return isHighOrUrgent || isDueTodayOrOverdue;
  });

  // Recharts Data 1: Design Tasks Status & Deliverables
  const designChartData = [
    {
      name: language === 'ar' ? 'مكتمل ومعتمد' : 'Completed',
      count: completedDesignTasks.length,
      fill: '#10b981',
    },
    {
      name: language === 'ar' ? 'مراجعة وتدقيق' : 'In Review',
      count: inReviewDesignTasks.length,
      fill: '#f59e0b',
    },
    {
      name: language === 'ar' ? 'جاري التنفيذ' : 'In Progress',
      count: inProgressDesignTasks.length,
      fill: '#2563eb',
    },
    {
      name: language === 'ar' ? 'قيد الانتظار' : 'To Do',
      count: designTasks.filter((t) => t.status === 'todo').length,
      fill: '#94a3b8',
    },
  ];

  // Recharts Data 2: Social Media Schedule by Platform
  const platforms = ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin'];
  const platformNames: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    twitter: 'X / Twitter',
    linkedin: 'LinkedIn',
  };

  const socialScheduleData = platforms.map((plt) => {
    const platformPosts = contentPosts.filter((p) => p.platform.toLowerCase() === plt);
    return {
      platform: platformNames[plt] || plt,
      scheduled: platformPosts.filter((p) => p.status === 'scheduled' || p.status === 'approved').length,
      published: platformPosts.filter((p) => p.status === 'published').length,
      review: platformPosts.filter((p) => p.status === 'review').length,
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Specialized Role-Based Workspace Section */}
      <RoleWorkspaceView />

      {/* 2. Unified Creative & Operations Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-[#24291F] via-[#3B4432] to-[#4C5540] p-6 text-white shadow-md border border-[#BDAF9C]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-[#E9E1D6] border border-white/15 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-[#D4C7B7]" />
              {language === 'ar' ? 'وكالة شال | Shal Agency' : 'Shal Agency | Operations'}
            </span>
            <span className="text-xs text-[#E9E1D6]/70">
              {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">
            {language === 'ar'
              ? 'متابعة الإنتاجية وجودة المخرجات'
              : 'Production Quality & Milestone Tracker'}
          </h2>
          <p className="text-xs text-[#E9E1D6]/85 mt-1 max-w-2xl leading-relaxed">
            {language === 'ar'
              ? 'متابعة حية للجدول الزمني للعملاء، التسليمات الإبداعية، ونسب إنجاز الفرق.'
              : 'Live tracking of client milestones, creative deliverables, and team delivery rates.'}
          </p>
        </div>

        {/* Quick Operational Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsQuickTaskModalOpen(true)}
            className="btn-shal-primary text-xs py-2 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
            title={language === 'ar' ? 'إضافة اختصار مهمة فورية' : 'Add Task Shortcut'}
          >
            <Sparkles className="h-4 w-4 text-[#D4C7B7]" />
            <span>{language === 'ar' ? 'إضافة اختصار' : 'Add Shortcut'}</span>
          </button>

          {hasPermission('can_create_tasks') && (
            <button
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-[#FAF7F2] backdrop-blur-md hover:bg-white/20 transition-all border border-white/15 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {language === 'ar' ? 'مهمة جديدة' : 'New Task'}
            </button>
          )}

          <button
            onClick={() => setActiveTab('social')}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold text-[#FAF7F2] backdrop-blur-md hover:bg-white/20 transition-all border border-white/15 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-[#D4C7B7]" />
            {language === 'ar' ? 'تقويم السوشيال' : 'Social Calendar'}
          </button>
        </div>
      </div>

      {/* Quick Task Creation Shortcut Card with Shal-inspired Hover Animation and Elevation */}
      <div className="group rounded-2xl border border-[#BDAF9C]/40 bg-[#FAF7F2] p-5 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg hover:border-[#4C5540]/60 hover:bg-gradient-to-br hover:from-[#FAF7F2] hover:via-[#FAF7F2] hover:to-[#E9E1D6]/85 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4C5540] text-white shadow-xs group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-5 w-5 text-[#FAF7F2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#24291F]">
                {language === 'ar'
                  ? 'منصة الاختصارات الفورية وتكليف المهام السريعة'
                  : 'Instant Operational Shortcuts & Fast Delegation'}
              </h3>
              <span className="rounded bg-[#4C5540]/10 px-2 py-0.5 text-[10px] font-bold text-[#4C5540] border border-[#4C5540]/25">
                {language === 'ar' ? 'تفاعل ديناميكي' : 'Quick Flow'}
              </span>
            </div>
            <p className="text-xs text-[#4C5540]/80 mt-0.5">
              {language === 'ar'
                ? 'أنشئ وكلف مهام العمل المستعجلة لفريق شال فورياً دون مغادرة لوحة القيادة'
                : 'Create and delegate urgent tasks to Shal team members instantly with one click'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsQuickTaskModalOpen(true)}
          className="btn-shal-primary text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-xs flex items-center gap-2 self-start sm:self-auto shrink-0 transition-all duration-200 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>{language === 'ar' ? 'إضافة اختصار (Add Shortcut)' : 'Add Shortcut'}</span>
        </button>
      </div>

      {/* Quick Task Shortcut Modal */}
      <QuickTaskShortcutModal
        isOpen={isQuickTaskModalOpen}
        onClose={() => setIsQuickTaskModalOpen(false)}
      />

      {/* 3. Operational Metrics Summary (Active Tasks, Clients Count, Upcoming Social Posts for Current Month) */}
      <DashboardMetricsSummary />

      {/* Primary KPI Grid (Exclusively Social Media & Design - Zero Sales) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Completed Design Deliverables */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-hover hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <Palette className="h-5 w-5" />
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-600 gap-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completedDesignTasks.length} {language === 'ar' ? 'منجز ومعتمد' : 'done'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">
              {language === 'ar' ? 'أصول وتصاميم الجرافيك المنجزة' : 'Completed Design Deliverables'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {completedDesignTasks.length}{' '}
                <span className="text-sm font-normal text-slate-400">/ {designTasks.length}</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>
                {inProgressDesignTasks.length} {language === 'ar' ? 'تصميم جاري تنفيذه' : 'in progress'}
              </span>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-[#4C5540] font-semibold hover:underline flex items-center gap-0.5"
              >
                {language === 'ar' ? 'عرض المهام' : 'View'} <ArrowUpRight className="h-3 w-3" />
              </button>
            </p>
          </div>
        </div>

        {/* Metric 2: Content Pending Approval */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-hover hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
            {pendingReviewPosts.length > 0 ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {pendingReviewPosts.length} {language === 'ar' ? 'بانتظار الاعتماد' : 'pending'}
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {language === 'ar' ? 'معتمد بالكامل' : 'All clear'}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">
              {language === 'ar' ? 'مسودات محتوى للمراجعة' : 'Posts Pending Approval'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{pendingReviewPosts.length}</h3>
              <span className="text-xs text-slate-400 font-normal">
                / {scheduledPosts.length} {language === 'ar' ? 'مجدول للنشر' : 'scheduled'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>{language === 'ar' ? 'سوشيال ميديا سبيشياليست' : 'Social Specialist'}</span>
              <button
                onClick={() => setActiveTab('social')}
                className="text-[#4C5540] font-semibold hover:underline flex items-center gap-0.5"
              >
                {language === 'ar' ? 'التقويم' : 'Calendar'} <ArrowUpRight className="h-3 w-3" />
              </button>
            </p>
          </div>
        </div>

        {/* Metric 3: Social Media Scheduled & Published */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-hover hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-sky-50 p-2.5 text-sky-600">
              <Share2 className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
              {publishedPosts.length} {language === 'ar' ? 'تم نشره' : 'published'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">
              {language === 'ar' ? 'الجدول الزمني للسوشيال ميديا' : 'Social Media Schedule'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{scheduledPosts.length}</h3>
              <span className="text-xs text-slate-400 font-normal">
                {language === 'ar' ? 'بوست مجدول قادم' : 'upcoming posts'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>{contentPosts.length} {language === 'ar' ? 'إجمالي المنشورات' : 'total posts'}</span>
              <button
                onClick={() => setActiveTab('social')}
                className="text-[#4C5540] font-semibold hover:underline flex items-center gap-0.5"
              >
                {language === 'ar' ? 'الجدول' : 'Schedule'} <ArrowUpRight className="h-3 w-3" />
              </button>
            </p>
          </div>
        </div>

        {/* Metric 4: On-time Delivery Rate */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-hover hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-[#4C5540]/10 p-2.5 text-[#4C5540]">
              <CheckSquare className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold text-slate-700">
              {deliveryRate}% {language === 'ar' ? 'نسبة الإنجاز' : 'Completion'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">
              {language === 'ar' ? 'إنجاز مهام الفريق الكلي' : 'Overall Team Delivery'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-[#4C5540]">{totalCompletedTasks}</h3>
              <span className="text-xs text-slate-500 font-normal">
                {language === 'ar' ? `مهمة منجزة من ${tasks.length}` : `completed of ${tasks.length}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>{language === 'ar' ? 'وكالة شال | Shal' : 'Shal Agency'}</span>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-[#4C5540] font-semibold hover:underline flex items-center gap-0.5"
              >
                {language === 'ar' ? 'المهام' : 'Tasks'} <ArrowUpRight className="h-3 w-3" />
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Row with Recharts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Visual Design Deliverables Summary (Recharts) */}
        <div className="rounded-2xl border border-[#BDAF9C]/30 bg-[#FAF7F2] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#BDAF9C]/20 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#24291F] flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#4C5540]" />
                {language === 'ar'
                  ? 'إحصائيات إنجاز مهام التصميم الجرافيكي'
                  : 'Graphic Design Tasks Completion'}
              </h3>
              <p className="text-xs text-[#4C5540]/80 mt-0.5">
                {language === 'ar'
                  ? 'توزيع أصول وتصاميم الهوية والمحتوى حسب مرحلة التنفيذ والاعتماد'
                  : 'Deliverables distribution by workflow status'}
              </p>
            </div>
            <span className="rounded-lg bg-[#4C5540]/10 px-2.5 py-1 text-[11px] font-bold text-[#4C5540] border border-[#4C5540]/25">
              {completedDesignTasks.length} / {designTasks.length} {language === 'ar' ? 'منجز' : 'done'}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={designChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4C5540' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#4C5540' }} />
                <Tooltip
                  formatter={(val: number) => [`${val} ${language === 'ar' ? 'مهمة تصميم' : 'tasks'}`, '']}
                  contentStyle={{
                    backgroundColor: '#24291F',
                    borderColor: '#BDAF9C',
                    borderRadius: '12px',
                    color: '#FAF7F2',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {designChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-2 pt-3 border-t border-[#BDAF9C]/20 text-center">
            {designChartData.map((item, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-white border border-[#BDAF9C]/20">
                <p className="text-[10px] text-slate-500 truncate">{item.name}</p>
                <p className="text-sm font-extrabold text-[#24291F] mt-0.5">{item.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Social Media Schedule Breakdown by Platform (Recharts) */}
        <div className="rounded-2xl border border-[#BDAF9C]/30 bg-[#FAF7F2] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#BDAF9C]/20 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#24291F] flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#4C5540]" />
                {language === 'ar'
                  ? 'الجدول الزمني للسوشيال ميديا حسب المنصة'
                  : 'Social Media Schedule by Platform'}
              </h3>
              <p className="text-xs text-[#4C5540]/80 mt-0.5">
                {language === 'ar'
                  ? 'المنشورات المجدولة للنشر، المنشورة فعلياً، والمسودات قيد المراجعة'
                  : 'Upcoming scheduled vs published posts across channels'}
              </p>
            </div>
            <span className="rounded-lg bg-[#4C5540]/10 px-2.5 py-1 text-[11px] font-bold text-[#4C5540] border border-[#4C5540]/25">
              {scheduledPosts.length} {language === 'ar' ? 'مجدول' : 'scheduled'}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={socialScheduleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#4C5540' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#4C5540' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#24291F',
                    borderColor: '#BDAF9C',
                    borderRadius: '12px',
                    color: '#FAF7F2',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="scheduled" name={language === 'ar' ? 'مجدول للنشر' : 'Scheduled'} fill="#4C5540" radius={[4, 4, 0, 0]} />
                <Bar dataKey="published" name={language === 'ar' ? 'تم نشره' : 'Published'} fill="#8A927D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="review" name={language === 'ar' ? 'قيد المراجعة' : 'In Review'} fill="#D4C7B7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-between pt-3 border-t border-[#BDAF9C]/20 text-xs text-slate-500">
            <span>{contentPosts.length} {language === 'ar' ? 'إجمالي محتوى الخطة' : 'total planned posts'}</span>
            <button
              onClick={() => setActiveTab('social')}
              className="text-[#4C5540] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              {language === 'ar' ? 'فتح تقويم النشر' : 'Open Calendar'} <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Team Availability & Workload Widget */}
      <TeamAvailabilityWidget />

      {/* Middle Section: Workflow Approvals + SIDE COMPONENT "جدول اليوم" */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        {/* Left 2 Cols: Content Approvals Queue */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-pink-100 p-1.5 text-pink-700">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'مسار موافقات المحتوى السريع (Approval Queue)' : 'Content Approval Queue'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ar'
                    ? 'منشورات قام السوشيال ميديا سبيشياليست بتسليمها وبانتظار اعتماد الأكونت مانجر'
                    : 'Posts submitted by Social Specialist waiting for Account Manager approval'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('social')}
              className="text-xs font-semibold text-[#4C5540] hover:underline cursor-pointer"
            >
              {language === 'ar' ? 'عرض جدول النشر بالكامل' : 'View Full Calendar'}
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {pendingReviewPosts.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {language === 'ar' ? 'كل مسودات المحتوى معتمدة حالياً!' : 'All content drafts are approved!'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ar' ? 'لا توجد منشورات معلقة تنتظر الموافقة.' : 'No pending review posts right now.'}
                </p>
              </div>
            ) : (
              pendingReviewPosts.map((post) => {
                return (
                  <div
                    key={post.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 transition-all hover:bg-amber-50"
                  >
                    <div className="flex items-start gap-3">
                      {post.mediaUrl ? (
                        <img
                          src={post.mediaUrl}
                          alt="preview"
                          className="h-14 w-14 rounded-lg object-cover border border-amber-200 shrink-0"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                          {post.platform.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                            {post.platform.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {post.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">{post.caption}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setActiveTab('social')}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {language === 'ar' ? 'معاينة' : 'Preview'}
                      </button>

                      {hasPermission('can_approve_content') && (
                        <button
                          onClick={() => approvePost(post.id)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {language === 'ar' ? 'موافقة فورية' : 'Approve'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SIDE COMPONENT: "جدول اليوم" (Today's Schedule & High-Priority Tasks) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-rose-100 p-1.5 text-rose-600">
                <Flame className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'جدول اليوم' : "Today's Schedule"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ar' ? 'المهام العاجلة ومواعيد التسليم اليومية' : 'High priority & due today'}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-extrabold text-rose-600 border border-rose-200">
              {todayScheduleTasks.length}
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {todayScheduleTasks.length === 0 ? (
              <div className="py-8 text-center">
                <FileCheck2 className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="text-xs font-bold text-slate-700 mt-2">
                  {language === 'ar' ? 'جدول اليوم مكتمل ومثالي!' : "Today's agenda completed!"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ar' ? 'لا توجد مهام عاجلة متبقية لهذا اليوم.' : 'No urgent tasks left for today.'}
                </p>
              </div>
            ) : (
              todayScheduleTasks.map((task) => {
                const isUrgent = task.priority === 'urgent';
                const isDesign = task.teamType === 'design';

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isUrgent
                        ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => updateTaskStatus(task.id, 'done')}
                          title={language === 'ar' ? 'تحديد كمكتمل' : 'Mark done'}
                          className="mt-0.5 h-4 w-4 rounded border border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-500 flex items-center justify-center transition-colors"
                        >
                          <Check className="h-3 w-3 text-transparent hover:text-emerald-600" />
                        </button>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                  isDesign
                                    ? 'bg-[#8A927D]/20 text-[#4C5540]'
                                    : 'bg-[#4C5540]/10 text-[#4C5540]'
                                }`}
                            >
                              {isDesign
                                ? language === 'ar' ? 'تصميم' : 'Design'
                                : language === 'ar' ? 'سوشيال' : 'Social'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {task.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isUrgent ? (language === 'ar' ? 'عاجل' : 'Urgent') : (language === 'ar' ? 'مرتفع' : 'High')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            className="mt-4 w-full rounded-xl bg-slate-100 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {language === 'ar' ? 'عرض كافة المهام في لوحة كانبان' : 'Open Tasks Board'}
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Team Activity (نشاط الفريق الأخير) */}
      <div className="rounded-2xl border border-[#BDAF9C]/30 bg-[#FAF7F2] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#BDAF9C]/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#4C5540] p-2 text-[#FAF7F2] shadow-xs ring-1 ring-[#BDAF9C]/30">
              <Activity className="h-5 w-5 text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#24291F]">
                  {language === 'ar' ? 'نشاط الفريق الأخير (Recent Team Activity)' : 'Recent Team Activity'}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#4C5540]/10 px-2 py-0.5 text-[10px] font-bold text-[#4C5540] border border-[#4C5540]/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {language === 'ar' ? 'مباشر ولحظي' : 'Live Stream'}
                </span>
              </div>
              <p className="text-xs text-[#4C5540]/80 mt-0.5">
                {language === 'ar'
                  ? 'متابعة شفافة وفورية لإنجازات وتحديثات أقسام السوشيال والجرافيك لتعزيز التعاون اللحظي'
                  : 'Transparent, real-time activity stream between Social Media & Graphic Design teams'}
              </p>
            </div>
          </div>

          {/* Activity Filters */}
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 self-start sm:self-auto text-xs border border-[#BDAF9C]/25">
            <button
              onClick={() => setActivityFilter('all')}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all cursor-pointer ${
                activityFilter === 'all'
                  ? 'bg-[#4C5540] text-white shadow-xs'
                  : 'text-[#24291F] hover:text-[#4C5540]'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setActivityFilter('design')}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all flex items-center gap-1 ${
                activityFilter === 'design'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="h-3 w-3" />
              <span>{language === 'ar' ? 'الجرافيك' : 'Design'}</span>
            </button>
            <button
              onClick={() => setActivityFilter('social')}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all flex items-center gap-1 ${
                activityFilter === 'social'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="h-3 w-3" />
              <span>{language === 'ar' ? 'السوشيال' : 'Social'}</span>
            </button>
          </div>
        </div>

        {/* Activity Stream List */}
        <div className="mt-4 space-y-2.5">
          {(() => {
            const filtered = activityLogs.filter((log) => {
              if (activityFilter === 'design') {
                return (
                  log.userId === 'user-yasmine' ||
                  log.action.toLowerCase().includes('design') ||
                  log.actionAr.includes('تصميم') ||
                  log.actionAr.includes('أصول') ||
                  log.entityName.includes('تصميم')
                );
              }
              if (activityFilter === 'social') {
                return (
                  log.userId === 'user-sara' ||
                  log.action.toLowerCase().includes('post') ||
                  log.actionAr.includes('منشور') ||
                  log.actionAr.includes('محتوى') ||
                  log.actionAr.includes('فيسبوك') ||
                  log.actionAr.includes('لينكد')
                );
              }
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="py-8 text-center text-xs text-slate-400">
                  {language === 'ar' ? 'لا توجد أنشطة مسجلة في هذا التصنيف' : 'No activities found in this filter'}
                </div>
              );
            }

            return filtered.slice(0, 7).map((log) => {
              const isDesign =
                log.userId === 'user-yasmine' ||
                log.actionAr.includes('تصميم') ||
                log.entityName.includes('تصميم') ||
                log.actionAr.includes('أصول');
              const isSocial =
                log.userId === 'user-sara' ||
                log.actionAr.includes('منشور') ||
                log.actionAr.includes('محتوى');

              return (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* User Avatar with role-based ring */}
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                        isDesign
                          ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-200'
                          : isSocial
                          ? 'bg-sky-100 text-sky-700 ring-2 ring-sky-200'
                          : 'bg-[#1b24f5]/10 text-[#1b24f5] ring-2 ring-[#1b24f5]/20'
                      }`}
                    >
                      {log.userName.slice(0, 1)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{log.userName}</span>
                        <span
                          className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold ${
                            isDesign
                              ? 'bg-purple-100 text-purple-700'
                              : isSocial
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isDesign
                            ? language === 'ar' ? '🎨 مصممة جرافيك' : 'Graphic Designer'
                            : isSocial
                            ? language === 'ar' ? '✍️ سوشيال ميديا' : 'Social Specialist'
                            : language === 'ar' ? '💼 إدارة حسابات' : 'Account Manager'}
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {language === 'ar' ? log.actionAr : log.action}
                        </span>
                      </div>

                      {log.details && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                      {log.createdAt}
                    </span>

                    <button
                      onClick={() => {
                        if (isDesign) setActiveTab('tasks');
                        else if (isSocial) setActiveTab('social');
                        else setActiveTab('tasks');
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      {language === 'ar' ? 'عرض' : 'View'}
                    </button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
