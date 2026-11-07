import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role, PermissionKey, AgencyTeam } from '../../types';
import {
  initSupabaseDefaultUsers,
  provisionFounderAccount,
  createTestUser,
  UNIFIED_DEFAULT_PASSWORD,
  DEFAULT_AGENCY_ACCOUNTS,
} from '../../lib/authUtils';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit2,
  Key,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronDown,
  Plus,
  Trash2,
  Briefcase,
  Layers,
  X,
} from 'lucide-react';

interface UserManagementTableProps {
  onOpenAddUser?: () => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ onOpenAddUser }) => {
  const {
    users,
    roles,
    permissions,
    currentUser,
    isOwner,
    isAdminOrOwner,
    updateUser,
    updateUserAccount,
    assignUserRoles,
    adminResetPassword,
    deleteUser,
    showToast,
    language,
    toggleRolePermission,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Permission Edit Drawer/Modal
  const [userForPermissions, setUserForPermissions] = useState<User | null>(null);

  // Reset Password Modal
  const [userForResetPass, setUserForResetPass] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('Shal@2025');

  // Sync / Provisioning state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<{
    show: boolean;
    total: number;
    successCount: number;
    results: { email: string; role: string; success: boolean; note: string }[];
  } | null>(null);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.employeeNumber && u.employeeNumber.toLowerCase().includes(q));

      const matchRole =
        selectedRoleFilter === 'all' ||
        (u.roleIds && u.roleIds.includes(selectedRoleFilter));

      const matchTeam =
        selectedTeamFilter === 'all' || u.team === selectedTeamFilter;

      return matchSearch && matchRole && matchTeam;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedTeamFilter]);

  // Copy credentials helper
  const handleCopyCredentials = (user: User) => {
    const credText = `بيانات الدخول لوكالة شال:
الاسم: ${user.name}
البريد: ${user.email}
كلمة المرور: ${user.password || UNIFIED_DEFAULT_PASSWORD}`;

    navigator.clipboard.writeText(credText);
    setCopiedId(user.id);
    showToast({
      type: 'info',
      title: 'تم نسخ بيانات الدخول',
      message: `تم نسخ البريد وكلمة المرور للموظف: ${user.name}`,
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Toggle User Status (Active / Inactive)
  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser.id) {
      showToast({
        type: 'warning',
        title: 'تنبيه أمان',
        message: 'لا يمكنك تعطيل حسابك النشط الحالي.',
      });
      return;
    }
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateUser(user.id, { status: newStatus });
    showToast({
      type: newStatus === 'active' ? 'success' : 'warning',
      title: newStatus === 'active' ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب',
      message: `تم تعديل حالة الموظف ${user.name} إلى ${newStatus === 'active' ? 'نشط' : 'معطل'}`,
    });
  };

  // Quick Role Change
  const handleChangeUserRole = async (user: User, newRoleId: string) => {
    await assignUserRoles(user.id, [newRoleId]);
    showToast({
      type: 'success',
      title: 'تم تحديث الدور الوظيفي',
      message: `تم تعيين الدور الجديد بنجاح للموظف ${user.name}`,
    });
  };

  // Trigger Supabase Provisioning
  const handleProvisionDefaultAccounts = async () => {
    setIsSyncing(true);
    showToast({
      type: 'info',
      title: 'بدء مزامنة المستخدمين مع Supabase',
      message: 'جاري تهيئة الحسابات والأدوار في قاعدة البيانات السحابية...',
    });

    try {
      const res = await initSupabaseDefaultUsers();
      setSyncResults({
        show: true,
        total: res.total,
        successCount: res.successCount,
        results: res.results,
      });
      showToast({
        type: 'success',
        title: 'اكتملت المزامنة بنجاح',
        message: `تمت تهيئة ومطابقة ${res.successCount} من أصل ${res.total} حساب في منظومة شال`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'فشلت المزامنة السحابية',
        message: err?.message || 'حدث خطأ أثناء الاتصال بقاعدة البيانات.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Export Users CSV
  const handleExportUsersCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Team', 'EmployeeNumber', 'Status', 'CreatedAt'];
    const rows = users.map((u) => {
      const roleObj = roles.find((r) => u.roleIds?.includes(r.id)) || roles[0];
      return [
        u.id,
        `"${u.name}"`,
        u.email,
        `"${roleObj?.nameAr || roleObj?.name}"`,
        u.team || 'operations',
        u.employeeNumber || '-',
        u.status,
        u.createdAt || '-',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shal_agency_staff_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'تم تصدير كشف المستخدمين',
      message: `تم تحميل ملف CSV يحتوي على ${users.length} مستخدم.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4C5540] text-white shadow-xs">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'إدارة المستخدمين والأدوار الوظيفية (RBAC)' : 'User Management & Role Matrix'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#BDAF9C]">
                  {language === 'ar'
                    ? `إجمالي أعضاء الوكالة: ${users.length} موظفاً معتمداً | كلمة المرور الافتراضية: Shal@2025`
                    : `Total agency staff: ${users.length} members | Default Password: Shal@2025`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sync Default Users Button */}
            <button
              type="button"
              onClick={handleProvisionDefaultAccounts}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
              title="مزامنة وتثبيت الحسابات الافتراضية للأدوار في Supabase Auth"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? language === 'ar'
                    ? 'جاري المزامنة...'
                    : 'Syncing...'
                  : language === 'ar'
                  ? 'مزامنة حسابات الأدوار'
                  : 'Sync Role Accounts'}
              </span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportUsersCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-xs font-bold text-slate-700 dark:text-[#BDAF9C] hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            {/* Add User Modal Trigger */}
            {onOpenAddUser && (isOwner || isAdminOrOwner) && (
              <button
                type="button"
                onClick={onOpenAddUser}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#3B4432] shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{language === 'ar' ? 'إضافة موظف جديد' : 'Add Employee'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2D372B] flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'البحث بالاسم، البريد، أو الرقم الوظيفي...' : 'Search by name, email, or employee #...'}
              className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50/70 dark:bg-[#1E251D] ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50/70 dark:bg-[#1E251D] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#BDAF9C] focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
            >
              <option value="all">{language === 'ar' ? 'كافة الأدوار' : 'All Roles'}</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nameAr || r.name}
                </option>
              ))}
            </select>

            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50/70 dark:bg-[#1E251D] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#BDAF9C] focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
            >
              <option value="all">{language === 'ar' ? 'كافة الفرق والأقسام' : 'All Teams'}</option>
              <option value="management">{language === 'ar' ? 'الإدارة العليا' : 'Management'}</option>
              <option value="operations">{language === 'ar' ? 'العمليات والتشغيل' : 'Operations'}</option>
              <option value="marketing">{language === 'ar' ? 'التسويق' : 'Marketing'}</option>
              <option value="sales">{language === 'ar' ? 'المبيعات' : 'Sales'}</option>
              <option value="media_buying">{language === 'ar' ? 'الميديا باير' : 'Media Buying'}</option>
              <option value="social">{language === 'ar' ? 'السوشيال ميديا' : 'Social'}</option>
              <option value="content">{language === 'ar' ? 'صناعة المحتوى' : 'Content'}</option>
              <option value="uiux">{language === 'ar' ? 'تصميم UI/UX' : 'UI/UX'}</option>
              <option value="seo">{language === 'ar' ? 'السيو (SEO)' : 'SEO'}</option>
              <option value="developer">{language === 'ar' ? 'البرمجة والتطوير' : 'Development'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2D372B] bg-white dark:bg-[#151A14] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-slate-100 dark:border-[#2D372B] bg-slate-50/75 dark:bg-[#1E251D] text-slate-500 dark:text-[#BDAF9C]">
              <tr>
                <th className="py-3 px-4 text-start font-bold">#</th>
                <th className="py-3 px-4 text-start font-bold">{language === 'ar' ? 'الموظف' : 'Employee'}</th>
                <th className="py-3 px-4 text-start font-bold">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                <th className="py-3 px-4 text-start font-bold">{language === 'ar' ? 'الدور الوظيفي' : 'Role'}</th>
                <th className="py-3 px-4 text-start font-bold">{language === 'ar' ? 'القسم / الفريق' : 'Department'}</th>
                <th className="py-3 px-4 text-start font-bold">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 text-center font-bold">{language === 'ar' ? 'الإجراءات والتحكم' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D372B]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <span>{language === 'ar' ? 'لا يوجد موظفون مطابقون لخيارات البحث.' : 'No users match criteria.'}</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const roleObj = roles.find((r) => user.roleIds?.includes(r.id)) || roles[0];
                  const isCurrent = user.id === currentUser?.id;
                  const isUserActive = user.status === 'active';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-[#1E251D]/50 transition-colors ${
                        isCurrent ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {user.employeeNumber || String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`}
                            alt={user.name}
                            className="h-8 w-8 rounded-full border border-slate-200 dark:border-[#2D372B] object-cover bg-slate-100"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                                  {language === 'ar' ? 'أنت' : 'You'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-slate-700 dark:text-[#BDAF9C]">
                          {user.email}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {/* Interactive Role Switcher */}
                        <div className="relative inline-block">
                          <select
                            value={roleObj?.id || 'role-founder'}
                            onChange={(e) => handleChangeUserRole(user, e.target.value)}
                            disabled={!isOwner && !isAdminOrOwner}
                            className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#2D372B] bg-slate-50/80 dark:bg-[#1E251D] py-1 px-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4C5540] cursor-pointer disabled:cursor-default"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nameAr || r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-[#1E251D] px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-[#BDAF9C]">
                          <Briefcase className="h-2.5 w-2.5" />
                          <span>{user.team || 'operations'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isCurrent || (!isOwner && !isAdminOrOwner)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            isUserActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {isUserActive ? (
                            <>
                              <UserCheck className="h-3 w-3" />
                              <span>{language === 'ar' ? 'نشط' : 'Active'}</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3" />
                              <span>{language === 'ar' ? 'معطل' : 'Inactive'}</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Copy Credentials */}
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-[#1E251D] transition-colors cursor-pointer"
                            title="نسخ بيانات الدخول (البريد وكلمة المرور)"
                          >
                            {copiedId === user.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Reset Password Prompt */}
                          {(isOwner || isAdminOrOwner) && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserForResetPass(user);
                                setNewPasswordInput('Shal@2025');
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                              title="إعادة تعيين كلمة المرور"
                            >
                              <Key className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Individual Permissions View */}
                          <button
                            type="button"
                            onClick={() => setUserForPermissions(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#4C5540] hover:bg-[#4C5540]/10 transition-colors cursor-pointer"
                            title="استعراض وتفصيل الصلاحيات"
                          >
                            <Shield className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Results Modal */}
      {syncResults?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#151A14] p-5 shadow-2xl border border-slate-200 dark:border-[#2D372B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D372B]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تقرير مزامنة وتهيئة الحسابات' : 'Account Provisioning Report'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSyncResults(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-3 text-xs text-slate-600 dark:text-[#BDAF9C]">
              <p className="font-semibold mb-2">
                {language === 'ar'
                  ? `تمت مزامنة ${syncResults.successCount} من ${syncResults.total} حساباً بنجاح في المنظومة وقاعدة البيانات:`
                  : `Successfully synced ${syncResults.successCount} of ${syncResults.total} accounts:`}
              </p>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2D372B] rounded-xl border border-slate-100 dark:border-[#2D372B] bg-slate-50/50 dark:bg-[#1E251D]">
                {syncResults.results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 text-[11px]">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">{r.role}</span>
                      <span className="font-mono text-slate-500 text-[10px]">{r.email}</span>
                    </div>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium text-[10px] bg-emerald-100/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                      {r.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#2D372B] flex justify-end">
              <button
                type="button"
                onClick={() => setSyncResults(null)}
                className="rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B4432] cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق التقرير' : 'Close Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {userForResetPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#151A14] p-5 shadow-2xl border border-slate-200 dark:border-[#2D372B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D372B]">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset User Password'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUserForResetPass(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-[#BDAF9C]">
                {language === 'ar'
                  ? `أدخل كلمة المرور الجديدة للموظف: ${userForResetPass.name} (${userForResetPass.email})`
                  : `Enter new password for ${userForResetPass.name}:`}
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#2D372B] bg-slate-50 dark:bg-[#1E251D] px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#2D372B] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserForResetPass(null)}
                className="rounded-xl border border-slate-200 dark:border-[#2D372B] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-[#BDAF9C] hover:bg-slate-50 cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!newPasswordInput.trim() || newPasswordInput.length < 6) {
                    showToast({
                      type: 'warning',
                      title: 'تنبيه',
                      message: 'يجب ألا تقل كلمة المرور عن 6 أحرف.',
                    });
                    return;
                  }
                  await adminResetPassword(userForResetPass.id, newPasswordInput.trim());
                  showToast({
                    type: 'success',
                    title: 'تم تحديث كلمة المرور',
                    message: `تم تعيين كلمة المرور الجديدة للموظف ${userForResetPass.name}`,
                  });
                  setUserForResetPass(null);
                }}
                className="rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B4432] cursor-pointer"
              >
                {language === 'ar' ? 'حفظ وتأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Inspector Modal */}
      {userForPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#151A14] p-5 shadow-2xl border border-slate-200 dark:border-[#2D372B]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D372B]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#4C5540]" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'ar' ? 'مصفوفة صلاحيات الموظف' : 'User Permission Matrix'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {userForPermissions.name} ({userForPermissions.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserForPermissions(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-3 max-h-80 overflow-y-auto space-y-2">
              {permissions.map((perm) => {
                const roleObj = roles.find((r) => userForPermissions.roleIds?.includes(r.id)) || roles[0];
                const hasPerm = roleObj?.permissions.includes(perm.key as PermissionKey);

                return (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-[#2D372B] bg-slate-50/60 dark:bg-[#1E251D] text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">
                        {language === 'ar' ? perm.labelAr : perm.labelEn}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{perm.key}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasPerm
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {hasPerm
                        ? language === 'ar'
                          ? 'مفعلة'
                          : 'Granted'
                        : language === 'ar'
                        ? 'غير مصرح'
                        : 'Denied'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#2D372B] flex justify-end">
              <button
                type="button"
                onClick={() => setUserForPermissions(null)}
                className="rounded-xl bg-[#4C5540] px-4 py-2 text-xs font-bold text-white hover:bg-[#3B4432] cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
