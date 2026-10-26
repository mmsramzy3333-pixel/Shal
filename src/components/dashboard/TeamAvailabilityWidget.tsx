import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Task } from '../../types';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Briefcase,
  Flame,
  Search,
  Filter,
  Check,
  ChevronRight,
  UserCheck,
  UserX,
  ExternalLink,
  Plus,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const TeamAvailabilityWidget: React.FC = () => {
  const {
    users,
    tasks,
    roles,
    language,
    setActiveTab,
    toggleUserStatus,
    currentUser,
    hasPermission,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedWorkloadFilter, setSelectedWorkloadFilter] = useState<string>('all');
  const [selectedUserForTasks, setSelectedUserForTasks] = useState<User | null>(null);

  // Helper to compute user workload and statistics
  const getMemberWorkload = (userId: string) => {
    const assignedTasks = tasks.filter(
      (t) =>
        t.assignedTo &&
        t.assignedTo.includes(userId) &&
        t.status !== 'done' &&
        t.status !== 'client_delivered'
    );

    const completedTasks = tasks.filter(
      (t) =>
        t.assignedTo &&
        t.assignedTo.includes(userId) &&
        (t.status === 'done' || t.status === 'client_delivered')
    );

    const urgentCount = assignedTasks.filter(
      (t) => t.priority === 'urgent' || t.priority === 'high'
    ).length;
    const inProgressCount = assignedTasks.filter(
      (t) => t.status === 'in_progress' || t.status === 'changes_requested'
    ).length;
    const inReviewCount = assignedTasks.filter((t) => t.status === 'review').length;
    const todoCount = assignedTasks.filter((t) => t.status === 'todo').length;

    const taskCount = assignedTasks.length;

    // Workload level & percentage capacity
    let workloadLevel: 'available' | 'balanced' | 'busy' | 'overloaded' = 'available';
    let percentage = 15;
    let labelAr = 'متاح للمهام';
    let labelEn = 'Available';
    let barColor = 'bg-emerald-500';
    let textColor = 'text-emerald-700';
    let bgBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';

    if (taskCount === 0) {
      workloadLevel = 'available';
      percentage = 10;
      labelAr = 'متاح بالكامل (طاقة شاغرة)';
      labelEn = 'Fully Available';
      barColor = 'bg-emerald-500';
      textColor = 'text-emerald-700';
      bgBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (taskCount <= 2) {
      workloadLevel = 'balanced';
      percentage = Math.min(taskCount * 25 + 10, 55);
      labelAr = 'عبء معتدل ومتوازن';
      labelEn = 'Balanced Load';
      barColor = 'bg-[#4C5540]';
      textColor = 'text-[#4C5540]';
      bgBadgeColor = 'bg-[#4C5540]/10 text-[#4C5540] border-[#4C5540]/25';
    } else if (taskCount <= 3) {
      workloadLevel = 'busy';
      percentage = 75;
      labelAr = 'عبء عمل مرتفع (مشغول)';
      labelEn = 'High / Busy';
      barColor = 'bg-amber-500';
      textColor = 'text-amber-800';
      bgBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      workloadLevel = 'overloaded';
      percentage = Math.min(taskCount * 18 + 20, 100);
      labelAr = 'طاقة قصوى (عبء مضغوط)';
      labelEn = 'At Capacity / Overloaded';
      barColor = 'bg-rose-500';
      textColor = 'text-rose-700';
      bgBadgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    }

    return {
      assignedTasks,
      completedTasks,
      taskCount,
      urgentCount,
      inProgressCount,
      inReviewCount,
      todoCount,
      workloadLevel,
      percentage,
      labelAr,
      labelEn,
      barColor,
      textColor,
      bgBadgeColor,
    };
  };

  // Summary counts across all users
  const totalMembers = users.length;
  const activeOnlineMembers = users.filter((u) => u.status === 'active').length;

  let totalAvailableCount = 0;
  let totalBalancedCount = 0;
  let totalBusyCount = 0;
  let totalOverloadedCount = 0;

  users.forEach((user) => {
    const { workloadLevel } = getMemberWorkload(user.id);
    if (workloadLevel === 'available') totalAvailableCount++;
    else if (workloadLevel === 'balanced') totalBalancedCount++;
    else if (workloadLevel === 'busy') totalBusyCount++;
    else if (workloadLevel === 'overloaded') totalOverloadedCount++;
  });

  // Filtered members list
  const filteredUsers = users.filter((user) => {
    // Search query
    const nameMatch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.employeeNumber && user.employeeNumber.includes(searchQuery));

    const roleObj = roles.find((r) => user.roleIds.includes(r.id));
    const roleMatch =
      roleObj &&
      (roleObj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roleObj.nameAr.includes(searchQuery));

    if (searchQuery && !nameMatch && !roleMatch) return false;

    // Team Filter
    if (selectedTeamFilter !== 'all') {
      if (selectedTeamFilter === 'operations' && user.team !== 'operations' && user.team !== 'management')
        return false;
      if (selectedTeamFilter === 'creative' && user.team !== 'uiux' && user.team !== 'content')
        return false;
      if (selectedTeamFilter === 'social' && user.team !== 'social' && user.team !== 'content')
        return false;
      if (selectedTeamFilter === 'tech' && user.team !== 'developer' && user.team !== 'seo')
        return false;
      if (selectedTeamFilter === 'growth' && user.team !== 'sales' && user.team !== 'marketing' && user.team !== 'media_buying')
        return false;
    }

    // Workload Level Filter
    if (selectedWorkloadFilter !== 'all') {
      const { workloadLevel } = getMemberWorkload(user.id);
      if (workloadLevel !== selectedWorkloadFilter) return false;
    }

    return true;
  });

  return (
    <div className="rounded-2xl border border-[#BDAF9C]/30 bg-[#FAF7F2] p-5 shadow-xs space-y-5">
      {/* Widget Header & Description */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#BDAF9C]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#4C5540] p-1.5 text-white shadow-xs">
              <Users className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-[#4C5540]">
              {language === 'ar' ? 'إدارة الموارد وتوزيع الجهد' : 'Resource Capacity & Workload'}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-[#24291F] mt-1.5">
            {language === 'ar' ? 'جاهزية وتوزيع أعباء الفريق' : 'Team Availability & Workload'}
          </h3>
          <p className="text-xs text-[#4C5540]/80 mt-0.5 max-w-2xl">
            {language === 'ar'
              ? 'متابعة لحظية لطاقة كل عضو بناءً على المهام المسندة وحالته التشغيلية لتوزيع المهام بكفاءة'
              : 'Real-time visibility into team capacity, active task load, and operational status for smart delegation'}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('tasks')}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#4C5540] border border-[#BDAF9C]/40 hover:bg-[#E9E1D6]/40 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Briefcase className="h-3.5 w-3.5 text-[#4C5540]" />
          <span>{language === 'ar' ? 'توزيع المهام بكانبان' : 'Assign in Kanban'}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">
            {language === 'ar' ? 'إجمالي الفريق' : 'Total Members'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-[#24291F] font-mono tabular-nums">
              {totalMembers}
            </span>
            <span className="text-[10px] text-slate-400">
              ({activeOnlineMembers} {language === 'ar' ? 'نشط' : 'active'})
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-200/80 shadow-2xs">
          <span className="text-[11px] text-emerald-700 font-bold block flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
            {language === 'ar' ? 'متاح للتكليف' : 'Available'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-800 font-mono tabular-nums">
              {totalAvailableCount}
            </span>
            <span className="text-[10px] text-emerald-600">
              {language === 'ar' ? 'عضو بطاقة شاغرة' : 'members ready'}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-[#4C5540]/10 p-3 border border-[#4C5540]/20 shadow-2xs">
          <span className="text-[11px] text-[#4C5540] font-bold block">
            {language === 'ar' ? 'عبء متوازن' : 'Balanced Load'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-[#4C5540] font-mono tabular-nums">
              {totalBalancedCount}
            </span>
            <span className="text-[10px] text-[#4C5540]/70">
              (1-2 {language === 'ar' ? 'مهمة' : 'tasks'})
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-200/80 shadow-2xs">
          <span className="text-[11px] text-amber-800 font-bold block">
            {language === 'ar' ? 'طاقة مرتفعة' : 'High / Busy'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-amber-800 font-mono tabular-nums">
              {totalBusyCount}
            </span>
            <span className="text-[10px] text-amber-600">
              (3 {language === 'ar' ? 'مهام' : 'tasks'})
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-rose-50/60 p-3 border border-rose-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-rose-700 font-bold block flex items-center gap-1">
            <Flame className="h-3 w-3 text-rose-600" />
            {language === 'ar' ? 'طاقة قصوى' : 'At Capacity'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-rose-700 font-mono tabular-nums">
              {totalOverloadedCount}
            </span>
            <span className="text-[10px] text-rose-600">
              (4+ {language === 'ar' ? 'مهام' : 'tasks'})
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'البحث بالاسم، المسمى الوظيفي، أو رقم الموظف...'
                : 'Search by name, role title, or employee number...'
            }
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-9 text-xs text-[#24291F] placeholder-slate-400 focus:border-[#4C5540] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] overflow-x-auto">
            <button
              onClick={() => setSelectedTeamFilter('all')}
              className={`rounded-lg px-2.5 py-1 font-bold transition-colors cursor-pointer ${
                selectedTeamFilter === 'all'
                  ? 'bg-[#4C5540] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'كافة الأقسام' : 'All Teams'}
            </button>
            <button
              onClick={() => setSelectedTeamFilter('creative')}
              className={`rounded-lg px-2 py-1 font-bold transition-colors cursor-pointer ${
                selectedTeamFilter === 'creative'
                  ? 'bg-[#4C5540] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'التصميم' : 'Design/UI'}
            </button>
            <button
              onClick={() => setSelectedTeamFilter('social')}
              className={`rounded-lg px-2 py-1 font-bold transition-colors cursor-pointer ${
                selectedTeamFilter === 'social'
                  ? 'bg-[#4C5540] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'السوشيال والمحتوى' : 'Social'}
            </button>
            <button
              onClick={() => setSelectedTeamFilter('tech')}
              className={`rounded-lg px-2 py-1 font-bold transition-colors cursor-pointer ${
                selectedTeamFilter === 'tech'
                  ? 'bg-[#4C5540] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'التطوير وSEO' : 'Tech'}
            </button>
            <button
              onClick={() => setSelectedTeamFilter('growth')}
              className={`rounded-lg px-2 py-1 font-bold transition-colors cursor-pointer ${
                selectedTeamFilter === 'growth'
                  ? 'bg-[#4C5540] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'ar' ? 'الإعلانات والمبيعات' : 'Ads & Sales'}
            </button>
          </div>

          {/* Workload Status Filter */}
          <select
            value={selectedWorkloadFilter}
            onChange={(e) => setSelectedWorkloadFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:border-[#4C5540] focus:outline-hidden cursor-pointer"
          >
            <option value="all">{language === 'ar' ? 'جميع مستويات العبء' : 'All Workloads'}</option>
            <option value="available">{language === 'ar' ? 'متاح (طاقة شاغرة)' : 'Available'}</option>
            <option value="balanced">{language === 'ar' ? 'معتدل (1-2 مهام)' : 'Balanced'}</option>
            <option value="busy">{language === 'ar' ? 'مرتفع (3 مهام)' : 'Busy'}</option>
            <option value="overloaded">{language === 'ar' ? 'طاقة قصوى (4+ مهام)' : 'At Capacity'}</option>
          </select>
        </div>
      </div>

      {/* Members Availability Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full py-10 text-center rounded-xl bg-white border border-slate-200">
            <Users className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-xs font-bold text-slate-700">
              {language === 'ar'
                ? 'لا يوجد أعضاء يطابقون شروط البحث أو الفلترة'
                : 'No team members match the search or filter criteria'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const roleObj = roles.find((r) => user.roleIds.includes(r.id));
            const {
              assignedTasks,
              taskCount,
              urgentCount,
              inProgressCount,
              inReviewCount,
              workloadLevel,
              percentage,
              labelAr,
              labelEn,
              barColor,
              textColor,
              bgBadgeColor,
            } = getMemberWorkload(user.id);

            const isOnline = user.status === 'active';
            const canManage =
              hasPermission('can_manage_team_members') ||
              currentUser.id === user.id ||
              currentUser.roleIds.includes('role-founder');

            return (
              <div
                key={user.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-[#8A927D] hover:shadow-xs transition-all"
              >
                <div>
                  {/* Top Row: Avatar, Member Info, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                        />
                        {/* Status Dot with tooltip meaning */}
                        <span
                          title={isOnline ? 'Active' : 'Away'}
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-[#24291F] line-clamp-1">
                            {user.name}
                          </h4>
                          {user.employeeNumber && (
                            <span className="font-mono text-[9px] font-black text-slate-400 bg-slate-100 rounded px-1 py-0.2">
                              #{user.employeeNumber}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-medium">
                          {roleObj ? (language === 'ar' ? roleObj.nameAr : roleObj.name) : user.team}
                        </p>
                      </div>
                    </div>

                    {/* Operational Status Pill */}
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold flex items-center gap-1 border ${
                          isOnline
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isOnline ? (
                          <>
                            <UserCheck className="h-2.5 w-2.5" />
                            <span>{language === 'ar' ? 'متواجد' : 'Active'}</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-2.5 w-2.5" />
                            <span>{language === 'ar' ? 'إجازة / غير متواجد' : 'Away'}</span>
                          </>
                        )}
                      </span>

                      {/* Admin Toggle Status Quick Button */}
                      {canManage && (
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="text-[9px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                          title={language === 'ar' ? 'تبديل حالة التواجد' : 'Toggle status'}
                        >
                          {isOnline
                            ? language === 'ar' ? 'تبديل لغير متواجد' : 'Set away'
                            : language === 'ar' ? 'تفعيل التواجد' : 'Set active'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Workload Capacity Meter */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {language === 'ar' ? 'مستوى عبء العمل:' : 'Workload Level:'}
                      </span>
                      <span className={`font-bold ${textColor}`}>
                        {language === 'ar' ? labelAr : labelEn}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{percentage}% {language === 'ar' ? 'طاقة مستهلكة' : 'capacity'}</span>
                      <span className="tabular-nums font-semibold text-slate-700">
                        {taskCount} {language === 'ar' ? 'مهام نشطة' : 'active tasks'}
                      </span>
                    </div>
                  </div>

                  {/* Active Tasks Breakdown Tags */}
                  {taskCount > 0 ? (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[10px]">
                      {urgentCount > 0 && (
                        <span className="rounded bg-rose-50 px-1.5 py-0.5 font-bold text-rose-700 border border-rose-200 flex items-center gap-0.5">
                          <Flame className="h-2.5 w-2.5" />
                          {urgentCount} {language === 'ar' ? 'عاجلة' : 'urgent'}
                        </span>
                      )}
                      {inProgressCount > 0 && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700 border border-blue-200">
                          {inProgressCount} {language === 'ar' ? 'تنفيذ' : 'in-progress'}
                        </span>
                      )}
                      {inReviewCount > 0 && (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 font-bold text-amber-800 border border-amber-200">
                          {inReviewCount} {language === 'ar' ? 'مراجعة' : 'review'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>{language === 'ar' ? 'جاهز لاستقبال مهام جديدة فوراً' : 'Ready for new task assignments'}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedUserForTasks(user)}
                    className="text-[11px] font-bold text-[#4C5540] hover:text-[#24291F] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'ar' ? 'تفاصيل المهام' : 'View Tasks'}</span>
                    <span className="rounded-full bg-slate-100 px-1.5 text-[9px] font-mono text-slate-600">
                      {taskCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-[#4C5540] flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{language === 'ar' ? 'تكليف مهمة' : 'Assign'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Inspection Modal / Drawer for Selected Member */}
      {selectedUserForTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForTasks.avatar}
                  alt={selectedUserForTasks.name}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedUserForTasks.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'قائمة المهام النشطة والمسندة' : 'Assigned Active Tasks'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserForTasks(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tasks List */}
            <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {(() => {
                const userTasks = tasks.filter(
                  (t) =>
                    t.assignedTo &&
                    t.assignedTo.includes(selectedUserForTasks.id) &&
                    t.status !== 'done' &&
                    t.status !== 'client_delivered'
                );

                if (userTasks.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs text-slate-400">
                      <CheckCircle className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                      <p className="font-bold text-slate-700">
                        {language === 'ar'
                          ? 'لا توجد مهام نشطة مسندة لهذا العضو حالياً!'
                          : 'No active tasks currently assigned to this member!'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {language === 'ar'
                          ? 'يمكنك تكليفه بمهام جديدة عبر لوحة كانبان.'
                          : 'You can assign new tasks via the Kanban board.'}
                      </p>
                    </div>
                  );
                }

                return userTasks.map((task) => {
                  const isUrgent = task.priority === 'urgent' || task.priority === 'high';
                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {task.priority.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {task.dueDate}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                            {task.title}
                          </h5>
                          {task.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <span className="rounded bg-white px-2 py-0.5 text-[9px] font-bold text-slate-700 border border-slate-200 shrink-0">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedUserForTasks(null);
                  setActiveTab('tasks');
                }}
                className="btn-shal-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'ar' ? 'فتح في لوحة المهام' : 'Open in Tasks'}</span>
                <ExternalLink className="h-3 w-3" />
              </button>

              <button
                onClick={() => setSelectedUserForTasks(null)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
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
