import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  X,
  CheckCircle2,
  Calendar,
  UserCheck,
  Briefcase,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import { TaskPriority } from '../../types';

interface QuickTaskShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickTaskShortcutModal: React.FC<QuickTaskShortcutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    users,
    clients,
    projects,
    addTask,
    language,
    currentUser,
    showToast,
  } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || 'c-1');
  const [assignedTo, setAssignedTo] = useState<string[]>(['user-ui-ux']);
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [teamType, setTeamType] = useState<'design' | 'social'>('design');
  const [dueDate, setDueDate] = useState('2026-10-28');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast({
        type: 'warning',
        title: language === 'ar' ? 'تنبيه' : 'Warning',
        message: language === 'ar' ? 'يرجى إدخال عنوان المهمة' : 'Please enter task title',
      });
      return;
    }

    const clientObj = clients.find((c) => c.id === clientId);
    const linkedProject = projects.find((p) => p.clientId === clientId) || projects[0];

    addTask({
      projectId: linkedProject?.id || 'proj-1',
      clientId: clientId,
      title: title.trim(),
      description: description.trim() || 'مهمة تم إنشاؤها عبر اختصار العمليات السريع لوكالة شال',
      status: 'todo',
      priority: priority,
      assignedTo: assignedTo,
      createdBy: currentUser.name,
      dueDate: dueDate,
      teamType: teamType,
    });

    showToast({
      type: 'success',
      title: language === 'ar' ? 'تم إنشاء المهمة بنجاح' : 'Task Created Successfully',
      message: `${title.trim()} (${language === 'ar' ? 'مسندة إلى' : 'assigned to'} ${users.find(u => u.id === assignedTo[0])?.name})`,
    });

    // Reset & close
    setTitle('');
    setDescription('');
    onClose();
  };

  const applyQuickPreset = (presetTitle: string, pType: 'design' | 'social', pPriority: TaskPriority, targetUserId: string) => {
    setTitle(presetTitle);
    setTeamType(pType);
    setPriority(pPriority);
    setAssignedTo([targetUserId]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24291F]/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#BDAF9C]/40 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#BDAF9C]/25 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#4C5540] p-2 text-white shadow-xs">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#24291F]">
                  {language === 'ar' ? 'إنشاء مهمة سريعة (Quick Task Shortcut)' : 'Quick Task Creation'}
                </h3>
                <span className="rounded bg-[#4C5540]/10 px-2 py-0.5 text-[10px] font-bold text-[#4C5540] border border-[#4C5540]/25">
                  اختصار شال
                </span>
              </div>
              <p className="text-xs text-[#4C5540]/80 mt-0.5">
                {language === 'ar'
                  ? 'نموذج مصغر لتكليف وتمرير المهام المستعجلة فورياً لأعضاء الفريق'
                  : 'Fast mini-form for immediate task delegation across the team'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#E9E1D6]/40 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Presets Strip */}
        <div className="mt-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#BDAF9C]/25">
          <p className="text-[11px] font-bold text-[#4C5540] flex items-center gap-1 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            {language === 'ar' ? 'قوالب واختصارات سريعة بنقرة واحدة:' : 'Quick Workflow Presets:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyQuickPreset('تصميم بنرات سناب شات وإنستغرام عاجلة', 'design', 'urgent', 'user-ui-ux')}
              className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-lg border border-[#BDAF9C]/35 text-[#24291F] hover:bg-[#4C5540] hover:text-white transition-colors cursor-pointer shadow-2xs"
            >
              🎨 بنرات سوشيال عاجلة
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset('كتابة هوكات وكابشن 3 ريلز لفصل الشتاء', 'social', 'high', 'user-content-creator')}
              className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-lg border border-[#BDAF9C]/35 text-[#24291F] hover:bg-[#4C5540] hover:text-white transition-colors cursor-pointer shadow-2xs"
            >
              ✍️ سيناريو ريلز سريع
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset('فحص وتحديث الميزانية اليومية لإعلانات Meta', 'social', 'urgent', 'user-media-buyer')}
              className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-lg border border-[#BDAF9C]/35 text-[#24291F] hover:bg-[#4C5540] hover:text-white transition-colors cursor-pointer shadow-2xs"
            >
              🚀 ضبط إعلانات ممولة
            </button>
          </div>
        </div>

        {/* Mini Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#24291F] mb-1">
              {language === 'ar' ? 'عنوان المهمة *' : 'Task Title *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: تصميم بوست إعلان العرض الخاص لمطاعم غصن وزيتونة...' : 'e.g. Design emergency Instagram banner...'}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-[#24291F] focus:border-[#4C5540] focus:ring-1 focus:ring-[#4C5540] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#24291F] mb-1">
                {language === 'ar' ? 'العميل المستهدف' : 'Target Client'}
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#24291F] focus:border-[#4C5540] focus:outline-hidden cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24291F] mb-1">
                {language === 'ar' ? 'إسناد للعضو المسئول' : 'Assign to Member'}
              </label>
              <select
                value={assignedTo[0] || 'user-ui-ux'}
                onChange={(e) => setAssignedTo([e.target.value])}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#24291F] focus:border-[#4C5540] focus:outline-hidden cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#24291F] mb-1">
                {language === 'ar' ? 'الأولوية' : 'Priority'}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-[#24291F] focus:border-[#4C5540] focus:outline-hidden cursor-pointer font-bold"
              >
                <option value="urgent">{language === 'ar' ? '🔥 عاجلة' : 'Urgent'}</option>
                <option value="high">{language === 'ar' ? '⚡ مرتفعة' : 'High'}</option>
                <option value="medium">{language === 'ar' ? '📌 متوسطة' : 'Medium'}</option>
                <option value="low">{language === 'ar' ? '☕ عادية' : 'Low'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24291F] mb-1">
                {language === 'ar' ? 'القسم' : 'Department'}
              </label>
              <select
                value={teamType}
                onChange={(e) => setTeamType(e.target.value as 'design' | 'social')}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-[#24291F] focus:border-[#4C5540] focus:outline-hidden cursor-pointer"
              >
                <option value="design">{language === 'ar' ? '🎨 تصميم وهوية' : 'Design'}</option>
                <option value="social">{language === 'ar' ? '✍️ محتوى وسوشيال' : 'Social'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#24291F] mb-1">
                {language === 'ar' ? 'تاريخ التسليم' : 'Due Date'}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-[#24291F] focus:border-[#4C5540] focus:outline-hidden cursor-pointer font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#24291F] mb-1">
              {language === 'ar' ? 'ملاحظات وتفاصيل إضافية (اختياري)' : 'Details & Specs (Optional)'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'ar' ? 'المقاسات المطلوبة، روابط فيجما، أو أية تفاصيل تسليم...' : 'Dimensions, links, or delivery notes...'}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-[#24291F] focus:border-[#4C5540] focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-5 pt-3 border-t border-[#BDAF9C]/25 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="btn-shal-primary text-xs py-2 px-5 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'ar' ? 'إنشاء المهمة وتكليفها الآن' : 'Create & Assign Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
