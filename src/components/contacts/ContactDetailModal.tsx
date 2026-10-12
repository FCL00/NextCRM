import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, formatDate } from '../../services/storage';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ContactFormModal } from './ContactFormModal';
import {
  X,
  Mail,
  Phone,
  Building,
  Briefcase,
  Kanban,
  CalendarCheck,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';

interface ContactDetailModalProps {
  contactId: string | null;
  onClose: () => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contactId,
  onClose,
}) => {
  const {
    getContact,
    getCompany,
    deals,
    activities,
    deleteContact,
    openQuickAdd,
    setSelectedDealId,
    setActiveView,
  } = useCrm();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!contactId) return null;
  const contact = getContact(contactId);
  if (!contact) return null;

  const company = getCompany(contact.companyId);
  const contactDeals = deals.filter(d => d.contactId === contact.id);
  const contactActivities = activities.filter(a => a.contactId === contact.id);

  const getInitials = () => {
    return `${contact.firstName[0] || ''}${contact.lastName[0] || ''}`.toUpperCase();
  };

  const handleDelete = () => {
    deleteContact(contact.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header Bar */}
          <div className="p-6 border-b border-stone-100 flex items-start justify-between gap-4 bg-[#FAF9F6]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                {getInitials()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-stone-900">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  <Badge status={contact.status} variant="status">
                    {contact.status}
                  </Badge>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {contact.jobTitle || 'No title'} {company ? `at ${company.name}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
                title="Edit contact"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete contact"
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

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Email</span>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-orange-600 hover:underline font-medium truncate block"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Phone</span>
                  <span className="text-stone-700 font-medium">
                    {contact.phone || 'Not specified'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Company</span>
                  <span className="text-stone-700 font-medium">{company?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Title</span>
                  <span className="text-stone-700 font-medium">{contact.jobTitle || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {contact.notes && (
              <div>
                <h4 className="font-bold text-stone-800 text-xs mb-1.5 uppercase tracking-wider">
                  Notes & Background
                </h4>
                <p className="text-stone-600 bg-white p-3 rounded-lg border border-stone-200 leading-relaxed whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </div>
            )}

            {/* Related Deals */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Kanban className="w-3.5 h-3.5 text-orange-500" />
                  <span>Associated Deals ({contactDeals.length})</span>
                </h4>
                <button
                  onClick={() => openQuickAdd('deal')}
                  className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Deal</span>
                </button>
              </div>

              {contactDeals.length === 0 ? (
                <div className="p-3 text-center text-stone-400 bg-stone-50 rounded-lg border border-stone-200">
                  No deals linked to this contact.
                </div>
              ) : (
                <div className="space-y-2">
                  {contactDeals.map(deal => (
                    <div
                      key={deal.id}
                      onClick={() => {
                        onClose();
                        setSelectedDealId(deal.id);
                        setActiveView('deals');
                      }}
                      className="p-3 bg-white rounded-lg border border-stone-200 hover:border-orange-300 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">
                          {deal.title}
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          Close target: {formatDate(deal.expectedCloseDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge stage={deal.stage} variant="stage">
                          {deal.stage}
                        </Badge>
                        <span className="font-mono font-bold text-stone-900 tabular-nums">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity History */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-orange-500" />
                  <span>Activity History ({contactActivities.length})</span>
                </h4>
                <button
                  onClick={() => openQuickAdd('activity')}
                  className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Log Activity</span>
                </button>
              </div>

              {contactActivities.length === 0 ? (
                <div className="p-3 text-center text-stone-400 bg-stone-50 rounded-lg border border-stone-200">
                  No interactions recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {contactActivities.map(act => (
                    <div
                      key={act.id}
                      className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-stone-900 truncate">{act.title}</div>
                        <div className="text-stone-400 text-[11px] truncate">{act.description}</div>
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

      <ContactFormModal
        isOpen={isEditOpen}
        contactToEdit={contact}
        onClose={() => setIsEditOpen(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contact.firstName} ${contact.lastName}? Deals and activities associated with this contact will safely remain intact.`}
        confirmLabel="Delete Contact"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
