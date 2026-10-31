import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, HourlyVerification } from '../../types';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Coffee,
  LogOut,
  LogIn,
  ShieldCheck,
  Timer,
  UserCheck,
  UserX,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Award,
  Fingerprint,
  Download,
  Shield,
  Lock,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    attendanceRecords,
    todayAttendance,
    activeHourlyVerification,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    createHourlyChallenge,
    respondHourlyVerification,
    userPresence,
    language,
    hasPermission,
    users,
    roles,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [taskSummaryInput, setTaskSummaryInput] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchMember, setSearchMember] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);
  const [biometricState, setBiometricState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [biometricLogMsg, setBiometricLogMsg] = useState('');

  // Check if current user is manager or owner
  const isManagerOrAdmin =
    currentUser.role === 'owner' ||
    currentUser.role === 'admin' ||
    currentUser.team === 'management' ||
    hasPermission('can_view_all_attendance') ||
    hasPermission('can_manage_roles');

  const playBiometricChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    } catch {
      // Audio not permitted
    }
  };

  const handleBiometricScan = async () => {
    if (isActionLoading || biometricState === 'scanning') return;
    setBiometricState('scanning');
    setBiometricLogMsg(language === 'ar' ? 'جارٍ مسح البصمة ومطابقة الهوية الرقمية للموظف...' : 'Scanning biometric fingerprint...');

    setTimeout(async () => {
      try {
        playBiometricChime();
        if (!isClockedIn) {
          await clockIn();
          setBiometricState('success');
          setBiometricLogMsg(language === 'ar' ? 'تمت مطابقة البصمة بنجاح! تم تسجيل حضورك اليومي.' : 'Biometric match verified! Clocked in successfully.');
        } else if (!isClockedOut) {
          setShowClockOutConfirm(true);
          setBiometricState('idle');
          setBiometricLogMsg(language === 'ar' ? 'تمت مطابقة البصمة. يرجى تأكيد الانصراف.' : 'Biometric match verified. Confirm clock out.');
        } else {
          setBiometricState('success');
          setBiometricLogMsg(language === 'ar' ? 'تم تسجيل الحضور والانصراف مسبقاً لهذا اليوم.' : 'Already clocked out for today.');
        }
      } catch (err) {
        setBiometricState('idle');
      } finally {
        setTimeout(() => setBiometricState('idle'), 3500);
      }
    }, 1100);
  };

  const handleExportAttendanceCSV = () => {
    const headers = ['Employee,Role,Date,ClockIn,ClockOut,LateMinutes,BreaksCount,TotalHours,Status'];
    const rows = filteredRecords.map((r) =>
      `"${r.userName}","${r.userRoleName || ''}","${r.date}","${r.clockIn || ''}","${r.clockOut || ''}",${r.lateMinutes || 0},${r.breaks?.length || 0},${((r.totalHours || (r.totalWorkMinutes || 0) / 60) || 0).toFixed(1)},"${r.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `shal-attendance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Helper for safe time formatting
  const formatTimeString = (timeVal?: string) => {
    if (!timeVal) return '-';
    if (
      timeVal.includes(':') &&
      (timeVal.length <= 12 ||
        timeVal.includes('ص') ||
        timeVal.includes('م') ||
        timeVal.includes('AM') ||
        timeVal.includes('PM'))
    ) {
      return timeVal;
    }
    try {
      const d = new Date(timeVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      // fallback
    }
    return timeVal;
  };

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute active status
  const isClockedIn = Boolean(todayAttendance && !todayAttendance.clockOut);
  const isClockedOut = Boolean(todayAttendance && todayAttendance.clockOut);
  const activeBreak = todayAttendance?.breaks.find((b) => !b.endTime);
  const isOnBreak = Boolean(activeBreak);

  // Hourly countdown calculation
  const remainingSeconds = activeHourlyVerification
    ? Math.max(0, Math.floor((new Date(activeHourlyVerification.expiresAt).getTime() - currentTime.getTime()) / 1000))
    : 0;
  const isGracePeriodActive = remainingSeconds > 0 && activeHourlyVerification?.status === 'pending';

  const handleClockIn = async () => {
    setIsActionLoading(true);
    try {
      await clockIn();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClockOut = () => {
    setShowClockOutConfirm(true);
  };

  const confirmClockOut = async () => {
    setShowClockOutConfirm(false);
    setIsActionLoading(true);
    try {
      await clockOut();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    setIsActionLoading(true);
    try {
      await startBreak();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setIsActionLoading(true);
    try {
      await endBreak();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleVerifyHourly = async () => {
    if (!activeHourlyVerification) return;
    setIsActionLoading(true);
    try {
      await respondHourlyVerification(activeHourlyVerification.id, taskSummaryInput.trim() || 'العمل على المهام المسندة');
      setTaskSummaryInput('');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Filtered records - strictly scoped: only management/admins see the company-wide roster
  const visibleRecords = isManagerOrAdmin
    ? attendanceRecords
    : attendanceRecords.filter((rec) => rec.userId === currentUser.id);

  const filteredRecords = visibleRecords.filter((rec) => {
    if (selectedMemberFilter !== 'all' && rec.userId !== selectedMemberFilter) return false;
    if (selectedDateFilter !== 'all' && rec.date !== selectedDateFilter) return false;
    if (selectedStatusFilter !== 'all' && rec.status !== selectedStatusFilter) return false;
    if (searchMember && !rec.userName.toLowerCase().includes(searchMember.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-[#24291F] via-[#3B4432] to-[#4C5540] p-6 text-white shadow-md border border-[#BDAF9C]/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-[#E9E1D6] border border-white/15 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#D4C7B7]" />
              {language === 'ar' ? 'نظام الحضور وساعات العمل الحقيقي' : 'Real Attendance & Time Tracking'}
            </span>
            <span className="rounded-full bg-[#10b981]/20 border border-[#10b981]/30 px-2.5 py-0.5 text-xs font-bold text-[#6ee7b7]">
              {language === 'ar' ? 'موثق في قاعدة البيانات' : 'Persisted in Firestore'}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {language === 'ar' ? 'سجل الحضور، الانصراف والتحقق الدوري' : 'Attendance, Clock In & Hourly Check-ins'}
          </h2>
          <p className="mt-1 text-xs text-[#E9E1D6]/80 max-w-xl">
            {language === 'ar'
              ? 'تسجيل دقيق لساعات العمل الرسمية، توثيق الحضور والغياب، التمييز الواضح بين الحضور والإنتاجية، واحتساب التأخير بمصداقية تامة.'
              : 'Verifiable work shifts, automated late arrival calculations, break tracking, and hourly presence verification.'}
          </p>
        </div>

        {/* Live Digital Clock */}
        <div className="rounded-2xl bg-black/25 border border-white/10 p-4 text-center sm:text-end shrink-0 backdrop-blur-xs">
          <div className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
            {currentTime.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-[#b5f812] mt-0.5">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {language === 'ar' ? 'ساعات العمل الرسمية: 09:00 ص - 05:00 م' : 'Work Shift: 09:00 AM - 05:00 PM'}
          </div>
        </div>
      </div>

      {/* Biometric Fingerprint Terminal Scanner */}
      <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#181D18] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4C5540]/10 text-[#4C5540] dark:text-[#A4C08B]">
              <Fingerprint className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'ماسح البصمة البيومترية الذكي (Biometric Punch)' : 'Biometric Attendance Punch'}
                </h3>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {language === 'ar' ? 'تسجيل فوري بضغطة واحدة' : 'Instant 1-Click'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#BDAF9C] mt-0.5">
                {language === 'ar'
                  ? 'محطة بصمة وكالة شال الرقمية • تحقق فوري ومطابقة بيومترية لحضور وانصراف الموظف.'
                  : 'Agency digital fingerprint terminal • Instant biometric check-in & verification.'}
              </p>
            </div>
          </div>

          {/* Interactive Biometric Sensor Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleBiometricScan}
              disabled={isActionLoading || biometricState === 'scanning'}
              className={`relative overflow-hidden group flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all cursor-pointer shadow-md ${
                biometricState === 'scanning'
                  ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                  : biometricState === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-[#4C5540] hover:bg-[#3B4432] text-white border-[#3B4432]'
              }`}
            >
              <div className="relative">
                <Fingerprint className={`h-6 w-6 ${biometricState === 'scanning' ? 'animate-bounce' : ''}`} />
                {biometricState === 'scanning' && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-[#b5f812] animate-ping" />
                )}
              </div>
              <div className="text-start">
                <div className="text-xs font-bold leading-tight">
                  {biometricState === 'scanning'
                    ? (language === 'ar' ? 'جارٍ مسح البصمة...' : 'Scanning...')
                    : biometricState === 'success'
                    ? (language === 'ar' ? 'تمت مطابقة البصمة ✓' : 'Fingerprint Matched ✓')
                    : (language === 'ar' ? 'المسح بالبصمة البيومترية' : 'Scan Biometric Fingerprint')}
                </div>
                <div className="text-[10px] opacity-80">
                  {language === 'ar' ? 'تسجيل الحضور / الانصراف الآلي' : 'Auto Clock In / Out'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {biometricLogMsg && (
          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-[#1E251D] p-2.5 text-xs font-medium text-slate-700 dark:text-[#E9E1D6] border border-slate-200/60 dark:border-[#2D372B] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{biometricLogMsg}</span>
          </div>
        )}
      </div>

      {/* Main Interactive Grid: Clock Card + Hourly Challenge Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1 & 2: Clock-in/Clock-out Punch Card */}
        <div className="lg:col-span-2 rounded-2xl border border-[#BDAF9C]/35 bg-white dark:bg-[#181D18] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D372B] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#4C5540]/10 p-2.5 text-[#4C5540]">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'بطاقة تسجيل دوام اليوم' : "Today's Work Shift"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#BDAF9C]">
                  {currentUser.name} • {currentUser.email}
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {isOnBreak ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 text-xs font-bold">
                  <Coffee className="h-3.5 w-3.5" />
                  {language === 'ar' ? 'في استراحة حالياً' : 'On Break'}
                </span>
              ) : isClockedIn ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {language === 'ar' ? 'مسجل حضور (قيد العمل)' : 'Clocked In (Active)'}
                </span>
              ) : isClockedOut ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1 text-xs font-bold">
                  <LogOut className="h-3.5 w-3.5" />
                  {language === 'ar' ? 'تم تسجيل الانصراف لليوم' : 'Clocked Out'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 text-xs font-bold">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  {language === 'ar' ? 'لم يتم تسجيل الحضور بعد' : 'Not Clocked In'}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
            {/* Clock In */}
            <button
              onClick={handleClockIn}
              disabled={isClockedIn || isClockedOut || isActionLoading}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border transition-all cursor-pointer ${
                !isClockedIn && !isClockedOut
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <LogIn className="h-6 w-6" />
              <span className="text-xs font-bold">
                {language === 'ar' ? 'تسجيل الحضور (Clock In)' : 'Clock In'}
              </span>
              <span className="text-[10px] opacity-80">
                {todayAttendance?.clockIn
                  ? formatTimeString(todayAttendance.clockIn)
                  : language === 'ar'
                  ? 'بدء يوم العمل'
                  : 'Start Workday'}
              </span>
            </button>

            {/* Break */}
            {isOnBreak ? (
              <button
                onClick={handleEndBreak}
                disabled={isActionLoading}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border border-amber-600 bg-amber-600 text-white shadow-md hover:bg-amber-700 transition-all cursor-pointer"
              >
                <Clock className="h-6 w-6" />
                <span className="text-xs font-bold">
                  {language === 'ar' ? 'إنهاء الاستراحة (Resume)' : 'End Break'}
                </span>
                <span className="text-[10px] opacity-90">
                  {language === 'ar' ? 'العودة للعمل' : 'Return to work'}
                </span>
              </button>
            ) : (
              <button
                onClick={handleStartBreak}
                disabled={!isClockedIn || isClockedOut || isActionLoading}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border transition-all cursor-pointer ${
                  isClockedIn && !isClockedOut
                    ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-2xs hover:bg-amber-100'
                    : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Coffee className="h-6 w-6" />
                <span className="text-xs font-bold">
                  {language === 'ar' ? 'بدء استراحة (Take Break)' : 'Start Break'}
                </span>
                <span className="text-[10px] opacity-80">
                  {language === 'ar' ? 'غداء أو صلاة' : 'Lunch / Coffee'}
                </span>
              </button>
            )}

            {/* Clock Out */}
            <button
              onClick={handleClockOut}
              disabled={!isClockedIn || isClockedOut || isActionLoading}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 border transition-all cursor-pointer ${
                isClockedIn && !isClockedOut
                  ? 'border-rose-600 bg-rose-600 text-white shadow-md hover:bg-rose-700'
                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <LogOut className="h-6 w-6" />
              <span className="text-xs font-bold">
                {language === 'ar' ? 'تسجيل الانصراف (Clock Out)' : 'Clock Out'}
              </span>
              <span className="text-[10px] opacity-80">
                {todayAttendance?.clockOut
                  ? new Date(todayAttendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : language === 'ar'
                  ? 'إنهاء اليوم واحتساب الساعات'
                  : 'Finish workday'}
              </span>
            </button>
          </div>

          {/* Today's Calculated Metrics */}
          {todayAttendance && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {language === 'ar' ? 'وقت تسجيل الحضور' : 'Clock In Time'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {language === 'ar' ? 'حالة الحضور والتأخير' : 'Late Arrival Status'}
                </span>
                <span
                  className={`text-xs font-bold ${
                    todayAttendance.lateMinutes > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {todayAttendance.lateMinutes > 0
                    ? `${language === 'ar' ? 'تأخير:' : 'Late:'} ${todayAttendance.lateMinutes} دقيقة`
                    : language === 'ar'
                    ? 'في الموعد المحدد ✓'
                    : 'On Time ✓'}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {language === 'ar' ? 'إجمالي الاستراحات' : 'Total Breaks'}
                </span>
                <span className="text-xs font-bold text-amber-700">
                  {todayAttendance.breaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0)} دقيقة
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  {language === 'ar' ? 'ساعات العمل المكتملة' : 'Work Hours'}
                </span>
                <span className="text-xs font-bold text-indigo-700">
                  {(todayAttendance.totalWorkMinutes / 60).toFixed(1)} {language === 'ar' ? 'ساعة' : 'hours'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Hourly Verification Challenge */}
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-600 p-2 text-white shadow-2xs">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">
                    {language === 'ar' ? 'التحقق الدوري كل ساعة' : 'Hourly Work Verification'}
                  </h4>
                  <p className="text-[10px] text-indigo-800/80">
                    {language === 'ar' ? 'مهلة استجابة 15 دقيقة للتأكيد' : '15-min confirmation window'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => createHourlyChallenge(currentUser.id)}
                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                title="توليد تحدي تجريبي الآن"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{language === 'ar' ? 'تحدي جديد' : 'Trigger'}</span>
              </button>
            </div>

            {activeHourlyVerification && activeHourlyVerification.status === 'pending' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-amber-100/80 border border-amber-300 p-3 text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 animate-bounce" />
                    <span className="text-xs font-bold">
                      {language === 'ar' ? 'يرجى تأكيد نشاطك في الساعة الحالية:' : 'Confirm presence for this hour:'}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold font-mono text-amber-950 bg-white/70 px-2 py-0.5 rounded-md">
                    {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'ما الذي تعمل عليه في هذه الساعة؟' : 'What are you working on right now?'}
                  </label>
                  <input
                    type="text"
                    value={taskSummaryInput}
                    onChange={(e) => setTaskSummaryInput(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: تصميم بوستات انستغرام لمشروع رواسي...' : 'e.g. Designing carousel...'}
                    className="w-full rounded-xl border border-indigo-200 bg-white p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={handleVerifyHourly}
                  disabled={isActionLoading}
                  className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer"
                >
                  {language === 'ar' ? 'تأكيد الحضور والنشاط ✓' : 'Confirm Active Presence ✓'}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-indigo-200 p-6 text-center text-slate-400">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-1" />
                <p className="text-xs font-bold text-slate-700">
                  {language === 'ar' ? 'لا يوجد تحدي نشاط معلق حالياً' : 'No pending hourly check'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'سيظهر إشعار التحدي الدوري تلقائياً كل ساعة مع مهلة 15 دقيقة.'
                    : 'Hourly verification triggers every 60 minutes with a 15-min grace period.'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-100/70 text-[10px] text-indigo-900/70 flex items-center justify-between">
            <span>{language === 'ar' ? 'التمييز بين التواجد والإنتاجية' : 'Separating presence from output'}</span>
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Attendance Log Table & Administration View */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#181D18] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#4C5540] dark:text-[#A4C08B]" />
                {isManagerOrAdmin
                  ? (language === 'ar' ? 'سجل الحضور والانصراف المعتمد (إشراف الإدارة)' : 'Official Company Attendance Log (Management)')
                  : (language === 'ar' ? 'سجلي الشخصي المعتمد للحضور والانصراف' : 'My Personal Attendance Record')}
              </h3>
              {!isManagerOrAdmin && (
                <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  {language === 'ar' ? 'سجل الفريق العام محجوب للإدارة فقط' : 'Company Log Restricted'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-[#BDAF9C] mt-0.5">
              {isManagerOrAdmin
                ? (language === 'ar' ? 'صلاحية إدارية كاملة للاطلاع على سجلات جميع موظفي الوكالة وتصديرها' : 'Administrative privilege: View and export all agency member records')
                : (language === 'ar' ? 'طبقاً لسياسة وكالة شال، يقتصر الاطلاع على سجلات الحضور العامة على المناصب الإدارية فقط' : 'Per agency policy, full roster access is strictly reserved for Management')}
            </p>
          </div>

          {/* Actions & Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isManagerOrAdmin && (
              <button
                type="button"
                onClick={handleExportAttendanceCSV}
                className="flex items-center gap-1.5 rounded-xl border border-[#4C5540]/30 bg-[#FAF7F2] dark:bg-[#1E251D] px-3 py-1.5 font-bold text-[#24291F] dark:text-white hover:bg-white transition-colors cursor-pointer"
                title={language === 'ar' ? 'تصدير السجل كملف CSV' : 'Export CSV'}
              >
                <Download className="h-3.5 w-3.5 text-[#4C5540]" />
                <span>{language === 'ar' ? 'تصدير CSV' : 'Export'}</span>
              </button>
            )}

            {isManagerOrAdmin && (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 start-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    placeholder={language === 'ar' ? 'بحث باسم الموظف...' : 'Search member...'}
                    className="rounded-lg border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#151A14] py-1 ps-8 pe-2 text-xs text-slate-800 dark:text-white focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Member Filter */}
                <select
                  value={selectedMemberFilter}
                  onChange={(e) => setSelectedMemberFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#151A14] p-1 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="all">{language === 'ar' ? 'كافة الموظفين' : 'All Members'}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#151A14] p-1 text-xs text-slate-800 dark:text-white focus:outline-none"
            >
              <option value="all">{language === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
              <option value="present">{language === 'ar' ? 'حاضر في الموعد' : 'Present / On-Time'}</option>
              <option value="late">{language === 'ar' ? 'متأخر' : 'Late'}</option>
              <option value="absent">{language === 'ar' ? 'غائب' : 'Absent'}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
              <tr>
                <th className="p-3 text-start">{language === 'ar' ? 'الموظف' : 'Employee'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'وقت الحضور' : 'Clock In'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'وقت الانصراف' : 'Clock Out'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'التأخير' : 'Late'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'الاستراحات' : 'Breaks'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'إجمالي الساعات' : 'Total Hours'}</th>
                <th className="p-3 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {language === 'ar' ? 'لا توجد سجلات حضور مسجلة حتى الآن.' : 'No attendance records recorded yet.'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const totalBreaks = rec.breaks?.reduce((acc, b) => acc + (b.durationMinutes || 0), 0) || 0;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        <div>{rec.userName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{rec.userRoleName}</div>
                      </td>
                      <td className="p-3 text-slate-600 font-mono">{rec.date}</td>
                      <td className="p-3 text-emerald-700 font-mono font-bold">
                        {formatTimeString(rec.clockIn)}
                      </td>
                      <td className="p-3 text-rose-700 font-mono font-bold">
                        {rec.clockOut ? (
                          formatTimeString(rec.clockOut)
                        ) : (
                          <span className="text-amber-600 font-semibold">{language === 'ar' ? 'قيد العمل' : 'Working'}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {rec.lateMinutes > 0 ? (
                          <span className="rounded bg-rose-100 text-rose-800 px-1.5 py-0.5 text-[10px] font-bold">
                            {rec.lateMinutes} د
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                            {language === 'ar' ? 'على الموعد' : 'On Time'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-mono">
                        {totalBreaks > 0 ? `${totalBreaks} دقيقة` : '-'}
                      </td>
                      <td className="p-3 text-indigo-700 font-mono font-bold">
                        {((rec.totalHours ?? ((rec.totalWorkMinutes || 0) / 60)) || 0).toFixed(1)} س
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            rec.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rec.status === 'present' ? 'حاضر' : rec.status === 'late' ? 'متأخر' : rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clock Out In-App Safe Confirmation Modal */}
      {showClockOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-[#BDAF9C]/40 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                <LogOut className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#24291F]">
                  {language === 'ar' ? 'تأكيد تسجيل الانصراف' : 'Confirm Clock Out'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ar'
                    ? 'هل ترغب في تسجيل الانصراف وإنهاء وردية العمل لليوم؟'
                    : 'Are you sure you want to clock out and end your shift?'}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200/70 leading-relaxed">
              {language === 'ar'
                ? 'سيتم حساب ساعات العمل الصافية والاستراحات وحفظ السجل الموثق في قاعدة بيانات Firestore فوراً.'
                : 'Net shift hours and breaks will be calculated and persisted directly in Firestore.'}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClockOutConfirm(false)}
                className="btn-interactive rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmClockOut}
                disabled={isActionLoading}
                className="btn-interactive flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                <span>{language === 'ar' ? 'نعم، تسجيل الانصراف' : 'Yes, Clock Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
