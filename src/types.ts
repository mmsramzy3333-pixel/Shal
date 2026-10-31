export type PermissionKey =
  | 'can_view_clients'
  | 'can_edit_clients'
  | 'can_delete_clients'
  | 'can_view_projects'
  | 'can_manage_projects'
  | 'can_view_all_tasks'
  | 'can_create_tasks'
  | 'can_assign_tasks'
  | 'can_edit_tasks'
  | 'can_delete_tasks'
  | 'can_approve_content'
  | 'can_publish_posts'
  | 'can_upload_creative_assets'
  | 'can_manage_roles'
  | 'can_manage_team_members'
  | 'can_view_reports'
  | 'can_edit_financials'
  | 'can_approve_profile_changes'
  | 'can_manage_sales'
  | 'can_manage_marketing'
  | 'can_manage_media_buying'
  | 'can_manage_seo'
  | 'can_manage_dev'
  | 'can_manage_uiux'
  | 'can_manage_contracts'
  | 'can_view_all_attendance';

export type PermissionCategory =
  | 'crm'
  | 'projects'
  | 'tasks'
  | 'social'
  | 'admin'
  | 'marketing'
  | 'sales'
  | 'tech';

export interface Permission {
  id: string;
  key: PermissionKey;
  labelAr: string;
  labelEn: string;
  category: PermissionCategory;
  descriptionAr: string;
  descriptionEn: string;
}

export interface RolePermissionMapping {
  id: string;
  roleId: string;
  permissionId: string;
  permissionKey: PermissionKey;
  assignedAt: string;
  assignedBy: string;
}

export interface Role {
  id: string;
  name: string;
  nameAr: string;
  code: string; // e.g. 'founder', 'marketing_mgr', 'sales_mgr', etc.
  description: string;
  descriptionAr: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
  color: string;
  badgeBg?: string;
  createdAt?: string;
}

export type AgencyTeam =
  | 'management'
  | 'operations'
  | 'marketing'
  | 'sales'
  | 'crm'
  | 'content'
  | 'social'
  | 'design'
  | 'motion_graphics'
  | 'uiux'
  | 'seo'
  | 'developer'
  | 'media_buying'
  | 'finance'
  | 'hr';

export type UserPresenceStatus = 'online' | 'busy' | 'offline';

export interface AppCustomAssets {
  brandLogoUrl?: string;
  brandNameAr?: string;
  brandNameEn?: string;
  navIcons?: {
    dashboard?: string;
    chat?: string;
    tasks?: string;
    clients?: string;
    social?: string;
    admin?: string;
  };
  memberAvatars?: Record<string, string>; // userId -> avatarUrl
  clientLogos?: Record<string, string>; // clientId -> logoUrl
  updatedAt?: string;
  updatedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  roleIds: string[];
  avatar: string;
  status: 'active' | 'inactive';
  presenceStatus?: UserPresenceStatus;
  team: AgencyTeam;
  customPermissions?: PermissionKey[];
  employeeNumber?: string; // e.g. "01", "02", etc.
  createdAt: string;
}

export type ClientStatus = 'lead' | 'negotiation' | 'active' | 'paused' | 'churned';

export interface CommunicationLog {
  id: string;
  date: string;
  type: 'call' | 'meeting' | 'email' | 'whatsapp' | 'note';
  summary: string;
  createdBy: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  industry: string;
  status: ClientStatus;
  contactPerson: string;
  email: string;
  phone: string;
  monthlyRetainer: number;
  currency: string;
  packageTitle: string;
  notes: string;
  communicationLogs: CommunicationLog[];
  documents: ClientDocument[];
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: 'social_retainer' | 'branding' | 'marketing_campaign' | 'development' | 'custom' | string;
  status: 'active' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  startDate: string;
  endDate: string;
  teamType: 'social' | 'design' | 'both' | 'operations' | 'content' | 'developer';
  progress: number;
  description?: string;
}

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'changes_requested'
  | 'client_delivered'
  | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp?: string;
}

export type DeliverableCategory =
  | 'social_design'       // تصميم سوشيال
  | 'video_content'       // محتوى فيديو
  | 'creative_writing'    // كتابة إبداعية
  | 'motion_graphics'     // موشن جرافيك
  | 'branding_identity';  // هوية بصرية

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  teamType: 'social' | 'design';
  deliverableCategory?: DeliverableCategory;
  dimensions?: string;
  platform?: string;
  suggestedSubtasks: string[];
  badge?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface VisualAttachment {
  id: string;
  name: string;
  url?: string;
  type?: 'image' | 'video' | 'figma' | 'psd' | 'ai' | 'pdf';
  fileType?: 'image' | 'video' | 'figma' | 'psd' | 'ai' | 'pdf';
  dimension?: string; // e.g. "1080x1080", "1080x1350", "1080x1920"
  dimensions?: string;
  thumbnailUrl?: string;
  fileSize?: string;
  format?: string;
  uploadedBy?: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export type VisualDeliverable = VisualAttachment;

export interface Task {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[]; // User IDs
  createdBy: string;
  dueDate: string;
  teamType: 'social' | 'design';
  deliverableCategory?: DeliverableCategory;
  subtasks: Subtask[];
  comments: TaskComment[];
  visualAttachments?: VisualAttachment[];
  creativeSpecs?: {
    platform?: string;
    dimensions?: string;
    format?: string;
    sourceFileLink?: string;
  };
  dependsOnTaskId?: string; // Preceding task ID (e.g. content task that design task depends on)
  dependencyNote?: string; // Optional handoff note or dependency condition
  createdAt: string;
}

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'x' | 'twitter' | 'youtube';
export type MediaType = 'image' | 'video' | 'carousel' | 'reel' | 'story';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published';

export interface ContentPost {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  platform: SocialPlatform;
  mediaType: MediaType;
  caption: string;
  hashtags: string[];
  status: ContentStatus;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  mediaUrl?: string;
  authorId: string;
  reviewerId?: string;
  feedbackNote?: string;
  createdAt: string;
}

export type TicketStatus = 'backlog' | 'in_dev' | 'testing' | 'deployed';
export type TicketSeverity = 'critical' | 'high' | 'medium' | 'low';
export type TicketType = 'bug' | 'feature' | 'infrastructure' | 'maintenance' | 'support';

export interface Ticket {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string;
  status: TicketStatus;
  severity: TicketSeverity;
  type: TicketType;
  assignedTo?: string; // Developer user ID
  sprint?: string;
  branchOrPr?: string;
  createdBy: string;
  dueDate?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // target user, or 'all'
  title: string;
  message: string;
  type: 'task_assigned' | 'content_review' | 'content_approved' | 'deadline_warning';
  isRead: boolean;
  linkTab?:
    | 'dashboard'
    | 'clients'
    | 'tasks'
    | 'social'
    | 'admin'
    | 'activity'
    | 'contracts'
    | 'reports'
    | 'attendance'
    | 'chat'
    | 'settings';
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  actionAr: string;
  entityType: 'client' | 'task' | 'content' | 'role' | 'member' | 'user' | 'ticket' | 'project' | 'profile_request' | 'campaign' | 'seo';
  entityName: string;
  details?: string;
  createdAt: string;
}

export interface ProfileChangeRequest {
  id: string;
  userId: string;
  userRoleName: string;
  currentName: string;
  currentAvatar: string;
  requestedName: string;
  requestedAvatar: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: 'meta' | 'google' | 'tiktok' | 'snapchat' | 'linkedin';
  clientName: string;
  status: 'active' | 'learning' | 'paused' | 'ended';
  budgetDaily: number;
  spentTotal: number;
  roas: number;
  cpc: number;
  cpa: number;
  leadsCount: number;
  objective: string;
  startDate: string;
}

export interface SeoKeyword {
  id: string;
  keyword: string;
  clientName: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  difficulty: number;
  targetUrl: string;
  intent: 'commercial' | 'informational' | 'transactional';
  lastUpdated: string;
}

export interface UiUxProjectAsset {
  id: string;
  title: string;
  clientName: string;
  platform: 'mobile' | 'web' | 'dashboard' | 'design_system';
  figmaUrl: string;
  screensCount: number;
  status: 'wireframing' | 'ui_design' | 'prototype' | 'client_review' | 'ready_for_dev';
  lastModified: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  content: string;
  timestamp: string;
  attachedTaskId?: string;
  attachedTask?: {
    id: string;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    clientName?: string;
    dueDate?: string;
  };
  attachments?: { name: string; url: string; size?: string; type?: 'image' | 'file' | 'audio' }[];
  reactions?: Record<string, string[]>; // e.g. { '👍': ['user-founder'], '🔥': ['user-ui-ux'] }
  isVoiceNote?: boolean;
  voiceDuration?: string;
  isRead?: boolean;
  isPinned?: boolean;
  replyTo?: { id: string; senderName: string; content: string };
}

export interface ChatChannel {
  id: string;
  name: string;
  nameAr: string;
  descriptionAr: string;
  team: AgencyTeam | 'all';
  icon?: string;
  unreadCount?: number;
  allowedMemberIds?: string[]; // IDs of users authorized by management to view this channel
}

export type DealStage =
  | 'lead'              // مؤهل جديد
  | 'proposal_sent'     // إرسال عرض السعر
  | 'negotiation'       // تفاوض وتعديل البنود
  | 'contract_pending'  // انتظار توقيع العقد
  | 'closed_won'        // صفقة رابحة مغلقة
  | 'closed_lost';      // صفقة خاسرة

export interface SalesDeal {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  contactPerson: string;
  value: number;
  currency: 'USD' | 'SAR' | 'AED' | 'EGP';
  stage: DealStage;
  probability: number; // 0 - 100
  assignedUserId: string;
  assignedUserName: string;
  expectedCloseDate: string;
  services: string[];
  notes?: string;
  createdAt: string;
}

export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'expired' | 'terminated';
export type ContractType = 'retainer' | 'nda' | 'project_fixed' | 'ip_agreement' | 'partnership';

export interface CompanyContract {
  id: string;
  title: string;
  contractNumber: string;
  clientId?: string;
  clientName: string;
  type: ContractType;
  status: ContractStatus;
  value: number;
  currency: 'USD' | 'SAR' | 'AED' | 'EGP';
  startDate: string;
  endDate: string;
  signedDate?: string;
  signedByAgency?: string;
  signedByClient?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  scopeSummary: string;
  autoRenew: boolean;
  notes?: string;
  createdAt: string;
}

export interface QuickLoginPreset {
  id: string;
  name: string;
  email: string;
  roleTitleAr?: string;
  roleTitleEn?: string;
  roleTitle?: string;
  badge: string;
  badgeColor?: string;
  isSystemAdmin?: boolean;
  team?: AgencyTeam;
  isCustom?: boolean;
}

export interface AttendanceBreak {
  id: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
}

export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent' | 'on_break';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userRoleName?: string;
  userRole?: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // ISO timestamp
  clockOut?: string | null;
  status: AttendanceStatus;
  scheduledStartTime?: string; // e.g. "09:00"
  lateMinutes: number;
  breaks: AttendanceBreak[];
  totalWorkMinutes?: number;
  totalHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HourlyVerification {
  id: string;
  userId: string;
  userName: string;
  date?: string; // YYYY-MM-DD
  challengeTime?: string;
  timestamp?: string;
  expiresAt: string; // 15 min grace period
  status: 'pending' | 'verified' | 'missed';
  verifiedAt?: string | null;
  taskSummary?: string;
  responseNote?: string;
  createdAt?: string;
}
