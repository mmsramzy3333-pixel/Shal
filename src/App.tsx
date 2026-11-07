import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { ClientsView } from './components/crm/ClientsView';
import { SocialCalendarView } from './components/social/SocialCalendarView';
import { RbacSettingsView } from './components/admin/RbacSettingsView';
import { ActivityLogView } from './components/activity/ActivityLogView';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/common/ToastContainer';
import { ProfileChangeModal } from './components/profile/ProfileChangeModal';
import { ChatView } from './components/chat/ChatView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { ContractsView } from './components/contracts/ContractsView';
import { ReportsView } from './components/reports/ReportsView';
import { FinanceAccountingView } from './components/finance/FinanceAccountingView';
import { KpiCocManagementView } from './components/kpi/KpiCocManagementView';
import { HrManagementView } from './components/hr/HrManagementView';
import { LoginPage } from './components/auth/LoginPage';
import { BrandFooter } from './components/layout/BrandFooter';
import { ShieldAlert, PanelLeftOpen } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    hasPermission,
    language,
    currentUser,
    authLoading,
    showToast,
    isOwner,
    isAdminOrOwner,
  } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sidebar Collapse & Hide State (Persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('shal_sidebar_collapsed') === 'true';
  });
  const [isSidebarHidden, setIsSidebarHidden] = useState<boolean>(() => {
    return localStorage.getItem('shal_sidebar_hidden') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('shal_sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleSidebarHidden = () => {
    setIsSidebarHidden((prev) => {
      const next = !prev;
      localStorage.setItem('shal_sidebar_hidden', String(next));
      return next;
    });
  };

  // Global Keyboard Shortcuts Listener (Ctrl+Alt+D, Ctrl+Alt+T, Ctrl+Alt+C, Ctrl+Alt+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          setActiveTab('dashboard');
          showToast({
            type: 'info',
            title: language === 'ar' ? 'اختصار لوحة المفاتيح' : 'Keyboard Shortcut',
            message: language === 'ar' ? 'الانتقال إلى مساحة العمل الرئيسية (Dashboard)' : 'Switched to Dashboard view',
          });
        } else if (key === 't') {
          e.preventDefault();
          setActiveTab('tasks');
          showToast({
            type: 'info',
            title: language === 'ar' ? 'اختصار لوحة المفاتيح' : 'Keyboard Shortcut',
            message: language === 'ar' ? 'الانتقال إلى إدارة المهام (Tasks)' : 'Switched to Tasks view',
          });
        } else if (key === 'c') {
          e.preventDefault();
          setActiveTab('clients');
          showToast({
            type: 'info',
            title: language === 'ar' ? 'اختصار لوحة المفاتيح' : 'Keyboard Shortcut',
            message: language === 'ar' ? 'الانتقال إلى إدارة العملاء والصفقات (CRM)' : 'Switched to Clients & CRM view',
          });
        } else if (key === 's') {
          e.preventDefault();
          setActiveTab('social');
          showToast({
            type: 'info',
            title: language === 'ar' ? 'اختصار لوحة المفاتيح' : 'Keyboard Shortcut',
            message: language === 'ar' ? 'الانتقال إلى تقويم السوشيال ميديا (Social Calendar)' : 'Switched to Social Calendar view',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, showToast, language]);

  // Authentication & session validation
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#4C5540] border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-[#4C5540]">
          {language === 'ar' ? 'جاري التحقق من أمان الجلسة والاتصال...' : 'Securing session & validating credentials...'}
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <ToastContainer />
        <div className="flex-1">
          <LoginPage />
        </div>
        <BrandFooter isFloating={false} />
      </div>
    );
  }

  // Access validation for tabs
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;

      case 'chat':
        return <ChatView />;

      case 'attendance':
        return <AttendanceView />;

      case 'clients':
        if (!hasPermission('can_view_clients')) {
          return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <ShieldAlert className="h-12 w-12 text-rose-500" />
              <h3 className="mt-3 text-base font-bold text-slate-900">
                {language === 'ar' ? 'صلاحية الوصول غير متوفرة' : 'Access Restricted'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md leading-relaxed">
                {language === 'ar'
                  ? 'يتطلب الوصول إلى إدارة علاقات العملاء (CRM) صلاحية can_view_clients (المتاحة للفاوندر، السيلز مانجر، مدير العمليات، والأكونت مانجر).'
                  : 'Access to CRM requires can_view_clients permission (granted to Founder, Sales, Ops, and Account Manager).'}
              </p>
            </div>
          );
        }
        return <ClientsView />;

      case 'tasks':
        return <TasksView />;

      case 'social':
        return <SocialCalendarView />;

      case 'admin':
        if (
          !hasPermission('can_manage_roles') &&
          !hasPermission('can_manage_team_members') &&
          !hasPermission('can_approve_profile_changes')
        ) {
          return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <ShieldAlert className="h-12 w-12 text-rose-500" />
              <h3 className="mt-3 text-base font-bold text-slate-900">
                {language === 'ar' ? 'صفحة الإدارة محصورة بالمديرين' : 'Admin Area Restricted'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md leading-relaxed">
                {language === 'ar'
                  ? 'يتطلب الوصول إلى إدارة الصلاحيات وأدوار الفريق حساب مدير نظام (الفاوندر أو مدير العمليات).'
                  : 'Requires administrator privileges (Founder or Operations Manager).'}
              </p>
            </div>
          );
        }
        return <RbacSettingsView />;

      case 'activity':
        return <ActivityLogView />;

      case 'contracts':
        return <ContractsView />;

      case 'reports':
        return <ReportsView />;

      case 'finance':
        if (!isOwner && !isAdminOrOwner && !hasPermission('can_edit_financials')) {
          return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-white p-12 text-center shadow-xs">
              <ShieldAlert className="h-12 w-12 text-rose-500" />
              <h3 className="mt-3 text-base font-bold text-slate-900">
                {language === 'ar' ? 'المنظومة المالية والمحاسبية محصورة بالإدارة فقط' : 'Finance Area Restricted'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md leading-relaxed">
                {language === 'ar'
                  ? 'يتطلب الوصول إلى سجلات المحاسبة، الأرباح والخسائر، وشجرة الحسابات صلاحيات الإدارة العليا (Founder) أو المدير التنفيذي.'
                  : 'Access to financial statements and general ledger requires Executive / Founder privileges.'}
              </p>
            </div>
          );
        }
        return <FinanceAccountingView />;

      case 'kpi_coc':
        return <KpiCocManagementView />;

      case 'hr':
        return <HrManagementView />;

      case 'settings':
        return <SettingsView />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E1D6]/40 text-[#24291F] flex font-sans antialiased">
      {/* Toast Notifications System */}
      <ToastContainer />

      {/* Profile Change Request Modal */}
      <ProfileChangeModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isHidden={isSidebarHidden}
        onToggleHidden={toggleSidebarHidden}
      />

      {/* Floating Reveal Sidebar Handle when Sidebar is Hidden */}
      {isSidebarHidden && (
        <button
          type="button"
          onClick={toggleSidebarHidden}
          className={`fixed top-20 ${
            language === 'ar' ? 'right-0 rounded-l-2xl border-r-0' : 'left-0 rounded-r-2xl border-l-0'
          } z-40 flex items-center gap-2 bg-[#24291F] text-white px-3 py-2 shadow-2xl border border-white/20 hover:bg-[#3B4432] transition-all cursor-pointer group animate-in slide-in-from-top-2 duration-200`}
          title={language === 'ar' ? 'إظهار القائمة الجانبية (Show Sidebar)' : 'Show Sidebar'}
        >
          <PanelLeftOpen className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold hidden sm:inline text-white">
            {language === 'ar' ? 'القائمة' : 'Menu'}
          </span>
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <Header
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          isSidebarHidden={isSidebarHidden}
          onToggleSidebarHidden={toggleSidebarHidden}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-10">
          {renderActiveView()}
        </main>

        {/* Persistent Brand Footer & Intellectual Property Documentation */}
        <BrandFooter isFloating={false} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
