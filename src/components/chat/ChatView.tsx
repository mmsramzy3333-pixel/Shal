import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  Briefcase,
  Users,
  Search,
  Hash,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  X,
  FileText,
  Filter,
  Mic,
  MicOff,
  Smile,
  Pin,
  Trash2,
  Reply,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Flame,
  Image as ImageIcon,
  UserCheck,
  UserPlus,
  Lock,
} from 'lucide-react';
import { Task, TaskStatus, ChatMessage, UserPresenceStatus } from '../../types';

export const ChatView: React.FC = () => {
  const {
    chatChannels,
    chatMessages,
    activeChatChannelId,
    setActiveChatChannelId,
    sendChatMessage,
    sendVoiceNote,
    toggleMessageReaction,
    deleteChatMessage,
    togglePinChatMessage,
    updateChannelMembers,
    markChatAsRead,
    tasks,
    updateTaskStatus,
    users,
    currentUser,
    currentUserRole,
    userPresence,
    updateUserPresence,
    language,
    setActiveTab,
    showToast,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'tasks' | 'voice' | 'files' | 'pinned'>('all');
  const [isPresenceMenuOpen, setIsPresenceMenuOpen] = useState(false);
  const [filterWithTasksOnly, setFilterWithTasksOnly] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);

  // Audio / Voice note recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);

  // Audio playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Attachment upload simulation
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    name: string;
    url: string;
    size?: string;
    type?: 'image' | 'file';
  } | null>(null);

  // Active channel / tab
  const [chatCategory, setChatCategory] = useState<'channels' | 'direct'>('channels');
  const [selectedDirectUserId, setSelectedDirectUserId] = useState<string | null>(null);

  // Channel Member Management State (Admin only)
  const [managingMembersChannel, setManagingMembersChannel] = useState<any | null>(null);
  const [selectedChannelMembers, setSelectedChannelMembers] = useState<string[]>([]);

  const isManagerOrAdmin =
    currentUser.role === 'owner' ||
    currentUser.role === 'admin' ||
    currentUser.team === 'management' ||
    currentUserRole?.code === 'founder' ||
    currentUserRole?.code === 'operations_mgr' ||
    (currentUser as any).roleIds?.includes('role-founder') ||
    (currentUser as any).roleIds?.includes('role-operations-manager');

  // Strict channel visibility per user request:
  // "قنوات الشات متظهرش لي اي موظف او عضو الا عند اضافته من قبل الاداره فقط و فقط القنوات الي تم اضافته فيها هي الي تظهر"
  const accessibleChannels = chatChannels.filter((channel) => {
    if (isManagerOrAdmin) return true;
    return Boolean(channel.allowedMemberIds && channel.allowedMemberIds.includes(currentUser.id));
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mark chat as read on view
  useEffect(() => {
    markChatAsRead(activeChatChannelId);
  }, [activeChatChannelId]);

  // Active channel determination
  const activeChannel =
    accessibleChannels.find((c) => c.id === activeChatChannelId) || accessibleChannels[0] || chatChannels[0];

  // Channel messages filtered
  const channelMessages = chatMessages.filter((msg) => {
    if (chatCategory === 'direct' && selectedDirectUserId) {
      const isDirectMatch =
        (msg.senderId === currentUser.id && msg.channelId === `dm-${selectedDirectUserId}`) ||
        (msg.senderId === selectedDirectUserId && msg.channelId === `dm-${currentUser.id}`) ||
        msg.channelId === `dm-${selectedDirectUserId}`;
      if (!isDirectMatch) return false;
    } else {
      if (msg.channelId !== activeChatChannelId) return false;
    }

    if (filterWithTasksOnly && !msg.attachedTaskId) return false;

    // Filter by type
    if (searchFilterType === 'tasks' && !msg.attachedTaskId) return false;
    if (searchFilterType === 'voice' && !msg.isVoiceNote) return false;
    if (searchFilterType === 'files' && (!msg.attachments || msg.attachments.length === 0)) return false;
    if (searchFilterType === 'pinned' && !msg.isPinned) return false;

    if (chatSearchQuery.trim()) {
      const q = chatSearchQuery.toLowerCase();
      const matchContent = msg.content.toLowerCase().includes(q);
      const matchSender = msg.senderName.toLowerCase().includes(q);
      const matchTask = msg.attachedTask?.title.toLowerCase().includes(q);
      const matchDate = msg.timestamp.toLowerCase().includes(q);
      return matchContent || matchSender || matchTask || matchDate;
    }
    return true;
  });

  // Cross-channel search matches
  const crossChannelMatches = chatSearchQuery.trim()
    ? chatMessages.filter((m) => {
        const q = chatSearchQuery.toLowerCase();
        const matchesQuery =
          m.content.toLowerCase().includes(q) ||
          m.senderName.toLowerCase().includes(q) ||
          m.attachedTask?.title.toLowerCase().includes(q);
        if (!matchesQuery) return false;

        if (chatCategory === 'direct' && selectedDirectUserId) {
          const isCurrent =
            (m.senderId === currentUser.id && m.channelId === `dm-${selectedDirectUserId}`) ||
            (m.senderId === selectedDirectUserId && m.channelId === `dm-${currentUser.id}`) ||
            m.channelId === `dm-${selectedDirectUserId}`;
          return !isCurrent;
        } else {
          return m.channelId !== activeChatChannelId;
        }
      })
    : [];

  const pinnedMessages = channelMessages.filter((m) => m.isPinned);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatChannelId, chatMessages.length, selectedDirectUserId]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
  };

  const handleStopAndSendVoice = () => {
    setIsRecordingVoice(false);
    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    const targetChannel =
      chatCategory === 'direct' && selectedDirectUserId
        ? `dm-${selectedDirectUserId}`
        : activeChatChannelId;

    sendVoiceNote(targetChannel, durationStr);
    showToast({
      type: 'success',
      title: 'تم إرسال الرسالة الصوتية',
      message: `المدة: ${durationStr}`,
    });
  };

  const handleCancelVoiceRecording = () => {
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  // Toggle voice playback simulation
  const togglePlayVoice = (msgId: string) => {
    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(msgId);
      setTimeout(() => {
        setPlayingVoiceId(null);
      }, 6000);
    }
  };

  // Handle Send Text Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && !selectedTaskId && !pendingAttachment) return;

    const targetChannel =
      chatCategory === 'direct' && selectedDirectUserId
        ? `dm-${selectedDirectUserId}`
        : activeChatChannelId;

    const attachmentsList = pendingAttachment ? [pendingAttachment] : undefined;

    sendChatMessage(
      targetChannel,
      messageText.trim() || (pendingAttachment ? 'قام بإرفاق ملف للمعاينة:' : 'قام بإرفاق مهمة عمل:'),
      selectedTaskId || undefined,
      attachmentsList,
      replyingToMessage
        ? {
            id: replyingToMessage.id,
            senderName: replyingToMessage.senderName,
            content: replyingToMessage.content.slice(0, 80),
          }
        : undefined
    );

    setMessageText('');
    setSelectedTaskId(null);
    setPendingAttachment(null);
    setReplyingToMessage(null);
    setIsTaskSelectorOpen(false);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick workflow snippets
  const applyQuickWorkflowSnippet = (snippet: string, autoTaskId?: string) => {
    setMessageText(snippet);
    if (autoTaskId) {
      setSelectedTaskId(autoTaskId);
    }
    textareaRef.current?.focus();
  };

  // Simulate incoming reply from another team member
  const handleSimulateIncomingMessage = () => {
    const colleagues = users.filter((u) => u.id !== currentUser.id);
    const randomColleague = colleagues[Math.floor(Math.random() * colleagues.length)];

    const cannedReplies = [
      'تمت مراجعة المسودة وهي مطابقة تماماً للمواصفات المطلوبة، جاهز للاعتماد! 👍',
      'جاري العمل على تعديل مقاسات البانر لتسليمها قبل نهاية اليوم 🎨',
      'أرقام الحملة ممتازة وحققنا زيادة 22% في عدد الليدز خلال آخر 24 ساعة 🚀',
      'يرجى الاطلاع على الملاحظة المرفقة بفيجما للتعديل النهائي ✍️',
    ];
    const randomReply = cannedReplies[Math.floor(Math.random() * cannedReplies.length)];

    showToast({
      type: 'info',
      title: `رسالة جديدة من ${randomColleague.name}`,
      message: randomReply,
    });

    // In a real environment this would be received over websocket or listener
    sendChatMessage(activeChatChannelId, randomReply);
  };

  // Copy message text
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast({
      type: 'info',
      title: 'تم النسخ',
      message: 'تم نسخ نص الرسالة إلى الحافظة',
    });
  };

  // Format Status Badge
  const getStatusBadge = (status: TaskStatus | string) => {
    switch (status) {
      case 'done':
      case 'client_delivered':
        return {
          label: 'مكتملة ومُسلّمة',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'in_progress':
        return {
          label: 'قيد التنفيذ',
          bg: 'bg-[#4C5540]/10 text-[#24291F] border-[#4C5540]/30',
          dot: 'bg-[#4C5540]',
        };
      case 'review':
        return {
          label: 'قيد المراجعة',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'changes_requested':
        return {
          label: 'تعديلات مطلوبة',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: 'بانتظار البدء',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  // Presence badge helper
  const getPresenceBadge = (status?: UserPresenceStatus) => {
    switch (status) {
      case 'online':
        return {
          label: 'متواجد الآن',
          labelEn: 'Online',
          color: 'bg-emerald-500',
          ring: 'ring-emerald-400/40',
          pulse: true,
          textClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'busy':
        return {
          label: 'مشغول / في اجتماع',
          labelEn: 'Busy',
          color: 'bg-amber-500',
          ring: 'ring-amber-400/40',
          pulse: false,
          textClass: 'text-amber-700 bg-amber-50 border-amber-200',
        };
      case 'offline':
      default:
        return {
          label: 'غير متصل',
          labelEn: 'Offline',
          color: 'bg-slate-400',
          ring: 'ring-slate-300',
          pulse: false,
          textClass: 'text-slate-600 bg-slate-100 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Channel Highlights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-l from-[#24291F] via-[#3B4432] to-[#4C5540] p-5 text-white shadow-md border border-[#BDAF9C]/30">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-xs">
            <MessageSquare className="h-6 w-6 text-[#E9E1D6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-cairo tracking-tight text-white">
                منظومة الدردشة والتنسيق اللحظي
              </h1>
              <span className="rounded-full bg-[#8A927D]/30 border border-[#8A927D]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#FAF7F2]">
                شال | Shal Chat Hub
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#E9E1D6]/85 font-cairo">
              تواصل حي، تسجيل ملاحظات صوتية، إرفاق المهام وتحديث حالاتها مباشرة داخل المحادثة.
            </p>
          </div>
        </div>

        {/* Quick Top Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Simulate incoming message button */}
          <button
            onClick={handleSimulateIncomingMessage}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-[#FAF7F2] border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            title="اختبار وصول رسالة جديدة من زميل"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#D4C7B7]" />
            <span>محاكاة رد من الفريق</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-white/90 border border-white/20 transition-all cursor-pointer"
            title={soundEnabled ? 'تنبيهات الصوت مفعلة' : 'الصوت مكتوم'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
          </button>

          {/* User Presence System (Online / Busy / Offline) Selector */}
          <div className="relative">
            <button
              onClick={() => setIsPresenceMenuOpen(!isPresenceMenuOpen)}
              className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 border border-white/20 backdrop-blur-xs transition-all cursor-pointer shadow-2xs"
              title="تغيير حالة اتصالك (Online / Busy / Offline)"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  getPresenceBadge(userPresence[currentUser.id] || 'online').color
                } ${
                  getPresenceBadge(userPresence[currentUser.id] || 'online').pulse ? 'animate-pulse' : ''
                }`}
              />
              <span className="text-xs font-bold text-[#FAF7F2]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#E9E1D6]/80 font-cairo">
                ({getPresenceBadge(userPresence[currentUser.id] || 'online').label})
              </span>
              <ChevronDown className="h-3 w-3 text-white/70" />
            </button>

            {/* Presence Dropdown Menu */}
            {isPresenceMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-[#24291F] p-1.5 text-white shadow-xl border border-[#BDAF9C]/30 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold text-[#BDAF9C] uppercase tracking-wider border-b border-white/10 mb-1">
                  تحديد حالة التواجد:
                </div>
                {[
                  { status: 'online' as UserPresenceStatus, label: 'متواجد ونشط', color: 'bg-emerald-500', dotPulse: true },
                  { status: 'busy' as UserPresenceStatus, label: 'مشغول / في اجتماع', color: 'bg-amber-500', dotPulse: false },
                  { status: 'offline' as UserPresenceStatus, label: 'غير متصل', color: 'bg-slate-400', dotPulse: false },
                ].map((p) => {
                  const isCurrent = (userPresence[currentUser.id] || 'online') === p.status;
                  return (
                    <button
                      key={p.status}
                      onClick={() => {
                        updateUserPresence(p.status);
                        setIsPresenceMenuOpen(false);
                      }}
                      className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent ? 'bg-[#4C5540] text-white' : 'hover:bg-white/10 text-[#E9E1D6]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${p.color} ${p.dotPulse ? 'animate-pulse' : ''}`} />
                        <span>{p.label}</span>
                      </div>
                      {isCurrent && <Check className="h-3 w-3 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Search & Filter Bar for Message History & Past Conversations */}
      <div className="rounded-2xl border border-[#BDAF9C]/35 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4C5540]" />
            <input
              type="text"
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              placeholder="شريط البحث السريع في سجل الرسائل القديمة والمحادثات (ابحث بالنص، اسم الزميل، المهمة، أو التاريخ)..."
              className="w-full rounded-xl border border-slate-200 bg-[#FAF7F2]/60 py-2.5 pr-10 pl-9 text-xs text-[#24291F] placeholder-slate-400 focus:border-[#4C5540] focus:bg-white focus:outline-hidden transition-all shadow-2xs font-cairo"
            />
            {chatSearchQuery && (
              <button
                onClick={() => setChatSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="مسح البحث"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Result Count / Status */}
          <div className="flex items-center gap-2 shrink-0">
            {chatSearchQuery.trim() ? (
              <span className="rounded-lg bg-[#4C5540]/10 border border-[#4C5540]/20 px-3 py-1.5 text-xs font-bold text-[#4C5540] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{channelMessages.length} نتائج في هذه المحادثة</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-cairo">
                إجمالي الرسائل بالسجل: {chatMessages.length} رسالة
              </span>
            )}
          </div>
        </div>

        {/* Filter Type Chips & Cross Channel Match Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 ml-1">تصفية حسب:</span>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'tasks', label: 'مهام العمل 💼' },
              { id: 'voice', label: 'تسجيلات صوتية 🎙️' },
              { id: 'files', label: 'مرفقات وملفات 📎' },
              { id: 'pinned', label: 'المثبتة 📌' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSearchFilterType(f.id as any)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  searchFilterType === f.id
                    ? 'bg-[#4C5540] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-slate-600 hover:bg-[#E9E1D6]/50 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cross channel matches navigation */}
          {crossChannelMatches.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#4C5540] bg-[#4C5540]/5 px-2.5 py-1 rounded-lg border border-[#4C5540]/20">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>
                عُثر على {crossChannelMatches.length} نتائج في محادثات أخرى:
              </span>
              {Array.from<string>(new Set(crossChannelMatches.map((m) => m.channelId)))
                .slice(0, 3)
                .map((chId: string) => {
                  const ch = chatChannels.find((c) => c.id === chId);
                  const isDm = chId.startsWith('dm-');
                  const dmUser = isDm ? users.find((u) => u.id === chId.replace('dm-', '')) : null;
                  const label = ch ? ch.nameAr : dmUser ? dmUser.name : chId;

                  return (
                    <button
                      key={chId}
                      onClick={() => {
                        if (isDm && dmUser) {
                          setChatCategory('direct');
                          setSelectedDirectUserId(dmUser.id);
                        } else if (ch) {
                          setChatCategory('channels');
                          setActiveChatChannelId(ch.id);
                        }
                      }}
                      className="rounded bg-white border border-[#4C5540]/30 px-1.5 py-0.5 text-[10px] font-bold text-[#4C5540] hover:bg-[#4C5540] hover:text-white transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Layout: Channels/DMs Sidebar + Messages Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] rounded-2xl border border-[#BDAF9C]/35 bg-[#FAF7F2] shadow-sm overflow-hidden">
        {/* Left/Right Sidebar: Channels & Direct Messages */}
        <div className="lg:col-span-4 xl:col-span-3 border-l border-[#BDAF9C]/25 bg-white/80 flex flex-col h-full">
          {/* Header & Category Switcher (Channels vs Direct Messages) */}
          <div className="p-3 border-b border-[#BDAF9C]/20">
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#BDAF9C]/25 mb-2">
              <button
                onClick={() => {
                  setChatCategory('channels');
                  setSelectedDirectUserId(null);
                }}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  chatCategory === 'channels'
                    ? 'bg-[#4C5540] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Hash className="h-3.5 w-3.5" />
                <span>قنوات الفرق ({accessibleChannels.length})</span>
              </button>

              <button
                onClick={() => {
                  setChatCategory('direct');
                  if (!selectedDirectUserId) {
                    const firstOtherUser = users.find((u) => u.id !== currentUser.id);
                    if (firstOtherUser) setSelectedDirectUserId(firstOtherUser.id);
                  }
                }}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  chatCategory === 'direct'
                    ? 'bg-[#4C5540] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>محادثات مباشرة</span>
              </button>
            </div>

            {/* Quick Search in Channels or Users */}
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="بحث في الرسائل والمحتوى..."
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pr-8 pl-3 text-xs text-[#24291F] placeholder-slate-400 focus:border-[#4C5540] focus:outline-hidden"
              />
              {chatSearchQuery && (
                <button
                  onClick={() => setChatSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* List of Channels or Direct Members */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
            {chatCategory === 'channels' ? (
              accessibleChannels.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <Lock className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">لم يتم إضافتك لأي قناة بعد</p>
                  <p className="text-[11px] text-slate-400">طبقاً لتوجيهات الإدارة، تظهر القنوات فقط عند إضافتك رسمياً من قبل الإدارة.</p>
                </div>
              ) : (
                accessibleChannels.map((channel) => {
                  const isActive = channel.id === activeChatChannelId;
                  const channelMsgCount = chatMessages.filter(
                    (m) => m.channelId === channel.id
                  ).length;
                  const taskCount = chatMessages.filter(
                    (m) => m.channelId === channel.id && m.attachedTaskId
                  ).length;

                  return (
                    <div
                      key={channel.id}
                      onClick={() => {
                        setActiveChatChannelId(channel.id);
                        markChatAsRead(channel.id);
                      }}
                      className={`w-full text-right p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border ${
                        isActive
                          ? 'bg-[#4C5540] text-white border-[#4C5540] shadow-sm ring-1 ring-[#4C5540]/30'
                          : 'bg-white hover:bg-[#E9E1D6]/40 text-[#24291F] border-[#BDAF9C]/20 hover:border-[#BDAF9C]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash
                            className={`h-4 w-4 ${
                              isActive ? 'text-[#FAF7F2]' : 'text-[#4C5540]'
                            }`}
                          />
                          <span className="text-xs font-bold">{channel.nameAr}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {isManagerOrAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setManagingMembersChannel(channel);
                                setSelectedChannelMembers(channel.allowedMemberIds || []);
                              }}
                              className={`rounded p-1 text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                isActive
                                  ? 'bg-white/20 hover:bg-white/30 text-white'
                                  : 'bg-[#4C5540]/10 hover:bg-[#4C5540]/20 text-[#4C5540]'
                              }`}
                              title="إدارة وتحديد أعضاء القناة"
                            >
                              <UserPlus className="h-3 w-3" />
                              <span>الأعضاء</span>
                            </button>
                          )}

                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              isActive ? 'bg-white/20 text-white' : 'bg-[#4C5540]/10 text-[#4C5540]'
                            }`}
                          >
                            {channel.team.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-[11px] line-clamp-1 text-right ${
                          isActive ? 'text-white/80' : 'text-slate-500'
                        }`}
                      >
                        {channel.descriptionAr}
                      </p>

                      <div className="flex items-center justify-between pt-1 mt-1 border-t border-current/10 text-[10px]">
                        <span className={isActive ? 'text-white/75' : 'text-slate-400'}>
                          {channelMsgCount} رسالة
                        </span>
                        {taskCount > 0 && (
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              isActive ? 'text-[#FAF7F2]' : 'text-[#4C5540]'
                            }`}
                          >
                            <Briefcase className="h-3 w-3" />
                            {taskCount} مهام
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // Direct messages user list with Online/Offline/Busy presence indicator
              users
                .filter((u) => u.id !== currentUser.id)
                .map((member) => {
                  const isSelected = selectedDirectUserId === member.id;
                  const memberPresence = userPresence[member.id] || 'offline';
                  const presenceInfo = getPresenceBadge(memberPresence);

                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedDirectUserId(member.id)}
                      className={`w-full text-right p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[#4C5540] text-white border-[#4C5540] shadow-sm'
                          : 'bg-white hover:bg-[#E9E1D6]/40 text-[#24291F] border-[#BDAF9C]/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-8 w-8 rounded-lg object-cover border border-[#BDAF9C]/40"
                          />
                          {/* Colored presence indicator dot */}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 ${presenceInfo.color} ${
                              presenceInfo.pulse ? 'animate-pulse' : ''
                            }`}
                            title={`حالة الاتصال: ${presenceInfo.label}`}
                          />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold truncate leading-tight">
                            {member.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[10px] font-bold ${
                                isSelected
                                  ? 'text-white/90'
                                  : memberPresence === 'online'
                                  ? 'text-emerald-700'
                                  : memberPresence === 'busy'
                                  ? 'text-amber-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {presenceInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono opacity-60">
                        #{member.employeeNumber}
                      </span>
                    </button>
                  );
                })
            )}
          </div>

          {/* Quick Filter: Messages with Tasks Only */}
          <div className="p-3 border-t border-[#BDAF9C]/20 bg-[#FAF7F2]/80 flex items-center justify-between">
            <button
              onClick={() => setFilterWithTasksOnly(!filterWithTasksOnly)}
              className={`flex items-center gap-1.5 text-xs font-bold rounded-lg px-2 py-1 transition-colors cursor-pointer ${
                filterWithTasksOnly
                  ? 'bg-[#4C5540] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="h-3 w-3" />
              <span>مهام المتابعة فقط</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">
              {channelMessages.length} رسالة
            </span>
          </div>
        </div>

        {/* Right/Left Main Chat Viewport */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full bg-white">
          {/* Channel Header Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#BDAF9C]/25 bg-[#FAF7F2]/90">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#4C5540]/10 p-2 text-[#4C5540] border border-[#4C5540]/25">
                <Hash className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#24291F]">
                    {chatCategory === 'direct' && selectedDirectUserId
                      ? users.find((u) => u.id === selectedDirectUserId)?.name
                      : activeChannel.nameAr}
                  </h3>
                  {chatCategory === 'direct' && selectedDirectUserId ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        getPresenceBadge(userPresence[selectedDirectUserId] || 'offline').textClass
                      }`}
                    >
                      {getPresenceBadge(userPresence[selectedDirectUserId] || 'offline').label}
                    </span>
                  ) : (
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                      {activeChannel.name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#4C5540]/80 mt-0.5 line-clamp-1">
                  {chatCategory === 'direct' && selectedDirectUserId
                    ? 'قناة محادثة ثنائية وتكليف مهام مباشر'
                    : activeChannel.descriptionAr}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTaskSelectorOpen(true)}
                className="btn-shal-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>إرفاق مهمة عمل</span>
              </button>
            </div>
          </div>

          {/* Pinned Messages Bar (if any) */}
          {pinnedMessages.length > 0 && (
            <div className="bg-amber-50/70 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Pin className="h-3.5 w-3.5 text-amber-700 fill-amber-700" />
                <span className="font-bold">رسالة مثبتة:</span>
                <span className="line-clamp-1 text-slate-700">
                  {pinnedMessages[0].content}
                </span>
              </div>
              <button
                onClick={() => togglePinChatMessage(pinnedMessages[0].id)}
                className="text-[10px] font-bold text-amber-800 hover:underline cursor-pointer"
              >
                إلغاء التثبيت
              </button>
            </div>
          )}

          {/* Messages Thread Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#FAF7F2]/30">
            {channelMessages.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <MessageSquare className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  لا توجد رسائل سابقة في هذه المحادثة
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  ابدأ المحادثة الآن، أو شارك مهمة عمل لمتابعتها مع الفريق.
                </p>
              </div>
            ) : (
              channelMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const reactions = msg.reactions || {};

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group ${
                      isMe ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Sender Avatar */}
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="h-8 w-8 rounded-full border border-slate-200 object-cover shrink-0 mt-0.5"
                    />

                    {/* Message Bubble Container */}
                    <div className={`max-w-xl flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Sender Meta Info */}
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-900">
                          {isMe ? 'أنت' : msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.timestamp}
                        </span>
                        {msg.isPinned && (
                          <Pin className="h-3 w-3 text-amber-600 fill-amber-600" />
                        )}
                      </div>

                      {/* Quoted Message Preview (if reply) */}
                      {msg.replyTo && (
                        <div className="mb-1 rounded-lg border-r-2 border-[#4C5540] bg-slate-100/80 px-2.5 py-1 text-[10px] text-slate-600 max-w-sm">
                          <span className="font-bold text-[#4C5540] block">
                            رد على {msg.replyTo.senderName}:
                          </span>
                          <span className="line-clamp-1">{msg.replyTo.content}</span>
                        </div>
                      )}

                      {/* Bubble Body */}
                      <div
                        className={`rounded-2xl p-3.5 shadow-2xs relative transition-all ${
                          isMe
                            ? 'bg-[#4C5540] text-white rounded-tr-xs'
                            : 'bg-white border border-[#BDAF9C]/30 text-[#24291F] rounded-tl-xs'
                        }`}
                      >
                        {/* Voice Note Rendering */}
                        {msg.isVoiceNote ? (
                          <div className="flex items-center gap-3 py-1 min-w-[200px]">
                            <button
                              onClick={() => togglePlayVoice(msg.id)}
                              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isMe ? 'bg-white text-[#4C5540]' : 'bg-[#4C5540] text-white'
                              }`}
                            >
                              {playingVoiceId === msg.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                              )}
                            </button>

                            {/* Voice Waveform Animation */}
                            <div className="flex-1 flex items-center gap-0.5 h-6">
                              {[4, 12, 18, 8, 14, 20, 10, 16, 6, 12, 8].map((h, i) => (
                                <span
                                  key={i}
                                  className={`w-1 rounded-full transition-all ${
                                    playingVoiceId === msg.id ? 'animate-pulse' : ''
                                  } ${isMe ? 'bg-white/80' : 'bg-[#4C5540]/80'}`}
                                  style={{ height: `${h}px` }}
                                />
                              ))}
                            </div>

                            <span className={`text-[10px] font-mono font-bold ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                              {msg.voiceDuration || '0:15'}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}

                        {/* File / Image Attachment preview */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-current/15 space-y-1.5">
                            {msg.attachments.map((att, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-2 p-2 rounded-xl border ${
                                  isMe
                                    ? 'bg-black/15 border-white/20 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-bold truncate flex-1">
                                  {att.name}
                                </span>
                                {att.size && (
                                  <span className="text-[10px] opacity-75">{att.size}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactive Task Card inside Message */}
                        {msg.attachedTask && (
                          <div
                            className={`mt-2.5 rounded-xl border p-3 transition-all ${
                              isMe
                                ? 'bg-white text-[#24291F] border-white/40'
                                : 'bg-[#FAF7F2] border-[#BDAF9C]/40 text-[#24291F]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="rounded bg-[#4C5540]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#4C5540]">
                                مهمة عمل مرتبطة
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                  getStatusBadge(msg.attachedTask.status).bg
                                }`}
                              >
                                {getStatusBadge(msg.attachedTask.status).label}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-[#24291F] line-clamp-1">
                              {msg.attachedTask.title}
                            </h4>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                              <span>التسليم: {msg.attachedTask.dueDate || '2026-10-28'}</span>

                              {/* Interactive Task Transition Action */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    if (msg.attachedTaskId) {
                                      updateTaskStatus(msg.attachedTaskId, 'in_progress');
                                      showToast({
                                        type: 'info',
                                        title: 'تحديث حالة المهمة',
                                        message: 'تم تحويل المهمة إلى "قيد التنفيذ"',
                                      });
                                    }
                                  }}
                                  className="rounded bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 cursor-pointer"
                                >
                                  تنفيذ
                                </button>
                                <button
                                  onClick={() => {
                                    if (msg.attachedTaskId) {
                                      updateTaskStatus(msg.attachedTaskId, 'review');
                                      showToast({
                                        type: 'info',
                                        title: 'تحديث حالة المهمة',
                                        message: 'تم تحويل المهمة إلى "قيد المراجعة والاعتماد"',
                                      });
                                    }
                                  }}
                                  className="rounded bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 cursor-pointer"
                                >
                                  مراجعة
                                </button>
                                <button
                                  onClick={() => {
                                    if (msg.attachedTaskId) {
                                      updateTaskStatus(msg.attachedTaskId, 'done');
                                      showToast({
                                        type: 'success',
                                        title: 'إنجاز المهمة',
                                        message: 'تم اعتماد المهمة كمكتملة ومُسلّمة',
                                      });
                                    }
                                  }}
                                  className="rounded bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 cursor-pointer"
                                >
                                  إنجاز
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reactions Row & Action Menu */}
                      <div className="flex items-center gap-1 mt-1 px-1">
                        {/* Display existing reactions */}
                        {Object.entries(reactions).map(([emoji, rawUids]) => {
                          const uids = Array.isArray(rawUids) ? (rawUids as string[]) : [];
                          if (!uids || uids.length === 0) return null;
                          const hasReacted = uids.includes(currentUser.id);

                          return (
                            <button
                              key={emoji}
                              onClick={() => toggleMessageReaction(msg.id, emoji)}
                              className={`rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 border transition-all cursor-pointer ${
                                hasReacted
                                  ? 'bg-[#4C5540]/15 border-[#4C5540] text-[#24291F] font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="font-mono text-[9px]">{uids.length}</span>
                            </button>
                          );
                        })}

                        {/* Quick Reaction Buttons on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-2xs">
                          {['👍', '❤️', '🔥', '👏', '🚀'].map((em) => (
                            <button
                              key={em}
                              onClick={() => toggleMessageReaction(msg.id, em)}
                              className="text-xs hover:scale-125 transition-transform cursor-pointer"
                            >
                              {em}
                            </button>
                          ))}

                          <button
                            onClick={() => setReplyingToMessage(msg)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="رد على الرسالة"
                          >
                            <Reply className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() => handleCopyMessage(msg.content)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="نسخ الرسالة"
                          >
                            <Copy className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() => togglePinChatMessage(msg.id)}
                            className="p-1 text-slate-400 hover:text-amber-600"
                            title={msg.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
                          >
                            <Pin className="h-3 w-3" />
                          </button>

                          {isMe && (
                            <button
                              onClick={() => deleteChatMessage(msg.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="حذف الرسالة"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Canned Snippets Bar */}
          <div className="px-4 py-2 border-t border-[#BDAF9C]/20 bg-[#FAF7F2] overflow-x-auto flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#4C5540] shrink-0">
              ردود سريعة:
            </span>
            <button
              onClick={() => applyQuickWorkflowSnippet('تم اعتماد المسودة وجاري النشر في الموعد المحدد.')}
              className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#BDAF9C]/30 hover:bg-[#4C5540] hover:text-white transition-colors shrink-0"
            >
              ✅ تم الاعتماد وجاهز للنشر
            </button>
            <button
              onClick={() => applyQuickWorkflowSnippet('يرجى مراجعة الملاحظات على فيجما وإرسال التعديلات.')}
              className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#BDAF9C]/30 hover:bg-[#4C5540] hover:text-white transition-colors shrink-0"
            >
              🎨 مراجعة ملف فيجما
            </button>
            <button
              onClick={() => applyQuickWorkflowSnippet('تم إطلاق الإعلانات الممولة ومتابعة معدل العائد ROAS.')}
              className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-lg border border-[#BDAF9C]/30 hover:bg-[#4C5540] hover:text-white transition-colors shrink-0"
            >
              🚀 تحديث الحملات الإعلانية
            </button>
          </div>

          {/* Reply Context Banner (if active) */}
          {replyingToMessage && (
            <div className="bg-slate-100 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Reply className="h-3.5 w-3.5 text-[#4C5540]" />
                <span className="font-bold">الرد على {replyingToMessage.senderName}:</span>
                <span className="line-clamp-1 text-slate-500">
                  {replyingToMessage.content}
                </span>
              </div>
              <button
                onClick={() => setReplyingToMessage(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Attached Task Draft Preview */}
          {selectedTaskId && (
            <div className="bg-emerald-50 border-t border-emerald-200 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-emerald-700" />
                <span className="font-bold">المهمة المرفقة:</span>
                <span className="line-clamp-1">
                  {tasks.find((t) => t.id === selectedTaskId)?.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Attachment Preview (if staged) */}
          {pendingAttachment && (
            <div className="bg-sky-50 border-t border-sky-200 px-4 py-1.5 flex items-center justify-between text-xs text-sky-900">
              <div className="flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5 text-sky-700" />
                <span className="font-bold">الملف المرفق:</span>
                <span className="line-clamp-1">{pendingAttachment.name} ({pendingAttachment.size})</span>
              </div>
              <button
                onClick={() => setPendingAttachment(null)}
                className="text-sky-700 hover:text-sky-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Composer Box */}
          <div className="p-3 border-t border-[#BDAF9C]/25 bg-white">
            {isRecordingVoice ? (
              // Live Voice Recording State
              <div className="flex items-center justify-between rounded-xl border border-rose-300 bg-rose-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <span className="text-xs font-bold text-rose-800">
                    جاري تسجيل الملاحظة الصوتية... ({recordingSeconds}s)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelVoiceRecording}
                    className="rounded-lg px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleStopAndSendVoice}
                    className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>إرسال الصوت</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              // Standard Text & Attachments Composer
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك هنا... (اضغط Enter للإرسال، أو ارفق مهمة عمل للمتابعة)"
                    className="w-full resize-none rounded-xl border border-[#BDAF9C]/35 bg-[#FAF7F2]/40 p-3 text-xs text-[#24291F] placeholder-slate-400 focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Task Attachment Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsTaskSelectorOpen(true)}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                        selectedTaskId
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Briefcase className="h-3.5 w-3.5 text-[#4C5540]" />
                      <span>{selectedTaskId ? 'مهمة محددة' : 'إرفاق مهمة'}</span>
                    </button>

                    {/* File Attachment Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentModal(true)}
                      className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      title="إرفاق ملف أو تصميم"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>

                    {/* Voice Note Trigger */}
                    <button
                      type="button"
                      onClick={handleStartVoiceRecording}
                      className="rounded-xl p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="تسجيل ملاحظة صوتية"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!messageText.trim() && !selectedTaskId && !pendingAttachment}
                    className="btn-shal-primary text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>إرسال</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Task Attachment Selection Modal */}
      {isTaskSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  إرفاق مهمة عمل بالمحادثة
                </h4>
                <p className="text-xs text-slate-500">
                  اختر المهمة التي ترغب بمشاركتها مع الفريق لمتابعة إنجازها
                </p>
              </div>
              <button
                onClick={() => setIsTaskSelectorOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                placeholder="البحث في عناوين المهام..."
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-[#4C5540] focus:outline-hidden"
              />

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setIsTaskSelectorOpen(false);
                    }}
                    className={`rounded-xl border p-2.5 transition-all cursor-pointer flex items-center justify-between ${
                      selectedTaskId === task.id
                        ? 'border-[#4C5540] bg-[#4C5540]/10'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {task.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span>{task.dueDate}</span>
                        <span>·</span>
                        <span>{task.priority.toUpperCase()}</span>
                      </div>
                    </div>

                    <span className="rounded bg-white px-2 py-0.5 text-[9px] font-bold text-slate-700 border border-slate-200">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Attachment Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">إرفاق ملف أو تصميم</h4>
              <button
                onClick={() => setShowAttachmentModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setPendingAttachment({
                    name: 'تصاميم_بنرات_كمبوند_النرجس_v2.png',
                    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
                    size: '2.4 MB',
                    type: 'image',
                  });
                  setShowAttachmentModal(false);
                }}
                className="w-full text-right p-3 rounded-xl border border-slate-200 hover:bg-[#FAF7F2] transition-colors flex items-center gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">
                    تصاميم_بنرات_كمبوند_النرجس_v2.png
                  </h5>
                  <span className="text-[10px] text-slate-500">2.4 MB · صورة عالية الدقة</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPendingAttachment({
                    name: 'تقرير_العائد_الإعلاني_Meta_Search.pdf',
                    url: '#',
                    size: '1.1 MB',
                    type: 'file',
                  });
                  setShowAttachmentModal(false);
                }}
                className="w-full text-right p-3 rounded-xl border border-slate-200 hover:bg-[#FAF7F2] transition-colors flex items-center gap-3 cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">
                    تقرير_العائد_الإعلاني_Meta_Search.pdf
                  </h5>
                  <span className="text-[10px] text-slate-500">1.1 MB · ملف مستندات</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Channel Members Modal (Admin / Management Only) */}
      {managingMembersChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#181D18] p-6 shadow-2xl border border-slate-200 dark:border-[#2D372B] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2D372B] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#4C5540]/10 text-[#4C5540] dark:text-[#A4C08B]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    إدارة أعضاء القناة: {managingMembersChannel.nameAr}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#BDAF9C]">
                    حدد الأعضاء المصرح لهم برؤية القناة والتفاعل بها
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManagingMembersChannel(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A3428]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs">
              {users.map((member) => {
                const isChecked = selectedChannelMembers.includes(member.id);
                return (
                  <label
                    key={member.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'border-[#4C5540] bg-[#FAF7F2] dark:bg-[#1E251D] text-[#24291F] dark:text-white font-bold'
                        : 'border-slate-200 dark:border-[#2D372B] hover:bg-slate-50 dark:hover:bg-[#151A14] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChannelMembers((prev) => [...prev, member.id]);
                          } else {
                            setSelectedChannelMembers((prev) => prev.filter((id) => id !== member.id));
                          }
                        }}
                        className="rounded border-slate-300 text-[#4C5540] focus:ring-[#4C5540]"
                      />
                      <div>
                        <div className="text-xs">{member.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {member.email} · {member.team}
                        </div>
                      </div>
                    </div>
                    {isChecked && <Check className="h-4 w-4 text-[#4C5540] dark:text-[#A4C08B]" />}
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#2D372B] text-xs">
              <span className="text-slate-500 font-medium">
                تم اختيار {selectedChannelMembers.length} أعضاء
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setManagingMembersChannel(null)}
                  className="rounded-xl border border-slate-200 dark:border-[#2D372B] px-3.5 py-1.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E251D] cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateChannelMembers(managingMembersChannel.id, selectedChannelMembers);
                    setManagingMembersChannel(null);
                  }}
                  className="rounded-xl bg-[#4C5540] px-4 py-1.5 font-bold text-white hover:bg-[#3B4432] shadow-xs cursor-pointer"
                >
                  حفظ الصلاحيات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
