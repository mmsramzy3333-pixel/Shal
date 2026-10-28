import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShalLogo } from '../common/ShalLogo';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Sparkles,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, language, setLanguage } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation
  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage(language === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة.' : 'Invalid email format.');
      return false;
    }
    if (!password) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال كلمة المرور.' : 'Password is required.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage(
        language === 'ar'
          ? 'يجب ألا تقل كلمة المرور عن 6 أحرف.'
          : 'Password must be at least 6 characters.'
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        setErrorMessage(
          res.error ||
            (language === 'ar'
              ? 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات أو مراجعة إدارة الوكالة.'
              : 'Authentication failed. Please verify credentials or contact agency admin.')
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء المعالجة.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMessage(
          res.error ||
            (language === 'ar'
              ? 'فشل تسجيل الدخول بواسطة Google.'
              : 'Google sign in failed.')
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال مع Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#24291F]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            <ShalLogo variant="full" theme="light" size="lg" showSubtitle={true} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4C5540]/10 border border-[#4C5540]/25 px-3 py-1 text-xs font-bold text-[#4C5540]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#4C5540]" />
            {language === 'ar' ? 'بوابة الدخول الموحدة لمنظومة الوكالة' : 'Agency Operating System Gateway'}
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#24291F]">
            {language === 'ar' ? 'تسجيل الدخول إلى حسابك' : 'Sign in to your account'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xs">
            {language === 'ar'
              ? 'نظام الإدارة الرقمية المعتمد، الصلاحيات الفردية، ومتابعة الحضور وسير المهام'
              : 'Authorized agency operations, individual RBAC, attendance, and task pipelines'}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-3xl border border-[#BDAF9C]/35 bg-white p-6 sm:p-8 shadow-xl">
          {/* Administrative Notice: Registration restricted to Owner & Management */}
          <div className="mb-6 rounded-2xl border border-[#BDAF9C]/40 bg-[#FAF7F2] p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-[#4C5540] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-[#24291F]">
                  {language === 'ar'
                    ? 'تسجيل الحسابات وإضافة الأعضاء مقتصر على الإدارة'
                    : 'Account Creation Restricted to Management'}
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'طبقاً لسياسة وكالة شال، يتم إصدار وتعيين حسابات أعضاء الفريق حصرياً من قِبل المالك (الفاوندر) وإدارة العمليات. سجّل دخولك بالبيانات المعتمدة الممنوحة لك.'
                    : 'Per Shal Agency policy, all employee accounts are provisioned exclusively by the Founder and Operations Management. Sign in with your assigned credentials.'}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/95 p-3.5 text-rose-900 animate-in fade-in duration-150 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">{errorMessage}</div>
              </div>
              <div className="pt-2 border-t border-rose-200/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPassword('Shal@2026');
                    setErrorMessage(null);
                  }}
                  className="rounded-lg bg-white border border-rose-300 px-2.5 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  ⚡ {language === 'ar' ? 'تجربة كلمة مرور الوكالة (Shal@2026)' : 'Try Master Pass (Shal@2026)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('medhat.nabdalwusul@gmail.com');
                    setPassword('Shal@Founder2026');
                    setErrorMessage(null);
                  }}
                  className="rounded-lg bg-rose-700 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-rose-800 transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'دخول بحساب الفاوندر' : 'Login as Founder'}
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-emerald-900 animate-in fade-in duration-150">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Quick Staff Credentials Preset Selector */}
          <div className="mb-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {language === 'ar' ? 'حسابات الدخول السريع المعتمدة (1-Click)' : 'Quick Access Authorized Accounts'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {language === 'ar' ? 'اضغط للملء المباشر' : 'Tap to fill'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('medhat.nabdalwusul@gmail.com');
                  setPassword('Shal@Founder2026');
                  setErrorMessage(null);
                }}
                className="btn-interactive flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-2 text-start hover:bg-purple-100/80 transition-all cursor-pointer shadow-2xs"
              >
                <div>
                  <span className="block text-[11px] font-bold text-purple-900">م. مدحت | الفاوندر</span>
                  <span className="block text-[9px] text-purple-700 font-mono truncate max-w-[110px]">Founder & CEO</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">المالك</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('m.m.s.ramzy3333@gmail.com');
                  setPassword('Shal@Founder2026');
                  setErrorMessage(null);
                }}
                className="btn-interactive flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-2 text-start hover:bg-purple-100/80 transition-all cursor-pointer shadow-2xs"
              >
                <div>
                  <span className="block text-[11px] font-bold text-purple-900">م. رمزي | شريك مؤسس</span>
                  <span className="block text-[9px] text-purple-700 font-mono truncate max-w-[110px]">Executive Board</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">المالك</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('mahmoud01.founder@shal.agency');
                  setPassword('Shal@Founder2026');
                  setErrorMessage(null);
                }}
                className="btn-interactive flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2 text-start hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
              >
                <div>
                  <span className="block text-[11px] font-bold text-slate-900">محمود 01 | فاوندر</span>
                  <span className="block text-[9px] text-slate-500 font-mono">Founder</span>
                </div>
                <span className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold">01</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('mahmoud04.ops@shal.agency');
                  setPassword('Shal@Operations2026');
                  setErrorMessage(null);
                }}
                className="btn-interactive flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2 text-start hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
              >
                <div>
                  <span className="block text-[11px] font-bold text-slate-900">محمود 04 | العمليات</span>
                  <span className="block text-[9px] text-slate-500 font-mono">Ops Manager</span>
                </div>
                <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">04</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('mahmoud11.ads@shal.agency');
                  setPassword('Shal@Media2026');
                  setErrorMessage(null);
                }}
                className="btn-interactive flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2 text-start hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
              >
                <div>
                  <span className="block text-[11px] font-bold text-slate-900">محمود 11 | ميديا باير</span>
                  <span className="block text-[9px] text-slate-500 font-mono">Media Buyer</span>
                </div>
                <span className="text-[9px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">11</span>
              </button>
            </div>
          </div>

          {/* Direct Google Sign-In */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="btn-interactive w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {language === 'ar'
                  ? 'تسجيل الدخول المباشر بحساب Google'
                  : 'Continue with Google Account'}
              </span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-[11px] font-medium text-slate-400">
                  {language === 'ar' ? 'أو بالبريد وكلمة المرور' : 'Or with email & password'}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'البريد الإلكتروني المهني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@shal.agency"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 ps-9 pe-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540] focus:outline-none transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(
                      language === 'ar'
                        ? 'لإعادة تعيين كلمة المرور أو استلام بيانات الدخول، يرجى التواصل مباشرة مع إدارة وكالة شال أو المالك.'
                        : 'To reset your password or receive credentials, contact Shal Agency management or the Founder.'
                    );
                  }}
                  className="text-[11px] font-semibold text-[#4C5540] hover:underline cursor-pointer"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 ps-9 pe-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540] focus:outline-none transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4C5540] py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-[#3B4432] focus:outline-none focus:ring-2 focus:ring-[#4C5540] focus:ring-offset-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{language === 'ar' ? 'جارٍ التحقق والتوثيق...' : 'Authenticating...'}</span>
                </div>
              ) : (
                <>
                  <span>
                    {language === 'ar' ? 'تسجيل الدخول للمنظومة' : 'Sign In to Workspace'}
                  </span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* New employee assistance guidance */}
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center text-[11px] text-slate-500 border border-slate-200/60">
            {language === 'ar' ? (
              <span>
                عضو جديد في فريق وكالة شال؟ يتم إنشاء حسابك وتحديد صلاحياتك رسمياً من قِبل إدارة الوكالة أو المالك.
              </span>
            ) : (
              <span>
                New team member? Your account and permissions are provisioned centrally by agency management or the founder.
              </span>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>وكالة شال للحلول الرقمية © 2026</span>
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="font-bold text-slate-600 hover:text-slate-900"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
