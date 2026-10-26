import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Calendar,
  Share2,
  Code,
  Search,
  Target,
  Megaphone,
  Palette,
  FileText,
  Briefcase,
  Play,
  ExternalLink,
  Plus,
  Check,
  Send,
  Layers,
  Flame,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';

export const RoleWorkspaceView: React.FC = () => {
  const {
    currentUser,
    currentUserRole,
    language,
    tasks,
    clients,
    projects,
    contentPosts,
    tickets,
    campaigns,
    seoKeywords,
    uiuxAssets,
    profileRequests,
    approveProfileChangeRequest,
    rejectProfileChangeRequest,
    updateTaskStatus,
    approvePost,
    updateTicketStatus,
    setActiveTab,
    hasPermission,
  } = useApp();

  const [workspaceRejectReqId, setWorkspaceRejectReqId] = useState<string | null>(null);
  const [workspaceRejectReason, setWorkspaceRejectReason] = useState('');

  const roleCode = currentUserRole?.code || 'founder';

  // 1. Founder Dashboard
  if (roleCode === 'founder') {
    const totalRetainers = clients.reduce((acc, c) => acc + (c.monthlyRetainer || 0), 0);
    const activeProjectsCount = projects.filter((p) => p.status === 'active' || p.status === 'in_progress').length;
    const completedTasksCount = tasks.filter((t) => t.status === 'done' || t.status === 'client_delivered').length;
    const pendingApprovalsCount = profileRequests.filter((r) => r.status === 'pending').length;

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Welcome Executive Header */}
        <div className="rounded-2xl bg-gradient-to-l from-[#24291F] via-[#3B4432] to-[#4C5540] p-6 text-white shadow-md border border-[#BDAF9C]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#FAF7F2] text-[#24291F] border border-[#BDAF9C]/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                EXECUTIVE COCKPIT
              </span>
              <span className="text-xs text-[#E9E1D6] font-medium">وكالة شال | Shal Agency</span>
            </div>
            <h1 className="text-xl font-black">
              {language === 'ar' ? `مرحباً بك يا ${currentUser.name}` : `Welcome, ${currentUser.name}`}
            </h1>
            <p className="text-xs text-[#E9E1D6]/85 max-w-xl">
              {language === 'ar'
                ? 'لوحة القيادة التنفيذية الشاملة: متابعة الأداء المالي، تقدم الأقسام الـ 11، واعتماد طلبات الموظفين.'
                : 'Executive overview across all 11 departments, agency retainers, and approval queues.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('admin')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs font-bold transition-all border border-[#BDAF9C]/30 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-[#D4C7B7]" />
              <span>{language === 'ar' ? 'مصفوفة الصلاحيات (RBAC)' : 'RBAC Matrix'}</span>
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className="btn-shal-primary text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              <span>{language === 'ar' ? 'إدارة العملاء والصفقات' : 'Clients & Deals'}</span>
            </button>
          </div>
        </div>

        {/* Executive Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-shal p-4 space-y-1 bg-[#FAF7F2] border border-[#BDAF9C]/35">
            <div className="flex items-center justify-between text-[#4C5540]">
              <span className="text-xs font-bold">{language === 'ar' ? 'إجمالي عقود الريتينر' : 'Monthly Retainers'}</span>
              <DollarSign className="h-4 w-4 text-[#4C5540]" />
            </div>
            <p className="text-xl font-black text-[#24291F]">{totalRetainers.toLocaleString()} <span className="text-xs text-[#4C5540] font-medium">SAR/شهر</span></p>
            <p className="text-[11px] text-[#4C5540] font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{language === 'ar' ? '+18% نمو مقارنة بالربع السابق' : '+18% vs last quarter'}</span>
            </p>
          </div>

          <div className="card-shal p-4 space-y-1 bg-[#FAF7F2] border border-[#BDAF9C]/35">
            <div className="flex items-center justify-between text-[#4C5540]">
              <span className="text-xs font-bold">{language === 'ar' ? 'العملاء والمشاريع النشطة' : 'Active Projects'}</span>
              <Briefcase className="h-4 w-4 text-[#4C5540]" />
            </div>
            <p className="text-xl font-black text-[#24291F]">{activeProjectsCount} <span className="text-xs text-[#4C5540] font-medium">مشاريع ({clients.length} عملاء)</span></p>
            <p className="text-[11px] text-[#4C5540]/80">
              {language === 'ar' ? 'نسبة إنجاز المهام: ' : 'Delivery rate: '}
              <strong className="text-[#24291F]">{Math.round((completedTasksCount / (tasks.length || 1)) * 100)}%</strong>
            </p>
          </div>

          <div className="card-shal p-4 space-y-1 bg-[#FAF7F2] border border-[#BDAF9C]/35">
            <div className="flex items-center justify-between text-[#4C5540]">
              <span className="text-xs font-bold">{language === 'ar' ? 'إنفاق الإعلانات المدارة' : 'Total Managed Ads'}</span>
              <Megaphone className="h-4 w-4 text-rose-500" />
            </div>
            <p className="text-xl font-black text-slate-900">
              {campaigns.reduce((acc, c) => acc + c.spentTotal, 0).toLocaleString()} <span className="text-xs text-slate-500 font-medium">SAR</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">
              متوسط العائد: <strong>4.47x ROAS</strong>
            </p>
          </div>

          <div className="card-shal p-4 space-y-1 border-amber-300 bg-amber-50/30">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-xs font-bold">{language === 'ar' ? 'طلبات تعديل ملفات معلقة' : 'Pending Profile Requests'}</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-900">{pendingApprovalsCount}</p>
            <p className="text-[11px] text-amber-800">
              {language === 'ar' ? 'بانتظار موافقتك لتغيير الاسم/الصورة' : 'Requires your approval'}
            </p>
          </div>
        </div>

        {/* Pending Profile Requests Section */}
        {pendingApprovalsCount > 0 && (
          <div className="card-shal p-5 border-amber-200 bg-amber-50/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'طلبات تعديل الاسم والصورة للموظفين (بانتظار اعتماد الإدارة)' : 'Pending Employee Profile Approvals'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'ar' ? 'خاص بالفاوندر ومدير العمليات' : 'Founder & Ops Only'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profileRequests.filter((r) => r.status === 'pending').map((req) => (
                <div key={req.id} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#4C5540]">{req.userRoleName}</span>
                    <span className="text-[10px] text-slate-400">{req.requestedAt}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <img src={req.currentAvatar} alt="old" className="h-9 w-9 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <p className="text-[10px] text-slate-400">الحالي:</p>
                        <p className="font-medium text-slate-700">{req.currentName}</p>
                      </div>
                    </div>
                    <span className="text-slate-400">←</span>
                    <div className="flex items-center gap-2 text-xs">
                      <img src={req.requestedAvatar || req.currentAvatar} alt="new" className="h-9 w-9 rounded-lg object-cover border-2 border-emerald-500" />
                      <div>
                        <p className="text-[10px] text-emerald-600 font-bold">الجديد المطلوب:</p>
                        <p className="font-bold text-slate-900">{req.requestedName}</p>
                      </div>
                    </div>
                  </div>
                  {req.reason && <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded">{req.reason}</p>}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceRejectReqId(req.id);
                        setWorkspaceRejectReason('');
                      }}
                      className="btn-interactive px-3 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {language === 'ar' ? 'رفض' : 'Reject'}
                    </button>
                    <button
                      type="button"
                      onClick={() => approveProfileChangeRequest(req.id)}
                      className="btn-shal-primary text-xs py-1 px-3.5 rounded-lg font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{language === 'ar' ? 'موافقة وتحديث الحساب' : 'Approve & Apply'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejection Modal in Founder Workspace */}
        {workspaceRejectReqId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-rose-100 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-xs font-bold text-slate-900">
                  {language === 'ar' ? 'سبب رفض طلب تعديل الملف' : 'Reason for Profile Rejection'}
                </h4>
                <button
                  type="button"
                  onClick={() => setWorkspaceRejectReqId(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {['الصورة غير رسمية أو غير واضحة', 'الاسم غير مطابق للهوية', 'يرجى مراجعة إدارة العمليات'].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWorkspaceRejectReason(preset)}
                    className="btn-interactive text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={workspaceRejectReason}
                onChange={(e) => setWorkspaceRejectReason(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب ملاحظتك للموظف...' : 'Write feedback note...'}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWorkspaceRejectReqId(null)}
                  className="btn-interactive px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fallbackReason = language === 'ar' ? 'تم الرفض بواسطة الإدارة' : 'Rejected by management';
                    rejectProfileChangeRequest(workspaceRejectReqId, workspaceRejectReason.trim() || fallbackReason);
                    setWorkspaceRejectReqId(null);
                    setWorkspaceRejectReason('');
                  }}
                  className="btn-interactive px-3.5 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm"
                >
                  {language === 'ar' ? 'تأكيد الرفض' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Marketing Manager
  if (roleCode === 'marketing_mgr') {
    const pendingReviewPosts = contentPosts.filter((p) => p.status === 'review');
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-purple-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md">
          <span className="rounded bg-purple-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            MARKETING STRATEGY HUB
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `مساحة إدارة التسويق - ${currentUser.name}` : `Marketing Hub - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-purple-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'الإشراف على الخطط التسويقية، مراجعة واعتماد المحتوى والتصاميم، ومتابعة تناغم السوشيال ميديا مع الإعلانات.'
              : 'Oversee campaign strategy, approve creatives and social posts, and track brand ROI.'}
          </p>
        </div>

        {/* Content Review Alert */}
        <div className="card-shal p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>{language === 'ar' ? 'المحتوى والتصاميم بانتظار اعتمادك' : 'Pending Your Content Approval'}</span>
            </h3>
            <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-bold">
              {pendingReviewPosts.length} منشورات
            </span>
          </div>

          {pendingReviewPosts.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">{language === 'ar' ? 'رائع! لا يوجد محتوى معلق بانتظار الاعتماد.' : 'All content reviewed.'}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingReviewPosts.map((post) => (
                <div key={post.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{post.title}</span>
                    <span className="rounded bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-bold uppercase">{post.platform}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{post.caption}</p>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => approvePost(post.id)}
                      className="btn-shal-primary text-xs py-1 px-3 rounded-lg"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{language === 'ar' ? 'اعتماد للنشر' : 'Approve'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Sales Manager
  if (roleCode === 'sales_mgr') {
    const leads = clients.filter((c) => c.status === 'lead');
    const negotiations = clients.filter((c) => c.status === 'negotiation');
    const activeClients = clients.filter((c) => c.status === 'active');

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-emerald-950 via-slate-900 to-teal-950 p-6 text-white shadow-md">
          <span className="rounded bg-emerald-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            SALES PIPELINE & DEALS
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `مسار المبيعات والصفقات - ${currentUser.name}` : `Sales Pipeline - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-emerald-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'متابعة مسار العملاء المحتملين (Leads)، التفاوض على عروض الأسعار، وإغلاق العقود السنوية.'
              : 'Track lead progression, negotiate proposals, and close high-value agency retainers.'}
          </p>
        </div>

        {/* Pipeline Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">عملاء محتملون (Leads)</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{leads.length}</span>
            </div>
            {leads.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">لا يوجد عملاء جدد</p>
            ) : (
              leads.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <p className="font-bold text-xs text-slate-900">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.industry}</p>
                  <p className="text-xs font-semibold text-emerald-600">{c.monthlyRetainer} SAR/شهر</p>
                </div>
              ))
            )}
          </div>

          <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <span className="text-xs font-bold text-blue-800">مرحلة التفاوض والعروض</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">{negotiations.length}</span>
            </div>
            {negotiations.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-1">
                <p className="font-bold text-xs text-slate-900">{c.name}</p>
                <p className="text-[11px] text-slate-500">{c.contactPerson} - {c.phone}</p>
                <p className="text-xs font-bold text-[#2563EB]">{c.monthlyRetainer} SAR/شهر</p>
                <p className="text-[10px] text-slate-600 bg-white p-1 rounded border border-blue-100">{c.notes}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-emerald-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <span className="text-xs font-bold text-emerald-800">عقود مغلقة ونشطة (Signed)</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">{activeClients.length}</span>
            </div>
            {activeClients.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-1">
                <p className="font-bold text-xs text-slate-900">{c.name}</p>
                <p className="text-[11px] text-emerald-700 font-bold">{c.packageTitle}</p>
                <p className="text-xs font-black text-slate-900">{c.monthlyRetainer} SAR/شهر</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. Operations Manager
  if (roleCode === 'operations_mgr') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-sky-950 via-slate-900 to-blue-950 p-6 text-white shadow-md">
          <span className="rounded bg-sky-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            OPERATIONS & WORKFLOWS
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `إدارة العمليات والتشغيل - ${currentUser.name}` : `Operations Hub - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-sky-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'مراقبة سير المهام، منع الاختناقات، ضمان الالتزام بالديدلاين، وتوزيع المهام على فرق العمل.'
              : 'Monitor workflow velocity, prevent bottlenecks, allocate team resources, and hit client deadlines.'}
          </p>
        </div>

        {/* Task Velocity Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-shal p-4">
            <span className="text-xs text-slate-500 font-bold">مهام قيد التنفيذ</span>
            <p className="text-xl font-black text-blue-600 mt-1">{tasks.filter((t) => t.status === 'in_progress').length}</p>
          </div>
          <div className="card-shal p-4">
            <span className="text-xs text-slate-500 font-bold">مهام بانتظار المراجعة</span>
            <p className="text-xl font-black text-amber-600 mt-1">{tasks.filter((t) => t.status === 'review').length}</p>
          </div>
          <div className="card-shal p-4">
            <span className="text-xs text-slate-500 font-bold">مهام طارئة (Urgent)</span>
            <p className="text-xl font-black text-rose-600 mt-1">{tasks.filter((t) => t.priority === 'urgent').length}</p>
          </div>
          <div className="card-shal p-4">
            <span className="text-xs text-slate-500 font-bold">مكتملة ومسلمة</span>
            <p className="text-xl font-black text-emerald-600 mt-1">{tasks.filter((t) => t.status === 'done' || t.status === 'client_delivered').length}</p>
          </div>
        </div>
      </div>
    );
  }

  // 5. Account Manager
  if (roleCode === 'account_mgr') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-teal-950 via-slate-900 to-cyan-950 p-6 text-white shadow-md">
          <span className="rounded bg-teal-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            ACCOUNT MANAGEMENT & CLIENT CARE
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `إدارة حسابات العملاء - ${currentUser.name}` : `Account Manager Hub - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-teal-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'العناية بالعملاء، توثيق الاجتماعات والمكالمات، تسليم المخرجات، وضمان تجديد العقود.'
              : 'Direct client communication, meeting logs, deliverables handover, and retainer renewals.'}
          </p>
        </div>

        <div className="card-shal p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">سجل العملاء النشطين واحتياجاتهم</h3>
          <div className="divide-y divide-slate-100">
            {clients.map((c) => (
              <div key={c.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{c.name} ({c.company})</h4>
                  <p className="text-[11px] text-slate-500">مسؤول التواصل: {c.contactPerson} · {c.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{c.monthlyRetainer} {c.currency}</span>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    عرض الملف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 6. Social Media Specialist
  if (roleCode === 'social_spec') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-pink-950 via-slate-900 to-rose-950 p-6 text-white shadow-md">
          <span className="rounded bg-pink-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            SOCIAL MEDIA PUBLISHING
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `مساحة السوشيال ميديا - ${currentUser.name}` : `Social Publishing Hub - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-pink-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'إدارة تقويم النشر عبر المنصات (إنستغرام، تيك توك، X، لينكد إن)، ضبط المواعيد، والتأكد من جودة النشر.'
              : 'Schedule and deploy posts across all major social networks with strict timing adherence.'}
          </p>
        </div>

        <div className="card-shal p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">جدول المنشورات القادمة</h3>
            <button
              onClick={() => setActiveTab('social')}
              className="btn-shal-primary text-xs py-1.5 px-3 rounded-lg"
            >
              فتح التقويم الكامل
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contentPosts.map((post) => (
              <div key={post.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{post.title}</span>
                  <span className="rounded bg-pink-50 text-pink-700 px-2 py-0.5 text-[10px] font-bold uppercase">{post.platform}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{post.caption}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>📅 {post.scheduledDate} - {post.scheduledTime}</span>
                  <span className="font-bold text-slate-700">{post.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 7. Content Creator
  if (roleCode === 'content_creator') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-amber-950 via-slate-900 to-yellow-950 p-6 text-white shadow-md">
          <span className="rounded bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            CONTENT & CREATIVE STUDIO
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `استوديو المحتوى والاسكريبتات - ${currentUser.name}` : `Content Creator Studio - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-amber-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'كتابة الاسكريبتات، هوكات الفيديوهات القصيرة، صياغة الكابشنز، وتسليم المسودات الإبداعية للإدارة.'
              : 'Draft viral hooks, write video scripts, and upload creative briefs for review.'}
          </p>
        </div>

        <div className="card-shal p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">مسودات المحتوى والاسكريبتات</h3>
            <button
              onClick={() => setActiveTab('social')}
              className="btn-shal-amber text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة فكرة محتوى جديدة</span>
            </button>
          </div>
          <div className="space-y-2">
            {contentPosts.map((post) => (
              <div key={post.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">{post.status}</span>
                </div>
                <p className="text-xs text-slate-600">{post.caption}</p>
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {post.hashtags.map((h, i) => (
                    <span key={i} className="text-[10px] text-blue-600 font-medium">{h}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 8. UI / UX Designer
  if (roleCode === 'ui_ux') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-indigo-950 via-slate-900 to-violet-950 p-6 text-white shadow-md">
          <span className="rounded bg-indigo-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            UI / UX DESIGN HUB
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `مساحة مصمم الواجهات وتجربة المستخدم - ${currentUser.name}` : `UI/UX Hub - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-indigo-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'مكتبة نظم التصميم (Design Systems)، النماذج الأولية على فيجما، وتصميم تجارب استخدام سلسة للمواقع والتطبيقات.'
              : 'Manage Figma design systems, interactive prototypes, and design deliverables for development.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uiuxAssets.map((asset) => (
            <div key={asset.id} className="card-shal p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 uppercase">
                  {asset.platform}
                </span>
                <span className="text-[11px] text-slate-400">{asset.lastModified}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{asset.title}</h4>
                <p className="text-[11px] text-slate-500">{asset.clientName}</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-600 font-medium">عدد الشاشات: {asset.screensCount}</span>
                <a
                  href={asset.figmaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#4C5540] font-bold flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>فتح في Figma</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 9. SEO Specialist
  if (roleCode === 'seo_spec') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-teal-950 via-slate-900 to-emerald-950 p-6 text-white shadow-md">
          <span className="rounded bg-teal-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            SEO & SEARCH CONSOLE HUB
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `مساحة خبير السيو وتحسين محركات البحث - ${currentUser.name}` : `SEO Specialist Hub - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-teal-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'تتبع ترتيب الكلمات المفتاحية، التدقيق الفني للمواقع، وبناء الباك لينكس وتصدر نتائج جوجل الأولى.'
              : 'Track keyword ranking movements, search intent, volume, and technical on-page audits.'}
          </p>
        </div>

        <div className="card-shal p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">ترتيب الكلمات المفتاحية في جوجل</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="text-[11px] text-slate-400 border-b border-slate-100 pb-2">
                <tr>
                  <th className="py-2">الكلمة المفتاحية</th>
                  <th>العميل</th>
                  <th>الترتيب الحالي</th>
                  <th>الترتيب السابق</th>
                  <th>حجم البحث</th>
                  <th>الصعوبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seoKeywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-900">{kw.keyword}</td>
                    <td className="text-slate-500">{kw.clientName}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        #{kw.position}
                      </span>
                    </td>
                    <td className="text-slate-400">#{kw.previousPosition}</td>
                    <td className="text-slate-600 font-semibold">{kw.searchVolume.toLocaleString()}/mo</td>
                    <td>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {kw.difficulty}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 10. Web Developer
  if (roleCode === 'developer') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-blue-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md">
          <span className="rounded bg-blue-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            DEV & ENGINEERING HUB
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `مساحة مطور البرمجيات - ${currentUser.name}` : `Web Developer Hub - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-blue-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'معالجة التذاكر البرمجية، الـ Sprints، تحسين سرعة المواقع، وإصلاح الـ Bugs والربط البرمجي.'
              : 'Sprint board, pull requests, tech tickets, bug fixes, and infrastructure speed audits.'}
          </p>
        </div>

        <div className="card-shal p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">التذاكر البرمجية المسندة إليك</h3>
            <span className="text-xs text-slate-500">{tickets.length} تذاكر نشطة</span>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      t.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">{t.sprint}</span>
                </div>
                <p className="text-xs text-slate-600">{t.description}</p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    git: {t.branchOrPr}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateTicketStatus(t.id, 'deployed')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      تأكيد النشر (Deployed)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 11. Media Buyer
  if (roleCode === 'media_buyer') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="rounded-2xl bg-gradient-to-l from-rose-950 via-slate-900 to-red-950 p-6 text-white shadow-md">
          <span className="rounded bg-rose-400 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase">
            MEDIA BUYING & PAID ADS
          </span>
          <h1 className="text-xl font-black mt-2">
            {language === 'ar' ? `غرفة عمليات الميديا باير - ${currentUser.name}` : `Media Buyer Command - ${currentUser.name}`}
          </h1>
          <p className="text-xs text-rose-200 max-w-xl mt-1">
            {language === 'ar'
              ? 'إدارة الحملات الممولة (Meta, Google, TikTok, Snapchat)، تحسين الـ ROAS، وتخفيض تكلفة الـ Lead والـ CPA.'
              : 'Paid ad campaigns tracking, real-time ROAS optimization, and budget scaling across ad channels.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className="card-shal p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 uppercase">
                  {camp.platform}
                </span>
                <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  ROAS {camp.roas}x
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{camp.name}</h4>
                <p className="text-[11px] text-slate-500">{camp.clientName}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-slate-50 text-center text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block">الإنفاق</span>
                  <span className="font-bold text-slate-800">{camp.spentTotal} SAR</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">العملاء (Leads)</span>
                  <span className="font-bold text-emerald-600">{camp.leadsCount}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">تكلفة الـ Lead</span>
                  <span className="font-bold text-slate-800">{camp.cpa} SAR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};
