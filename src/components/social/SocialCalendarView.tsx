import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContentPost, SocialPlatform, ContentStatus, MediaType } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Check,
  RotateCcw,
  Clock,
  Instagram,
  Linkedin,
  Twitter,
  Share2,
  Image as ImageIcon,
  Video,
  Film,
  Sparkles,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const SocialCalendarView: React.FC = () => {
  const {
    contentPosts,
    clients,
    projects,
    currentUser,
    addContentPost,
    updateContentPost,
    approvePost,
    requestChangesPost,
    publishPost,
    hasPermission,
    language,
  } = useApp();

  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  // Preview Post Modal
  const [previewPost, setPreviewPost] = useState<ContentPost | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  // Add Post Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formClientId, setFormClientId] = useState(clients[0]?.id || '');
  const [formPlatform, setFormPlatform] = useState<SocialPlatform>('instagram');
  const [formMediaType, setFormMediaType] = useState<MediaType>('image');
  const [formScheduledDate, setFormScheduledDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [formScheduledTime, setFormScheduledTime] = useState('18:00');
  const [formMediaUrl, setFormMediaUrl] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  );

  const canApprove = hasPermission('can_approve_content');
  const canPublish = hasPermission('can_publish_posts');

  const filteredPosts = contentPosts.filter((post) => {
    const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesClient = clientFilter === 'all' || post.clientId === clientFilter;
    return matchesPlatform && matchesStatus && matchesClient;
  });

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-blue-700" />;
      case 'twitter':
      case 'x':
        return <Twitter className="h-4 w-4 text-sky-500" />;
      case 'tiktok':
        return <Film className="h-4 w-4 text-slate-900" />;
      default:
        return <Share2 className="h-4 w-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">مسودة (Draft)</span>;
      case 'review':
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 animate-pulse">بانتظار المراجعة (Review)</span>;
      case 'approved':
        return <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">معتمد (Approved)</span>;
      case 'scheduled':
        return <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">مجدول للنشر (Scheduled)</span>;
      case 'published':
        return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">تم النشر (Published)</span>;
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    addContentPost({
      clientId: formClientId,
      projectId: projects.find((p) => p.clientId === formClientId)?.id || 'proj-1',
      title: formTitle,
      caption: formCaption,
      hashtags: [],
      platform: formPlatform,
      mediaType: formMediaType,
      mediaUrl: formMediaUrl,
      scheduledDate: formScheduledDate,
      scheduledTime: formScheduledTime,
      authorId: currentUser.id,
    });

    setIsAddModalOpen(false);
    setFormTitle('');
    setFormCaption('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#1b24f5]" />
            {language === 'ar' ? 'تقويم المحتوى ومسار الموافقات' : 'Social Content & Approvals'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'تخطيط، مراجعة، واعتماد منشورات العملاء - نبض الوصول.'
              : 'End-to-end content workflow: drafting, client approvals, and publishing schedules.'}
          </p>
        </div>

        <button
          id="new-post-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#1b24f5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#161dc2] transition-colors"
        >
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'إنشاء منشور جديد' : 'New Content Post'}
        </button>
      </div>

      {/* Role Notice Banner */}
      <div className="flex items-center justify-between rounded-xl bg-[#1b24f5]/5 border border-[#1b24f5]/20 p-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#b5f812] animate-ping" />
          <span className="font-bold text-[#1b24f5]">
            {currentUser.roleTitle}:
          </span>
          <span className="text-slate-700">
            {currentUser.role === 'account_manager'
              ? (language === 'ar' ? 'يمكنك مراجعة كافة منشورات الفريق واعتمادها للنشر أو طلب تعديلات عليها.' : 'You can review, approve, or request revisions on all content.')
              : currentUser.role === 'social_media_specialist'
              ? (language === 'ar' ? 'يمكنك إعداد الكابشن واختيار المنصات وإرسال المسودات للمراجعة والاعتماد.' : 'You can draft captions, schedule posts, and submit for client/manager review.')
              : (language === 'ar' ? 'يمكنك مراجعة التصاميم وربط الأصول البصرية بدقة مع متطلبات كل منصة.' : 'You can review visual deliverables and attach approved designs.')}
          </span>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Client selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            {language === 'ar' ? 'العميل:' : 'Client:'}
          </span>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
          >
            <option value="all">{language === 'ar' ? 'كافة العملاء' : 'All Clients'}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Platform filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'all', labelAr: 'كل المنصات', labelEn: 'All Platforms' },
            { id: 'instagram', labelAr: 'Instagram', labelEn: 'Instagram' },
            { id: 'linkedin', labelAr: 'LinkedIn', labelEn: 'LinkedIn' },
            { id: 'twitter', labelAr: 'Twitter / X', labelEn: 'Twitter / X' },
            { id: 'tiktok', labelAr: 'TikTok', labelEn: 'TikTok' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPlatformFilter(item.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                platformFilter === item.id
                  ? 'bg-[#1b24f5] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {language === 'ar' ? item.labelAr : item.labelEn}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'review', label: 'مطلوب مراجعة' },
            { id: 'approved', label: 'معتمد' },
            { id: 'scheduled', label: 'مجدول' },
            { id: 'published', label: 'تم النشر' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`rounded-lg px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => {
          const client = clients.find((c) => c.id === post.clientId);

          return (
            <div
              key={post.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                {/* Media Image / Video Banner */}
                <div className="relative aspect-video w-full bg-slate-900/10 overflow-hidden group">
                  {post.mediaUrl ? (
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}

                  {/* Badges on top */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 backdrop-blur-xs shadow-xs">
                      {getPlatformIcon(post.platform)}
                      {post.platform.toUpperCase()}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {getStatusBadge(post.status)}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-bold text-[#1b24f5] truncate max-w-[180px]">
                      {client?.name}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      {post.scheduledDate} ({post.scheduledTime})
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{post.title}</h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>

                  {/* Feedback notice if any */}
                  {post.feedbackNote && (
                    <div className="mt-2.5 rounded-lg bg-rose-50 p-2 text-[11px] text-rose-800 border border-rose-200">
                      <strong>{language === 'ar' ? 'تعديل مطلوب:' : 'Feedback:'}</strong> {post.feedbackNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls & Approval Workflow */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setPreviewPost(post);
                      setShowRejectBox(false);
                      setRejectFeedback('');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    {language === 'ar' ? 'معاينة المنشور' : 'Live Mockup'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* If review stage and can approve */}
                    {post.status === 'review' && canApprove && (
                      <>
                        <button
                          onClick={() => {
                            setPreviewPost(post);
                            setShowRejectBox(true);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {language === 'ar' ? 'طلب تعديل' : 'Reject'}
                        </button>
                        <button
                          onClick={() => approvePost(post.id)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {language === 'ar' ? 'اعتماد' : 'Approve'}
                        </button>
                      </>
                    )}

                    {/* If draft and writer wants to submit for review */}
                    {post.status === 'draft' && (
                      <button
                        onClick={() => updateContentPost(post.id, { status: 'review' })}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 shadow-xs"
                      >
                        {language === 'ar' ? 'إرسال للمراجعة' : 'Submit for Review'}
                      </button>
                    )}

                    {/* If approved and ready to schedule */}
                    {post.status === 'approved' && canPublish && (
                      <button
                        onClick={() => updateContentPost(post.id, { status: 'scheduled' })}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 shadow-xs"
                      >
                        {language === 'ar' ? 'جدولة النشر' : 'Schedule'}
                      </button>
                    )}

                    {/* If scheduled and published */}
                    {post.status === 'scheduled' && canPublish && (
                      <button
                        onClick={() => updateContentPost(post.id, { status: 'published' })}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs"
                      >
                        {language === 'ar' ? 'نُشر بالفعل' : 'Mark Published'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Social Mockup Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-slate-100">
                  {getPlatformIcon(previewPost.platform)}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'معاينة المنشور الميدانية' : 'Social Mockup Preview'}
                  </h3>
                  <span className="text-[10px] text-slate-400 capitalize">{previewPost.platform} Feed</span>
                </div>
              </div>

              <button
                onClick={() => setPreviewPost(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Social Post Feed Box Mockup */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {/* Account Bar */}
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-xs font-extrabold text-slate-800">
                      {clients.find((c) => c.id === previewPost.clientId)?.name.slice(0, 1) || 'A'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {clients.find((c) => c.id === previewPost.clientId)?.company || 'Brand Account'}
                    </p>
                    <p className="text-[10px] text-slate-400">Sponsored • Managed by Agency</p>
                  </div>
                </div>
              </div>

              {/* Media Image */}
              {previewPost.mediaUrl && (
                <img
                  src={previewPost.mediaUrl}
                  alt={previewPost.title}
                  className="w-full max-h-72 object-cover"
                />
              )}

              {/* Caption & Description */}
              <div className="p-3 text-xs">
                <p className="font-bold text-slate-900 mb-1">{previewPost.title}</p>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{previewPost.caption}</p>
                <p className="text-[11px] text-indigo-600 font-semibold mt-2">
                  #marketing #agency #{previewPost.platform} #growth
                </p>
              </div>
            </div>

            {/* Reject with Feedback Box */}
            {showRejectBox && (
              <div className="mt-3 rounded-xl bg-rose-50 p-3 border border-rose-200">
                <label className="text-xs font-bold text-rose-900 block mb-1">
                  {language === 'ar' ? 'سبب طلب التعديل والتوجيه للكاتب:' : 'Feedback for the creator:'}
                </label>
                <textarea
                  rows={2}
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  placeholder="مثال: يرجى استبدال الصورة بأخرى توضح خصائص التطبيق أكثر مع تعديل الهوك..."
                  className="w-full rounded-lg border border-rose-200 bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setShowRejectBox(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (!rejectFeedback.trim()) return;
                      requestChangesPost(previewPost.id, rejectFeedback.trim());
                      setPreviewPost(null);
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
                  >
                    إرسال التعديل للكاتب
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'تاريخ النشر:' : 'Date:'} {previewPost.scheduledDate}
              </span>

              {previewPost.status === 'review' && canApprove && !showRejectBox && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    طلب تعديل
                  </button>
                  <button
                    onClick={() => {
                      approvePost(previewPost.id);
                      setPreviewPost(null);
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    اعتماد النشر
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Content Post Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'إنشاء مسودة محتوى سوشيال ميديا جديدة' : 'Create Social Post Draft'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'العميل المستهدف *' : 'Client *'}
                </label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'فكرة / عنوان المنشور *' : 'Post Title / Angle *'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: 5 نصائح ذكية لتقليل الهدر المالي للشركات"
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'نص الكابشن الكامل (Copywriting) *' : 'Post Caption / Copy *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  placeholder="اكتب الهوك والمحتوى وقفل الدعوة لاتخاذ إجراء (CTA) والهاشتاغات هنا..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المنصة' : 'Platform'}
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نوع الوسائط' : 'Media Type'}
                  </label>
                  <select
                    value={formMediaType}
                    onChange={(e) => setFormMediaType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="image">تصميم صورة فردية (Image)</option>
                    <option value="carousel">كاروسيل شرائح (Carousel)</option>
                    <option value="reel">فيديو ريل / تيك توك (Reel/Video)</option>
                    <option value="text">نص فقط (Text Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'رابط التصميم / صورة المعاينة' : 'Media Asset URL'}
                </label>
                <input
                  type="text"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تاريخ النشر المخطط' : 'Publish Date'}
                  </label>
                  <input
                    type="date"
                    value={formScheduledDate}
                    onChange={(e) => setFormScheduledDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'وقت النشر' : 'Publish Time'}
                  </label>
                  <input
                    type="time"
                    value={formScheduledTime}
                    onChange={(e) => setFormScheduledTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1b24f5] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#161dc2] shadow-xs"
                >
                  {language === 'ar' ? 'حفظ وإرسال للمراجعة' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
