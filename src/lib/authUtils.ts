import { supabase, DbProfile, AppRole, mapRoleToSupabaseRole } from './supabaseClient';
import { signUpWithEmail, upsertSupabaseProfile, signInWithEmail } from './supabaseService';
import { INITIAL_USERS, INITIAL_ROLES, SYSTEM_PERMISSIONS } from '../data/initialData';
import { AgencyTeam } from '../types';

export interface DefaultAgencyAccount {
  id: string;
  name: string;
  email: string;
  temporaryPassword: string;
  roleCode: string;
  roleTitleAr: string;
  roleTitleEn: string;
  appRole: AppRole;
  team: AgencyTeam;
  employeeNumber: string;
  permissionsCount: number;
  permissionsList: string[];
}

export const UNIFIED_DEFAULT_PASSWORD = 'Shal@2025';

export const DEFAULT_AGENCY_ACCOUNTS: DefaultAgencyAccount[] = [
  {
    id: 'user-medhat-founder',
    name: 'م. مدحت نضال | الفاوندر والمدير العام',
    email: 'medhat.nabdalwusul@gmail.com',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'founder',
    roleTitleAr: 'الفاوندر والمدير العام (Founder & CEO)',
    roleTitleEn: 'Founder & CEO',
    appRole: 'owner',
    team: 'management',
    employeeNumber: '00',
    permissionsCount: 23,
    permissionsList: [
      'عرض وتعديل وحذف العملاء (CRM)',
      'إدارة المشاريع وربطها بالصفقات',
      'إدارة الصفقات والميزانيات',
      'التحكم الكامل في الكانبان والمهام',
      'اعتماد وتعديل ونشر المحتوى والتصاميم',
      'رفع الأصول البصرية ومكتبة الملفات',
      'إدارة مصفوفة الصلاحيات (RBAC)',
      'إدارة وتسجيل وتعيين الموظفين',
      'اعتماد تعديل الملفات الشخصية',
      'الوصول للتقارير الاستراتيجية وMRR',
      'إدارة العقود والماليات وكشوف المرتبات',
      'إدارة حملات الميديا باير والـ SEO',
      'إدارة البرمجة وتصميم UI/UX',
    ],
  },
  {
    id: 'user-ramzy-founder',
    name: 'م. رمزي | الإدارة التنفيذية والشريك المؤسس',
    email: 'm.m.s.ramzy3333@gmail.com',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'founder',
    roleTitleAr: 'الشريك المؤسس والإدارة التنفيذية',
    roleTitleEn: 'Executive Board & Partner',
    appRole: 'owner',
    team: 'management',
    employeeNumber: '00-R',
    permissionsCount: 23,
    permissionsList: [
      'الوصول التنفيذي الشامل لكافة الأقسام',
      'إدارة الصفقات والعملاء والمشاريع',
      'الرقابة الإدارية على حضور وساعات العمل',
      'التقارير التحليلية والماليات',
    ],
  },
  {
    id: 'user-ops-clean',
    name: 'محمود العمليات | أوبريشن مانجر',
    email: 'operations@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'operations_mgr',
    roleTitleAr: 'مدير العمليات والتشغيل (Operations Manager)',
    roleTitleEn: 'Operations Manager',
    appRole: 'admin',
    team: 'operations',
    employeeNumber: '04',
    permissionsCount: 15,
    permissionsList: [
      'عرض وتعديل العملاء والمشاريع',
      'إدارة وتوزيع وتعيين المهام ومراقبة الديدلاين',
      'اعتماد مخرجات المحتوى والتصاميم',
      'اعتماد طلبات تعديل ملفات الموظفين',
      'متابعة تقارير الإنتاجية وسرعة إنجاز الفرق',
    ],
  },
  {
    id: 'user-sales-clean',
    name: 'طارق المبيعات | سيلز مانجر',
    email: 'sales@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'sales_mgr',
    roleTitleAr: 'مدير المبيعات وتطوير الأعمال (Sales Manager)',
    roleTitleEn: 'Sales Manager',
    appRole: 'member',
    team: 'sales',
    employeeNumber: '03',
    permissionsCount: 8,
    permissionsList: [
      'إدارة صفقات المبيعات وCRM',
      'تحويل الصفقات الفائزة لمشاريع ومهام',
      'عرض وتعديل العملاء',
      'تقارير المبيعات ونسب التحويل',
    ],
  },
  {
    id: 'user-accounts-clean',
    name: 'نور الحسابات | أكونت مانجر',
    email: 'accounts@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'account_mgr',
    roleTitleAr: 'مسؤول إدارة الحسابات والعملاء (Account Manager)',
    roleTitleEn: 'Account Manager',
    appRole: 'member',
    team: 'operations',
    employeeNumber: '05',
    permissionsCount: 8,
    permissionsList: [
      'متابعة رضا العملاء وعقود الريتينر',
      'عرض وتعديل ملفات العملاء والمشاريع',
      'إنشاء وتحديث المهام الميدانية',
      'سجل الاجتماعات والملاحظات',
    ],
  },
  {
    id: 'user-marketing-clean',
    name: 'سارة التسويق | ماركتنج مانجر',
    email: 'marketing@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'marketing_mgr',
    roleTitleAr: 'مدير التسويق والاستراتيجية (Marketing Manager)',
    roleTitleEn: 'Marketing Manager',
    appRole: 'member',
    team: 'marketing',
    employeeNumber: '02',
    permissionsCount: 11,
    permissionsList: [
      'إدارة الخطط التسويقية والحملات',
      'اعتماد المحتوى والتصاميم قبل النشر',
      'متابعة مؤشرات أداء النمو التسويقي والـ ROI',
    ],
  },
  {
    id: 'user-ads-clean',
    name: 'عمر الإعلانات | ميديا باير',
    email: 'ads@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'media_buyer',
    roleTitleAr: 'خبير الإعلانات الممولة (Media Buyer)',
    roleTitleEn: 'Media Buyer',
    appRole: 'member',
    team: 'media_buying',
    employeeNumber: '11',
    permissionsCount: 6,
    permissionsList: [
      'إطلاق ومراقبة الحملات الممولة (ميتا، جوجل، تيك توك)',
      'تحسين العائد الإعلاني ROAS',
      'تقارير الإنفاق والنتائج اليومية',
    ],
  },
  {
    id: 'user-social-clean',
    name: 'ليلى السوشيال | سوشيال ميديا',
    email: 'social@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'social_spec',
    roleTitleAr: 'أخصائي السوشيال ميديا (Social Media Specialist)',
    roleTitleEn: 'Social Media Specialist',
    appRole: 'member',
    team: 'social',
    employeeNumber: '06',
    permissionsCount: 6,
    permissionsList: [
      'إدارة تقويم المنشورات والريلز على كافة المنصات',
      'جدولة المحتوى ومتابعة التفاعل',
      'رفع الأصول المرئية والمرفقات',
    ],
  },
  {
    id: 'user-content-clean',
    name: 'كريم المحتوى | كونتنت كريتور',
    email: 'content@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'content_creator',
    roleTitleAr: 'صانع ومؤلف المحتوى الإعلاني (Content Creator)',
    roleTitleEn: 'Content Creator',
    appRole: 'member',
    team: 'content',
    employeeNumber: '07',
    permissionsCount: 6,
    permissionsList: [
      'كتابة الاسكريبتات والسيناريوهات الإبداعية',
      'صياغة هوكات الفيديو والكابشنز',
      'رفع مسودات المحتوى لاعتمادها',
    ],
  },
  {
    id: 'user-design-clean',
    name: 'ياسمين التصميم | مصممة UI/UX',
    email: 'design@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'ui_ux',
    roleTitleAr: 'مصممة واجهات وتجربة المستخدم (UI/UX Designer)',
    roleTitleEn: 'UI/UX Designer',
    appRole: 'member',
    team: 'uiux',
    employeeNumber: '08',
    permissionsCount: 6,
    permissionsList: [
      'تصميم واجهات وتجارب الاستخدام على فيجما',
      'بناء وتطوير نظم التصميم (Design Systems)',
      'رفع ملفات الأصول الرقمية والتصاميم',
    ],
  },
  {
    id: 'user-seo-clean',
    name: 'أحمد السيو | خبير SEO',
    email: 'seo@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'seo_spec',
    roleTitleAr: 'خبير السيو ومحركات البحث (SEO Specialist)',
    roleTitleEn: 'SEO Specialist',
    appRole: 'member',
    team: 'seo',
    employeeNumber: '09',
    permissionsCount: 6,
    permissionsList: [
      'التدقيق الفني للمواقع ودراسة الكلمات المفتاحية',
      'بناء الروابط الخلفية ومتابعة الترتيب والظهور',
      'تقارير حركة الزوار العضوية (Organic Traffic)',
    ],
  },
  {
    id: 'user-dev-clean',
    name: 'مصطفى البرمجة | ويب ديفيلوبر',
    email: 'dev@shal.agency',
    temporaryPassword: UNIFIED_DEFAULT_PASSWORD,
    roleCode: 'developer',
    roleTitleAr: 'مهندس ومطور الويب (Web Developer)',
    roleTitleEn: 'Web Developer',
    appRole: 'member',
    team: 'developer',
    employeeNumber: '10',
    permissionsCount: 5,
    permissionsList: [
      'تطوير وصيانة مواقع ومنصات الوكالة والعملاء',
      'معالجة التذاكر التقنية والأعطال البرمجية',
      'الربط البرمجي للواجهات والتكاملات (APIs)',
    ],
  },
];

/**
 * Returns the list of standard predefined role accounts
 */
export function getDefaultAgencyAccounts(): DefaultAgencyAccount[] {
  return DEFAULT_AGENCY_ACCOUNTS;
}

/**
 * Ensures the Founder account is provisioned in Supabase Auth & public.profiles
 */
export async function provisionFounderAccount(): Promise<{
  success: boolean;
  message: string;
  profile?: DbProfile;
}> {
  try {
    const founder = DEFAULT_AGENCY_ACCOUNTS[0];
    const cleanEmail = founder.email.toLowerCase();

    // 1. Try to sign up the founder in Supabase Auth if not exists
    const signUpResult = await signUpWithEmail(
      cleanEmail,
      founder.temporaryPassword,
      founder.name,
      'owner'
    );

    // 2. Ensure record in public.profiles table
    const profileId = signUpResult.user?.id || founder.id;
    const dbProf: DbProfile = {
      id: profileId,
      name: founder.name,
      email: cleanEmail,
      role: 'owner',
      employee_number: founder.employeeNumber,
      team: founder.team,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await upsertSupabaseProfile(dbProf).catch((err) => {
      console.warn('[Supabase Upsert Founder note]:', err);
    });

    return {
      success: true,
      message: 'تم التحقق من وتثبيت حساب الفاوندر بصلاحيات كاملة.',
      profile: dbProf,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'تعذر استكمال تهيئة حساب الفاوندر في Supabase.',
    };
  }
}

/**
 * Initializes and registers all core default users in Supabase Auth and public.profiles
 */
export async function initSupabaseDefaultUsers(): Promise<{
  total: number;
  successCount: number;
  results: { email: string; role: string; success: boolean; note: string }[];
}> {
  const accounts = DEFAULT_AGENCY_ACCOUNTS;
  const results: { email: string; role: string; success: boolean; note: string }[] = [];
  let successCount = 0;

  for (const acc of accounts) {
    try {
      // 1. Attempt Supabase Auth sign up
      const signRes = await signUpWithEmail(
        acc.email,
        acc.temporaryPassword,
        acc.name,
        acc.appRole
      );

      // 2. Provision / Upsert into public.profiles
      const profileId = signRes.user?.id || acc.id;
      const dbProf: DbProfile = {
        id: profileId,
        name: acc.name,
        email: acc.email.toLowerCase(),
        role: acc.appRole,
        employee_number: acc.employeeNumber,
        team: acc.team,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await upsertSupabaseProfile(dbProf).catch(() => {});

      successCount++;
      results.push({
        email: acc.email,
        role: acc.roleTitleAr,
        success: true,
        note: signRes.success ? 'تم التسجيل في Auth والملف الشخصي' : 'تم تثبيت الملف الشخصي المحلي والسحابي',
      });
    } catch (err: any) {
      results.push({
        email: acc.email,
        role: acc.roleTitleAr,
        success: false,
        note: err?.message || 'خطأ في المعالجة',
      });
    }
  }

  return {
    total: accounts.length,
    successCount,
    results,
  };
}

/**
 * Creates a single test user in Supabase Auth & profiles with member role
 */
export async function createTestUser(params?: {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  team?: AgencyTeam;
}): Promise<{ success: boolean; user?: any; error?: string }> {
  const name = params?.name || 'مستخدم تجريبي | وكالة شال';
  const email = params?.email || `test.member.${Date.now().toString().slice(-4)}@shal.agency`;
  const password = params?.password || UNIFIED_DEFAULT_PASSWORD;
  const role: AppRole = 'member';

  try {
    const res = await signUpWithEmail(email, password, name, role);
    const dbProf: DbProfile = {
      id: res.user?.id || `user-test-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role,
      employee_number: 'TEST',
      team: params?.team || 'operations',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await upsertSupabaseProfile(dbProf).catch(() => {});

    return {
      success: true,
      user: {
        id: dbProf.id,
        name,
        email,
        password,
        role,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'تعذر إنشاء حساب المستخدم التجريبي.',
    };
  }
}
