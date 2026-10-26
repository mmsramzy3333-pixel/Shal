import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, language } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className={`fixed top-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0 ${
        language === 'ar' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
      }`}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isInfo = toast.type === 'info';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
              isSuccess
                ? 'bg-slate-900 border-emerald-500/50 text-white shadow-emerald-950/20'
                : isWarning
                ? 'bg-amber-950/95 border-amber-500/50 text-amber-100 shadow-amber-950/20'
                : isError
                ? 'bg-rose-950/95 border-rose-500/50 text-rose-100 shadow-rose-950/20'
                : 'bg-[#0b0f4a] border-[#1b24f5]/50 text-white shadow-[#1b24f5]/20'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {isInfo && <Info className="h-5 w-5 text-[#b5f812]" />}
              {isWarning && <AlertTriangle className="h-5 w-5 text-amber-400" />}
              {isError && <AlertCircle className="h-5 w-5 text-rose-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold leading-tight truncate">
                  {toast.title}
                </h4>
                {toast.timestamp && (
                  <span className="text-[10px] text-white/50 shrink-0 font-mono">
                    {toast.timestamp}
                  </span>
                )}
              </div>
              <p className="text-[11px] mt-1 text-white/80 leading-snug line-clamp-2">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="إغلاق"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
