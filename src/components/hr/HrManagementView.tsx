import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EmployeeHrFile,
  LeaveRequest,
  LeaveType,
  WorkMode,
  AgencyTeam,
  PerformanceAppraisal,
  CompensationBonus,
} from '../../types';
import { CurrencyConverterBar } from '../common/CurrencyConverterBar';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Building,
  Laptop,
  Repeat,
  BadgeAlert,
  FileText,
  UserCheck,
  ShieldCheck,
  Phone,
  Mail,
  Briefcase,
  AlertTriangle,
  Award,
  Printer,
  Sparkles,
  Edit2,
  Trash2,
  Star,
  Gift,
  Coins,
} from 'lucide-react';

const INITIAL_HR_FILES: EmployeeHrFile[] = [
  {
    id: 'hr-1',
    userId: 'user-founder',
    userName: 'محمود رمزي (Founder & CEO)',
    userEmail: 'm.m.s.ramzy3333@gmail.com',
    employeeNumber: '01',
    team: 'management',
    workMode: 'onsite',
    contractType: 'full_time',
    hireDate: '2024-01-01',
    baseSalary: 45000,
    housingAllowance: 9375,
    transportAllowance: 3750,
    bonusesTotal: 10000,
    annualLeaveBalance: 30,
    usedLeaveDays: 2,
    emergencyContact: { name: 'المكتب التنفيذي', phone: '+20 100 000 0001', relation: 'الإدارة العليا' },
    status: 'active',
  },
  {
    id: 'hr-2',
    userId: 'user-ops-mgr',
    userName: 'محمود عبد السلام (مدير العمليات)',
    userEmail: 'operations.m@shal.agency',
    employeeNumber: '02',
    team: 'operations',
    workMode: 'onsite',
    contractType: 'full_time',
    hireDate: '2024-03-01',
    baseSalary: 16875,
    housingAllowance: 3000,
    transportAllowance: 1500,
    bonusesTotal: 2500,
    annualLeaveBalance: 24,
    usedLeaveDays: 4,
    emergencyContact: { name: 'سارة عبد السلام', phone: '+20 102 334 5566', relation: 'زوجة' },
    status: 'active',
  },
  {
    id: 'hr-3',
    userId: 'user-sales-mgr',
    userName: 'محمود إبراهيم (مدير المبيعات)',
    userEmail: 'sales.m@shal.agency',
    employeeNumber: '03',
    team: 'sales',
    workMode: 'onsite',
    contractType: 'full_time',
    hireDate: '2024-04-15',
    baseSalary: 14250,
    commissionPercentage: 10,
    housingAllowance: 2250,
    transportAllowance: 1875,
    bonusesTotal: 6500,
    annualLeaveBalance: 24,
    usedLeaveDays: 3,
    emergencyContact: { name: 'إبراهيم حسن', phone: '+20 109 887 6655', relation: 'والد' },
    status: 'active',
  },
  {
    id: 'hr-4',
    userId: 'user-developer',
    userName: 'محمود طارق (مطور أول للأنظمة)',
    userEmail: 'dev.m@shal.agency',
    employeeNumber: '04',
    team: 'developer',
    workMode: 'remote',
    contractType: 'full_time',
    hireDate: '2024-06-01',
    baseSalary: 15750,
    housingAllowance: 0,
    transportAllowance: 0,
    bonusesTotal: 3000,
    annualLeaveBalance: 24,
    usedLeaveDays: 5,
    emergencyContact: { name: 'أحمد طارق', phone: '+20 111 223 3445', relation: 'أخ' },
    status: 'active',
  },
  {
    id: 'hr-5',
    userId: 'user-ui-ux',
    userName: 'محمود نبيل (مصمم واجهات وتجربة مستخدم)',
    userEmail: 'uiux.m@shal.agency',
    employeeNumber: '05',
    team: 'uiux',
    workMode: 'hybrid',
    contractType: 'full_time',
    hireDate: '2024-07-01',
    baseSalary: 13125,
    housingAllowance: 0,
    transportAllowance: 1125,
    bonusesTotal: 2000,
    annualLeaveBalance: 24,
    usedLeaveDays: 6,
    emergencyContact: { name: 'ياسين نبيل', phone: '+20 114 556 6778', relation: 'أخ' },
    status: 'active',
  },
  {
    id: 'hr-6',
    userId: 'user-telesales-1',
    userName: 'محمود سامي (تيليسيلز ريموت)',
    userEmail: 'telesales.s@shal.agency',
    employeeNumber: '06',
    team: 'sales',
    workMode: 'remote',
    contractType: 'full_time',
    hireDate: '2024-09-01',
    baseSalary: 8250,
    commissionPercentage: 8,
    bonusesTotal: 4200,
    annualLeaveBalance: 21,
    usedLeaveDays: 1,
    emergencyContact: { name: 'فاطمة سامي', phone: '+20 120 112 2334', relation: 'أخت' },
    status: 'active',
  },
  {
    id: 'hr-7',
    userId: 'user-comm-partner',
    userName: 'محمود خالد (شريك مبيعات بالعمولة الخالصة)',
    userEmail: 'sales.commission@shal.agency',
    employeeNumber: '07',
    team: 'sales',
    workMode: 'commission',
    contractType: 'commission_only',
    hireDate: '2024-11-01',
    baseSalary: 0,
    commissionPercentage: 15,
    bonusesTotal: 12500,
    annualLeaveBalance: 0,
    usedLeaveDays: 0,
    emergencyContact: { name: 'خالد مصطفى', phone: '+20 100 445 5667', relation: 'والد' },
    status: 'active',
  },
];

const INITIAL_APPRAISALS: PerformanceAppraisal[] = [
  {
    id: 'appr-1',
    employeeId: 'hr-4',
    employeeName: 'محمود طارق (مطور أول للأنظمة)',
    evaluatorId: 'user-founder',
    evaluatorName: 'م. محمود رمزي (Founder)',
    cycle: '2026-Q1',
    workMode: 'remote',
    ratings: {
      technicalProductivity: 5,
      qualityOfDeliverables: 5,
      adherenceToCoc: 5,
      communicationAndPunctuality: 4,
      initiativeAndGrowth: 5,
    },
    overallScore: 96,
    strengths: 'بناء نظام الصلاحيات المتقدم وتطوير وحدة التدفق النقدي واستقرار السيرفرات بنسبة 99.9%.',
    improvementsNeeded: 'زيادة المشاركة الصوتية في لقاءات الستاند-أب الافتراضية الصباحية.',
    recommendedBonusOrAdjustment: 3000,
    status: 'approved_by_founder',
    appraisalDate: '2026-03-30',
  },
  {
    id: 'appr-2',
    employeeId: 'hr-3',
    employeeName: 'محمود إبراهيم (مدير المبيعات)',
    evaluatorId: 'user-founder',
    evaluatorName: 'م. محمود رمزي (Founder)',
    cycle: '2026-Q1',
    workMode: 'onsite',
    ratings: {
      technicalProductivity: 5,
      qualityOfDeliverables: 4,
      adherenceToCoc: 5,
      communicationAndPunctuality: 5,
      initiativeAndGrowth: 4,
    },
    overallScore: 92,
    strengths: 'إغلاق 4 صفقات ريتينر رئيسية وتحقيق 115% من المستهدف البيعي الربعي.',
    improvementsNeeded: 'متابعة تحديث سجلات المكالمات على الـ CRM بشكل لحظي بعد كل اجتماع.',
    recommendedBonusOrAdjustment: 5000,
    status: 'approved_by_founder',
    appraisalDate: '2026-03-28',
  },
  {
    id: 'appr-3',
    employeeId: 'hr-5',
    employeeName: 'محمود نبيل (مصمم UI/UX)',
    evaluatorId: 'user-ops-mgr',
    evaluatorName: 'محمود عبد السلام (مدير العمليات)',
    cycle: '2026-Q1',
    workMode: 'hybrid',
    ratings: {
      technicalProductivity: 4,
      qualityOfDeliverables: 5,
      adherenceToCoc: 5,
      communicationAndPunctuality: 4,
      initiativeAndGrowth: 4,
    },
    overallScore: 88,
    strengths: 'تصميم لغة بصرية متناسقة وتسليم شاشات Figma متطورة ومطابقة لميثاق التصميم.',
    improvementsNeeded: 'تقليل فترات انتظار تسليم الـ Assets لفرق الفرونت إند.',
    recommendedBonusOrAdjustment: 2000,
    status: 'approved_by_founder',
    appraisalDate: '2026-03-25',
  },
];

const INITIAL_BONUSES: CompensationBonus[] = [
  { id: 'bn-1', employeeId: 'hr-3', employeeName: 'محمود إبراهيم (مدير المبيعات)', type: 'deal_commission', amount: 5000, currency: 'SAR', reason: 'عمولة إغلاق عقد سنوي مع شركة الاستثمار العقاري', month: '2026-03', status: 'paid', approvedBy: 'Founder', createdAt: '2026-03-20' },
  { id: 'bn-2', employeeId: 'hr-4', employeeName: 'محمود طارق (مطور أول)', type: 'spot_bonus', amount: 3000, currency: 'SAR', reason: 'مكافأة تميز لإطلاق ميزة العملة المزدوجة ومصفوفة الصلاحيات قبل الموعد', month: '2026-03', status: 'paid', approvedBy: 'Founder', createdAt: '2026-03-25' },
  { id: 'bn-3', employeeId: 'hr-6', employeeName: 'محمود سامي (تيليسيلز)', type: 'deal_commission', amount: 2500, currency: 'SAR', reason: 'عمولة تحقيق مستهدف مكالمات التأهيل لشهر مارس', month: '2026-03', status: 'approved', approvedBy: 'Ops Manager', createdAt: '2026-03-31' },
];

export const HrManagementView: React.FC = () => {
  const {
    language,
    currentUser,
    showToast,
    isOwner,
    isAdminOrOwner,
    formatAmount,
    formatDualAmount,
    currency,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'employees' | 'appraisals' | 'leaves' | 'bonuses' | 'payroll' | 'onboarding'>('employees');
  const [employees, setEmployees] = useState<EmployeeHrFile[]>(() => {
    try {
      const saved = localStorage.getItem('shal_hr_employees_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_HR_FILES;
  });

  const [appraisals, setAppraisals] = useState<PerformanceAppraisal[]>(() => {
    try {
      const saved = localStorage.getItem('shal_hr_appraisals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_APPRAISALS;
  });

  const [bonuses, setBonuses] = useState<CompensationBonus[]>(() => {
    try {
      const saved = localStorage.getItem('shal_hr_bonuses');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BONUSES;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem('shal_hr_leaves');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'leave-1', userId: 'user-ui-ux', userName: 'محمود نبيل (مصمم UI/UX)', userRole: 'مصمم واجهات', userTeam: 'uiux', leaveType: 'annual', startDate: '2026-04-10', endDate: '2026-04-14', daysCount: 4, reason: 'إجازة سنوية اعتيادية للراحة وتجديد الطاقة الإبداعية.', status: 'approved', approvedBy: 'م. محمود رمزي (Founder)', createdAt: '2026-03-25' },
      { id: 'leave-2', userId: 'user-developer', userName: 'محمود طارق (مطور برمجيات)', userRole: 'مطور أول', userTeam: 'developer', leaveType: 'remote_work_permit', startDate: '2026-04-02', endDate: '2026-04-03', daysCount: 2, reason: 'تصريح سفر داخلي مع استمرار العمل عن بُعد عبر اللابتوب والإنترنت الفضائي.', status: 'pending', createdAt: '2026-03-29' },
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterWorkMode, setFilterWorkMode] = useState<string>('all');

  // Employee Edit / Add Modal
  const [editingEmployee, setEditingEmployee] = useState<EmployeeHrFile | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Leave Modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState<LeaveType>('annual');
  const [newLeaveStart, setNewLeaveStart] = useState('');
  const [newLeaveEnd, setNewLeaveEnd] = useState('');
  const [newLeaveDays, setNewLeaveDays] = useState(1);
  const [newLeaveReason, setNewLeaveReason] = useState('');

  // New Appraisal Modal
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [appraisalTargetEmpId, setAppraisalTargetEmpId] = useState(employees[0]?.id || '');
  const [appraisalTech, setAppraisalTech] = useState(5);
  const [appraisalQuality, setAppraisalQuality] = useState(5);
  const [appraisalCoc, setAppraisalCoc] = useState(5);
  const [appraisalComm, setAppraisalComm] = useState(4);
  const [appraisalGrowth, setAppraisalGrowth] = useState(5);
  const [appraisalStrengths, setAppraisalStrengths] = useState('');
  const [appraisalImprovements, setAppraisalImprovements] = useState('');
  const [appraisalBonus, setAppraisalBonus] = useState(1500);

  // New Bonus Modal
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusEmpId, setBonusEmpId] = useState(employees[0]?.id || '');
  const [bonusType, setBonusType] = useState<CompensationBonus['type']>('spot_bonus');
  const [bonusAmount, setBonusAmount] = useState<number>(2000);
  const [bonusReason, setBonusReason] = useState('');

  // Save Employee Changes
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    let updated: EmployeeHrFile[];
    const exists = employees.some((emp) => emp.id === editingEmployee.id);
    if (exists) {
      updated = employees.map((emp) => (emp.id === editingEmployee.id ? editingEmployee : emp));
    } else {
      updated = [editingEmployee, ...employees];
    }

    setEmployees(updated);
    try {
      localStorage.setItem('shal_hr_employees_v2', JSON.stringify(updated));
    } catch {}

    setShowEmployeeModal(false);
    setEditingEmployee(null);
    showToast({
      type: 'success',
      title: 'تم تحديث الملف الوظيفي بنجاح',
      message: `تم حفظ بيانات الموظف ${editingEmployee.userName} والبدلات التعاقدية بدقة.`,
    });
  };

  // Submit Appraisal
  const handleSaveAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find((emp) => emp.id === appraisalTargetEmpId);
    if (!targetEmp) return;

    const avgScore = Math.round(
      ((appraisalTech + appraisalQuality + appraisalCoc + appraisalComm + appraisalGrowth) / 25) * 100
    );

    const newRecord: PerformanceAppraisal = {
      id: `appr-${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.userName,
      evaluatorId: currentUser?.id || 'founder',
      evaluatorName: currentUser?.name || 'م. محمود رمزي',
      cycle: '2026-Q1',
      workMode: targetEmp.workMode,
      ratings: {
        technicalProductivity: appraisalTech,
        qualityOfDeliverables: appraisalQuality,
        adherenceToCoc: appraisalCoc,
        communicationAndPunctuality: appraisalComm,
        initiativeAndGrowth: appraisalGrowth,
      },
      overallScore: avgScore,
      strengths: appraisalStrengths.trim() || 'التزام عالي بأخلاقيات العمل وإنتاجية متميزة',
      improvementsNeeded: appraisalImprovements.trim() || 'مواصلة الحفاظ على هذا المستوى الاحترافي',
      recommendedBonusOrAdjustment: Number(appraisalBonus) || 0,
      status: 'approved_by_founder',
      appraisalDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newRecord, ...appraisals];
    setAppraisals(updated);
    try {
      localStorage.setItem('shal_hr_appraisals', JSON.stringify(updated));
    } catch {}

    setShowAppraisalModal(false);
    showToast({
      type: 'success',
      title: 'تم تسجيل التقييم الوظيفي بنجاح',
      message: `تم اعتماد تقييم الأداء للموظف ${targetEmp.userName} بدرجة ${avgScore}%.`,
    });
  };

  // Submit Bonus
  const handleSaveBonus = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find((emp) => emp.id === bonusEmpId);
    if (!targetEmp) return;

    const newRecord: CompensationBonus = {
      id: `bn-${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.userName,
      type: bonusType,
      amount: Number(bonusAmount) || 0,
      currency: 'SAR',
      reason: bonusReason.trim() || 'مكافأة أداء وتحقيق أهداف مميزة',
      month: '2026-04',
      status: 'approved',
      approvedBy: currentUser?.name || 'الإدارة العليا',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newRecord, ...bonuses];
    setBonuses(updated);
    try {
      localStorage.setItem('shal_hr_bonuses', JSON.stringify(updated));
    } catch {}

    setShowBonusModal(false);
    showToast({
      type: 'success',
      title: 'تم صرف المكافأة / البدل بنجاح',
      message: `تم اعتماد صرف ${formatAmount(newRecord.amount)} لصالح ${targetEmp.userName}.`,
    });
  };

  // Submit Leave
  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveStart || !newLeaveEnd || !newLeaveReason.trim()) return;

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      userId: currentUser?.id || 'emp',
      userName: currentUser?.name || 'عضو بالفريق',
      userRole: 'عضو فريق',
      userTeam: currentUser?.team || 'operations',
      leaveType: newLeaveType,
      startDate: newLeaveStart,
      endDate: newLeaveEnd,
      daysCount: Number(newLeaveDays) || 1,
      reason: newLeaveReason,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newRequest, ...leaveRequests];
    setLeaveRequests(updated);
    try {
      localStorage.setItem('shal_hr_leaves', JSON.stringify(updated));
    } catch {}

    setShowLeaveModal(false);
    setNewLeaveReason('');
    showToast({
      type: 'success',
      title: 'تم إرسال طلب الإجازة للاعتماد',
      message: 'تم إشعار مدير العمليات والفاوندر لمراجعة الطلب.',
    });
  };

  // Handle Leave Status Update
  const handleUpdateLeaveStatus = (requestId: string, status: 'approved' | 'rejected') => {
    const updated = leaveRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status,
            approvedBy: status === 'approved' ? currentUser?.name || 'Founder' : undefined,
            rejectionReason: status === 'rejected' ? 'يتعارض مع تسليم حملات هامة للعملاء' : undefined,
          }
        : r
    );
    setLeaveRequests(updated);
    try {
      localStorage.setItem('shal_hr_leaves', JSON.stringify(updated));
    } catch {}

    showToast({
      type: status === 'approved' ? 'success' : 'info',
      title: status === 'approved' ? 'تمت الموافقة على الإجازة' : 'تم رفض طلب الإجازة',
      message: 'تم تحديث سجل الإجازات في ملف الموظف فورياً.',
    });
  };

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeNumber.includes(searchTerm);
    const matchesTeam = filterTeam === 'all' || emp.team === filterTeam;
    const matchesMode = filterWorkMode === 'all' || emp.workMode === filterWorkMode;
    return matchesSearch && matchesTeam && matchesMode;
  });

  const payrollTotals = employees.reduce(
    (acc, emp) => {
      acc.totalSalaries += emp.baseSalary;
      acc.totalAllowances += (emp.housingAllowance || 0) + (emp.transportAllowance || 0);
      acc.totalBonuses += emp.bonusesTotal || 0;
      return acc;
    },
    { totalSalaries: 0, totalAllowances: 0, totalBonuses: 0 }
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Real-time Dual Currency Converter Bar (SAR / EGP) */}
      <CurrencyConverterBar />

      {/* Header Banner */}
      <div className="rounded-3xl border border-[#BDAF9C]/35 bg-gradient-to-r from-[#24291F] via-[#3B4432] to-[#4C5540] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold backdrop-blur-md">
              <Users className="h-3.5 w-3.5 text-amber-400" />
              <span>إدارة رأس المال البشري وشؤون الموظفين (Agency HR Hub)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              نظام الموارد البشرية وإدارة الكفاءات والمواهب
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              منظومة شاملة لإدارة ملفات الموظفين الـ 11، تقييمات الأداء الدورية (360 Appraisals)، المكافآت والبدلات، أرصدة الإجازات، ومسيرات الرواتب بحسابات مزدوجة (الريال السعودي SAR والجنيه المصري EGP).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdminOrOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setShowAppraisalModal(true)}
                  className="btn-interactive flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
                >
                  <Star className="h-4 w-4" />
                  <span>إجراء تقييم أداء (Appraisal)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBonusModal(true)}
                  className="btn-interactive flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
                >
                  <Coins className="h-4 w-4" />
                  <span>صرف مكافأة / بدل</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="btn-interactive flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
            >
              <Calendar className="h-4 w-4" />
              <span>طلب إجازة</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/15 overflow-x-auto">
          {[
            { id: 'employees', label: 'دليل وملفات الموظفين', icon: Users },
            { id: 'appraisals', label: `تقييم الأداء والمراجعات (${appraisals.length})`, icon: Star },
            { id: 'leaves', label: `طلبات الإجازات (${leaveRequests.filter((l) => l.status === 'pending').length} معلق)`, icon: Calendar },
            { id: 'bonuses', label: `البدلات والمكافآت والعمولات (${bonuses.length})`, icon: Gift },
            { id: 'payroll', label: 'مسير الرواتب المزدوج (Payroll)', icon: DollarSign },
            { id: 'onboarding', label: 'دليل التهيئة والدمج', icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#24291F] shadow-md'
                    : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================================== */}
      {/* TAB 1: EMPLOYEES DIRECTORY                                                     */}
      {/* ============================================================================== */}
      {activeTab === 'employees' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#BDAF9C]/35 bg-white p-4 shadow-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute top-1/2 -translate-y-1/2 right-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث برقم الموظف أو الاسم أو الإيميل..."
                className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2] py-2 pr-9 pl-3 text-xs text-slate-800 focus:outline-none focus:border-[#4C5540]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterWorkMode}
                onChange={(e) => setFilterWorkMode(e.target.value)}
                className="rounded-xl border border-slate-200 bg-[#FAF7F2] px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">كافة أنماط العمل</option>
                <option value="onsite">حضوري بالمكتب</option>
                <option value="remote">عن بُعد (Remote)</option>
                <option value="hybrid">هجين (Hybrid)</option>
                <option value="commission">بالعمولة فقط</option>
              </select>

              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="rounded-xl border border-slate-200 bg-[#FAF7F2] px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">كافة الأقسام والفرق</option>
                <option value="management">الإدارة التنفيذية</option>
                <option value="operations">العمليات</option>
                <option value="sales">المبيعات</option>
                <option value="developer">التطوير البرمجي</option>
                <option value="uiux">تجربة المستخدم</option>
              </select>

              {isAdminOrOwner && (
                <button
                  type="button"
                  onClick={() => {
                    const newEmp: EmployeeHrFile = {
                      id: `hr-${Date.now()}`,
                      userId: `user-${Date.now()}`,
                      userName: '',
                      userEmail: '',
                      employeeNumber: String(employees.length + 1).padStart(2, '0'),
                      team: 'developer',
                      workMode: 'onsite',
                      contractType: 'full_time',
                      hireDate: new Date().toISOString().split('T')[0],
                      baseSalary: 12000,
                      housingAllowance: 2000,
                      transportAllowance: 1000,
                      annualLeaveBalance: 24,
                      usedLeaveDays: 0,
                      emergencyContact: { name: '', phone: '', relation: '' },
                      status: 'active',
                    };
                    setEditingEmployee(newEmp);
                    setShowEmployeeModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4C5540] text-white text-xs font-bold hover:bg-[#3B4432] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>إضافة ملف موظف</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="rounded-2xl border border-[#BDAF9C]/35 bg-white p-5 shadow-xs hover:shadow-md transition-all space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4C5540] text-white font-black text-sm font-mono shadow-xs">
                      #{emp.employeeNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#24291F]">
                        {emp.userName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {emp.userEmail}
                      </p>
                    </div>
                  </div>

                  {isAdminOrOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEmployee(emp);
                        setShowEmployeeModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      title="تعديل بيانات الموظف والراتب"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="rounded-md bg-[#FAF7F2] border border-[#BDAF9C]/30 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                    قسم {emp.team}
                  </span>

                  {emp.workMode === 'onsite' && (
                    <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      حضوري بالمكتب
                    </span>
                  )}
                  {emp.workMode === 'remote' && (
                    <span className="rounded-md bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      <Laptop className="h-3 w-3" />
                      عن بُعد (Online)
                    </span>
                  )}
                  {emp.workMode === 'hybrid' && (
                    <span className="rounded-md bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      هجين (Hybrid)
                    </span>
                  )}
                  {emp.workMode === 'commission' && (
                    <span className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      بالعمولة {emp.commissionPercentage || 15}%
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#BDAF9C]/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">الراتب الأساسي:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatAmount(emp.baseSalary)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>بالعملة الأخرى:</span>
                    <span>{formatDualAmount(emp.baseSalary).secondary}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">رصيد الإجازات السنوي:</span>
                    <span className="font-bold text-[#4C5540]">
                      {emp.annualLeaveBalance - emp.usedLeaveDays} يوم متبقي / {emp.annualLeaveBalance}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">تاريخ التعيين:</span>
                    <span className="font-mono text-slate-700">{emp.hireDate}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-100">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>طوارئ: {emp.emergencyContact.name} ({emp.emergencyContact.phone})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 2: PERFORMANCE APPRAISALS (نظام تقييم الأداء)                                */}
      {/* ============================================================================== */}
      {activeTab === 'appraisals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                سجل تقييمات الأداء ومراجعات الكفاءة (Quarterly 360 Appraisals)
              </h3>
              <p className="text-xs text-slate-500">
                تقييم معياري يربط بين إنتاجية الدور، الالتزام بميثاق C.O.C، والمكافآت التقديرية
              </p>
            </div>
            {isAdminOrOwner && (
              <button
                type="button"
                onClick={() => setShowAppraisalModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0284C7] text-white text-xs font-bold hover:bg-[#0369a1] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة تقييم جديد</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appraisals.map((apr) => (
              <div
                key={apr.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{apr.employeeName}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      دورة التقييم: {apr.cycle} • بتاريخ {apr.appraisalDate}
                    </span>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-mono font-black text-sm border border-emerald-200">
                    {apr.overallScore}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">الإنتاجية التقنية:</span>
                    <span className="font-bold text-slate-800">{apr.ratings.technicalProductivity} / 5</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">جودة المخرجات:</span>
                    <span className="font-bold text-slate-800">{apr.ratings.qualityOfDeliverables} / 5</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">الالتزام بميثاق C.O.C:</span>
                    <span className="font-bold text-emerald-700">{apr.ratings.adherenceToCoc} / 5</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block">التواصل والانضباط:</span>
                    <span className="font-bold text-slate-800">{apr.ratings.communicationAndPunctuality} / 5</span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAF7F2] p-3 border border-[#BDAF9C]/20 text-xs space-y-1">
                  <p className="text-slate-700">
                    <span className="font-bold text-emerald-800">نقاط القوة: </span>
                    {apr.strengths}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-bold text-amber-800">فرص التطوير: </span>
                    {apr.improvementsNeeded}
                  </p>
                  {apr.recommendedBonusOrAdjustment && (
                    <div className="pt-2 mt-1 border-t border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-600">مكافأة تميز موصى بها:</span>
                      <span className="font-mono font-black text-emerald-700">
                        {formatAmount(apr.recommendedBonusOrAdjustment)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 3: LEAVES & VACATION RECORDS                                               */}
      {/* ============================================================================== */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#BDAF9C]/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#24291F]">
                سجل طلبات الإجازات والتصاريح المعلقة والمعتمدة
              </h3>
              <span className="text-xs text-slate-500">
                إجمالي الطلبات: {leaveRequests.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">الموظف</th>
                    <th className="py-3 px-4">نوع الإجازة</th>
                    <th className="py-3 px-4 text-center">المدة</th>
                    <th className="py-3 px-4">من - إلى</th>
                    <th className="py-3 px-4">السبب</th>
                    <th className="py-3 px-4 text-center">الحالة والاعتماد</th>
                    {isAdminOrOwner && <th className="py-3 px-4 text-center">الإجراء الإداري</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{req.userName}</td>
                      <td className="py-3 px-4">
                        {req.leaveType === 'annual' && <span className="text-blue-700 font-bold">إجازة اعتيادية سنوية</span>}
                        {req.leaveType === 'sick' && <span className="text-rose-700 font-bold">إجازة مرضية</span>}
                        {req.leaveType === 'emergency' && <span className="text-amber-700 font-bold">إجازة طارئة</span>}
                        {req.leaveType === 'remote_work_permit' && <span className="text-purple-700 font-bold">تصريح عمل عن بُعد</span>}
                        {req.leaveType === 'unpaid' && <span className="text-slate-700 font-bold">إجازة بدون راتب</span>}
                      </td>
                      <td className="py-3 px-4 text-center font-bold font-mono">{req.daysCount} أيام</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{req.startDate} إلى {req.endDate}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs leading-relaxed">{req.reason}</td>
                      <td className="py-3 px-4 text-center">
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            معتمدة {req.approvedBy ? `بواسطة ${req.approvedBy}` : ''}
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                            <Clock className="h-3 w-3" />
                            بانتظار موافقة الإدارة
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[10px] font-bold">
                            <XCircle className="h-3 w-3" />
                            مرفوضة
                          </span>
                        )}
                      </td>
                      {isAdminOrOwner && (
                        <td className="py-3 px-4 text-center">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateLeaveStatus(req.id, 'approved')}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all cursor-pointer"
                              >
                                اعتماد
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateLeaveStatus(req.id, 'rejected')}
                                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-all cursor-pointer"
                              >
                                رفض
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">مكتمل</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 4: BONUSES & COMMISSIONS LEDGER (البدلات والمكافآت)                          */}
      {/* ============================================================================== */}
      {activeTab === 'bonuses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                سجل البدلات والمكافآت وعمولات الصفقات المعتمدة
              </h3>
              <p className="text-xs text-slate-500">
                صرف حوافز الأداء وعمولات الإغلاق البيعي بحساب دقيق وسعر الصرف اليومي
              </p>
            </div>
            {isAdminOrOwner && (
              <button
                type="button"
                onClick={() => setShowBonusModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة بدل أو مكافأة</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">الموظف المستحق</th>
                    <th className="py-3 px-4">نوع الاستحقاق</th>
                    <th className="py-3 px-4 text-center">المبلغ (SAR)</th>
                    <th className="py-3 px-4 text-center">المعادل بالعملة النشطة</th>
                    <th className="py-3 px-4">بيان السبب</th>
                    <th className="py-3 px-4 text-center">الحالة والاعتماد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {bonuses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{b.employeeName}</td>
                      <td className="py-3.5 px-4 font-sans">
                        {b.type === 'spot_bonus' && <span className="text-purple-700 font-bold">مكافأة فورية استثنائية</span>}
                        {b.type === 'deal_commission' && <span className="text-emerald-700 font-bold">عمولة إغلاق صفقة</span>}
                        {b.type === 'retention_incentive' && <span className="text-blue-700 font-bold">حافز ولاء واستبقاء</span>}
                        {b.type === 'overtime_allowance' && <span className="text-amber-700 font-bold">بدل ساعات عمل إضافية</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">{formatAmount(b.amount, 'SAR')}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {formatDualAmount(b.amount).full}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-600 max-w-xs">{b.reason}</td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          معتمد ومصروف
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 5: PAYROLL (مسير الرواتب المزدوج SAR / EGP)                                */}
      {/* ============================================================================== */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block mb-1">
                إجمالي الرواتب الأساسية الشهرية:
              </span>
              <p className="text-2xl font-black font-mono text-[#24291F]">
                {formatAmount(payrollTotals.totalSalaries)}
              </p>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                {formatDualAmount(payrollTotals.totalSalaries).secondary}
              </span>
            </div>

            <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block mb-1">
                إجمالي بدلات السكن والانتقال:
              </span>
              <p className="text-2xl font-black font-mono text-emerald-700">
                +{formatAmount(payrollTotals.totalAllowances)}
              </p>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                {formatDualAmount(payrollTotals.totalAllowances).secondary}
              </span>
            </div>

            <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-bold block mb-1">
                إجمالي موازنة المسير الشهري:
              </span>
              <p className="text-2xl font-black font-mono text-[#4C5540]">
                {formatAmount(payrollTotals.totalSalaries + payrollTotals.totalAllowances + payrollTotals.totalBonuses)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                {formatDualAmount(payrollTotals.totalSalaries + payrollTotals.totalAllowances + payrollTotals.totalBonuses).secondary}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#BDAF9C]/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#24291F]">
                  مسير رواتب وبدلات منسوبي وكالة شال (Payroll Ledger)
                </h3>
                <span className="text-xs text-slate-500">
                  سعر الصرف المعتمد: 1 ريال سعودي (SAR) = {useApp().exchangeRateSarToEgp.toFixed(2)} جنيه مصري (EGP)
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-interactive flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#BDAF9C]/40 text-xs font-bold text-[#4C5540] hover:bg-[#FAF7F2] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تصدير المسير</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">رقم</th>
                    <th className="py-3 px-4">الموظف والوظيفة</th>
                    <th className="py-3 px-4 text-center">نمط العمل</th>
                    <th className="py-3 px-4 text-center">الراتب الأساسي</th>
                    <th className="py-3 px-4 text-center">بدل سكن</th>
                    <th className="py-3 px-4 text-center">بدل انتقال</th>
                    <th className="py-3 px-4 text-center">مكافآت وبدلات</th>
                    <th className="py-3 px-4 text-center">صافي الاستحقاق الشهري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {employees.map((emp) => {
                    const totalMonth =
                      emp.baseSalary +
                      (emp.housingAllowance || 0) +
                      (emp.transportAllowance || 0) +
                      (emp.bonusesTotal || 0);

                    return (
                      <tr key={emp.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-500">#{emp.employeeNumber}</td>
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">{emp.userName}</td>
                        <td className="py-3 px-4 text-center font-sans">
                          {emp.workMode === 'onsite' && <span className="text-emerald-700 font-bold">حضوري</span>}
                          {emp.workMode === 'remote' && <span className="text-blue-700 font-bold">عن بُعد</span>}
                          {emp.workMode === 'hybrid' && <span className="text-purple-700 font-bold">هجين</span>}
                          {emp.workMode === 'commission' && <span className="text-amber-700 font-bold">عمولة {emp.commissionPercentage}%</span>}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-800">{formatAmount(emp.baseSalary)}</td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {emp.housingAllowance ? formatAmount(emp.housingAllowance) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {emp.transportAllowance ? formatAmount(emp.transportAllowance) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center text-amber-700 font-bold">
                          {emp.bonusesTotal ? formatAmount(emp.bonusesTotal) : '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-emerald-800 text-sm">
                          {formatAmount(totalMonth)}
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
      {/* TAB 6: ONBOARDING                                                              */}
      {/* ============================================================================== */}
      {activeTab === 'onboarding' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#24291F] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>دليل تهيئة ودمج الكفاءات في وكالة شال (Onboarding Checklist)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              إجراءات تنظيمية موحدة تضمن سرعة انخراط الموظفين الجدد بحسب نمط عملهم (حضوري، ريموت، هجين) مع توقيع اتفاقيات السرية وميثاق C.O.C.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: Edit / Add Employee */}
      {showEmployeeModal && editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#BDAF9C]/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-[#24291F]">
                تعديل وتحديث الملف الوظيفي والبدلات التعاقدية
              </h3>
              <button
                type="button"
                onClick={() => setShowEmployeeModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الموظف الكامل:</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.userName}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, userName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني للوكالة:</label>
                  <input
                    type="email"
                    required
                    value={editingEmployee.userEmail}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, userEmail: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نمط العمل المعتمد:</label>
                  <select
                    value={editingEmployee.workMode}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, workMode: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-[#FAF7F2] font-bold"
                  >
                    <option value="onsite">حضوري بالكامل (In-Office)</option>
                    <option value="remote">عن بُعد بالكامل (Remote)</option>
                    <option value="hybrid">عمل هجين (Hybrid 3+2)</option>
                    <option value="commission">مبيعات بالعمولة (Commission Only)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم والفرقة:</label>
                  <select
                    value={editingEmployee.team}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, team: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-[#FAF7F2] font-bold"
                  >
                    <option value="management">الإدارة</option>
                    <option value="operations">العمليات</option>
                    <option value="sales">المبيعات</option>
                    <option value="developer">التطوير البرمجي</option>
                    <option value="uiux">تجربة المستخدم</option>
                    <option value="content">المحتوى</option>
                    <option value="media_buying">الميديا باينج</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأساسي (SAR):</label>
                  <input
                    type="number"
                    value={editingEmployee.baseSalary}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, baseSalary: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">بدل سكن (SAR):</label>
                  <input
                    type="number"
                    value={editingEmployee.housingAllowance || 0}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, housingAllowance: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">بدل انتقال (SAR):</label>
                  <input
                    type="number"
                    value={editingEmployee.transportAllowance || 0}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, transportAllowance: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4C5540] text-white font-bold hover:bg-[#3B4432] cursor-pointer shadow-sm"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Performance Appraisal */}
      {showAppraisalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                إجراء تقييم أداء وظيفي جديد (Performance Appraisal)
              </h3>
              <button
                type="button"
                onClick={() => setShowAppraisalModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAppraisal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الموظف المراد تقييمه:</label>
                <select
                  value={appraisalTargetEmpId}
                  onChange={(e) => setAppraisalTargetEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-[#FAF7F2] font-bold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.userName} (#{emp.employeeNumber} - {emp.team})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الإنتاجية التقنية (1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={appraisalTech}
                    onChange={(e) => setAppraisalTech(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">جودة المخرجات (1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={appraisalQuality}
                    onChange={(e) => setAppraisalQuality(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الالتزام بميثاق C.O.C (1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={appraisalCoc}
                    onChange={(e) => setAppraisalCoc(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التواصل والانضباط (1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={appraisalComm}
                    onChange={(e) => setAppraisalComm(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نقاط القوة والإنجازات الاستثنائية:</label>
                <textarea
                  rows={2}
                  value={appraisalStrengths}
                  onChange={(e) => setAppraisalStrengths(e.target.value)}
                  placeholder="أبرز النجاحات وتسليم المهام قبل الموعد..."
                  className="w-full rounded-xl border border-slate-200 p-2 bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">فرص التحسين والتطوير المطلوبة:</label>
                <textarea
                  rows={2}
                  value={appraisalImprovements}
                  onChange={(e) => setAppraisalImprovements(e.target.value)}
                  placeholder="المهارات أو النقاط المطلوب تعزيزها..."
                  className="w-full rounded-xl border border-slate-200 p-2 bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مكافأة تميز موصى بها (SAR):</label>
                <input
                  type="number"
                  value={appraisalBonus}
                  onChange={(e) => setAppraisalBonus(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2 font-mono text-emerald-700 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAppraisalModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0284C7] text-white font-bold hover:bg-[#0369a1] cursor-pointer"
                >
                  اعتماد التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bonus & Allowance */}
      {showBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                صرف مكافأة أو بدل تميز لموظف
              </h3>
              <button
                type="button"
                onClick={() => setShowBonusModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBonus} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الموظف المستحق:</label>
                <select
                  value={bonusEmpId}
                  onChange={(e) => setBonusEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-[#FAF7F2] font-bold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.userName} (#{emp.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الاستحقاق:</label>
                <select
                  value={bonusType}
                  onChange={(e) => setBonusType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-[#FAF7F2] font-bold"
                >
                  <option value="spot_bonus">مكافأة فورية استثنائية (Spot Bonus)</option>
                  <option value="deal_commission">عمولة إغلاق صفقة مبيعات</option>
                  <option value="retention_incentive">حافز ولاء واستبقاء</option>
                  <option value="overtime_allowance">بدل ساعات عمل إضافية</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ (SAR):</label>
                <input
                  type="number"
                  required
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2 font-mono text-emerald-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">السبب وموجبات الصرف:</label>
                <textarea
                  rows={2}
                  required
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  placeholder="تفاصيل الإنجاز أو الصفقة المغلقة..."
                  className="w-full rounded-xl border border-slate-200 p-2 bg-[#FAF7F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowBonusModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  اعتماد الصرف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Leave Request */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#BDAF9C]/40 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#24291F]">
                تقديم طلب إجازة أو تصريح عمل جديد
              </h3>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeaveRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الإجازة:</label>
                <select
                  value={newLeaveType}
                  onChange={(e) => setNewLeaveType(e.target.value as LeaveType)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-[#FAF7F2] font-bold"
                >
                  <option value="annual">إجازة اعتيادية سنوية (خصم من الرصيد)</option>
                  <option value="sick">إجازة مرضية (بتقرير طبي)</option>
                  <option value="emergency">إجازة عارضة / طارئة</option>
                  <option value="remote_work_permit">تصريح استثنائي للعمل عن بُعد</option>
                  <option value="unpaid">إجازة بدون راتب</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ البدء:</label>
                  <input
                    type="date"
                    required
                    value={newLeaveStart}
                    onChange={(e) => setNewLeaveStart(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الانتهاء:</label>
                  <input
                    type="date"
                    required
                    value={newLeaveEnd}
                    onChange={(e) => setNewLeaveEnd(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عدد الأيام الفعلي:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newLeaveDays}
                  onChange={(e) => setNewLeaveDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بيان السبب / من ينوب عنك:</label>
                <textarea
                  rows={2}
                  required
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  placeholder="توضيح السبب وتسليم المهام..."
                  className="w-full rounded-xl border border-slate-200 p-2 bg-[#FAF7F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4C5540] text-white font-bold hover:bg-[#3B4432]"
                >
                  إرسال الطلب للاعتماد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
