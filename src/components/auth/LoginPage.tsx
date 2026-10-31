import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShalLogo } from '../common/ShalLogo';
import { supabase } from '../../lib/supabaseClient';
import { QuickLoginPreset, AgencyTeam } from '../../types';
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
  Key,
  Check,
  X,
  Send,
  Settings,
  Trash2,
  Edit2,
  Plus,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, language, setLanguage } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Supabase Password Reset Flow states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // Dynamic Quick Login Presets (strictly email only, never password)
  const defaultPresets: QuickLoginPreset[] = [
    {
      id: 'p-1',
      name: 'م. مدحت | الفاوندر',
      roleTitle: 'Founder & CEO',
      badge: 'المالك',
      email: 'medhat.nabdalwusul@gmail.com',
      team: 'management',
    },
    {
      id: 'p-2',
      name: 'م. رمزي | شريك مؤسس',
      roleTitle: 'Executive Board',
      badge: 'المالك',
      email: 'm.m.s.ramzy3333@gmail.com',
      team: 'management',
    },
    {
      id: 'p-3',
      name: 'محمود 01 | فاوندر',
      roleTitle: 'Founder',
      badge: '01',
      email: 'mahmoud01.founder@shal.agency',
      team: 'management',
    },
    {
      id: 'p-4',
      name: 'محمود 04 | العمليات',
      roleTitle: 'Ops Manager',
      badge: '04',
      email: 'mahmoud04.ops@shal.agency',
      team: 'operations',
    },
    {
      id: 'p-5',
      name: 'محمود 11 | ميديا باير',
      roleTitle: 'Media Buyer',
      badge: '11',
      email: 'mahmoud11.ads@shal.agency',
      team: 'media_buying',
    },
  ];

  const [presets, setPresets] = useState<QuickLoginPreset[]>(() => {
    try {
      const saved = localStorage.getItem('shal_quick_login_presets');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultPresets;
  });

  const [isManagingPresets, setIsManagingPresets] = useState(false);
  const [editingPreset, setEditingPreset] = useState<QuickLoginPreset | null>(null);
  const [presetFormName, setPresetFormName] = useState('');
  const [presetFormRole, setPresetFormRole] = useState('');
  const [presetFormBadge, setPresetFormBadge] = useState('');
  const [presetFormEmail, setPresetFormEmail] = useState('');
  const [presetFormTeam, setPresetFormTeam] = useState<AgencyTeam>('operations');

  const savePresets = (updated: QuickLoginPreset[]) => {
    setPresets(updated);
    try {
      localStorage.setItem('shal_quick_login_presets', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleOpenAddPreset = () => {
    setEditingPreset(null);
    setPresetFormName('');
    setPresetFormRole('');
    setPresetFormBadge('');
    setPresetFormEmail('');
    setPresetFormTeam('operations');
    setIsManagingPresets(true);
  };

  const handleOpenEditPreset = (p: QuickLoginPreset) => {
    setEditingPreset(p);
    setPresetFormName(p.name);
    setPresetFormRole(p.roleTitle);
    setPresetFormBadge(p.badge);
    setPresetFormEmail(p.email);
    setPresetFormTeam(p.team);
    setIsManagingPresets(true);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    savePresets(updated);
  };

  const handleSavePresetForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetFormName.trim() || !presetFormEmail.trim()) return;

    if (editingPreset) {
      const updated = presets.map((p) =>
        p.id === editingPreset.id
          ? {
              ...p,
              name: presetFormName.trim(),
              roleTitle: presetFormRole.trim() || 'عضو الفريق',
              badge: presetFormBadge.trim() || 'وكالة',
              email: presetFormEmail.trim().toLowerCase(),
              team: presetFormTeam,
            }
          : p
      );
      savePresets(updated);
    } else {
      const newP: QuickLoginPreset = {
        id: `preset-${Date.now()}`,
        name: presetFormName.trim(),
        roleTitle: presetFormRole.trim() || 'عضو الفريق',
        badge: presetFormBadge.trim() || 'جديد',
        email: presetFormEmail.trim().toLowerCase(),
        team: presetFormTeam,
        isCustom: true,
      };
      savePresets([...presets, newP]);
    }
    setIsManagingPresets(false);
  };

  // Initialize Remember Me from localStorage (strictly email only)
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('shal_remember_email');
      const savedRemember = localStorage.getItem('shal_remember_me');
      if (savedEmail) {
        setEmail(savedEmail);
        setResetEmail(savedEmail);
        setRememberMe(savedRemember === 'true');
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

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

    // Handle Remember Me (Email ONLY, never password)
    try {
      if (rememberMe) {
        localStorage.setItem('shal_remember_email', email.trim());
        localStorage.setItem('shal_remember_me', 'true');
      } else {
        localStorage.removeItem('shal_remember_email');
        localStorage.removeItem('shal_remember_me');
      }
    } catch {
      // Non-fatal localStorage handling
    }

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

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim();
    if (!cleanEmail) {
      setResetError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email.');
      return;
    }

    setIsResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        setResetError(
          language === 'ar'
            ? `تعذر إرسال رابط الاستعادة: ${error.message}`
            : `Failed to send reset link: ${error.message}`
        );
      } else {
        setResetSuccess(
          language === 'ar'
            ? 'تم إرسال رابط استعادة وتعيين كلمة المرور إلى بريدك الإلكتروني بنجاح. يرجى فحص صندوق الوارد ورسائل الترويج.'
            : 'Password reset link has been dispatched to your email. Please check your inbox and spam folder.'
        );
      }
    } catch (err: any) {
      setResetError(err.message || 'حدث خطأ غير متوقع أثناء إرسال الرابط.');
    } finally {
      setIsResetLoading(false);
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
          <h2 className="mt-3 text-2xl font-black text-[#24291F]">
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
          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/95 p-3.5 text-rose-900 animate-in fade-in duration-150 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold leading-relaxed">{errorMessage}</div>
              </div>
              <div className="pt-2 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-rose-700">
                <span>{language === 'ar' ? 'تأكد من إدخال كلمة المرور الصحيحة المرتبطة بحسابك.' : 'Ensure your password matches your Supabase Auth account.'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('medhat.nabdalwusul@gmail.com');
                    setPassword('');
                    setErrorMessage(null);
                  }}
                  className="rounded-lg bg-rose-700 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-rose-800 transition-colors cursor-pointer shrink-0"
                >
                  {language === 'ar' ? 'تعبئة بريد الفاوندر' : 'Fill Founder Email'}
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

          {/* Primary Form: Positioned at Top */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prominent Email Field with elegant styled Mail badge for smooth Auto-fill */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-email" className="block text-xs font-bold text-slate-800">
                  {language === 'ar' ? 'البريد الإلكتروني المهني' : 'Work Email Address'}
                </label>
                <span className="text-[10px] font-bold text-[#4C5540] bg-[#4C5540]/10 px-2 py-0.5 rounded-full border border-[#4C5540]/20">
                  {language === 'ar' ? 'ملء تلقائي معتمد' : 'Auto-fill ready'}
                </span>
              </div>
              <div className="relative group/email">
                <div className="absolute top-1/2 -translate-y-1/2 start-3 flex h-7 w-7 items-center justify-center rounded-lg bg-[#4C5540]/10 text-[#4C5540] group-focus-within/email:bg-[#4C5540] group-focus-within/email:text-white transition-all shadow-2xs">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!resetEmail) setResetEmail(e.target.value);
                  }}
                  placeholder="name@shal.agency"
                  className="w-full rounded-xl border-2 border-[#BDAF9C]/50 bg-white ps-12 pe-3 py-2.5 text-xs font-semibold text-slate-900 placeholder-slate-400 shadow-xs hover:border-[#4C5540]/70 focus:border-[#4C5540] focus:ring-2 focus:ring-[#4C5540]/20 focus:outline-none transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email.trim());
                    setResetError(null);
                    setResetSuccess(null);
                    setIsResetModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-[#4C5540] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Key className="h-3 w-3" />
                  <span>{language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 ps-9 pe-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540] focus:outline-none transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox (Email only in localStorage, password strictly excluded) */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#4C5540] focus:ring-[#4C5540] cursor-pointer accent-[#4C5540]"
                />
                <span>{language === 'ar' ? 'تذكرني (حفظ البريد الإلكتروني فقط)' : 'Remember me (Email only)'}</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {language === 'ar' ? 'أمان فائق' : 'Strict Security'}
              </span>
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

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2.5 text-[11px] font-medium text-slate-400">
                {language === 'ar' ? 'أو عبر خيارات الدخول المعتمدة' : 'Or with authorized options'}
              </span>
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
          </div>

          {/* Quick Staff Credentials Preset Selector */}
          <div className="mb-4 rounded-2xl border border-slate-200/90 dark:border-[#2D372B] bg-slate-50/70 dark:bg-[#1E251D] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {language === 'ar' ? 'حسابات الدخول السريع (تعبئة البريد فقط)' : 'Quick Access (Email Only)'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddPreset}
                  className="text-[10px] text-[#4C5540] dark:text-[#A4C08B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  title="إدارة وتعديل حسابات الدخول السريع (مخصص للإدارة)"
                >
                  <Settings className="h-3 w-3" />
                  <span>{language === 'ar' ? 'تعديل الحسابات (إدارة)' : 'Manage'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="group relative flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-2 hover:border-[#4C5540] dark:hover:border-[#A4C08B] transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(preset.email);
                      setPassword('');
                      setErrorMessage(null);
                    }}
                    className="flex-1 text-start cursor-pointer"
                  >
                    <span className="block text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {preset.name}
                    </span>
                    <span className="block text-[9px] text-slate-500 dark:text-[#BDAF9C] font-mono truncate">
                      {preset.roleTitle}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-mono font-bold text-[#4C5540] dark:text-[#A4C08B] bg-[#4C5540]/10 px-1.5 py-0.5 rounded">
                      {preset.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditPreset(preset)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 transition-opacity cursor-pointer"
                      title="تعديل"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Notice: Positioned at Bottom */}
          <div className="mt-4 rounded-2xl border border-[#BDAF9C]/40 bg-[#FAF7F2] p-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[#4C5540] shrink-0 mt-0.5" />
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

          {/* Footer Info */}
          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>وكالة شال للحلول الرقمية © 2026</span>
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#4C5540]/10 text-[#4C5540]">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'استعادة كلمة المرور عبر البريد' : 'Reset Password via Email'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'توثيق أمني رسمي عبر Supabase Auth' : 'Verified Supabase Auth recovery'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{resetSuccess}</p>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetModalOpen(false);
                      setResetSuccess(null);
                    }}
                    className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer"
                  >
                    {language === 'ar' ? 'تم، العودة لتسجيل الدخول' : 'Done, Return to Sign In'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-3.5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'أدخل بريدك الإلكتروني المسجل في وكالة شال، وسنرسل لك رابطاً مشفراً لتعيين كلمة مرور جديدة لحسابك بأمان.'
                    : 'Enter your registered agency email address, and we will send you a secure link to reset your password.'}
                </p>

                {resetError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني المسجل' : 'Registered Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@shal.agency"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 ps-9 pe-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="rounded-xl bg-[#4C5540] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#3B4432] shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isResetLoading ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 rtl:rotate-180" />
                        <span>{language === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Reset Link'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Quick Login Presets Management Modal (Management Only) */}
      {isManagingPresets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#181D18] p-6 shadow-2xl border border-slate-200 dark:border-[#2D372B] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D372B] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#4C5540]/10 text-[#4C5540] dark:text-[#A4C08B]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingPreset
                      ? (language === 'ar' ? 'تعديل حساب الدخول السريع' : 'Edit Quick Login Account')
                      : (language === 'ar' ? 'إدارة حسابات الدخول السريع (إدارة فقط)' : 'Manage Quick Login Accounts')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#BDAF9C]">
                    {language === 'ar'
                      ? 'مقتصر على المديرين • ملء البريد فقط دون المساس بكلمة المرور'
                      : 'Managers only • Email-only auto fill with zero password storage'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManagingPresets(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A3428]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Existing Presets List (when not editing a specific one) */}
            {!editingPreset && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'الحسابات المسجلة حالياً:' : 'Current Presets:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPreset(null);
                      setPresetFormName('');
                      setPresetFormRole('');
                      setPresetFormBadge('');
                      setPresetFormEmail('');
                    }}
                    className="flex items-center gap-1 rounded-lg bg-[#4C5540]/10 text-[#4C5540] dark:text-[#A4C08B] px-2.5 py-1 text-[11px] font-bold hover:bg-[#4C5540]/20"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{language === 'ar' ? 'إضافة حساب جديد' : 'Add New'}</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar">
                  {presets.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#151A14] text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{p.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPreset(p)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          title="تعديل"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(p.id)}
                          className="p-1 text-rose-400 hover:text-rose-600"
                          title="حذف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add / Edit Form */}
            <form onSubmit={handleSavePresetForm} className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#2D372B] text-xs">
              <h4 className="font-bold text-slate-800 dark:text-white">
                {editingPreset ? (language === 'ar' ? 'بيانات الحساب المختار:' : 'Edit Details:') : (language === 'ar' ? 'إضافة حساب وصول سريع جديد:' : 'Add New Preset:')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الاسم الظاهر:' : 'Display Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={presetFormName}
                    onChange={(e) => setPresetFormName(e.target.value)}
                    placeholder="مثال: م. أحمد | مدير المشاريع"
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'المسمى الوظيفي:' : 'Role Title:'}
                  </label>
                  <input
                    type="text"
                    value={presetFormRole}
                    onChange={(e) => setPresetFormRole(e.target.value)}
                    placeholder="Project Manager"
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}
                  </label>
                  <input
                    type="email"
                    required
                    value={presetFormEmail}
                    onChange={(e) => setPresetFormEmail(e.target.value)}
                    placeholder="name@shal.agency"
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'الشارة (Badge):' : 'Badge Tag:'}
                  </label>
                  <input
                    type="text"
                    value={presetFormBadge}
                    onChange={(e) => setPresetFormBadge(e.target.value)}
                    placeholder="05 أو إدارة"
                    className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#2D372B]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPreset(null);
                    setIsManagingPresets(false);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-[#2D372B] px-3.5 py-1.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E251D] cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4C5540] px-4 py-1.5 font-bold text-white hover:bg-[#3B4432] shadow-xs cursor-pointer"
                >
                  {editingPreset
                    ? (language === 'ar' ? 'حفظ التعديل' : 'Update Preset')
                    : (language === 'ar' ? 'إضافة الحساب' : 'Save Preset')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
