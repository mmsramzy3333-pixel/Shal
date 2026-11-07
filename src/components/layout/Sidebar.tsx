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
  History,
  LogOut,
  FileText,
  TrendingUp,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  EyeOff,
  Scale,
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
  Clock,
  FileText,
  TrendingUp,
};

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onOpenProfileModal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isHidden?: boolean;
  onToggleHidden?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  onOpenProfileModal,
  isCollapsed = false,
  onToggleCollapse,
  isHidden = false,
  onToggleHidden,
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
    theme,
    toggleTheme,
    isOwner,
    isAdminOrOwner,
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
    window.dispatchEvent(new CustomEvent('shal:admin-navigate', { detail: actionKey }));
  };

  // Nav Item Renderer supporting both full width and collapsed modes
  const renderNavItem = (item: {
    id: string;
    tabKey: string;
    label: string;
    icon: any;
    badgeCount?: number;
    badgeLabel?: string;
    badgeColor?: string;
    onClickExtra?: () => void;
  }) => {
    const isActive = activeTab === item.tabKey;
    const IconComponent = item.icon;

    if (isCollapsed) {
      return (
        <div key={item.id} className="relative group/collapsed flex justify-center w-full my-0.5">
          <button
            id={item.id}
            type="button"
            onClick={() => {
              setActiveTab(item.tabKey);
              if (item.onClickExtra) item.onClickExtra();
              onMobileClose();
            }}
            className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all cursor-pointer relative ${
              isActive
                ? 'bg-[#4C5540] text-white shadow-sm ring-2 ring-[#4C5540]/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-[#E9E1D6]/60 dark:hover:bg-[#2C3529] hover:text-[#24291F]'
            }`}
            title={item.label}
          >
            <IconComponent
              className={`h-5 w-5 transition-transform duration-200 group-hover/collapsed:scale-110 ${
                isActive ? 'text-white' : 'text-[#4C5540] dark:text-[#A4C08B]'
              }`}
            />
            {item.badgeCount && item.badgeCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-600 text-white font-mono text-[9px] font-bold shadow-xs">
                {item.badgeCount > 9 ? '9+' : item.badgeCount}
              </span>
            ) : null}
          </button>

          {/* Floating Tooltip positioned neatly on the side */}
          <div
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
              language === 'ar' ? 'right-full mr-3' : 'left-full ml-3'
            } z-50 hidden group-hover/collapsed:flex items-center gap-2 rounded-xl bg-[#24291F] px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-white/10 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150`}
          >
            <span>{item.label}</span>
            {item.badgeLabel && (
              <span className="rounded bg-white/20 px-1.5 py-0.2 text-[9px] font-mono">
                {item.badgeLabel}
              </span>
            )}
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                language === 'ar' ? '-right-1' : '-left-1'
              } w-2 h-2 bg-[#24291F] rotate-45 border-t border-l border-white/10`}
            />
          </div>
        </div>
      );
    }

    // Expanded Full-Width Nav Item
    return (
      <button
        key={item.id}
        id={item.id}
        type="button"
        onClick={() => {
          setActiveTab(item.tabKey);
          if (item.onClickExtra) item.onClickExtra();
          onMobileClose();
        }}
        className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer transition-all ${
          isActive
            ? 'bg-[#4C5540] text-white font-bold shadow-xs'
            : 'text-[#24291F] dark:text-[#F3F1EC] hover:bg-[#E9E1D6]/60 dark:hover:bg-[#2C3529] hover:text-[#24291F]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <IconComponent
              className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? 'text-white' : 'text-[#4C5540] dark:text-[#A4C08B]'
              }`}
            />
            {item.badgeCount && item.badgeCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            ) : null}
          </div>
          <span className="truncate">{item.label}</span>
        </div>

        {item.badgeCount && item.badgeCount > 0 ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono tabular-nums shadow-xs ${
              isActive
                ? 'bg-white text-[#4C5540]'
                : 'bg-[#4C5540] text-white border border-[#BDAF9C]/40'
            }`}
          >
            {item.badgeCount}
          </span>
        ) : item.badgeLabel ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
              isActive
                ? 'bg-white/20 text-white'
                : item.badgeColor || 'bg-[#4C5540]/10 text-[#4C5540]'
            }`}
          >
            {item.badgeLabel}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-[#24291F]/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col justify-between border-[#BDAF9C]/35 bg-[#FAF7F2] dark:bg-[#1A2019] dark:border-[#2C3529] transition-all duration-300 ease-in-out lg:static ${
          isHidden ? 'hidden' : 'flex'
        } ${isCollapsed ? 'w-20' : 'w-72'} ${
          language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
        } ${
          isMobileOpen
            ? 'translate-x-0 shadow-2xl'
            : language === 'ar'
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar">
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between px-3 sm:px-4 border-b border-[#BDAF9C]/30 bg-[#24291F] transition-all">
            {!isCollapsed ? (
              <ShalLogo variant="full" theme="dark" size="sm" showSubtitle={false} />
            ) : (
              <div className="w-full flex justify-center">
                <ShalLogo variant="mark" theme="dark" size="sm" />
              </div>
            )}

            <div className="flex items-center gap-1">
              {/* Desktop Collapse/Expand Toggle */}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  title={
                    isCollapsed
                      ? language === 'ar'
                        ? 'توسيع القائمة الجانبية (Expand)'
                        : 'Expand Sidebar'
                      : language === 'ar'
                        ? 'تصغير القائمة إلى أيقونات (Collapse)'
                        : 'Collapse to Icons'
                  }
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4 text-amber-400" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </button>
              )}

              {/* Desktop Hide Toggle */}
              {onToggleHidden && !isCollapsed && (
                <button
                  type="button"
                  onClick={onToggleHidden}
                  className="hidden lg:flex p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  title={language === 'ar' ? 'إخفاء القائمة الجانبية بالكامل' : 'Hide Sidebar'}
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              )}

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 lg:hidden cursor-pointer"
                title="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Nav Items */}
          <div className="px-2.5 py-4 space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#4C5540]/80 dark:text-[#A4C08B]">
                {language === 'ar' ? 'الوحدات المتاحة لدورك' : 'Your Role Modules'}
              </div>
            )}

            {/* 1. Dashboard */}
            {renderNavItem({
              id: 'nav-dashboard',
              tabKey: 'dashboard',
              label: language === 'ar' ? 'مساحة العمل المتخصصة' : 'Specialized Workspace',
              icon: DashboardIcon,
            })}

            {/* 2. Chat */}
            {renderNavItem({
              id: 'nav-chat',
              tabKey: 'chat',
              label: language === 'ar' ? 'الدردشة ومتابعة المهام' : 'Internal Chat & Tasks',
              icon: ChatIcon,
              badgeCount: unreadChatCount,
              badgeLabel: unreadChatCount > 0 ? `${unreadChatCount}` : 'شال',
              onClickExtra: () => markChatAsRead(),
            })}

            {/* 3. Tasks Kanban */}
            {renderNavItem({
              id: 'nav-tasks',
              tabKey: 'tasks',
              label: language === 'ar' ? 'المشاريع والمهام (Kanban)' : 'Projects & Tasks',
              icon: TasksIcon,
            })}

            {/* 4. CRM & Deals */}
            {canSeeCRM &&
              renderNavItem({
                id: 'nav-clients',
                tabKey: 'clients',
                label: language === 'ar' ? 'إدارة العملاء والصفقات (CRM)' : 'Client CRM & Deals',
                icon: ClientsIcon,
                badgeLabel: 'CRM',
                badgeColor: 'bg-[#4C5540]/10 text-[#4C5540]',
              })}

            {/* 5. Social & Content */}
            {canSeeSocial &&
              renderNavItem({
                id: 'nav-social',
                tabKey: 'social',
                label: language === 'ar' ? 'تقويم المحتوى والسوشيال' : 'Social & Content Hub',
                icon: SocialIcon,
                badgeCount: pendingPostsCount,
                badgeLabel: pendingPostsCount > 0 ? `${pendingPostsCount}` : undefined,
              })}

            {/* 6. Attendance & Verification */}
            {renderNavItem({
              id: 'nav-attendance',
              tabKey: 'attendance',
              label: language === 'ar' ? 'سجل الحضور والبصمة' : 'Attendance & Fingerprint',
              icon: Clock,
            })}

            {/* 7. Contracts */}
            {renderNavItem({
              id: 'nav-contracts',
              tabKey: 'contracts',
              label: language === 'ar' ? 'العقود والملفات الرسمية' : 'Company Contracts',
              icon: FileText,
              badgeLabel: 'عقود',
            })}

            {/* 8. Reports & Analytics */}
            {renderNavItem({
              id: 'nav-reports',
              tabKey: 'reports',
              label: language === 'ar' ? 'التقارير والاستراتيجية' : 'Reports & Analytics',
              icon: TrendingUp,
              badgeLabel: 'تقارير',
            })}

            {/* 9. Finance & Cost Control (Executive Only) */}
            {(isOwner || isAdminOrOwner || hasPermission('can_edit_financials')) &&
              renderNavItem({
                id: 'nav-finance',
                tabKey: 'finance',
                label: language === 'ar' ? 'الإدارة المالية والمحاسبة والتكاليف' : 'Finance & Accounting',
                icon: Briefcase,
                badgeLabel: 'إدارة',
                badgeColor: 'bg-emerald-700 text-white',
              })}

            {/* 10. C.O.C & Role KPIs */}
            {renderNavItem({
              id: 'nav-kpi-coc',
              tabKey: 'kpi_coc',
              label: language === 'ar' ? 'ميثاق C.O.C ومؤشرات KPIs' : 'C.O.C & Role KPIs',
              icon: Sparkles,
              badgeLabel: '3 أنماط',
              badgeColor: 'bg-amber-500/20 text-amber-800 border border-amber-500/30',
            })}

            {/* 11. HR Management */}
            {renderNavItem({
              id: 'nav-hr',
              tabKey: 'hr',
              label: language === 'ar' ? 'الموارد البشرية والإجازات (HR)' : 'HR & Leave Operations',
              icon: Users,
              badgeLabel: 'HR',
            })}

            {/* Divider */}
            <div className="pt-2 my-2 border-t border-[#BDAF9C]/25 dark:border-[#2C3529]" />

            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {language === 'ar' ? 'الإدارة والإعدادات' : 'Admin & System'}
              </div>
            )}

            {/* 12. Admin & RBAC Settings */}
            {canSeeAdmin && (
              <div className="relative">
                {isCollapsed ? (
                  <div className="relative group/admin flex justify-center w-full my-0.5">
                    <button
                      id="nav-admin"
                      type="button"
                      onClick={() => {
                        setActiveTab('admin');
                        onMobileClose();
                      }}
                      className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all cursor-pointer relative ${
                        activeTab === 'admin'
                          ? 'bg-[#3B4432] text-white shadow-sm ring-2 ring-[#3B4432]/30'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-[#3B4432] hover:text-white'
                      }`}
                      title={language === 'ar' ? 'إدارة الفريق والصلاحيات' : 'Team & RBAC'}
                    >
                      <AdminIcon className="h-5 w-5" />
                      {pendingProfileReqCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-600 ring-2 ring-white" />
                      )}
                    </button>

                    {/* Collapsed Admin Floating Menu */}
                    <div
                      className={`pointer-events-none group-hover/admin:pointer-events-auto absolute top-1/2 -translate-y-1/2 ${
                        language === 'ar' ? 'right-full mr-3' : 'left-full ml-3'
                      } z-50 hidden group-hover/admin:block w-48 rounded-xl bg-white dark:bg-[#24291F] p-2 shadow-2xl border border-[#BDAF9C]/40 animate-in fade-in zoom-in-95 duration-150`}
                    >
                      <span className="block px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        {language === 'ar' ? 'إدارة الصلاحيات والفريق' : 'Team & RBAC'}
                      </span>
                      <div className="mt-1 space-y-1">
                        <button
                          type="button"
                          onClick={() => handleAdminSubAction('roles')}
                          className="w-full text-right rtl:text-right ltr:text-left px-2 py-1 rounded text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-[#1A2019] cursor-pointer"
                        >
                          مصفوفة الصلاحيات (RBAC)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminSubAction('members')}
                          className="w-full text-right rtl:text-right ltr:text-left px-2 py-1 rounded text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-[#1A2019] cursor-pointer"
                        >
                          إدارة أعضاء الفريق الـ 11
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminSubAction('profiles')}
                          className="w-full text-right rtl:text-right ltr:text-left px-2 py-1 rounded text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#FAF7F2] dark:hover:bg-[#1A2019] cursor-pointer flex items-center justify-between"
                        >
                          <span>طلبات تعديل الملفات</span>
                          {pendingProfileReqCount > 0 && (
                            <span className="h-2 w-2 rounded-full bg-amber-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      id="nav-admin"
                      className={`nav-item-interactive group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                        activeTab === 'admin'
                          ? 'bg-[#3B4432] text-white font-bold shadow-xs'
                          : 'text-[#24291F] dark:text-[#F3F1EC] hover:bg-[#3B4432] hover:text-white'
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
                          className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAdminSubmenuOpen(!isAdminSubmenuOpen);
                          }}
                          className="p-1 rounded-md text-inherit opacity-75 hover:opacity-100 hover:bg-white/20 transition-all cursor-pointer"
                          title="قائمة إجراءات الإدارة"
                        >
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                              isAdminSubmenuOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Submenu Dropdown */}
                    {isAdminSubmenuOpen && (
                      <div className="mt-1 space-y-1 rounded-xl bg-white dark:bg-[#24291F] p-2 shadow-lg border border-[#BDAF9C]/35 animate-in fade-in zoom-in-95 duration-150">
                        <button
                          type="button"
                          onClick={() => handleAdminSubAction('roles')}
                          className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#24291F] dark:text-[#F3F1EC] hover:bg-[#FAF7F2] dark:hover:bg-[#1A2019] hover:text-[#4C5540] transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <SlidersHorizontal className="h-3 w-3 text-[#4C5540]" />
                            {language === 'ar' ? 'مصفوفة الصلاحيات (RBAC)' : 'RBAC Matrix'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminSubAction('members')}
                          className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#24291F] dark:text-[#F3F1EC] hover:bg-[#FAF7F2] dark:hover:bg-[#1A2019] hover:text-[#4C5540] transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3 w-3 text-[#4C5540]" />
                            {language === 'ar' ? 'إدارة أعضاء الفريق الـ 11' : 'Manage 11 Members'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdminSubAction('profiles')}
                          className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#24291F] dark:text-[#F3F1EC] hover:bg-[#FAF7F2] dark:hover:bg-[#1A2019] hover:text-[#4C5540] transition-colors flex items-center justify-between cursor-pointer"
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
                          className="w-full text-right rtl:text-right ltr:text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#4C5540] dark:text-[#A4C08B] hover:bg-[#4C5540]/10 transition-colors flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
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
            )}

            {/* 13. Audit & Activity Log */}
            {renderNavItem({
              id: 'nav-activity',
              tabKey: 'activity',
              label: language === 'ar' ? 'سجل التدقيق والعمليات' : 'Audit & Activity Log',
              icon: History,
            })}

            {/* 14. Settings */}
            {renderNavItem({
              id: 'nav-settings',
              tabKey: 'settings',
              label: language === 'ar' ? 'إعدادات الحساب والمنظومة' : 'Settings & Profile',
              icon: Settings,
            })}
          </div>
        </div>

        {/* Bottom Section: Profile, Theme Toggle & Logout */}
        <div className="p-3 border-t border-[#BDAF9C]/30 bg-[#FAF7F2] dark:bg-[#1A2019] space-y-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`btn-interactive w-full flex items-center rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#24291F] dark:border-[#2C3529] text-[11px] font-bold text-[#24291F] dark:text-[#E9E1D6] hover:bg-[#E9E1D6]/40 transition-all shadow-2xs cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-between py-2 px-3'
            }`}
            title={theme === 'dark' ? 'تبديل إلى الوضع الفاتح (Light)' : 'تبديل إلى الوضع الداكن (Dark)'}
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-[#4C5540]" />
              )}
              {!isCollapsed && (
                <span>
                  {theme === 'dark'
                    ? language === 'ar'
                      ? 'الوضع الفاتح'
                      : 'Light Mode'
                    : language === 'ar'
                    ? 'الوضع الليلي'
                    : 'Dark Mode'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="rounded px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#4C5540]/10 text-[#4C5540] dark:bg-white/10 dark:text-white">
                {theme === 'dark' ? 'DARK' : 'LIGHT'}
              </span>
            )}
          </button>

          {!isCollapsed ? (
            <>
              {/* Profile Card */}
              <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-[#24291F] p-2.5 shadow-2xs border border-[#BDAF9C]/35 dark:border-[#2C3529]">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-10 w-10 rounded-xl object-cover border border-[#BDAF9C]/40 shadow-2xs"
                  />
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-[#24291F] dark:text-[#F3F1EC]">
                    {currentUser.name}
                  </p>
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

              {/* Profile Edit Request */}
              {onOpenProfileModal && (
                <button
                  type="button"
                  onClick={onOpenProfileModal}
                  className="btn-interactive w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#BDAF9C]/40 bg-white dark:bg-[#24291F] dark:border-[#2C3529] hover:bg-[#E9E1D6]/40 text-[11px] font-bold text-[#4C5540] dark:text-[#A4C08B] hover:text-[#24291F] transition-all shadow-2xs cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-[#4C5540] dark:text-[#A4C08B]" />
                  <span>{language === 'ar' ? 'طلب تعديل الاسم / الصورة' : 'Request Profile Edit'}</span>
                  {pendingProfileReqCount > 0 && canSeeAdmin && (
                    <span className="h-2 w-2 rounded-full bg-amber-600" />
                  )}
                </button>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => logout()}
                className="btn-interactive w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-[11px] font-bold text-rose-700 hover:text-rose-800 transition-all shadow-2xs cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span>{language === 'ar' ? 'تسجيل الخروج الآمن' : 'Sign Out'}</span>
              </button>

              {/* Certified Agency Seal */}
              <div className="pt-2 border-t border-[#BDAF9C]/30 flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span className="font-bold text-[#24291F] dark:text-[#E9E1D6] tracking-tight">
                  Shal Agency © 2024-2026
                </span>
                <span className="rounded-md bg-[#4C5540]/10 text-[#4C5540] dark:bg-[#4C5540]/30 dark:text-[#A4C08B] px-1.5 py-0.5 font-bold font-mono text-[9px] border border-[#4C5540]/25">
                  Verified IP
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => logout()}
                className="btn-interactive w-full flex items-center justify-center p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                title={language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
