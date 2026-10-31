import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Trash2,
  RefreshCw,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpDown,
  Lock,
} from 'lucide-react';

interface AuditLogRecord {
  id: string;
  timestamp: string;
  created_at?: string;
  actor_id?: string;
  actor_email?: string;
  action_type: string;
  target_resource_id?: string;
  target_resource_type?: string;
  old_data?: any;
  new_data?: any;
}

export const ActivityLogView: React.FC = () => {
  const { activityLogs, language, currentUser, isAdminOrOwner, isOwner } = useApp();

  const [dbLogs, setDbLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'users' | 'deletions' | 'status'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: sortOrder === 'asc' });

      if (error) {
        console.warn('Could not fetch audit_logs from Supabase:', error.message);
        // Fallback to initial activityLogs
        const mappedFromContext: AuditLogRecord[] = (activityLogs || []).map((l) => ({
          id: l.id,
          timestamp: l.createdAt || new Date().toISOString(),
          actor_id: l.userId,
          actor_email: l.userName,
          action_type: l.action,
          target_resource_id: l.entityId,
          target_resource_type: l.entityType,
          new_data: l.details ? { detail: l.details, entityName: l.entityName } : undefined,
        }));
        setDbLogs(mappedFromContext);
      } else if (data && data.length > 0) {
        setDbLogs(data);
      } else {
        // Fallback if table exists but empty
        const mappedFromContext: AuditLogRecord[] = (activityLogs || []).map((l) => ({
          id: l.id,
          timestamp: l.createdAt || new Date().toISOString(),
          actor_id: l.userId,
          actor_email: l.userName,
          action_type: l.action,
          target_resource_id: l.entityId,
          target_resource_type: l.entityType,
          new_data: l.details ? { detail: l.details, entityName: l.entityName } : undefined,
        }));
        setDbLogs(mappedFromContext);
      }
    } catch (err) {
      console.error('Audit log query exception:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sortOrder, activityLogs]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Filter logs by action category
  const filteredLogs = dbLogs.filter((log) => {
    // Action category filter
    if (filterType === 'users') {
      const isUserAction =
        log.action_type.includes('user.') ||
        log.action_type.includes('role') ||
        log.target_resource_type === 'profile';
      if (!isUserAction) return false;
    } else if (filterType === 'deletions') {
      const isDeletion =
        log.action_type.includes('delete') ||
        log.action_type.includes('deleted') ||
        log.action_type.includes('حذف');
      if (!isDeletion) return false;
    } else if (filterType === 'status') {
      const isStatus =
        log.action_type.includes('status') ||
        log.action_type.includes('approval') ||
        log.action_type.includes('approved') ||
        log.action_type.includes('updated');
      if (!isStatus) return false;
    }

    // Search query
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const actorMatch = (log.actor_email || '').toLowerCase().includes(q);
    const actionMatch = (log.action_type || '').toLowerCase().includes(q);
    const resourceMatch = (log.target_resource_type || '').toLowerCase().includes(q);
    const idMatch = (log.target_resource_id || '').toLowerCase().includes(q);
    const dataMatch = JSON.stringify(log.new_data || {}).toLowerCase().includes(q);

    return actorMatch || actionMatch || resourceMatch || idMatch || dataMatch;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('delete')) {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: '🗑️',
        label: language === 'ar' ? 'حذف أمني' : 'Deletion',
      };
    }
    if (action.includes('user.created')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: '👤',
        label: language === 'ar' ? 'إنشاء حساب' : 'User Created',
      };
    }
    if (action.includes('password')) {
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: '🔑',
        label: language === 'ar' ? 'كلمة المرور' : 'Password Reset',
      };
    }
    if (action.includes('role')) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: '👑',
        label: language === 'ar' ? 'تعديل الصلاحيات' : 'Role Update',
      };
    }
    return {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: '⚡',
      label: language === 'ar' ? 'إجراء نظام' : 'System Event',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#BDAF9C]/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#24291F] flex items-center gap-2">
              <History className="h-5 w-5 text-[#4C5540]" />
              {language === 'ar'
                ? 'سجل التدقيق الأمني والعمليات (Supabase Audit Logs)'
                : 'Security Audit & Activity Trail'}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PostgreSQL RLS
            </span>
          </div>
          <p className="text-xs text-[#4C5540]/80 mt-1">
            {language === 'ar'
              ? 'سجل مركزي مشفّر ومحمي بـ Triggers يوثّق كافة إجراءات المستخدمين، عمليات الحذف، وتحديث الحالات مرتبة تنازلياً.'
              : 'Immutable PostgreSQL audit trail tracking user provisioning, deletions, and role updates ordered by date.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="btn-interactive flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white px-3 py-1.5 text-xs font-bold text-[#4C5540] hover:bg-[#FAF7F2] shadow-2xs cursor-pointer disabled:opacity-50"
            title={language === 'ar' ? 'تحديث السجل من Supabase' : 'Refresh from Supabase'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `shal-audit-logs-${new Date().toISOString().slice(0, 10)}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="btn-interactive flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#3B4432] cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{language === 'ar' ? 'تصدير (JSON)' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#4C5540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'ar' ? 'كافة السجلات' : 'All Events'} ({dbLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('users')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterType === 'users'
                ? 'bg-[#4C5540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'ar' ? 'إجراءات المستخدمين' : 'User Actions'}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('deletions')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterType === 'deletions'
                ? 'bg-[#4C5540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'ar' ? 'عمليات الحذف' : 'Deletions'}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('status')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterType === 'status'
                ? 'bg-[#4C5540] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'ar' ? 'تحديث الحالات' : 'Status Updates'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالبريد أو المعرف...' : 'Search logs...'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 ps-9 pe-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#4C5540]"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="btn-interactive flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            title={language === 'ar' ? 'ترتيب زمني' : 'Sort Date'}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase font-mono">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table / Stream */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="h-7 w-7 border-2 border-[#4C5540] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">
              {language === 'ar' ? 'جاري تحميل سجل التدقيق من Supabase...' : 'Loading audit logs from Supabase...'}
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <History className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">
              {language === 'ar' ? 'لا توجد سجلات مطابقة للبحث' : 'No audit entries found'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'ar' ? 'تأكد من تطبيق الفلاتر المناسبة أو تنفيذ العمليات في المنظومة.' : 'Perform user actions or task modifications to generate audit records.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action_type);
              const isExpanded = expandedLogId === log.id;
              const formattedDate = new Date(log.timestamp).toLocaleString(
                language === 'ar' ? 'ar-EG' : 'en-US',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }
              );

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-sm shrink-0 border border-slate-200">
                        {badge.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">
                            {log.actor_email || log.actor_id || 'System'}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${badge.bg}`}
                          >
                            {log.action_type}
                          </span>
                          {log.target_resource_type && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-mono font-bold text-slate-600">
                              {log.target_resource_type}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-1">
                          {log.new_data?.detail || log.new_data?.entityName ? (
                            <>
                              <span className="font-semibold">{log.new_data?.entityName || ''}</span>{' '}
                              <span className="text-slate-500">{log.new_data?.detail || ''}</span>
                            </>
                          ) : (
                            <span className="font-mono text-[11px] text-slate-500">
                              Target ID: {log.target_resource_id || 'N/A'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="font-mono text-[10px] text-slate-400">
                        {formattedDate}
                      </span>
                      {(log.new_data || log.old_data) && (
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          {isExpanded ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'التفاصيل' : 'Details')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON Details Payload */}
                  {isExpanded && (
                    <div className="mt-2 rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto shadow-inner border border-slate-800 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-slate-400 pb-1 mb-1 border-b border-slate-800 text-[10px]">
                        <span>RAW AUDIT PAYLOAD (JSON)</span>
                        <span>UUID: {log.id}</span>
                      </div>
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(
                          {
                            action_type: log.action_type,
                            actor: log.actor_email,
                            target_resource_id: log.target_resource_id,
                            target_resource_type: log.target_resource_type,
                            timestamp: log.timestamp,
                            new_data: log.new_data,
                            old_data: log.old_data,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
