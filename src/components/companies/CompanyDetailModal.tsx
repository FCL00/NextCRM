import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, formatDate } from '../../services/storage';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CompanyFormModal } from './CompanyFormModal';
import {
  X,
  Building2,
  Globe,
  Phone,
  MapPin,
  Users,
  Kanban,
  Edit2,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react';

interface CompanyDetailModalProps {
  companyId: string | null;
  onClose: () => void;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  companyId,
  onClose,
}) => {
  const {
    getCompany,
    contacts,
    deals,
    getCompanyStats,
    deleteCompany,
    openQuickAdd,
    setSelectedContactId,
    setSelectedDealId,
    setActiveView,
  } = useCrm();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!companyId) return null;
  const company = getCompany(companyId);
  if (!company) return null;

  const { contactCount, openDealValue } = getCompanyStats(company.id);
  const companyContacts = contacts.filter(c => c.companyId === company.id);
  const companyDeals = deals.filter(d => d.companyId === company.id);

  const handleDelete = () => {
    deleteCompany(company.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-start justify-between gap-4 bg-[#FAF9F6]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-orange-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-stone-900">{company.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                    {company.industry}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{company.city || 'No location set'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
                title="Edit company"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete company"
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
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-200/60">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                  Open Deal Pipeline
                </span>
                <span className="text-xl font-bold font-mono text-orange-700 tabular-nums">
                  {formatCurrency(openDealValue)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                  Associated Contacts
                </span>
                <span className="text-xl font-bold font-mono text-stone-800 tabular-nums">
                  {contactCount}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Website</span>
                  {company.website ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:underline font-medium truncate flex items-center gap-1"
                    >
                      <span className="truncate">{company.website}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-stone-400">Not specified</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Phone</span>
                  <span className="text-stone-700 font-medium">
                    {company.phone || 'Not specified'}
                  </span>
                </div>
              </div>

              {company.address && (
                <div className="col-span-1 sm:col-span-2 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">Address</span>
                    <span className="text-stone-700 font-medium">{company.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {company.notes && (
              <div>
                <h4 className="font-bold text-stone-800 text-xs mb-1.5 uppercase tracking-wider">
                  Account Notes
                </h4>
                <p className="text-stone-600 bg-white p-3 rounded-lg border border-stone-200 leading-relaxed whitespace-pre-wrap">
                  {company.notes}
                </p>
              </div>
            )}

            {/* Associated Contacts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-500" />
                  <span>Team & Contacts ({companyContacts.length})</span>
                </h4>
                <button
                  onClick={() => openQuickAdd('contact')}
                  className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Contact</span>
                </button>
              </div>

              {companyContacts.length === 0 ? (
                <div className="p-3 text-center text-stone-400 bg-stone-50 rounded-lg border border-stone-200">
                  No contacts registered under this company yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {companyContacts.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onClose();
                        setSelectedContactId(c.id);
                        setActiveView('contacts');
                      }}
                      className="p-3 bg-white rounded-lg border border-stone-200 hover:border-orange-300 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">
                          {c.firstName} {c.lastName}
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          {c.jobTitle || 'No title'} · {c.email}
                        </div>
                      </div>
                      <Badge status={c.status} variant="status">
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Associated Deals */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Kanban className="w-3.5 h-3.5 text-orange-500" />
                  <span>Deals ({companyDeals.length})</span>
                </h4>
                <button
                  onClick={() => openQuickAdd('deal')}
                  className="text-orange-600 hover:text-orange-700 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Deal</span>
                </button>
              </div>

              {companyDeals.length === 0 ? (
                <div className="p-3 text-center text-stone-400 bg-stone-50 rounded-lg border border-stone-200">
                  No deals linked to this company yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {companyDeals.map(d => (
                    <div
                      key={d.id}
                      onClick={() => {
                        onClose();
                        setSelectedDealId(d.id);
                        setActiveView('deals');
                      }}
                      className="p-3 bg-white rounded-lg border border-stone-200 hover:border-orange-300 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">
                          {d.title}
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          Expected: {formatDate(d.expectedCloseDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge stage={d.stage} variant="stage">
                          {d.stage}
                        </Badge>
                        <span className="font-mono font-bold text-stone-900 tabular-nums">
                          {formatCurrency(d.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CompanyFormModal
        isOpen={isEditOpen}
        companyToEdit={company}
        onClose={() => setIsEditOpen(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Company"
        message={`Are you sure you want to delete ${company.name}? Existing contacts and deals will safely have their company field unlinked rather than deleted.`}
        confirmLabel="Delete Company"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
