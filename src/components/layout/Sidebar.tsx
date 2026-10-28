import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShalLogo } from '../common/ShalLogo';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  Building2,
  X,
  ShieldCheck,
  Edit3,
  MessageSquare,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  UserCheck,
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
  Share2,
  Megaphone,
  Flame,
  Settings,
  Key,
  Palette,
  FolderGit2,
  Clock,
  LogOut,
} from 'lucide-react';

const NAV_ICONS_LOOKUP: Record<string, any> = {
  LayoutDashboard,
  Gauge,
  BarChart3,
  Compass,
  Grid,
  MessageSquare,
  MessageCircle,
  Radio,
  Send,
  Sparkles,
  CheckSquare,
  ListTodo,
  Kanban,
  ClipboardList,
  CheckCircle2,
  Building2,
  Briefcase,
  Handshake,
  Users,
  FolderGit2,
  Calendar,
  Share2,
  Megaphone,
  Flame,
  ShieldCheck,
  SlidersHorizontal,
  Settings,
  Key,
  Palette,
};

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onOpenProfileModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  onOpenProfileModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    language,
    currentUser,
    currentUserRole,
    contentPosts,
    profileRequests,
    hasPermission,
    unreadChatCount,
    markChatAsRead,
    customAssets,
    logout,
  } = useApp();

  const [isAdminSubmenuOpen, setIsAdminSubmenuOpen] = useState(false);

  // Dynamic Icon Resolver from customAssets
  const getIcon = (key: string, DefaultIcon: any) => {
    const chosenName = customAssets?.navIcons?.[key as keyof typeof customAssets.navIcons];
    if (chosenName && NAV_ICONS_LOOKUP[chosenName]) {
      return NAV_ICONS_LOOKUP[chosenName];
    }
    return DefaultIcon;
  };

  const DashboardIcon = getIcon('dashboard', LayoutDashboard);
  const ChatIcon = getIcon('chat', MessageSquare);
  const TasksIcon = getIcon('tasks', CheckSquare);
  const ClientsIcon = getIcon('clients', Building2);
  const SocialIcon = getIcon('social', Calendar);
  const AdminIcon = getIcon('admin', ShieldCheck);

  const pendingPostsCount = (contentPosts || []).filter((p) => p.status === 'review').length;
  const pendingProfileReqCount = (profileRequests || []).filter((r) => r.status === 'pending').length;

  const canSeeCRM = hasPermission('can_view_clients');
  const canSeeSocial =
    hasPermission('can_publish_posts') ||
    hasPermission('can_approve_content') ||
    currentUser.team === 'content' ||
    currentUser.team === 'social';
  const canSeeAdmin =
    hasPermission('can_manage_roles') ||
    hasPermission('can_manage_team_members') ||
    hasPermission('can_approve_profile_changes');

  const handleAdminSubAction = (actionKey: 'roles' | 'members' | 'profiles' | 'assets') => {
    setActiveTab('admin');
    setIsAdminSubmenuOpen(false);
    onMobileClose();
    // Dispatch custom event to focus specific admin tab
    window.dispatchEvent(new CustomEvent('shal:admin-navigate', { detail: actionKey }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-[#24291F]/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-50 flex w-72 flex-col justify-between border-[#BDAF9C]/35 bg-[#FAF7F2] transition-transform duration-300 lg:static lg:translate-x-0 ${
          language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
        } ${isMobileOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-[#BDAF9C]/30 bg-[#24291F]">
            <ShalLogo variant="full" theme="dark" size="sm" showSubtitle={false} />

            <button
              onClick={onMobileClose}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 lg:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="px-3 py-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#4C5540]/80">
              {language === 'ar' ? 'الوحدات المتاحة لدورك' : 'Your Role Modules'}
            </div>

            {/* 1. Dashboard Nav Button */}
            <button
              id="nav-dashboard"
              onClick={() => {
                setActiveTab('dashboard');
                onMobileClose();
              }}
              className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#4C5540] text-white font-bold shadow-xs'
                  : 'text-[#24291F] hover:bg-[#E9E1D6]/60 hover:text-[#24291F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <DashboardIcon
                  className={`h-4 w-4 transition-all duration-200 group-hover:scale-110 ${
                    activeTab === 'dashboard' ? 'text-white' : 'text-[#4C5540] group-hover:text-[#24291F]'
                  }`}
                />
                <span>{language === 'ar' ? 'مساحة العمل المتخصصة' : 'Specialized Workspace'}</span>
              </div>
            </button>

            {/* 2. Chat Nav Button with Indicator Dot, Unread Count Badge (#4C5540) & Tooltip */}
            <div className="relative group/chat">
              <button
                id="nav-chat"
                onClick={() => {
                  setActiveTab('chat');
                  markChatAsRead();
                  onMobileClose();
                }}
                title={
                  unreadChatCount > 0
                    ? language === 'ar'
                      ? `الدردشة ومتابعة المهام: لديك ${unreadChatCount} رسائل جديدة غير مقروءة`
                      : `Internal Chat & Tasks: You have ${unreadChatCount} unread messages`
                    : language === 'ar'
                    ? 'الدردشة ومتابعة المهام'
                    : 'Internal Chat & Tasks'
                }
                className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-[#4C5540] text-white font-bold shadow-xs'
                    : 'text-[#24291F] hover:bg-[#E9E1D6]/60 hover:text-[#24291F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ChatIcon
                      className={`h-4 w-4 transition-all duration-200 group-hover:scale-110 ${
                        activeTab === 'chat' ? 'text-white' : 'text-[#4C5540] group-hover:text-[#24291F]'
                      }`}
                    />
                    {/* Small Visual Notification Indicator (Dot) */}
                    {unreadChatCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                      </span>
                    )}
                  </div>
                  <span>{language === 'ar' ? 'الدردشة ومتابعة المهام' : 'Internal Chat & Tasks'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Visual badge indicator showing count of unread messages using brand color #4C5540 */}
                  {unreadChatCount > 0 ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono tabular-nums shadow-xs ${
                        activeTab === 'chat'
                          ? 'bg-white text-[#4C5540]'
                          : 'bg-[#4C5540] text-white border border-[#BDAF9C]/40'
                      }`}
                    >
                      {unreadChatCount}
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#4C5540]/10 text-[#4C5540] px-1.5 py-0.2 text-[9px] font-bold">
                      {language === 'ar' ? 'شال' : 'Hub'}
                    </span>
                  )}
                </div>
              </button>

              {/* Styled Hover Tooltip for Chat */}
              <div
                className={`pointer-events-none absolute top-full ${
                  language === 'ar' ? 'right-2' : 'left-2'
                } z-50 mt-1 hidden group-hover/chat:block rounded-lg bg-[#24291F] px-2.5 py-1 text-[10px] font-bold text-[#E9E1D6] shadow-lg border border-[#BDAF9C]/30 whitespace-nowrap`}
              >
                {unreadChatCount > 0
                  ? language === 'ar'
                    ? `💬 ${unreadChatCount} رسائل غير مقروءة بانتظارك`
                    : `💬 ${unreadChatCount} unread messages waiting`
                  : language === 'ar'
                  ? 'محادثات فورية وتداول المهام'
                  : 'Real-time internal team discussions'}
              </div>
            </div>

            {/* 3. Tasks Nav Button */}
            <button
              id="nav-tasks"
              onClick={() => {
                setActiveTab('tasks');
                onMobileClose();
              }}
              className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-[#4C5540] text-white font-bold shadow-xs'
                  : 'text-[#24291F] hover:bg-[#E9E1D6]/60 hover:text-[#24291F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <TasksIcon
                  className={`h-4 w-4 transition-all duration-200 group-hover:scale-110 ${
                    activeTab === 'tasks' ? 'text-white' : 'text-[#4C5540] group-hover:text-[#24291F]'
                  }`}
                />
                <span>{language === 'ar' ? 'المشاريع والمهام (Kanban)' : 'Projects & Tasks'}</span>
              </div>
            </button>

            {/* 4. Clients Nav Button with Lucide Building2 icon & Smooth Sage Olive (#8A927D) Hover Transition */}
            {canSeeCRM && (
              <button
                id="nav-clients"
                onClick={() => {
                  setActiveTab('clients');
                  onMobileClose();
                }}
                className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-[#8A927D] text-white font-bold shadow-xs'
                    : 'text-[#24291F] hover:bg-[#8A927D] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClientsIcon
                    className={`h-4 w-4 transition-transform duration-200 ease-in-out group-hover:scale-110 ${
                      activeTab === 'clients'
                        ? 'text-white'
                        : 'text-[#4C5540] group-hover:text-white'
                    }`}
                  />
                  <span>{language === 'ar' ? 'إدارة العملاء والصفقات (CRM)' : 'Client CRM & Deals'}</span>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${
                    activeTab === 'clients'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#4C5540]/10 text-[#4C5540] group-hover:bg-white/20 group-hover:text-white'
                  }`}
                >
                  CRM
                </span>
              </button>
            )}

            {/* 5. Social Hub Nav Button */}
            {canSeeSocial && (
              <button
                id="nav-social"
                onClick={() => {
                  setActiveTab('social');
                  onMobileClose();
                }}
                className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                  activeTab === 'social'
                    ? 'bg-[#4C5540] text-white font-bold shadow-xs'
                    : 'text-[#24291F] hover:bg-[#E9E1D6]/60 hover:text-[#24291F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <SocialIcon
                    className={`h-4 w-4 transition-all duration-200 group-hover:scale-110 ${
                      activeTab === 'social' ? 'text-white' : 'text-[#4C5540] group-hover:text-[#24291F]'
                    }`}
                  />
                  <span>{language === 'ar' ? 'تقويم المحتوى والسوشيال' : 'Social & Content Hub'}</span>
                </div>

                {pendingPostsCount > 0 && (
                  <span className="rounded-full bg-[#8A927D] text-white px-2 py-0.5 text-[10px] font-bold">
                    {pendingPostsCount}
                  </span>
                )}
              </button>
            )}

            {/* Attendance & Work Verification Button */}
            <button
              id="nav-attendance"
              onClick={() => {
                setActiveTab('attendance');
                onMobileClose();
              }}
              className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-[#4C5540] text-white font-bold shadow-xs'
                  : 'text-[#24291F] hover:bg-[#E9E1D6]/60 hover:text-[#24291F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock
                  className={`h-4 w-4 transition-all duration-200 group-hover:scale-110 ${
                    activeTab === 'attendance' ? 'text-white' : 'text-[#4C5540] group-hover:text-[#24291F]'
                  }`}
                />
                <span>{language === 'ar' ? 'سجل الحضور والدوام' : 'Attendance & Shifts'}</span>
              </div>
            </button>

            {/* 6. Admin Button (#nav-admin) with ShieldCheck icon, Smooth Scale Hover & Opacity, Hover #3B4432, & Programmatic Submenu Action */}
            {canSeeAdmin && (
              <div className="relative">
                <div
                  id="nav-admin"
                  className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-[#3B4432] text-white font-bold shadow-xs'
                      : 'text-[#24291F] hover:bg-[#3B4432] hover:text-white'
                  }`}
                >
                  <div
                    onClick={() => {
                      setActiveTab('admin');
                      onMobileClose();
                    }}
                    className="flex items-center gap-3 flex-1"
                  >
                    <AdminIcon
                      className={`h-4 w-4 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:opacity-85 ${
                        activeTab === 'admin' ? 'text-white' : 'text-[#4C5540] group-hover:text-white'
                      }`}
                    />
                    <span>{language === 'ar' ? 'إدارة الفريق والصلاحيات' : 'Team & RBAC'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {pendingProfileReqCount > 0 && (
                      <span className="rounded-full bg-amber-600 text-white px-1.5 py-0.2 text-[9px] font-bold">
                        {pendingProfileReqCount}
                      </span>
                    )}

                    {/* Programmatic action trigger icon that opens quick admin submenu */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAdminSubmenuOpen(!isAdminSubmenuOpen);
                      }}
                      title={language === 'ar' ? 'قائمة إجراءات الإدارة السريعة' : 'Quick Admin Actions'}
                      className="p-1 rounded-md text-inherit opacity-75 hover:opacity-100 hover:bg-white/20 transition-all cursor-pointer"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isAdminSubmenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Programmatic Submenu Dropdown */}
                {isAdminSubmenuOpen && (
                  <div className="mt-1 space-y-1 rounded-xl bg-white p-2 shadow-lg border border-[#BDAF9C]/35 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => handleAdminSubAction('roles')}
                      className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#24291F] hover:bg-[#FAF7F2] hover:text-[#4C5540] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="h-3 w-3 text-[#4C5540]" />
                        {language === 'ar' ? 'مصفوفة الصلاحيات (RBAC)' : 'RBAC Matrix'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminSubAction('members')}
                      className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#24291F] hover:bg-[#FAF7F2] hover:text-[#4C5540] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-[#4C5540]" />
                        {language === 'ar' ? 'إدارة أعضاء الفريق الـ 11' : 'Manage 11 Members'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminSubAction('profiles')}
                      className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#24291F] hover:bg-[#FAF7F2] hover:text-[#4C5540] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="h-3 w-3 text-amber-600" />
                        {language === 'ar' ? 'طلبات تعديل الملفات المعلقة' : 'Pending Profile Edits'}
                      </span>
                      {pendingProfileReqCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-amber-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAdminSubAction('assets')}
                      className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#4C5540] hover:bg-[#4C5540]/10 transition-colors flex items-center justify-between cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                    >
                      <span className="flex items-center gap-1.5">
                        <Palette className="h-3 w-3 text-[#4C5540]" />
                        {language === 'ar' ? 'تخصيص الأيقونات والصور' : 'Custom Assets & Icons'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Team / Role Indicator & Active Profile Card */}
        <div className="p-3 border-t border-[#BDAF9C]/30 bg-[#FAF7F2] space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-2xs border border-[#BDAF9C]/35">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-10 w-10 rounded-xl object-cover border border-[#BDAF9C]/40 shadow-2xs"
              />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-[#24291F]">{currentUser.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className="rounded px-1.5 py-0.2 text-[9px] font-bold truncate max-w-[140px]"
                  style={{
                    backgroundColor: currentUserRole?.badgeBg || '#E9E1D6',
                    color: currentUserRole?.color || '#24291F',
                  }}
                >
                  {currentUserRole ? currentUserRole.nameAr : 'عضو بالفريق'}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button (Opens Admin Approval Flow) */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="btn-interactive w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#BDAF9C]/40 bg-white hover:bg-[#E9E1D6]/40 text-[11px] font-bold text-[#4C5540] hover:text-[#24291F] transition-all shadow-2xs cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5 text-[#4C5540]" />
            <span>{language === 'ar' ? 'طلب تعديل الاسم / الصورة' : 'Request Profile Edit'}</span>
            {pendingProfileReqCount > 0 && canSeeAdmin && (
              <span className="h-2 w-2 rounded-full bg-amber-600" />
            )}
          </button>

          {/* Secure Logout Button */}
          <button
            type="button"
            onClick={() => logout()}
            className="btn-interactive w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-[11px] font-bold text-rose-700 hover:text-rose-800 transition-all shadow-2xs cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>{language === 'ar' ? 'تسجيل الخروج الآمن' : 'Sign Out'}</span>
          </button>

          {/* Permanent Copyright & Certified Agency Seal */}
          <div className="pt-2 border-t border-[#BDAF9C]/30 flex items-center justify-between text-[10px] text-slate-500 px-1">
            <span className="font-bold text-[#24291F] tracking-tight">Shal Agency © 2024-2026</span>
            <span className="rounded-md bg-[#4C5540]/10 text-[#4C5540] px-1.5 py-0.5 font-bold font-mono text-[9px] border border-[#4C5540]/25">
              Verified IP
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
