import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Palette,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Calendar,
  CheckSquare,
  MessageSquare,
  LayoutDashboard,
  Gauge,
  BarChart3,
  Compass,
  Grid,
  MessageCircle,
  Radio,
  Send,
  ListTodo,
  Kanban,
  ClipboardList,
  CheckCircle2,
  Briefcase,
  Handshake,
  Users,
  Share2,
  Megaphone,
  Flame,
  SlidersHorizontal,
  Settings,
  Key,
  FolderGit2,
  Edit2,
  Upload,
  Link as LinkIcon,
  Eye,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ShalLogo, SHAL_LOGO_IMAGE_PATH, getShalEmployeeAvatar } from '../common/ShalLogo';

export const AssetCustomizerView: React.FC = () => {
  const {
    currentUser,
    hasPermission,
    customAssets,
    updateCustomAsset,
    updateNavIcon,
    updateMemberAvatar,
    updateClientLogo,
    resetCustomAssets,
    users,
    clients,
    showToast,
    language,
  } = useApp();

  // Strict RBAC check: only Founder, Operations Manager, or users with role/member management rights
  const isSuperAdmin =
    currentUser.roleIds.includes('role-founder') ||
    currentUser.roleIds.includes('role-operations-manager');
  const canManage =
    isSuperAdmin ||
    hasPermission('can_manage_roles') ||
    hasPermission('can_manage_team_members');

  const [activeSubTab, setActiveSubTab] = useState<'logo' | 'navIcons' | 'avatars' | 'clients'>('logo');

  // Brand Logo form state
  const [customLogoUrl, setCustomLogoUrl] = useState(customAssets.brandLogoUrl || SHAL_LOGO_IMAGE_PATH);
  const [customBrandNameAr, setCustomBrandNameAr] = useState(customAssets.brandNameAr || 'شال');
  const [customBrandNameEn, setCustomBrandNameEn] = useState(customAssets.brandNameEn || 'SHAL');

  // Avatar edit modal/selection state
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || 'user-founder');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');

  // Client edit selection state
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [customClientLogoUrl, setCustomClientLogoUrl] = useState<string>('');

  // Preset logo options for quick one-click redesign
  const LOGO_PRESETS = [
    {
      id: 'shal_original',
      title: 'شعار شال الأصلي (Artboard 6)',
      url: SHAL_LOGO_IMAGE_PATH,
      description: 'اللوجو المعتمد للوكالة من ملف الهوية البصرية',
    },
    {
      id: 'shal_gold_crest',
      title: 'شعار شال الملكي (Gold Edition)',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      description: 'نسخة ذهبية فاخرة مستوحاة من الأناقة والتراث المعاصر',
    },
    {
      id: 'shal_minimal_olive',
      title: 'شعار شال الزيتي المينيمال (Olive Minimal)',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
      description: 'رمز تبسيطي يركز على تدرجات شال الزيتية الرصينة',
    },
    {
      id: 'shal_geometric_modern',
      title: 'شعار شال الهندسي (Modern Monogram)',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&auto=format&fit=crop&q=80',
      description: 'تجريد هندسي عصري يعكس الابتكار الرقمي والتقني',
    },
  ];

  // Available icon options per navigation tab
  const NAV_ICON_OPTIONS: Record<
    string,
    { labelAr: string; current: string; options: { name: string; icon: any }[] }
  > = {
    dashboard: {
      labelAr: 'لوحة التحكم والمؤشرات الرئيسية',
      current: customAssets.navIcons?.dashboard || 'LayoutDashboard',
      options: [
        { name: 'LayoutDashboard', icon: LayoutDashboard },
        { name: 'Gauge', icon: Gauge },
        { name: 'BarChart3', icon: BarChart3 },
        { name: 'Compass', icon: Compass },
        { name: 'Grid', icon: Grid },
      ],
    },
    chat: {
      labelAr: 'منظومة الدردشة والتنسيق اللحظي',
      current: customAssets.navIcons?.chat || 'MessageSquare',
      options: [
        { name: 'MessageSquare', icon: MessageSquare },
        { name: 'MessageCircle', icon: MessageCircle },
        { name: 'Radio', icon: Radio },
        { name: 'Send', icon: Send },
        { name: 'Sparkles', icon: Sparkles },
      ],
    },
    tasks: {
      labelAr: 'إدارة المهام والعمليات اليومية',
      current: customAssets.navIcons?.tasks || 'CheckSquare',
      options: [
        { name: 'CheckSquare', icon: CheckSquare },
        { name: 'ListTodo', icon: ListTodo },
        { name: 'Kanban', icon: Kanban },
        { name: 'ClipboardList', icon: ClipboardList },
        { name: 'CheckCircle2', icon: CheckCircle2 },
      ],
    },
    clients: {
      labelAr: 'علاقات العملاء وعقود الوكالة (CRM)',
      current: customAssets.navIcons?.clients || 'Building2',
      options: [
        { name: 'Building2', icon: Building2 },
        { name: 'Briefcase', icon: Briefcase },
        { name: 'Handshake', icon: Handshake },
        { name: 'Users', icon: Users },
        { name: 'FolderGit2', icon: FolderGit2 },
      ],
    },
    social: {
      labelAr: 'تقويم السوشيال ميديا ونشر المحتوى',
      current: customAssets.navIcons?.social || 'Calendar',
      options: [
        { name: 'Calendar', icon: Calendar },
        { name: 'Share2', icon: Share2 },
        { name: 'Megaphone', icon: Megaphone },
        { name: 'Flame', icon: Flame },
        { name: 'Sparkles', icon: Sparkles },
      ],
    },
    admin: {
      labelAr: 'لوحة التحكم الإدارية ومصفوفة الصلاحيات (RBAC)',
      current: customAssets.navIcons?.admin || 'ShieldCheck',
      options: [
        { name: 'ShieldCheck', icon: ShieldCheck },
        { name: 'SlidersHorizontal', icon: SlidersHorizontal },
        { name: 'Settings', icon: Settings },
        { name: 'Key', icon: Key },
        { name: 'Palette', icon: Palette },
      ],
    },
  };

  // If user is not authorized, render clear access restricted message
  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-white p-12 text-center shadow-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-cairo">
          {language === 'ar' ? 'صلاحية الوصول غير متوفرة' : 'Access Restricted'}
        </h3>
        <p className="mt-2 text-xs text-slate-500 max-w-md leading-relaxed font-cairo">
          {language === 'ar'
            ? 'تعديل وتخصيص هوية التطبيق، الأيقونات، والشعارات مقتصر حصرياً على الإدارة العليا (المؤسس، مدير العمليات) أو أصحاب الصلاحيات الإدارية المعتمدة.'
            : 'Customizing brand assets, navigation icons, and member imagery is strictly restricted to Administrators and authorized management roles.'}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-1.5 text-xs text-slate-600 font-mono">
          <span>دورك الحالي: {currentUser.name}</span>
        </div>
      </div>
    );
  }

  // Handle saving brand logo & name
  const handleSaveBrandIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomAsset('brandLogoUrl', customLogoUrl);
    updateCustomAsset('brandNameAr', customBrandNameAr);
    updateCustomAsset('brandNameEn', customBrandNameEn);
  };

  // Handle saving member avatar
  const handleSaveMemberAvatar = () => {
    if (!selectedUserId || !customAvatarUrl.trim()) return;
    updateMemberAvatar(selectedUserId, customAvatarUrl.trim());
    setCustomAvatarUrl('');
  };

  // Handle resetting member avatar to standard badge
  const handleResetMemberAvatar = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const defaultAvatar = getShalEmployeeAvatar(targetUser.employeeNumber || '01');
    updateMemberAvatar(userId, defaultAvatar);
  };

  // Handle saving client logo
  const handleSaveClientLogo = () => {
    if (!selectedClientId || !customClientLogoUrl.trim()) return;
    updateClientLogo(selectedClientId, customClientLogoUrl.trim());
    setCustomClientLogoUrl('');
  };

  const selectedMember = users.find((u) => u.id === selectedUserId) || users[0];
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-l from-[#24291F] via-[#3B4432] to-[#4C5540] p-6 text-white shadow-md border border-[#BDAF9C]/30">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xs">
            <Palette className="h-6 w-6 text-[#E9E1D6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-cairo tracking-tight text-white">
                أستوديو تخصيص وتعديل أيقونات وصور المنظومة
              </h1>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200">
                إدارة وصلاحيات عليا فقط
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#E9E1D6]/85 font-cairo">
              إمكانية إعادة تصميم، تعديل، وتبديل أي أيقونة، شعار، صورة مصغرة، أو أفاتار للموظفين والعملاء مع التطبيق اللحظي.
            </p>
          </div>
        </div>

        {/* Global Reset */}
        <button
          onClick={resetCustomAssets}
          className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-bold text-[#FAF7F2] border border-white/20 hover:border-rose-400/40 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          title="استعادة كافة الأيقونات والشعارات الافتراضية للوكالة"
        >
          <RotateCcw className="h-4 w-4 text-[#D4C7B7]" />
          <span>استعادة الضبط الأصلي</span>
        </button>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#BDAF9C]/30 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('logo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'logo'
              ? 'bg-[#4C5540] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#FAF7F2] border border-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>هوية وشعار الوكالة</span>
        </button>

        <button
          onClick={() => setActiveSubTab('navIcons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'navIcons'
              ? 'bg-[#4C5540] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#FAF7F2] border border-slate-200'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>أيقونات القوائم والتنقل</span>
        </button>

        <button
          onClick={() => setActiveSubTab('avatars')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'avatars'
              ? 'bg-[#4C5540] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#FAF7F2] border border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>صور وأفاتار الموظفين ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'clients'
              ? 'bg-[#4C5540] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#FAF7F2] border border-slate-200'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>شعارات وصور العملاء ({clients.length})</span>
        </button>
      </div>

      {/* Tab 1: Brand Logo & Identity */}
      {activeSubTab === 'logo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Side */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#BDAF9C]/30 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-cairo">
                تعديل وتخصيص شعار شال الرئيسي
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك كتابة رابط صورة أو اختيار من القوالب المجهزة مسبقاً لتغيير الشعار في كافة صفحات المنظومة.
              </p>
            </div>

            <form onSubmit={handleSaveBrandIdentity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رابط صورة الشعار (URL أو مسار SVG / PNG)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="https://... أو /assets/..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-xs text-slate-900 focus:border-[#4C5540] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الاسم بالعربية
                  </label>
                  <input
                    type="text"
                    value={customBrandNameAr}
                    onChange={(e) => setCustomBrandNameAr(e.target.value)}
                    placeholder="شال"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#4C5540] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    الاسم بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={customBrandNameEn}
                    onChange={(e) => setCustomBrandNameEn(e.target.value)}
                    placeholder="SHAL"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#4C5540] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-shal-primary text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>تطبيق وحفظ هوية الشعار</span>
                </button>
              </div>
            </form>

            {/* Presets */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800">
                قوالب وتصاميم جاهزة للشعار (بنقرة واحدة):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LOGO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCustomLogoUrl(preset.url);
                      updateCustomAsset('brandLogoUrl', preset.url);
                    }}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                      customLogoUrl === preset.url
                        ? 'border-[#4C5540] bg-[#4C5540]/5 ring-1 ring-[#4C5540]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {preset.title}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Side */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#BDAF9C]/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#4C5540]" />
                  <span>معاينة فورية حية للشعار</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  تحديث لحظي
                </span>
              </div>

              {/* Dark Theme Header Preview */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  المظهر على الشريط العلوي الداكن (Dark Header):
                </label>
                <div className="rounded-xl bg-[#24291F] p-4 border border-[#BDAF9C]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={customLogoUrl}
                      alt="Brand Preview"
                      className="h-9 w-9 rounded-lg object-cover border border-white/20"
                    />
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-sm font-black text-[#FAF7F2] font-cairo">
                        {customBrandNameAr}
                      </span>
                      <span className="text-[#BDAF9C] text-xs">|</span>
                      <span className="text-xs tracking-wider text-[#D4C7B7] font-mono">
                        {customBrandNameEn}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-white/10 text-[#E9E1D6] border border-white/10">
                    AGENCY
                  </span>
                </div>
              </div>

              {/* Light Theme Preview */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  المظهر على الخلفية الفاتحة (Light Background):
                </label>
                <div className="rounded-xl bg-[#FAF7F2] p-4 border border-[#BDAF9C]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={customLogoUrl}
                      alt="Brand Preview"
                      className="h-9 w-9 rounded-lg object-cover border border-slate-300"
                    />
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-sm font-black text-[#24291F] font-cairo">
                        {customBrandNameAr}
                      </span>
                      <span className="text-[#BDAF9C] text-xs">|</span>
                      <span className="text-xs tracking-wider text-[#4C5540] font-mono">
                        {customBrandNameEn}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-[#4C5540]/10 text-[#4C5540] border border-[#4C5540]/20">
                    AGENCY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Navigation & Module Icons */}
      {activeSubTab === 'navIcons' && (
        <div className="bg-white rounded-2xl p-6 border border-[#BDAF9C]/30 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-cairo">
              تخصيص أيقونات القوائم والتنقل (Navigation Icons)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              حدد الأيقونة المناسبة لكل قسم من أقسام المنظومة؛ سيتم تطبيقها فوراً في القائمة الجانبية (Sidebar) ولوحة التحكم.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(NAV_ICON_OPTIONS).map(([navKey, info]) => {
              const currentSelected = customAssets.navIcons?.[navKey as keyof typeof customAssets.navIcons] || info.current;

              return (
                <div
                  key={navKey}
                  className="rounded-xl border border-slate-200 bg-[#FAF7F2]/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{info.labelAr}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      {navKey}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {info.options.map(({ name, icon: IconComp }) => {
                      const isChosen = currentSelected === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => updateNavIcon(navKey, name)}
                          title={`اختيار أيقونة ${name}`}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                            isChosen
                              ? 'bg-[#4C5540] text-white border-[#4C5540] shadow-sm scale-110 ring-2 ring-[#4C5540]/30'
                              : 'bg-white text-slate-600 hover:text-[#4C5540] border-slate-200 hover:border-[#4C5540]/40'
                          }`}
                        >
                          <IconComp className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                    <span>الأيقونة النشطة:</span>
                    <span className="font-bold text-[#4C5540]">{currentSelected}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Member Avatars */}
      {activeSubTab === 'avatars' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Member List */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#BDAF9C]/30 shadow-xs space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              اختر الموظف لتعديل صورته المصغرة:
            </h3>

            <div className="space-y-1.5">
              {users.map((member) => {
                const isSelected = selectedUserId === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedUserId(member.id);
                      setCustomAvatarUrl(member.avatar);
                    }}
                    className={`w-full text-right p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-[#4C5540] text-white border-[#4C5540] shadow-sm'
                        : 'bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-9 w-9 rounded-lg object-cover border border-white/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{member.name}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          #{member.employeeNumber} • {member.team}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10">
                      تعديل
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#BDAF9C]/30 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-cairo">
                تعديل وتعيين أفاتار للموظف: {selectedMember.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك وضع رابط مباشر للصورة، أو اختيار استعادة شارة شال الرسمية المرقّمة.
              </p>
            </div>

            {/* Current Avatar Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-slate-200">
              <img
                src={customAvatarUrl || selectedMember.avatar}
                alt={selectedMember.name}
                className="h-16 w-16 rounded-xl object-cover border-2 border-[#4C5540] shadow-xs"
              />
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">{selectedMember.name}</div>
                <div className="text-xs text-slate-500">{selectedMember.email}</div>
                <div className="text-[10px] font-mono text-[#4C5540] font-bold">
                  الرقم الوظيفي: #{selectedMember.employeeNumber}
                </div>
              </div>
            </div>

            {/* URL input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                رابط الصورة الجديد (Avatar Image URL)
              </label>
              <div className="relative">
                <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://... أو data:image/..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-xs text-slate-900 focus:border-[#4C5540] focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveMemberAvatar}
                disabled={!customAvatarUrl.trim()}
                className="btn-shal-primary text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>حفظ وتطبيق الصورة</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetMemberAvatar(selectedMember.id)}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>استعادة شارة شال الرسمية</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Client Logos */}
      {activeSubTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Client List */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#BDAF9C]/30 shadow-xs space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
              اختر العميل لتعديل شعاره أو صورته:
            </h3>

            <div className="space-y-1.5">
              {clients.map((client) => {
                const isSelected = selectedClientId === client.id;
                const clientLogo = customAssets.clientLogos?.[client.id];

                return (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setCustomClientLogoUrl(clientLogo || '');
                    }}
                    className={`w-full text-right p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-[#4C5540] text-white border-[#4C5540] shadow-sm'
                        : 'bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {clientLogo ? (
                        <img
                          src={clientLogo}
                          alt={client.name}
                          className="h-8 w-8 rounded-lg object-cover border border-white/20 shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {client.company.slice(0, 2)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{client.company}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {client.industry} • {client.packageTitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10">
                      تعديل
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Logo Editor */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#BDAF9C]/30 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-cairo">
                تعديل شعار العميل: {selectedClient.company}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديث الصورة المصغرة أو اللوجو الخاص بالعميل في سجلات الـ CRM ولوحات المتابعة.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                رابط شعار العميل (Client Logo Image URL)
              </label>
              <div className="relative">
                <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={customClientLogoUrl}
                  onChange={(e) => setCustomClientLogoUrl(e.target.value)}
                  placeholder="https://... شعار الشركة أو المشروع"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-3 text-xs text-slate-900 focus:border-[#4C5540] focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveClientLogo}
                disabled={!customClientLogoUrl.trim()}
                className="btn-shal-primary text-xs py-2 px-5 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>حفظ وتحديث شعار العميل</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
