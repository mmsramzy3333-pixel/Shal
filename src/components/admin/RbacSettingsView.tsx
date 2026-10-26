import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, User, PermissionCategory } from '../../types';
import {
  ShieldCheck,
  Users,
  Plus,
  Lock,
  Unlock,
  Check,
  Trash2,
  Edit2,
  X,
  UserPlus,
  Key,
  Shield,
  Briefcase,
  Calendar,
  Settings,
  Sparkles,
  AlertCircle,
  Palette,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';

import { AssetCustomizerView } from './AssetCustomizerView';

export const RbacSettingsView: React.FC = () => {
  const {
    roles,
    users,
    permissions,
    currentUser,
    setCurrentUser,
    addRole,
    updateRolePermissions,
    deleteRole,
    addUser,
    updateUser,
    deleteUser,
    profileRequests,
    approveProfileChangeRequest,
    rejectProfileChangeRequest,
    hasPermission,
    language,
    resetDemoData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'matrix' | 'members' | 'approvals' | 'assets'>('matrix');
  const [selectedRole, setSelectedRole] = useState<Role>(roles[0]);

  // Add Role modal
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleNameAr, setNewRoleNameAr] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#2563EB');

  // Add User modal (Restricted exclusively to Owner / Management)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('Shal@2026');
  const [userEmployeeNumber, setUserEmployeeNumber] = useState('');
  const [userTeam, setUserTeam] = useState<any>('operations');
  const [userRoleId, setUserRoleId] = useState(roles[0]?.id || 'role-founder');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Rejection note prompt
  const [rejectReqId, setRejectReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // In-app confirmation dialogs (eliminating window.confirm)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Strictly ensure only Founder and Operations Manager can manage roles and users
  const isSuperAdmin =
    currentUser.roleIds.includes('role-founder') ||
    currentUser.roleIds.includes('role-operations-manager');
  const canManageRoles = isSuperAdmin || hasPermission('can_manage_roles');
  const canManageMembers = isSuperAdmin || hasPermission('can_manage_team_members');

  // Group permissions by agency category
  const categories: { id: PermissionCategory; labelAr: string; labelEn: string; icon: any }[] = [
    { id: 'admin', labelAr: 'الإدارة العليا ومصفوفة الصلاحيات', labelEn: 'Executive & RBAC', icon: Settings },
    { id: 'marketing', labelAr: 'التسويق والميديا باير والـ SEO', labelEn: 'Marketing, Ads & SEO', icon: Sparkles },
    { id: 'sales', labelAr: 'المبيعات والصفقات وعروض الأسعار', labelEn: 'Sales & Deals', icon: Briefcase },
    { id: 'crm', labelAr: 'علاقات العملاء وإدارة العقود', labelEn: 'Client Retainers', icon: Briefcase },
    { id: 'tasks', labelAr: 'المهام والعمليات والإنتاجية', labelEn: 'Tasks & Operations', icon: Check },
    { id: 'social', labelAr: 'السوشيال ميديا وصناعة المحتوى', labelEn: 'Social & Content', icon: Calendar },
    { id: 'tech', labelAr: 'البرمجة وتصميم تجربة المستخدم (UI/UX)', labelEn: 'Dev & UI/UX', icon: Key },
  ];

  const handleTogglePermission = (roleId: string, permKey: string) => {
    if (!canManageRoles) return;
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) return;

    const exists = targetRole.permissions.includes(permKey as any);
    const updated = exists
      ? targetRole.permissions.filter((k) => k !== permKey)
      : [...targetRole.permissions, permKey as any];

    updateRolePermissions(roleId, updated);

    if (selectedRole.id === roleId) {
      setSelectedRole({
        ...selectedRole,
        permissions: updated,
      });
    }
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    addRole({
      name: newRoleName,
      nameAr: newRoleNameAr || newRoleName,
      code: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      description: newRoleDesc,
      descriptionAr: newRoleDesc || newRoleNameAr,
      permissions: [],
      isSystem: false,
      color: newRoleColor,
    });

    setIsAddRoleOpen(false);
    setNewRoleName('');
    setNewRoleNameAr('');
    setNewRoleDesc('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const empNum = userEmployeeNumber.trim() || String(users.length + 1).padStart(2, '0');
    addUser({
      name: userName.trim(),
      email: userEmail.trim() || `${userName.toLowerCase().replace(/\s+/g, '')}@shal.agency`,
      password: userPassword || 'Shal@2026',
      employeeNumber: empNum,
      roleIds: [userRoleId],
      team: userTeam,
      status: 'active',
    });

    setIsAddUserOpen(false);
    setUserName('');
    setUserEmail('');
    setUserEmployeeNumber('');
    setUserPassword('Shal@2026');
  };

  const pendingApprovals = profileRequests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
              {language === 'ar' ? 'إدارة الفريق والأدوار وموافقات الحسابات' : 'Team, Roles & Approvals'}
            </h2>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              {language === 'ar' ? 'وكالة شال | Shal Agency' : 'Shal Agency'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'إدارة الأدوار الـ 11 لوكالة شال، التحكم في صلاحيات كل موظف، واعتماد طلبات تعديل الأسماء والصور.'
              : 'Configure the 11 Shal agency roles, permission matrix, and approve profile change requests.'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'matrix' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            {language === 'ar' ? 'مصفوفة الصلاحيات' : 'Roles Matrix'}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'members' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            {language === 'ar' ? 'حسابات الموظفين (11)' : 'Team Members'}
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'approvals' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{language === 'ar' ? 'موافقات التعديل' : 'Approvals Queue'}</span>
            {pendingApprovals.length > 0 && (
              <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[9px] font-black">
                {pendingApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assets' ? 'bg-[#4C5540] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>{language === 'ar' ? 'تخصيص الأيقونات والصور' : 'Custom Assets'}</span>
          </button>
        </div>
      </div>

      {/* Agency Roles Overview Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1b24f5] text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'الهيكل التنظيمي المعتمد للأدوار الوظيفية والصلاحيات' : 'Roles & RBAC Architecture'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'ar'
                  ? 'الأدوار الافتراضية الأساسية: المدير العام (Super Admin)، مدير العمليات (Operations Manager)، صانع المحتوى والتصميم (Content Creator)، ومطور البرمجيات (Developer).'
                  : 'Core roles: Super Admin, Operations Manager, Content Creator, Developer, plus custom agency roles.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#b5f812]/20 border border-[#b5f812]/40 px-3 py-1 text-[11px] font-extrabold text-[#0b0f4a]">
              <span className="h-2 w-2 rounded-full bg-[#b5f812] animate-pulse" />
              {roles.length} {language === 'ar' ? 'أدوار نشطة' : 'Active Roles'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => {
            const isSelected = selectedRole.id === r.id;
            const membersCount = users.filter((u) => u.roleIds.includes(r.id)).length;
            return (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedRole(r);
                  setActiveTab('matrix');
                }}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-[#1b24f5] bg-[#1b24f5]/5 shadow-xs'
                    : 'border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: `${r.color}15`, color: r.color }}
                  >
                    {membersCount} {language === 'ar' ? 'موظف' : 'members'}
                  </span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-900 truncate">
                  {language === 'ar' ? r.nameAr : r.name}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {language === 'ar' ? r.descriptionAr || r.description : r.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MATRIX VIEW */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-start">
          {/* Roles Selector Sidebar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-indigo-600" />
                {language === 'ar' ? 'الأدوار الوظيفية المعرفة' : 'Configured Roles'}
              </h3>
              {canManageRoles && (
                <button
                  onClick={() => setIsAddRoleOpen(true)}
                  className="rounded-lg p-1 text-indigo-600 hover:bg-indigo-50"
                  title="إضافة دور مخصص جديد"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {roles.map((role) => {
                const isSelected = selectedRole.id === role.id;
                const membersWithRole = users.filter((u) => u.roleIds.includes(role.id)).length;

                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full flex items-center justify-between rounded-xl p-2.5 text-start transition-all border ${
                      isSelected
                        ? 'border-indigo-200 bg-indigo-50/70 text-indigo-950 font-bold shadow-2xs'
                        : 'border-transparent text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: role.color }}
                      />
                      <div>
                        <p className="text-xs">{language === 'ar' ? role.nameAr : role.name}</p>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {membersWithRole} {language === 'ar' ? 'موظفين' : 'members'} •{' '}
                          {role.permissions.length} {language === 'ar' ? 'صلاحيات' : 'perms'}
                        </span>
                      </div>
                    </div>

                    {role.isSystem && (
                      <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-semibold text-slate-500">
                        System
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Permissions Matrix Detail for Selected Role */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            {/* Header of selected role */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: selectedRole.color }}
                  />
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'ar' ? selectedRole.nameAr : selectedRole.name}
                  </h3>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                    {selectedRole.permissions.length} / {permissions.length} {language === 'ar' ? 'صلاحية مفعلة' : 'permissions active'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{selectedRole.description}</p>
              </div>

              {!selectedRole.isSystem && canManageRoles && (
                <button
                  type="button"
                  onClick={() => setRoleToDelete(selectedRole)}
                  className="btn-interactive flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 shadow-2xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {language === 'ar' ? 'حذف هذا الدور' : 'Delete Role'}
                </button>
              )}
            </div>

            {/* Permissions Checkbox Grid by Module */}
            <div className="mt-5 space-y-6">
              {categories.map((cat) => {
                const catPermissions = permissions.filter((p) => p.category === cat.id);
                const CatIcon = cat.icon;

                return (
                  <div key={cat.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/60">
                      <CatIcon className="h-4 w-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-800">
                        {language === 'ar' ? cat.labelAr : cat.labelEn}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {catPermissions.map((perm) => {
                        const isGranted = selectedRole.permissions.includes(perm.key);

                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-3 rounded-xl p-2.5 border transition-all cursor-pointer ${
                              isGranted
                                ? 'bg-white border-indigo-200 shadow-2xs'
                                : 'bg-white/60 border-slate-200 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isGranted}
                              disabled={!canManageRoles || (selectedRole.id === 'role-super-admin' && perm.key === 'can_manage_roles')}
                              onChange={() => handleTogglePermission(selectedRole.id, perm.key)}
                              className="h-4 w-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div>
                              <p className={`text-xs font-bold ${isGranted ? 'text-slate-900' : 'text-slate-600'}`}>
                                {language === 'ar' ? perm.labelAr : perm.labelEn}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                                {language === 'ar' ? perm.descriptionAr : perm.descriptionEn}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TEAM MEMBERS VIEW */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'أعضاء الفريق وحسابات الدخول' : 'Team Members & Access Accounts'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'ar'
                  ? 'تسجيل الموظفين وتعيين كلمات المرور والأدوار الوظيفية (خاص بالمدير العام Super Admin).'
                  : 'Manage team staff, login credentials, passwords, and assigned roles.'}
              </p>
            </div>

            {canManageMembers && (
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="btn-interactive flex items-center gap-1.5 rounded-xl bg-[#4C5540] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#3B4432] shadow-xs cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                {language === 'ar' ? 'إضافة موظف واعتماد حسابه' : 'New Member'}
              </button>
            )}
          </div>

          {!isSuperAdmin && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'تنبيه أمني: إدارة المستخدمين وتعديل الصلاحيات وتعيين كلمات المرور مقتصرة حصرياً على حساب المدير العام (Super Admin).'
                  : 'Notice: User registration, credential provisioning, and role assignment is restricted strictly to Super Admins.'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => {
              const userRolesList = roles.filter((r) => user.roleIds.includes(r.id));
              const isCurrent = user.id === currentUser.id;
              const isUserSuperAdmin = user.roleIds.includes('role-super-admin') || user.email === 'medhat.nabdalwusul@gmail.com';

              return (
                <div
                  key={user.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all ${
                    isCurrent
                      ? 'border-[#1b24f5] bg-blue-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900">{user.name}</h4>
                            {isCurrent && (
                              <span className="rounded bg-[#4C5540] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                {language === 'ar' ? 'أنت' : 'You'}
                              </span>
                            )}
                            {isUserSuperAdmin && (
                              <span className="rounded bg-purple-100 px-1 py-0.2 text-[9px] font-bold text-purple-800">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          user.team === 'operations'
                            ? 'bg-blue-100 text-blue-800'
                            : user.team === 'content'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.team === 'developer'
                            ? 'bg-cyan-100 text-cyan-800'
                            : user.team === 'social'
                            ? 'bg-sky-100 text-sky-800'
                            : user.team === 'design'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {user.team === 'operations'
                          ? language === 'ar' ? 'العمليات' : 'Operations'
                          : user.team === 'content'
                          ? language === 'ar' ? 'المحتوى' : 'Content'
                          : user.team === 'developer'
                          ? language === 'ar' ? 'البرمجة' : 'Development'
                          : user.team === 'social'
                          ? language === 'ar' ? 'سوشيال ميديا' : 'Social'
                          : user.team === 'design'
                          ? language === 'ar' ? 'جرافيك ديزاين' : 'Design'
                          : language === 'ar' ? 'الإدارة العامة' : 'Management'}
                      </span>
                    </div>

                    {/* Role Tag */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {userRolesList.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                          {language === 'ar' ? r.nameAr : r.name}
                        </span>
                      ))}
                    </div>

                    {/* Super Admin Credential View */}
                    {canManageMembers && (
                      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Key className="h-3 w-3 text-slate-400" />
                          <span className="text-[11px] text-slate-500 font-medium">
                            {language === 'ar' ? 'الباسورد:' : 'Password:'}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-900">
                            {revealedPasswords[user.id] ? (user.password || 'Shal@2026') : '••••••••'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setRevealedPasswords((prev) => ({ ...prev, [user.id]: !prev[user.id] }))}
                            className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-white"
                            title={revealedPasswords[user.id] ? 'إخفاء' : 'إظهار'}
                          >
                            {revealedPasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(user.password || 'Shal@2026');
                            }}
                            className="rounded p-1 text-slate-400 hover:text-[#4C5540] hover:bg-white"
                            title={language === 'ar' ? 'نسخ كلمة المرور' : 'Copy Password'}
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <button
                      onClick={() => setCurrentUser(user)}
                      className="text-xs font-bold text-[#4C5540] hover:text-[#3B4432] flex items-center gap-1"
                      title="تجربة النظام بصلاحيات هذا الموظف"
                    >
                      <Sparkles className="h-3 w-3" />
                      {language === 'ar' ? 'تبديل الحساب' : 'Switch'}
                    </button>

                    {canManageMembers && !isCurrent && !isUserSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => setUserToDelete(user)}
                        className="btn-interactive rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={language === 'ar' ? 'حذف المستخدم' : 'Delete Member'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPROVALS QUEUE VIEW */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>{language === 'ar' ? 'مركز اعتماد طلبات تعديل الأسماء والصور الشخصية' : 'Profile Approvals Center'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ar'
                    ? 'وفقاً لسياسة وكالة شال، لا يتم تفعيل أي تعديل على اسم الموظف أو صورته إلا بعد موافقة وتأكيد الإدارة.'
                    : 'Changes requested by team members remain pending until approved here.'}
                </p>
              </div>
              <span className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                {pendingApprovals.length} {language === 'ar' ? 'طلبات قيد المراجعة' : 'pending'}
              </span>
            </div>

            {profileRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {language === 'ar' ? 'لا توجد طلبات تعديل مسجلة حالياً.' : 'No profile change requests found.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-3">
                {profileRequests.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={req.currentAvatar}
                          alt="Current"
                          className="h-11 w-11 rounded-xl object-cover border border-slate-200"
                        />
                        <span className="text-[9px] font-bold block text-center text-slate-400 mt-0.5">الحالي</span>
                      </div>
                      <span className="text-slate-300 font-bold text-sm">➔</span>
                      <div className="relative">
                        <img
                          src={req.requestedAvatar || req.currentAvatar}
                          alt="Requested"
                          className="h-11 w-11 rounded-xl object-cover border-2 border-emerald-500 shadow-xs"
                        />
                        <span className="text-[9px] font-bold block text-center text-emerald-600 mt-0.5">المطلوب</span>
                      </div>

                      <div className="pr-2 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{req.requestedName}</h4>
                          <span className="text-[10px] text-slate-400 font-normal">({req.currentName})</span>
                          <span className="rounded bg-blue-50 text-[#2563EB] text-[10px] font-bold px-1.5 py-0.2">
                            {req.userRoleName}
                          </span>
                        </div>
                        {req.reason && (
                          <p className="text-[11px] text-slate-500">
                            <strong>ملاحظة الموظف:</strong> {req.reason}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 block">{req.requestedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectReqId(req.id);
                              setRejectReason('');
                            }}
                            className="btn-interactive px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            {language === 'ar' ? 'رفض الطلب' : 'Reject'}
                          </button>
                          <button
                            type="button"
                            onClick={() => approveProfileChangeRequest(req.id)}
                            className="btn-shal-primary text-xs py-1.5 px-3.5 rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>{language === 'ar' ? 'موافقة وتحديث الحساب' : 'Approve & Apply'}</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`rounded px-2.5 py-1 text-xs font-bold ${
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {req.status === 'approved' ? '✓ تم الاعتماد والتطبيق' : '✕ تم الرفض'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Asset Customizer Tab */}
      {activeTab === 'assets' && <AssetCustomizerView />}

      {/* Add Custom Role Modal */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'إضافة دور وظيفي جديد (Custom Role)' : 'Create Custom Role'}
              </h3>
              <button
                onClick={() => setIsAddRoleOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'اسم الدور بالعربية *' : 'Role Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  value={newRoleNameAr}
                  onChange={(e) => setNewRoleNameAr(e.target.value)}
                  placeholder="مثال: مهندس فحص جودة QA"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'اسم الدور بالإنجليزية (ID/Name) *' : 'Role Name (English) *'}
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. QA Automation Engineer"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'وصف المسؤوليات' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="مهام ومسؤوليات هذا الدور..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'لون التمييز' : 'Badge Color'}
                </label>
                <input
                  type="color"
                  value={newRoleColor}
                  onChange={(e) => setNewRoleColor(e.target.value)}
                  className="h-8 w-16 rounded border border-slate-200 cursor-pointer p-0.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddRoleOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs"
                >
                  {language === 'ar' ? 'إنشاء وتفعيل الدور' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal (Exclusively restricted to Owner and Management) */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150 border border-[#BDAF9C]/30">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#4C5540]/10 text-[#4C5540]">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'إضافة موظف جديد واعتماد حسابه' : 'Provision Team Member Account'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {language === 'ar' ? 'خاص بالمالك (الفاوندر) وإدارة العمليات' : 'Owner & Management Exclusive'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Administrative Guarantee Notice */}
            <div className="mt-3 rounded-xl bg-[#FAF7F2] border border-[#BDAF9C]/40 p-2.5 text-[11px] text-[#24291F] flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-[#4C5540] shrink-0 mt-0.5" />
              <span>
                {language === 'ar'
                  ? 'يتم إصدار هذا الحساب مباشرة وتثبيته في قاعدة البيانات. يمكن للموظف تسجيل الدخول فوراً بالبريد وكلمة المرور المحددين أدناه.'
                  : 'This account will be provisioned directly to the agency database. The member can log in immediately using the credentials set below.'}
              </span>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: يوسف كمال' : 'e.g. Youssef Kamal'}
                  className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الرقم الوظيفي (ID)' : 'Employee ID'}
                  </label>
                  <input
                    type="text"
                    value={userEmployeeNumber}
                    onChange={(e) => setUserEmployeeNumber(e.target.value)}
                    placeholder={String(users.length + 1).padStart(2, '0')}
                    className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني للوصول *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="name@shal.agency"
                    className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'كلمة المرور الابتدائية للحساب *' : 'Initial Password *'}
                </label>
                <input
                  type="text"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Shal@2026"
                  className="w-full font-mono rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540]"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {language === 'ar' ? 'يقوم الموظف باستخدام هذه الكلمة لتسجيل الدخول.' : 'Member can use this password to sign in.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'القسم / الفريق' : 'Department / Team'}
                  </label>
                  <select
                    value={userTeam}
                    onChange={(e) => setUserTeam(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-[#4C5540]"
                  >
                    <option value="operations">{language === 'ar' ? 'العمليات والتشغيل' : 'Operations'}</option>
                    <option value="content">{language === 'ar' ? 'صناعة المحتوى والتسويق' : 'Content & Creative'}</option>
                    <option value="developer">{language === 'ar' ? 'تطوير البرمجيات' : 'Development'}</option>
                    <option value="management">{language === 'ar' ? 'الإدارة والعملاء' : 'Management & CRM'}</option>
                    <option value="social">{language === 'ar' ? 'سوشيال ميديا' : 'Social Media'}</option>
                    <option value="design">{language === 'ar' ? 'تصميم وجرافيك' : 'Design'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الدور الوظيفي والصلاحيات' : 'Assigned Role'}
                  </label>
                  <select
                    value={userRoleId}
                    onChange={(e) => setUserRoleId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:border-[#4C5540]"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {language === 'ar' ? r.nameAr : r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="btn-interactive rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn-interactive rounded-xl bg-[#4C5540] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#3B4432] shadow-xs cursor-pointer"
                >
                  {language === 'ar' ? 'اعتماد وإضافة الحساب' : 'Provision Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Rejection Modal for Profile Change Requests */}
      {rejectReqId && (() => {
        const targetReq = profileRequests.find((r) => r.id === rejectReqId);
        const presetReasons = [
          'الصورة المرفوعة غير رسمية أو غير واضحة',
          'الاسم لا يتطابق مع الاسم الوظيفي المعتمد في شال',
          'يرجى مراجعة إدارة العمليات والموارد البشرية',
          'مخالف لضوابط الهوية البصرية الرسمية لوكالة شال',
        ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'رفض طلب تعديل الملف الشخصي' : 'Reject Profile Change Request'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectReqId(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {targetReq && (
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-center gap-3 text-xs">
                  <img
                    src={targetReq.requestedAvatar || targetReq.currentAvatar}
                    alt="avatar"
                    className="h-10 w-10 rounded-xl object-cover border border-slate-300"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{targetReq.requestedName}</p>
                    <p className="text-[10px] text-slate-500">{targetReq.userRoleName} • {targetReq.currentName}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1.5">
                  {language === 'ar' ? 'سبب الرفض (سيتم إخطار الموظف به فورا):' : 'Rejection Reason (notified to user):'}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {presetReasons.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className="btn-interactive text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب سبب الرفض أو اختر من الأسباب الجاهزة أعلاه...' : 'Write custom feedback for the employee...'}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setRejectReqId(null)}
                  className="btn-interactive rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fallbackReason = language === 'ar' ? 'تم رفض الطلب لعدم استيفاء شروط الهوية المعتمدة' : 'Request rejected by management';
                    rejectProfileChangeRequest(rejectReqId, rejectReason.trim() || fallbackReason);
                    setRejectReqId(null);
                    setRejectReason('');
                  }}
                  className="btn-interactive rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  {language === 'ar' ? 'تأكيد الرفض والإخطار' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Role Deletion Safe Confirmation Modal */}
      {roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'تأكيد حذف الدور الوظيفي' : 'Confirm Role Deletion'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ar' ? roleToDelete.nameAr : roleToDelete.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
              {language === 'ar'
                ? 'هل أنت متأكد من رغبتك في حذف هذا الدور نهائياً من مصفوفة الصلاحيات؟'
                : 'Are you sure you want to delete this custom role from the RBAC matrix?'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="btn-interactive rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRole(roleToDelete.id);
                  if (selectedRole.id === roleToDelete.id) {
                    setSelectedRole(roles.find((r) => r.id !== roleToDelete.id) || roles[0]);
                  }
                  setRoleToDelete(null);
                }}
                className="btn-interactive rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                {language === 'ar' ? 'نعم، حذف الدور' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Deletion Safe Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {language === 'ar' ? 'تأكيد حذف الموظف' : 'Confirm Member Deletion'}
                </h3>
                <p className="text-xs text-slate-500">{userToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
              {language === 'ar'
                ? `سيتم إزالة حساب "${userToDelete.name}" والوصول للنظام نهائياً.`
                : `User "${userToDelete.name}" will be removed from system access.`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="btn-interactive rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="btn-interactive rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                {language === 'ar' ? 'نعم، حذف الحساب' : 'Delete Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
