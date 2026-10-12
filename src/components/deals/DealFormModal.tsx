import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Deal, DealStage, DealPriority } from '../../types/crm';
import { X, Kanban, DollarSign, Calendar, Building, User, FileText, AlertCircle } from 'lucide-react';

interface DealFormModalProps {
  isOpen: boolean;
  dealToEdit?: Deal | null;
  defaultStage?: DealStage;
  onClose: () => void;
}

export const DealFormModal: React.FC<DealFormModalProps> = ({
  isOpen,
  dealToEdit,
  defaultStage = 'Lead',
  onClose,
}) => {
  const { createDeal, updateDeal, companies, contacts } = useCrm();

  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<DealStage>(defaultStage);
  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<DealPriority>('Medium');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dealToEdit) {
      setTitle(dealToEdit.title);
      setValue(dealToEdit.value ? dealToEdit.value.toString() : '0');
      setStage(dealToEdit.stage);
      setCompanyId(dealToEdit.companyId || '');
      setContactId(dealToEdit.contactId || '');
      setExpectedCloseDate(dealToEdit.expectedCloseDate || '');
      setDescription(dealToEdit.description || '');
      setPriority(dealToEdit.priority || 'Medium');
    } else {
      setTitle('');
      setValue('');
      setStage(defaultStage);
      setCompanyId('');
      setContactId('');
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      setExpectedCloseDate(in30Days.toISOString().split('T')[0]);
      setDescription('');
      setPriority('Medium');
    }
    setError(null);
  }, [dealToEdit, defaultStage, isOpen]);

  // Filter contacts by selected company if company selected
  const availableContacts = companyId
    ? contacts.filter(c => c.companyId === companyId || !c.companyId)
    : contacts;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Deal title is required.');
      return;
    }

    const numericValue = parseFloat(value) || 0;
    if (numericValue < 0) {
      setError('Deal value cannot be negative.');
      return;
    }

    try {
      if (dealToEdit) {
        updateDeal(dealToEdit.id, {
          title: title.trim(),
          value: numericValue,
          stage,
          companyId: companyId || null,
          contactId: contactId || null,
          expectedCloseDate: expectedCloseDate || new Date().toISOString().split('T')[0],
          description: description.trim(),
          priority,
        });
      } else {
        createDeal({
          title: title.trim(),
          value: numericValue,
          stage,
          companyId: companyId || null,
          contactId: contactId || null,
          expectedCloseDate: expectedCloseDate || new Date().toISOString().split('T')[0],
          description: description.trim(),
          priority,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save deal.');
    }
  };

  const stages: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Kanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {dealToEdit ? 'Edit Opportunity' : 'New Sales Deal'}
              </h3>
              <p className="text-xs text-stone-500">Track deal progression and projected revenue</p>
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
          <div className='px-4'>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Enterprise Cloud License Rollout"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Deal Value ($) *</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="50000"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Pipeline Stage</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as DealStage)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
              >
                {stages.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Associated Company</label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <select
                  value={companyId}
                  onChange={e => {
                    setCompanyId(e.target.value);
                  }}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                >
                  <option value="">No Company Linked</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Contact</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <select
                  value={contactId}
                  onChange={e => setContactId(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                >
                  <option value="">No Contact Linked</option>
                  {availableContacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Close Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={expectedCloseDate}
                  onChange={e => setExpectedCloseDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
              <div className="flex gap-2">
                {(['Low', 'Medium', 'High'] as DealPriority[]).map(p => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                      priority === p
                        ? 'bg-orange-50 text-orange-700 border-orange-300 font-semibold shadow-2xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className='px-4'>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Description & Scope</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Deal context, milestones, key proposal deliverables..."
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
              {dealToEdit ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
