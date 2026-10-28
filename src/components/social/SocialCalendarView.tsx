import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContentPost, SocialPlatform, ContentStatus, MediaType, Task } from '../../types';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  LayoutGrid,
  Plus,
  Check,
  RotateCcw,
  Clock,
  Instagram,
  Linkedin,
  Twitter,
  Share2,
  Image as ImageIcon,
  Film,
  Sparkles,
  Search,
  Filter,
  Eye,
  X,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  Palette,
  Layers,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface DraggedItemData {
  type: 'post' | 'task';
  id: string;
  title: string;
  sourceDate?: string;
}

export const SocialCalendarView: React.FC = () => {
  const {
    contentPosts,
    tasks,
    clients,
    projects,
    currentUser,
    addContentPost,
    updateContentPost,
    approvePost,
    requestChangesPost,
    hasPermission,
    language,
    showToast,
    updateTask,
  } = useApp();

  // View state: 'calendar' (Drag & Drop interactive calendar) or 'grid' (Cards overview)
  const [activeViewMode, setActiveViewMode] = useState<'calendar' | 'grid'>('calendar');

  // Calendar Date Navigation
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 1)); // Default to October 2026 for demo context
  const [draggedItem, setDraggedItem] = useState<DraggedItemData | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [showTasksDrawer, setShowTasksDrawer] = useState(true);

  // Modals
  const [previewPost, setPreviewPost] = useState<ContentPost | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Add Post Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formClientId, setFormClientId] = useState(clients[0]?.id || '');
  const [formPlatform, setFormPlatform] = useState<SocialPlatform>('instagram');
  const [formMediaType, setFormMediaType] = useState<MediaType>('image');
  const [formScheduledDate, setFormScheduledDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [formScheduledTime, setFormScheduledTime] = useState('18:00');
  const [formMediaUrl, setFormMediaUrl] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  );

  const canApprove = hasPermission('can_approve_content');
  const canPublish = hasPermission('can_publish_posts');

  // Filtered Content Posts
  const filteredPosts = contentPosts.filter((post) => {
    const matchesSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesClient = clientFilter === 'all' || post.clientId === clientFilter;
    return matchesSearch && matchesPlatform && matchesStatus && matchesClient;
  });

  // Filtered Design and Content Tasks (Social, Content, UI/UX)
  const designAndContentTasks = tasks.filter((t) => {
    const isCreative =
      t.teamType === 'content' ||
      t.teamType === 'social' ||
      t.teamType === 'uiux' ||
      (t.title && (t.title.includes('تصميم') || t.title.includes('محتوى') || t.title.includes('سوشيال')));
    const matchesClient = clientFilter === 'all' || !t.clientId || t.clientId === clientFilter;
    return isCreative && matchesClient;
  });

  // Month Calendar Grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // We start weeks on Saturday (index 6) or Sunday (index 0) in Arabic locales. Let's use Saturday as day 0.
  // JS getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Map JS day to Saturday-based index: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
  const getSaturdayBasedDay = (day: number) => (day === 6 ? 0 : day + 1);

  const startDayPadding = getSaturdayBasedDay(firstDayOfMonth.getDay());
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Build calendar matrix (42 cells: 6 rows of 7 days)
  const calendarCells = [];
  // Previous month trailing days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startDayPadding - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = prevMonthDate.toISOString().slice(0, 10);
    calendarCells.push({
      date: prevMonthDate,
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      date,
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateStr = nextMonthDate.toISOString().slice(0, 10);
    calendarCells.push({
      date: nextMonthDate,
      dateStr,
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  const arabicMonths = [
    'يناير (January)',
    'فبراير (February)',
    'مارس (March)',
    'أبريل (April)',
    'مايو (May)',
    'يونيو (June)',
    'يوليو (July)',
    'أغسطس (August)',
    'سبتمبر (September)',
    'أكتوبر (October)',
    'نوفمبر (November)',
    'ديسمبر (December)',
  ];

  const weekDayLabels = [
    { ar: 'السبت', en: 'Sat' },
    { ar: 'الأحد', en: 'Sun' },
    { ar: 'الإثنين', en: 'Mon' },
    { ar: 'الثلاثاء', en: 'Tue' },
    { ar: 'الأربعاء', en: 'Wed' },
    { ar: 'الخميس', en: 'Thu' },
    { ar: 'الجمعة', en: 'Fri' },
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, item: DraggedItemData) => {
    setDraggedItem(item);
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);

    let droppedData: DraggedItemData | null = draggedItem;
    if (!droppedData) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) droppedData = JSON.parse(raw);
      } catch (err) {
        console.warn('Drop parse error:', err);
      }
    }

    if (!droppedData) return;

    if (droppedData.type === 'post') {
      updateContentPost(droppedData.id, { scheduledDate: targetDateStr });
      showToast({
        type: 'success',
        title: 'تم تغيير موعد المنشور 📅',
        message: `تم نقل المنشور "${droppedData.title}" بنجاح إلى تاريخ ${targetDateStr}`,
      });
    } else if (droppedData.type === 'task') {
      updateTask(droppedData.id, { dueDate: targetDateStr });
      showToast({
        type: 'success',
        title: 'تم تحديث موعد تسليم المهمة 🎨',
        message: `تمت جدولة مهمة "${droppedData.title}" إلى تاريخ ${targetDateStr}`,
      });
    }

    setDraggedItem(null);
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-3.5 w-3.5 text-pink-600" />;
      case 'linkedin':
        return <Linkedin className="h-3.5 w-3.5 text-blue-700" />;
      case 'twitter':
      case 'x':
        return <Twitter className="h-3.5 w-3.5 text-sky-500" />;
      case 'tiktok':
        return <Film className="h-3.5 w-3.5 text-slate-900" />;
      default:
        return <Share2 className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            مسودة (Draft)
          </span>
        );
      case 'review':
        return (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 animate-pulse">
            بانتظار المراجعة
          </span>
        );
      case 'approved':
        return (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            معتمد (Approved)
          </span>
        );
      case 'scheduled':
        return (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
            مجدول للنشر
          </span>
        );
      case 'published':
        return (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            تم النشر (Published)
          </span>
        );
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    addContentPost({
      clientId: formClientId,
      projectId: projects.find((p) => p.clientId === formClientId)?.id || 'proj-1',
      title: formTitle,
      caption: formCaption,
      hashtags: [],
      platform: formPlatform,
      mediaType: formMediaType,
      mediaUrl: formMediaUrl,
      scheduledDate: formScheduledDate,
      scheduledTime: formScheduledTime,
      authorId: currentUser.id,
    });

    setIsAddModalOpen(false);
    setFormTitle('');
    setFormCaption('');
    showToast({
      type: 'success',
      title: 'تم إنشاء المنشور',
      message: `تمت جدولة المنشور بتاريخ ${formScheduledDate}`,
    });
  };

  const handleConvertTaskToPost = (task: Task) => {
    setFormTitle(task.title);
    setFormCaption(task.description || `محتوى خاص بمهمة: ${task.title}`);
    setFormClientId(task.clientId || clients[0]?.id || '');
    if (task.dueDate) {
      setFormScheduledDate(task.dueDate);
    }
    setSelectedTask(null);
    setIsAddModalOpen(true);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1b24f5] to-indigo-600 text-white shadow-md shadow-indigo-200">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {language === 'ar' ? 'تقويم السوشيال ميديا وجدولة المحتوى' : 'Social Content & Scheduling'}
                <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                  سحب وإفلات تفاعلي 🖐️
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'قم بسحب وإفلات مهام التصميم والمنشورات مباشرة على أي يوم في التقويم لإعادة جدولتها وتغيير مواعيدها بصرياً.'
                  : 'Drag and drop design tasks and content posts directly onto calendar days to reschedule visually.'}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Action Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-inner">
            <button
              onClick={() => setActiveViewMode('calendar')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                activeViewMode === 'calendar'
                  ? 'bg-white text-[#1b24f5] shadow-xs scale-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              {language === 'ar' ? 'عرض التقويم التفاعلي (DnD)' : 'Calendar Grid'}
            </button>
            <button
              onClick={() => setActiveViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                activeViewMode === 'grid'
                  ? 'bg-white text-[#1b24f5] shadow-xs scale-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              {language === 'ar' ? 'عرض البطاقات' : 'Cards Grid'}
            </button>
          </div>

          <button
            onClick={() => {
              setFormScheduledDate(new Date().toISOString().slice(0, 10));
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1b24f5] to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-300/40 hover:from-[#161dc2] hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'منشور جديد' : 'New Post'}
          </button>
        </div>
      </div>

      {/* Interactive Helper Banner with DnD instructions */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-purple-50/80 border border-indigo-100 p-3.5 text-xs text-indigo-950 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs text-indigo-600 font-bold border border-indigo-100">
            🖐️
          </div>
          <div>
            <p className="font-bold text-indigo-900 flex items-center gap-1.5">
              <span>{language === 'ar' ? 'طريقة الجدولة السريعة بالسحب والإفلات:' : 'Drag & Drop Scheduling:'}</span>
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] text-[#1b24f5] font-black border border-indigo-200">
                مفعلة تلقائياً
              </span>
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {language === 'ar'
                ? 'امسك أي منشور أو مهمة تصميم من صندوق المهام الجانبي أو من داخل التقويم، ثم أفلته في اليوم المطلوب لتحديث التاريخ فوراً.'
                : 'Grab any post or creative task and drop it into any calendar cell to update its schedule instantly.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowTasksDrawer(!showTasksDrawer)}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
            showTasksDrawer
              ? 'bg-white text-indigo-700 border-indigo-200 shadow-xs'
              : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-xs'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          {showTasksDrawer
            ? (language === 'ar' ? 'إخفاء صندوق مهام التصميم' : 'Hide Tasks Pool')
            : (language === 'ar' ? 'إظهار مهام التصميم المتاحة للجدولة' : 'Show Tasks Pool')}
        </button>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث في العناوين، الكابشن، الأفكار...' : 'Search posts and copy...'}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-9 pl-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b24f5]/30 transition-all"
          />
        </div>

        {/* Client selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            {language === 'ar' ? 'العميل:' : 'Client:'}
          </span>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b24f5]/30 transition-all"
          >
            <option value="all">{language === 'ar' ? 'كافة العملاء' : 'All Clients'}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Platform filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'all', labelAr: 'كل المنصات', labelEn: 'All' },
            { id: 'instagram', labelAr: 'Instagram', labelEn: 'Instagram' },
            { id: 'linkedin', labelAr: 'LinkedIn', labelEn: 'LinkedIn' },
            { id: 'twitter', labelAr: 'Twitter / X', labelEn: 'Twitter / X' },
            { id: 'tiktok', labelAr: 'TikTok', labelEn: 'TikTok' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPlatformFilter(item.id)}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                platformFilter === item.id
                  ? 'bg-[#1b24f5] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {language === 'ar' ? item.labelAr : item.labelEn}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'review', label: 'مراجعة' },
            { id: 'approved', label: 'معتمد' },
            { id: 'scheduled', label: 'مجدول' },
            { id: 'published', label: 'نُشر' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`rounded-xl px-2 py-1 text-[11px] font-semibold whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Split into Task Pool + Calendar Grid or Cards View */}
      {activeViewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Creative Tasks & Posts Staging Drawer (Pool for Drag & Drop) */}
          {showTasksDrawer && (
            <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#1b24f5]" />
                  <h3 className="text-xs font-extrabold text-slate-900">
                    {language === 'ar' ? 'مهام التصميم والمحتوى' : 'Creative Tasks Pool'}
                  </h3>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800">
                  {designAndContentTasks.length} مهمة
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {language === 'ar'
                  ? 'اسحب أي مهمة إبداعية وأفلتها على تاريخ في التقويم لجدولتها فوراً أو تحويلها لمنشور:'
                  : 'Drag any task and drop it on a calendar day to schedule or convert to post:'}
              </p>

              {/* Tasks List */}
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {designAndContentTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    لا توجد مهام تصميم غير مجدولة
                  </div>
                ) : (
                  designAndContentTasks.map((t) => {
                    const client = clients.find((c) => c.id === t.clientId);
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, {
                            type: 'task',
                            id: t.id,
                            title: t.title,
                            sourceDate: t.dueDate,
                          })
                        }
                        onDragEnd={handleDragEnd}
                        className="group relative rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-2xs hover:border-indigo-400 hover:bg-white hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-indigo-600 transition-colors" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold text-[#1b24f5] truncate max-w-[110px]">
                                {client?.name || 'وكالة شال'}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                  t.priority === 'urgent'
                                    ? 'bg-rose-100 text-rose-700'
                                    : t.priority === 'high'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {t.priority === 'urgent' ? 'عاجل' : t.priority === 'high' ? 'أولوية' : 'عادي'}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                              {t.title}
                            </h4>

                            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {t.dueDate || 'بدون تاريخ'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleConvertTaskToPost(t)}
                                className="text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                {language === 'ar' ? '+ تحويل لمنشور' : '+ To Post'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Drag Prompt Hint */}
                        <div className="mt-1.5 hidden group-hover:flex items-center justify-center gap-1 rounded-md bg-indigo-50 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-100">
                          <span>اسحب للتقويم 📅</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Full Interactive Month Calendar Grid */}
          <div className={`${showTasksDrawer ? 'lg:col-span-3' : 'lg:col-span-4'} rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4`}>
            {/* Calendar Month Navigation Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#1b24f5]" />
                  <span>{arabicMonths[month]}</span>
                  <span className="text-indigo-600 font-extrabold">{year}</span>
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  {filteredPosts.length} منشور مجدول
                </span>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToday}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {language === 'ar' ? 'اليوم' : 'Today'}
                </button>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    title="الشهر السابق"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    title="الشهر التالي"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-600 pb-1 border-b border-slate-100">
              {weekDayLabels.map((day, idx) => (
                <div key={idx} className="py-1">
                  <span className="text-slate-900">{day.ar}</span>
                  <span className="block text-[10px] font-semibold text-slate-400">{day.en}</span>
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix (Drop Targets) */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                const dayPosts = filteredPosts.filter((p) => p.scheduledDate === cell.dateStr);
                const dayTasks = designAndContentTasks.filter((t) => t.dueDate === cell.dateStr);
                const isToday = cell.dateStr === todayStr;
                const isOver = dragOverDate === cell.dateStr;

                return (
                  <div
                    key={idx}
                    onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                    onDrop={(e) => handleDrop(e, cell.dateStr)}
                    className={`group relative min-h-[115px] sm:min-h-[125px] rounded-xl border p-2 flex flex-col justify-between transition-all select-none ${
                      isOver
                        ? 'border-2 border-dashed border-[#1b24f5] bg-blue-50/90 shadow-md ring-2 ring-[#1b24f5]/30 scale-[1.02] z-10'
                        : cell.isCurrentMonth
                        ? isToday
                          ? 'border-indigo-400 bg-indigo-50/40 shadow-xs'
                          : 'border-slate-200/90 bg-white hover:border-indigo-200 hover:bg-slate-50/50'
                        : 'border-slate-100 bg-slate-50/40 opacity-50 hover:opacity-80'
                    }`}
                  >
                    {/* Day Cell Top Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                          isToday
                            ? 'bg-[#1b24f5] text-white shadow-xs'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Quick Add Post on this Day Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setFormScheduledDate(cell.dateStr);
                          setIsAddModalOpen(true);
                        }}
                        title={`جدولة منشور في ${cell.dateStr}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-md hover:bg-slate-200 text-slate-600"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Drag Over Visual Indicator Pill */}
                    {isOver && (
                      <div className="my-auto text-center animate-bounce">
                        <span className="rounded-lg bg-[#1b24f5] px-2 py-1 text-[10px] font-black text-white shadow-md">
                          أفلت هنا للجدولة 🎯
                        </span>
                      </div>
                    )}

                    {/* Posts and Tasks Scheduled on this Day */}
                    <div className="space-y-1.5 overflow-y-auto max-h-[85px] pr-0.5">
                      {/* Content Posts */}
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, {
                              type: 'post',
                              id: post.id,
                              title: post.title,
                              sourceDate: post.scheduledDate,
                            })
                          }
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            setPreviewPost(post);
                            setShowRejectBox(false);
                            setRejectFeedback('');
                          }}
                          className={`rounded-lg border p-1.5 text-right shadow-2xs transition-all cursor-grab active:cursor-grabbing hover:shadow-xs hover:scale-[1.01] ${
                            post.status === 'approved'
                              ? 'border-indigo-200 bg-indigo-50/90 text-indigo-950'
                              : post.status === 'scheduled'
                              ? 'border-purple-200 bg-purple-50/90 text-purple-950'
                              : post.status === 'published'
                              ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
                              : post.status === 'review'
                              ? 'border-amber-200 bg-amber-50/90 text-amber-950'
                              : 'border-slate-200 bg-white text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="flex items-center gap-1 font-bold text-[10px] truncate max-w-[90px]">
                              {getPlatformIcon(post.platform)}
                              {post.title}
                            </span>
                            <span className="text-[9px] text-slate-500 shrink-0">
                              {post.scheduledTime}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Design Tasks on this date */}
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, {
                              type: 'task',
                              id: t.id,
                              title: t.title,
                              sourceDate: t.dueDate,
                            })
                          }
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedTask(t)}
                          className="rounded-lg border border-dashed border-blue-300 bg-blue-50/60 p-1 text-right text-[10px] font-bold text-blue-900 shadow-2xs hover:bg-blue-100/70 transition-all cursor-grab active:cursor-grabbing truncate"
                        >
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 ml-1" />
                          مهمة: {t.title}
                        </div>
                      ))}
                    </div>

                    {/* Bottom Status bar */}
                    <div className="mt-1 pt-1 border-t border-slate-100/60 flex items-center justify-between text-[9px] text-slate-400">
                      <span>{dayPosts.length > 0 ? `${dayPosts.length} منشور` : ''}</span>
                      <span>{dayTasks.length > 0 ? `${dayTasks.length} مهمة` : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Alternative View Mode: Cards Grid */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const client = clients.find((c) => c.id === post.clientId);

            return (
              <div
                key={post.id}
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, {
                    type: 'post',
                    id: post.id,
                    title: post.title,
                    sourceDate: post.scheduledDate,
                  })
                }
                onDragEnd={handleDragEnd}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:border-indigo-300 hover:shadow-md cursor-grab active:cursor-grabbing"
              >
                <div>
                  {/* Media Image / Video Banner */}
                  <div className="relative aspect-video w-full bg-slate-900/10 overflow-hidden group">
                    {post.mediaUrl ? (
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}

                    {/* Badges on top */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 backdrop-blur-xs shadow-xs">
                        {getPlatformIcon(post.platform)}
                        {post.platform.toUpperCase()}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      {getStatusBadge(post.status)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-[#1b24f5] truncate max-w-[180px]">
                        {client?.name}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" />
                        {post.scheduledDate} ({post.scheduledTime})
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{post.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>

                    {/* Feedback notice if any */}
                    {post.feedbackNote && (
                      <div className="mt-2.5 rounded-lg bg-rose-50 p-2 text-[11px] text-rose-800 border border-rose-200">
                        <strong>{language === 'ar' ? 'تعديل مطلوب:' : 'Feedback:'}</strong> {post.feedbackNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Controls & Approval Workflow */}
                <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setPreviewPost(post);
                        setShowRejectBox(false);
                        setRejectFeedback('');
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      {language === 'ar' ? 'معاينة المنشور' : 'Live Mockup'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {post.status === 'review' && canApprove && (
                        <>
                          <button
                            onClick={() => {
                              setPreviewPost(post);
                              setShowRejectBox(true);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {language === 'ar' ? 'طلب تعديل' : 'Reject'}
                          </button>
                          <button
                            onClick={() => approvePost(post.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {language === 'ar' ? 'اعتماد' : 'Approve'}
                          </button>
                        </>
                      )}

                      {post.status === 'draft' && (
                        <button
                          onClick={() => updateContentPost(post.id, { status: 'review' })}
                          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 shadow-xs"
                        >
                          {language === 'ar' ? 'إرسال للمراجعة' : 'Submit for Review'}
                        </button>
                      )}

                      {post.status === 'approved' && canPublish && (
                        <button
                          onClick={() => updateContentPost(post.id, { status: 'scheduled' })}
                          className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-xs"
                        >
                          {language === 'ar' ? 'جدولة النشر' : 'Schedule'}
                        </button>
                      )}

                      {post.status === 'scheduled' && canPublish && (
                        <button
                          onClick={() => updateContentPost(post.id, { status: 'published' })}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
                        >
                          {language === 'ar' ? 'نُشر بالفعل' : 'Mark Published'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Quick Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#1b24f5]" />
                <h3 className="text-xs font-bold text-slate-900">
                  {language === 'ar' ? 'تفاصيل مهمة التصميم والمحتوى' : 'Design Task Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">عنوان المهمة:</span>
                <p className="font-bold text-slate-900 text-sm">{selectedTask.title}</p>
              </div>

              {selectedTask.description && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">الوصف والمتطلبات:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">موعد التسليم:</span>
                  <span className="font-bold">{selectedTask.dueDate || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">الحالة:</span>
                  <span className="font-bold capitalize">{selectedTask.status}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={() => handleConvertTaskToPost(selectedTask)}
                  className="rounded-xl bg-[#1b24f5] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#161dc2] shadow-xs"
                >
                  تحويل لمنشور سوشيال ميديا 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Social Mockup Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-slate-100">
                  {getPlatformIcon(previewPost.platform)}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'معاينة المنشور الميدانية' : 'Social Mockup Preview'}
                  </h3>
                  <span className="text-[10px] text-slate-400 capitalize">{previewPost.platform} Feed</span>
                </div>
              </div>

              <button
                onClick={() => setPreviewPost(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Social Post Feed Box Mockup */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {/* Account Bar */}
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-xs font-extrabold text-slate-800">
                      {clients.find((c) => c.id === previewPost.clientId)?.name.slice(0, 1) || 'A'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {clients.find((c) => c.id === previewPost.clientId)?.company || 'Brand Account'}
                    </p>
                    <p className="text-[10px] text-slate-400">Sponsored • Managed by Shal Agency</p>
                  </div>
                </div>
              </div>

              {/* Media Image */}
              {previewPost.mediaUrl && (
                <img
                  src={previewPost.mediaUrl}
                  alt={previewPost.title}
                  className="w-full max-h-72 object-cover"
                />
              )}

              {/* Caption & Description */}
              <div className="p-3 text-xs">
                <p className="font-bold text-slate-900 mb-1">{previewPost.title}</p>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{previewPost.caption}</p>
                <p className="text-[11px] text-indigo-600 font-semibold mt-2">
                  #marketing #agency #{previewPost.platform} #growth
                </p>
              </div>
            </div>

            {/* Reject with Feedback Box */}
            {showRejectBox && (
              <div className="mt-3 rounded-xl bg-rose-50 p-3 border border-rose-200">
                <label className="text-xs font-bold text-rose-900 block mb-1">
                  {language === 'ar' ? 'سبب طلب التعديل والتوجيه للكاتب:' : 'Feedback for the creator:'}
                </label>
                <textarea
                  rows={2}
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  placeholder="مثال: يرجى استبدال الصورة بأخرى توضح خصائص التطبيق أكثر مع تعديل الهوك..."
                  className="w-full rounded-lg border border-rose-200 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setShowRejectBox(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (!rejectFeedback.trim()) return;
                      requestChangesPost(previewPost.id, rejectFeedback.trim());
                      setPreviewPost(null);
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
                  >
                    إرسال التعديل للكاتب
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'تاريخ النشر:' : 'Date:'} {previewPost.scheduledDate} ({previewPost.scheduledTime})
              </span>

              {previewPost.status === 'review' && canApprove && !showRejectBox && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    طلب تعديل
                  </button>
                  <button
                    onClick={() => {
                      approvePost(previewPost.id);
                      setPreviewPost(null);
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    اعتماد النشر
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Content Post Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'إنشاء مسودة محتوى سوشيال ميديا جديدة' : 'Create Social Post Draft'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'العميل المستهدف *' : 'Client *'}
                </label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'فكرة / عنوان المنشور *' : 'Post Title / Angle *'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: 5 نصائح ذكية لتقليل الهدر المالي للشركات"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'نص الكابشن الكامل (Copywriting) *' : 'Post Caption / Copy *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="اكتب الهوك والمحتوى وقفل الدعوة لاتخاذ إجراء (CTA) والهاشتاغات هنا..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المنصة' : 'Platform'}
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نوع الوسائط' : 'Media Type'}
                  </label>
                  <select
                    value={formMediaType}
                    onChange={(e) => setFormMediaType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="image">تصميم صورة فردية (Image)</option>
                    <option value="carousel">كاروسيل شرائح (Carousel)</option>
                    <option value="reel">فيديو ريل / تيك توك (Reel/Video)</option>
                    <option value="text">نص فقط (Text Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'رابط التصميم / صورة المعاينة' : 'Media Asset URL'}
                </label>
                <input
                  type="text"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تاريخ النشر المخطط' : 'Publish Date'}
                  </label>
                  <input
                    type="date"
                    value={formScheduledDate}
                    onChange={(e) => setFormScheduledDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'وقت النشر' : 'Publish Time'}
                  </label>
                  <input
                    type="time"
                    value={formScheduledTime}
                    onChange={(e) => setFormScheduledTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1b24f5] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#161dc2] shadow-xs cursor-pointer"
                >
                  {language === 'ar' ? 'حفظ وجدولة' : 'Schedule Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
