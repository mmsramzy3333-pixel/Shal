import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  PieChart,
  Layers,
  Users,
  Target,
  FileSpreadsheet,
  FileCode,
  FileText,
  Filter,
  Check,
  RefreshCw,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { clients, tasks, contentPosts, users, language, showToast } = useApp();

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Compute live analytics based on real data
  const totalRetainerRevenue = clients
    .filter((c) => c.status === 'active')
    .reduce((acc, c) => acc + (c.monthlyRetainer || 0), 0);

  const completedTasksCount = tasks.filter((t) => t.status === 'done' || t.status === 'client_delivered').length;
  const inProgressTasksCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;
  const totalTasksCount = Math.max(1, tasks.length);
  const taskCompletionRate = Math.round((completedTasksCount / totalTasksCount) * 100);

  const publishedPostsCount = (contentPosts || []).filter((p) => p.status === 'published' || p.status === 'approved').length;
  const scheduledPostsCount = (contentPosts || []).filter((p) => p.status === 'scheduled').length;

  const departmentMetrics = [
    {
      dept: 'التسويق والميديا باينج (Media Buying)',
      deptEn: 'Media Buying & Performance',
      kpi: '3.8x ROAS',
      target: '3.5x',
      progress: 92,
      leads: '1,420 Lead',
      budget: '$24,500',
      status: 'excellent',
    },
    {
      dept: 'صناعة المحتوى والسوشيال (Content & Social)',
      deptEn: 'Content & Social Media',
      kpi: `${publishedPostsCount} منشور معتمد`,
      target: '60 منشور',
      progress: Math.min(100, Math.round((publishedPostsCount / 60) * 100)),
      leads: `${scheduledPostsCount} مجدول`,
      budget: '$9,200',
      status: 'good',
    },
    {
      dept: 'البرمجة والأنظمة الرقمية (Dev & Systems)',
      deptEn: 'Development & Engineering',
      kpi: '99.4% Uptime',
      target: '99.0%',
      progress: 98,
      leads: '4 تذاكر محلولة',
      budget: '$15,000',
      status: 'excellent',
    },
    {
      dept: 'تصميم الواجهات والهويات (UI/UX & Branding)',
      deptEn: 'UI/UX & Creative Assets',
      kpi: '18 تصميم معتمد',
      target: '20 تصميم',
      progress: 90,
      leads: '3 أنظمة تصميم',
      budget: '$11,800',
      status: 'good',
    },
  ];

  // Monthly breakdown mock for chart visuals
  const monthlyRevenue = [
    { month: 'يناير', rev: 38000, target: 35000 },
    { month: 'فبراير', rev: 44000, target: 40000 },
    { month: 'مارس', rev: 52000, target: 48000 },
    { month: 'أبريل', rev: totalRetainerRevenue || 58000, target: 55000 },
  ];

  // Export PDF Report
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header Banner
      doc.setFillColor(76, 85, 64);
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SHAL AGENCY | EXECUTIVE PERFORMANCE REPORT', 14, 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Period: ${timeRange.toUpperCase()} | Generated: ${new Date().toLocaleDateString('en-US')} | Confidential`,
        14,
        22
      );

      // KPI Boxes
      doc.setFillColor(250, 247, 242);
      doc.roundedRect(14, 35, 182, 30, 2, 2, 'F');

      doc.setTextColor(36, 41, 31);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Performance Indicators:', 20, 43);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Active Monthly Retainers: $${totalRetainerRevenue.toLocaleString()} USD`, 20, 52);
      doc.text(`Total Active Clients: ${clients.filter((c) => c.status === 'active').length}`, 20, 60);

      doc.text(`Task Velocity & Completion: ${taskCompletionRate}% (${completedTasksCount} Done)`, 110, 52);
      doc.text(`Content Pieces Delivered: ${publishedPostsCount} Approved`, 110, 60);

      // Departmental Table
      let y = 75;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Department / Operations', 20, y + 5.5);
      doc.text('Key Output Metric', 100, y + 5.5);
      doc.text('Target Met (%)', 160, y + 5.5);

      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      departmentMetrics.forEach((d) => {
        doc.text(d.deptEn, 20, y);
        doc.text(d.kpi, 100, y);
        doc.text(`${d.progress}%`, 160, y);
        y += 10;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Shal Agency Operations • Analytics Engine • All Rights Reserved', 105, 285, {
        align: 'center',
      });

      doc.save(`shal-executive-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast({
        type: 'success',
        title: 'تم تصدير التقرير PDF',
        message: 'تم تحميل المستند التحليلي الرسمي بنجاح.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const csvContent =
      '\uFEFF' +
      [
        'Department,KPI Output,Target,Progress (%),Status',
        ...departmentMetrics.map((d) => `"${d.dept}","${d.kpi}","${d.target}",${d.progress},"${d.status}"`),
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shal-performance-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast({
      type: 'success',
      title: 'تصدير التقرير CSV',
      message: 'تم تنزيل بيانات التقرير بتنسيق الجداول بنجاح.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#4C5540] text-white shadow-xs">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#24291F] dark:text-[#F3F1EC]">
                {language === 'ar' ? 'مركز التقارير والتحليلات الاستراتيجية' : 'Executive Analytics & Reports'}
              </h2>
              <p className="text-xs text-[#4C5540]/80 dark:text-[#C8D1C0] mt-0.5">
                {language === 'ar'
                  ? 'رصد فوري لعوائد العقود والريتينر الشهرية، معدلات إنجاز المهام، وإنتاجية أقسام وكالة شال.'
                  : 'Real-time performance tracking for retainers, tasks throughput, and team KPIs.'}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range switcher */}
          <div className="flex items-center rounded-xl bg-white dark:bg-[#1E251D] border border-[#BDAF9C]/35 p-1 shadow-2xs">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'month' ? 'bg-[#4C5540] text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {language === 'ar' ? 'الشهر الحالي' : 'Month'}
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'quarter' ? 'bg-[#4C5540] text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {language === 'ar' ? 'الربع السنوي (Q1)' : 'Quarter'}
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'year' ? 'bg-[#4C5540] text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {language === 'ar' ? 'السنوي (2026)' : 'Year'}
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#4C5540]" />
            <span>CSV</span>
          </button>

          {/* Export PDF Report */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3B4432] transition-colors cursor-pointer disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'جارٍ التوليد...' : language === 'ar' ? 'تحميل التقرير PDF' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Retainer MRR */}
        <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {language === 'ar' ? 'عوائد الريتينر الشهرية (MRR)' : 'Monthly Retainer (MRR)'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            ${totalRetainerRevenue.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+14.2% نمو مقارنة بالشهر السابق</span>
          </div>
        </div>

        {/* Task Delivery Throughput */}
        <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {language === 'ar' ? 'سرعة إنجاز المهام' : 'Tasks Velocity'}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {taskCompletionRate}%
          </p>
          <div className="mt-1 text-[10px] text-blue-600 font-semibold">
            {completedTasksCount} مهمة منجزة من أصل {tasks.length}
          </div>
        </div>

        {/* Content Production Output */}
        <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {language === 'ar' ? 'إنتاجية المحتوى والسوشيال' : 'Content Output'}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {publishedPostsCount}
          </p>
          <div className="mt-1 text-[10px] text-purple-600 font-semibold">
            منشور معتمد + {scheduledPostsCount} مجدول بالتقويم
          </div>
        </div>

        {/* Client Retention */}
        <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {language === 'ar' ? 'معدل بقاء العملاء (Retention)' : 'Client Retention'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">96.5%</p>
          <div className="mt-1 text-[10px] text-amber-600 font-semibold">
            ثقة عالية واستمرارية عقود الوكالة
          </div>
        </div>
      </div>

      {/* Visual Chart Bars: Revenue Trajectory */}
      <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'مسار نمو العوائد الشهرية للوكالة (2026)' : 'Agency Revenue Trajectory'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              مقارنة بين الإيراد الفعلي والهدف التعاقدي المستهدف
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-200">
            تجاوز المستهدف بـ 8.5%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {monthlyRevenue.map((m, idx) => {
            const heightPercent = Math.min(100, Math.round((m.rev / 60000) * 100));
            return (
              <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-[#121612] border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ${m.rev.toLocaleString()}
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-24 rounded-lg my-2 flex items-end p-1">
                  <div
                    className="w-full bg-[#4C5540] rounded-md transition-all duration-500 shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500">{m.month}</span>
                <span className="text-[9px] text-slate-400 font-mono">هدف: ${m.target.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Departmental Performance Matrix */}
      <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'مؤشرات الأداء التشغيلي للأقسام والفرق' : 'Departmental Operational Velocity'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              تقييم المخرجات الشهرية وجودة التسليم لكل قسم
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#4C5540]">4 أقسام رئيسية</span>
        </div>

        <div className="space-y-3">
          {departmentMetrics.map((dept, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#FAF7F2]/60 dark:bg-[#181D18] hover:border-[#4C5540] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4C5540]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{dept.dept}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-[#4C5540]">{dept.kpi}</span>
                  <span className="text-slate-400 font-mono">الميزانية: {dept.budget}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#4C5540] h-full rounded-full transition-all duration-500"
                  style={{ width: `${dept.progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>المخرجات: {dept.leads}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">نسبة تحقيق الهدف: {dept.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
