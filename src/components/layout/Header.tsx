import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShalLogo } from '../common/ShalLogo';
import {
  Bell,
  Search,
  UserCheck,
  Check,
  Menu,
  ChevronDown,
  Edit3,
  ExternalLink,
  Users,
  LogOut,
  Clock,
  AlertTriangle,
  CheckSquare,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  onOpenProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle,
  onOpenProfileModal,
}) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    roles,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    checkApproachingDeadlines,
    showToast,
    language,
    setActiveTab,
    logout,
    theme,
    toggleTheme,
  } = useApp();

  const [headerTime, setHeaderTime] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setHeaderTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = (notifications || []).filter(
    (n) => !n.isRead && (n.userId === currentUser.id || n.userId === 'all')
  ).length;
  const userNotifications = (notifications || []).filter(
    (n) => n.userId === currentUser.id || n.userId === 'all'
  );

  const activeUserRole = roles.find((r) => currentUser.roleIds.includes(r.id));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#BDAF9C]/35 bg-[#FAF7F2]/95 px-3 sm:px-6 backdrop-blur-md shadow-2xs">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          id="mobile-menu-btn"
          onClick={onMobileMenuToggle}
          className="btn-interactive rounded-xl p-2 text-[#4C5540] hover:bg-[#E9E1D6]/60 lg:hidden cursor-pointer"
          title="القائمة"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Shal Agency Brand Logo In Header */}
        <div className="flex items-center gap-2 py-1">
          <ShalLogo variant="full" theme="light" size="sm" showSubtitle={false} />
          <span className="hidden xl:inline-flex items-center rounded-md bg-[#4C5540]/10 border border-[#4C5540]/25 px-2 py-0.5 text-[10px] font-bold text-[#4C5540]">
            {language === 'ar' ? 'المنظومة الرقمية للوكالة' : 'Agency Operating System'}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search
            className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 ${
              language === 'ar' ? 'right-3' : 'left-3'
            }`}
          />
          <input
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'بحث سريع في المشاريع والمهام...'
                : 'Search tasks, projects...'
            }
            className={`w-full rounded-xl border border-[#BDAF9C]/35 bg-white py-1.5 text-xs text-[#24291F] placeholder-slate-400 focus:border-[#4C5540] focus:outline-none focus:ring-1 focus:ring-[#4C5540] transition-all ${
              language === 'ar' ? 'pr-8 pl-3' : 'pl-8 pr-3'
            }`}
          />
        </div>
      </div>

      {/* Action Controls & Fast Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Fast Role / User Switcher Dropdown (Supports all 11 Mahmoods cleanly) */}
        <div className="relative">
          <button
            id="persona-switcher-btn"
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            className="btn-interactive flex items-center gap-2 rounded-xl border border-[#BDAF9C]/40 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#24291F] shadow-2xs hover:bg-[#FAF7F2] hover:border-[#4C5540]/40 transition-all cursor-pointer"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-6 w-6 rounded-lg object-cover border border-[#BDAF9C]/40 shadow-2xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>

            <div className="text-right leading-tight hidden sm:block">
              <span className="font-bold text-[#24291F] block text-[11px] truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span
                className="text-[9px] font-bold block truncate max-w-[130px]"
                style={{ color: activeUserRole?.color || '#4C5540' }}
              >
                {activeUserRole ? activeUserRole.nameAr : 'عضو فريق'}
              </span>
            </div>

            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showUserSwitcher && (
            <div
              className={`menu-dropdown-animated absolute mt-2 w-80 rounded-2xl border border-[#BDAF9C]/40 bg-white/95 p-4 shadow-2xl z-50 backdrop-blur-xl ${
                language === 'ar' ? 'left-0' : 'right-0'
              }`}
            >
              {/* Authenticated User Card */}
              <div className="flex items-center gap-3 border-b border-[#BDAF9C]/20 pb-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-12 w-12 rounded-xl object-cover border border-[#BDAF9C]/40 shadow-xs transition-transform duration-200 hover:scale-105"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-[#24291F] truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentUser.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[9px] font-bold shadow-2xs"
                      style={{
                        backgroundColor: activeUserRole?.badgeBg || '#E9E1D6',
                        color: activeUserRole?.color || '#24291F',
                      }}
                    >
                      {activeUserRole?.nameAr || 'عضو بالفريق'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{currentUser.employeeNumber || '01'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Presence Status Quick Toggles */}
              <div className="py-2.5 border-b border-[#BDAF9C]/20">
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  {language === 'ar' ? 'حالة التواجد والنشاط:' : 'Presence Status:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.id) {
                        window.dispatchEvent(
                          new CustomEvent('shal:presence-change', {
                            detail: { userId: currentUser.id, status: 'online' },
                          })
                        );
                      }
                    }}
                    className="flex items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/70 py-1.5 text-emerald-800 hover:bg-emerald-100 hover:scale-102 active:scale-97 transition-all cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{language === 'ar' ? 'متصل' : 'Online'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.id) {
                        window.dispatchEvent(
                          new CustomEvent('shal:presence-change', {
                            detail: { userId: currentUser.id, status: 'busy' },
                          })
                        );
                      }
                    }}
                    className="flex items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50/70 py-1.5 text-amber-800 hover:bg-amber-100 hover:scale-102 active:scale-97 transition-all cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>{language === 'ar' ? 'مشغول' : 'Busy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.id) {
                        window.dispatchEvent(
                          new CustomEvent('shal:presence-change', {
                            detail: { userId: currentUser.id, status: 'offline' },
                          })
                        );
                      }
                    }}
                    className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-100 py-1.5 text-slate-600 hover:bg-slate-200 hover:scale-102 active:scale-97 transition-all cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    <span>{language === 'ar' ? 'غير متصل' : 'Offline'}</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserSwitcher(false);
                    if (onOpenProfileModal) onOpenProfileModal();
                  }}
                  className="dropdown-item-interactive w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-[#4C5540] hover:bg-[#4C5540]/10 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Edit3 className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'طلب تعديل الاسم والصورة' : 'Edit Profile Request'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserSwitcher(false);
                    logout();
                  }}
                  className="dropdown-item-interactive w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'تسجيل الخروج من الحساب' : 'Sign Out'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Agency Digital Clock with Seconds */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] px-2.5 py-1.5 text-xs shadow-2xs font-mono">
          <Clock className="h-3.5 w-3.5 text-[#4C5540] dark:text-[#A4C08B]" />
          <span className="font-bold text-[#24291F] dark:text-[#F3F1EC]">
            {headerTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Dark Mode Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-interactive rounded-xl border border-[#BDAF9C]/35 bg-white dark:bg-[#1E251D] p-2 text-slate-700 dark:text-[#E9E1D6] hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-2xs"
          title={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الليلي (Dark Mode)'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-[#4C5540]" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-interactive relative rounded-xl p-2 text-slate-600 hover:text-[#4C5540] hover:bg-[#FAF7F2] border border-transparent hover:border-[#BDAF9C]/30 transition-all cursor-pointer"
            title="الإشعارات"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`menu-dropdown-animated absolute mt-2 w-80 sm:w-96 rounded-2xl border border-[#BDAF9C]/40 bg-white/95 p-3.5 shadow-2xl z-50 backdrop-blur-xl ${
                language === 'ar' ? 'left-0' : 'right-0'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'مركز التنبيهات الفورية' : 'Realtime Notifications'}
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Supabase
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                      {unreadCount} {language === 'ar' ? 'جديد' : 'new'}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-bold text-[#4C5540] hover:underline cursor-pointer transition-colors"
                  >
                    {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                  </button>
                )}
              </div>

              {/* Quick Action: Check Approaching Deadlines */}
              <div className="mt-2 flex items-center justify-between bg-[#FAF7F2] border border-[#BDAF9C]/30 rounded-xl px-2.5 py-1.5 text-[11px]">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  {language === 'ar' ? 'مراقبة المواعيد النهائية (Due Dates)' : 'Deadlines Monitoring'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const res = checkApproachingDeadlines(false);
                    showToast({
                      type: 'info',
                      title: 'فحص المواعيد الحرجة',
                      message: `تم فحص ${res.checkedCount} مهمة، وتحديد ${res.warningsCount} تنبيهات حرجة.`,
                    });
                  }}
                  className="rounded-lg bg-white border border-[#BDAF9C]/40 px-2 py-0.5 text-[10px] font-bold text-[#4C5540] hover:bg-[#4C5540] hover:text-white transition-all cursor-pointer shadow-2xs"
                >
                  {language === 'ar' ? 'فحص الآن' : 'Check Now'}
                </button>
              </div>

              <div className="mt-2.5 max-h-72 overflow-y-auto space-y-1.5">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-6">
                    <Bell className="h-7 w-7 text-slate-300 mx-auto mb-1.5 opacity-60" />
                    <p className="text-xs text-slate-400">
                      {language === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {language === 'ar' ? 'ستصلك التنبيهات فور إسناد أي مهمة جديدة أو اقتراب موعد التسليم' : 'You will be notified in real-time when tasks are assigned or due'}
                    </p>
                  </div>
                ) : (
                  userNotifications.map((notif) => {
                    const isDeadline = notif.type === 'deadline_warning';
                    const isTaskAssigned = notif.type === 'task_assigned';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.linkTab) setActiveTab(notif.linkTab);
                          setShowNotifications(false);
                        }}
                        className={`dropdown-item-interactive p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                          notif.isRead
                            ? 'bg-slate-50/60 border-slate-100 text-slate-600 hover:bg-slate-100'
                            : isDeadline
                            ? 'bg-amber-50/80 border-amber-200 text-slate-900 font-medium hover:bg-amber-100/80'
                            : 'bg-emerald-50/80 border-emerald-200 text-slate-900 font-medium hover:bg-emerald-100/80'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              isDeadline
                                ? 'bg-amber-100 text-amber-700'
                                : isTaskAssigned
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isDeadline ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : isTaskAssigned ? (
                              <CheckSquare className="h-3.5 w-3.5" />
                            ) : (
                              <Bell className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-xs truncate">{notif.title}</p>
                              {isDeadline ? (
                                <span className="rounded bg-amber-200/80 text-amber-900 px-1 py-0.2 text-[9px] font-bold shrink-0">
                                  {language === 'ar' ? 'موعد تسليم' : 'Deadline'}
                                </span>
                              ) : isTaskAssigned ? (
                                <span className="rounded bg-emerald-200/80 text-emerald-900 px-1 py-0.2 text-[9px] font-bold shrink-0">
                                  {language === 'ar' ? 'مهمة مسندة' : 'Assigned'}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">{notif.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
