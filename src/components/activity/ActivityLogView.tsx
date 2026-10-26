import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Filter, ShieldCheck, Download, Trash2 } from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { activityLogs, language } = useApp();
  const [search, setSearch] = useState('');

  const filteredLogs = activityLogs.filter((log) => {
    return (
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actionAr.toLowerCase().includes(search.toLowerCase()) ||
      log.entityName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600" />
            {language === 'ar' ? 'سجل العمليات والتدقيق (Activity & Audit Log)' : 'Activity & Audit Log'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'أرشيف كامل لكافة التغييرات والإجراءات التي تمت داخل المنظومة لضمان الشفافية والمسؤولية.'
              : 'Complete immutable audit trail of actions taken across the agency platform.'}
          </p>
        </div>

        <button
          onClick={() => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `agency-hub-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          {language === 'ar' ? 'تصدير السجل (JSON)' : 'Export Log'}
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'بحث في السجل بالمستخدم أو الإجراء...' : 'Search logs...'}
            className={`w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="relative border-slate-200 pl-4 pr-4 space-y-6">
          {filteredLogs.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              {language === 'ar' ? 'لا توجد سجلات تطابق البحث.' : 'No audit entries found.'}
            </p>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={log.id} className="relative flex items-start gap-4 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold shrink-0 border border-indigo-100 group-hover:scale-105 transition-transform">
                  {log.userName.slice(0, 1)}
                </div>

                <div className="flex-1 rounded-xl bg-slate-50/70 p-3.5 border border-slate-100 transition-colors group-hover:bg-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-xs text-slate-900">
                      <strong className="font-bold text-slate-950">{log.userName}</strong>{' '}
                      <span className="text-slate-600">{language === 'ar' ? log.actionAr : log.action}</span>{' '}
                      <span className="font-bold text-indigo-700">"{log.entityName}"</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.createdAt}</span>
                  </div>
                  {log.details && (
                    <p className="mt-1 text-[11px] text-slate-500 border-t border-slate-200/50 pt-1">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
