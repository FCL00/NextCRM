import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, formatDate } from '../../services/storage';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DealFormModal } from './DealFormModal';
import { DealStage } from '../../types/crm';
import {
  X,
  Kanban,
  Building,
  User,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';

interface DealDetailModalProps {
  dealId: string | null;
  onClose: () => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({ dealId, onClose }) => {
  const {
    getDeal,
    getCompany,
    getContact,
    activities,
    moveDealStage,
    deleteDeal,
    openQuickAdd,
    setSelectedContactId,
    setSelectedCompanyId,
    setActiveView,
  } = useCrm();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!dealId) return null;
  const deal = getDeal(dealId);
  if (!deal) return null;

  const company = getCompany(deal.companyId);
  const contact = getContact(deal.contactId);
  const dealActivities = activities.filter(a => a.dealId === deal.id);

  const stages: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const handleDelete = () => {
    deleteDeal(deal.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-start justify-between gap-4 bg-[#FAF9F6]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge stage={deal.stage} variant="stage">
                  {deal.stage}
                </Badge>
                {deal.priority && (
                  <Badge priority={deal.priority} variant="priority">
                    {deal.priority} Priority
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-stone-900">{deal.title}</h3>
              <div className="text-2xl font-bold font-mono text-orange-600 mt-1 tabular-nums">
                {formatCurrency(deal.value)}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
                title="Edit deal"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete deal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stepper: Interactive Pipeline Progression */}
          <div className="px-6 py-3 bg-stone-50 border-b border-stone-200">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block mb-2">
              Move Pipeline Stage
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {stages.map((st, idx) => {
                const isCurrent = deal.stage === st;
                return (
                  <button
                    key={st}
                    onClick={() => moveDealStage(deal.id, st)}
                    className={`py-1.5 px-1 text-[11px] font-semibold rounded-md border text-center transition-all ${
                      isCurrent
                        ? st === 'Won'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : st === 'Lost'
                          ? 'bg-stone-700 text-white border-stone-700 shadow-xs'
                          : 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Account & Contact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                    Associated Account
                  </span>
                  {company ? (
                    <button
                      onClick={() => {
                        onClose();
                        setSelectedCompanyId(company.id);
                        setActiveView('companies');
                      }}
                      className="text-stone-800 hover:text-orange-600 font-semibold truncate text-left"
                    >
                      {company.name}
                    </button>
                  ) : (
                    <span className="text-stone-400">No company linked</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                    Primary Contact
                  </span>
                  {contact ? (
                    <button
                      onClick={() => {
                        onClose();
                        setSelectedContactId(contact.id);
                        setActiveView('contacts');
                      }}
                      className="text-stone-800 hover:text-orange-600 font-semibold truncate text-left"
                    >
                      {contact.firstName} {contact.lastName}
                    </button>
                  ) : (
                    <span className="text-stone-400">No contact linked</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                    Target Close Date
                  </span>
                  <span className="text-stone-800 font-medium">
                    {formatDate(deal.expectedCloseDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Kanban className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                    Last Stage Update
                  </span>
                  <span className="text-stone-800 font-medium">
                    {formatDate(deal.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {deal.description && (
              <div>
                <h4 className="font-bold text-stone-800 text-xs mb-1.5 uppercase tracking-wider">
                  Opportunity Scope & Notes
                </h4>
                <p className="text-stone-600 bg-white p-3.5 rounded-lg border border-stone-200 leading-relaxed whitespace-pre-wrap">
                  {deal.description}
                </p>
              </div>
            )}

            {/* Related Activities */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-orange-500" />
                  <span>Logged Activities ({dealActivities.length})</span>
                </h4>
                <button
                  onClick={() => openQuickAdd('activity')}
                  className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Log Activity</span>
                </button>
              </div>

              {dealActivities.length === 0 ? (
                <div className="p-3 text-center text-stone-400 bg-stone-50 rounded-lg border border-stone-200">
                  No activities linked to this deal yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {dealActivities.map(act => (
                    <div
                      key={act.id}
                      className="p-3 bg-white rounded-lg border border-stone-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-stone-900">{act.title}</div>
                        <div className="text-stone-400 text-[11px]">
                          {formatDate(act.dueDate || act.createdAt)}
                        </div>
                      </div>
                      <Badge activityType={act.type} variant="type">
                        {act.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DealFormModal
        isOpen={isEditOpen}
        dealToEdit={deal}
        onClose={() => setIsEditOpen(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Deal"
        message={`Are you sure you want to delete "${deal.title}"? This opportunity will be removed from your pipeline calculations.`}
        confirmLabel="Delete Deal"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
