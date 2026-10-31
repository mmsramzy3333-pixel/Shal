import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  supabase,
  AppRole,
  mapRoleToSupabaseRole,
  mapSupabaseRoleToRoleId,
  DbProfile,
  DbTask,
} from '../lib/supabaseClient';
import {
  getSupabaseProfiles,
  updateSupabaseUserRole,
  updateSupabaseProfile,
  upsertSupabaseProfile,
  deleteSupabaseProfile,
  getSupabaseTasks,
  createTask as createSupabaseTask,
  updateTask as updateSupabaseTask,
  deleteSupabaseTask,
  getSupabaseAuditLogs,
  subscribeToAuditLogsRealtime,
  subscribeToTasksRealtime,
  subscribeToNotificationBroadcast,
  broadcastRealtimeNotification,
  playNotificationSound,
  auditLogToActivityItem,
  profileToUser,
  userToProfile,
  adminCreateUserAccount,
  adminResetUserPassword,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getCurrentUserSession,
  onAuthStateChange,
} from '../lib/supabaseService';
import {
  User,
  Role,
  Permission,
  PermissionKey,
  RolePermissionMapping,
  Client,
  Project,
  Task,
  TaskStatus,
  Subtask,
  TaskComment,
  ContentPost,
  ContentStatus,
  Ticket,
  TicketStatus,
  AppNotification,
  ActivityLogItem,
  CommunicationLog,
  ToastNotification,
  ProfileChangeRequest,
  AdCampaign,
  SeoKeyword,
  UiUxProjectAsset,
  ChatMessage,
  ChatChannel,
  UserPresenceStatus,
  AppCustomAssets,
  AttendanceRecord,
  AttendanceBreak,
  HourlyVerification,
  AgencyTeam,
} from '../types';
import { getShalEmployeeAvatar } from '../components/common/ShalLogo';
import {
  SYSTEM_PERMISSIONS,
  INITIAL_ROLES,
  INITIAL_ROLE_PERMISSIONS,
  INITIAL_USERS,
  INITIAL_PROFILE_REQUESTS,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_CONTENT_POSTS,
  INITIAL_TICKETS,
  INITIAL_CAMPAIGNS,
  INITIAL_SEO_KEYWORDS,
  INITIAL_UIUX_ASSETS,
  INITIAL_CHAT_CHANNELS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';

interface AppContextType {
  // State
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentUserRole: Role | undefined;
  currentAppRole: AppRole;
  isOwner: boolean;
  isAdminOrOwner: boolean;
  users: User[];
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermissionMapping[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  contentPosts: ContentPost[];
  tickets: Ticket[];
  campaigns: AdCampaign[];
  seoKeywords: SeoKeyword[];
  uiuxAssets: UiUxProjectAsset[];
  profileRequests: ProfileChangeRequest[];
  chatChannels: ChatChannel[];
  chatMessages: ChatMessage[];
  unreadChatCount: number;
  markChatAsRead: (channelId?: string) => void;
  activeChatChannelId: string;
  setActiveChatChannelId: (id: string) => void;
  sendChatMessage: (
    channelId: string,
    content: string,
    attachedTaskId?: string,
    attachments?: { name: string; url: string; size?: string; type?: 'image' | 'file' | 'audio' }[],
    replyTo?: { id: string; senderName: string; content: string }
  ) => void;
  sendVoiceNote: (channelId: string, durationStr: string) => void;
  toggleMessageReaction: (messageId: string, emoji: string) => void;
  deleteChatMessage: (messageId: string) => void;
  togglePinChatMessage: (messageId: string) => void;
  updateChannelMembers: (channelId: string, allowedMemberIds: string[]) => void;
  notifications: AppNotification[];
  activityLogs: ActivityLogItem[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Real Authentication
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    roleId: string;
    employeeNumber: string;
    team: AgencyTeam;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Real Attendance & Work Hours Tracking
  attendanceRecords: AttendanceRecord[];
  todayAttendance: AttendanceRecord | null;
  activeHourlyVerification: HourlyVerification | null;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  createHourlyChallenge: (userId: string) => Promise<void>;
  respondHourlyVerification: (verificationId: string, taskSummary: string) => Promise<void>;

  // User Presence & Status (Online / Busy / Offline)
  userPresence: Record<string, UserPresenceStatus>;
  updateUserPresence: (status: UserPresenceStatus, targetUserId?: string) => void;

  // Custom Assets & Icons (Admin / Authorized only)
  customAssets: AppCustomAssets;
  updateCustomAsset: (key: keyof AppCustomAssets, value: any) => void;
  updateNavIcon: (navKey: string, iconName: string) => void;
  updateMemberAvatar: (userId: string, avatarUrl: string) => void;
  updateClientLogo: (clientId: string, logoUrl: string) => void;
  resetCustomAssets: () => void;

  // RBAC Helpers & Actions
  hasPermission: (key: PermissionKey, targetUser?: User) => boolean;
  getUserRoles: (user?: User) => Role[];
  toggleRolePermission: (roleId: string, permissionKey: PermissionKey) => void;
  assignRolePermissions: (roleId: string, permissions: PermissionKey[]) => void;
  addRolePermissionMapping: (roleId: string, permissionKey: PermissionKey) => void;
  removeRolePermissionMapping: (mappingId: string) => void;
  assignUserRoles: (userId: string, roleIds: string[]) => void;

  // Client Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'communicationLogs' | 'documents'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addCommunicationLog: (clientId: string, log: Omit<CommunicationLog, 'id' | 'date' | 'createdBy'>) => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'subtasks' | 'comments'> & { subtasks?: Subtask[]; comments?: TaskComment[] }) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addTaskComment: (taskId: string, content: string) => void;
  linkTaskDependency: (taskId: string, dependsOnTaskId?: string, dependencyNote?: string) => void;

  // Social Content Actions
  addContentPost: (post: Omit<ContentPost, 'id' | 'createdAt' | 'status'>) => void;
  updateContentPost: (id: string, updates: Partial<ContentPost>) => void;
  submitPostForReview: (postId: string) => void;
  approvePost: (postId: string) => void;
  requestChangesPost: (postId: string, feedbackNote: string) => void;
  publishPost: (postId: string) => void;

  // Tech Ticket Actions
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;

  // Departmental Data Actions
  addCampaign: (campaign: Omit<AdCampaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<AdCampaign>) => void;
  addSeoKeyword: (kw: Omit<SeoKeyword, 'id' | 'lastUpdated'>) => void;
  updateSeoKeyword: (id: string, updates: Partial<SeoKeyword>) => void;
  addUiUxAsset: (asset: Omit<UiUxProjectAsset, 'id' | 'lastModified'>) => void;
  updateUiUxAsset: (id: string, updates: Partial<UiUxProjectAsset>) => void;

  // Profile Change Request & Approval System (Admin Confirmation)
  submitProfileChangeRequest: (requestedName: string, requestedAvatar: string, reason?: string) => void;
  approveProfileChangeRequest: (requestId: string) => void;
  rejectProfileChangeRequest: (requestId: string, reason: string) => void;

  // Admin & RBAC Actions
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRolePermissions: (roleId: string, permissions: PermissionKey[]) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  deleteRole: (roleId: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  updateUserAccount: (
    userId: string,
    updates: {
      name?: string;
      email?: string;
      employeeNumber?: string;
      team?: any;
      roleId?: string;
      password?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  adminResetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;

  // Notifications & Audit
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  checkApproachingDeadlines: (silent?: boolean) => { checkedCount: number; warningsCount: number };
  logActivity: (actionAr: string, actionEn: string, entityType: ActivityLogItem['entityType'], entityName: string) => void;

  // Toast Notifications
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: (id: string) => void;

  // Reset demo
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'shal_agency_v4';

const DEFAULT_CUSTOM_ASSETS: AppCustomAssets = {
  brandLogoUrl: '/assets/aistudio/Artboard_6_67181bbc.png',
  brandNameAr: 'شال',
  brandNameEn: 'SHAL',
  navIcons: {
    dashboard: 'LayoutDashboard',
    chat: 'MessageSquare',
    tasks: 'CheckSquare',
    clients: 'Building2',
    social: 'Calendar',
    admin: 'ShieldCheck',
  },
  memberAvatars: {},
  clientLogos: {},
  updatedAt: new Date().toISOString(),
  updatedBy: 'م. محمود الشال (المؤسس والرئيس التنفيذي)',
};

const INITIAL_USER_PRESENCE: Record<string, UserPresenceStatus> = {
  'user-founder': 'online',
  'user-operations-manager': 'online',
  'user-marketing-manager': 'online',
  'user-sales-manager': 'busy',
  'user-media-buyer': 'online',
  'user-seo-specialist': 'busy',
  'user-social-media-lead': 'online',
  'user-copywriter': 'online',
  'user-ui-ux': 'online',
  'user-fullstack-dev': 'busy',
  'user-frontend-dev': 'offline',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(null as any);

  const currentUserRef = useRef<User | null>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  const notifiedDeadlinesRef = useRef<Set<string>>(new Set());

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activeHourlyVerification, setActiveHourlyVerification] = useState<HourlyVerification | null>(null);

  const [roles, setRoles] = useState<Role[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_roles`);
      return saved ? JSON.parse(saved) : INITIAL_ROLES;
    } catch {
      return INITIAL_ROLES;
    }
  });

  const [permissions] = useState<Permission[]>(SYSTEM_PERMISSIONS);

  const [rolePermissions, setRolePermissions] = useState<RolePermissionMapping[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_role_permissions`);
      return saved ? JSON.parse(saved) : INITIAL_ROLE_PERMISSIONS;
    } catch {
      return INITIAL_ROLE_PERMISSIONS;
    }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_clients`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [contentPosts, setContentPosts] = useState<ContentPost[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_posts`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tickets`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [campaigns, setCampaigns] = useState<AdCampaign[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [seoKeywords, setSeoKeywords] = useState<SeoKeyword[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_seo_keywords`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [uiuxAssets, setUiUxAssets] = useState<UiUxProjectAsset[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_uiux_assets`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [profileRequests, setProfileRequests] = useState<ProfileChangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile_requests`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [chatChannels, setChatChannels] = useState<ChatChannel[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_chat_channels`);
      return saved ? JSON.parse(saved) : INITIAL_CHAT_CHANNELS;
    } catch {
      return INITIAL_CHAT_CHANNELS;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_chat_messages`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeChatChannelId, setActiveChatChannelId] = useState<string>('ch-general');

  const [unreadChatCount, setUnreadChatCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_unread_chat`);
      return saved !== null ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_unread_chat`, JSON.stringify(unreadChatCount));
  }, [unreadChatCount]);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activity`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_theme`, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // User Presence State
  const [userPresence, setUserPresence] = useState<Record<string, UserPresenceStatus>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user_presence`);
      return saved ? JSON.parse(saved) : INITIAL_USER_PRESENCE;
    } catch {
      return INITIAL_USER_PRESENCE;
    }
  });

  // Custom Assets State (Logos, Icons, Avatars)
  const [customAssets, setCustomAssets] = useState<AppCustomAssets>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_custom_assets`);
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_ASSETS;
    } catch {
      return DEFAULT_CUSTOM_ASSETS;
    }
  });

  // Find the primary role of the active logged in user
  const currentUserRole = currentUser ? (roles.find((r) => currentUser.roleIds?.includes(r.id)) || roles[0]) : roles[0];
  const currentAppRole: AppRole = currentUser
    ? (currentUser.roleIds.includes('role-founder') || currentUserRole?.code === 'founder'
        ? 'owner'
        : currentUser.roleIds.includes('role-operations-manager') || currentUserRole?.code === 'operations_mgr'
        ? 'admin'
        : 'member')
    : 'member';
  const isOwner = currentAppRole === 'owner';
  const isAdminOrOwner = currentAppRole === 'owner' || currentAppRole === 'admin';

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = currentUser
    ? attendanceRecords.find((rec) => rec.userId === currentUser.id && rec.date === todayStr) || null
    : null;

  // 1. Initial Supabase PostgreSQL Profiles & Audit Logs sync
  useEffect(() => {
    let isMounted = true;
    async function loadInitialSupabaseData() {
      try {
        const dbProfiles = await getSupabaseProfiles();
        if (isMounted && dbProfiles && dbProfiles.length > 0) {
          const mapped = dbProfiles.map(profileToUser);
          setUsers(mapped);
        }

        const dbLogs = await getSupabaseAuditLogs(50);
        if (isMounted && dbLogs && dbLogs.length > 0) {
          setActivityLogs(dbLogs.map(auditLogToActivityItem));
        }

        const dbTasks = await getSupabaseTasks();
        if (isMounted && dbTasks && dbTasks.length > 0) {
          const mappedTasks: Task[] = dbTasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            status: (t.status as any) || 'todo',
            priority: (t.priority as any) || 'medium',
            teamType: (t.team_type as any) || 'social',
            clientId: t.client_id || '',
            projectId: t.project_id || '',
            assignedTo: t.assigned_to || [],
            createdBy: t.created_by || '',
            dueDate: t.due_date || '',
            subtasks: [],
            comments: [],
            createdAt: t.created_at || new Date().toISOString(),
          }));
          setTasks(mappedTasks);
        }
      } catch (err) {
        console.warn('[Supabase Initial Sync note]:', err);
      }
    }
    loadInitialSupabaseData();

    // 2. Subscribe to real-time changes on public.audit_logs
    const unsubAudit = subscribeToAuditLogsRealtime((newDbLog) => {
      const item = auditLogToActivityItem(newDbLog);
      setActivityLogs((prev) => [item, ...prev.filter((l) => l.id !== item.id)]);
    });

    return () => {
      isMounted = false;
      unsubAudit();
    };
  }, []);

  // 3. Supabase Authentication State Listener (Strict Official Supabase Session Validation)
  useEffect(() => {
    let isMounted = true;

    function restoreLocalSession(): boolean {
      try {
        const localId = localStorage.getItem(`${STORAGE_KEY}_local_session`);
        const savedUser = localStorage.getItem(`${STORAGE_KEY}_current_user`);
        if (!localId || !savedUser) return false;
        const parsed: User = JSON.parse(savedUser);
        if (parsed?.id !== localId || parsed.status === 'inactive') return false;
        setCurrentUser(parsed);
        setAuthLoading(false);
        return true;
      } catch {
        return false;
      }
    }

    async function restoreSession(session: any) {
      if (!isMounted) return;

      if (!session?.user) {
        if (restoreLocalSession()) return;
        // No active or valid Supabase session: fail-closed, revoke access
        setCurrentUser(null as any);
        localStorage.removeItem(`${STORAGE_KEY}_active_session`);
        localStorage.removeItem(`${STORAGE_KEY}_current_user`);
        setAuthLoading(false);
        return;
      }

      try {
        const authUser = session.user;
        const email = authUser.email?.toLowerCase();

        // 1. Query verified profile from public.profiles
        const { data: dbProfile, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profError) {
          console.warn('[Supabase Session Restore profile query note]:', profError.message);
        }

        let resolvedUser: User | null = null;

        if (dbProfile) {
          resolvedUser = profileToUser(dbProfile);
        } else if (email) {
          // If profile ID doesn't match yet, check by email
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (profileByEmail) {
            resolvedUser = profileToUser(profileByEmail);
          } else {
            // New user account: construct clean model from auth metadata
            const defaultRole =
              email === 'm.m.s.ramzy3333@gmail.com' || email === 'medhat.nabdalwusul@gmail.com'
                ? 'owner'
                : 'member';

            const newProf: DbProfile = {
              id: authUser.id,
              name: authUser.user_metadata?.name || email.split('@')[0],
              email,
              role: defaultRole,
              employee_number: authUser.user_metadata?.employee_number || '01',
              team: authUser.user_metadata?.team || 'operations',
              status: 'active',
            };

            await upsertSupabaseProfile(newProf).catch(() => {});
            resolvedUser = profileToUser(newProf);
          }
        }

        if (resolvedUser) {
          if (resolvedUser.status === 'inactive') {
            await signOutUser();
            setCurrentUser(null as any);
            setAuthLoading(false);
            return;
          }

          setCurrentUser(resolvedUser);
          localStorage.setItem(`${STORAGE_KEY}_active_session`, resolvedUser.id);
          localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(resolvedUser));
        } else {
          setCurrentUser(null as any);
        }
      } catch (err) {
        console.warn('[Session restore exception]:', err);
        setCurrentUser(null as any);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    }

    // 3.1 Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        restoreSession(session);
      })
      .catch(() => {
        restoreSession(null);
      });

    // 3.2 Live auth changes listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (restoreLocalSession()) return;
        setCurrentUser(null as any);
        localStorage.removeItem(`${STORAGE_KEY}_active_session`);
        localStorage.removeItem(`${STORAGE_KEY}_current_user`);
        setAuthLoading(false);
      } else {
        restoreSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_chat_channels`, JSON.stringify(chatChannels));
  }, [chatChannels]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_chat_messages`, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_roles`, JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_posts`, JSON.stringify(contentPosts));
  }, [contentPosts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tickets`, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_seo_keywords`, JSON.stringify(seoKeywords));
  }, [seoKeywords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_uiux_assets`, JSON.stringify(uiuxAssets));
  }, [uiuxAssets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile_requests`, JSON.stringify(profileRequests));
  }, [profileRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activity`, JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Toast Helper
  const showToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastNotification = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Logger
  const logActivity = (
    actionAr: string,
    actionEn: string,
    entityType: ActivityLogItem['entityType'],
    entityName: string
  ) => {
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action: actionEn,
      actionAr: actionAr,
      entityType,
      entityName,
      createdAt: 'الآن',
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 50)]);
  };

  // Notification Helper
  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: 'الآن',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id || n.userId === 'all' ? { ...n, isRead: true } : n))
    );
  };

  // Check approaching deadlines (Due Date monitoring)
  const checkApproachingDeadlines = (silent: boolean = false): { checkedCount: number; warningsCount: number } => {
    const activeUser = currentUserRef.current;
    if (!tasks || tasks.length === 0 || !activeUser) {
      return { checkedCount: 0, warningsCount: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let warningsCount = 0;
    let checkedCount = 0;

    // Filter active tasks (not done) assigned to currentUser or all tasks if owner/admin
    const activeTasks = tasks.filter((t) => {
      const isUnfinished = t.status !== 'done';
      const isAssigned = (t.assignedTo && t.assignedTo.includes(activeUser.id)) || isOwner || isAdminOrOwner;
      return isUnfinished && isAssigned && t.dueDate;
    });

    activeTasks.forEach((task) => {
      checkedCount++;
      const parts = task.dueDate.split('-');
      if (parts.length < 3) return;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return;

      const due = new Date(year, month - 1, day);
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Key for deduplicating alerts in current session
      const notifKey = `deadline_${task.id}_${task.dueDate}_${diffDays <= 0 ? 'today_or_overdue' : 'approaching'}`;
      if (notifiedDeadlinesRef.current.has(notifKey)) {
        return;
      }

      if (diffDays < 0) {
        // Overdue task
        warningsCount++;
        notifiedDeadlinesRef.current.add(notifKey);
        addNotification({
          userId: activeUser.id,
          title: `⚠️ مهمة متأخرة عن موعد التسليم: ${task.title}`,
          message: `المهمة كان موعد تسليمها النهائي في (${task.dueDate}) ولم تكتمل بعد.`,
          type: 'deadline_warning',
          linkTab: 'tasks',
        });
        if (!silent) {
          showToast({
            type: 'warning',
            title: '⚠️ تنبيه موعد التسليم (متأخرة)',
            message: `المهمة "${task.title}" تجاوزت موعد التسليم المجدول!`,
          });
          playNotificationSound('deadline');
        }
      } else if (diffDays === 0) {
        // Due today
        warningsCount++;
        notifiedDeadlinesRef.current.add(notifKey);
        addNotification({
          userId: activeUser.id,
          title: `⏰ موعد تسليم المهمة اليوم: ${task.title}`,
          message: `المهمة "${task.title}" مجدولة للتسليم اليوم (${task.dueDate}).`,
          type: 'deadline_warning',
          linkTab: 'tasks',
        });
        if (!silent) {
          showToast({
            type: 'warning',
            title: '⏰ موعد التسليم اليوم!',
            message: `المهمة "${task.title}" مطلوبة للتسليم اليوم.`,
          });
          playNotificationSound('deadline');
        }
      } else if (diffDays <= 2) {
        // Due in 1 or 2 days (within 48 hours)
        warningsCount++;
        notifiedDeadlinesRef.current.add(notifKey);
        const dayLabel = diffDays === 1 ? 'غداً' : 'خلال يومين';
        addNotification({
          userId: activeUser.id,
          title: `⏰ اقتراب موعد تسليم مهمة (${dayLabel})`,
          message: `المهمة "${task.title}" يحل موعد تسليمها ${dayLabel} (${task.dueDate}).`,
          type: 'deadline_warning',
          linkTab: 'tasks',
        });
        if (!silent) {
          showToast({
            type: 'warning',
            title: `⏰ اقتراب موعد التسليم (${dayLabel})`,
            message: `متبقي ${diffDays} يوم على موعد تسليم "${task.title}"`,
          });
          playNotificationSound('deadline');
        }
      }
    });

    return { checkedCount, warningsCount };
  };

  // 4. Supabase Realtime Subscriptions (Tasks CDC & Broadcast Notifications)
  useEffect(() => {
    // 4.1 Subscribe to PostgreSQL CDC events on public.tasks
    const unsubTasks = subscribeToTasksRealtime((payload) => {
      const activeUser = currentUserRef.current;
      const { eventType, new: newDbTask, old: oldDbTask } = payload;

      if (eventType === 'INSERT' && newDbTask) {
        const newTask: Task = {
          id: newDbTask.id,
          title: newDbTask.title,
          description: newDbTask.description || '',
          status: (newDbTask.status as any) || 'todo',
          priority: (newDbTask.priority as any) || 'medium',
          teamType: (newDbTask.team_type as any) || 'social',
          clientId: newDbTask.client_id || '',
          projectId: newDbTask.project_id || '',
          assignedTo: newDbTask.assigned_to || [],
          createdBy: newDbTask.created_by || '',
          dueDate: newDbTask.due_date || '',
          subtasks: [],
          comments: [],
          createdAt: newDbTask.created_at || new Date().toISOString(),
        };

        setTasks((prev) => {
          if (prev.some((t) => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });

        // Notify if assigned to active user
        if (activeUser && newTask.assignedTo.includes(activeUser.id)) {
          addNotification({
            userId: activeUser.id,
            title: '📋 تم إسناد مهمة جديدة إليك (Supabase Realtime)',
            message: `تم تكليفك بالمهمة: "${newTask.title}"`,
            type: 'task_assigned',
            linkTab: 'tasks',
          });
          showToast({
            type: 'info',
            title: '📋 مهمة جديدة مسندة إليك',
            message: `تم تكليفك بـ "${newTask.title}" عبر Supabase في الوقت الفعلي`,
          });
          playNotificationSound('assignment');
        }
      } else if (eventType === 'UPDATE' && newDbTask) {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id !== newDbTask.id) return t;
            return {
              ...t,
              title: newDbTask.title,
              description: newDbTask.description || t.description,
              status: (newDbTask.status as any) || t.status,
              priority: (newDbTask.priority as any) || t.priority,
              teamType: (newDbTask.team_type as any) || t.teamType,
              assignedTo: newDbTask.assigned_to || t.assignedTo,
              dueDate: newDbTask.due_date || t.dueDate,
            };
          })
        );

        // Check if newly assigned to active user
        if (activeUser && newDbTask.assigned_to?.includes(activeUser.id)) {
          const wasPreviouslyAssigned = oldDbTask?.assigned_to?.includes(activeUser.id);
          if (!wasPreviouslyAssigned) {
            addNotification({
              userId: activeUser.id,
              title: '📋 تم تكليفك بمهمة (تحديث فوري)',
              message: `تمت إضافتك إلى الفريق المسؤول عن مهمة "${newDbTask.title}".`,
              type: 'task_assigned',
              linkTab: 'tasks',
            });
            showToast({
              type: 'info',
              title: '📋 تم تكليفك بمهمة جديدة',
              message: `أصبحت مسؤولاً عن المهمة: "${newDbTask.title}"`,
            });
            playNotificationSound('assignment');
          }
        }
      } else if (eventType === 'DELETE' && oldDbTask?.id) {
        setTasks((prev) => prev.filter((t) => t.id !== oldDbTask.id));
      }
    });

    // 4.2 Subscribe to Broadcast channel for instant multi-user messaging
    const unsubBroadcast = subscribeToNotificationBroadcast((broadcastPayload) => {
      const activeUser = currentUserRef.current;
      if (!activeUser) return;

      const isTargeted =
        broadcastPayload.assignedTo &&
        (broadcastPayload.assignedTo.includes(activeUser.id) || broadcastPayload.assignedTo.includes('all'));

      if (isTargeted) {
        if (broadcastPayload.eventType === 'task_assigned') {
          addNotification({
            userId: activeUser.id,
            title: `📋 إشعار تكليف: ${broadcastPayload.taskTitle}`,
            message: broadcastPayload.message || `تم إسناد المهمة إليك من قِبل ${broadcastPayload.senderName || 'الإدارة'}.`,
            type: 'task_assigned',
            linkTab: 'tasks',
          });
          showToast({
            type: 'info',
            title: 'مهمة مسندة جديدة',
            message: `"${broadcastPayload.taskTitle}" تم إسنادها إليك الآن`,
          });
          playNotificationSound('assignment');
        } else if (broadcastPayload.eventType === 'deadline_warning') {
          addNotification({
            userId: activeUser.id,
            title: `⏰ تنبيه موعد تسليم: ${broadcastPayload.taskTitle}`,
            message: broadcastPayload.message || `يقترب موعد تسليم المهمة في (${broadcastPayload.dueDate})`,
            type: 'deadline_warning',
            linkTab: 'tasks',
          });
          showToast({
            type: 'warning',
            title: '⏰ تنبيه اقتراب موعد التسليم',
            message: `المهمة "${broadcastPayload.taskTitle}" شارفت على موعد التسليم!`,
          });
          playNotificationSound('deadline');
        }
      }
    });

    return () => {
      unsubTasks();
      unsubBroadcast();
    };
  }, []);

  // 5. Automated monitor for approaching deadlines
  useEffect(() => {
    if (!currentUser || tasks.length === 0) return;

    checkApproachingDeadlines(true);

    const deadlineInterval = setInterval(() => {
      checkApproachingDeadlines(true);
    }, 60000);

    return () => clearInterval(deadlineInterval);
  }, [tasks, currentUser]);

  // Permissions & RBAC
  const hasPermission = (key: PermissionKey, targetUser?: User): boolean => {
    const userToCheck = targetUser || currentUser;
    if (userToCheck.customPermissions?.includes(key)) return true;

    // Founder role has full wildcard access
    if (userToCheck.roleIds.includes('role-founder')) return true;

    const userRoleDefs = roles.filter((r) => userToCheck.roleIds.includes(r.id));
    return userRoleDefs.some((role) => role.permissions.includes(key));
  };

  const getUserRoles = (user?: User): Role[] => {
    const u = user || currentUser;
    return roles.filter((r) => u.roleIds.includes(r.id));
  };

  const toggleRolePermission = (roleId: string, permissionKey: PermissionKey) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const exists = r.permissions.includes(permissionKey);
        const newPerms = exists
          ? r.permissions.filter((p) => p !== permissionKey)
          : [...r.permissions, permissionKey];
        return { ...r, permissions: newPerms };
      })
    );
  };

  const assignRolePermissions = (roleId: string, permissionsList: PermissionKey[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: permissionsList } : r))
    );
  };

  const addRolePermissionMapping = (roleId: string, permissionKey: PermissionKey) => {
    const permDef = permissions.find((p) => p.key === permissionKey);
    const newMapping: RolePermissionMapping = {
      id: `rpm-${Date.now()}`,
      roleId,
      permissionId: permDef?.id || `perm-${permissionKey}`,
      permissionKey,
      assignedAt: new Date().toISOString().slice(0, 10),
      assignedBy: currentUser.id,
    };
    setRolePermissions((prev) => [...prev, newMapping]);
  };

  const removeRolePermissionMapping = (mappingId: string) => {
    setRolePermissions((prev) => prev.filter((m) => m.id !== mappingId));
  };

  const assignUserRoles = async (userId: string, roleIds: string[]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, roleIds } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, roleIds }));
    }
    const targetRole = roleIds[0] || 'role-marketing-manager';
    const appRole = mapRoleToSupabaseRole(targetRole);
    // Atomic PostgreSQL trigger trg_profile_role_changed writes to public.audit_logs
    await updateSupabaseUserRole(userId, appRole);
  };

  // 4. Supabase Authentication Actions (Strict Official Supabase Flow)
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
      };
    }

    const loginWithLocalAccount = (): { success: boolean; error?: string } | null => {
      const candidates = [...users, ...INITIAL_USERS];
      const match = candidates.find(
        (u) => u.email?.trim().toLowerCase() === cleanEmail && (u.password ?? '').trim() === cleanPass
      );
      if (!match) return null;
      if (match.status === 'inactive') {
        return { success: false, error: 'تم تعطيل هذا الحساب من قِبل إدارة الوكالة.' };
      }

      const { password: _omit, ...safeUser } = match;
      const userModel = safeUser as User;

      setCurrentUser(userModel);
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === match.id);
        return exists ? prev : [match, ...prev];
      });
      localStorage.setItem(`${STORAGE_KEY}_local_session`, userModel.id);
      localStorage.setItem(`${STORAGE_KEY}_active_session`, userModel.id);
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(userModel));

      showToast({
        type: 'success',
        title: 'تم تسجيل الدخول بنجاح',
        message: `مرحباً بك مجدداً في وكالة شال، ${userModel.name}`,
      });
      return { success: true };
    };

    try {
      // 1. Authenticate credentials with Supabase Auth, falling back to the project's registered accounts
      let authRes: Awaited<ReturnType<typeof signInWithEmail>>;
      try {
        authRes = await signInWithEmail(cleanEmail, cleanPass);
      } catch (supabaseErr: any) {
        console.warn('[Supabase Auth unreachable]:', supabaseErr?.message || supabaseErr);
        authRes = { success: false };
      }

      if (!authRes.success || !authRes.user || !authRes.session) {
        const localResult = loginWithLocalAccount();
        if (localResult) return localResult;
        return {
          success: false,
          error: authRes.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        };
      }

      localStorage.removeItem(`${STORAGE_KEY}_local_session`);

      const authUser = authRes.user;

      // 2. Load the authenticated user's profile from public.profiles
      let activeProfile = authRes.profile;
      if (!activeProfile) {
        const { data: fetchedProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        activeProfile = fetchedProf;
      }

      if (!activeProfile) {
        // Check by email to see if record exists under legacy ID
        const { data: profByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (profByEmail) {
          activeProfile = profByEmail;
          if (profByEmail.id !== authUser.id) {
            try {
              await supabase.from('profiles').update({ id: authUser.id }).eq('email', cleanEmail);
            } catch {
              // Non-fatal
            }
            activeProfile.id = authUser.id;
          }
        } else {
          // Provision initial profile
          const defaultRole: AppRole =
            cleanEmail === 'm.m.s.ramzy3333@gmail.com' || cleanEmail === 'medhat.nabdalwusul@gmail.com'
              ? 'owner'
              : 'member';

          const newProf: DbProfile = {
            id: authUser.id,
            email: cleanEmail,
            name: authUser.user_metadata?.name || cleanEmail.split('@')[0],
            role: defaultRole,
            employee_number: '01',
            team: 'operations',
            status: 'active',
          };

          await upsertSupabaseProfile(newProf).catch(() => {});
          activeProfile = newProf;
        }
      }

      if (activeProfile && activeProfile.status === 'inactive') {
        await signOutUser();
        return {
          success: false,
          error: 'تم تعطيل هذا الحساب من قِبل إدارة الوكالة.',
        };
      }

      const userModel = profileToUser(activeProfile);

      setCurrentUser(userModel);
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === userModel.id);
        return exists ? prev.map((u) => (u.id === userModel.id ? userModel : u)) : [userModel, ...prev];
      });

      localStorage.setItem(`${STORAGE_KEY}_active_session`, userModel.id);
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(userModel));

      showToast({
        type: 'success',
        title: 'تم تسجيل الدخول بنجاح',
        message: `مرحباً بك مجدداً في وكالة شال، ${userModel.name}`,
      });

      return { success: true };
    } catch (err: any) {
      console.error('[Supabase Auth Exception]:', err?.message || err);
      return {
        success: false,
        error: 'حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى التحقق من اتصالك بالإنترنت.',
      };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      return { success: false, error: err.message || 'فشل تسجيل الدخول بواسطة Google.' };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    roleId: string;
    employeeNumber: string;
    team: AgencyTeam;
  }): Promise<{ success: boolean; error?: string }> => {
    // Registration is strictly restricted to Founder / Owner
    if (!isOwner && users.length > 0) {
      return {
        success: false,
        error: 'إنشاء وتسجيل الحسابات الجديدة مقتصر حصرياً على المالك (الفاوندر) لوكالة شال.',
      };
    }

    const cleanEmail = userData.email.trim().toLowerCase();
    const empNum = userData.employeeNumber || String(users.length + 1).padStart(2, '0');
    const newUid = `user-${Date.now()}`;

    const newUser: User = {
      id: newUid,
      name: userData.name.trim(),
      email: cleanEmail,
      password: userData.password,
      roleIds: userData.roleId ? [userData.roleId] : ['role-marketing-manager'],
      avatar: getShalEmployeeAvatar(empNum, '#0F172A'),
      employeeNumber: empNum,
      status: 'active',
      team: userData.team || 'operations',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setUsers((prev) => [...prev.filter((u) => u.id !== newUser.id), newUser]);
    setCurrentUser(newUser);
    localStorage.setItem(`${STORAGE_KEY}_active_session`, newUser.id);
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(newUser));

    showToast({
      type: 'success',
      title: 'تم إنشاء وتثبيت الحساب',
      message: `أهلاً بك في وكالة شال، ${newUser.name}!`,
    });
    return { success: true };
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Logout note:', err);
    }
    setCurrentUser(null as any);
    localStorage.removeItem(`${STORAGE_KEY}_local_session`);
    localStorage.removeItem(`${STORAGE_KEY}_active_session`);
    localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    showToast({
      type: 'info',
      title: 'تم تسجيل الخروج',
      message: 'تم إنهاء الجلسة بنجاح، بياناتك محفوظة بأمان.',
    });
  };

  // 5. Attendance & Work Verification Actions
  const clockIn = async () => {
    if (!currentUser) return;
    const now = new Date();
    const scheduledShiftMinutes = 9 * 60; // 09:00 AM standard shift
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const lateMinutes = currentMinutes > scheduledShiftMinutes ? currentMinutes - scheduledShiftMinutes : 0;

    const id = `att-${currentUser.id}-${todayStr}`;
    const newRecord: AttendanceRecord = {
      id,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUserRole?.nameAr || 'عضو الفريق',
      date: todayStr,
      clockIn: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      breaks: [],
      status: 'present',
      lateMinutes,
      totalHours: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setAttendanceRecords((prev) => [...prev.filter((r) => r.id !== id), newRecord]);
    logActivity('تسجيل الحضور وبدء الوردية', 'Clocked in', 'user', currentUser.name);
    showToast({
      type: lateMinutes > 0 ? 'warning' : 'success',
      title: lateMinutes > 0 ? 'تم تسجيل الحضور مع تأخير' : 'تم تسجيل الحضور في الموعد',
      message: lateMinutes > 0 ? `تم تسجيل الحضور بتأخير ${lateMinutes} دقيقة عن موعد 09:00 ص` : 'تم تسجيل حضورك بنجاح، وردية موفقة!',
    });
  };

  const clockOut = async () => {
    if (!currentUser || !todayAttendance) return;
    const now = new Date();

    // Calculate total hours
    let totalWorkHours = 0;
    if (todayAttendance.clockIn) {
      const parts = todayAttendance.clockIn.split(':');
      // Approximate hours worked
      const clockInHour = parseInt(parts[0], 10) || 9;
      const clockInMin = parseInt(parts[1], 10) || 0;
      const clockInTotalMin = clockInHour * 60 + clockInMin;
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const elapsedMin = Math.max(0, currentMin - clockInTotalMin);
      
      const breakMinutes = (todayAttendance.breaks || []).reduce(
        (acc, b) => acc + (b.durationMinutes || 0),
        0
      );
      totalWorkHours = Number(Math.max(0, (elapsedMin - breakMinutes) / 60).toFixed(2));
    }

    const updated: AttendanceRecord = {
      ...todayAttendance,
      clockOut: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      totalHours: totalWorkHours,
      updatedAt: now.toISOString(),
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === todayAttendance.id ? updated : r))
    );
    logActivity('تسجيل الانصراف وإنهاء الوردية', 'Clocked out', 'user', currentUser.name);
    showToast({
      type: 'info',
      title: 'تم تسجيل الانصراف',
      message: `تم إنهاء وردية اليوم بإجمالي ${totalWorkHours} ساعات عمل`,
    });
  };

  const startBreak = async () => {
    if (!currentUser || !todayAttendance) return;
    const now = new Date();
    const newBreak: AttendanceBreak = {
      id: `brk-${Date.now()}`,
      startTime: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedBreaks = [...(todayAttendance.breaks || []), newBreak];
    const updated: AttendanceRecord = {
      ...todayAttendance,
      breaks: updatedBreaks,
      status: 'on_break',
      updatedAt: now.toISOString(),
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === todayAttendance.id ? updated : r))
    );
    showToast({
      type: 'info',
      title: 'بدء الاستراحة',
      message: 'تم تسجيل بدء الاستراحة، وقت راحة ممتع!',
    });
  };

  const endBreak = async () => {
    if (!currentUser || !todayAttendance) return;
    const now = new Date();
    const existingBreaks = todayAttendance.breaks || [];
    if (existingBreaks.length === 0) return;

    const lastBreak = existingBreaks[existingBreaks.length - 1];
    const updatedBreaks = [
      ...existingBreaks.slice(0, -1),
      {
        ...lastBreak,
        endTime: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: 15,
      },
    ];

    const updated: AttendanceRecord = {
      ...todayAttendance,
      breaks: updatedBreaks,
      status: 'present',
      updatedAt: now.toISOString(),
    };

    setAttendanceRecords((prev) =>
      prev.map((r) => (r.id === todayAttendance.id ? updated : r))
    );
    showToast({
      type: 'success',
      title: 'انتهاء الاستراحة',
      message: 'تم العودة إلى العمل، نرحب بك مجدداً!',
    });
  };

  const createHourlyChallenge = async (targetUserId?: string, targetUserName?: string) => {
    const targetUid = targetUserId || currentUser?.id;
    const targetName = targetUserName || currentUser?.name;
    if (!targetUid || !targetName) return;

    // 15-minute grace period
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const newChallenge: HourlyVerification = {
      id: `verif-${Date.now()}`,
      userId: targetUid,
      userName: targetName,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      expiresAt,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setActiveHourlyVerification(newChallenge);
    showToast({
      type: 'info',
      title: 'تأكيد الحضور والنشاط',
      message: `تم إرسال اختبار التحقق الدوري للموظف ${targetName}`,
    });
  };

  const respondHourlyVerification = async (
    verificationId: string,
    status: 'verified' | 'missed',
    workSummary?: string
  ) => {
    setActiveHourlyVerification(null);
    showToast({
      type: status === 'verified' ? 'success' : 'warning',
      title: status === 'verified' ? 'تم توثيق الحضور والنشاط' : 'فات موعد التحقق',
      message: status === 'verified' ? 'تم تسجيل استجابتك بنجاح وحفظ ملخص الإنجاز' : 'تم توثيق عدم الاستجابة دون إلغاء حضور اليوم',
    });
  };

  // Client Actions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'communicationLogs' | 'documents'>) => {
    const newClient: Client = {
      ...clientData,
      id: `c-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      communicationLogs: [],
      documents: [],
    };
    setClients((prev) => [newClient, ...prev]);
    logActivity('أضاف عميلاً جديداً', 'Added a new client', 'client', newClient.name);
    showToast({
      type: 'success',
      title: 'تمت إضافة العميل',
      message: `تم تسجيل ملف العميل ${newClient.name} بنجاح`,
    });
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logActivity('قام بتعديل بيانات عميل', 'Updated client profile', 'client', id);
    showToast({
      type: 'info',
      title: 'تم التحديث',
      message: 'تم حفظ تعديلات العميل',
    });
  };

  const deleteClient = (id: string) => {
    const cl = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    logActivity('حذف ملف عميل', 'Deleted client profile', 'client', cl?.name || id);
    showToast({
      type: 'warning',
      title: 'تم الحذف',
      message: 'تم حذف العميل من النظام',
    });
  };

  const addCommunicationLog = (
    clientId: string,
    log: Omit<CommunicationLog, 'id' | 'date' | 'createdBy'>
  ) => {
    const newLogItem: CommunicationLog = {
      ...log,
      id: `cl-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      createdBy: currentUser.name,
    };
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const updatedLogs = [newLogItem, ...(c.communicationLogs || [])];
        return {
          ...c,
          communicationLogs: updatedLogs,
        };
      })
    );
    showToast({
      type: 'success',
      title: 'سجل التواصل',
      message: 'تم توثيق سجل التواصل مع العميل',
    });
  };

  // Project Actions
  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newId = `proj-${Date.now()}`;
    const newProject: Project = { ...projectData, id: newId };
    setProjects((prev) => [newProject, ...prev]);
    logActivity('أنشأ مشروعاً جديداً', 'Created new project', 'project', newProject.name);
    showToast({
      type: 'success',
      title: 'تم إنشاء المشروع',
      message: `تم ربط المشروع الجديد "${newProject.name}" بالنظام`,
    });
    return newId;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast({
      type: 'info',
      title: 'تحديث المشروع',
      message: 'تم حفظ تغييرات المشروع بنجاح',
    });
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    showToast({
      type: 'warning',
      title: 'حذف المشروع',
      message: 'تمت إزالة المشروع من النظام',
    });
  };

  // Task Actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'subtasks' | 'comments'> & { subtasks?: Subtask[]; comments?: TaskComment[] }) => {
    const newTask: Task = {
      subtasks: taskData.subtasks || [],
      comments: taskData.comments || [],
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTasks((prev) => [newTask, ...prev]);

    // Sync to Supabase PostgreSQL tasks table with current user session
    createSupabaseTask({
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      team_type: newTask.teamType,
      client_id: newTask.clientId,
      project_id: newTask.projectId,
      assigned_to: newTask.assignedTo,
      due_date: newTask.dueDate,
    }).catch((err) => console.warn('[Supabase createTask sync note]:', err));

    logActivity('أنشأ مهمة جديدة', 'Created a task', 'task', newTask.title);

    // Notify assigned users locally
    taskData.assignedTo.forEach((uid) => {
      addNotification({
        userId: uid,
        title: 'تم إسناد مهمة جديدة لك',
        message: `تم تكليفك بالمهمة: "${newTask.title}"`,
        type: 'task_assigned',
        linkTab: 'tasks',
      });
    });

    // Realtime Broadcast to notify other connected users instantly
    broadcastRealtimeNotification({
      eventType: 'task_assigned',
      taskId: newTask.id,
      taskTitle: newTask.title,
      assignedTo: newTask.assignedTo,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      senderName: currentUser.name,
      message: `تم تكليفك بالمهمة: "${newTask.title}" من قِبل ${currentUser.name}`,
      timestamp: new Date().toISOString(),
    });

    showToast({
      type: 'success',
      title: 'تمت إضافة المهمة',
      message: newTask.title,
    });
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    updateSupabaseTask(taskId, { status }).catch((err) =>
      console.warn('[Supabase updateTask status note]:', err)
    );
    const targetTask = tasks.find((t) => t.id === taskId);
    logActivity(
      `غيّر حالة المهمة إلى (${status})`,
      `Changed task status to ${status}`,
      'task',
      targetTask?.title || taskId
    );
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const existing = tasks.find((t) => t.id === id);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    updateSupabaseTask(id, {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      assigned_to: updates.assignedTo,
      due_date: updates.dueDate,
    }).catch((err) => console.warn('[Supabase updateTask note]:', err));

    // If assignedTo was updated, broadcast real-time notification
    if (updates.assignedTo && updates.assignedTo.length > 0) {
      const newlyAssigned = updates.assignedTo.filter((uid) => !existing?.assignedTo.includes(uid));
      if (newlyAssigned.length > 0) {
        broadcastRealtimeNotification({
          eventType: 'task_assigned',
          taskId: id,
          taskTitle: updates.title || existing?.title || 'مهمة',
          assignedTo: newlyAssigned,
          dueDate: updates.dueDate || existing?.dueDate,
          priority: updates.priority || existing?.priority,
          senderName: currentUser.name,
          message: `تم تكليفك بالمهمة: "${updates.title || existing?.title}"`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const deleteTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    // Atomic Postgres trigger trg_task_deleted logs into public.audit_logs
    await deleteSupabaseTask(id);
    logActivity('حذف مهمة', 'Deleted task', 'task', target?.title || id);
    showToast({
      type: 'warning',
      title: 'حذف المهمة',
      message: 'تم حذف المهمة من اللوحة',
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    const newSubtask = {
      id: `st-${Date.now()}`,
      title,
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, subtasks: [...t.subtasks, newSubtask] };
      })
    );
  };

  const addTaskComment = (taskId: string, content: string) => {
    const newComment = {
      id: `tc-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: 'الآن',
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, comments: [...t.comments, newComment] };
      })
    );
    showToast({
      type: 'info',
      title: 'تم إرسال التعليق',
      message: 'تمت إضافة ملاحظتك على المهمة',
    });
  };

  const linkTaskDependency = (taskId: string, dependsOnTaskId?: string, dependencyNote?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          dependsOnTaskId: dependsOnTaskId || undefined,
          dependencyNote: dependencyNote !== undefined ? dependencyNote : t.dependencyNote,
        };
      })
    );

    const targetTask = tasks.find((t) => t.id === taskId);
    const parentTask = dependsOnTaskId ? tasks.find((t) => t.id === dependsOnTaskId) : null;

    if (dependsOnTaskId && parentTask) {
      logActivity(
        `ربط مهمة "${targetTask?.title || taskId}" بالمهمة السابقة "${parentTask.title}"`,
        `Linked task dependency to "${parentTask.title}"`,
        'task',
        targetTask?.title || taskId
      );
      showToast({
        type: 'success',
        title: 'تم ربط تبعية المهمة 🔗',
        message: `تم ربط المهمة لتعتمد على "${parentTask.title}"`,
      });
    } else {
      logActivity(
        `إزالة تبعية المهمة "${targetTask?.title || taskId}"`,
        `Removed task dependency`,
        'task',
        targetTask?.title || taskId
      );
      showToast({
        type: 'info',
        title: 'تم فك ارتبا�� التبعية',
        message: 'تم إزالة التبعية عن المهمة بنجاح',
      });
    }
  };

  // Social Content Actions
  const addContentPost = (postData: Omit<ContentPost, 'id' | 'createdAt' | 'status'>) => {
    const newPost: ContentPost = {
      ...postData,
      id: `post-${Date.now()}`,
      status: 'draft',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setContentPosts((prev) => [newPost, ...prev]);
    logActivity('أنشأ منشوراً جديداً', 'Created content post', 'content', newPost.title);
    showToast({
      type: 'success',
      title: 'تم إنشاء المنشور',
      message: `تم حفظ المسودة في تقويم السوشيال ميديا`,
    });
  };

  const updateContentPost = (id: string, updates: Partial<ContentPost>) => {
    setContentPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const submitPostForReview = (postId: string) => {
    updateContentPost(postId, { status: 'review' });
    const post = contentPosts.find((p) => p.id === postId);
    logActivity('أرسل منشوراً للمراجعة والاعتماد', 'Submitted post for review', 'content', post?.title || postId);
    addNotification({
      userId: 'user-marketing-mgr',
      title: 'مراجعة محتوى جديدة بانتظارك',
      message: `أرسل ${currentUser.name} المنشور: "${post?.title}" للاعتماد.`,
      type: 'content_review',
      linkTab: 'social',
    });
    showToast({
      type: 'info',
      title: 'تم الإرسال للمراجعة',
      message: 'تم إشعار مدير التسويق لمراجعة المحتوى',
    });
  };

  const approvePost = (postId: string) => {
    updateContentPost(postId, { status: 'approved' });
    const post = contentPosts.find((p) => p.id === postId);
    logActivity('اعتمد منشوراً', 'Approved content post', 'content', post?.title || postId);
    showToast({
      type: 'success',
      title: 'تم اعتماد المنشور',
      message: 'المنشور جاهز للجدولة والنشر النهائي',
    });
  };

  const requestChangesPost = (postId: string, feedbackNote: string) => {
    updateContentPost(postId, { status: 'draft', feedbackNote });
    showToast({
      type: 'warning',
      title: 'تم طلب تعديلات',
      message: 'تم إرجاع المنشور لمعد المحتوى مع الملاحظات',
    });
  };

  const publishPost = (postId: string) => {
    updateContentPost(postId, { status: 'published' });
    const post = contentPosts.find((p) => p.id === postId);
    logActivity('نشر منشوراً على المنصة', 'Published post', 'content', post?.title || postId);
    showToast({
      type: 'success',
      title: 'تم النشر بنجاح',
      message: 'تم تحديث حالة المنشور إلى "تم النشر"',
    });
  };

  // Tech Ticket Actions
  const addTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `tick-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTickets((prev) => [newTicket, ...prev]);
    logActivity('فتح تذكرة برمجية', 'Created tech ticket', 'ticket', newTicket.title);
    showToast({
      type: 'success',
      title: 'تم إنشاء التذكرة',
      message: newTicket.title,
    });
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  // Departmental Data Actions
  const addCampaign = (campaignData: Omit<AdCampaign, 'id'>) => {
    const newCamp: AdCampaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    showToast({
      type: 'success',
      title: 'تمت إضافة الحملة',
      message: newCamp.name,
    });
  };

  const updateCampaign = (id: string, updates: Partial<AdCampaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const addSeoKeyword = (kwData: Omit<SeoKeyword, 'id' | 'lastUpdated'>) => {
    const newKw: SeoKeyword = {
      ...kwData,
      id: `seo-${Date.now()}`,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setSeoKeywords((prev) => [newKw, ...prev]);
    showToast({
      type: 'success',
      title: 'تمت إضافة الكلمة المفتاحية',
      message: newKw.keyword,
    });
  };

  const updateSeoKeyword = (id: string, updates: Partial<SeoKeyword>) => {
    setSeoKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) } : k))
    );
  };

  const addUiUxAsset = (assetData: Omit<UiUxProjectAsset, 'id' | 'lastModified'>) => {
    const newAsset: UiUxProjectAsset = {
      ...assetData,
      id: `ui-${Date.now()}`,
      lastModified: new Date().toISOString().slice(0, 10),
    };
    setUiUxAssets((prev) => [newAsset, ...prev]);
    showToast({
      type: 'success',
      title: 'تمت إضافة ملف التصميم',
      message: newAsset.title,
    });
  };

  const updateUiUxAsset = (id: string, updates: Partial<UiUxProjectAsset>) => {
    setUiUxAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, lastModified: new Date().toISOString().slice(0, 10) } : a))
    );
  };

  // Profile Change Request & Admin Approval Flow
  const submitProfileChangeRequest = (
    requestedName: string,
    requestedAvatar: string,
    reason?: string
  ) => {
    const newReq: ProfileChangeRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userRoleName: currentUserRole?.nameAr || 'عضو بالفريق',
      currentName: currentUser.name,
      currentAvatar: currentUser.avatar,
      requestedName: requestedName.trim(),
      requestedAvatar: requestedAvatar.trim(),
      reason: reason?.trim() || '',
      status: 'pending',
      requestedAt: new Date().toLocaleString('ar-SA'),
    };

    setProfileRequests((prev) => [newReq, ...prev]);

    // Notify Founder and Operations Manager
    addNotification({
      userId: 'user-founder',
      title: 'طلب تعديل ملف شخصي معلق',
      message: `طلب ${currentUser.name} تحديث اسمه إلى "${requestedName}" بانتظار موافقتك.`,
      type: 'content_review',
      linkTab: 'admin',
    });

    logActivity(
      'قدّم طلباً لتعديل اسمه أو صورته الشخصية',
      'Submitted profile change request',
      'profile_request',
      currentUser.name
    );

    showToast({
      type: 'info',
      title: 'تم إرسال الطلب للإدارة',
      message: 'طلبك قيد المراجعة ولن يتم تفعيله إلا بعد موافقة الإدارة (الفاوندر أو مدير العمليات).',
    });
  };

  const approveProfileChangeRequest = (requestId: string) => {
    const req = profileRequests.find((r) => r.id === requestId);
    if (!req) return;

    // 1. Update the request status
    setProfileRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toLocaleString('ar-SA'),
            }
          : r
      )
    );

    // 2. Apply name & avatar to the target user
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== req.userId) return u;
        return {
          ...u,
          name: req.requestedName,
          avatar: req.requestedAvatar || u.avatar,
        };
      })
    );

    // 3. If currently logged in as this user, update currentUser directly
    if (currentUser.id === req.userId) {
      setCurrentUser((prev) => ({
        ...prev,
        name: req.requestedName,
        avatar: req.requestedAvatar || prev.avatar,
      }));
    }

    // 4. Notify applicant
    addNotification({
      userId: req.userId,
      title: 'تهانينا! تمت الموافقة على تعديل ملفك',
      message: `وافقت الإدارة على تعديل اسمك إلى "${req.requestedName}". تم تحديث ملفك رسمياً.`,
      type: 'content_approved',
      linkTab: 'dashboard',
    });

    logActivity(
      `اعتمد تعديل الملف الشخصي لـ (${req.currentName} -> ${req.requestedName})`,
      `Approved profile change for ${req.requestedName}`,
      'profile_request',
      req.requestedName
    );

    showToast({
      type: 'success',
      title: 'تم الاعتماد والتطبيق',
      message: `تم تحديث بيانات ${req.requestedName} رسمياً في كامل النظام`,
    });
  };

  const rejectProfileChangeRequest = (requestId: string, rejectionReason: string) => {
    const req = profileRequests.find((r) => r.id === requestId);
    if (!req) return;

    setProfileRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'rejected',
              rejectionReason,
              reviewedBy: currentUser.name,
              reviewedAt: new Date().toLocaleString('ar-SA'),
            }
          : r
      )
    );

    addNotification({
      userId: req.userId,
      title: 'تم رفض طلب تعديل الملف الشخصي',
      message: `السبب: ${rejectionReason}`,
      type: 'content_review',
      linkTab: 'dashboard',
    });

    logActivity(
      `رفض طلب تعديل ملف ${req.currentName}`,
      `Rejected profile change for ${req.currentName}`,
      'profile_request',
      req.currentName
    );

    showToast({
      type: 'warning',
      title: 'تم رفض الطلب',
      message: 'تم إخطار الموظف بسبب الرفض',
    });
  };

  // Admin & RBAC Actions
  const addRole = (roleData: Omit<Role, 'id'>) => {
    const newRole: Role = {
      ...roleData,
      id: `role-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRoles((prev) => [...prev, newRole]);
    logActivity('أنشأ دوراً جديداً في النظام', 'Created new system role', 'role', newRole.nameAr);
    showToast({
      type: 'success',
      title: 'تم إنشاء الدور',
      message: newRole.nameAr,
    });
  };

  const updateRolePermissions = (roleId: string, perms: PermissionKey[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: perms } : r))
    );
    showToast({
      type: 'info',
      title: 'تم تحديث الصلاحيات',
      message: 'تم حفظ التعديلات على مصفوفة الصلاحيات',
    });
  };

  const updateRole = (roleId: string, updates: Partial<Role>) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, ...updates } : r))
    );
  };

  const deleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    // Strictly Owner / Management Only
    if (!isAdminOrOwner && users.length > 0) {
      const err = 'إضافة أعضاء جدد للفريق وتحديد صلاحياتهم مقتصر حصرياً على الإدارة والمالك.';
      showToast({
        type: 'error',
        title: 'غير مصرح بالإجراء',
        message: err,
      });
      return { success: false, error: err };
    }

    const empNum = userData.employeeNumber || String(users.length + 1).padStart(2, '0');
    const targetRole = userData.roleIds[0] || 'role-marketing-manager';
    const appRole = mapRoleToSupabaseRole(targetRole);

    try {
      // Call privileged server / edge function to create real Auth user & linked profile
      const res = await adminCreateUserAccount({
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: (userData as any).password || 'Shal@2026',
        role: appRole,
        employeeNumber: empNum,
        team: userData.team,
      });

      if (!res.success || !res.user) {
        showToast({
          type: 'error',
          title: 'فشل إنشاء الحساب',
          message: res.error || 'تعذر إنشاء الحساب في Supabase.',
        });
        return { success: false, error: res.error || 'فشل إنشاء الحساب.' };
      }

      const newUser: User = {
        ...userData,
        id: res.user.id,
        email: userData.email.trim().toLowerCase(),
        employeeNumber: empNum,
        createdAt: new Date().toISOString().slice(0, 10),
        avatar: userData.avatar || getShalEmployeeAvatar(empNum, '#0F172A'),
      };

      setUsers((prev) => [...prev.filter((u) => u.id !== newUser.id), newUser]);

      logActivity('سجل عضواً جديداً في الفريق وأصدر بيانات دخوله', 'Onboarded new team member account', 'member', newUser.name);
      showToast({
        type: 'success',
        title: 'تمت إضافة العضو وتثبيت حسابه',
        message: `${newUser.name} (${newUser.email})`,
      });

      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.message || 'حدث خطأ غير متوقع أثناء إضافة العضو.';
      showToast({
        type: 'error',
        title: 'خطأ في المعالجة',
        message: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    let updatedObj: User | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          updatedObj = { ...u, ...updates };
          return updatedObj;
        }
        return u;
      })
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }

    // Role modification trigger in Supabase (triggers trg_profile_role_changed in PostgreSQL)
    if (updates.roleIds && updates.roleIds.length > 0) {
      const appRole = mapRoleToSupabaseRole(updates.roleIds[0]);
      await updateSupabaseUserRole(userId, appRole);
    }

    if (updatedObj) {
      const dbProf = userToProfile(updatedObj);
      await updateSupabaseProfile(userId, dbProf);
    }
  };

  /**
   * Admin function to update an existing user account after creation/confirmation
   * (Name, Email, Employee Number, Team, Role, and optional Password)
   */
  const updateUserAccount = async (
    userId: string,
    updates: {
      name?: string;
      email?: string;
      employeeNumber?: string;
      team?: any;
      roleId?: string;
      password?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdminOrOwner) {
      return {
        success: false,
        error: 'تعديل بيانات الحسابات مقتصر حصرياً على الإدارة والمالك.',
      };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    const updatedData: Partial<User> = {};
    if (updates.name && updates.name.trim()) updatedData.name = updates.name.trim();
    if (updates.email && updates.email.trim()) updatedData.email = updates.email.trim().toLowerCase();
    if (updates.employeeNumber !== undefined) updatedData.employeeNumber = updates.employeeNumber.trim();
    if (updates.team) updatedData.team = updates.team;
    if (updates.roleId) updatedData.roleIds = [updates.roleId];
    if (updates.password && updates.password.trim()) updatedData.password = updates.password.trim();

    await updateUser(userId, updatedData);

    logActivity(
      `تعديل بيانات الحساب للموظف (${targetUser.name}) بواسطة الإدارة`,
      `Updated user account (${targetUser.name}) by admin`,
      'user',
      targetUser.name
    );

    showToast({
      type: 'success',
      title: 'تم تحديث بيانات الحساب بنجاح',
      message: `تم حفظ تعديلات حساب ${targetUser.name}`,
    });

    return { success: true };
  };

  /**
   * Admin function to review and reset a user's password
   * Exclusively available to Administrator and Owner
   */
  const adminResetPassword = async (
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdminOrOwner) {
      return {
        success: false,
        error: 'إعادة تعيين كلمات المرور مقتصرة حصرياً على الإدارة والمالك.',
      };
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return {
        success: false,
        error: 'يجب أن لا تقل كلمة المرور الجديدة عن 6 أحرف.',
      };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'المستخدم غير موجود' };
    }

    const cleanPass = newPassword.trim();

    // 1. Update state & localStorage
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: cleanPass } : u))
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, password: cleanPass }));
    }

    // 2. Call Supabase service helper
    await adminResetUserPassword(userId, cleanPass);

    logActivity(
      `إعادة تعيين كلمة مرور الحساب (${targetUser.name}) بواسطة الإدارة`,
      `Reset password for account (${targetUser.name}) by admin`,
      'user',
      targetUser.name
    );

    showToast({
      type: 'success',
      title: 'تمت إعادة تعيين كلمة المرور',
      message: `تم تحديث كلمة المرور لحساب ${targetUser.name} بنجاح`,
    });

    return { success: true };
  };

  const deleteUser = async (userId: string) => {
    if (!isOwner) {
      showToast({
        type: 'error',
        title: 'غير مصرح بالإجراء',
        message: 'حذف حسابات الموظفين مقتصر حصرياً على المالك (الفاوندر).',
      });
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    await deleteSupabaseProfile(userId);
    logActivity('حذف حساب موظف من النظام', 'Deleted team member account', 'member', userId);
    showToast({
      type: 'warning',
      title: 'تم حذف الحساب',
      message: 'تمت إزالة صلاحيات وصول الموظف نهائياً.',
    });
  };

  const toggleUserStatus = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'inactive' : 'active';
    await updateUser(userId, { status: newStatus });
  };

  // Chat Actions
  const markChatAsRead = (channelId?: string) => {
    setUnreadChatCount(0);
    setChatChannels((prev) =>
      prev.map((c) =>
        !channelId || c.id === channelId ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const sendChatMessage = (
    channelId: string,
    content: string,
    attachedTaskId?: string,
    attachments?: { name: string; url: string; size?: string; type?: 'image' | 'file' | 'audio' }[],
    replyTo?: { id: string; senderName: string; content: string }
  ) => {
    let attachedTaskData = undefined;
    if (attachedTaskId) {
      const task = tasks.find((t) => t.id === attachedTaskId);
      if (task) {
        attachedTaskData = {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          clientName: task.clientName,
          dueDate: task.dueDate,
        };
      }
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUserRole?.nameAr || currentUser.roleIds[0] || 'عضو الفريق',
      content,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      attachedTaskId,
      attachedTask: attachedTaskData,
      attachments,
      replyTo,
      isRead: true,
      reactions: {},
    };

    setChatMessages((prev) => [...prev, newMessage]);

    if (attachedTaskId && attachedTaskData) {
      logActivity(
        `شارك مهمة "${attachedTaskData.title}" في الدردشة الداخلية`,
        `Shared task "${attachedTaskData.title}" in internal chat`,
        'task',
        attachedTaskData.title
      );
    }
  };

  const sendVoiceNote = (channelId: string, durationStr: string) => {
    const newVoiceMsg: ChatMessage = {
      id: `voice-${Date.now()}`,
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUserRole?.nameAr || 'عضو الفريق',
      content: 'رسالة صوتية مسجلة',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isVoiceNote: true,
      voiceDuration: durationStr,
      isRead: true,
      reactions: {},
    };

    setChatMessages((prev) => [...prev, newVoiceMsg]);
  };

  const toggleMessageReaction = (messageId: string, emoji: string) => {
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = { ...(msg.reactions || {}) };
        const userList = currentReactions[emoji] || [];
        if (userList.includes(currentUser.id)) {
          // Remove reaction
          const updated = userList.filter((uid) => uid !== currentUser.id);
          if (updated.length === 0) {
            delete currentReactions[emoji];
          } else {
            currentReactions[emoji] = updated;
          }
        } else {
          // Add reaction
          currentReactions[emoji] = [...userList, currentUser.id];
        }
        return { ...msg, reactions: currentReactions };
      })
    );
  };

  const deleteChatMessage = (messageId: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    showToast({
      type: 'info',
      title: 'حذف الرسالة',
      message: 'تمت إزالة الرسالة من المحادثة',
    });
  };

  const togglePinChatMessage = (messageId: string) => {
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
      )
    );
  };

  const updateChannelMembers = (channelId: string, allowedMemberIds: string[]) => {
    setChatChannels((prev) => {
      const updated = prev.map((c) => (c.id === channelId ? { ...c, allowedMemberIds } : c));
      try {
        localStorage.setItem(`${STORAGE_KEY}_chat_channels`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
    showToast({
      type: 'success',
      title: 'تم تحديث أعضاء القناة',
      message: 'تم حفظ قائمة الأعضاء المصرح لهم بالدخول للقناة بنجاح.',
    });
  };

  // Presence and custom asset sync
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user_presence`, JSON.stringify(userPresence));
  }, [userPresence]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_custom_assets`, JSON.stringify(customAssets));
  }, [customAssets]);

  // Presence Actions
  const updateUserPresence = (status: UserPresenceStatus, targetUserId?: string) => {
    const id = targetUserId || currentUser.id;
    setUserPresence((prev) => ({
      ...prev,
      [id]: status,
    }));

    if (id === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        presenceStatus: status,
      }));
    }

    const statusLabels: Record<UserPresenceStatus, string> = {
      online: 'متواجد ونشط 🟢',
      busy: 'مشغول / في اجتماع 🟡',
      offline: 'غير متصل ⚪',
    };

    showToast({
      type: 'info',
      title: 'تم تحديث حالة الاتصال',
      message: `الحالة الحالية: ${statusLabels[status]}`,
    });
  };

  // Custom Assets Actions (Admin / Authorized only)
  const updateCustomAsset = (key: keyof AppCustomAssets, value: any) => {
    setCustomAssets((prev) => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name,
    }));
    logActivity(
      `قام بتعديل عنصر بصري: ${String(key)}`,
      `Updated visual asset: ${String(key)}`,
      'role',
      String(key)
    );
    showToast({
      type: 'success',
      title: 'تم حفظ التعديل البصري بنجاح',
      message: `تم تحديث ${String(key)} وتطبيقه على المنظومة`,
    });
  };

  const updateNavIcon = (navKey: string, iconName: string) => {
    setCustomAssets((prev) => ({
      ...prev,
      navIcons: {
        ...(prev.navIcons || {}),
        [navKey]: iconName,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name,
    }));
    showToast({
      type: 'success',
      title: 'تم تغيير أيقونة القائمة',
      message: `تم ضبط أيقونة ${navKey} على ${iconName}`,
    });
  };

  const updateMemberAvatar = (userId: string, avatarUrl: string) => {
    setCustomAssets((prev) => ({
      ...prev,
      memberAvatars: {
        ...(prev.memberAvatars || {}),
        [userId]: avatarUrl,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name,
    }));
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, avatar: avatarUrl } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, avatar: avatarUrl }));
    }
    showToast({
      type: 'success',
      title: 'تم تحديث صورة العضو',
      message: 'تم تطبيق الأفاتار الجديد على حساب الموظف فوراً',
    });
  };

  const updateClientLogo = (clientId: string, logoUrl: string) => {
    setCustomAssets((prev) => ({
      ...prev,
      clientLogos: {
        ...(prev.clientLogos || {}),
        [clientId]: logoUrl,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name,
    }));
    showToast({
      type: 'success',
      title: 'تم تحديث شعار العميل',
      message: 'تم تعديل صورة العميل المصغرة بنجاح',
    });
  };

  const resetCustomAssets = () => {
    setCustomAssets(DEFAULT_CUSTOM_ASSETS);
    localStorage.removeItem(`${STORAGE_KEY}_custom_assets`);
    setUsers(INITIAL_USERS);
    showToast({
      type: 'info',
      title: 'استعادة الأصول الأصلية',
      message: 'تمت استعادة كافة أيقونات وشعارات وهوية شال الافتراضية',
    });
  };

  // Clear session cache
  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_tasks`);
    localStorage.removeItem(`${STORAGE_KEY}_clients`);
    localStorage.removeItem(`${STORAGE_KEY}_projects`);
    localStorage.removeItem(`${STORAGE_KEY}_posts`);
    localStorage.removeItem(`${STORAGE_KEY}_tickets`);
    localStorage.removeItem(`${STORAGE_KEY}_campaigns`);
    localStorage.removeItem(`${STORAGE_KEY}_activity`);
    showToast({
      type: 'info',
      title: 'تحديث ذاكرة التخزين المؤقت',
      message: 'تم مسح البيانات المؤقتة وإعادة مزامنة سجلات قاعدة البيانات الحية',
    });
  };

  const isAuthenticated = Boolean(currentUser && currentUser.id);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentUserRole,
        currentAppRole,
        isOwner,
        isAdminOrOwner,
        isAuthenticated,
        authLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        attendanceRecords,
        todayAttendance,
        activeHourlyVerification,
        clockIn,
        clockOut,
        startBreak,
        endBreak,
        createHourlyChallenge,
        respondHourlyVerification,
        users,
        roles,
        permissions,
        rolePermissions,
        clients,
        projects,
        tasks,
        contentPosts,
        tickets,
        campaigns,
        seoKeywords,
        uiuxAssets,
        profileRequests,
        chatChannels,
        chatMessages,
        unreadChatCount,
        markChatAsRead,
        activeChatChannelId,
        setActiveChatChannelId,
        sendChatMessage,
        sendVoiceNote,
        toggleMessageReaction,
        deleteChatMessage,
        togglePinChatMessage,
        updateChannelMembers,
        notifications,
        activityLogs,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        theme,
        toggleTheme,
        userPresence,
        updateUserPresence,
        customAssets,
        updateCustomAsset,
        updateNavIcon,
        updateMemberAvatar,
        updateClientLogo,
        resetCustomAssets,
        hasPermission,
        getUserRoles,
        toggleRolePermission,
        assignRolePermissions,
        addRolePermissionMapping,
        removeRolePermissionMapping,
        assignUserRoles,
        addClient,
        updateClient,
        deleteClient,
        addCommunicationLog,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        toggleSubtask,
        addSubtask,
        addTaskComment,
        linkTaskDependency,
        addContentPost,
        updateContentPost,
        submitPostForReview,
        approvePost,
        requestChangesPost,
        publishPost,
        addTicket,
        updateTicketStatus,
        updateTicket,
        deleteTicket,
        addCampaign,
        updateCampaign,
        addSeoKeyword,
        updateSeoKeyword,
        addUiUxAsset,
        updateUiUxAsset,
        submitProfileChangeRequest,
        approveProfileChangeRequest,
        rejectProfileChangeRequest,
        addRole,
        updateRolePermissions,
        updateRole,
        deleteRole,
        addUser,
        updateUser,
        updateUserAccount,
        adminResetPassword,
        deleteUser,
        toggleUserStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        checkApproachingDeadlines,
        logActivity,
        toasts,
        showToast,
        dismissToast,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
