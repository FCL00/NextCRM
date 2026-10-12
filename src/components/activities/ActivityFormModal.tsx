import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Activity, ActivityType } from '../../types/crm';
import { X, CalendarCheck, Phone, Mail, Calendar, CheckSquare, FileText, User, Kanban } from 'lucide-react';

interface ActivityFormModalProps {
  isOpen: boolean;
  activityToEdit?: Activity | null;
  onClose: () => void;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  activityToEdit,
  onClose,
}) => {
  const { createActivity, updateActivity, contacts, deals } = useCrm();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('Call');
  const [description, setDescription] = useState('');
  const [contactId, setContactId] = useState('');
  const [dealId, setDealId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title);
      setType(activityToEdit.type);
      setDescription(activityToEdit.description || '');
      setContactId(activityToEdit.contactId || '');
      setDealId(activityToEdit.dealId || '');
      setDueDate(activityToEdit.dueDate ? activityToEdit.dueDate.split('T')[0] : '');
      setCompleted(activityToEdit.completed);
    } else {
      setTitle('');
      setType('Task');
      setDescription('');
      setContactId('');
      setDealId('');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setCompleted(false);
    }
    setError(null);
  }, [activityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Activity title is required.');
      return;
    }

    try {
      if (activityToEdit) {
        updateActivity(activityToEdit.id, {
          title: title.trim(),
          type,
          description: description.trim(),
          contactId: contactId || null,
          dealId: dealId || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          completed,
        });
      } else {
        createActivity({
          title: title.trim(),
          type,
          description: description.trim(),
          contactId: contactId || null,
          dealId: dealId || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          completed,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save activity.');
    }
  };

  const activityTypes: ActivityType[] = ['Call', 'Email', 'Meeting', 'Task', 'Note'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {activityToEdit ? 'Edit Activity' : 'Schedule Activity'}
              </h3>
              <p className="text-xs text-stone-500">Record customer interaction or upcoming task</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div className='px-4'>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Activity Type</label>
            <div className="grid grid-cols-5 gap-1.5">
              {activityTypes.map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    type === t
                      ? 'bg-orange-50 text-orange-700 border-orange-300 shadow-2xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className='px-4'>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Follow-up demo call with VP of Engineering"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Related Contact</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <select
                  value={contactId}
                  onChange={e => setContactId(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                >
                  <option value="">No Contact Linked</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Related Deal</label>
              <div className="relative">
                <Kanban className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <select
                  value={dealId}
                  onChange={e => setDealId(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                >
                  <option value="">No Deal Linked</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Due / Scheduled Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                />
              </div>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700 select-none">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={e => setCompleted(e.target.checked)}
                  className="rounded border-stone-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>Mark as Completed</span>
              </label>
            </div>
          </div>

          <div className="px-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Agenda</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Meeting agenda, call notes, next steps..."
              className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
            />
          </div>

          <div className="p-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs"
            >
              {activityToEdit ? 'Save Changes' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
