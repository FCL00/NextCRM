import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Contact, ContactStatus } from '../../types/crm';
import { formatDate } from '../../services/storage';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ContactFormModal } from './ContactFormModal';
import { ContactDetailModal } from './ContactDetailModal';
import { EmptyState } from '../common/EmptyState';
import {
  Users,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    getCompany,
    deleteContact,
    loadDemoData,
    selectedContactId,
    setSelectedContactId,
  } = useCrm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ContactStatus>('All');
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'status' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Filtering & Sorting
  const filteredContacts = useMemo(() => {
    return contacts
      .filter(contact => {
        const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
        const q = search.toLowerCase().trim();
        if (!q) return matchesStatus;

        const company = getCompany(contact.companyId);
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        const email = contact.email.toLowerCase();
        const phone = (contact.phone || '').toLowerCase();
        const companyName = (company?.name || '').toLowerCase();

        const matchesSearch =
          fullName.includes(q) || email.includes(q) || phone.includes(q) || companyName.includes(q);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        } else if (sortBy === 'company') {
          const compA = getCompany(a.companyId)?.name || '';
          const compB = getCompany(b.companyId)?.name || '';
          comp = compA.localeCompare(compB);
        } else if (sortBy === 'status') {
          comp = a.status.localeCompare(b.status);
        } else if (sortBy === 'updated') {
          comp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [contacts, search, statusFilter, sortBy, sortOrder, getCompany]);

  const toggleSort = (field: 'name' | 'company' | 'status' | 'updated') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
  };

  const getInitials = (contact: Contact) => {
    return `${contact.firstName[0] || ''}${contact.lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="p-4 md:p-8 max-w-8xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Contacts</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Manage your address book, customer stakeholders, and deal contacts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="hidden px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs lg:flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, company, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-stone-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {(['All', 'Active', 'Lead', 'Inactive'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab}
            </button>
          ))}

          {(search || statusFilter !== 'All') && (
            <button
              onClick={resetFilters}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium ml-2 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Contacts Table View */}
      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts found"
          description="Build your pipeline by adding customer contacts, partners, and decision-makers."
          actionLabel="Create Contact"
          onAction={() => setIsAddModalOpen(true)}
          secondaryActionLabel="Load Sample Data"
          onSecondaryAction={() => loadDemoData(true)}
        />
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-stone-200 text-center">
          <p className="text-sm text-stone-600 mb-3">No contacts match your active search or filters.</p>
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-stone-900"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-stone-900"
                    onClick={() => toggleSort('company')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Company</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">Job Title</th>
                  <th className="py-3 px-4 font-semibold">Email & Phone</th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-stone-900"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-stone-900"
                    onClick={() => toggleSort('updated')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Last Updated</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredContacts.map(contact => {
                  const company = getCompany(contact.companyId);

                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      {/* Avatar + Full Name */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setSelectedContactId(contact.id)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0 border border-orange-200">
                            {getInitials(contact)}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-[11px] text-stone-400 sm:hidden">
                              {contact.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        {company?.name || <span className="text-stone-400">—</span>}
                      </td>

                      {/* Job Title */}
                      <td className="py-3 px-4 text-stone-600">
                        {contact.jobTitle || <span className="text-stone-400">—</span>}
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3 px-4">
                        <div className="text-stone-700">{contact.email}</div>
                        {contact.phone && (
                          <div className="text-stone-400 text-[11px] font-mono">{contact.phone}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge status={contact.status} variant="status">
                          {contact.status}
                        </Badge>
                      </td>

                      {/* Updated Date */}
                      <td className="py-3 px-4 text-right text-stone-400 font-mono">
                        {formatDate(contact.updatedAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedContactId(contact.id)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                            title="View contact details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setContactToEdit(contact)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                            title="Edit contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setContactToDelete(contact)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-stone-50 border-t border-stone-200 text-stone-500 text-xs flex items-center justify-between">
            <span>
              Showing {filteredContacts.length} of {contacts.length} total contacts
            </span>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <ContactFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      {contactToEdit && (
        <ContactFormModal
          isOpen={true}
          contactToEdit={contactToEdit}
          onClose={() => setContactToEdit(null)}
        />
      )}

      {/* Details Modal */}
      {selectedContactId && (
        <ContactDetailModal
          contactId={selectedContactId}
          onClose={() => setSelectedContactId(null)}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!contactToDelete}
        title="Delete Contact"
        message={`Are you sure you want to remove ${contactToDelete?.firstName} ${contactToDelete?.lastName}? Any related deals or tasks will safely remain intact.`}
        confirmLabel="Delete Contact"
        onConfirm={() => {
          if (contactToDelete) {
            deleteContact(contactToDelete.id);
            setContactToDelete(null);
          }
        }}
        onCancel={() => setContactToDelete(null)}
      />
    </div>
  );
};
