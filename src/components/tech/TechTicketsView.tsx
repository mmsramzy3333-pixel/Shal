import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ticket, TicketSeverity, TicketStatus, TicketType } from '../../types';
import {
  Terminal,
  Plus,
  Search,
  Filter,
  Bug,
  Sparkles,
  Wrench,
  Server,
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Code,
} from 'lucide-react';

export const TechTicketsView: React.FC = () => {
  const {
    tickets,
    clients,
    projects,
    users,
    currentUser,
    addTicket,
    updateTicketStatus,
    language,
    hasPermission,
  } = useApp();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Add Ticket Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSeverity, setFormSeverity] = useState<TicketSeverity>('high');
  const [formType, setFormType] = useState<TicketType>('bug');
  const [formClientId, setFormClientId] = useState(clients[0]?.id || '');
  const [formProjectId, setFormProjectId] = useState(projects[0]?.id || '');
  const [formGithubPR, setFormGithubPR] = useState('');
  const [formEnvironment, setFormEnvironment] = useState('Production');
  const [formAssignees, setFormAssignees] = useState<string[]>([currentUser.id]);

  const canCreateTicket = hasPermission('can_create_tickets');
  const canDeploy = hasPermission('can_deploy_code');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || t.severity === severityFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesSeverity && matchesType;
  });

  const columns: { id: TicketStatus; labelAr: string; labelEn: string; color: string }[] = [
    { id: 'backlog', labelAr: 'قائمة الانتظار (Backlog)', labelEn: 'Backlog', color: 'border-slate-300' },
    { id: 'in_dev', labelAr: 'قيد التطوير (In Dev)', labelEn: 'In Development', color: 'border-indigo-400' },
    { id: 'testing', labelAr: 'فحص الجودة (Testing / QA)', labelEn: 'QA Testing', color: 'border-amber-400' },
    { id: 'deployed', labelAr: 'تم الإطلاق (Deployed)', labelEn: 'Production Ready', color: 'border-emerald-400' },
  ];

  const getSeverityBadge = (severity: TicketSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-700 flex items-center gap-1">🚨 حرج (Critical)</span>;
      case 'high':
        return <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">مرتفع (High)</span>;
      case 'medium':
        return <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">متوسط (Med)</span>;
      case 'low':
        return <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">بسيط (Low)</span>;
    }
  };

  const getTypeIcon = (type: TicketType) => {
    switch (type) {
      case 'bug':
        return <Bug className="h-3.5 w-3.5 text-rose-500" />;
      case 'feature':
        return <Sparkles className="h-3.5 w-3.5 text-indigo-600" />;
      case 'maintenance':
        return <Wrench className="h-3.5 w-3.5 text-amber-600" />;
      case 'infrastructure':
        return <Server className="h-3.5 w-3.5 text-purple-600" />;
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    addTicket({
      title: formTitle,
      description: formDesc,
      clientId: formClientId,
      projectId: formProjectId || projects.find((p) => p.clientId === formClientId)?.id || 'proj-1',
      severity: formSeverity,
      type: formType,
      status: 'backlog',
      assignedTo: formAssignees.length > 0 ? formAssignees : [currentUser.id],
      githubPR: formGithubPR || undefined,
      environment: formEnvironment,
    });

    setIsAddModalOpen(false);
    setFormTitle('');
    setFormDesc('');
    setFormGithubPR('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-600" />
            {language === 'ar' ? 'تذاكر الفريق التقني وسبرنت التطوير' : 'Technical Sprints & Tickets'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'إدارة الأعطال البرمجية (Bugs)، طلبات الميزات، وعمليات فحص واختبار الأنظمة ونشرها.'
              : 'Software bugs tracking, feature development pipelines, and QA deployment sprints.'}
          </p>
        </div>

        {canCreateTicket && (
          <button
            id="new-ticket-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'فتح تذكرة تقنية جديدة' : 'Open Ticket'}
          </button>
        )}
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث في التذاكر والأعطال...' : 'Search tickets & bugs...'}
            className={`w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity selector */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              {language === 'ar' ? 'الخطورة:' : 'Severity:'}
            </span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">{language === 'ar' ? 'كافة المستويات' : 'All'}</option>
              <option value="critical">🚨 حرج (Critical)</option>
              <option value="high">مرتفع (High)</option>
              <option value="medium">متوسط (Medium)</option>
              <option value="low">بسيط (Low)</option>
            </select>
          </div>

          {/* Type selector */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              {language === 'ar' ? 'النوع:' : 'Type:'}
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">{language === 'ar' ? 'الكل' : 'All Types'}</option>
              <option value="bug">خلل برمجي (Bug)</option>
              <option value="feature">ميزة جديدة (Feature)</option>
              <option value="maintenance">صيانة (Maintenance)</option>
              <option value="infrastructure">بنية تحتية (Infra)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SPRINT KANBAN COLUMNS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-start">
        {columns.map((col) => {
          const colTickets = filteredTickets.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-3 min-h-[520px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    col.id === 'backlog' ? 'bg-slate-400' :
                    col.id === 'in_dev' ? 'bg-indigo-600' :
                    col.id === 'testing' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <h3 className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? col.labelAr : col.labelEn}
                  </h3>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold text-slate-600 shadow-2xs border border-slate-200">
                  {colTickets.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTickets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    {language === 'ar' ? 'لا توجد تذاكر في هذه المرحلة' : 'No tickets here'}
                  </div>
                ) : (
                  colTickets.map((ticket) => {
                    const client = clients.find((c) => c.id === ticket.clientId);
                    const assignedUsers = users.filter((u) => ticket.assignedTo.includes(u.id));

                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md"
                      >
                        {/* Type & Severity */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                            {getTypeIcon(ticket.type)}
                            {ticket.type.toUpperCase()}
                          </span>
                          {getSeverityBadge(ticket.severity)}
                        </div>

                        {/* Client info */}
                        <p className="text-[11px] font-semibold text-emerald-800 truncate mb-1">
                          {client?.name.split(' ')[0]} {client?.name.split(' ')[1]}
                        </p>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                          {ticket.title}
                        </h4>

                        {/* Environment or PR */}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          {ticket.githubPR ? (
                            <span className="flex items-center gap-1 font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              <GitPullRequest className="h-3 w-3" />
                              {ticket.githubPR}
                            </span>
                          ) : (
                            <span className="text-slate-400">{ticket.environment}</span>
                          )}

                          {/* Assignees */}
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
                        </div>

                        {/* Stage Transition Buttons */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2 text-[10px]"
                        >
                          <span className="text-slate-400">{language === 'ar' ? 'المرحلة:' : 'Stage:'}</span>
                          <div className="flex items-center gap-1">
                            {col.id !== 'backlog' && (
                              <button
                                onClick={() => {
                                  const prev: Record<TicketStatus, TicketStatus> = {
                                    in_dev: 'backlog',
                                    testing: 'in_dev',
                                    deployed: 'testing',
                                    backlog: 'backlog',
                                  };
                                  updateTicketStatus(ticket.id, prev[col.id]);
                                }}
                                className="rounded px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                              >
                                {language === 'ar' ? 'رجوع' : 'Back'}
                              </button>
                            )}

                            {col.id !== 'deployed' && (
                              <button
                                onClick={() => {
                                  const next: Record<TicketStatus, TicketStatus> = {
                                    backlog: 'in_dev',
                                    in_dev: 'testing',
                                    testing: 'deployed',
                                    deployed: 'deployed',
                                  };
                                  updateTicketStatus(ticket.id, next[col.id]);
                                }}
                                className="rounded px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold"
                              >
                                {col.id === 'testing'
                                  ? (language === 'ar' ? 'إطلاق للإنتاج' : 'Deploy')
                                  : (language === 'ar' ? 'المرحلة التالية' : 'Next')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  {getTypeIcon(selectedTicket.type)}
                  <span className="text-xs font-bold text-slate-500 uppercase">{selectedTicket.type}</span>
                  {getSeverityBadge(selectedTicket.severity)}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTicket.title}</h3>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">{language === 'ar' ? 'تفاصيل المشكلة والحل المقترح:' : 'Description & Solution:'}</span>
                {selectedTicket.description}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 p-2.5">
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'البيئة المتأثرة' : 'Environment'}</span>
                  <span className="font-bold text-slate-800">{selectedTicket.environment}</span>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5">
                  <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'فرع Git / Pull Request' : 'Git Branch / PR'}</span>
                  <span className="font-bold text-indigo-600 font-mono">{selectedTicket.githubPR || 'None'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'الحالة الحالية:' : 'Status:'} <strong className="text-slate-800">{selectedTicket.status}</strong>
                </span>

                {canDeploy && selectedTicket.status !== 'deployed' && (
                  <button
                    onClick={() => {
                      updateTicketStatus(selectedTicket.id, 'deployed');
                      setSelectedTicket(null);
                    }}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {language === 'ar' ? 'تأكيد الإطلاق للإنتاج (Deploy)' : 'Deploy to Production'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Ticket Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'فتح تذكرة برمجية جديدة' : 'Create Tech Ticket'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'عنوان التذكرة أو وصف العطل *' : 'Ticket Summary *'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: فشل استدعاء Webhook عند نجاح الدفع"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'خطوات تكرار المشكلة أو المتطلبات التقنية' : 'Reproduction Steps / Acceptance Criteria'}
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="1. الخطوة الأولى... 2. النتيجة المتوقعة..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'النوع (Type)' : 'Type'}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="bug">خلل برمجي (Bug)</option>
                    <option value="feature">ميزة جديدة (Feature)</option>
                    <option value="maintenance">صيانة (Maintenance)</option>
                    <option value="infrastructure">بنية تحتية (Infrastructure)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'مستوى الخطورة (Severity)' : 'Severity'}
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="critical">🚨 حرج جداً (Critical)</option>
                    <option value="high">مرتفع (High)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="low">بسيط (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'العميل المستهدف' : 'Client'}
                  </label>
                  <select
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'البيئة (Environment)' : 'Environment'}
                  </label>
                  <input
                    type="text"
                    value={formEnvironment}
                    onChange={(e) => setFormEnvironment(e.target.value)}
                    placeholder="Production / Staging"
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'Git Branch / Pull Request (اختياري)' : 'Git Branch / PR'}
                </label>
                <input
                  type="text"
                  value={formGithubPR}
                  onChange={(e) => setFormGithubPR(e.target.value)}
                  placeholder="fix/webhook-retry"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none font-mono"
                />
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
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
                >
                  {language === 'ar' ? 'فتح التذكرة' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
