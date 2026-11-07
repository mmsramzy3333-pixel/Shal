import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  WorkMode,
  CocPillar,
  RoleKpiTemplate,
  RoleKpiMetric,
  EmployeeKpiEvaluation,
} from '../../types';
import {
  ShieldAlert,
  Award,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Lock,
  Building,
  Laptop,
  Repeat,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Users,
  Target,
  Sparkles,
  Download,
  Printer,
  ChevronDown,
  Info,
  BadgeAlert,
  FileText,
  Clock,
  Compass,
  Zap,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { CurrencyConverterBar } from '../common/CurrencyConverterBar';

// ==============================================================================
// 1. CODE OF CONDUCT (C.O.C) 6 PILLARS DATA
// ==============================================================================
const DEFAULT_COC_PILLARS: CocPillar[] = [
  {
    id: 'coc-1',
    number: '01',
    titleAr: 'السرية التامة واتفاقيات عدم الإفصاح (NDA & Data Security)',
    titleEn: 'Strict Confidentiality & Non-Disclosure',
    summaryAr: 'حظر تسريب أي بيانات أو خطط استراتيجية أو وصول للحسابات الإعلانية للعملاء.',
    severity: 'critical',
    iconName: 'Lock',
    rulesAr: [
      'يُمنع منعاً باتاً استخراج أو نسخ أو تداول أي وثائق أو بيانات أو كلمات سر لحسابات العملاء خارج بيئة العمل الرسمية للوكالة.',
      'أي كشف عن استراتيجيات العملاء أو ميزانياتهم لجهات خارجية يُعتبر خرقاً جسيماً يترتب عليه إنهاء التعاقد والمساءلة القانونية.',
      'يجب استخدام قنوات الوكالة الرسمية المشفرة فقط لتبادل الملفات وعدم استخدام الحسابات الشخصية إطلاقاً.',
      'عند انتهاء العلاقة التعاقدية للموظف، تظل التزامات السرية وعدم المنافسة سارية المفعول وفق أحكام العقد.',
    ],
  },
  {
    id: 'coc-2',
    number: '02',
    titleAr: 'حماية الملكية الفكرية والأصول الإبداعية (Intellectual Property)',
    titleEn: 'IP Integrity & Agency Ownership',
    summaryAr: 'كافة التصاميم، الأكواد، المحتوى، والمخططات من إنتاج الوكالة هي ملك خالص لها.',
    severity: 'critical',
    iconName: 'ShieldAlert',
    rulesAr: [
      'كل مخرجات العمل (تصاميم، تصوير، سيناريوهات، أكواد برمجية، بحوث SEO) المنتجة أثناء ساعات العمل هي ملكية حصرية لوكالة شال.',
      'يحظر استخدام أي أصول مرئية أو صوتية غير مرخصة تجارياً (Copyright Infringement) لضمان حماية العملاء قانونياً.',
      'لا يحق للموظف نشر أعمال الوكالة في بورتفوليو شخصي إلا بعد مرور 90 يوماً من النشر الرسمي وبموافقة خطية من الفاوندر.',
    ],
  },
  {
    id: 'coc-3',
    number: '03',
    titleAr: 'النزاهة المهنية والشفافية وتجنب تضارب المصالح (Ethics & Conflict of Interest)',
    titleEn: 'Professional Integrity & Conflict of Interest',
    summaryAr: 'حظر تقديم خدمات شخصية منافسة لعملاء الوكالة أو قبول عمولات غير مصرح بها.',
    severity: 'critical',
    iconName: 'Award',
    rulesAr: [
      'يُحظر العمل الحر (Freelancing) مع أي عميل حالي أو سابق لوكالة شال أو أي منافس مباشر دون إفصاح مسبق وموافقة رسمية.',
      'الامتناع عن تلقي أي هدايا أو مكافآت أو عمولات خفية من الموردين أو العملاء خارج النظام المالي الرسمي للوكالة.',
      'الإبلاغ الفوري للإدارة عن أي علاقة قرابة أو منفعة تجارية شخصية قد تتعارض مع قرارات التعاقد أو التوظيف.',
    ],
  },
  {
    id: 'coc-4',
    number: '04',
    titleAr: 'المسؤولية والانضباط التشغيلي وسرعة الاستجابة (Operational SLA & Accountability)',
    titleEn: 'Operational Discipline & SLA Responsiveness',
    summaryAr: 'الالتزام بمواعيد التسليم المحددة (Deadlines) وسرعة الرد على قنوات التواصل.',
    severity: 'standard',
    iconName: 'Clock',
    rulesAr: [
      'التسليم قبل الموعد النهائي (Deliverable Due Date) بـ 4 ساعات على الأقل للمراجعة والتدقيق وتجنب تأخير النشر.',
      'الاستجابة لرسائل قنوات التواصل الرسمية وسجل المهام خلال مدة أقصاها 15 دقيقة أثناء ساعات العمل الرسمية.',
      'في حالة حدوث عائق تقني أو تأخير محتمل، يجب إشعار مدير العمليات فوراً (Proactive Escalation) قبل موعد التسليم.',
    ],
  },
  {
    id: 'coc-5',
    number: '05',
    titleAr: 'الاستخدام الأخلاقي والمسؤول للذكاء الاصطناعي (Responsible AI Usage)',
    titleEn: 'Responsible AI & Quality Standards',
    summaryAr: 'استخدام أدوات الـ AI كمساعد إبداعي مع المراجعة البشرية الكاملة وضمان الأصالة.',
    severity: 'standard',
    iconName: 'Sparkles',
    rulesAr: [
      'يُمنع تسليم مخرجات مولدة بالذكاء الاصطناعي بشكل خام (Raw AI Output) دون لمسة بشرية إبداعية وتدقيق عالي.',
      'عدم تغذية أدوات الذكاء الاصطناعي العامة ببيانات العملاء الحساسة أو الأرقام المالية أو أكواد الأنظمة الخاصة.',
      'التحقق المزدوج من الحقائق والإحصاءات والنصوص المكتوبة لضمان دقتها اللغوية وملاءمتها لثقافة وهوية البراند.',
    ],
  },
  {
    id: 'coc-6',
    number: '06',
    titleAr: 'إدارة أزمات الإعلانات وحماية السمعة الرقمية (Crisis & Brand Reputation)',
    titleEn: 'Crisis Ad Management & Brand Safeguarding',
    summaryAr: 'بروتوكول التدخل السريع عند تعليق الحسابات أو وجود ردود فعل سلبية مفاجئة.',
    severity: 'operational',
    iconName: 'Zap',
    rulesAr: [
      'عند حظر أو تعليق أي حساب إعلاني لعميل، يجب إشعار مدير الميديا باينج والفاوندر خلال 5 دقائق وتفعيل خطة البدائل.',
      'يُمنع الرد على التعليقات الهجومية أو الأزمات العامة على صفحات العملاء باجتهاد فردي دون الرجوع لمدير السوشيال.',
      'مراقبة الإنفاق الإعلاني اليومي بدقة، وأي زيادة غير مبررة في الميزانية (Overspending) تقع تحت طائلة المساءلة المباشرة.',
    ],
  },
];

// ==============================================================================
// 2. ROLE-SPECIFIC KPI TEMPLATES (3 WORK MODES PER TRACK)
// ==============================================================================
const ROLE_KPI_TEMPLATES: RoleKpiTemplate[] = [
  // 1. Technical: Senior Fullstack Developer
  {
    id: 'kpi-dev',
    roleCode: 'developer',
    roleNameAr: 'المطور البرمجي والحلول التقنية (Developer)',
    applicableWorkModes: ['onsite', 'remote', 'hybrid'],
    generalDescriptionAr: 'قياس جودة البرمجة، استقرار المنظومة، سرعة إغلاق التذاكر، وسرعة نشر التحديثات مع حماية الأمان.',
    metrics: {
      onsite: [
        { id: 'dev-on-1', code: 'sprint_delivery', nameAr: 'نسبة تسليم مهام السبرنت في موعدها', nameEn: 'Sprint Delivery Rate', target: 95, current: 96, unit: '%', weight: 30, category: 'production', descriptionAr: 'إنجاز التذاكر البرمجية المجدولة لكل أسبوع.' },
        { id: 'dev-on-2', code: 'code_quality_bugs', nameAr: 'معدل خلو الكود من الأخطاء (Zero Critical Bugs)', nameEn: 'Zero-Bug Production', target: 98, current: 99, unit: '%', weight: 25, category: 'quality', descriptionAr: 'نشر كود خالي من الثغرات الحرجة في بيئة التشغيل.' },
        { id: 'dev-on-3', code: 'attendance_punctuality', nameAr: 'الانضباط وساعات العمل بالمكتب', nameEn: 'Office Attendance', target: 98, current: 97, unit: '%', weight: 20, category: 'punctuality', descriptionAr: 'تسجيل الحضور في الموعد والتعاون المباشر مع الفريق.' },
        { id: 'dev-on-4', code: 'sys_performance', nameAr: 'سرعة استجابة السيرفر وأداء النظام', nameEn: 'System TTFB & Uptime', target: 99.5, current: 99.8, unit: '%', weight: 15, category: 'quality', descriptionAr: 'توافر السيرفرات بزمن استجابة أقل من 200ms.' },
        { id: 'dev-on-5', code: 'team_collab', nameAr: 'التوثيق ومراجعة الكود للزملاء (Code Review)', nameEn: 'Peer Code Reviews', target: 10, current: 12, unit: 'مراجعة', weight: 10, category: 'communication', descriptionAr: 'المراجعات التشاركية للأكواد مع الفريق.' },
      ],
      remote: [
        { id: 'dev-rem-1', code: 'git_commits_progress', nameAr: 'حجم ونشاط المستودع (Git PRs & Output)', nameEn: 'Git Commits & Merged PRs', target: 15, current: 18, unit: 'PR شهرياً', weight: 35, category: 'production', descriptionAr: 'رفع الكود يومياً بمستودع Git وتوثيق التغييرات.' },
        { id: 'dev-rem-2', code: 'bug_resolution_time', nameAr: 'سرعة حل التذاكر الحرجة (MTTR < 2h)', nameEn: 'Mean Time to Repair', target: 95, current: 92, unit: '%', weight: 25, category: 'quality', descriptionAr: 'إصلاح المشاكل التشغيلية العاجلة خلال ساعتين.' },
        { id: 'dev-rem-3', code: 'hourly_presence_ack', nameAr: 'الاستجابة لتحديات التواجد الرقمي والتشات', nameEn: 'Digital Standup & Hourly Ack', target: 95, current: 94, unit: '%', weight: 20, category: 'punctuality', descriptionAr: 'التفاعل الدوري مع التشات وتأكيد المهام النشطة.' },
        { id: 'dev-rem-4', code: 'architecture_doc', nameAr: 'التوثيق التقني للواجهات البرمجية (API Docs)', nameEn: 'API Documentation', target: 100, current: 100, unit: '%', weight: 20, category: 'communication', descriptionAr: 'اكتمال التوثيق لجميع الـ Endpoints والمكتبات.' },
      ],
      hybrid: [
        { id: 'dev-hyb-1', code: 'hybrid_sprint_balance', nameAr: 'توازن تسليم المهام بين الحضور والريموت', nameEn: 'Hybrid Sprint Completion', target: 95, current: 95, unit: '%', weight: 30, category: 'production', descriptionAr: 'الحفاظ على نفس وتيرة الإنتاج في كلا النمطين.' },
        { id: 'dev-hyb-2', code: 'code_integrity', nameAr: 'اختبارات الوحدات وجودة الاختبارات (Unit Tests)', nameEn: 'Test Coverage > 80%', target: 80, current: 84, unit: '%', weight: 30, category: 'quality', descriptionAr: 'تغطية برمجية للاختبارات التلقائية.' },
        { id: 'dev-hyb-3', code: 'sync_meetings', nameAr: 'المشاركة الفعالة في اجتماعات التخطيط الأسبوعية', nameEn: 'Weekly Sync & Planning', target: 100, current: 100, unit: '%', weight: 20, category: 'communication', descriptionAr: 'التواجد في جلسات السبرنت الحضورية.' },
        { id: 'dev-hyb-4', code: 'live_deployments', nameAr: 'نشر التحديثات الآمنة دون فترات توقف (Zero Downtime)', nameEn: 'Zero-Downtime Releases', target: 100, current: 100, unit: '%', weight: 20, category: 'quality', descriptionAr: 'نشر بدون تعطيل عمل منصات العملاء.' },
      ],
      commission: [],
    },
  },

  // 2. Technical: UI/UX & Product Designer
  {
    id: 'kpi-uiux',
    roleCode: 'uiux',
    roleNameAr: 'مصمم واجهات وتجربة المستخدم (UI/UX Designer)',
    applicableWorkModes: ['onsite', 'remote', 'hybrid'],
    generalDescriptionAr: 'قياس دقة تسليم شاشات Figma، أنظمة التصميم (Design Systems)، معدل قبول العميل من أول جولة، والبروتوتايب التفاعلي.',
    metrics: {
      onsite: [
        { id: 'ui-on-1', code: 'screens_delivered', nameAr: 'عدد الشاشات المعتمدة نهائياً شهرياً', nameEn: 'Approved UI Screens', target: 45, current: 48, unit: 'شاشة', weight: 30, category: 'production', descriptionAr: 'شاشات متكاملة الحالات (Empty/Active/Error).' },
        { id: 'ui-on-2', code: 'first_pass_approval', nameAr: 'معدل قبول التصميم من العرض الأول دون تعديلات جوهرية', nameEn: 'First-Pass Acceptance', target: 85, current: 88, unit: '%', weight: 30, category: 'quality', descriptionAr: 'توافق النماذج مع رغبة العميل وتقليل جولات المراجعة.' },
        { id: 'ui-on-3', code: 'design_system_tokens', nameAr: 'صيانة وتحديث مكتبة المكونات الموحدة للوكالة', nameEn: 'Design Tokens Hygiene', target: 95, current: 96, unit: '%', weight: 20, category: 'quality', descriptionAr: 'استخدام الألوان والمتغيرات القياسية لـ Shal Design.' },
        { id: 'ui-on-4', code: 'collab_dev_handoff', nameAr: 'سلاسة تسليم التصاميم للمطورين (Dev Handoff)', nameEn: 'Developer Handoff Clarity', target: 95, current: 95, unit: '%', weight: 20, category: 'communication', descriptionAr: 'تسمية الطبقات والشاشات وتجهيز الـ Assets بدقة.' },
      ],
      remote: [
        { id: 'ui-rem-1', code: 'figma_daily_activity', nameAr: 'نشاط ملفات Figma والنسخ السحابية', nameEn: 'Figma Daily Cloud Commits', target: 95, current: 93, unit: '%', weight: 35, category: 'production', descriptionAr: 'العمل مباشرة داخل الفريق السحابي وتحديث النماذج.' },
        { id: 'ui-rem-2', code: 'client_prototype_presentation', nameAr: 'إعداد بروتوتايب تفاعلي ومقاطع شرح مسجلة (Loom)', nameEn: 'Interactive Prototype & Video Walkthrough', target: 100, current: 100, unit: '%', weight: 30, category: 'communication', descriptionAr: 'توضيح تجربة الاستخدام عبر نماذج تفاعلية قبل التسليم.' },
        { id: 'ui-rem-3', code: 'mobile_responsiveness', nameAr: 'توافق كامل للشاشات مع كافة مقاسات الهواتف', nameEn: 'Multi-device Responsive UI', target: 95, current: 97, unit: '%', weight: 20, category: 'quality', descriptionAr: 'تصميم حالات الشاشات الصغيرة والمتوسطة والكبيرة.' },
        { id: 'ui-rem-4', code: 'response_sla', nameAr: 'سرعة التجاوب مع استفسارات الفريق والعميل', nameEn: 'Response SLA < 20 min', target: 90, current: 92, unit: '%', weight: 15, category: 'punctuality', descriptionAr: 'الرد السريع وتعديل الملاحظات العاجلة.' },
      ],
      hybrid: [
        { id: 'ui-hyb-1', code: 'workshop_execution', nameAr: 'إدارة ورش تجربة المستخدم في المكتب', nameEn: 'Onsite UX Discovery Workshops', target: 2, current: 2, unit: 'ورشة/شهر', weight: 25, category: 'communication', descriptionAr: 'إدارة جلسات العصف الذهني واختبار المستخدمين.' },
        { id: 'ui-hyb-2', code: 'wireframes_to_ui', nameAr: 'سرعة تحويل المخططات الهيكلية لتصاميم نهائية', nameEn: 'Wireframe to High-Fi Speed', target: 90, current: 94, unit: '%', weight: 35, category: 'production', descriptionAr: 'الانتقال السلس من السكتش للواجهة المكتملة.' },
        { id: 'ui-hyb-3', code: 'creative_benchmarking', nameAr: 'أبحاث ودراسات المنافسين واتجاهات التصميم العالمية', nameEn: 'UI Benchmarking Reports', target: 100, current: 100, unit: '%', weight: 20, category: 'quality', descriptionAr: 'تقديم تقارير تحليل مرئي لبراندات العملاء.' },
        { id: 'ui-hyb-4', code: 'delivery_deadlines', nameAr: 'الالتزام بمواعيد تسليم المشاريع', nameEn: 'Milestone Adherence', target: 95, current: 95, unit: '%', weight: 20, category: 'punctuality', descriptionAr: 'تسليم مراحل المشروع في تواريخها المعتمدة.' },
      ],
      commission: [],
    },
  },

  // 3. Sales & Telesales Track (In-Office, Telesales Remote, Commission-Only)
  {
    id: 'kpi-sales',
    roleCode: 'sales_mgr',
    roleNameAr: 'مسؤول المبيعات واستقطاب الصفقات (Sales & Telesales)',
    applicableWorkModes: ['onsite', 'remote', 'commission'],
    generalDescriptionAr: 'قياس حجم الإيرادات المغلقة، عدد المكالمات التأهيلية، نسبة التحويل (Conversion Rate)، ودقة إدارة مسار الصفقات (CRM Pipeline).',
    metrics: {
      onsite: [
        { id: 'sales-on-1', code: 'revenue_closed_in_office', nameAr: 'قيمة العقود والصفقات المغلقة شهرياً (Closed Won)', nameEn: 'Monthly Closed-Won Value', target: 50000, current: 54000, unit: 'USD', weight: 40, category: 'revenue', descriptionAr: 'قيمة العقود المحصلة والتعاقدات الرسمية للوكالة.' },
        { id: 'sales-on-2', code: 'onsite_client_meetings', nameAr: 'عقد اجتماعات تفاوضية حضورية مع كبار العملاء', nameEn: 'In-Person C-Level Pitches', target: 12, current: 14, unit: 'اجتماع', weight: 25, category: 'production', descriptionAr: 'جلسات تقديم العروض المباشرة للشركات.' },
        { id: 'sales-on-3', code: 'proposal_conversion', nameAr: 'نسبة تحويل عروض الأسعار إلى عقود موقعة', nameEn: 'Proposal-to-Won Ratio', target: 35, current: 38, unit: '%', weight: 20, category: 'quality', descriptionAr: 'فاعلية العروض التجارية والقدرة على الإغلاق.' },
        { id: 'sales-on-4', code: 'crm_discipline', nameAr: 'انضباط ودقة تحديث بيانات الصفقات على CRM', nameEn: 'CRM Pipeline Hygiene', target: 95, current: 98, unit: '%', weight: 15, category: 'punctuality', descriptionAr: 'تدوين تفاصيل كل مكالمة واجتماع وتاريخ المتابعة.' },
      ],
      remote: [
        // Telesales Remote (عمل التيليسيلز عن بعد)
        { id: 'sales-rem-1', code: 'telesales_call_volume', nameAr: 'عدد المكالمات البيعية والتأهيلية المنفذة أسبوعياً', nameEn: 'Weekly Telesales Outbound Calls', target: 120, current: 135, unit: 'مكالمة', weight: 30, category: 'production', descriptionAr: 'التواصل المكثف مع الليدات وتأهيل أصحاب القرار.' },
        { id: 'sales-rem-2', code: 'qualified_leads_sql', nameAr: 'عدد الليدات المؤهلة المحولة لمرحلة العرض (SQLs)', nameEn: 'Sales Qualified Leads Generated', target: 20, current: 22, unit: 'عميل محتمل', weight: 30, category: 'quality', descriptionAr: 'ليدات تتوافق مع ميزانية ومتطلبات باقات الوكالة.' },
        { id: 'sales-rem-3', code: 'telesales_deals_won', nameAr: 'قيمة المبيعات المغلقة عبر الهاتف والاجتماعات الافتراضية', nameEn: 'Remote Deals Closed Revenue', target: 25000, current: 28500, unit: 'USD', weight: 25, category: 'revenue', descriptionAr: 'إيرادات محققة من مسار التيليسيلز عن بُعد.' },
        { id: 'sales-rem-4', code: 'lead_followup_speed', nameAr: 'سرعة معاودة الاتصال بالليد الجديد (خلال أقل من 10 دقائق)', nameEn: 'Speed to Lead (< 10 min)', target: 90, current: 93, unit: '%', weight: 15, category: 'punctuality', descriptionAr: 'استغلال اللحظة الساخنة فور تسجيل العميل اهتمامه.' },
      ],
      commission: [
        // Commission Only (مبيعات بالعمولة الخالصة)
        { id: 'sales-comm-1', code: 'pure_commission_deals', nameAr: 'إجمالي القيمة التعاقدية المغلقة بنظام العمولة', nameEn: 'Net Contracted Revenue (Commission Base)', target: 30000, current: 36000, unit: 'USD', weight: 50, category: 'revenue', descriptionAr: 'حجم العقود الموقعة كأساس لاحتساب العمولة (10% - 15%).' },
        { id: 'sales-comm-2', code: 'cash_collection_rate', nameAr: 'نسبة التحصيل النقدي الفعلي للدفعات الأولى', nameEn: 'First-Payment Cash Collection', target: 100, current: 100, unit: '%', weight: 25, category: 'quality', descriptionAr: 'العمولة تُستحق وتُصرف بناءً على المبالغ المحصلة فعلياً في حساب الوكالة.' },
        { id: 'sales-comm-3', code: 'retention_bonus_upsell', nameAr: 'عقود التجديد والخدمات الإضافية المبيعة للعملاء (Upsell)', nameEn: 'Upsells & Retainer Renewals', target: 5, current: 6, unit: 'عقد', weight: 15, category: 'production', descriptionAr: 'زيادة القيمة الدائمة للعميل (LTV).' },
        { id: 'sales-comm-4', code: 'client_satisfaction_sla', nameAr: 'معدل رضا العميل أثناء مرحلة التسليم الأولى (NPS)', nameEn: 'Client Onboarding NPS > 9', target: 90, current: 95, unit: '%', weight: 10, category: 'communication', descriptionAr: 'ضمان التوافق بين وعود البيع وإمكانيات الفريق الفعلي.' },
      ],
      hybrid: [],
    },
  },

  // 4. Creative: Senior Content Creator & Copywriter
  {
    id: 'kpi-content',
    roleCode: 'content',
    roleNameAr: 'صانع المحتوى والكاتب الإبداعي (Content Creator)',
    applicableWorkModes: ['onsite', 'remote', 'hybrid'],
    generalDescriptionAr: 'قياس دقة نبرة الصوت (Tone of Voice)، التفاعل الرقمي (Engagement)، الالتزام بروزنامة النشر، ونسبة المراجعات اللغوية الصفرية.',
    metrics: {
      onsite: [
        { id: 'cnt-on-1', code: 'posts_delivered', nameAr: 'عدد المنشورات الإبداعية المنجزة شهرياً', nameEn: 'Delivered Social Posts & Scripts', target: 80, current: 84, unit: 'بوست/سيناريو', weight: 35, category: 'production', descriptionAr: 'محتوى متكامل بالصياغة والهاشتاغات وأفكار التصميم.' },
        { id: 'cnt-on-2', code: 'first_draft_accuracy', nameAr: 'معدل قبول النصوص من المسودة الأولى دون تعديلات', nameEn: 'First-Draft Approval Rate', target: 90, current: 92, unit: '%', weight: 30, category: 'quality', descriptionAr: 'التوافق مع بريف العميل وهوية البراند.' },
        { id: 'cnt-on-3', code: 'brainstorming_presence', nameAr: 'المشاركة الفعالة في جلسات العصف الذهني للحملات', nameEn: 'Campaign Brainstorming Sessions', target: 100, current: 100, unit: '%', weight: 20, category: 'communication', descriptionAr: 'ابتكار أفكار فيرال وزوايا تسويقية إبداعية.' },
        { id: 'cnt-on-4', code: 'calendar_schedule_sla', nameAr: 'جدولة المحتوى قبل موعد النشر بـ 48 ساعة على الأقل', nameEn: '48h Prior Scheduling Buffer', target: 95, current: 96, unit: '%', weight: 15, category: 'punctuality', descriptionAr: 'تأمين المحتوى المسبق لضمان مراجعة العميل الهادئة.' },
      ],
      remote: [
        { id: 'cnt-rem-1', code: 'scripts_delivery_remote', nameAr: 'تسليم سيناريوهات الفيديو والريلز عالية الأداء', nameEn: 'Short-Form Video Viral Scripts', target: 20, current: 24, unit: 'سيناريو', weight: 35, category: 'production', descriptionAr: 'نصوص تشمل الهوك (Hook) والقصة والدعوة للفعل (CTA).' },
        { id: 'cnt-rem-2', code: 'zero_typo_policy', nameAr: 'خلو المحتوى من أي أخطاء إملائية أو لغوية (Zero Typo)', nameEn: 'Flawless Arabic & Grammar', target: 99, current: 99.5, unit: '%', weight: 30, category: 'quality', descriptionAr: 'تدقيق لغوي وصوتي احترافي لكل نص.' },
        { id: 'cnt-rem-3', code: 'trello_updates', nameAr: 'تحديث حالة النصوص وتضمين الروابط على المنصة', nameEn: 'Kanban Updates & Realtime Status', target: 95, current: 94, unit: '%', weight: 20, category: 'punctuality', descriptionAr: 'تنظيم تدفق العمل لتسهيل مهمة المصممين.' },
        { id: 'cnt-rem-4', code: 'trend_spotting', nameAr: 'رصد واقتناص الترندات اليومية (Trend Hijacking)', nameEn: 'Realtime Trend Spotting', target: 8, current: 10, unit: 'ترند مقترح', weight: 15, category: 'production', descriptionAr: 'استغلال المواضيع الشائعة في صالح عملاء الوكالة.' },
      ],
      hybrid: [
        { id: 'cnt-hyb-1', code: 'shoots_storyboarding', nameAr: 'حضور أيام التصوير وتوجيه صناع الفيديو والممثلين', nameEn: 'On-Set Storyboard Direction', target: 4, current: 4, unit: 'جلسة تصوير', weight: 30, category: 'production', descriptionAr: 'الإشراف على تنفيذ السيناريو بدقة أثناء جلسات التصوير.' },
        { id: 'cnt-hyb-2', code: 'monthly_content_calendar', nameAr: 'تسليم تقويم الشهر القادم كاملاً قبل اليوم 25', nameEn: 'Full Monthly Calendar Delivery', target: 100, current: 100, unit: '%', weight: 35, category: 'punctuality', descriptionAr: 'إنهاء جداول النشر مبكراً قبل بداية كل شهر جديد.' },
        { id: 'cnt-hyb-3', code: 'engagement_rate', nameAr: 'معدل تفاعل المتابعين على المنشورات المنتجة', nameEn: 'Average Post Engagement Rate', target: 4.5, current: 5.2, unit: '%', weight: 20, category: 'quality', descriptionAr: 'جاذبية المحتوى في إثارة التعليقات والمشاركات.' },
        { id: 'cnt-hyb-4', code: 'client_tone_matching', nameAr: 'مطابقة نبرة البراند وفق وثيقة أسلوب العميل (Brand Voice)', nameEn: 'Brand Voice Adherence', target: 95, current: 98, unit: '%', weight: 15, category: 'quality', descriptionAr: 'الالتزام التام بأسلوب كل علامة تجارية.' },
      ],
      commission: [],
    },
  },
];

// ==============================================================================
// 3. SAMPLE EVALUATIONS DATA FOR DEMONSTRATION & EDITING
// ==============================================================================
const INITIAL_EVALUATIONS: EmployeeKpiEvaluation[] = [
  {
    id: 'eval-1',
    userId: 'user-sales-mgr',
    userName: 'محمود رمزي (مدير المبيعات)',
    userRoleName: 'مدير المبيعات',
    userEmail: 'sales.m@shal.agency',
    workMode: 'onsite',
    month: '2026-03',
    overallScore: 94,
    tier: 'excellent',
    achievedCommission: 3200,
    closedDealsValue: 54000,
    evaluatorNote: 'أداء بيعي استثنائي وإغلاق 3 عقود ريتينر رئيسية مع شركات خليجية رائدة.',
    evaluationDate: '2026-03-31',
  },
  {
    id: 'eval-2',
    userId: 'user-telesales-1',
    userName: 'محمود سامي (تيليسيلز ريموت)',
    userRoleName: 'مسؤول مبيعات هاتفية',
    userEmail: 'telesales.s@shal.agency',
    workMode: 'remote',
    month: '2026-03',
    overallScore: 91,
    tier: 'excellent',
    achievedCommission: 1850,
    closedDealsValue: 28500,
    evaluatorNote: 'تجاوز مستهدف المكالمات المنفذة أسبوعياً بمعدل استجابة قياسي.',
    evaluationDate: '2026-03-31',
  },
  {
    id: 'eval-3',
    userId: 'user-comm-partner',
    userName: 'محمود خالد (مستشار مبيعات بالعمولة)',
    userRoleName: 'شريك مبيعات خارجي',
    userEmail: 'sales.commission@shal.agency',
    workMode: 'commission',
    month: '2026-03',
    overallScore: 96,
    tier: 'distinguished',
    achievedCommission: 4500,
    closedDealsValue: 36000,
    evaluatorNote: 'إغلاق عقد سنوي متكامل لعلامة تجارية كبرى وتحصيل الدفعة الأولى بالكامل.',
    evaluationDate: '2026-03-31',
  },
  {
    id: 'eval-4',
    userId: 'user-developer',
    userName: 'محمود طارق (مطور برمجيات)',
    userRoleName: 'مطور أول للأنظمة',
    userEmail: 'dev.m@shal.agency',
    workMode: 'remote',
    month: '2026-03',
    overallScore: 95,
    tier: 'distinguished',
    evaluatorNote: 'استقرار النظام بنسبة 99.8% وتطوير نظام الصلاحيات المتقدم بسرعة قياسية.',
    evaluationDate: '2026-03-31',
  },
  {
    id: 'eval-5',
    userId: 'user-ui-ux',
    userName: 'محمود نبيل (مصمم واجهات وتجربة مستخدم)',
    userRoleName: 'مصمم UI/UX',
    userEmail: 'uiux.m@shal.agency',
    workMode: 'hybrid',
    month: '2026-03',
    overallScore: 93,
    tier: 'excellent',
    evaluatorNote: 'تجديد كامل لهوية المنصة وتقديم نظام مكونات موحد متناسق مع مقاييس شال.',
    evaluationDate: '2026-03-31',
  },
];

export const KpiCocManagementView: React.FC = () => {
  const {
    language,
    currentUser,
    showToast,
    isOwner,
    isAdminOrOwner,
    formatAmount,
    formatDualAmount,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kpi_matrix' | 'coc_code' | 'evaluations'>('kpi_matrix');
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('sales_mgr');
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>('onsite');

  // Stateful C.O.C Pillars with LocalStorage
  const [cocPillars, setCocPillars] = useState<CocPillar[]>(() => {
    try {
      const saved = localStorage.getItem('shal_coc_pillars_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_COC_PILLARS;
  });

  // Stateful KPI Templates with LocalStorage
  const [kpiTemplates, setKpiTemplates] = useState<RoleKpiTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('shal_kpi_templates_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ROLE_KPI_TEMPLATES;
  });

  const [evaluations, setEvaluations] = useState<EmployeeKpiEvaluation[]>(INITIAL_EVALUATIONS);
  const [hasAcknowledgedCoc, setHasAcknowledgedCoc] = useState<boolean>(() => {
    return localStorage.getItem(`shal_coc_ack_${currentUser?.id}`) === 'true';
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for CRUD operations
  const [showPillarModal, setShowPillarModal] = useState(false);
  const [editingPillar, setEditingPillar] = useState<CocPillar | null>(null);

  const [showMetricModal, setShowMetricModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<{
    roleCode: string;
    workMode: WorkMode;
    metric: RoleKpiMetric;
    isNew: boolean;
  } | null>(null);

  // Save/Update C.O.C Pillar
  const handleSavePillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPillar) return;

    let updated: CocPillar[];
    const exists = cocPillars.some((p) => p.id === editingPillar.id);
    if (exists) {
      updated = cocPillars.map((p) => (p.id === editingPillar.id ? editingPillar : p));
    } else {
      updated = [...cocPillars, editingPillar];
    }

    setCocPillars(updated);
    try {
      localStorage.setItem('shal_coc_pillars_v2', JSON.stringify(updated));
    } catch {}

    setShowPillarModal(false);
    setEditingPillar(null);
    showToast({
      type: 'success',
      title: 'تم حفظ بند ميثاق السلوك (C.O.C)',
      message: `تم تحديث البند رقم ${editingPillar.number}: ${editingPillar.titleAr}`,
    });
  };

  const handleDeletePillar = (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا البند من ميثاق الشرف؟')) return;
    const updated = cocPillars.filter((p) => p.id !== id);
    setCocPillars(updated);
    try {
      localStorage.setItem('shal_coc_pillars_v2', JSON.stringify(updated));
    } catch {}
    showToast({
      type: 'info',
      title: 'تم حذف البند',
      message: 'تمت إزالة البند بنجاح وتحديث وثيقة ميثاق الشرف.',
    });
  };

  // Save/Update KPI Metric
  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMetric) return;

    const { roleCode, workMode, metric, isNew } = editingMetric;

    const updatedTemplates = kpiTemplates.map((tmpl) => {
      if (tmpl.roleCode !== roleCode) return tmpl;

      const currentList = tmpl.metrics[workMode] || [];
      let updatedList: RoleKpiMetric[];
      if (isNew) {
        updatedList = [...currentList, metric];
      } else {
        updatedList = currentList.map((m) => (m.id === metric.id ? metric : m));
      }

      return {
        ...tmpl,
        metrics: {
          ...tmpl.metrics,
          [workMode]: updatedList,
        },
      };
    });

    setKpiTemplates(updatedTemplates);
    try {
      localStorage.setItem('shal_kpi_templates_v2', JSON.stringify(updatedTemplates));
    } catch {}

    setShowMetricModal(false);
    setEditingMetric(null);
    showToast({
      type: 'success',
      title: 'تم حفظ مؤشر الأداء (KPI)',
      message: `تم تحديث المؤشر ${metric.nameAr} بنجاح.`,
    });
  };

  const handleDeleteMetric = (roleCode: string, workMode: WorkMode, metricId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المؤشر من مصفوفة الأداء؟')) return;

    const updatedTemplates = kpiTemplates.map((tmpl) => {
      if (tmpl.roleCode !== roleCode) return tmpl;
      return {
        ...tmpl,
        metrics: {
          ...tmpl.metrics,
          [workMode]: (tmpl.metrics[workMode] || []).filter((m) => m.id !== metricId),
        },
      };
    });

    setKpiTemplates(updatedTemplates);
    try {
      localStorage.setItem('shal_kpi_templates_v2', JSON.stringify(updatedTemplates));
    } catch {}

    showToast({
      type: 'info',
      title: 'تم حذف المؤشر',
      message: 'تمت إزالة المؤشر من المصفوفة المعتمدة.',
    });
  };

  // Handle COC acknowledgment
  const handleAcknowledgeCoc = () => {
    localStorage.setItem(`shal_coc_ack_${currentUser?.id}`, 'true');
    setHasAcknowledgedCoc(true);
    showToast({
      type: 'success',
      title: 'تم اعتماد وتوقيع ميثاق العمل الرقمي بنجاح',
      message: 'تم تسجيل توقيعك وإقرارك بالالتزام ببنود ميثاق شال (C.O.C) في سجل التدقيق الإداري.',
    });
  };

  // Find template for selected role from stateful kpiTemplates
  const activeTemplate = useMemo(() => {
    return (
      kpiTemplates.find((t) => t.roleCode === selectedRoleCode) ||
      kpiTemplates[0] ||
      ROLE_KPI_TEMPLATES[0]
    );
  }, [kpiTemplates, selectedRoleCode]);

  // Adjust work mode when role changes if mode not supported
  const currentMetrics = useMemo(() => {
    if (activeTemplate.metrics[selectedWorkMode] && activeTemplate.metrics[selectedWorkMode].length > 0) {
      return activeTemplate.metrics[selectedWorkMode];
    }
    // Fallback to first available
    const firstAvail = activeTemplate.applicableWorkModes[0] || 'onsite';
    return activeTemplate.metrics[firstAvail] || [];
  }, [activeTemplate, selectedWorkMode]);

  // Work Mode Badge Label
  const getWorkModeBadge = (mode: WorkMode) => {
    switch (mode) {
      case 'onsite':
        return {
          label: 'حضوري بالكامل (In-Office)',
          icon: Building,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'remote':
        return {
          label: 'عن بُعد بالكامل (Remote Online)',
          icon: Laptop,
          color: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'hybrid':
        return {
          label: 'عمل هجين (Hybrid 3+2)',
          icon: Repeat,
          color: 'bg-purple-50 text-purple-800 border-purple-200',
        };
      case 'commission':
        return {
          label: 'مبيعات بالعمولة (Commission Only)',
          icon: DollarSign,
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      default:
        return {
          label: mode,
          icon: Building,
          color: 'bg-slate-50 text-slate-800 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Dual Currency Converter Bar (SAR / EGP) */}
      <CurrencyConverterBar />

      {/* Top Header Card */}
      <div className="rounded-3xl border border-[#BDAF9C]/35 bg-gradient-to-r from-[#24291F] via-[#2F3628] to-[#4C5540] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold backdrop-blur-md">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>ميثاق السلوك المهني ومصفوفة مؤشرات الأداء الوظيفي (C.O.C & KPIs Hub)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              منظومة تقييم الأداء والميثاق الأخلاقي للوكالة
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              إطار احترافي شامل ومحاكي لطبيعة عمل كل تخصص وظيفي في وكالة شال، يدعم بدقة حالات العمل الثلاث (حضوري، عن بُعد، هجين) للفريق التقني والإبداعي، والأنماط الثلاثة لفريق المبيعات (من الشركة، ريموت تيليسيلز، وبالعمولة الخالصة).
            </p>
          </div>

          {/* Quick Stats or Signature Stamp */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {hasAcknowledgedCoc ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold shadow-inner">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <span>تم توقيع ميثاق C.O.C إلكترونياً</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAcknowledgeCoc}
                className="btn-interactive flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg cursor-pointer transition-all"
              >
                <Lock className="h-4 w-4" />
                <span>إقرار وتوقيع ميثاق السلوك (C.O.C)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="btn-interactive flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold cursor-pointer transition-all"
              title="طباعة تقرير مؤشرات الأداء"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">طباعة الوثيقة</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/15 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('kpi_matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'kpi_matrix'
                ? 'bg-white text-[#24291F] shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>مصفوفة مؤشرات الأداء (KPIs Matrix) بحالات العمل الثلاث</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coc_code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coc_code'
                ? 'bg-white text-[#24291F] shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>ميثاق قواعد السلوك المهني والسرية (Code of Conduct)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'evaluations'
                ? 'bg-white text-[#24291F] shadow-md'
                : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>سجل تقييمات الموظفين والعمولات الشهرية</span>
          </button>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* TAB 1: KPI MATRIX WITH 3 WORK MODES                                            */}
      {/* ============================================================================== */}
      {activeTab === 'kpi_matrix' && (
        <div className="space-y-6">
          {/* Controls Bar: Role Selector & Work Mode Switcher */}
          <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  اختر الدور الوظيفي لمعاينة وتعديل معايير ومستهدفات الأداء:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {ROLE_KPI_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleCode(tmpl.roleCode);
                        if (!tmpl.applicableWorkModes.includes(selectedWorkMode)) {
                          setSelectedWorkMode(tmpl.applicableWorkModes[0]);
                        }
                      }}
                      className={`btn-interactive px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedRoleCode === tmpl.roleCode
                          ? 'bg-[#4C5540] text-white border-[#4C5540] shadow-sm'
                          : 'bg-[#FAF7F2] text-slate-700 border-[#BDAF9C]/35 hover:bg-[#E9E1D6]/60'
                      }`}
                    >
                      {tmpl.roleNameAr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Mode Selector for Selected Role */}
              <div className="border-t lg:border-t-0 lg:border-r border-slate-200 pt-3 lg:pt-0 lg:pr-5">
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  حالة ونمط العمل المعتمد (Work Mode):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {activeTemplate.applicableWorkModes.map((mode) => {
                    const badge = getWorkModeBadge(mode);
                    const Icon = badge.icon;
                    const isActive = selectedWorkMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSelectedWorkMode(mode)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-[#24291F] text-white border-[#24291F] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-amber-400" />
                        <span>{badge.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description Banner & Add Metric Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[#FAF7F2] p-3.5 border border-[#BDAF9C]/25 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-[#4C5540] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#24291F] block mb-0.5">
                    فلسفة التقييم لهذا الدور الوظيفي:
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {activeTemplate.generalDescriptionAr}
                  </p>
                </div>
              </div>

              {isAdminOrOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMetric({
                      roleCode: selectedRoleCode,
                      workMode: selectedWorkMode,
                      metric: {
                        id: `met-${Date.now()}`,
                        code: 'new_metric',
                        nameAr: '',
                        nameEn: 'New Metric',
                        target: 100,
                        current: 0,
                        unit: '%',
                        weight: 20,
                        category: 'production',
                        descriptionAr: '',
                      },
                      isNew: true,
                    });
                    setShowMetricModal(true);
                  }}
                  className="btn-interactive shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4C5540] text-white text-xs font-bold hover:bg-[#3B4432] cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>إضافة مؤشر أداء (KPI)</span>
                </button>
              )}
            </div>
          </div>

          {/* Metrics Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentMetrics.map((metric, idx) => {
              const percentage = Math.min(Math.round((metric.current / metric.target) * 100), 100);
              const isOverAchieved = metric.current >= metric.target;

              return (
                <div
                  key={metric.id}
                  className="rounded-2xl border border-[#BDAF9C]/35 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4C5540]/10 text-xs font-black text-[#4C5540] font-mono">
                          0{idx + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          {metric.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                          الوزن: {metric.weight}%
                        </span>
                        {isAdminOrOwner && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMetric({
                                  roleCode: selectedRoleCode,
                                  workMode: selectedWorkMode,
                                  metric: { ...metric },
                                  isNew: false,
                                });
                                setShowMetricModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                              title="تعديل المؤشر"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMetric(selectedRoleCode, selectedWorkMode, metric.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                              title="حذف المؤشر"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#24291F]">
                        {metric.nameAr}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {metric.descriptionAr}
                      </p>
                    </div>

                    {/* Target vs Actual */}
                    <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#BDAF9C]/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">المستهدف الشهري:</span>
                        <span className="font-black text-slate-800 text-sm font-mono">
                          {metric.target.toLocaleString()} {metric.unit}
                        </span>
                      </div>
                      <div className="text-left rtl:text-left">
                        <span className="text-[10px] text-slate-400 block font-bold">المحقق الفعلي:</span>
                        <span
                          className={`font-black text-sm font-mono ${
                            isOverAchieved ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {metric.current.toLocaleString()} {metric.unit}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">نسبة تحقيق الهدف</span>
                        <span className={isOverAchieved ? 'text-emerald-700' : 'text-slate-700'}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverAchieved
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                              : 'bg-gradient-to-r from-amber-500 to-[#4C5540]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">فئة القياس:</span>
                    <span className="font-bold text-[#4C5540] bg-[#4C5540]/10 px-2 py-0.5 rounded-md">
                      {metric.category === 'revenue' && 'الإيرادات والصفقات'}
                      {metric.category === 'production' && 'حجم الإنتاج والإنجاز'}
                      {metric.category === 'quality' && 'الجودة والمعايير'}
                      {metric.category === 'punctuality' && 'الانضباط والمواعيد'}
                      {metric.category === 'communication' && 'التواصل والتعاون'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Work Mode Detailed Guidelines Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#24291F] flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#4C5540]" />
              <span>
                شروط وضوابط نمط العمل المختار: {getWorkModeBadge(selectedWorkMode).label}
              </span>
            </h3>

            {selectedWorkMode === 'onsite' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 block">ساعات التواجد المكتبي</span>
                  <p>الالتزام بالبصمة الصباحية من 9:00 صباحاً حتى 5:00 مساءً بمقر الوكالة الرئيسي.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 block">التنسيق المباشر</span>
                  <p>المشاركة في جلسات السبرنت الحضورية، مراجعات التصاميم الفورية، ومرافقة العروض.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 block">المعدات والتجهيزات</span>
                  <p>استخدام أجهزة ومحطات العمل الآمنة والشبكة الداخلية المشفرة للوكالة.</p>
                </div>
              </div>
            )}

            {selectedWorkMode === 'remote' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="font-bold text-blue-900 block">التحقق الدوري والجاهزية الرقمية</span>
                  <p>الاستجابة لنظام التحقق الساعي وتأكيد المهمة النشطة خلال 15 دقيقة والتواجد بالتشات.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="font-bold text-blue-900 block">الأمان والشبكات الافتراضية</span>
                  <p>حظر استخدام شبكات الواي فاي العامة دون تشفير، وتأمين كلمات السر عبر 2FA.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="font-bold text-blue-900 block">الاجتماعات الافتراضية الكاميرا</span>
                  <p>حضور الستاند-أب الصباحي اليومي بالكاميرا لتعزيز روح الفريق والوضوح التشغيلي.</p>
                </div>
              </div>
            )}

            {selectedWorkMode === 'hybrid' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
                  <span className="font-bold text-purple-900 block">جدول الأيام المعتمد</span>
                  <p>3 أيام حضورية بالمكتب (الأحد، الثلاثاء، الخميس) + يومين عن بُعد (الإثنين، الأربعاء).</p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
                  <span className="font-bold text-purple-900 block">تسليم المخرجات المتزامن</span>
                  <p>الحفاظ على نفس وتيرة إنجاز المهام على كانبان دون أي تراجع في أيام الريموت.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
                  <span className="font-bold text-purple-900 block">المرونة الإدارية المعتمدة</span>
                  <p>إمكانية تعديل الأيام بالتنسيق المسبق قبل 24 ساعة مع مدير العمليات المباشر.</p>
                </div>
              </div>
            )}

            {selectedWorkMode === 'commission' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block">شرط استحقاق العمولة</span>
                  <p>تُصرف العمولة (10% - 15%) فور التحصيل الفعلي للدفعة الأولى في الحساب البنكي للوكالة.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block">عقود الريتينر الدورية</span>
                  <p>استحقاق عمولة متجددة بنسبة 5% طوال أول 3 أشهر من استمرار العميل في الريتينر.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block">حماية العلاقات التعاقدية</span>
                  <p>توثيق العميل على نظام الـ CRM باسم مسؤول المبيعات لحفظ حقه الحصري بالعمولة لمدة 6 أشهر.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 2: CODE OF CONDUCT (C.O.C)                                                 */}
      {/* ============================================================================== */}
      {activeTab === 'coc_code' && (
        <div className="space-y-6">
          {/* Legal Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                <h2 className="text-base sm:text-lg font-black text-[#24291F]">
                  وثيقة ميثاق الشرف المهني وقواعد السلوك لوكالة شال (Code of Conduct - C.O.C)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {isAdminOrOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPillar({
                        id: `coc-${Date.now()}`,
                        number: String(cocPillars.length + 1).padStart(2, '0'),
                        titleAr: '',
                        titleEn: '',
                        summaryAr: '',
                        rulesAr: [''],
                        severity: 'standard',
                        iconName: 'ShieldAlert',
                      });
                      setShowPillarModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4C5540] text-white text-xs font-bold hover:bg-[#3B4432] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>إضافة بند جديد للميثاق</span>
                  </button>
                )}
                <span className="rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 text-xs font-bold font-mono">
                  إصدار معتمد 2026/2025
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              هذه الوثيقة ملزمة قانونياً وأخلاقياً لجميع منسوبي وكالة شال دون استثناء (إدارة، موظفين دائمين، متعاقدين عن بُعد، ومسؤولي مبيعات). أي إخلال بهذه البنود يخضع للائحة الجزاءات والمساءلة الإدارية والقانونية.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cocPillars.map((pillar) => (
              <div
                key={pillar.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs space-y-4 ${
                  pillar.severity === 'critical'
                    ? 'border-rose-200/80 hover:border-rose-400'
                    : 'border-[#BDAF9C]/35 hover:border-[#4C5540]'
                } transition-all relative group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#24291F] text-white font-mono font-black text-sm">
                      {pillar.number}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#24291F]">
                        {pillar.titleAr}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {pillar.titleEn}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pillar.severity === 'critical' ? (
                      <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">
                        بند سيادي حرج
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                        بند تشغيلي
                      </span>
                    )}

                    {isAdminOrOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPillar({ ...pillar });
                            setShowPillarModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="تعديل البند"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePillar(pillar.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                          title="حذف البند"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-700 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#BDAF9C]/20">
                  {pillar.summaryAr}
                </p>

                <ul className="space-y-2 text-xs text-slate-600">
                  {pillar.rulesAr.map((rule, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Formal Digital Signature Section */}
          <div className="rounded-2xl border-2 border-dashed border-[#4C5540]/40 bg-[#FAF7F2] p-6 text-center space-y-4">
            <div className="max-w-xl mx-auto space-y-2">
              <FileCheck2 className="h-10 w-10 text-[#4C5540] mx-auto" />
              <h3 className="text-base font-bold text-[#24291F]">
                التوقيع والإقرار الرقمي الموثق
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                بالنقر على زر التوقيع، أقر أنا الموظف المسجل باسمي وحسابي بأنني اطلعت على كامل بنود ميثاق السلوك المهني والسرية، وأتعهد بالالتزام التام بكافة واجباتها المهنية والقانونية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {hasAcknowledgedCoc ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>تم توثيق إقرارك الرقمي لهذا العام (Verified Employee Digital Stamp)</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAcknowledgeCoc}
                  className="btn-interactive px-6 py-2.5 rounded-xl bg-[#4C5540] hover:bg-[#3B4432] text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>أوافق وأوقع على ميثاق السلوك المهني والسرية</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 3: EMPLOYEE EVALUATIONS & COMMISSIONS LEDGER                                */}
      {/* ============================================================================== */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6">
          {/* Evaluations Filter & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#BDAF9C]/35 bg-white p-4 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute top-1/2 -translate-y-1/2 right-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم الموظف أو الدور..."
                className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] py-2 pr-9 pl-3 text-xs text-slate-800 focus:outline-none focus:border-[#4C5540]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">الفترة التقييمية:</span>
              <span className="rounded-xl bg-[#FAF7F2] border border-[#BDAF9C]/35 px-3 py-1.5 text-xs font-bold text-slate-800">
                مارس 2026 (الربع الأول Q1)
              </span>
            </div>
          </div>

          {/* Evaluations Table */}
          <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#FAF7F2] text-slate-600 border-b border-[#BDAF9C]/30 font-bold">
                  <tr>
                    <th className="py-3 px-4">الموظف والدور</th>
                    <th className="py-3 px-4">نمط العمل</th>
                    <th className="py-3 px-4 text-center">الدرجة الإجمالية (100)</th>
                    <th className="py-3 px-4 text-center">التصنيف الوظيفي</th>
                    <th className="py-3 px-4 text-center">الصفقات المغلقة</th>
                    <th className="py-3 px-4 text-center">العمولة المستحقة</th>
                    <th className="py-3 px-4">ملاحظات التقييم الإداري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluations
                    .filter(
                      (e) =>
                        e.userName.includes(searchTerm) ||
                        e.userRoleName.includes(searchTerm)
                    )
                    .map((item) => {
                      const modeBadge = getWorkModeBadge(item.workMode);
                      return (
                        <tr key={item.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{item.userName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{item.userRoleName}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${modeBadge.color}`}>
                              {modeBadge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-[#4C5540]/10 text-[#4C5540] font-mono font-black text-sm">
                              {item.overallScore}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {item.tier === 'distinguished' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                استثنائي ومتميز
                              </span>
                            )}
                            {item.tier === 'excellent' && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                                ممتاز يفوق التوقعات
                              </span>
                            )}
                            {item.tier === 'good' && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                                جيد ومستقر
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                            {item.closedDealsValue ? formatAmount(item.closedDealsValue) : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                            {item.achievedCommission ? `+${formatAmount(item.achievedCommission)}` : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-600 max-w-xs leading-relaxed">
                            {item.evaluatorNote}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 1: C.O.C PILLAR ADD / EDIT MODAL                                         */}
      {/* ============================================================================== */}
      {showPillarModal && editingPillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-[#4C5540]" />
                <h3 className="text-base font-bold text-[#24291F]">
                  {cocPillars.some((p) => p.id === editingPillar.id)
                    ? 'تعديل بند في ميثاق السلوك المهني (C.O.C)'
                    : 'إضافة بند جديد لميثاق السلوك المهني (C.O.C)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPillarModal(false);
                  setEditingPillar(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePillar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم البند</label>
                  <input
                    type="text"
                    value={editingPillar.number}
                    onChange={(e) =>
                      setEditingPillar({ ...editingPillar, number: e.target.value })
                    }
                    placeholder="01"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-mono text-center font-bold focus:border-[#4C5540] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">درجة الأهمية / الخطورة</label>
                  <select
                    value={editingPillar.severity}
                    onChange={(e) =>
                      setEditingPillar({
                        ...editingPillar,
                        severity: e.target.value as 'critical' | 'standard',
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-bold focus:border-[#4C5540] focus:outline-none"
                  >
                    <option value="standard">بند تشغيلي عادي (Standard Operational)</option>
                    <option value="critical">بند سيادي حرج / خط أحمر (Critical Sovereign)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان البند بالعربية</label>
                <input
                  type="text"
                  value={editingPillar.titleAr}
                  onChange={(e) =>
                    setEditingPillar({ ...editingPillar, titleAr: e.target.value })
                  }
                  placeholder="مثال: سرية بيانات العملاء وحماية الأصول الرقمية"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 focus:border-[#4C5540] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان بالإنجليزية (English Title)</label>
                <input
                  type="text"
                  value={editingPillar.titleEn}
                  onChange={(e) =>
                    setEditingPillar({ ...editingPillar, titleEn: e.target.value })
                  }
                  placeholder="Client Data Confidentiality & Asset Protection"
                  className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-mono focus:border-[#4C5540] focus:outline-none text-left"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملخص وتأصيل البند</label>
                <textarea
                  rows={2}
                  value={editingPillar.summaryAr}
                  onChange={(e) =>
                    setEditingPillar({ ...editingPillar, summaryAr: e.target.value })
                  }
                  placeholder="شرح موجز لأهمية هذا البند وغايته التشغيلية..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 focus:border-[#4C5540] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الضوابط والالتزامات التفصيلية (قاعدة واحدة في كل سطر)
                </label>
                <textarea
                  rows={4}
                  value={editingPillar.rulesAr.join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    setEditingPillar({ ...editingPillar, rulesAr: lines });
                  }}
                  placeholder="حظر تصدير أي مستندات خارج النظام
الالتزام باتفاقية عدم الإفصاح NDA
الإبلاغ الفوري عند الاشتباه بأي اختراق"
                  className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-mono text-xs focus:border-[#4C5540] focus:outline-none leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  اكتب كل شرط أو التزام في سطر منفصل؛ سيتم تحويل كل سطر لنقطة فحص تلقائياً.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPillarModal(false);
                    setEditingPillar(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-interactive px-5 py-2 rounded-xl bg-[#4C5540] hover:bg-[#3B4432] text-white font-bold cursor-pointer shadow-sm"
                >
                  حفظ البند وتحديث الميثاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL 2: ROLE KPI METRIC ADD / EDIT MODAL                                      */}
      {/* ============================================================================== */}
      {showMetricModal && editingMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#4C5540]" />
                <div>
                  <h3 className="text-base font-bold text-[#24291F]">
                    {editingMetric.isNew ? 'إضافة مؤشر أداء جديد (KPI)' : 'تعديل مؤشر الأداء'}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {getWorkModeBadge(editingMetric.workMode).label}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMetricModal(false);
                  setEditingMetric(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود المؤشر (Code)</label>
                  <input
                    type="text"
                    value={editingMetric.metric.code}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        metric: { ...editingMetric.metric, code: e.target.value },
                      })
                    }
                    placeholder="e.g. kpi_deal_closing"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-mono focus:border-[#4C5540] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">فئة القياس</label>
                  <select
                    value={editingMetric.metric.category}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        metric: {
                          ...editingMetric.metric,
                          category: e.target.value as any,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-bold focus:border-[#4C5540] focus:outline-none"
                  >
                    <option value="revenue">الإيرادات والصفقات (Revenue)</option>
                    <option value="production">حجم الإنتاج والإنجاز (Production)</option>
                    <option value="quality">الجودة والمعايير (Quality)</option>
                    <option value="punctuality">الانضباط والمواعيد (Punctuality)</option>
                    <option value="communication">التواصل والتعاون (Communication)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المؤشر بالعربية</label>
                <input
                  type="text"
                  value={editingMetric.metric.nameAr}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      metric: { ...editingMetric.metric, nameAr: e.target.value },
                    })
                  }
                  placeholder="مثال: إجمالي العقود المغلقة شهرياً"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 focus:border-[#4C5540] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستهدف</label>
                  <input
                    type="number"
                    value={editingMetric.metric.target}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        metric: {
                          ...editingMetric.metric,
                          target: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-mono text-center font-bold focus:border-[#4C5540] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المحقق الفعلي</label>
                  <input
                    type="number"
                    value={editingMetric.metric.current}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        metric: {
                          ...editingMetric.metric,
                          current: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-mono text-center font-bold focus:border-[#4C5540] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={editingMetric.metric.unit}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        metric: { ...editingMetric.metric, unit: e.target.value },
                      })
                    }
                    placeholder="%, عقد, ساعة"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 text-center font-bold focus:border-[#4C5540] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوزن %</label>
                  <input
                    type="number"
                    value={editingMetric.metric.weight}
                    onChange={(e) =>
                      setEditingMetric({
                        ...editingMetric,
                        metric: {
                          ...editingMetric.metric,
                          weight: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    placeholder="25"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 font-mono text-center font-bold focus:border-[#4C5540] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شرح وطريقة قياس المؤشر بالعربية</label>
                <textarea
                  rows={2}
                  value={editingMetric.metric.descriptionAr}
                  onChange={(e) =>
                    setEditingMetric({
                      ...editingMetric,
                      metric: { ...editingMetric.metric, descriptionAr: e.target.value },
                    })
                  }
                  placeholder="وصف واضح لكيفية احتساب هذا المؤشر ومعيار النجاح فيه..."
                  required
                  className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] p-2.5 focus:border-[#4C5540] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMetricModal(false);
                    setEditingMetric(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-interactive px-5 py-2 rounded-xl bg-[#4C5540] hover:bg-[#3B4432] text-white font-bold cursor-pointer shadow-sm"
                >
                  حفظ المؤشر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
