import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { ClientsView } from './components/crm/ClientsView';
import { SocialCalendarView } from './components/social/SocialCalendarView';
import { RbacSettingsView } from './components/admin/RbacSettingsView';
import { ActivityLogView } from './components/activity/ActivityLogView';
import { ToastContainer } from './components/common/ToastContainer';
import { ProfileChangeModal } from './components/profile/ProfileChangeModal';
import { ChatView } from './components/chat/ChatView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { LoginPage } from './components/auth/LoginPage';
import { BrandFooter } from './components/layout/BrandFooter';
import { ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, hasPermission, language, currentUser, authLoading } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <Header
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
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
