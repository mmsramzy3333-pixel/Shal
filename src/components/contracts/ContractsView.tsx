import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../../context/AppContext';
import { CompanyContract, ContractStatus, ContractType } from '../../types';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  FileCheck,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  FileCode,
  Sparkles,
  HelpCircle,
  Copy,
} from 'lucide-react';

const INITIAL_CONTRACTS: CompanyContract[] = [
  {
    id: 'ctr-01',
    contractNumber: 'SHAL-2026-CTR-001',
    title: 'عقد إدارة الهوية الرقمية والتسويق المتكامل (Digital Retainer)',
    clientName: 'مجموعة المدى للاستثمار والتطوير العقاري',
    type: 'retainer',
    status: 'active',
    value: 8500,
    currency: 'USD',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    signedDate: '2025-12-28',
    signedByAgency: 'م. مدحت | الفاوندر والمدير التنفيذي',
    signedByClient: 'أ. عبد الله الراجحي | الرئيس التنفيذي',
    scopeSummary: 'إدارة شاملة لحسابات التواصل، إنتاج 20 بوست شهري، 8 ريلز احترافية، وإدارة حملات الميديا باينج مع تقارير أداء أسبوعية.',
    autoRenew: true,
    fileName: 'Shal_Almada_Retainer_2026.pdf',
    fileSize: '2.4 MB',
    createdAt: '2025-12-28T10:00:00Z',
  },
  {
    id: 'ctr-02',
    contractNumber: 'SHAL-2026-CTR-002',
    title: 'اتفاقية عدم إفصاح وسرية بيانات ومعلومات (NDA)',
    clientName: 'تطبيق وصل التقني | Wssel Tech',
    type: 'nda',
    status: 'active',
    value: 0,
    currency: 'USD',
    startDate: '2026-02-15',
    endDate: '2028-02-15',
    signedDate: '2026-02-15',
    signedByAgency: 'م. رمزي | شريك مؤسس وإدارة العمليات',
    signedByClient: 'م. طارق السعدي | المؤسس',
    scopeSummary: 'حماية وتأمين الأكواد البرمجية، تصاميم واجهات تجربة المستخدم (UI/UX)، واستراتيجيات الإطلاق الحصرية.',
    autoRenew: false,
    fileName: 'Shal_Wssel_NDA_Signed.pdf',
    fileSize: '1.1 MB',
    createdAt: '2026-02-15T12:00:00Z',
  },
  {
    id: 'ctr-03',
    contractNumber: 'SHAL-2026-CTR-003',
    title: 'عقد تصميم الهوية البصرية ونظام التصميم (Design System & Branding)',
    clientName: 'سلسلة مطاعم غصن | Ghosn Hospitality',
    type: 'project_fixed',
    status: 'pending_signature',
    value: 12000,
    currency: 'USD',
    startDate: '2026-03-01',
    endDate: '2026-05-30',
    signedByAgency: 'م. مدحت | الفاوندر',
    scopeSummary: 'تطوير الهوية البصرية الكاملة، دليل استخدام العلامة (Brand Guidelines)، تصاميم التغليف، وتجهيز كافة أصول الموشن جرافيك.',
    autoRenew: false,
    fileName: 'Ghosn_Brand_Agreement_Draft.pdf',
    fileSize: '3.8 MB',
    createdAt: '2026-02-25T09:30:00Z',
  },
  {
    id: 'ctr-04',
    contractNumber: 'SHAL-2026-CTR-004',
    title: 'عقد إدارة الحملات الممولة وتحسين محركات البحث (Ads & SEO)',
    clientName: 'أكاديمية نمو الرقمية | Numo Academy',
    type: 'retainer',
    status: 'active',
    value: 4500,
    currency: 'USD',
    startDate: '2026-01-15',
    endDate: '2026-07-15',
    signedDate: '2026-01-14',
    signedByAgency: 'محمود 04 | مدير العمليات',
    signedByClient: 'د. منيرة العتيبي | المشرفة العامة',
    scopeSummary: 'إدارة إعلانات Meta و Google Ads وتصدر 15 كلمة مفتاحية مستهدفة بالسعودية والخليج مع تحسين معدل التحويل (CRO).',
    autoRenew: true,
    fileName: 'Numo_SEO_Ads_Retainer.pdf',
    fileSize: '1.9 MB',
    createdAt: '2026-01-14T15:20:00Z',
  },
];

export const ContractsView: React.FC = () => {
  const { language, clients, currentUser, isOwner, isAdminOrOwner, showToast } = useApp();

  const [contracts, setContracts] = useState<CompanyContract[]>(() => {
    try {
      const saved = localStorage.getItem('shal_company_contracts');
      return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
    } catch {
      return INITIAL_CONTRACTS;
    }
  });

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<CompanyContract | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formType, setFormType] = useState<ContractType>('retainer');
  const [formStatus, setFormStatus] = useState<ContractStatus>('active');
  const [formValue, setFormValue] = useState<number>(5000);
  const [formCurrency, setFormCurrency] = useState<'USD' | 'SAR'>('USD');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [formScope, setFormScope] = useState('');
  const [formSignedByAgency, setFormSignedByAgency] = useState('م. مدحت | الفاوندر والمدير التنفيذي');
  const [formSignedByClient, setFormSignedByClient] = useState('');
  const [formAutoRenew, setFormAutoRenew] = useState(true);

  // Save contracts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shal_company_contracts', JSON.stringify(contracts));
    } catch {
      // Ignore
    }
  }, [contracts]);

  // Filtered List
  const filteredContracts = contracts.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q) ||
      c.contractNumber.toLowerCase().includes(q) ||
      c.scopeSummary.toLowerCase().includes(q);

    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Metrics
  const activeCount = contracts.filter((c) => c.status === 'active').length;
  const pendingCount = contracts.filter((c) => c.status === 'pending_signature').length;
  const totalValue = contracts
    .filter((c) => c.status === 'active')
    .reduce((acc, c) => acc + (c.value || 0), 0);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('عقد خدمات تسويقية وإنتاج محتوى رقمي');
    setFormClientName(clients[0]?.name || 'عميل وكالة شال المعتمد');
    setFormType('retainer');
    setFormStatus('active');
    setFormValue(6000);
    setFormCurrency('USD');
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setFormScope('تقديم خدمات الاستراتيجية الرقمية، الحملات الإعلانية، وتصاميم الهوية الاحترافية.');
    setFormSignedByAgency(currentUser.name);
    setFormSignedByClient('');
    setFormAutoRenew(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (contract: CompanyContract) => {
    setEditingId(contract.id);
    setFormTitle(contract.title);
    setFormClientName(contract.clientName);
    setFormType(contract.type);
    setFormStatus(contract.status);
    setFormValue(contract.value);
    setFormCurrency(contract.currency as any);
    setFormStartDate(contract.startDate);
    setFormEndDate(contract.endDate);
    setFormScope(contract.scopeSummary);
    setFormSignedByAgency(contract.signedByAgency || '');
    setFormSignedByClient(contract.signedByClient || '');
    setFormAutoRenew(contract.autoRenew);
    setIsModalOpen(true);
  };

  // Quick Template Auto-fill
  const handleApplyTemplate = (tplKey: 'retainer' | 'nda' | 'branding') => {
    if (tplKey === 'retainer') {
      setFormTitle('عقد ريتينر تسويقي متكامل وحملات أداء (Shal Growth Retainer)');
      setFormType('retainer');
      setFormValue(7500);
      setFormScope('إدارة شاملة لقنوات التواصل، إعلانات مدفوعة Meta/Google، كتابة المحتوى، وإعداد تقارير تحليلات أسبوعية موثقة.');
      setFormAutoRenew(true);
    } else if (tplKey === 'nda') {
      setFormTitle('اتفاقية سرية معلومات متبادلة وحماية حقوق الابتكار (Mutual NDA)');
      setFormType('nda');
      setFormValue(0);
      setFormScope('حماية كافة الأسرار التجارية، الاستراتيجيات التسويقية، قواعد البيانات، والتصاميم من الإفصاح لأي طرف ثالث.');
      setFormAutoRenew(false);
    } else if (tplKey === 'branding') {
      setFormTitle('عقد تطوير هوية بصرية وتصميم أنظمة الواجهات (Design System Agreement)');
      setFormType('project_fixed');
      setFormValue(11000);
      setFormScope('تسليم دليل الهوية الشامل، الشعار، الخطوط، نماذج السوشيال ميديا، ومكتبة مكونات Figma الجاهزة للتطوير.');
      setFormAutoRenew(false);
    }
    showToast({
      type: 'info',
      title: 'تم تطبيق النموذج التلقائي',
      message: 'تمت تعبئة بيانات العقد استناداً إلى مسودة وكالة شال القانونية.',
    });
  };

  // Save Contract
  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formClientName.trim()) return;

    if (editingId) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                title: formTitle,
                clientName: formClientName,
                type: formType,
                status: formStatus,
                value: Number(formValue) || 0,
                currency: formCurrency,
                startDate: formStartDate,
                endDate: formEndDate,
                scopeSummary: formScope,
                signedByAgency: formSignedByAgency,
                signedByClient: formSignedByClient,
                autoRenew: formAutoRenew,
              }
            : c
        )
      );
      showToast({
        type: 'success',
        title: 'تم تحديث العقد',
        message: `تم حفظ تعديلات العقد "${formTitle}" بنجاح.`,
      });
    } else {
      const nextNum = `SHAL-2026-CTR-${String(contracts.length + 1).padStart(3, '0')}`;
      const newContract: CompanyContract = {
        id: `ctr-${Date.now()}`,
        contractNumber: nextNum,
        title: formTitle,
        clientName: formClientName,
        type: formType,
        status: formStatus,
        value: Number(formValue) || 0,
        currency: formCurrency,
        startDate: formStartDate,
        endDate: formEndDate,
        scopeSummary: formScope,
        signedByAgency: formSignedByAgency,
        signedByClient: formSignedByClient,
        autoRenew: formAutoRenew,
        fileName: `${formClientName.replace(/\s+/g, '_')}_Contract.pdf`,
        fileSize: '1.5 MB',
        createdAt: new Date().toISOString(),
      };
      setContracts((prev) => [newContract, ...prev]);
      showToast({
        type: 'success',
        title: 'تم إنشاء وتوثيق العقد',
        message: `تم إضافة العقد الجديد برقم مرجعي: ${nextNum}`,
      });
    }

    setIsModalOpen(false);
  };

  // Delete Contract
  const handleDeleteContract = (id: string, title: string) => {
    if (!isAdminOrOwner && !isOwner) {
      showToast({
        type: 'error',
        title: 'صلاحية مقيدة',
        message: 'حذف العقود محصور بالفاوندر أو الإدارة العليا فقط.',
      });
      return;
    }
    setContracts((prev) => prev.filter((c) => c.id !== id));
    if (selectedContract?.id === id) setSelectedContract(null);
    showToast({
      type: 'info',
      title: 'تم حذف العقد',
      message: `تمت إزالة سجل العقد "${title}" بنجاح.`,
    });
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contracts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shal-agency-contracts-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast({
      type: 'success',
      title: 'تصدير البيانات',
      message: `تم تصدير ${contracts.length} عقود رسمية بصيغة JSON.`,
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Contract Number', 'Title', 'Client', 'Type', 'Status', 'Value', 'Currency', 'Start Date', 'End Date', 'Scope'];
    const rows = contracts.map((c) => [
      `"${c.contractNumber}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.clientName.replace(/"/g, '""')}"`,
      `"${c.type}"`,
      `"${c.status}"`,
      c.value,
      `"${c.currency}"`,
      `"${c.startDate}"`,
      `"${c.endDate}"`,
      `"${(c.scopeSummary || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shal-contracts-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast({
      type: 'success',
      title: 'تصدير CSV',
      message: 'تم تحميل ملف جداول البيانات بنجاح.',
    });
  };

  // Import JSON or CSV
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setContracts((prev) => [...parsed, ...prev]);
            showToast({
              type: 'success',
              title: 'نجاح الاستيراد',
              message: `تم استيراد ${parsed.length} عقود من ملف JSON بنجاح.`,
            });
          }
        } else {
          // Simple CSV Parser
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            const imported: CompanyContract[] = lines.slice(1).map((line, idx) => {
              const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
              return {
                id: `ctr-imported-${Date.now()}-${idx}`,
                contractNumber: cols[0] || `SHAL-IMP-${idx + 1}`,
                title: cols[1] || 'عقد مستورد',
                clientName: cols[2] || 'عميل معتمد',
                type: (cols[3] as ContractType) || 'retainer',
                status: (cols[4] as ContractStatus) || 'active',
                value: Number(cols[5]) || 5000,
                currency: (cols[6] as any) || 'USD',
                startDate: cols[7] || new Date().toISOString().slice(0, 10),
                endDate: cols[8] || new Date().toISOString().slice(0, 10),
                scopeSummary: cols[9] || 'بيانات العقد المستوردة آلياً',
                autoRenew: true,
                createdAt: new Date().toISOString(),
              };
            });
            setContracts((prev) => [...imported, ...prev]);
            showToast({
              type: 'success',
              title: 'نجاح استيراد CSV',
              message: `تم استيراد ${imported.length} عقد جديد إلى المنظومة.`,
            });
          }
        }
      } catch (err: any) {
        showToast({
          type: 'error',
          title: 'فشل قراءة الملف',
          message: 'تأكد من توافق صيغة الملف (JSON أو CSV صالح).',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download PDF Certificate / Summary
  const handleDownloadPDF = (contract: CompanyContract) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFillColor(76, 85, 64); // #4C5540 Olive
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('SHAL AGENCY | OFFICIAL CONTRACT SUMMARY', 14, 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Doc Ref: ${contract.contractNumber} | Generated: ${new Date().toLocaleDateString('en-US')}`, 14, 22);

      // Card
      doc.setFillColor(250, 247, 242);
      doc.roundedRect(14, 35, 182, 38, 2, 2, 'F');

      doc.setTextColor(36, 41, 31);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(contract.title.slice(0, 60), 20, 45);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Client: ${contract.clientName}`, 20, 53);
      doc.text(`Contract Value: $${contract.value.toLocaleString()} ${contract.currency}`, 20, 61);
      doc.text(`Status: ${contract.status.toUpperCase()} | Type: ${contract.type.toUpperCase()}`, 20, 69);

      doc.text(`Duration: ${contract.startDate} to ${contract.endDate}`, 110, 53);
      doc.text(`Agency Rep: ${contract.signedByAgency || 'Authorized Founder'}`, 110, 61);
      doc.text(`Client Signer: ${contract.signedByClient || 'Authorized Officer'}`, 110, 69);

      // Scope
      doc.setFont('helvetica', 'bold');
      doc.text('Scope of Work & Deliverables:', 14, 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(contract.scopeSummary || 'Standard digital agency scope governed by Shal Agency IP terms.', 14, 93, {
        maxWidth: 180,
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Shal Agency • Confidential Legal Document • Protected by RLS and Intellectual Property Laws', 105, 285, {
        align: 'center',
      });

      doc.save(`${contract.contractNumber}-summary.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'active':
        return <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-200">ساري ونشط (Active)</span>;
      case 'pending_signature':
        return <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold border border-amber-200">بانتظار التوقيع (Pending)</span>;
      case 'draft':
        return <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold border border-slate-200">مسودة (Draft)</span>;
      case 'expired':
        return <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-xs font-bold border border-rose-200">منتهي الصلاحية (Expired)</span>;
      case 'terminated':
        return <span className="rounded-full bg-red-100 text-red-900 px-2.5 py-0.5 text-xs font-bold border border-red-200">تم إنهاؤه (Terminated)</span>;
    }
  };

  const getTypeBadge = (type: ContractType) => {
    switch (type) {
      case 'retainer':
        return <span className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-bold border border-indigo-200">عقد ريتينر شهري</span>;
      case 'nda':
        return <span className="rounded-md bg-purple-50 text-purple-700 px-2 py-0.5 text-[11px] font-bold border border-purple-200">سرية بيانات (NDA)</span>;
      case 'project_fixed':
        return <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-bold border border-blue-200">مشروع محدد القيمة</span>;
      case 'ip_agreement':
        return <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-bold border border-emerald-200">حماية الملكية الفكرية</span>;
      case 'partnership':
        return <span className="rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-bold border border-amber-200">عقد شراكة</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#4C5540] text-white shadow-xs">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#24291F] dark:text-[#F3F1EC]">
                {language === 'ar' ? 'سجل عقود وملفات وكالة شال الرسمية' : 'Company Contracts & Legal Hub'}
              </h2>
              <p className="text-xs text-[#4C5540]/80 dark:text-[#C8D1C0] mt-0.5">
                {language === 'ar'
                  ? 'منظومة مركزية لإدارة عقود الريتينر، اتفاقيات السرية (NDA)، وتوثيق وحماية الملكية الفكرية للوكالة والعملاء.'
                  : 'Centralized repository for retainer agreements, NDAs, and intellectual property documentation.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Import Button */}
          <label className="flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs">
            <Upload className="h-4 w-4 text-[#4C5540]" />
            <span>{language === 'ar' ? 'استيراد' : 'Import'}</span>
            <input type="file" accept=".json,.csv" onChange={handleImportFile} className="hidden" />
          </label>

          {/* Export Dropdown / Buttons */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs"
            title="تصدير إلى CSV"
          >
            <Download className="h-4 w-4 text-[#4C5540]" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs"
            title="تصدير إلى JSON"
          >
            <FileCode className="h-4 w-4 text-[#4C5540]" />
            <span>JSON</span>
          </button>

          {/* New Contract Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3B4432] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{language === 'ar' ? 'إضافة عقد جديد' : 'New Contract'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'العقود النشطة' : 'Active Contracts'}</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{activeCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{language === 'ar' ? 'سارية وموثقة قانونياً' : 'Legally binding & active'}</span>
        </div>

        <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'بانتظار التوقيع' : 'Pending Signature'}</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
          <span className="text-[10px] text-amber-600 font-semibold">{language === 'ar' ? 'تحت مراجعة العميل' : 'Awaiting client sign-off'}</span>
        </div>

        <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'إجمالي قيمة العقود النشطة' : 'Total Active Value'}</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            ${totalValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">{language === 'ar' ? 'عوائد ريتينر وتعاقدات سنوية' : 'Annual retainers revenue'}</span>
        </div>

        <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'حماية الملكية الفكرية' : 'IP Protection'}</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">100%</p>
          <span className="text-[10px] text-purple-600 font-semibold">{language === 'ar' ? 'بصمة وتوثيق وكالة شال' : 'Official Shal Agency IP'}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#BDAF9C]/30 bg-[#FAF7F2] dark:bg-[#181D18] p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث برقم العقد، اسم العميل، أو البنود...' : 'Search by contract number, client...'}
            className={`w-full rounded-xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] py-1.5 text-xs text-[#24291F] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4C5540] ${
              language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="all">{language === 'ar' ? 'كافة أنواع العقود' : 'All Types'}</option>
            <option value="retainer">{language === 'ar' ? 'ريتينر شهري' : 'Retainers'}</option>
            <option value="nda">{language === 'ar' ? 'اتفاقية سرية (NDA)' : 'NDAs'}</option>
            <option value="project_fixed">{language === 'ar' ? 'مشروع محدد القيمة' : 'Fixed Projects'}</option>
            <option value="partnership">{language === 'ar' ? 'عقود شراكة' : 'Partnerships'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="all">{language === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
            <option value="active">{language === 'ar' ? 'نشط وساري' : 'Active'}</option>
            <option value="pending_signature">{language === 'ar' ? 'بانتظار التوقيع' : 'Pending'}</option>
            <option value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</option>
            <option value="expired">{language === 'ar' ? 'منتهي' : 'Expired'}</option>
          </select>
        </div>
      </div>

      {/* Contracts Roster Table */}
      <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-[#BDAF9C]/30 bg-[#FAF7F2] dark:bg-[#181D18] text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="p-3.5 text-start">{language === 'ar' ? 'رقم العقد' : 'Contract #'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'مسمى العقد والطرف الثاني' : 'Title & Client'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'النوع' : 'Type'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'القيمة المالية' : 'Value'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'مدة السريان' : 'Duration'}</th>
                <th className="p-3.5 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-3.5 text-center">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد عقود مطابقة للشروط المحددة.' : 'No contracts match the criteria.'}</p>
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {contract.contractNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white text-xs max-w-sm truncate">
                        {contract.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="h-3 w-3 text-[#4C5540]" />
                        <span>{contract.clientName}</span>
                      </div>
                    </td>
                    <td className="p-3.5">{getTypeBadge(contract.type)}</td>
                    <td className="p-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                      {contract.value > 0 ? `$${contract.value.toLocaleString()} ${contract.currency}` : 'اتفاقية سرية'}
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      <div>{contract.startDate}</div>
                      <div className="text-slate-400 text-[10px]">حتى {contract.endDate}</div>
                    </td>
                    <td className="p-3.5">{getStatusBadge(contract.status)}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Download PDF Summary */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(contract)}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-[#4C5540] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                          title="تحميل ملخص العقد PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>

                        {/* View Scope Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedContract(contract)}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="عرض تفاصيل العقد"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit Contract */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(contract)}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="تعديل العقد"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Contract */}
                        <button
                          type="button"
                          onClick={() => handleDeleteContract(contract.id, contract.title)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="حذف العقد"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Details Slide-over / Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#4C5540] text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedContract.contractNumber}</h3>
                  <p className="text-xs text-slate-500">{selectedContract.clientName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-[#FAF7F2] dark:bg-[#181D18] p-3 border border-[#BDAF9C]/30 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedContract.title}</h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {getTypeBadge(selectedContract.type)}
                  {getStatusBadge(selectedContract.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-semibold">القيمة التعاقدية</span>
                  <span className="font-bold font-mono text-sm text-[#4C5540]">
                    ${selectedContract.value.toLocaleString()} {selectedContract.currency}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block font-semibold">فترة السريان</span>
                  <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                    {selectedContract.startDate} → {selectedContract.endDate}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">نطاق الأعمال والمخرجات المعتمدة (Scope of Work):</label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121612] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {selectedContract.scopeSummary}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-900 dark:text-emerald-300">
                  <span className="block font-bold">المفوض بالتوقيع من شال:</span>
                  <span>{selectedContract.signedByAgency || 'الفاوندر والمدير العام'}</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 text-blue-900 dark:text-blue-300">
                  <span className="block font-bold">المفوض بالتوقيع من العميل:</span>
                  <span>{selectedContract.signedByClient || 'ممثل الشركة المعتمد'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDownloadPDF(selectedContract)}
                className="flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B4432] transition-colors cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>تحميل ملخص PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Contract Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#4C5540] text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingId ? 'تعديل بيانات العقد الرسمي' : 'إضافة وتوثيق عقد جديد'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Template Auto-Fill Buttons */}
            {!editingId && (
              <div className="mt-3 p-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#181D18] border border-[#BDAF9C]/30">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>تعبئة تلقائية من النماذج الرسمية المعتمدة لوكالة شال:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('retainer')}
                    className="rounded-lg bg-white dark:bg-[#1E251D] border border-[#BDAF9C]/40 px-2 py-1 text-[10px] font-bold text-[#4C5540] hover:bg-[#4C5540] hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    عقد ريتينر تسويقي
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('nda')}
                    className="rounded-lg bg-white dark:bg-[#1E251D] border border-[#BDAF9C]/40 px-2 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-700 hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    اتفاقية سرية (NDA)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('branding')}
                    className="rounded-lg bg-white dark:bg-[#1E251D] border border-[#BDAF9C]/40 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-700 hover:text-white transition-all cursor-pointer shadow-2xs"
                  >
                    عقد هوية وتصميم
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveContract} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">مسمى العقد *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4C5540]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم العميل / الشريك *</label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4C5540]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نوع العقد</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4C5540] bg-white dark:bg-[#1E251D]"
                  >
                    <option value="retainer">عقد ريتينر شهري</option>
                    <option value="nda">اتفاقية سرية معلومات (NDA)</option>
                    <option value="project_fixed">مشروع محدد القيمة</option>
                    <option value="ip_agreement">حماية الملكية الفكرية</option>
                    <option value="partnership">عقد شراكة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">القيمة المالية (USD)</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4C5540] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">حالة العقد</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4C5540] bg-white dark:bg-[#1E251D]"
                  >
                    <option value="active">نشط وساري (Active)</option>
                    <option value="pending_signature">بانتظار التوقيع (Pending)</option>
                    <option value="draft">مسودة (Draft)</option>
                    <option value="expired">منتهي (Expired)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4C5540]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4C5540]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نطاق الأعمال والمخرجات (Scope)</label>
                <textarea
                  rows={3}
                  value={formScope}
                  onChange={(e) => setFormScope(e.target.value)}
                  placeholder="حدد مخرجات التعاقد، عدد المنشورات، البنود الفنية، والالتزامات..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#4C5540]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formAutoRenew}
                    onChange={(e) => setFormAutoRenew(e.target.checked)}
                    className="h-4 w-4 rounded text-[#4C5540] focus:ring-[#4C5540]"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    تجديد تلقائي عند انتهاء المدة (Auto-Renew)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B4432] shadow-xs cursor-pointer"
                >
                  {editingId ? 'تأكيد التعديلات' : 'اعتماد وحفظ العقد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
