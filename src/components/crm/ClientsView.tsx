import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus } from '../../types';
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
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#24291F] flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#4C5540]" />
            {language === 'ar' ? 'إدارة علاقات العملاء (CRM)' : 'Client CRM'}
          </h2>
          <p className="text-xs text-[#4C5540]/80 mt-0.5">
            {language === 'ar'
              ? 'سجل مركزي موحّد لبيانات العملاء، العقود الشهرية، وسجلات التواصل والمشاريع - وكالة شال | Shal.'
              : 'Unified client database with retainers, communication logs, and project history - Shal Agency.'}
          </p>
        </div>

        {canEdit && (
          <button
            id="add-client-btn"
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3B4432] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة عميل جديد' : 'New Client'}
          </button>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#BDAF9C]/30 bg-[#FAF7F2] p-3 shadow-xs">
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
    </div>
  );
};
