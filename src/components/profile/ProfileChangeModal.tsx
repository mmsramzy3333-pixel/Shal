import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Camera,
  Check,
  Send,
  UserCheck,
} from 'lucide-react';

interface ProfileChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  '/assets/aistudio/Artboard_6_67181bbc.png',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

export const ProfileChangeModal: React.FC<ProfileChangeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    currentUserRole,
    submitProfileChangeRequest,
    profileRequests,
    approveProfileChangeRequest,
    rejectProfileChangeRequest,
    hasPermission,
    language,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'my_request' | 'admin_approvals'>('my_request');
  const [requestedName, setRequestedName] = useState(currentUser.name);
  const [requestedAvatar, setRequestedAvatar] = useState(currentUser.avatar);
  const [reason, setReason] = useState('');
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  if (!isOpen) return null;

  const canApprove = hasPermission('can_approve_profile_changes');
  const myPendingRequest = profileRequests.find(
    (r) => r.userId === currentUser.id && r.status === 'pending'
  );
  const myPastRequests = profileRequests.filter(
    (r) => r.userId === currentUser.id && r.status !== 'pending'
  );
  const allPendingRequests = profileRequests.filter((r) => r.status === 'pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedName.trim()) return;
    submitProfileChangeRequest(requestedName, requestedAvatar, reason);
    setReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectionModalId) return;
    const fallbackReason = language === 'ar' ? 'تم الرفض بواسطة الإدارة لعدم استيفاء الشروط المعتمدة' : 'Rejected by management';
    rejectProfileChangeRequest(rejectionModalId, rejectionReasonInput.trim() || fallbackReason);
    setRejectionModalId(null);
    setRejectionReasonInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {language === 'ar' ? 'الملف الشخصي وطلب تعديل البيانات' : 'Profile & Edit Request'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'يتم تطبيق تعديل الاسم أو الصورة بعد تأكيد وموافقة الإدارة'
                  : 'Changes require admin approval before being applied'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector if Admin / Founder */}
        {canApprove && (
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
            <button
              onClick={() => setActiveSubTab('my_request')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                activeSubTab === 'my_request'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'ar' ? 'طلب تعديل ملفي' : 'My Profile Request'}
            </button>
            <button
              onClick={() => setActiveSubTab('admin_approvals')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeSubTab === 'admin_approvals'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{language === 'ar' ? 'مركز موافقات الإدارة' : 'Admin Approvals Queue'}</span>
              {allPendingRequests.length > 0 && (
                <span className="rounded-full bg-amber-500 text-white px-2 py-0.2 text-[10px] font-black">
                  {allPendingRequests.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeSubTab === 'my_request' ? (
            <>
              {/* Current Status Card */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</h4>
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: currentUserRole?.badgeBg || '#E2E8F0',
                        color: currentUserRole?.color || '#0F172A',
                      }}
                    >
                      {currentUserRole?.nameAr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-600" />
                    <span>
                      {language === 'ar'
                        ? 'الصورة والاسم مؤقتان حالياً، يمكنك طلب التغيير أدناه'
                        : 'Currently using temporary name & Shal logo avatar'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Pending Request Alert */}
              {myPendingRequest && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 flex-1">
                      <p className="font-bold text-amber-950">
                        {language === 'ar'
                          ? 'لديك طلب قيد المراجعة حالياً لدى الإدارة'
                          : 'You have a pending request awaiting admin approval'}
                      </p>
                      <p className="mt-1 text-slate-700">
                        {language === 'ar' ? 'الاسم المطلوب: ' : 'Requested name: '}
                        <strong className="text-slate-900">{myPendingRequest.requestedName}</strong>
                      </p>
                      {myPendingRequest.reason && (
                        <p className="mt-0.5 text-slate-600">
                          {language === 'ar' ? 'السبب: ' : 'Note: '} {myPendingRequest.reason}
                        </p>
                      )}
                      <p className="mt-2 text-[10px] text-amber-700">
                        {language === 'ar'
                          ? '⏳ سيتم تحديث ملفك تلقائياً فور موافقة الفاوندر أو مدير العمليات.'
                          : 'Your profile will auto-update upon confirmation from management.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Request Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'الاسم الجديد المطلوب' : 'New Requested Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={requestedName}
                    onChange={(e) => setRequestedName(e.target.value)}
                    placeholder="مثال: محمود الشامي أو اسمك المهني"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'اختر صورة شخصية جديدة أو أدخل رابط' : 'Choose New Avatar or URL'}
                  </label>
                  
                  {/* Preset Avatars Grid */}
                  <div className="grid grid-cols-6 gap-2 mb-2.5">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setRequestedAvatar(url)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                          requestedAvatar === url
                            ? 'border-[#2563EB] shadow-md ring-2 ring-blue-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                        {requestedAvatar === url && (
                          <div className="absolute inset-0 bg-[#2563EB]/30 flex items-center justify-center text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    value={requestedAvatar}
                    onChange={(e) => setRequestedAvatar(e.target.value)}
                    placeholder="رابط صورة مخصصة (URL)..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'ملاحظة أو سبب التعديل للإدارة (اختياري)' : 'Note for Management (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="مثال: تسجيل اسمي الرسمي في فريق العمل..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full btn-shal-primary py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{language === 'ar' ? 'إرسال طلب التعديل للإدارة' : 'Submit Request for Approval'}</span>
                  </button>
                </div>
              </form>

              {/* Past Requests History */}
              {myPastRequests.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-slate-700 mb-2">
                    {language === 'ar' ? 'سجل الطلبات السابقة' : 'Past Requests'}
                  </h5>
                  <div className="space-y-2">
                    {myPastRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{req.requestedName}</p>
                          <p className="text-[10px] text-slate-400">{req.requestedAt}</p>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {req.status === 'approved'
                            ? (language === 'ar' ? 'تمت الموافقة' : 'Approved')
                            : (language === 'ar' ? `مرفوض: ${req.rejectionReason || ''}` : 'Rejected')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Admin Approvals Queue Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'طلبات تعديل الأسماء والصور المعلقة' : 'Pending Profile Update Requests'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar'
                      ? 'لا يتم تفعيل أي تعديل على حساب الموظف إلا بعد اعتمادك وموافقتك هنا.'
                      : 'No employee profile changes take effect without your approval.'}
                  </p>
                </div>
                <span className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-xs font-bold text-[#2563EB]">
                  {allPendingRequests.length} {language === 'ar' ? 'طلبات بانتظارك' : 'pending'}
                </span>
              </div>

              {allPendingRequests.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 mt-2">
                    {language === 'ar' ? 'لا توجد طلبات معلقة حالياً' : 'All requests reviewed'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {language === 'ar' ? 'كافة طلبات الموظفين تم البت فيها' : 'Great job! Queue is clean.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allPendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2563EB]">{req.userRoleName}</span>
                        <span className="text-slate-400 text-[10px]">{req.requestedAt}</span>
                      </div>

                      {/* Visual Comparison: Current vs Requested */}
                      <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={req.currentAvatar}
                            alt="Current"
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block">
                              {language === 'ar' ? 'الحالي (المؤقت):' : 'Current:'}
                            </span>
                            <span className="font-medium text-slate-700 truncate block max-w-[130px]">
                              {req.currentName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border-r border-slate-200 pr-2">
                          <img
                            src={req.requestedAvatar || req.currentAvatar}
                            alt="Requested"
                            className="h-10 w-10 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                          />
                          <div>
                            <span className="text-[9px] font-bold text-emerald-600 block">
                              {language === 'ar' ? 'الجديد المطلوب:' : 'Requested:'}
                            </span>
                            <span className="font-bold text-slate-900 truncate block max-w-[130px]">
                              {req.requestedName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {req.reason && (
                        <p className="text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                          <strong>{language === 'ar' ? 'ملاحظة الموظف: ' : 'Note: '}</strong>
                          {req.reason}
                        </p>
                      )}

                      {/* Approval & Reject Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectionModalId(req.id);
                            setRejectionReasonInput('');
                          }}
                          className="btn-interactive px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          {language === 'ar' ? 'رفض الطلب' : 'Reject'}
                        </button>
                        <button
                          type="button"
                          onClick={() => approveProfileChangeRequest(req.id)}
                          className="btn-shal-primary py-1.5 px-3.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>{language === 'ar' ? 'موافقة واعتماد التعديل' : 'Approve & Apply'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rejection Note Prompt Modal */}
        {rejectionModalId && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-20 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-rose-100 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                  <h5 className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'سبب رفض طلب تعديل الملف الشخصي' : 'Reason for Profile Rejection'}
                  </h5>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectionModalId(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Preset Quick Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">
                  {language === 'ar' ? 'أسباب شائعة جاهزة للرفض:' : 'Quick preset rejection reasons:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    'الصورة المرفوعة غير رسمية أو غير واضحة',
                    'الاسم لا يطابق الهوية الوظيفية المعتمدة',
                    'يرجى مراجعة إدارة العمليات',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReasonInput(preset)}
                      className="btn-interactive text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب ملاحظتك للموظف (أو اختر سبباً أعلاه)...' : 'Write note for the employee...'}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
              />

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectionModalId(null)}
                  className="btn-interactive px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="btn-interactive px-4 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-sm"
                >
                  {language === 'ar' ? 'تأكيد الرفض والإخطار' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
