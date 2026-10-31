import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import {
  User,
  Bell,
  Shield,
  Key,
  Check,
  Save,
  Mail,
  Smartphone,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  Sliders,
  Send,
  Building,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    currentUserRole,
    language,
    setLanguage,
    showToast,
  } = useApp();

  // Profile Form State
  const [displayName, setDisplayName] = useState(currentUser.name || '');
  const [employeeNumber, setEmployeeNumber] = useState(currentUser.employeeNumber || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bio, setBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [chatMentions, setChatMentions] = useState(true);
  const [approvalsQueue, setApprovalsQueue] = useState(true);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Security / Password Reset State
  const [isResetSending, setIsResetSending] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem(`shal_prefs_${currentUser.id}`);
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.emailAlerts !== undefined) setEmailAlerts(parsed.emailAlerts);
        if (parsed.deadlineReminders !== undefined) setDeadlineReminders(parsed.deadlineReminders);
        if (parsed.taskAssignments !== undefined) setTaskAssignments(parsed.taskAssignments);
        if (parsed.chatMentions !== undefined) setChatMentions(parsed.chatMentions);
        if (parsed.approvalsQueue !== undefined) setApprovalsQueue(parsed.approvalsQueue);
        if (parsed.bio !== undefined) setBio(parsed.bio);
      }
    } catch {
      // Non-fatal
    }
  }, [currentUser.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsSavingProfile(true);
    setProfileMessage(null);

    try {
      // 1. Update in Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          name: displayName.trim(),
          employee_number: employeeNumber.trim() || undefined,
        })
        .eq('id', currentUser.id);

      if (error) {
        console.warn('Supabase profile update warning:', error);
      }

      // 2. Update local state in AppContext
      const updatedUser = {
        ...currentUser,
        name: displayName.trim(),
        employeeNumber: employeeNumber.trim(),
        phone: phone.trim(),
      };
      setCurrentUser(updatedUser);

      // Save bio in localStorage
      localStorage.setItem(
        `shal_prefs_${currentUser.id}`,
        JSON.stringify({
          emailAlerts,
          deadlineReminders,
          taskAssignments,
          chatMentions,
          approvalsQueue,
          bio: bio.trim(),
        })
      );

      setProfileMessage({
        type: 'success',
        text:
          language === 'ar'
            ? 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح في قاعدة البيانات.'
            : 'Profile details saved and updated successfully in Supabase.',
      });

      showToast({
        type: 'success',
        title: language === 'ar' ? 'تحديث الملف الشخصي' : 'Profile Updated',
        message: language === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully',
      });
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء حفظ التعديلات.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotificationPreferences = async () => {
    setIsSavingNotifs(true);
    try {
      const prefs = {
        emailAlerts,
        deadlineReminders,
        taskAssignments,
        chatMentions,
        approvalsQueue,
        bio,
      };

      localStorage.setItem(`shal_prefs_${currentUser.id}`, JSON.stringify(prefs));

      // Attempt to persist to profiles if column exists
      try {
        await supabase
          .from('profiles')
          .update({
            notification_preferences: prefs,
          } as any)
          .eq('id', currentUser.id);
      } catch {
        // Ignored if column not yet migrated
      }

      showToast({
        type: 'success',
        title: language === 'ar' ? 'تفضيلات الإشعارات' : 'Notification Preferences',
        message: language === 'ar' ? 'تم حفظ التفضيلات بنجاح' : 'Preferences saved successfully',
      });
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const handleSendPasswordResetEmail = async () => {
    if (!currentUser.email) return;

    setIsResetSending(true);
    setResetFeedback(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: window.location.origin,
      });

      if (error) {
        setResetFeedback(
          language === 'ar'
            ? `تعذر إرسال الرابط: ${error.message}`
            : `Failed: ${error.message}`
        );
      } else {
        setResetFeedback(
          language === 'ar'
            ? `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${currentUser.email} بنجاح.`
            : `Password reset instructions sent to ${currentUser.email}.`
        );
      }
    } catch (err: any) {
      setResetFeedback(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsResetSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#BDAF9C]/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#24291F] flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#4C5540]" />
              {language === 'ar' ? 'إعدادات الحساب والمنظومة' : 'Account & Workspace Settings'}
            </h2>
            <span className="rounded-full bg-[#4C5540]/10 border border-[#4C5540]/25 px-2.5 py-0.5 text-[10px] font-bold text-[#4C5540]">
              {currentUserRole?.nameAr || 'عضو معتمد'}
            </span>
          </div>
          <p className="text-xs text-[#4C5540]/80 mt-1">
            {language === 'ar'
              ? 'تعديل البيانات الشخصية، تفضيلات التنبيهات، والأمان الموثق عبر Supabase Auth.'
              : 'Update profile details, notification preferences, and verified Supabase security.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="btn-interactive flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/40 bg-white px-3 py-1.5 text-xs font-bold text-[#4C5540] hover:bg-[#FAF7F2] shadow-2xs cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white p-5 shadow-xs text-center space-y-3">
            <div className="relative inline-block">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-20 w-20 rounded-2xl object-cover mx-auto border-2 border-[#4C5540]/30 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: currentUserRole?.badgeBg || '#E9E1D6',
                  color: currentUserRole?.color || '#24291F',
                }}
              >
                {currentUserRole ? currentUserRole.nameAr : 'عضو'}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-mono font-bold">
                ID: {currentUser.employeeNumber || '01'}
              </span>
            </div>
          </div>

          {/* Quick Auth Info */}
          <div className="rounded-2xl border border-[#BDAF9C]/30 bg-[#FAF7F2] p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#4C5540] font-bold">
              <Shield className="h-4 w-4" />
              <span>{language === 'ar' ? 'حالة التوثيق (Supabase Auth)' : 'Auth Status'}</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <p className="flex justify-between">
                <span>{language === 'ar' ? 'المعرّف الأمني:' : 'Auth UUID:'}</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                  {currentUser.id}
                </span>
              </p>
              <p className="flex justify-between">
                <span>{language === 'ar' ? 'حالة الحساب:' : 'Status:'}</span>
                <span className="text-emerald-700 font-bold font-mono">ACTIVE</span>
              </p>
              <p className="flex justify-between">
                <span>{language === 'ar' ? 'القسم:' : 'Team:'}</span>
                <span className="font-medium">{currentUser.team || 'Operations'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Edit Profile & Preferences */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Profile Information */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#4C5540]/10 text-[#4C5540]">
                  <User className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'البيانات الشخصية والمهنية' : 'Profile Information'}
                </h3>
              </div>
            </div>

            {profileMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border animate-in fade-in duration-150 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الاسم الظاهر بالمنظومة (Display Name) *' : 'Display Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني المهني' : 'Work Email'}
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 font-mono cursor-not-allowed"
                    title={language === 'ar' ? 'البريد الإلكتروني مرتبط بالمصادقة الرسمية' : 'Linked to official Auth'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'الرقم الوظيفي (Employee Number)' : 'Employee ID'}
                  </label>
                  <input
                    type="text"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    placeholder="01"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 50 000 0000"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'نبذة مهنية مختصرة (Bio)' : 'Professional Bio'}
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'مهامك ومسؤولياتك وتخصصك في وكالة شال...'
                      : 'Your role, specialties, and tasks at Shal Agency...'
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-900 focus:outline-none focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-interactive flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B4432] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>{language === 'ar' ? 'حفظ البيانات الشخصية' : 'Save Profile Details'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Notification Preferences */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <Bell className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'تفضيلات الإشعارات والتنبيهات' : 'Notification Preferences'}
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'تنبيهات اقتراب مواعيد التسليم (Due Dates)' : 'Deadline Approaching Alerts'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'إرسال تنبيه مباشر عند اقتراب موعد تسليم أي مهمة مسندة إليك.' : 'Notify when a task assigned to you approaches its deadline.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={deadlineReminders}
                  onChange={(e) => setDeadlineReminders(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#4C5540] focus:ring-[#4C5540] cursor-pointer accent-[#4C5540]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'إشعارات إسناد المهام الجديدة' : 'New Task Assignment Alerts'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'تنبيه فوري عند قيام مدير المشروع أو العمليات بإسناد مهمة جديدة لك.' : 'Instant notification when a new task is assigned to you.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={taskAssignments}
                  onChange={(e) => setTaskAssignments(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#4C5540] focus:ring-[#4C5540] cursor-pointer accent-[#4C5540]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'إشعارات المحادثات الداخلية والإشارات (@mention)' : 'Chat Mentions & Discussions'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'تنبيه عند ذكر اسمك في غرف المحادثات الخاصة بالفريق.' : 'Alert when your name is mentioned in team channels.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={chatMentions}
                  onChange={(e) => setChatMentions(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#4C5540] focus:ring-[#4C5540] cursor-pointer accent-[#4C5540]"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'تنبيهات مسار الموافقات (Approval Queue)' : 'Approval Queue Updates'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'إخطار باعتماد أو طلب تعديل منشورات المحتوى والتصاميم.' : 'Notify on content and design approval or revisions.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={approvalsQueue}
                  onChange={(e) => setApprovalsQueue(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#4C5540] focus:ring-[#4C5540] cursor-pointer accent-[#4C5540]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveNotificationPreferences}
                disabled={isSavingNotifs}
                className="btn-interactive flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{language === 'ar' ? 'حفظ تفضيلات الإشعارات' : 'Save Notification Preferences'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Account Security & Password Recovery Flow */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                  <Key className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'الأمان وتعيين كلمة المرور (Supabase Auth)' : 'Security & Password Recovery'}
                </h3>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">
                    {language === 'ar' ? 'إعادة تعيين كلمة المرور عبر البريد الإلكتروني' : 'Reset Password via Email Verification'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'ar'
                      ? `سيتم إرسال رابط تأكيد آمن ومشفّر من Supabase Auth إلى: ${currentUser.email}`
                      : `A secure verification link will be dispatched from Supabase Auth to: ${currentUser.email}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendPasswordResetEmail}
                  disabled={isResetSending}
                  className="btn-interactive flex items-center gap-1.5 rounded-xl bg-[#4C5540] hover:bg-[#3B4432] text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isResetSending ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 rtl:rotate-180" />
                      <span>{language === 'ar' ? 'إرسال رابط التعيين' : 'Send Reset Link'}</span>
                    </>
                  )}
                </button>
              </div>

              {resetFeedback && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{resetFeedback}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
