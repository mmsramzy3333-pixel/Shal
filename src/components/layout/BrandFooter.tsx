import React, { useState } from 'react';
import { ShieldCheck, Award, Copy, Check, X, Sparkles, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import { ShalLogo } from '../common/ShalLogo';

interface BrandFooterProps {
  className?: string;
  isFloating?: boolean;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ className = '', isFloating = false }) => {
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const verificationHash = 'SHA256: 4214-1C6E-5955-4A16-87F8-SHAL-AGENCY-2024';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(verificationHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Sleek, Non-intrusive Brand Footer */}
      <footer
        className={`w-full border-t border-[#BDAF9C]/35 bg-[#FAF7F2]/95 backdrop-blur-md py-2.5 px-4 sm:px-6 transition-all duration-300 z-30 select-none ${
          isFloating ? 'sticky bottom-0 shadow-xs' : ''
        } ${className}`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          {/* Copyright & Brand Identity */}
          <div className="flex items-center gap-2 text-slate-600">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4C5540]/15 text-[#4C5540]">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span className="font-bold text-[#24291F] tracking-wide">
              Shal Agency © 2024 - جميع الحقوق محفوظة
            </span>
            <span className="hidden sm:inline-block text-slate-300">|</span>
            <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
              المنظومة الرقمية الموحدة لإدارة الوكالات
            </span>
          </div>

          {/* Intellectual Property & Ownership Verification Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCertificateOpen(true)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#4C5540]/30 bg-white/80 px-3 py-1 text-[11px] font-bold text-[#4C5540] shadow-2xs hover:border-[#4C5540] hover:bg-[#4C5540] hover:text-white transition-all cursor-pointer"
              title="عرض وثيقة وتوثيق الملكية الفكرية والحقوق الرقمية"
            >
              <Award className="h-3.5 w-3.5 text-amber-600 group-hover:text-amber-300 transition-colors" />
              <span>توثيق ملكية المشروع</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60">
              v3.8.4 ENT
            </span>
          </div>
        </div>
      </footer>

      {/* Official Project Ownership & Intellectual Property Modal */}
      {isCertificateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#BDAF9C]/50 bg-[#FAF7F2] p-6 sm:p-7 shadow-2xl text-[#24291F]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsCertificateOpen(false)}
              className="absolute top-4 end-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-[#BDAF9C]/30 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4C5540] text-amber-300 shadow-md">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-[#24291F]">
                    وثيقة الملكية الفكرية والتوثيق البرمجي
                  </h3>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-200">
                    معتمد ورسمي
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Shal Agency OS | Intellectual Property & Trademark Verification
                </p>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="mt-5 space-y-4 text-xs">
              {/* Highlight Card */}
              <div className="rounded-2xl border border-amber-300/60 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      اسم المشروع والمنظومة
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">
                      نظام وكالة شال المتكامل (Shal Agency Enterprise OS)
                    </h4>
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-amber-200/50">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الجهة المالكة والمؤسسة:</span>
                    <strong className="text-slate-800 font-bold">وكالة شال للدعاية والتسويق</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الفاوندر والمدير العام:</span>
                    <strong className="text-slate-800 font-bold">م. مدحت نضال (Mahmoud Medhat)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الإدارة التنفيذية والشريك المؤسس:</span>
                    <strong className="text-slate-800 font-bold">م. رمزي (M. Ramzy)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">نوع الترخيص والحقوق:</span>
                    <strong className="text-emerald-700 font-bold">ملكية فكرية وتجارية خاصة (2024 - 2026)</strong>
                  </div>
                </div>
              </div>

              {/* Protection & Anti-tamper statement */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <Lock className="h-4 w-4 text-[#4C5540]" />
                  <span>بيان حماية الحقوق وبصمة الكود (Copyright Statement)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  تم تصميم وهندسة وتطوير هذا النظام وقواعد بياناته ومصفوفة الصلاحيات (RBAC) حصرياً لصالح <strong>وكالة شال (Shal Agency)</strong>. 
                  تظل الحقوق والتوثيق البرمجي الرقمي سارية ومسجلة باسم الوكالة ومؤسسها مهما تمت عمليات إعادة البرمجة أو التفريع (Remixing / Forking) لأي جزء من الكود.
                </p>
              </div>

              {/* Digital Hash / Signature Verification */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FileCode className="h-3 w-3" />
                    البصمة المشفرة للتوثيق (Verification Fingerprint)
                  </span>
                  {copied && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> تم النسخ
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5">
                  <code className="text-[10px] font-mono font-bold text-[#4C5540] truncate">
                    {verificationHash}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="نسخ البصمة الرقمية للتوثيق"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#BDAF9C]/30 pt-4">
              <button
                type="button"
                onClick={() => setIsCertificateOpen(false)}
                className="btn-shal-primary px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق الوثيقة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
