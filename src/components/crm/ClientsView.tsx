import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus, SalesDeal, DealStage } from '../../types';
import {
  Briefcase,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  ShieldAlert,
  Download,
  Loader2,
  Upload,
  TrendingUp,
  Target,
  DollarSign,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const {
    clients,
    projects,
    tasks,
    addClient,
    updateClient,
    deleteClient,
    addCommunicationLog,
    hasPermission,
    language,
    setActiveTab,
    showToast,
  } = useApp();

  const [activeCrmTab, setActiveCrmTab] = useState<'clients' | 'deals'>('clients');

  // Sales Deals State
  const [salesDeals, setSalesDeals] = useState<SalesDeal[]>(() => {
    try {
      const saved = localStorage.getItem('shal_sales_deals');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'deal-01',
        title: 'عقد إدارة الهوية وحملات الأداء السنوية',
        clientId: 'client-1',
        clientName: 'مجموعة المدى للاستثمار',
        contactPerson: 'عبد الله الراجحي',
        value: 14500,
        currency: 'USD',
        stage: 'negotiation',
        probability: 75,
        assignedUserId: 'user-sales',
        assignedUserName: 'محمود 11 | ميديا باير ومبيعات',
        expectedCloseDate: '2026-03-15',
        services: ['Social Retainer', 'Media Buying', 'SEO'],
        createdAt: '2026-02-10T10:00:00Z',
      },
      {
        id: 'deal-02',
        title: 'مشروع تطوير الهوية ونظام التصميم لتطبيق وصل',
        clientId: 'client-2',
        clientName: 'تطبيق وصل التقني',
        contactPerson: 'طارق السعدي',
        value: 9800,
        currency: 'USD',
        stage: 'contract_pending',
        probability: 90,
        assignedUserId: 'user-ops',
        assignedUserName: 'محمود 04 | مدير العمليات',
        expectedCloseDate: '2026-03-05',
        services: ['Branding', 'UI/UX Design', 'Design System'],
        createdAt: '2026-02-18T12:00:00Z',
      },
      {
        id: 'deal-03',
        title: 'حملة إطلاق موسم الصيف 2026',
        clientId: 'client-3',
        clientName: 'سلسلة مطاعم غصن',
        contactPerson: 'سارة خالد',
        value: 12000,
        currency: 'USD',
        stage: 'proposal_sent',
        probability: 60,
        assignedUserId: 'user-sales',
        assignedUserName: 'محمود 11 | ميديا باير ومبيعات',
        expectedCloseDate: '2026-03-25',
        services: ['Video Production', 'Influencers', 'TikTok Ads'],
        createdAt: '2026-02-22T14:30:00Z',
      },
      {
        id: 'deal-04',
        title: 'تطوير متجر فخامة العود وسيو التجارة الإلكترونية',
        clientId: 'client-4',
        clientName: 'متجر فخامة العود',
        contactPerson: 'فهد العتيبي',
        value: 8200,
        currency: 'USD',
        stage: 'closed_won',
        probability: 100,
        assignedUserId: 'user-dev',
        assignedUserName: 'محمود 05 | مطور برمجيات',
        expectedCloseDate: '2026-02-28',
        services: ['Dev', 'SEO', 'Conversion Rate Optimization'],
        createdAt: '2026-02-01T09:00:00Z',
      },
    ];
  });

  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealClientName, setDealClientName] = useState('');
  const [dealContactPerson, setDealContactPerson] = useState('');
  const [dealValue, setDealValue] = useState(7000);
  const [dealStage, setDealStage] = useState<DealStage>('lead');
  const [dealProbability, setDealProbability] = useState(50);
  const [dealExpectedDate, setDealExpectedDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [dealServices, setDealServices] = useState('Social Media, Performance Ads');

  // Sync deals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shal_sales_deals', JSON.stringify(salesDeals));
    } catch {
      // Ignore
    }
  }, [salesDeals]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Form states for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRetainer, setFormRetainer] = useState(5000);
  const [formPackage, setFormPackage] = useState('');
  const [formStatus, setFormStatus] = useState<ClientStatus>('active');
  const [formNotes, setFormNotes] = useState('');

  // Comm log state
  const [commType, setCommType] = useState<'call' | 'meeting' | 'email' | 'whatsapp' | 'note'>('call');
  const [commSummary, setCommSummary] = useState('');

  const canViewClients = hasPermission('can_view_clients');
  const canEdit = hasPermission('can_edit_clients');
  const canDelete = hasPermission('can_delete_clients');

  // Permission Guard: Restrict access if user's role lacks can_view_clients
  if (!canViewClients) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">
          {language === 'ar' ? 'الوصول مقيّد لبيانات العملاء (CRM)' : 'Access Restricted to Client CRM'}
        </h2>
        <p className="text-sm text-slate-600 mb-6 max-w-md leading-relaxed">
          {language === 'ar'
            ? 'دورك الحالي لا يمتلك صلاحية الاطلاع على بيانات العملاء والتعاقدات (can_view_clients). الأدوار المصرح لها افتراضياً: المدير العام (Super Admin)، مدير العمليات (Operations Manager)، وصانع المحتوى (Content Creator).'
            : 'Your current role does not have permission to view client records (can_view_clients). Authorized default roles: Super Admin, Operations Manager, and Content Creator.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('tasks')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#4C5540] text-white hover:bg-[#3B4432] transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'الانتقال إلى لوحة المهام' : 'Go to Tasks Board'}
          </button>
        </div>
      </div>
    );
  }

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.company.toLowerCase().includes(search.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'active':
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">{language === 'ar' ? 'نشط (Active)' : 'Active'}</span>;
      case 'negotiation':
        return <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">{language === 'ar' ? 'تفاوض (Negotiation)' : 'Negotiation'}</span>;
      case 'lead':
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{language === 'ar' ? 'محتمل (Lead)' : 'Lead'}</span>;
      case 'paused':
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">{language === 'ar' ? 'متوقف مؤقتاً (Paused)' : 'Paused'}</span>;
      case 'churned':
        return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">{language === 'ar' ? 'مغادر (Churned)' : 'Churned'}</span>;
    }
  };

  const openAddModal = () => {
    setFormName('');
    setFormCompany('');
    setFormIndustry('');
    setFormContactPerson('');
    setFormEmail('');
    setFormPhone('');
    setFormRetainer(4500);
    setFormPackage('');
    setFormStatus('active');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setFormName(client.name);
    setFormCompany(client.company);
    setFormIndustry(client.industry);
    setFormContactPerson(client.contactPerson);
    setFormEmail(client.email);
    setFormPhone(client.phone);
    setFormRetainer(client.monthlyRetainer);
    setFormPackage(client.packageTitle);
    setFormStatus(client.status);
    setFormNotes(client.notes);
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    addClient({
      name: formName,
      company: formCompany || formName,
      industry: formIndustry || 'Digital Business',
      contactPerson: formContactPerson || 'المسؤول المباشر',
      email: formEmail || 'contact@client.com',
      phone: formPhone || '+966 50 000 0000',
      monthlyRetainer: Number(formRetainer) || 0,
      currency: 'USD',
      packageTitle: formPackage || 'باقة متكاملة',
      status: formStatus,
      notes: formNotes,
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !formName.trim()) return;

    updateClient(selectedClient.id, {
      name: formName,
      company: formCompany,
      industry: formIndustry,
      contactPerson: formContactPerson,
      email: formEmail,
      phone: formPhone,
      monthlyRetainer: Number(formRetainer),
      packageTitle: formPackage,
      status: formStatus,
      notes: formNotes,
    });

    // Update active selected client
    setSelectedClient((prev) =>
      prev
        ? {
            ...prev,
            name: formName,
            company: formCompany,
            industry: formIndustry,
            contactPerson: formContactPerson,
            email: formEmail,
            phone: formPhone,
            monthlyRetainer: Number(formRetainer),
            packageTitle: formPackage,
            status: formStatus,
            notes: formNotes,
          }
        : null
    );

    setIsEditModalOpen(false);
  };

  const handleAddCommLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !commSummary.trim()) return;

    addCommunicationLog(selectedClient.id, {
      type: commType,
      summary: commSummary,
    });

    setCommSummary('');
  };

  const handleDownloadPDFReport = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      // Background Header Bar (Shal Agency Theme)
      doc.setFillColor(76, 85, 64); // #4C5540 Olive
      doc.rect(0, 0, 210, 26, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('SHAL AGENCY | CLIENT DIRECTORY & RETAINERS REPORT', 14, 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${today} | Clients Exported: ${filteredClients.length} | Confidential Internal Record`, 14, 20);

      // Summary Card
      doc.setFillColor(250, 247, 242); // #FAF7F2
      doc.roundedRect(14, 32, 182, 16, 2, 2, 'F');

      const totalRetainer = filteredClients.reduce((acc, c) => acc + (c.monthlyRetainer || 0), 0);
      const activeCount = filteredClients.filter((c) => c.status === 'active').length;

      doc.setTextColor(36, 41, 31); // #24291F
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Active Accounts: ${activeCount} / ${filteredClients.length}`, 20, 42);
      doc.text(`Monthly Retainer Total: $${totalRetainer.toLocaleString()} USD`, 105, 42);

      // Table Header
      let startY = 56;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, startY, 182, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);

      doc.text('#', 17, startY + 5.5);
      doc.text('Company / Client', 25, startY + 5.5);
      doc.text('Contact & Phone', 82, startY + 5.5);
      doc.text('Package', 130, startY + 5.5);
      doc.text('Retainer (USD)', 160, startY + 5.5);
      doc.text('Status', 184, startY + 5.5);

      startY += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      filteredClients.forEach((client, index) => {
        // Page break handling
        if (startY > 275) {
          doc.addPage();
          startY = 20;
          doc.setFillColor(241, 245, 249);
          doc.rect(14, startY, 182, 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(71, 85, 105);
          doc.text('#', 17, startY + 5.5);
          doc.text('Company / Client', 25, startY + 5.5);
          doc.text('Contact & Phone', 82, startY + 5.5);
          doc.text('Package', 130, startY + 5.5);
          doc.text('Retainer (USD)', 160, startY + 5.5);
          doc.text('Status', 184, startY + 5.5);
          startY += 10;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
        }

        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, startY - 3.5, 182, 7.5, 'F');
        }

        doc.text(String(index + 1), 17, startY + 1);

        const compName = client.company ? `${client.name} (${client.company})` : client.name;
        doc.text(compName.slice(0, 32), 25, startY + 1);

        const contactStr = `${client.contactPerson || '-'} | ${client.phone || ''}`;
        doc.text(contactStr.slice(0, 27), 82, startY + 1);

        doc.text((client.packageTitle || 'Standard').slice(0, 18), 130, startY + 1);
        doc.text(`$${(client.monthlyRetainer || 0).toLocaleString()}`, 160, startY + 1);
        doc.text(client.status.toUpperCase(), 184, startY + 1);

        startY += 8;
      });

      // Footer numbering
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Shal Agency Internal CRM • RLS Protected • Page ${i} of ${totalPages}`,
          105,
          290,
          { align: 'center' }
        );
      }

      doc.save(`shal-clients-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export Clients JSON
  const handleExportClientsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(clients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shal-clients-crm-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast({
      type: 'success',
      title: 'تصدير بيانات العملاء JSON',
      message: `تم تصدير ${clients.length} عملاء بنجاح.`,
    });
  };

  // Export Clients CSV
  const handleExportClientsCSV = () => {
    const headers = ['Name', 'Company', 'Industry', 'Contact Person', 'Email', 'Phone', 'Monthly Retainer', 'Status', 'Package'];
    const rows = clients.map((c) => [
      `"${c.name}"`,
      `"${c.company || ''}"`,
      `"${c.industry || ''}"`,
      `"${c.contactPerson || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      c.monthlyRetainer || 0,
      `"${c.status}"`,
      `"${c.packageTitle || ''}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shal-clients-crm-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast({
      type: 'success',
      title: 'تصدير بيانات العملاء CSV',
      message: 'تم تنزيل ملف جداول البيانات بنجاح.',
    });
  };

  // Import Clients JSON
  const handleImportClients = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            addClient({
              name: c.name || 'عميل جديد',
              company: c.company || c.name || 'شركة معتمدة',
              industry: c.industry || 'Digital Business',
              contactPerson: c.contactPerson || 'المسؤول المباشر',
              email: c.email || 'contact@client.com',
              phone: c.phone || '+966 50 000 0000',
              monthlyRetainer: Number(c.monthlyRetainer) || 5000,
              currency: 'USD',
              packageTitle: c.packageTitle || 'باقة متكاملة',
              status: c.status || 'active',
              notes: c.notes || 'مستورد آلياً',
            });
          });
          showToast({
            type: 'success',
            title: 'تم استيراد العملاء',
            message: `تمت إضافة ${parsed.length} عملاء إلى قاعدة البيانات.`,
          });
        }
      } catch (err) {
        showToast({
          type: 'error',
          title: 'فشل استيراد الملف',
          message: 'يرجى التأكد من صحة تنسيق JSON.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Move Deal Stage
  const handleMoveDealStage = (dealId: string, nextStage: DealStage) => {
    setSalesDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: nextStage } : d))
    );
    showToast({
      type: 'success',
      title: 'تم تحديث مرحلة الصفقة',
      message: `تم نقل الصفقة إلى مرحلة "${nextStage}".`,
    });
  };

  // Add Deal
  const handleSaveAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim() || !dealClientName.trim()) return;

    const newDeal: SalesDeal = {
      id: `deal-${Date.now()}`,
      title: dealTitle,
      clientId: `client-${Date.now()}`,
      clientName: dealClientName,
      contactPerson: dealContactPerson || 'المسؤول المباشر',
      value: Number(dealValue) || 5000,
      currency: 'USD',
      stage: dealStage,
      probability: Number(dealProbability) || 50,
      assignedUserId: 'user-sales',
      assignedUserName: 'إدارة المبيعات',
      expectedCloseDate: dealExpectedDate,
      services: dealServices.split(',').map((s) => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    setSalesDeals((prev) => [newDeal, ...prev]);
    setIsAddDealModalOpen(false);
    setDealTitle('');
    setDealClientName('');
    showToast({
      type: 'success',
      title: 'تمت إضافة الصفقة الجديدة',
      message: `تم قيد الصفقة بقيمة $${newDeal.value.toLocaleString()} USD بنجاح.`,
    });
  };

  // Sales Pipeline Total
  const totalPipelineValue = salesDeals
    .filter((d) => d.stage !== 'closed_lost')
    .reduce((acc, d) => acc + (d.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#24291F] dark:text-[#F3F1EC] flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#4C5540]" />
              {language === 'ar' ? 'إدارة علاقات العملاء والمبيعات (CRM & Sales)' : 'Client CRM & Sales Deals'}
            </h2>
          </div>
          <p className="text-xs text-[#4C5540]/80 dark:text-[#C8D1C0] mt-0.5">
            {language === 'ar'
              ? 'سجل مركزي موحّد لبيانات العملاء، صفقات المبيعات، العقود الشهرية، وسجلات التواصل والمشاريع - وكالة شال.'
              : 'Unified client database, sales pipeline deals, retainers, and communication history - Shal Agency.'}
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Import Clients */}
          <label className="flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs">
            <Upload className="h-4 w-4 text-[#4C5540]" />
            <span>{language === 'ar' ? 'استيراد' : 'Import'}</span>
            <input type="file" accept=".json" onChange={handleImportClients} className="hidden" />
          </label>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportClientsCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs"
            title="تصدير CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#4C5540]" />
            <span>CSV</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportClientsJSON}
            className="flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#1E251D] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs"
            title="تصدير JSON"
          >
            <FileCode className="h-4 w-4 text-[#4C5540]" />
            <span>JSON</span>
          </button>

          {/* Download Report PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPDFReport}
            disabled={isGeneratingPdf || filteredClients.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-[#4C5540]/30 bg-white dark:bg-[#1E251D] px-3.5 py-2 text-xs font-bold text-[#24291F] dark:text-[#F3F1EC] shadow-2xs hover:bg-[#FAF7F2] transition-colors cursor-pointer disabled:opacity-50"
            title={language === 'ar' ? 'تحميل تقرير قائمة العملاء بصيغة PDF' : 'Download clients list as PDF report'}
          >
            {isGeneratingPdf ? (
              <Loader2 className="h-4 w-4 text-[#4C5540] animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-[#4C5540]" />
            )}
            <span>
              {isGeneratingPdf
                ? language === 'ar'
                  ? 'تجهيز PDF...'
                  : 'Generating...'
                : language === 'ar'
                ? 'تقرير PDF'
                : 'PDF Report'}
            </span>
          </button>

          {activeCrmTab === 'clients' && canEdit && (
            <button
              id="add-client-btn"
              onClick={openAddModal}
              className="flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3B4432] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {language === 'ar' ? 'إضافة عميل جديد' : 'New Client'}
            </button>
          )}

          {activeCrmTab === 'deals' && (
            <button
              type="button"
              onClick={() => setIsAddDealModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3B4432] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {language === 'ar' ? 'إضافة صفقة مبيعات' : 'New Deal'}
            </button>
          )}
        </div>
      </div>

      {/* CRM Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#BDAF9C]/30 pb-3">
        <button
          type="button"
          onClick={() => setActiveCrmTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCrmTab === 'clients'
              ? 'bg-[#4C5540] text-white shadow-xs'
              : 'bg-white dark:bg-[#1E251D] text-slate-700 dark:text-slate-300 border border-[#BDAF9C]/30 hover:bg-[#FAF7F2]'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>{language === 'ar' ? 'سجل العملاء والتعاقدات' : 'Clients & Retainers'}</span>
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px]">
            {filteredClients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCrmTab('deals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCrmTab === 'deals'
              ? 'bg-[#4C5540] text-white shadow-xs'
              : 'bg-white dark:bg-[#1E251D] text-slate-700 dark:text-slate-300 border border-[#BDAF9C]/30 hover:bg-[#FAF7F2]'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>{language === 'ar' ? 'صفقات ومسار المبيعات (Sales Pipeline)' : 'Sales Pipeline Deals'}</span>
          <span className="rounded-full bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-mono">
            ${totalPipelineValue.toLocaleString()}
          </span>
        </button>
      </div>

      {/* CRM Main Tab Content: Clients & Retainers */}
      {activeCrmTab === 'clients' && (
        <>
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#BDAF9C]/30 bg-[#FAF7F2] dark:bg-[#1E251D] p-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث بالاسم، الشركة، أو الشخص المسؤول...' : 'Search by client, company...'}
            className={`w-full rounded-lg border border-[#BDAF9C]/35 bg-white py-1.5 text-xs text-[#24291F] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4C5540] ${
              language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
            { id: 'active', labelAr: 'نشط', labelEn: 'Active' },
            { id: 'negotiation', labelAr: 'تفاوض', labelEn: 'Negotiation' },
            { id: 'lead', labelAr: 'محتمل', labelEn: 'Leads' },
            { id: 'paused', labelAr: 'متوقف', labelEn: 'Paused' },
            { id: 'churned', labelAr: 'مغادر', labelEn: 'Churned' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#4C5540] text-white shadow-xs'
                  : 'text-[#24291F] hover:bg-[#E9E1D6]/50'
              }`}
            >
              {language === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#BDAF9C]/40 bg-[#FAF7F2] p-12 text-center shadow-xs">
          <div className="rounded-full bg-[#4C5540]/10 p-4 text-[#4C5540] mb-3">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-[#24291F]">
            {language === 'ar' ? 'لا يوجد عملاء مسجلون حالياً' : 'No Clients Found'}
          </h3>
          <p className="mt-1 text-xs text-[#4C5540]/80 max-w-md leading-relaxed">
            {language === 'ar'
              ? 'النظام جاهز ونظيف لبدء تسجيل عملائك الحقيقيين وإدارتهم ومتابعة عقودهم وسجلات التواصل معهم.'
              : 'The CRM system is clean and ready. Add your first real client to link projects and manage accounts.'}
          </p>
          {canEdit && (
            <button
              onClick={openAddModal}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3B4432] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {language === 'ar' ? 'تسجيل أول عميل للوكالة' : 'Add First Client'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => {
          const clientProjects = projects.filter((p) => p.clientId === client.id);
          const clientTasks = tasks.filter((t) => t.clientId === client.id);

          return (
            <div
              key={client.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{client.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      {client.company}
                    </p>
                  </div>
                  {getStatusBadge(client.status)}
                </div>

                <div className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{language === 'ar' ? 'الباقة:' : 'Package:'}</span>
                    <span className="font-semibold text-slate-800 truncate">{client.packageTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{language === 'ar' ? 'العقد الشهري:' : 'Retainer:'}</span>
                    <span className="font-bold text-[#4C5540]">${client.monthlyRetainer.toLocaleString()} / شهر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{language === 'ar' ? 'المسؤول:' : 'Contact:'}</span>
                    <span className="text-slate-700 truncate">{client.contactPerson}</span>
                  </div>
                </div>

                {/* Projects & Tasks stats */}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
                  <span className="font-medium">
                    {clientProjects.length} {language === 'ar' ? 'مشاريع' : 'Projects'}
                  </span>
                  <span>•</span>
                  <span className="font-medium">
                    {clientTasks.length} {language === 'ar' ? 'مهام مرتبطة' : 'Tasks'}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-500">
                    {client.communicationLogs.length} {language === 'ar' ? 'سجل تواصل' : 'Logs'}
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="text-xs font-bold text-[#4C5540] hover:text-[#3B4432] flex items-center gap-1 cursor-pointer"
                >
                  {language === 'ar' ? 'عرض السجل والتفاصيل' : 'View Profile'}
                  <ExternalLink className="h-3 w-3" />
                </button>

                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        openEditModal(client);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="تعديل العميل"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setClientToDelete(client)}
                      className="btn-interactive rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="حذف العميل"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
        </>
      )}

      {/* CRM Main Tab Content: Sales Deals Pipeline */}
      {activeCrmTab === 'deals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Sales KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#BDAF9C]/30 bg-white dark:bg-[#181D18] p-4 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-[#BDAF9C] block">{language === 'ar' ? 'إجمالي مسار المبيعات (Pipeline)' : 'Total Pipeline Value'}</span>
              <span className="text-2xl font-black text-[#4C5540] dark:text-[#A4C08B] font-mono mt-1 block">
                ${totalPipelineValue.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {salesDeals.filter(d => d.stage !== 'closed_lost').length} {language === 'ar' ? 'صفقات نشطة قيد المتابعة' : 'active deals'}
              </span>
            </div>

            <div className="rounded-2xl border border-[#BDAF9C]/30 bg-white dark:bg-[#181D18] p-4 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-[#BDAF9C] block">{language === 'ar' ? 'الصفقات الرابحة المعتمدة' : 'Closed Won Deals'}</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                ${salesDeals.filter(d => d.stage === 'closed_won').reduce((acc, d) => acc + d.value, 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {salesDeals.filter(d => d.stage === 'closed_won').length} {language === 'ar' ? 'عقود تم إغلاقها بنجاح' : 'deals won'}
              </span>
            </div>

            <div className="rounded-2xl border border-[#BDAF9C]/30 bg-white dark:bg-[#181D18] p-4 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-[#BDAF9C] block">{language === 'ar' ? 'بانتظار توقيع العقد' : 'Contract Pending'}</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 block">
                ${salesDeals.filter(d => d.stage === 'contract_pending').reduce((acc, d) => acc + d.value, 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {language === 'ar' ? 'جاهزة للربط مع قسم العقود' : 'Ready for contract'}
              </span>
            </div>

            <div className="rounded-2xl border border-[#BDAF9C]/30 bg-white dark:bg-[#181D18] p-4 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-[#BDAF9C] block">{language === 'ar' ? 'متوسط احتمالية الفوز' : 'Avg. Win Probability'}</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
                {Math.round(salesDeals.reduce((acc, d) => acc + d.probability, 0) / (salesDeals.length || 1))}%
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {language === 'ar' ? 'مؤشر أداء وكفاءة الإغلاق' : 'Conversion health'}
              </span>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 overflow-x-auto pb-4">
            {(
              [
                { stage: 'lead' as DealStage, titleAr: 'فرص جديدة', titleEn: 'Leads', color: 'border-t-sky-500' },
                { stage: 'proposal_sent' as DealStage, titleAr: 'تم إرسال العرض', titleEn: 'Proposal Sent', color: 'border-t-blue-500' },
                { stage: 'negotiation' as DealStage, titleAr: 'تفاوض ومواءمة', titleEn: 'Negotiation', color: 'border-t-amber-500' },
                { stage: 'contract_pending' as DealStage, titleAr: 'بانتظار العقد', titleEn: 'Contract Pending', color: 'border-t-purple-500' },
                { stage: 'closed_won' as DealStage, titleAr: 'تم الفوز (Won)', titleEn: 'Closed Won', color: 'border-t-emerald-500' },
                { stage: 'closed_lost' as DealStage, titleAr: 'خسارة (Lost)', titleEn: 'Closed Lost', color: 'border-t-rose-500' },
              ]
            ).map((col) => {
              const columnDeals = salesDeals.filter((d) => d.stage === col.stage);
              const columnTotal = columnDeals.reduce((sum, d) => sum + d.value, 0);

              return (
                <div
                  key={col.stage}
                  className={`flex flex-col rounded-2xl border border-[#BDAF9C]/25 bg-white dark:bg-[#181D18] p-3 shadow-xs border-t-4 ${col.color} min-w-[210px]`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-[#2D372B]">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-[#F3F1EC]">
                        {language === 'ar' ? col.titleAr : col.titleEn}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ${columnTotal.toLocaleString()}
                      </span>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-[#2A3428] px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {columnDeals.length}
                    </span>
                  </div>

                  {/* Deals Cards */}
                  <div className="flex-1 space-y-2.5">
                    {columnDeals.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-slate-400 italic">
                        {language === 'ar' ? 'لا توجد صفقات هنا' : 'No deals'}
                      </div>
                    ) : (
                      columnDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="rounded-xl border border-slate-200/80 dark:border-[#2D372B] bg-[#FAF7F2]/50 dark:bg-[#1E251D] p-3 shadow-2xs hover:border-[#4C5540] transition-all space-y-2"
                        >
                          <div>
                            <span className="text-[10px] text-[#4C5540] dark:text-[#A4C08B] font-bold block truncate">
                              {deal.clientName}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                              {deal.title}
                            </h5>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-[#2D372B]">
                            <span className="font-black text-[#4C5540] dark:text-[#A4C08B] font-mono">
                              ${deal.value.toLocaleString()}
                            </span>
                            <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 text-[10px] font-bold">
                              {deal.probability}%
                            </span>
                          </div>

                          {/* Services tags */}
                          <div className="flex flex-wrap gap-1">
                            {deal.services?.slice(0, 2).map((srv, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-white dark:bg-[#151A14] px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>

                          {/* Move Stage Selector */}
                          <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-200/40 dark:border-[#2D372B]">
                            <select
                              value={deal.stage}
                              onChange={(e) => handleMoveDealStage(deal.id, e.target.value as DealStage)}
                              className="w-full rounded-md border border-[#BDAF9C]/30 bg-white dark:bg-[#151A14] px-1.5 py-1 text-[10px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                            >
                              <option value="lead">فرصة (Lead)</option>
                              <option value="proposal_sent">عرض مالي (Proposal)</option>
                              <option value="negotiation">تفاوض (Negotiation)</option>
                              <option value="contract_pending">عقد معلق (Pending)</option>
                              <option value="closed_won">فوز (Won 🎉)</option>
                              <option value="closed_lost">خسارة (Lost)</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Client Profile Details Modal / Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedClient.name}</h3>
                  {getStatusBadge(selectedClient.status)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedClient.industry} • {selectedClient.company}
                </p>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Left Info Column */}
              <div className="space-y-4 rounded-xl bg-slate-50 p-4 border border-slate-200/70 text-xs">
                <div>
                  <span className="font-bold text-slate-400 block">{language === 'ar' ? 'المسؤول المباشر:' : 'Contact:'}</span>
                  <span className="text-slate-900 font-semibold">{selectedClient.contactPerson}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block">{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</span>
                  <a href={`mailto:${selectedClient.email}`} className="text-indigo-600 hover:underline flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" />
                    {selectedClient.email}
                  </a>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block">{language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</span>
                  <a href={`tel:${selectedClient.phone}`} className="text-slate-700 flex items-center gap-1 mt-0.5 font-medium">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {selectedClient.phone}
                  </a>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block">{language === 'ar' ? 'العقد الشهري:' : 'Retainer:'}</span>
                  <span className="text-base font-extrabold text-indigo-700">
                    ${selectedClient.monthlyRetainer.toLocaleString()} / شهر
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block">{language === 'ar' ? 'الباقة التعاقدية:' : 'Package:'}</span>
                  <span className="text-slate-800">{selectedClient.packageTitle}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block">{language === 'ar' ? 'ملاحظات وتوجيهات:' : 'Notes:'}</span>
                  <p className="text-slate-600 mt-1 leading-relaxed">{selectedClient.notes || 'لا توجد ملاحظات خاصة.'}</p>
                </div>
              </div>

              {/* Right 2 Columns: Communication Log & Documents */}
              <div className="md:col-span-2 space-y-5">
                {/* Add New Communication Log */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                    {language === 'ar' ? 'تسجيل تفاعل جديد (Communication Log)' : 'Log Communication'}
                  </h4>

                  <form onSubmit={handleAddCommLog} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={commType}
                        onChange={(e) => setCommType(e.target.value as any)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="call">📞 {language === 'ar' ? 'مكالمة هاتفية' : 'Phone Call'}</option>
                        <option value="meeting">👥 {language === 'ar' ? 'اجتماع عمل' : 'Meeting'}</option>
                        <option value="email">✉️ {language === 'ar' ? 'بريد إلكتروني' : 'Email'}</option>
                        <option value="whatsapp">💬 {language === 'ar' ? 'رسالة واتساب' : 'WhatsApp'}</option>
                        <option value="note">📝 {language === 'ar' ? 'ملاحظة داخلية' : 'Internal Note'}</option>
                      </select>

                      <input
                        type="text"
                        value={commSummary}
                        onChange={(e) => setCommSummary(e.target.value)}
                        placeholder={language === 'ar' ? 'اكتب ملخص ما تم في المحادثة أو الاجتماع...' : 'Summary of discussion...'}
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                      >
                        {language === 'ar' ? 'حفظ' : 'Log'}
                      </button>
                    </div>
                  </form>

                  {/* Log History */}
                  <div className="mt-3.5 max-h-48 overflow-y-auto space-y-2 divide-y divide-slate-100">
                    {selectedClient.communicationLogs.length === 0 ? (
                      <p className="text-center py-4 text-xs text-slate-400">
                        {language === 'ar' ? 'لا يوجد سجل تواصل مسجل حتى الآن.' : 'No interaction recorded yet.'}
                      </p>
                    ) : (
                      selectedClient.communicationLogs.map((log) => (
                        <div key={log.id} className="pt-2 text-xs">
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <span className="font-semibold text-indigo-700 uppercase tracking-wider">{log.type}</span>
                            <span>{log.date} • {log.createdBy}</span>
                          </div>
                          <p className="text-slate-800 mt-1 leading-relaxed">{log.summary}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Linked Documents & Contracts */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    {language === 'ar' ? 'العقود والمستندات المرفقة' : 'Documents & Agreements'}
                  </h4>

                  <div className="space-y-2">
                    {selectedClient.documents.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">
                        {language === 'ar' ? 'لا توجد مستندات مرفقة لهذا العميل.' : 'No attached documents.'}
                      </p>
                    ) : (
                      selectedClient.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            <div>
                              <p className="font-bold text-slate-800">{doc.name}</p>
                              <span className="text-[10px] text-slate-400">{doc.size} • {doc.uploadedAt}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => alert(language === 'ar' ? 'جارٍ تحميل المستند...' : 'Downloading document...')}
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            {language === 'ar' ? 'تحميل' : 'Download'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {isAddModalOpen
                  ? (language === 'ar' ? 'إضافة عميل جديد للأجنسي' : 'Add New Client')
                  : (language === 'ar' ? 'تعديل بيانات العميل' : 'Edit Client')}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'اسم العميل / البراند *' : 'Client / Brand Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: أفق للتكنولوجيا المالية"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم الشركة المسجل' : 'Company Legal Name'}
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'مجال العمل (Industry)' : 'Industry'}
                  </label>
                  <input
                    type="text"
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    placeholder="مثال: FinTech, E-Commerce"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الشخص المسؤول (Contact Person)' : 'Contact Person'}
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'حالة العميل' : 'Client Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ClientStatus)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="negotiation">تفاوض (Negotiation)</option>
                    <option value="lead">محتمل (Lead)</option>
                    <option value="paused">متوقف (Paused)</option>
                    <option value="churned">مغادر (Churned)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'قيمة العقد الشهري (USD)' : 'Monthly Retainer ($)'}
                  </label>
                  <input
                    type="number"
                    value={formRetainer}
                    onChange={(e) => setFormRetainer(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'عنوان الباقة' : 'Package Title'}
                  </label>
                  <input
                    type="text"
                    value={formPackage}
                    onChange={(e) => setFormPackage(e.target.value)}
                    placeholder="مثال: إدارة السوشيال + تطوير البوابة"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'ملاحظات وتوجيهات خاصة' : 'Notes & Guidelines'}
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="btn-interactive rounded-xl border border-[#BDAF9C]/40 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F2]"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn-interactive rounded-xl bg-[#4C5540] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#3B4432] shadow-xs"
                >
                  {isAddModalOpen
                    ? (language === 'ar' ? 'إنشاء العميل' : 'Save Client')
                    : (language === 'ar' ? 'تحديث البيانات' : 'Update Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Client Safe Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'تأكيد حذف ملف العميل' : 'Confirm Client Deletion'}
                </h3>
                <p className="text-xs text-slate-500">{clientToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
              {language === 'ar'
                ? `هل أنت متأكد من رغبتك في حذف العميل "${clientToDelete.name}" وكافة سجلات التواصل والاتفاقيات الخاصة به؟`
                : `Are you sure you want to permanently delete client "${clientToDelete.name}"?`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="btn-interactive rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteClient(clientToDelete.id);
                  if (selectedClient?.id === clientToDelete.id) {
                    setSelectedClient(null);
                  }
                  setClientToDelete(null);
                }}
                className="btn-interactive rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                {language === 'ar' ? 'نعم، حذف العميل' : 'Delete Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {isAddDealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#181D18] p-6 shadow-2xl border border-slate-200 dark:border-[#2D372B] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D372B] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#4C5540]/10 text-[#4C5540] dark:text-[#A4C08B]">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'ar' ? 'إضافة صفقة مبيعات جديدة' : 'Add New Sales Deal'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#BDAF9C]">
                    {language === 'ar' ? 'تسجيل صفقة في مسار المبيعات والربط التلقائي' : 'Log opportunity in sales pipeline'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDealModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A3428]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddDeal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'عنوان الصفقة / المشروع:' : 'Deal Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: حملة إعلانات الربع الثاني وعقد هوية' : 'e.g. Q2 Performance Campaign'}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'اسم العميل / الشركة:' : 'Client / Company Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={dealClientName}
                    onChange={(e) => setDealClientName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: شركة الأفق للتطوير' : 'Company Name'}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'المسؤول المباشر:' : 'Contact Person:'}
                  </label>
                  <input
                    type="text"
                    value={dealContactPerson}
                    onChange={(e) => setDealContactPerson(e.target.value)}
                    placeholder={language === 'ar' ? 'الاسم أو رقم الهاتف' : 'Contact Person'}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'قيمة الصفقة (USD):' : 'Value (USD):'}
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={dealValue}
                    onChange={(e) => setDealValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'المرحلة الأولية:' : 'Stage:'}
                  </label>
                  <select
                    value={dealStage}
                    onChange={(e) => setDealStage(e.target.value as DealStage)}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="lead">فرصة محتملة (Lead)</option>
                    <option value="proposal_sent">تم إرسال العرض</option>
                    <option value="negotiation">تفاوض</option>
                    <option value="contract_pending">بانتظار العقد</option>
                    <option value="closed_won">فوز مغلق</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'نسبة الاحتمالية %:' : 'Win %:'}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={dealProbability}
                    onChange={(e) => setDealProbability(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'الخدمات المطلوبة (مفصولة بفواصل):' : 'Services (comma separated):'}
                </label>
                <input
                  type="text"
                  value={dealServices}
                  onChange={(e) => setDealServices(e.target.value)}
                  placeholder="Social Media, Media Buying, Branding, SEO"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'تاريخ الإغلاق المتوقع:' : 'Expected Close Date:'}
                </label>
                <input
                  type="date"
                  value={dealExpectedDate}
                  onChange={(e) => setDealExpectedDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#2D372B]">
                <button
                  type="button"
                  onClick={() => setIsAddDealModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-[#2D372B] px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E251D] cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4C5540] px-5 py-2 font-bold text-white hover:bg-[#3B4432] shadow-xs cursor-pointer"
                >
                  {language === 'ar' ? 'حفظ الصفقة في المسار' : 'Save Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
