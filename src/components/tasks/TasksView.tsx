import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, TaskPriority, VisualDeliverable, DeliverableCategory } from '../../types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List as ListIcon,
  Calendar,
  Clock,
  MessageSquare,
  User,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  AlertTriangle,
  Trash2,
  X,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Paperclip,
  ExternalLink,
  Upload,
  Layers,
  Flame,
  Zap,
  RotateCcw,
  Send,
  FileText,
  FileDown,
  Printer,
  Copy,
  Download,
  Video,
  PenTool,
  Film,
  CheckCircle2,
  Briefcase,
  ShieldAlert,
  GripVertical,
  Lock,
  FolderKanban,
  Link2,
  Unlink,
  GitFork,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export interface QuickTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'social' | 'design';
  deliverableCategory?: DeliverableCategory;
  title: string;
  description: string;
  priority: TaskPriority;
  dimensions: string;
  subtasks: string[];
  mockupUrl?: string;
}

export const DELIVERABLE_CATEGORIES: {
  id: DeliverableCategory | 'all';
  nameAr: string;
  nameEn: string;
  icon: any;
  color: string;
  activeClass: string;
  inactiveClass: string;
}[] = [
  {
    id: 'all',
    nameAr: 'كافة التصنيفات',
    nameEn: 'All Categories',
    icon: Layers,
    color: 'text-slate-700',
    activeClass: 'bg-slate-900 text-white shadow-xs font-bold',
    inactiveClass: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  },
  {
    id: 'social_design',
    nameAr: 'تصميم سوشيال',
    nameEn: 'Social Design',
    icon: Palette,
    color: 'text-indigo-600',
    activeClass: 'bg-indigo-600 text-white shadow-xs font-bold',
    inactiveClass: 'text-indigo-700 hover:bg-indigo-50 border border-indigo-200/60',
  },
  {
    id: 'video_content',
    nameAr: 'محتوى فيديو',
    nameEn: 'Video Content',
    icon: Video,
    color: 'text-rose-600',
    activeClass: 'bg-rose-600 text-white shadow-xs font-bold',
    inactiveClass: 'text-rose-700 hover:bg-rose-50 border border-rose-200/60',
  },
  {
    id: 'creative_writing',
    nameAr: 'كتابة إبداعية',
    nameEn: 'Creative Writing',
    icon: PenTool,
    color: 'text-emerald-600',
    activeClass: 'bg-emerald-600 text-white shadow-xs font-bold',
    inactiveClass: 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60',
  },
  {
    id: 'motion_graphics',
    nameAr: 'موشن جرافيك',
    nameEn: 'Motion Graphics',
    icon: Film,
    color: 'text-amber-600',
    activeClass: 'bg-amber-600 text-white shadow-xs font-bold',
    inactiveClass: 'text-amber-700 hover:bg-amber-50 border border-amber-200/60',
  },
  {
    id: 'branding_identity',
    nameAr: 'هوية بصرية',
    nameEn: 'Branding Identity',
    icon: Sparkles,
    color: 'text-purple-600',
    activeClass: 'bg-purple-600 text-white shadow-xs font-bold',
    inactiveClass: 'text-purple-700 hover:bg-purple-50 border border-purple-200/60',
  },
];

const TASK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'tpl-fb-post',
    nameAr: 'بوست فيسبوك / إنستغرام',
    nameEn: 'FB / IG Square Post',
    category: 'design',
    deliverableCategory: 'social_design',
    title: 'تصميم بوست فيسبوك وإنستغرام تفاعلي 1:1',
    description: 'تصميم إبداعي بالهوية البصرية الرسمية، متضمن النص التسويقي والـ Hook وعناصر البراند والدعوة للإجراء CTA.',
    priority: 'medium',
    dimensions: '1080x1080 (Square Post)',
    subtasks: [
      'تحديد الفكرة الرئيسية والنص التسويقي (Hook)',
      'تجهيز عناصر التصميم والرموز البصرية',
      'مواءمة الألوان والخطوط مع هوية العميل',
      'تصدير النسخة النهائية بصيغة PNG عالية الدقة',
    ],
    mockupUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'tpl-carousel',
    nameAr: 'كاروسيل إنستغرام (5 شرائح)',
    nameEn: '5-Slide Carousel',
    category: 'design',
    deliverableCategory: 'social_design',
    title: 'تصميم كاروسيل إنستغرام تعليمي (5 شرائح)',
    description: 'كاروسيل مقاس 1080x1350 يروي فكرة متسلسلة عبر 5 شرائح مع غلاف جذاب وعناصر بصرية مستمرة.',
    priority: 'high',
    dimensions: '1080x1350 (Instagram Carousel)',
    subtasks: [
      'تصميم شريحة الغلاف الجذابة (Slide 1 Hook)',
      'تصميم المحتوى الداخلي وشرح النقاط (Slides 2-4)',
      'تصميم شريحة التفاعل والحفظ والمشاركة (Slide 5 CTA)',
      'مراجعة ترقيم وتسلسل الشرائح في ملف العرض',
    ],
    mockupUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'tpl-reels-story',
    nameAr: 'ريلز / ستوري متحرك 9:16',
    nameEn: 'Reels / Story 9:16',
    category: 'design',
    deliverableCategory: 'video_content',
    title: 'تصميم أصول ريلز وستوري عمودي 9:16',
    description: 'أصول بصرية عمودية متوافقة مع إنستغرام ريلز وتيك توك، مع ترك مساحات آمنة للنصوص (Safe Zones).',
    priority: 'high',
    dimensions: '1080x1920 (Reels / Story)',
    subtasks: [
      'تصميم اللقطة الافتتاحية 3 ثوانٍ الأولى',
      'تصميم العناصر المتحركة والتراكب البصري Overlay',
      'مراعاة المنطقة الآمنة Safe Zones لـ Instagram & TikTok',
    ],
    mockupUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'tpl-motion-graphic',
    nameAr: 'فيديو موشن جرافيك (15 ثانية)',
    nameEn: '15s Motion Graphics',
    category: 'design',
    deliverableCategory: 'motion_graphics',
    title: 'تحريك وتصميم فيديو موشن جرافيك ترويجي 9:16',
    description: 'إنتاج موشن جرافيك إعلاني سريع للريلز والتيك توك متضمن تحريك الشعار والنصوص المؤثرة والصوتيات.',
    priority: 'urgent',
    dimensions: '1080x1920 (Motion 9:16)',
    subtasks: [
      'تجهيز الاسكريبت ولوحة المشاهد Storyboard',
      'رسم وتجهيز ملفات Illustrator للتحريك',
      'التحريك في After Effects وضبط التوقيتات والإيقاع',
      'إضافة المؤثرات الصوتية وتسليم Render بصيغة MP4',
    ],
    mockupUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'tpl-campaign-kit',
    nameAr: 'هوية بصرية لحملة إعلانية',
    nameEn: 'Campaign Visual Kit',
    category: 'design',
    deliverableCategory: 'branding_identity',
    title: 'حزمة تصاميم الحملة الإعلانية المتكاملة',
    description: 'تجهيز كامل المقاسات الإعلانية المتزامنة (بوستات، بنرات ويب، ستوري، كوفر فيسبوك).',
    priority: 'urgent',
    dimensions: 'Multi-Format Kit (1080x1080, 1080x1920, 1200x628)',
    subtasks: [
      'تثبيت الفكرة الإبداعية Key Visual للـ Campaign',
      'توليد المقاس المربع 1080x1080',
      'توليد المقاس الرأسي 1080x1920',
      'توليد البانر العريض 1200x628',
      'تسليم مجلد الأصول النهائي للعميل',
    ],
    mockupUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'tpl-social-matrix',
    nameAr: 'خطة محتوى أسبوعية (7 بوستات)',
    nameEn: 'Weekly Content Matrix',
    category: 'social',
    deliverableCategory: 'creative_writing',
    title: 'إعداد وجدولة مصفوفة المحتوى الأسبوعية',
    description: 'كتابة نصوص المحتوى، تحديد الهاشتاجات ومواعيد النشر المثالية لمنصات العميل.',
    priority: 'medium',
    dimensions: 'Social Plan Matrix',
    subtasks: [
      'تحديد ركائز المحتوى (Content Pillars) للأسبوع',
      'كتابة نصوص الكابشن لـ 7 منشورات',
      'ربط كل بوست بطلب التصميم المناسب للجرافيك ديزاينر',
      'تقديم الخطة للأكونت مانجر للاعتماد النهائي',
    ],
  },
];

export const TasksView: React.FC = () => {
  const {
    tasks,
    clients,
    projects,
    users,
    currentUser,
    addTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    addTaskComment,
    linkTaskDependency,
    hasPermission,
    language,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [teamFilter, setTeamFilter] = useState<'all' | 'social' | 'design'>('all');
  const [categoryFilter, setCategoryFilter] = useState<DeliverableCategory | 'all'>('all');
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);
  const [onlyWithAttachments, setOnlyWithAttachments] = useState(false);
  const [onlyWithDependencies, setOnlyWithDependencies] = useState(false);
  const [search, setSearch] = useState('');

  // Selected task for detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');

  // Dependency linking state in detail modal
  const [isLinkingDependencyInDetail, setIsLinkingDependencyInDetail] = useState(false);
  const [detailSelectedParentId, setDetailSelectedParentId] = useState('');
  const [detailDependencyNote, setDetailDependencyNote] = useState('');

  // Deliverable in detail modal
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [attachName, setAttachName] = useState('');
  const [attachType, setAttachType] = useState<'image' | 'video' | 'figma' | 'psd' | 'ai' | 'pdf'>('image');
  const [attachUrl, setAttachUrl] = useState('');
  const [attachDim, setAttachDim] = useState('1080x1350');
  const [attachSize, setAttachSize] = useState('2.4 MB');

  // Add Task Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formTeamType, setFormTeamType] = useState<'social' | 'design'>('design');
  const [formCategory, setFormCategory] = useState<DeliverableCategory>('social_design');
  const [formClientId, setFormClientId] = useState(clients[0]?.id || '');
  const [formProjectId, setFormProjectId] = useState(projects[0]?.id || '');
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [formAssignees, setFormAssignees] = useState<string[]>([currentUser.id]);
  const [formDimensions, setFormDimensions] = useState('1080x1350 (Instagram Carousel)');
  const [formSourceLink, setFormSourceLink] = useState('');
  const [formSubtasksList, setFormSubtasksList] = useState<string[]>([]);
  const [formUploadedFiles, setFormUploadedFiles] = useState<VisualDeliverable[]>([]);
  const [formDependsOnTaskId, setFormDependsOnTaskId] = useState<string>('');
  const [formDependencyNote, setFormDependencyNote] = useState<string>('');

  const canCreateTasks = hasPermission('can_create_tasks') || hasPermission('can_assign_tasks');
  const canAssign = hasPermission('can_assign_tasks');
  const canEditTasks = hasPermission('can_edit_tasks');
  const canDeleteTasks = hasPermission('can_delete_tasks');

  // Project filtering & DND states
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [kanbanColumnsMode, setKanbanColumnsMode] = useState<'standard4' | 'full6'>('standard4');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Graphic designer count
  const designTasksCount = tasks.filter(
    (t) => t.teamType === 'design' || (t.visualAttachments && t.visualAttachments.length > 0)
  ).length;

  // Tasks with dependencies count (either has a parent dependency or has tasks depending on it)
  const tasksWithDependenciesCount = tasks.filter(
    (t) => Boolean(t.dependsOnTaskId) || tasks.some((other) => other.dependsOnTaskId === t.id)
  ).length;

  // Task dependency inspector helper
  const getTaskDependencyInfo = (task: Task) => {
    const parentTask = task.dependsOnTaskId ? tasks.find((t) => t.id === task.dependsOnTaskId) : null;
    const childTasks = tasks.filter((t) => t.dependsOnTaskId === task.id);
    const isParentDone = parentTask
      ? parentTask.status === 'done' || parentTask.status === 'client_delivered'
      : false;
    const isBlocked = Boolean(parentTask && !isParentDone);
    const isReady = Boolean(parentTask && isParentDone);

    return {
      parentTask,
      childTasks,
      dependentTasks: childTasks,
      hasParent: Boolean(parentTask),
      hasChildren: childTasks.length > 0,
      isBlocked,
      isReady,
      hasDependency: Boolean(parentTask),
      hasDependents: childTasks.length > 0,
    };
  };

  // Dependency hover highlight layer state for Kanban Board
  const [hoveredPredecessorId, setHoveredPredecessorId] = useState<string | null>(null);
  const [hoveredDependentSourceId, setHoveredDependentSourceId] = useState<string | null>(null);

  const getTaskStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return language === 'ar' ? 'قيد الانتظار' : 'To Do';
      case 'in_progress':
        return language === 'ar' ? 'جاري التنفيذ' : 'In Progress';
      case 'review':
        return language === 'ar' ? 'مراجعة وتدقيق' : 'In Review';
      case 'changes_requested':
        return language === 'ar' ? 'تعديلات مطلوبة' : 'Changes Requested';
      case 'client_delivered':
        return language === 'ar' ? 'تم التسليم' : 'Delivered';
      case 'done':
        return language === 'ar' ? 'مكتمل ومعتمد' : 'Done';
      default:
        return status;
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());

    let matchesTeam = true;
    if (teamFilter === 'social') {
      matchesTeam = t.teamType === 'social';
    } else if (teamFilter === 'design') {
      matchesTeam = t.teamType === 'design' || Boolean(t.visualAttachments && t.visualAttachments.length > 0);
    }

    const matchesMy = !onlyMyTasks || t.assignedTo.includes(currentUser.id);
    const matchesAssets = !onlyWithAttachments || Boolean(t.visualAttachments && t.visualAttachments.length > 0);
    const matchesCategory = categoryFilter === 'all' || t.deliverableCategory === categoryFilter;
    const matchesProject = selectedProjectId === 'all' || t.projectId === selectedProjectId;
    const matchesDeps =
      !onlyWithDependencies ||
      Boolean(t.dependsOnTaskId) ||
      tasks.some((other) => other.dependsOnTaskId === t.id);

    return matchesSearch && matchesTeam && matchesMy && matchesAssets && matchesCategory && matchesProject && matchesDeps;
  });

  // Standard 4 Kanban Columns matching user specification: 'To Do', 'In Progress', 'Review', 'Done'
  const standardColumns: {
    id: TaskStatus;
    labelAr: string;
    labelEn: string;
    color: string;
    badgeBg: string;
    acceptStatuses: TaskStatus[];
  }[] = [
    {
      id: 'todo',
      labelAr: 'قيد الانتظار (To Do)',
      labelEn: 'To Do',
      color: 'border-slate-300 bg-slate-100/80 text-slate-700',
      badgeBg: 'bg-slate-500',
      acceptStatuses: ['todo'],
    },
    {
      id: 'in_progress',
      labelAr: 'جاري التنفيذ (In Progress)',
      labelEn: 'In Progress',
      color: 'border-[#4C5540]/30 bg-[#4C5540]/5 text-[#4C5540]',
      badgeBg: 'bg-[#4C5540]',
      acceptStatuses: ['in_progress'],
    },
    {
      id: 'review',
      labelAr: 'المراجعة والتدقيق (Review)',
      labelEn: 'Review',
      color: 'border-amber-300 bg-amber-50 text-amber-800',
      badgeBg: 'bg-amber-500',
      acceptStatuses: ['review', 'changes_requested'],
    },
    {
      id: 'done',
      labelAr: 'مكتمل ومعتمد (Done)',
      labelEn: 'Done',
      color: 'border-emerald-300 bg-emerald-50 text-emerald-800',
      badgeBg: 'bg-emerald-500',
      acceptStatuses: ['done', 'client_delivered'],
    },
  ];

  // Full 6 Granular Workflow Columns
  const fullColumns: {
    id: TaskStatus;
    labelAr: string;
    labelEn: string;
    color: string;
    badgeBg: string;
    acceptStatuses: TaskStatus[];
  }[] = [
    {
      id: 'todo',
      labelAr: 'قيد الانتظار (To Do)',
      labelEn: 'To Do',
      color: 'border-slate-300 bg-slate-100/80 text-slate-700',
      badgeBg: 'bg-slate-400',
      acceptStatuses: ['todo'],
    },
    {
      id: 'in_progress',
      labelAr: 'جاري التنفيذ (In Progress)',
      labelEn: 'In Progress',
      color: 'border-[#4C5540]/30 bg-[#4C5540]/5 text-[#4C5540]',
      badgeBg: 'bg-[#4C5540]',
      acceptStatuses: ['in_progress'],
    },
    {
      id: 'review',
      labelAr: 'مراجعة وتدقيق (Review)',
      labelEn: 'In Review',
      color: 'border-amber-300 bg-amber-50 text-amber-800',
      badgeBg: 'bg-amber-500',
      acceptStatuses: ['review'],
    },
    {
      id: 'changes_requested',
      labelAr: 'ملاحظات وتعديلات (Changes)',
      labelEn: 'Changes Req',
      color: 'border-rose-300 bg-rose-50 text-rose-800',
      badgeBg: 'bg-rose-500',
      acceptStatuses: ['changes_requested'],
    },
    {
      id: 'done',
      labelAr: 'مكتمل ومعتمد (Done)',
      labelEn: 'Approved',
      color: 'border-emerald-300 bg-emerald-50 text-emerald-800',
      badgeBg: 'bg-emerald-500',
      acceptStatuses: ['done'],
    },
    {
      id: 'client_delivered',
      labelAr: 'تم التسليم للعميل (Delivered)',
      labelEn: 'Delivered',
      color: 'border-teal-300 bg-teal-50 text-teal-800',
      badgeBg: 'bg-teal-600',
      acceptStatuses: ['client_delivered'],
    },
  ];

  const activeColumns = kanbanColumnsMode === 'standard4' ? standardColumns : fullColumns;

  // DND Drop Handler
  const handleDropTask = (taskId: string, targetColId: TaskStatus) => {
    if (!canEditTasks) {
      showToast({
        type: 'error',
        title: language === 'ar' ? 'صلاحية مرفوضة' : 'Permission Denied',
        message: language === 'ar'
          ? 'دورك الحالي لا يمتلك صلاحية تعديل حالة المهام (can_edit_tasks).'
          : 'Your current role lacks permission to update task status (can_edit_tasks).',
      });
      return;
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.status === targetColId) return;

    updateTaskStatus(taskId, targetColId);
    const colDef = activeColumns.find((c) => c.id === targetColId);

    showToast({
      type: 'success',
      title: language === 'ar' ? 'تم نقل المهمة بنجاح 🎯' : 'Task Moved Successfully',
      message: language === 'ar'
        ? `تم تحديث حالة "${task.title}" إلى: ${colDef?.labelAr || targetColId}`
        : `Moved "${task.title}" to ${colDef?.labelEn || targetColId}`,
    });
  };

  // Visual Deadline Indicator Helper
  const getDeadlineInfo = (dueDate: string, status: TaskStatus) => {
    const isComplete = status === 'done' || status === 'client_delivered';
    const today = new Date().toISOString().slice(0, 10);

    if (isComplete) {
      return {
        label: dueDate,
        isOverdue: false,
        isDueSoon: false,
        badgeClass: 'text-slate-400 bg-slate-100',
        cardHighlight: '',
      };
    }

    if (dueDate < today) {
      return {
        label: `${dueDate} (متأخر)`,
        isOverdue: true,
        isDueSoon: false,
        badgeClass: 'bg-rose-100 text-rose-700 font-extrabold border border-rose-200 animate-pulse',
        cardHighlight: 'border-rose-300 ring-1 ring-rose-300/60 bg-rose-50/20',
      };
    }

    if (dueDate === today) {
      return {
        label: `${dueDate} (اليوم)`,
        isOverdue: false,
        isDueSoon: true,
        badgeClass: 'bg-amber-100 text-amber-800 font-extrabold border border-amber-300',
        cardHighlight: 'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/10',
      };
    }

    // Proximity in days
    const dueTime = new Date(dueDate).getTime();
    const todayTime = new Date(today).getTime();
    const diffDays = Math.ceil((dueTime - todayTime) / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) {
      return {
        label: `${dueDate} (${diffDays} يوم)`,
        isOverdue: false,
        isDueSoon: true,
        badgeClass: 'bg-sky-50 text-[#1b24f5] font-semibold border border-sky-200',
        cardHighlight: '',
      };
    }

    return {
      label: dueDate,
      isOverdue: false,
      isDueSoon: false,
      badgeClass: 'text-slate-500 bg-slate-50',
      cardHighlight: '',
    };
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">عاجل (Urgent)</span>;
      case 'high':
        return <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">مرتفع (High)</span>;
      case 'medium':
        return <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">متوسط (Med)</span>;
      case 'low':
        return <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">منخفض (Low)</span>;
    }
  };

  const getCategoryBadge = (category?: DeliverableCategory) => {
    switch (category) {
      case 'social_design':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-200">
            <Palette className="h-2.5 w-2.5" />
            {language === 'ar' ? 'تصميم سوشيال' : 'Social Design'}
          </span>
        );
      case 'video_content':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-200">
            <Video className="h-2.5 w-2.5" />
            {language === 'ar' ? 'محتوى فيديو' : 'Video Content'}
          </span>
        );
      case 'creative_writing':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
            <PenTool className="h-2.5 w-2.5" />
            {language === 'ar' ? 'كتابة إبداعية' : 'Creative Writing'}
          </span>
        );
      case 'motion_graphics':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200">
            <Film className="h-2.5 w-2.5" />
            {language === 'ar' ? 'موشن جرافيك' : 'Motion Graphics'}
          </span>
        );
      case 'branding_identity':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 border border-purple-200">
            <Sparkles className="h-2.5 w-2.5" />
            {language === 'ar' ? 'هوية بصرية' : 'Branding'}
          </span>
        );
      default:
        return null;
    }
  };

  // Weekly productivity report helpers
  const completedWeeklyTasks = tasks.filter(
    (t) => t.status === 'done' || t.status === 'client_delivered'
  );

  const handleExportTextReport = () => {
    const dateStr = new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let report = `====================================================\n`;
    report += `📊 تقرير الإنتاجية الأسبوعي - وكالة نبض الوصول للحلول الرقمية\n`;
    report += `📅 تاريخ التصدير: ${dateStr}\n`;
    report += `====================================================\n\n`;

    report += `[1. الملخص الإحصائي العام]\n`;
    report += `- إجمالي المهام المنجزة والمعتمدة: ${completedWeeklyTasks.length} مهمة\n`;
    report += `- تصاميم السوشيال ميديا: ${completedWeeklyTasks.filter((t) => t.deliverableCategory === 'social_design').length}\n`;
    report += `- مقاطع ومحتوى الفيديو: ${completedWeeklyTasks.filter((t) => t.deliverableCategory === 'video_content').length}\n`;
    report += `- تصاميم الموشن جرافيك: ${completedWeeklyTasks.filter((t) => t.deliverableCategory === 'motion_graphics').length}\n`;
    report += `- كتابة المحتوى الإبداعي: ${completedWeeklyTasks.filter((t) => t.deliverableCategory === 'creative_writing').length}\n`;
    report += `- حزم الهويات البصرية: ${completedWeeklyTasks.filter((t) => t.deliverableCategory === 'branding_identity').length}\n\n`;

    report += `[2. تفاصيل المهام المنجزة والمسلمة للعملاء]\n`;
    if (completedWeeklyTasks.length === 0) {
      report += `لا توجد مهام مكتملة في هذه الفترة حتى الآن.\n`;
    } else {
      completedWeeklyTasks.forEach((t, idx) => {
        const client = clients.find((c) => c.id === t.clientId)?.name || 'العميل';
        const assignedNames = users
          .filter((u) => t.assignedTo.includes(u.id))
          .map((u) => u.name)
          .join(', ') || 'فريق العمل';
        const categoryLabel =
          t.deliverableCategory === 'social_design'
            ? 'تصميم سوشيال'
            : t.deliverableCategory === 'video_content'
            ? 'محتوى فيديو'
            : t.deliverableCategory === 'motion_graphics'
            ? 'موشن جرافيك'
            : t.deliverableCategory === 'branding_identity'
            ? 'هوية بصرية'
            : 'كتابة إبداعية';

        report += `${idx + 1}. [${t.title}]\n`;
        report += `   - التصنيف: ${categoryLabel}\n`;
        report += `   - العميل: ${client}\n`;
        report += `   - المنفذ: ${assignedNames}\n`;
        report += `   - الحالة: ${t.status === 'client_delivered' ? 'تم التسليم للعميل بنجاح ✅' : 'مكتمل ومعتمد داخلياً 👍'}\n`;
        report += `   - تاريخ الاستحقاق: ${t.dueDate}\n`;
        if (t.visualAttachments && t.visualAttachments.length > 0) {
          report += `   - المرفقات البصرية: ${t.visualAttachments.length} ملف\n`;
        }
        report += `\n`;
      });
    }

    report += `====================================================\n`;
    report += `تم استخراج هذا التقرير تلقائياً بواسطة نظام إدارة نبض الوصول (Nabd Al Wusool OMS)\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nabd_weekly_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'تم تصدير التقرير النصي بنجاح 📥',
      message: 'تم تحميل ملف التقرير الأسبوعي (.txt) إلى جهازك.',
    });
  };

  const handleCopyReportSummary = () => {
    let summary = `ملخص إنتاجية الأسبوع - نبض الوصول:\n`;
    summary += `✅ ${completedWeeklyTasks.length} مهمة منجزة ومعتمدة\n`;
    summary += `🎨 ${completedWeeklyTasks.filter((t) => t.deliverableCategory === 'social_design').length} تصميم سوشيال\n`;
    summary += `🎬 ${completedWeeklyTasks.filter((t) => t.deliverableCategory === 'video_content' || t.deliverableCategory === 'motion_graphics').length} فيديو وموشن\n`;
    summary += `✍️ ${completedWeeklyTasks.filter((t) => t.deliverableCategory === 'creative_writing').length} خطة محتوى إبداعي`;

    navigator.clipboard.writeText(summary);
    showToast({
      type: 'success',
      title: 'تم نسخ الملخص للمحفظة 📋',
      message: 'يمكنك الآن لصقه في محادثات واتساب أو سلاك مع الإدارة أو العميل.',
    });
  };

  // Instant Template Creation
  const handleApplyTemplate = (template: QuickTemplate) => {
    if (!canCreateTasks) {
      showToast({
        type: 'error',
        title: language === 'ar' ? 'صلاحية غير كافية' : 'Permission Denied',
        message: language === 'ar'
          ? 'دورك الحالي لا يمتلك صلاحية إنشاء وتوزيع المهام (can_create_tasks).'
          : 'Your role does not permit creating new tasks.',
      });
      return;
    }
    const designer = users.find((u) => u.team === 'design' || u.roleIds.includes('role-graphic-designer')) || currentUser;
    const client = clients[0];

    const initialDeliverables: VisualDeliverable[] = template.mockupUrl
      ? [
          {
            id: `mock-${Date.now()}`,
            name: `${template.nameAr} - الأصل الأولي`,
            fileType: 'image',
            fileSize: '1.8 MB',
            dimensions: template.dimensions,
            format: 'PNG High-Res',
            uploadedBy: currentUser.name,
            uploadedAt: new Date().toISOString().slice(0, 10),
            thumbnailUrl: template.mockupUrl,
            downloadUrl: template.mockupUrl,
          },
        ]
      : [];

    addTask({
      title: template.title,
      description: template.description,
      priority: template.priority,
      teamType: template.category,
      deliverableCategory: template.deliverableCategory || (template.category === 'social' ? 'creative_writing' : 'social_design'),
      clientId: client?.id || 'client-1',
      projectId: projects[0]?.id || 'proj-1',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      assignedTo: [designer.id],
      createdBy: currentUser.id,
      status: 'todo',
      subtasks: template.subtasks.map((st, i) => ({
        id: `st-${Date.now()}-${i}`,
        title: st,
        completed: false,
      })),
      visualAttachments: initialDeliverables,
      creativeSpecs: {
        platform: 'Instagram / Social Media',
        dimensions: template.dimensions,
        format: 'PNG + Source Vector',
      },
    });

    showToast({
      type: 'success',
      title: 'تم إنشاء المهمة من القالب ⚡',
      message: `تم إنشاء وتوزيع مهمة "${template.title}" بنجاح!`,
    });
  };

  // Populate Add Task Modal from Template
  const handleLoadTemplateInModal = (templateId: string) => {
    const tpl = TASK_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    setFormTitle(tpl.title);
    setFormDesc(tpl.description);
    setFormTeamType(tpl.category);
    if (tpl.deliverableCategory) {
      setFormCategory(tpl.deliverableCategory);
    }
    setFormPriority(tpl.priority);
    setFormDimensions(tpl.dimensions);
    setFormSubtasksList(tpl.subtasks);

    if (tpl.mockupUrl) {
      setFormUploadedFiles([
        {
          id: `preset-${Date.now()}`,
          name: `${tpl.nameAr} - نموذج مبدئي`,
          fileType: 'image',
          fileSize: '2.1 MB',
          dimensions: tpl.dimensions,
          format: 'PNG',
          uploadedBy: currentUser.name,
          uploadedAt: new Date().toISOString().slice(0, 10),
          thumbnailUrl: tpl.mockupUrl,
          downloadUrl: tpl.mockupUrl,
        },
      ]);
    }
  };

  // File Upload Handler (FileReader to DataURL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newDeliverable: VisualDeliverable = {
        id: `upl-${Date.now()}`,
        name: file.name,
        fileType: file.type.startsWith('video') ? 'video' : 'image',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        dimensions: formDimensions || '1080x1350',
        format: file.name.split('.').pop()?.toUpperCase() || 'PNG',
        uploadedBy: currentUser.name,
        uploadedAt: new Date().toISOString().slice(0, 10),
        thumbnailUrl: dataUrl,
        downloadUrl: dataUrl,
      };
      setFormUploadedFiles((prev) => [...prev, newDeliverable]);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateTasks) {
      showToast({
        type: 'error',
        title: language === 'ar' ? 'صلاحية غير كافية' : 'Permission Denied',
        message: language === 'ar'
          ? 'دورك الحالي لا يمتلك صلاحية إنشاء المهام (can_create_tasks).'
          : 'Your role does not permit creating tasks.',
      });
      return;
    }
    if (!formTitle.trim()) return;

    addTask({
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      teamType: formTeamType,
      deliverableCategory: formCategory,
      clientId: formClientId || clients[0]?.id || 'client-1',
      projectId: formProjectId || projects.find((p) => p.clientId === formClientId)?.id || 'proj-1',
      dueDate: formDueDate,
      assignedTo: formAssignees.length > 0 ? formAssignees : [currentUser.id],
      createdBy: currentUser.id,
      status: 'todo',
      dependsOnTaskId: formDependsOnTaskId || undefined,
      dependencyNote: formDependencyNote.trim() || undefined,
      subtasks: formSubtasksList.map((title, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title,
        completed: false,
      })),
      visualAttachments: formUploadedFiles,
      creativeSpecs:
        formTeamType === 'design'
          ? {
              platform: 'Social Media',
              dimensions: formDimensions,
              format: 'PNG + Source',
              sourceFileLink: formSourceLink || undefined,
            }
          : undefined,
    });

    setIsAddModalOpen(false);
    setFormTitle('');
    setFormDesc('');
    setFormCategory('social_design');
    setFormSourceLink('');
    setFormUploadedFiles([]);
    setFormSubtasksList([]);
    setFormDependsOnTaskId('');
    setFormDependencyNote('');
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;
    addSubtask(selectedTask.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setSelectedTask((prev) =>
      prev
        ? {
            ...prev,
            subtasks: [...prev.subtasks, { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false }],
          }
        : null
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentContent.trim()) return;
    addTaskComment(selectedTask.id, newCommentContent.trim());
    setNewCommentContent('');
    setSelectedTask((prev) =>
      prev
        ? {
            ...prev,
            comments: [
              ...prev.comments,
              {
                id: `comm-${Date.now()}`,
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatar,
                content: newCommentContent.trim(),
                createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              },
            ],
          }
        : null
    );
  };

  // Add Visual Deliverable inside task detail modal
  const handleSaveDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !attachName.trim()) return;

    const newDeliverable: VisualDeliverable = {
      id: `vis-${Date.now()}`,
      name: attachName.trim(),
      fileType: attachType,
      fileSize: attachSize || '2.5 MB',
      dimensions: attachDim || '1080x1350',
      format: attachType === 'video' ? 'MP4 Reel' : attachType === 'figma' ? 'Figma Project' : 'PNG (High-Res)',
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
      thumbnailUrl:
        attachUrl.trim() ||
        (attachType === 'video'
          ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'),
      downloadUrl: attachUrl.trim() || '#',
    };

    const updatedDeliverables = [...(selectedTask.visualAttachments || []), newDeliverable];

    updateTask(selectedTask.id, {
      visualAttachments: updatedDeliverables,
    });

    setSelectedTask({
      ...selectedTask,
      visualAttachments: updatedDeliverables,
    });

    setIsAddingAttachment(false);
    setAttachName('');
    setAttachUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#24291F] flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#4C5540]" />
            {language === 'ar' ? 'إدارة المشاريع والمهام (Kanban)' : 'Projects & Tasks Board'}
          </h2>
          <p className="text-xs text-[#4C5540]/80 mt-0.5">
            {language === 'ar'
              ? 'تتبع ومراقبة تصاميم الجرافيك، خطط السوشيال ميديا، ومراحل تسليم أصول المشاريع - وكالة شال | Shal.'
              : 'Track graphic design deliverables, social content tasks, and client delivery milestones - Shal Agency.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-weekly-report-btn"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white px-3.5 py-2 text-xs font-bold text-[#24291F] shadow-2xs hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <FileDown className="h-4 w-4 text-[#4C5540]" />
            {language === 'ar' ? 'تصدير تقرير الأسبوع' : 'Export Report'}
          </button>

          {canCreateTasks ? (
            <button
              id="create-task-btn"
              onClick={() => {
                if (selectedProjectId !== 'all') {
                  setFormProjectId(selectedProjectId);
                  const proj = projects.find((p) => p.id === selectedProjectId);
                  if (proj) setFormClientId(proj.clientId);
                }
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3B4432] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {language === 'ar' ? 'إنشاء مهمة جديدة' : 'New Task'}
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
              title={language === 'ar' ? 'ليس لديك صلاحية لإنشاء المهام (can_create_tasks)' : 'No permission to create tasks'}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'إنشاء المهام مقيّد لدورك' : 'Creation Restricted'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Alert for graphic designer if revisions are requested */}
      {tasks.filter((t) => t.status === 'changes_requested' && (t.teamType === 'design' || t.assignedTo.includes(currentUser.id))).length > 0 && (
        <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-3 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 animate-bounce" />
            <span className="text-xs font-bold">
              {language === 'ar'
                ? `تنبيه لفريق الجرافيك: يوجد ${tasks.filter((t) => t.status === 'changes_requested').length} مهام بحاجة لتعديلات وملاحظات قبل الاعتماد والتسليم!`
                : `Design Revision Alert: ${tasks.filter((t) => t.status === 'changes_requested').length} tasks require revisions.`}
            </span>
          </div>
          <button
            onClick={() => {
              setTeamFilter('design');
            }}
            className="rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition-colors shrink-0"
          >
            {language === 'ar' ? 'عرض مهام التعديلات' : 'View Tasks'}
          </button>
        </div>
      )}

      {/* QUICK TASK TEMPLATES BAR (قوالب المهام الجاهزة) */}
      <div className="rounded-2xl border border-[#BDAF9C]/30 bg-[#FAF7F2] p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#4C5540] p-2 text-white shadow-2xs">
              <Zap className="h-4 w-4 text-[#D4C7B7]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#24291F] flex items-center gap-1.5">
                {language === 'ar' ? 'قوالب المهام المكررة السريعة (One-Click Templates)' : 'Quick Task Templates'}
                <span className="rounded-full bg-[#4C5540]/10 px-2 py-0.2 text-[10px] font-bold text-[#4C5540] border border-[#4C5540]/25">
                  {TASK_TEMPLATES.length} {language === 'ar' ? 'قوالب' : 'templates'}
                </span>
              </h4>
              <p className="text-[11px] text-[#4C5540]/80">
                {language === 'ar'
                  ? 'أنشئ المهام الروتينية الشائعة بضغطة زر واحدة لتسريع توزيع العمل على الفريق'
                  : 'Instantly spawn recurring design & social tasks with predefined subtasks'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAddModalOpen(true);
            }}
            className="self-start sm:self-auto text-xs font-bold text-[#1b24f5] hover:underline flex items-center gap-1"
          >
            <span>{language === 'ar' ? 'فتح النموذج المخصص' : 'Custom Task'}</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Templates Chips Scroll */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {TASK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl)}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-800 font-semibold shadow-2xs hover:border-[#1b24f5] hover:bg-blue-50/50 transition-all group"
            >
              <span className={`h-2 w-2 rounded-full ${tpl.category === 'design' ? 'bg-purple-500' : 'bg-[#1b24f5]'}`} />
              <span className="group-hover:text-[#1b24f5] transition-colors">
                {language === 'ar' ? tpl.nameAr : tpl.nameEn}
              </span>
              <Plus className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#1b24f5]" />
            </button>
          ))}
        </div>
      </div>

      {/* PROJECT TASKS MANAGEMENT BAR (إدارة مهام المشاريع وحملات العملاء) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#1b24f5]/10 p-2 text-[#1b24f5]">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {language === 'ar' ? 'إدارة مهام المشاريع والحملات' : 'Project & Campaign Task Management'}
                {selectedProjectId !== 'all' && (
                  <span className="rounded-full bg-blue-100 text-[#1b24f5] px-2 py-0.5 text-[10px] font-extrabold">
                    {projects.find((p) => p.id === selectedProjectId)?.name}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'اختر مشروعاً محدداً لمتابعة مخرجاته وسير عمله، أو تصفح كافة مهام الفريق عبر لوحة الكانبان'
                  : 'Select a project to manage deliverables and track Kanban workflow progression.'}
              </p>
            </div>
          </div>

          {/* Project Selector Dropdown & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                id="project-filter-selector"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 focus:border-[#1b24f5] focus:outline-none shadow-2xs"
              >
                <option value="all">
                  {language === 'ar' ? `📁 كافة المشاريع (${tasks.length} مهمة)` : `📁 All Projects (${tasks.length} tasks)`}
                </option>
                {projects.map((proj) => {
                  const client = clients.find((c) => c.id === proj.clientId);
                  const pTaskCount = tasks.filter((t) => t.projectId === proj.id).length;
                  return (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} - {client?.name.split(' ')[0] || ''} ({pTaskCount} مهمة)
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedProjectId !== 'all' && (
              <button
                onClick={() => setSelectedProjectId('all')}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {language === 'ar' ? 'عرض الكل' : 'Clear Filter'}
              </button>
            )}

            {selectedProjectId !== 'all' && canCreateTasks && (
              <button
                onClick={() => {
                  setFormProjectId(selectedProjectId);
                  const p = projects.find((proj) => proj.id === selectedProjectId);
                  if (p) setFormClientId(p.clientId);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#1b24f5] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#161dc2] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{language === 'ar' ? 'إضافة مهمة لهذا المشروع' : 'Add Project Task'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Project Highlight Banner */}
        {selectedProjectId !== 'all' && (() => {
          const proj = projects.find((p) => p.id === selectedProjectId);
          if (!proj) return null;
          const client = clients.find((c) => c.id === proj.clientId);
          const pTasks = tasks.filter((t) => t.projectId === proj.id);
          const completedPTasks = pTasks.filter((t) => t.status === 'done' || t.status === 'client_delivered').length;
          const progressPercent = pTasks.length > 0 ? Math.round((completedPTasks / pTasks.length) * 100) : 0;

          return (
            <div className="mt-3.5 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-white to-blue-50/40 p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#1b24f5]">{proj.name}</span>
                    <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {client?.name}
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      {proj.status === 'active' ? 'نشط' : proj.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{proj.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="text-end">
                    <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'نسبة الإنجاز' : 'Progress'}</span>
                    <span className="text-xs font-extrabold text-[#1b24f5]">{progressPercent}%</span>
                  </div>
                  <div className="w-28 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#1b24f5] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-slate-900">{completedPTasks}</span> / {pTasks.length} {language === 'ar' ? 'مهام مكتملة' : 'tasks done'}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث في المهام والمشاريع...' : 'Search tasks...'}
            className={`w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b24f5] ${
              language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team Filter */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setTeamFilter('all')}
              className={`rounded-lg px-2.5 py-1.5 transition-all ${
                teamFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'كافة التخصصات' : 'All Roles'}
            </button>
            <button
              onClick={() => setTeamFilter('social')}
              className={`rounded-lg px-2.5 py-1.5 transition-all ${
                teamFilter === 'social' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'السوشيال ميديا' : 'Social'}
            </button>
            <button
              onClick={() => setTeamFilter('design')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                teamFilter === 'design'
                  ? 'bg-[#1b24f5] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'الجرافيك ديزاينر' : 'Graphic Designer'}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  teamFilter === 'design' ? 'bg-[#b5f812] text-[#0b0f4a]' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {designTasksCount}
              </span>
            </button>
          </div>

          {/* Quick Toggles */}
          <button
            onClick={() => setOnlyWithAttachments(!onlyWithAttachments)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
              onlyWithAttachments
                ? 'border-[#1b24f5] bg-[#1b24f5]/10 text-[#1b24f5]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Paperclip className="h-3.5 w-3.5" />
            {language === 'ar' ? 'بمرفقات بصرية' : 'Has Assets'}
          </button>

          <button
            onClick={() => setOnlyMyTasks(!onlyMyTasks)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
              onlyMyTasks
                ? 'border-[#1b24f5] bg-[#1b24f5]/10 text-[#1b24f5]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {language === 'ar' ? 'مهامي فقط' : 'My Tasks'}
          </button>

          {/* Task Dependency Pipeline Toggle Filter */}
          <button
            onClick={() => setOnlyWithDependencies(!onlyWithDependencies)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
              onlyWithDependencies
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            title={language === 'ar' ? 'تصفية مهام سير العمل المترابطة (سلسلة المحتوى والتصميم)' : 'Filter connected workflow tasks'}
          >
            <GitFork className="h-3.5 w-3.5" />
            <span>{language === 'ar' ? 'سلسلة التبعيات' : 'Dependencies'}</span>
            {tasksWithDependenciesCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  onlyWithDependencies ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tasksWithDependenciesCount}
              </span>
            )}
          </button>

          {/* Kanban Columns Mode Switcher */}
          {viewMode === 'kanban' && (
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                id="kanban-mode-standard-btn"
                onClick={() => setKanbanColumnsMode('standard4')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                  kanbanColumnsMode === 'standard4'
                    ? 'bg-white text-[#1b24f5] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="To Do, In Progress, Review, Done"
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>{language === 'ar' ? 'الأعمدة الـ 4 الأساسية' : 'Standard 4'}</span>
              </button>
              <button
                id="kanban-mode-full-btn"
                onClick={() => setKanbanColumnsMode('full6')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
                  kanbanColumnsMode === 'full6'
                    ? 'bg-white text-[#1b24f5] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="المسار المفصل لجميع المراحل الست"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{language === 'ar' ? 'المسار الكامل (6)' : 'Full 6'}</span>
              </button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`rounded p-1 ${viewMode === 'kanban' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
              title="عرض الكانبان"
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded p-1 ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
              title="عرض القائمة"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DELIVERABLE CATEGORIES FILTER CHIPS (فلترة حسب نوع المخرج المطلوب) */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50/80 border border-slate-200/80 p-2.5">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 me-1">
          <Filter className="h-3.5 w-3.5 text-[#1b24f5]" />
          {language === 'ar' ? 'نوع المخرج:' : 'Deliverable:'}
        </span>

        {DELIVERABLE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = categoryFilter === cat.id;
          const count =
            cat.id === 'all'
              ? tasks.length
              : tasks.filter((t) => t.deliverableCategory === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                isSelected ? cat.activeClass : `bg-white ${cat.inactiveClass}`
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dependency Pipeline Active Banner */}
      {onlyWithDependencies && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/50 p-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-2xs">
              <GitFork className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <span>{language === 'ar' ? 'سلسلة تبعيات سير العمل والتسليم (Content ➔ Design Pipeline)' : 'Workflow Dependency Pipeline Active'}</span>
                <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.2 text-[10px] font-extrabold border border-indigo-200">
                  {filteredTasks.length} {language === 'ar' ? 'مهام مرتبطة' : 'linked tasks'}
                </span>
              </h4>
              <p className="text-[11px] text-indigo-800/80">
                {language === 'ar'
                  ? 'يتم الآن تصفية المهام المشتركة في مسار التجهيز والتسليم، مثل نصوص الإعلانات السابقة والمهام التصميمية المعتمدة عليها.'
                  : 'Displaying tasks participating in predecessor/successor workflows, linking creative briefs to design deliverables.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOnlyWithDependencies(false)}
            className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
          >
            {language === 'ar' ? 'إلغاء التصفية' : 'Reset'}
          </button>
        </div>
      )}

      {/* KANBAN BOARD VIEW (DRAG AND DROP ENABLED) */}
      {viewMode === 'kanban' ? (
        <div
          className={`grid grid-cols-1 gap-4 items-start ${
            kanbanColumnsMode === 'standard4'
              ? 'sm:grid-cols-2 lg:grid-cols-4'
              : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
          }`}
        >
          {activeColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => col.acceptStatuses.includes(t.status));
            const isOver = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumn !== col.id) {
                    setDragOverColumn(col.id);
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOverColumn(col.id);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverColumn(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverColumn(null);
                  const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                  if (taskId) {
                    handleDropTask(taskId, col.id);
                  }
                }}
                className={`flex flex-col rounded-2xl border p-2.5 min-h-[580px] transition-all duration-200 ${
                  isOver
                    ? 'border-[#1b24f5] bg-blue-50/80 ring-2 ring-[#1b24f5]/30 shadow-md scale-[1.01]'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-2 mb-2 bg-white/80 rounded-xl border border-slate-200/70 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${col.badgeBg}`} />
                    <h3 className="text-xs font-bold text-slate-800 truncate" title={col.labelAr}>
                      {language === 'ar' ? col.labelAr : col.labelEn}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-700 border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div
                      className={`rounded-xl border border-dashed p-8 text-center text-xs transition-colors ${
                        isOver
                          ? 'border-[#1b24f5] bg-blue-100/50 text-[#1b24f5] font-bold'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      {isOver
                        ? (language === 'ar' ? 'أفلت المهمة هنا لنقلها 🎯' : 'Drop task here')
                        : (language === 'ar' ? 'لا توجد مهام في هذه المرحلة' : 'No tasks in this column')}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const client = clients.find((c) => c.id === task.clientId);
                      const project = projects.find((p) => p.id === task.projectId);
                      const assignedUsers = users.filter((u) => task.assignedTo.includes(u.id));
                      const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                      const deadline = getDeadlineInfo(task.dueDate, task.status);
                      const isDragging = draggedTaskId === task.id;
                      const depInfo = getTaskDependencyInfo(task);
                      const isHighlightedParent = hoveredPredecessorId === task.id;
                      const isHighlightedDependent = hoveredDependentSourceId === task.id;

                      return (
                        <div
                          key={task.id}
                          draggable={canEditTasks}
                          onDragStart={(e) => {
                            if (!canEditTasks) return;
                            e.dataTransfer.setData('text/plain', task.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedTaskId(task.id);
                          }}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            setDragOverColumn(null);
                          }}
                          onClick={() => setSelectedTask(task)}
                          className={`group rounded-xl border bg-white p-3.5 shadow-2xs transition-all select-none ${
                            canEditTasks
                              ? 'cursor-grab active:cursor-grabbing hover:border-[#4C5540] hover:shadow-md'
                              : 'cursor-pointer hover:border-slate-300'
                          } ${
                            isDragging
                              ? 'opacity-40 scale-95 border-dashed border-[#4C5540] ring-2 ring-[#4C5540]/30 shadow-lg'
                              : 'border-slate-200'
                          } ${deadline.cardHighlight} ${
                            isHighlightedParent
                              ? 'ring-4 ring-[#4C5540] ring-offset-2 border-[#4C5540] shadow-2xl scale-[1.03] bg-[#FAF7F2] z-30 transition-all duration-300'
                              : ''
                          } ${
                            isHighlightedDependent
                              ? 'ring-2 ring-[#8A927D] border-[#8A927D] shadow-md'
                              : ''
                          }`}
                        >
                          {/* Banner when highlighted as a linked Predecessor on board */}
                          {isHighlightedParent && (
                            <div className="mb-2 flex items-center justify-between rounded-lg bg-[#4C5540] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                              <div className="flex items-center gap-1.5">
                                <Link2 className="h-3.5 w-3.5 text-[#D4C7B7]" />
                                <span>{language === 'ar' ? 'المهمة السابقة المرتبطة (Predecessor)' : 'Linked Predecessor Task'}</span>
                              </div>
                              <span className="rounded bg-white/20 px-1.5 py-0.2 text-[9px]">
                                {getTaskStatusLabel(task.status)}
                              </span>
                            </div>
                          )}

                          {/* Top Meta: Deliverable Category, Priority & Drag Grip / Lock */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <div className="flex flex-wrap items-center gap-1">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                  task.teamType === 'social'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {task.teamType === 'social'
                                  ? language === 'ar' ? 'سوشيال' : 'Social'
                                  : language === 'ar' ? 'تصميم' : 'Design'}
                              </span>
                              {getCategoryBadge(task.deliverableCategory)}
                              {getPriorityBadge(task.priority)}

                              {/* Predecessor Linked Indicator Icon with Hover Status Popover */}
                              {depInfo.hasParent && depInfo.parentTask && (
                                <div
                                  className="relative group/linkedIcon"
                                  onMouseEnter={() => {
                                    setHoveredPredecessorId(depInfo.parentTask!.id);
                                    setHoveredDependentSourceId(task.id);
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredPredecessorId(null);
                                    setHoveredDependentSourceId(null);
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(depInfo.parentTask!);
                                    }}
                                    className={`btn-interactive flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold shadow-2xs transition-all ${
                                      depInfo.isBlocked
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                        : 'bg-[#4C5540]/10 text-[#4C5540] border border-[#4C5540]/30 hover:bg-[#4C5540]/20'
                                    }`}
                                    title={
                                      language === 'ar'
                                        ? `مرتبطة بالمهمة السابقة: ${depInfo.parentTask.title} (${getTaskStatusLabel(depInfo.parentTask.status)})`
                                        : `Linked to predecessor: ${depInfo.parentTask.title} (${getTaskStatusLabel(depInfo.parentTask.status)})`
                                    }
                                  >
                                    <Link2 className="h-3 w-3" />
                                    <span>{language === 'ar' ? 'مرتبطة' : 'Linked'}</span>
                                  </button>

                                  {/* Hover preview tooltip highlighting parent status */}
                                  <div
                                    className={`pointer-events-none absolute bottom-full mb-1.5 hidden group-hover/linkedIcon:block z-50 w-56 rounded-xl bg-[#24291F] p-2.5 text-white shadow-xl border border-[#BDAF9C]/30 text-[10px] ${
                                      language === 'ar' ? 'right-0' : 'left-0'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
                                      <span className="flex items-center gap-1 font-bold text-[#E9E1D6]">
                                        <Link2 className="h-3 w-3 text-[#8A927D]" />
                                        {language === 'ar' ? 'المهمة السابقة' : 'Predecessor Task'}
                                      </span>
                                      <span
                                        className={`rounded px-1.5 py-0.2 text-[8px] font-bold ${
                                          depInfo.isBlocked ? 'bg-amber-500/30 text-amber-300' : 'bg-emerald-500/30 text-emerald-300'
                                        }`}
                                      >
                                        {getTaskStatusLabel(depInfo.parentTask.status)}
                                      </span>
                                    </div>
                                    <p className="font-semibold text-white line-clamp-2 leading-tight">
                                      {depInfo.parentTask.title}
                                    </p>
                                    <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] text-[#BDAF9C]">
                                      <span>{language === 'ar' ? 'حالة الإنجاز:' : 'Status:'}</span>
                                      <span className="font-bold text-white">
                                        {depInfo.isBlocked
                                          ? (language === 'ar' ? '⚠️ جاري العمل عليها' : 'In Progress')
                                          : (language === 'ar' ? '✓ معتمدة ومكتملة' : 'Ready / Done')}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-[8px] text-[#8A927D]">
                                      {language === 'ar' ? '🔍 تم إبراز البطاقة الأصلية في اللوحة' : 'Highlighted on board'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {canEditTasks ? (
                              <span
                                className="text-slate-300 group-hover:text-slate-600 transition-colors p-0.5"
                                title={language === 'ar' ? 'اسحب المهمة لنقلها بين المراحل' : 'Drag to move'}
                              >
                                <GripVertical className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span
                                className="text-slate-300 p-0.5"
                                title={language === 'ar' ? 'تعديل الحالة مقيد لدورك' : 'Edit restricted'}
                              >
                                <Lock className="h-3 w-3" />
                              </span>
                            )}
                          </div>

                          {/* Project & Client Breadcrumb */}
                          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-[#4C5540]">
                            <Briefcase className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {project ? project.name : (client?.name || 'مشروع عام')}
                            </span>
                            {client && project && (
                              <span className="text-slate-400 font-normal truncate">
                                • {client.name.split(' ')[0]}
                              </span>
                            )}
                          </div>

                          {/* Key Info: Title */}
                          <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-[#4C5540] transition-colors line-clamp-2 mb-2">
                            {task.title}
                          </h4>

                          {/* Preceding Task Dependency Badge */}
                          {depInfo.hasParent && depInfo.parentTask && (
                            <div
                              onMouseEnter={() => {
                                setHoveredPredecessorId(depInfo.parentTask!.id);
                                setHoveredDependentSourceId(task.id);
                              }}
                              onMouseLeave={() => {
                                setHoveredPredecessorId(null);
                                setHoveredDependentSourceId(null);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(depInfo.parentTask!);
                              }}
                              className={`mb-2 rounded-lg p-2 text-[10px] transition-all cursor-pointer ${
                                depInfo.isBlocked
                                  ? 'border border-amber-300 bg-amber-50/90 text-amber-900 hover:bg-amber-100/80 hover:border-amber-400'
                                  : 'border border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100/70'
                              }`}
                              title={
                                depInfo.isBlocked
                                  ? (language === 'ar' ? 'انقر لعرض مهمة المحتوى السابقة الجاري العمل عليها' : 'Predecessor content in progress')
                                  : (language === 'ar' ? 'المحتوى معتمد وجاهز للتصميم - انقر للاطلاع عليه' : 'Predecessor content approved')
                              }
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {depInfo.isBlocked ? (
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                  ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                  )}
                                  <span className="font-bold truncate">
                                    {depInfo.isBlocked
                                      ? (language === 'ar' ? '⚠️ بانتظار المحتوى:' : 'Blocked on:')
                                      : (language === 'ar' ? '✓ المحتوى معتمد:' : 'Content Ready:')}
                                  </span>
                                  <span className="truncate underline font-bold">{depInfo.parentTask.title}</span>
                                </div>
                                <span className="text-[9px] font-extrabold text-[#4C5540] shrink-0">
                                  {language === 'ar' ? 'معاينة' : 'View'}
                                </span>
                              </div>
                              {task.dependencyNote && (
                                <p className="mt-1 text-[9px] text-slate-500 line-clamp-1 italic">
                                  {task.dependencyNote}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Outgoing Pipeline Badge (Preceding task waiting on children) */}
                          {depInfo.hasChildren && (
                            <div
                              onMouseEnter={() => {
                                setHoveredPredecessorId(task.id);
                              }}
                              onMouseLeave={() => {
                                setHoveredPredecessorId(null);
                              }}
                              className="mb-2 flex items-center justify-between gap-1 rounded-md border border-[#8A927D]/40 bg-[#FAF7F2] px-2 py-1 text-[10px] text-[#24291F]"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <GitFork className="h-3 w-3 text-[#4C5540] shrink-0" />
                                <span className="font-semibold truncate">
                                  {language === 'ar'
                                    ? `متبوعة بـ ${depInfo.dependentTasks.length} مهمة مرتبطة`
                                    : `Precedes ${depInfo.dependentTasks.length} dependent task(s)`}
                                </span>
                              </div>
                              <span className="rounded bg-[#4C5540]/10 px-1 py-0.2 text-[8px] font-bold text-[#4C5540]">
                                {language === 'ar' ? 'سلسلة' : 'Pipeline'}
                              </span>
                            </div>
                          )}

                          {/* Visual Deliverables Preview if present */}
                          {task.visualAttachments && task.visualAttachments.length > 0 ? (
                            <div className="relative mt-2 mb-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-900/5 group/img">
                              <img
                                src={task.visualAttachments[0].thumbnailUrl}
                                alt={task.visualAttachments[0].name}
                                className="h-20 w-full object-cover transition-transform group-hover/img:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-1">
                                <span className="rounded bg-black/70 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-1">
                                  <Paperclip className="h-2.5 w-2.5" />
                                  {task.visualAttachments.length}
                                </span>
                                <span className="rounded bg-[#b5f812] px-1 py-0.5 text-[8px] font-extrabold text-[#0b0f4a]">
                                  {task.visualAttachments[0].format || 'Visual'}
                                </span>
                              </div>
                            </div>
                          ) : task.creativeSpecs ? (
                            <div className="mt-1.5 mb-2 flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-1 text-[10px] text-amber-900">
                              <Palette className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              <span className="font-semibold truncate">{task.creativeSpecs.dimensions}</span>
                            </div>
                          ) : null}

                          {/* Subtasks Progress */}
                          {task.subtasks.length > 0 && (
                            <div className="mt-2 mb-2 flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <CheckSquare className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="font-bold">
                                {completedSubtasks} / {task.subtasks.length}
                              </span>
                              <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden ml-1">
                                <div
                                  className="h-full bg-[#1b24f5] rounded-full transition-all"
                                  style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Key Info: Assignee Area */}
                          <div className="mt-2.5 rounded-lg bg-slate-50 p-2 border border-slate-100 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              {assignedUsers.length > 0 ? (
                                <>
                                  <img
                                    src={assignedUsers[0].avatar}
                                    alt={assignedUsers[0].name}
                                    className="h-6 w-6 rounded-full object-cover border border-white shadow-2xs shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                                      {assignedUsers[0].name}
                                    </p>
                                    <p className="text-[9px] text-slate-500 truncate">
                                      {assignedUsers[0].title || 'عضو الفريق'}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
                                  <User className="h-3.5 w-3.5" />
                                  <span>{language === 'ar' ? 'غير مسند لأحد' : 'Unassigned'}</span>
                                </div>
                              )}
                            </div>
                            {assignedUsers.length > 1 && (
                              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-700">
                                +{assignedUsers.length - 1}
                              </span>
                            )}
                          </div>

                          {/* Key Info: Due Date & Move controls */}
                          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                            <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 font-bold ${deadline.badgeClass}`}>
                              {deadline.isOverdue ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                              ) : deadline.isDueSoon ? (
                                <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              ) : (
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate">{deadline.label}</span>
                            </div>

                            {/* Status Next/Prev quick buttons */}
                            {canEditTasks ? (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1"
                              >
                                {col.id !== 'todo' && (
                                  <button
                                    onClick={() => {
                                      const prevMap: Record<TaskStatus, TaskStatus> = {
                                        todo: 'todo',
                                        in_progress: 'todo',
                                        review: 'in_progress',
                                        changes_requested: 'review',
                                        done: 'review',
                                        client_delivered: 'done',
                                      };
                                      handleDropTask(task.id, prevMap[task.status] || 'todo');
                                    }}
                                    className="rounded p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                    title={language === 'ar' ? 'رجوع للمرحلة السابقة' : 'Previous stage'}
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </button>
                                )}
                                {col.id !== 'done' && col.id !== 'client_delivered' && (
                                  <button
                                    onClick={() => {
                                      const nextMap: Record<TaskStatus, TaskStatus> = {
                                        todo: 'in_progress',
                                        in_progress: 'review',
                                        review: 'done',
                                        changes_requested: 'in_progress',
                                        done: 'client_delivered',
                                        client_delivered: 'client_delivered',
                                      };
                                      handleDropTask(task.id, nextMap[task.status] || 'done');
                                    }}
                                    className="rounded p-1 bg-blue-50 hover:bg-blue-100 text-[#1b24f5] transition-colors"
                                    title={language === 'ar' ? 'نقل للمرحلة التالية' : 'Next stage'}
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[9px] flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                <span>{language === 'ar' ? 'عرض فقط' : 'Read only'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Drag drop target placeholder at column bottom if dragging over */}
                  {isOver && draggedTaskId && (
                    <div className="rounded-xl border-2 border-dashed border-[#1b24f5] bg-[#1b24f5]/10 p-3 text-center text-xs font-bold text-[#1b24f5] animate-pulse">
                      {language === 'ar' ? 'أفلت المهمة هنا للنقل' : 'Drop task here'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="p-3.5 text-start">{language === 'ar' ? 'المهمة' : 'Task Title'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'العميل' : 'Client'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'الفريق' : 'Team'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'نوع المخرج' : 'Category'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'الأولوية' : 'Priority'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'الديدلاين' : 'Due Date'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'المكلَّف' : 'Assignee'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => {
                const client = clients.find((c) => c.id === t.clientId);
                const assignedUsers = users.filter((u) => t.assignedTo.includes(u.id));
                const deadline = getDeadlineInfo(t.dueDate, t.status);
                const depInfo = getTaskDependencyInfo(t);

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`cursor-pointer hover:bg-slate-50/80 transition-colors ${deadline.cardHighlight}`}
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{t.title}</div>
                      {depInfo.hasParent && depInfo.parentTask && (
                        <div className="mt-1 flex items-center gap-1 text-[10px]">
                          {depInfo.isBlocked ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 text-amber-800 px-1.5 py-0.2 font-semibold">
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                              {language === 'ar' ? 'بانتظار: ' : 'Blocked on: '} {depInfo.parentTask.title}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 font-semibold">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              {language === 'ar' ? 'المحتوى معتمد' : 'Ready'}
                            </span>
                          )}
                        </div>
                      )}
                      {depInfo.hasChildren && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-700">
                          <GitFork className="h-3 w-3" />
                          <span>{language === 'ar' ? `متبوعة بـ ${depInfo.dependentTasks.length} مهام تصميم` : `Precedes ${depInfo.dependentTasks.length} tasks`}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">{client?.name.split(' ')[0]}</td>
                    <td className="p-3.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          t.teamType === 'social' ? 'bg-sky-50 text-sky-700' : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {t.teamType === 'social' ? 'سوشيال ميديا' : 'تصميم جرافيك'}
                      </span>
                    </td>
                    <td className="p-3.5">{getCategoryBadge(t.deliverableCategory)}</td>
                    <td className="p-3.5">{getPriorityBadge(t.priority)}</td>
                    <td className="p-3.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${deadline.badgeClass}`}>
                        {deadline.isOverdue && <AlertTriangle className="h-3 w-3 text-rose-600" />}
                        {deadline.label}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {assignedUsers.map((u) => (
                          <img
                            key={u.id}
                            src={u.avatar}
                            alt={u.name}
                            title={u.name}
                            className="h-5 w-5 rounded-full border border-white object-cover"
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      selectedTask.teamType === 'social'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {selectedTask.teamType === 'social' ? 'سوشيال ميديا سبيشياليست' : 'جرافيك ديزاينر'}
                  </span>
                  {getPriorityBadge(selectedTask.priority)}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{selectedTask.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedTask.description}</p>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-5 text-xs">
              {/* Visual Deliverables Section */}
              <div className="rounded-xl border border-purple-100 bg-purple-50/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-purple-600 p-1.5 text-white">
                      <Palette className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {language === 'ar' ? 'الأصول والتسليمات البصرية (Visual Deliverables)' : 'Visual Deliverables'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {language === 'ar'
                          ? 'الملفات المرفوعة، المقاسات ونماذج المعاينة الخاصة بالجرافيك ديزاينر'
                          : 'Assets, formats, and design files produced for this task'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAddingAttachment(true)}
                    className="flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'إرفاق أصل' : 'Attach File'}
                  </button>
                </div>

                {/* Inline form to attach deliverable */}
                {isAddingAttachment && (
                  <form
                    onSubmit={handleSaveDeliverable}
                    className="mb-4 rounded-xl border border-purple-200 bg-white p-3 space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-bold text-purple-900">{language === 'ar' ? 'إضافة أصل بصري جديد' : 'New Asset'}</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingAttachment(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">{language === 'ar' ? 'اسم الملف / التصميم *' : 'Asset Title *'}</label>
                        <input
                          type="text"
                          required
                          value={attachName}
                          onChange={(e) => setAttachName(e.target.value)}
                          placeholder="مثال: البوستر النهائي بدقة 4K"
                          className="w-full rounded-md border border-slate-200 px-2.5 py-1 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">{language === 'ar' ? 'نوع الأصل' : 'Asset Type'}</label>
                        <select
                          value={attachType}
                          onChange={(e) => setAttachType(e.target.value as any)}
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="image">صورة (PNG / JPG / WEBP)</option>
                          <option value="video">فيديو / ريلز (MP4)</option>
                          <option value="figma">مشروع فيجما (Figma Link)</option>
                          <option value="psd">ملف فوتوشوب (PSD)</option>
                          <option value="ai">أصل إليستريتور (AI)</option>
                          <option value="pdf">مستند براند / PDF</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">{language === 'ar' ? 'المقاس والأبعاد' : 'Dimensions'}</label>
                        <input
                          type="text"
                          value={attachDim}
                          onChange={(e) => setAttachDim(e.target.value)}
                          placeholder="مثال: 1080x1350 أو 1080x1920"
                          className="w-full rounded-md border border-slate-200 px-2.5 py-1 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">{language === 'ar' ? 'رابط المعاينة / التنزيل (URL)' : 'Asset / Cloud URL'}</label>
                        <input
                          type="text"
                          value={attachUrl}
                          onChange={(e) => setAttachUrl(e.target.value)}
                          placeholder="https://... رابط صورة أو فيجما"
                          className="w-full rounded-md border border-slate-200 px-2.5 py-1 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingAttachment(false)}
                        className="rounded-md px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="rounded-md bg-[#1b24f5] px-3 py-1 text-xs font-bold text-white hover:bg-[#161dc2]"
                      >
                        {language === 'ar' ? 'حفظ المرفق' : 'Save Asset'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Deliverables List Grid */}
                {!selectedTask.visualAttachments || selectedTask.visualAttachments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-slate-400">
                    <ImageIcon className="mx-auto h-7 w-7 text-slate-300 mb-1" />
                    <p>{language === 'ar' ? 'لم يتم إرفاق نماذج أو ملفات بصرية لهذه المهمة حتى الآن.' : 'No visual attachments uploaded yet.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTask.visualAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex flex-col rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs hover:shadow-xs transition-shadow"
                      >
                        {att.thumbnailUrl && (
                          <div className="relative mb-2 h-28 w-full overflow-hidden rounded-lg bg-slate-100">
                            <img
                              src={att.thumbnailUrl}
                              alt={att.name}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-extrabold text-[#b5f812]">
                              {att.format || att.fileType.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h6 className="font-bold text-slate-900 truncate" title={att.name}>
                            {att.name}
                          </h6>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                            <span>{att.dimensions || 'Standard'}</span>
                            <span>{att.fileSize}</span>
                          </div>
                          <div className="mt-0.5 text-[9px] text-slate-400">
                            {language === 'ar' ? 'بواسطة:' : 'By:'} {att.uploadedBy} • {att.uploadedAt}
                          </div>
                        </div>

                        {att.downloadUrl && att.downloadUrl !== '#' && (
                          <a
                            href={att.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 flex items-center justify-center gap-1 rounded-md bg-slate-100 py-1 text-[10px] font-bold text-[#1b24f5] hover:bg-[#1b24f5] hover:text-white transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {language === 'ar' ? 'معاينة / فتح الأصل' : 'View Deliverable'}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TASK DEPENDENCIES & WORKFLOW PIPELINE SECTION */}
              {(() => {
                const depInfo = getTaskDependencyInfo(selectedTask);
                const candidatePredecessors = tasks.filter(
                  (t) => t.id !== selectedTask.id && (selectedTask.projectId ? t.projectId === selectedTask.projectId : true)
                );

                return (
                  <div className="rounded-xl border border-indigo-200/90 bg-indigo-50/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-2xs">
                          <GitFork className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {language === 'ar'
                              ? 'سلسلة التبعيات وتسلسل التنفيذ (Task Dependencies & Pipeline)'
                              : 'Workflow Dependencies & Handoff Pipeline'}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {language === 'ar'
                              ? 'ربط وتتبع مهمة التصميم بمهمة المحتوى السابقة أو متابعة المهام اللاحقة المرتبطة'
                              : 'Link design deliverables to predecessor content briefs and track handoff status'}
                          </p>
                        </div>
                      </div>

                      {canEditTasks && !depInfo.hasParent && !isLinkingDependencyInDetail && (
                        <button
                          type="button"
                          onClick={() => {
                            setDetailSelectedParentId(candidatePredecessors[0]?.id || '');
                            setDetailDependencyNote(selectedTask.dependencyNote || '');
                            setIsLinkingDependencyInDetail(true);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          <span>{language === 'ar' ? 'ربط بمهمة محتوى سابقة' : 'Link Predecessor'}</span>
                        </button>
                      )}
                    </div>

                    {/* Preceding Task / Prerequisite */}
                    {depInfo.hasParent && depInfo.parentTask ? (
                      <div
                        className={`rounded-xl border p-3 transition-all ${
                          depInfo.isBlocked
                            ? 'border-amber-300 bg-amber-50/70 text-amber-950'
                            : 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {depInfo.isBlocked ? (
                              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-xs">
                                  {depInfo.isBlocked
                                    ? (language === 'ar' ? '⚠️ مهمة سابقة حاجبة (بانتظار اعتماد المحتوى):' : 'Preceding Task (In Progress):')
                                    : (language === 'ar' ? '✓ مهمة سابقة معتمدة وجاهزة للتنفيذ:' : 'Preceding Task Approved:')}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                                    depInfo.isBlocked
                                      ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                      : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                                  }`}
                                >
                                  {depInfo.parentTask.status}
                                </span>
                              </div>
                              <h5 className="font-bold text-slate-900 text-xs mt-1 truncate">
                                {depInfo.parentTask.title}
                              </h5>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                                {depInfo.parentTask.description}
                              </p>
                              {selectedTask.dependencyNote && (
                                <div className="mt-2 rounded-lg bg-white/80 p-2 border border-slate-200/80 text-[11px] text-slate-700">
                                  <span className="font-bold text-indigo-900">{language === 'ar' ? 'ملاحظة التوجيه والتسليم: ' : 'Handoff note: '}</span>
                                  {selectedTask.dependencyNote}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTask(depInfo.parentTask!);
                              }}
                              className="btn-interactive flex items-center gap-1 rounded-xl bg-[#4C5540] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#3B4432] transition-colors shadow-2xs cursor-pointer"
                            >
                              <span>{language === 'ar' ? 'عرض المهمة السابقة' : 'Open Predecessor'}</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>

                            {canEditTasks && (
                              <button
                                type="button"
                                onClick={() => {
                                  linkTaskDependency(selectedTask.id, undefined);
                                  setSelectedTask((prev) => (prev ? { ...prev, dependsOnTaskId: undefined, dependencyNote: undefined } : null));
                                }}
                                className="btn-interactive flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                                title={language === 'ar' ? 'فك ارتباط هذه المهمة بالمهمة السابقة' : 'Unlink dependency'}
                              >
                                <Unlink className="h-3 w-3" />
                                <span>{language === 'ar' ? 'فك الارتباط' : 'Unlink'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : !isLinkingDependencyInDetail ? (
                      <div className="rounded-xl border border-dashed border-[#BDAF9C]/50 p-3 bg-white text-center">
                        <p className="text-[#4C5540]/80 text-xs">
                          {language === 'ar'
                            ? 'هذه المهمة مستقلة حالياً ولا تعتمد على مهمة محتوى أو مهمة سابقة.'
                            : 'This task is currently standalone and does not depend on a prior task.'}
                        </p>
                      </div>
                    ) : null}

                    {/* Form to link a predecessor in Detail Modal */}
                    {isLinkingDependencyInDetail && (
                      <div className="rounded-xl border border-[#BDAF9C]/60 bg-white p-3 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-[#24291F] text-xs flex items-center gap-1.5">
                            <Link2 className="h-3.5 w-3.5 text-[#4C5540]" />
                            {language === 'ar' ? 'ربط هذه المهمة بمهمة محتوى أو مهمة سابقة' : 'Link to Predecessor Task'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsLinkingDependencyInDetail(false)}
                            className="btn-interactive rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            {language === 'ar' ? 'اختر المهمة السابقة (Content / Creative Task)' : 'Select Predecessor Task'}
                          </label>
                          <select
                            value={detailSelectedParentId}
                            onChange={(e) => setDetailSelectedParentId(e.target.value)}
                            className="w-full rounded-lg border border-[#BDAF9C]/60 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                          >
                            {candidatePredecessors.map((cand) => (
                              <option key={cand.id} value={cand.id}>
                                {cand.title} ({cand.teamType === 'social' ? 'سوشيال/محتوى' : 'تصميم'} • {getTaskStatusLabel(cand.status)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            {language === 'ar' ? 'ملاحظة التوجيه أو تعليمات التسليم للمصمم (اختياري)' : 'Handoff note (optional)'}
                          </label>
                          <input
                            type="text"
                            value={detailDependencyNote}
                            onChange={(e) => setDetailDependencyNote(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: نصوص وهوكات الإعلان معتمدة في المهمة السابقة، يرجى الالتزام بالأبعاد...' : 'Brief note for the designer...'}
                            className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsLinkingDependencyInDetail(false)}
                            className="btn-interactive rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            disabled={!detailSelectedParentId}
                            onClick={() => {
                              if (!detailSelectedParentId) return;
                              linkTaskDependency(selectedTask.id, detailSelectedParentId, detailDependencyNote);
                              setSelectedTask((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      dependsOnTaskId: detailSelectedParentId,
                                      dependencyNote: detailDependencyNote || undefined,
                                    }
                                  : null
                              );
                              setIsLinkingDependencyInDetail(false);
                            }}
                            className="btn-interactive rounded-lg bg-[#4C5540] px-3.5 py-1 text-xs font-bold text-white hover:bg-[#3B4432] shadow-2xs disabled:opacity-50"
                          >
                            {language === 'ar' ? 'حفظ والربط' : 'Save & Link'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Successor / Dependent Tasks List */}
                    {depInfo.hasChildren && (
                      <div className="rounded-xl border border-indigo-200 bg-white p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                          <GitFork className="h-3.5 w-3.5 text-indigo-600" />
                          <span>
                            {language === 'ar'
                              ? `مهام لاحقة معتمدة على إنجاز هذه المهمة (${depInfo.dependentTasks.length}):`
                              : `Successor tasks waiting on this deliverable (${depInfo.dependentTasks.length}):`}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {depInfo.dependentTasks.map((childTask) => (
                            <div
                              key={childTask.id}
                              onClick={() => setSelectedTask(childTask)}
                              className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-2 border border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0">
                                <h6 className="font-bold text-slate-800 text-xs truncate group-hover:text-indigo-700">
                                  {childTask.title}
                                </h6>
                                <p className="text-[10px] text-slate-400">
                                  {childTask.teamType === 'design' ? 'تصميم جرافيك' : childTask.teamType} • {childTask.status}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 shrink-0">
                                {language === 'ar' ? 'فتح' : 'Open'}
                                <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Subtasks Section */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                  {language === 'ar' ? 'قائمة المهام الفرعية (Subtasks Checklist)' : 'Subtasks'}
                </h4>

                <div className="space-y-1.5">
                  {selectedTask.subtasks.map((st) => (
                    <label
                      key={st.id}
                      className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => toggleSubtask(selectedTask.id, st.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                        {st.title}
                      </span>
                    </label>
                  ))}
                </div>

                <form onSubmit={handleAddSubtask} className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder={language === 'ar' ? 'إضافة مهمة فرعية جديدة...' : 'Add a subtask...'}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                  >
                    {language === 'ar' ? 'إضافة' : 'Add'}
                  </button>
                </form>
              </div>

              {/* Comments Thread */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                  {language === 'ar' ? 'المناقشات والتعليقات (Comments Thread)' : 'Task Discussion'}
                </h4>

                <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-center py-3 text-slate-400">
                      {language === 'ar' ? 'لا توجد تعليقات بعد على هذه المهمة.' : 'No comments yet.'}
                    </p>
                  ) : (
                    selectedTask.comments.map((comm) => (
                      <div key={comm.id} className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-800">{comm.userName}</span>
                          <span>{comm.createdAt}</span>
                        </div>
                        <p className="text-slate-700 mt-1">{comm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب تعليقاً أو استفساراً لفريق العمل...' : 'Write a comment...'}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    {language === 'ar' ? 'إرسال' : 'Post'}
                  </button>
                </form>
              </div>

              {/* Delete task */}
              {canDeleteTasks && (
                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => {
                      if (window.confirm(language === 'ar' ? 'هل تريد حذف هذه المهمة نهائياً؟' : 'Delete task?')) {
                        deleteTask(selectedTask.id);
                        setSelectedTask(null);
                      }
                    }}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'حذف المهمة' : 'Delete Task'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal (with Templates and Direct File Upload) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#1b24f5]" />
                  {language === 'ar' ? 'إنشاء وتكليف مهمة جديدة' : 'Create & Assign Task'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'ar' ? 'يمكنك التعبئة اليدوية أو الاختيار السريع من القوالب' : 'Fill manually or choose from templates'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Template Selector */}
            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200/80 p-2.5">
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                {language === 'ar' ? '⚡ تعبئة سريعة من قالب مسبق الإعداد:' : '⚡ Pre-fill from Task Template:'}
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) handleLoadTemplateInModal(e.target.value);
                }}
                defaultValue=""
                className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b24f5]"
              >
                <option value="">{language === 'ar' ? '-- اختر قالباً جاهزاً لتعبئة البيانات تلقائياً --' : '-- Select a template --'}</option>
                {TASK_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.nameAr} ({tpl.dimensions})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'عنوان المهمة *' : 'Task Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: إعداد تصاميم كاروسيل إنستغرام لعميل الفنتك"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b24f5]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'تفاصيل المهمة ومتطلبات التسليم' : 'Description & Acceptance Criteria'}
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b24f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'التخصص المطلوب' : 'Role / Specialization'}
                  </label>
                  <select
                    value={formTeamType}
                    onChange={(e) => setFormTeamType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b24f5]"
                  >
                    <option value="design">جرافيك ديزاينر (Graphic Designer)</option>
                    <option value="social">سوشيال ميديا سبيشياليست (Social Media)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تصنيف نوع المخرج' : 'Deliverable Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DeliverableCategory)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b24f5]"
                  >
                    <option value="social_design">تصميم سوشيال ميديا (Social Design)</option>
                    <option value="video_content">محتوى فيديو وريلز (Video Content)</option>
                    <option value="motion_graphics">موشن جرافيك (Motion Graphics)</option>
                    <option value="creative_writing">كتابة إبداعية ومحتوى (Creative Writing)</option>
                    <option value="branding_identity">هوية بصرية وبراندينج (Branding Identity)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الأولوية (Priority)' : 'Priority'}
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="urgent">عاجل (Urgent)</option>
                    <option value="high">مرتفع (High)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="low">منخفض (Low)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'العميل' : 'Client'}
                  </label>
                  <select
                    value={formClientId}
                    onChange={(e) => {
                      setFormClientId(e.target.value);
                      const proj = projects.find((p) => p.clientId === e.target.value);
                      if (proj) setFormProjectId(proj.id);
                    }}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تاريخ الاستحقاق (Deadline)' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تكليف لعضو الفريق (Assignee)' : 'Assign to Member'}
                  </label>
                  <select
                    value={formAssignees[0] || ''}
                    onChange={(e) => setFormAssignees([e.target.value])}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.team})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Design specifications */}
              {formTeamType === 'design' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <Palette className="h-3.5 w-3.5 text-amber-600" />
                    <span>{language === 'ar' ? 'مواصفات التصميم والأبعاد المطلوبة' : 'Design Specifications'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-amber-800 block mb-0.5">{language === 'ar' ? 'المقاس' : 'Dimensions'}</label>
                      <select
                        value={formDimensions}
                        onChange={(e) => setFormDimensions(e.target.value)}
                        className="w-full rounded-md border border-amber-200 bg-white p-1.5 text-slate-800 focus:outline-none"
                      >
                        <option value="1080x1350 (Instagram Carousel)">1080x1350 (كاروسيل إنستغرام)</option>
                        <option value="1080x1080 (Square Post)">1080x1080 (بوست مربع 1:1)</option>
                        <option value="1080x1920 (Reels / Story)">1080x1920 (ريلز وستوري 9:16)</option>
                        <option value="1200x630 (Facebook / LinkedIn)">1200x630 (لينكد إن وفيسبوك)</option>
                        <option value="Brand Identity Vector">فيكتور وهوية بصرية (AI / SVG)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-800 block mb-0.5">{language === 'ar' ? 'رابط ملف العمل (Figma / Drive)' : 'Source Link'}</label>
                      <input
                        type="text"
                        value={formSourceLink}
                        onChange={(e) => setFormSourceLink(e.target.value)}
                        placeholder="https://figma.com/file/..."
                        className="w-full rounded-md border border-amber-200 bg-white p-1.5 text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TASK DEPENDENCY / PREDECESSOR LINKING (حقل التبعية والمهمة السابقة) */}
              <div className="rounded-xl border border-[#BDAF9C]/50 bg-[#FAF7F2] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#24291F] font-bold">
                    <Link2 className="h-4 w-4 text-[#4C5540]" />
                    <span>{language === 'ar' ? 'حقل التبعية والمهمة السابقة (Task Dependency)' : 'Task Dependency (Preceding Task)'}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#8A927D]">
                    {language === 'ar' ? 'سلسلة العمل المتتابعة' : 'Sequential Workflow'}
                  </span>
                </div>
                <p className="text-[11px] text-[#4C5540]/80">
                  {language === 'ar'
                    ? 'حدد المهمة السابقة التي تعتمد عليها هذه المهمة (مثل: كتابة واعتماد نصوص الإعلان قبل بدء التصميم):'
                    : 'Select a preceding task this task depends on (e.g., content brief before design begins):'}
                </p>

                <div className="space-y-2">
                  <select
                    value={formDependsOnTaskId}
                    onChange={(e) => setFormDependsOnTaskId(e.target.value)}
                    className="w-full rounded-lg border border-[#BDAF9C]/60 bg-white p-2 text-xs text-[#24291F] focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                  >
                    <option value="">{language === 'ar' ? '-- بدون تبعية (مهمة مستقلة) --' : '-- No Dependency (Standalone Task) --'}</option>
                    {tasks
                      .filter((t) => (formClientId ? t.clientId === formClientId : true))
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.teamType === 'social' ? 'محتوى' : 'تصميم'} • {getTaskStatusLabel(t.status)})
                        </option>
                      ))}
                  </select>

                  {formDependsOnTaskId && (() => {
                    const selectedParent = tasks.find((t) => t.id === formDependsOnTaskId);
                    if (!selectedParent) return null;
                    const isParentDone = selectedParent.status === 'done' || selectedParent.status === 'client_delivered';
                    return (
                      <div className="rounded-lg border border-[#BDAF9C]/40 bg-white p-2.5 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#24291F] flex items-center gap-1">
                            <Link2 className="h-3.5 w-3.5 text-[#4C5540]" />
                            {selectedParent.title}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              isParentDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isParentDone
                              ? (language === 'ar' ? '✓ معتمدة وجاهزة' : 'Ready')
                              : (language === 'ar' ? `⚠️ قيد التنفيذ (${getTaskStatusLabel(selectedParent.status)})` : `In Progress (${getTaskStatusLabel(selectedParent.status)})`)}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={formDependencyNote}
                          onChange={(e) => setFormDependencyNote(e.target.value)}
                          placeholder={language === 'ar' ? 'ملاحظة التوجيه والتسليم (مثال: النصوص وهوكات المحتوى معتمدة في المهمة السابقة)...' : 'Handoff guidance note...'}
                          className="w-full rounded-lg border border-slate-200 bg-[#FAF7F2] p-2 text-xs text-[#24291F] focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* DIRECT FILE & MEDIA UPLOAD FIELD (حقل رفع الملفات والوسائط) */}
              <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-[#1b24f5]" />
                    {language === 'ar' ? 'رفع ملفات ووسائط المهمة (Media & Asset Upload)' : 'Upload Attachments'}
                  </label>
                  <span className="text-[10px] text-slate-400">صور، فيديوهات، أو ملفات تصميم</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="flex-1 w-full cursor-pointer flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-slate-700 hover:bg-indigo-50/50 hover:border-[#1b24f5] transition-all">
                    <ImageIcon className="h-4 w-4 text-[#1b24f5]" />
                    <span className="font-semibold text-[11px]">{language === 'ar' ? 'اختر ملفاً من جهازك' : 'Choose Local File'}</span>
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Uploaded files preview list */}
                {formUploadedFiles.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {formUploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-white p-2 border border-indigo-100"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {file.thumbnailUrl && (
                            <img
                              src={file.thumbnailUrl}
                              alt={file.name}
                              className="h-8 w-8 rounded object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate text-[11px]">{file.name}</p>
                            <p className="text-[9px] text-slate-400">{file.dimensions} • {file.fileSize}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1b24f5] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#161dc2] shadow-xs"
                >
                  {language === 'ar' ? 'حفظ وتكليف المهمة' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT WEEKLY PRODUCTIVITY REPORT MODAL (تصدير تقرير الأسبوع المنجز) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-[#1b24f5] p-2 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'ar' ? 'تقرير إنتاجية المهام الأسبوعية المنجزة' : 'Weekly Task Productivity Report'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'ملخص موثق لإنتاجية فريق السوشيال والجرافيك الجاهز للتقييم الإداري والتصدير'
                      : 'Verified output summary for Social Media & Graphic Design management evaluation'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
                <p className="text-[11px] font-semibold text-slate-500">{language === 'ar' ? 'إجمالي المنجز' : 'Total Done'}</p>
                <p className="text-xl font-black text-[#1b24f5] mt-0.5">{completedWeeklyTasks.length}</p>
                <span className="text-[10px] text-emerald-600 font-bold">100% معتمد</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
                <p className="text-[11px] font-semibold text-slate-500">{language === 'ar' ? 'تصاميم سوشيال' : 'Social Designs'}</p>
                <p className="text-xl font-black text-indigo-600 mt-0.5">
                  {completedWeeklyTasks.filter((t) => t.deliverableCategory === 'social_design').length}
                </p>
                <span className="text-[10px] text-slate-400">بوستات وكاروسيل</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
                <p className="text-[11px] font-semibold text-slate-500">{language === 'ar' ? 'فيديو وموشن' : 'Video & Motion'}</p>
                <p className="text-xl font-black text-rose-600 mt-0.5">
                  {completedWeeklyTasks.filter((t) => t.deliverableCategory === 'video_content' || t.deliverableCategory === 'motion_graphics').length}
                </p>
                <span className="text-[10px] text-slate-400">ريلز ومونتاج</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
                <p className="text-[11px] font-semibold text-slate-500">{language === 'ar' ? 'كتابة محتوى' : 'Copywriting'}</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">
                  {completedWeeklyTasks.filter((t) => t.deliverableCategory === 'creative_writing').length}
                </p>
                <span className="text-[10px] text-slate-400">خطط وكابشن</span>
              </div>
            </div>

            {/* List of Tasks in Report */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>{language === 'ar' ? 'قائمة المهام المعتمدة والمدرجة بالتقرير:' : 'Completed Tasks Included:'}</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {completedWeeklyTasks.length} {language === 'ar' ? 'مهام' : 'tasks'}
                </span>
              </h4>

              <div className="max-h-56 overflow-y-auto space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                {completedWeeklyTasks.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    {language === 'ar'
                      ? 'لا توجد مهام منجزة حالياً في حالة "مكتمل" أو "تم التسليم للعميل".'
                      : 'No completed or delivered tasks found in this period.'}
                  </p>
                ) : (
                  completedWeeklyTasks.map((t, idx) => {
                    const client = clients.find((c) => c.id === t.clientId);
                    const assignees = users.filter((u) => t.assignedTo.includes(u.id));

                    return (
                      <div
                        key={t.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-200/80 bg-white p-2.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{t.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="text-[#1b24f5] font-semibold">{client?.name}</span>
                              <span>•</span>
                              <span>المنفذ: {assignees.map((u) => u.name).join(', ') || 'الفريق'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {getCategoryBadge(t.deliverableCategory)}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              t.status === 'client_delivered'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {t.status === 'client_delivered'
                              ? language === 'ar' ? 'تم التسليم ✅' : 'Delivered'
                              : language === 'ar' ? 'معتمد داخلياً 👍' : 'Approved'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Export Actions Bar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportTextReport}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1b24f5] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#161dc2] transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>{language === 'ar' ? 'تحميل التقرير النصي (.txt)' : 'Download .TXT Report'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyReportSummary}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Copy className="h-4 w-4 text-slate-500" />
                  <span>{language === 'ar' ? 'نسخ ملخص سريع' : 'Copy Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="h-4 w-4 text-slate-500" />
                  <span>{language === 'ar' ? 'طباعة / حفظ PDF' : 'Print / PDF'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
