import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Company } from '../../types/crm';
import { formatCurrency } from '../../services/storage';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CompanyFormModal } from './CompanyFormModal';
import { CompanyDetailModal } from './CompanyDetailModal';
import { EmptyState } from '../common/EmptyState';
import {
  Building2,
  Search,
  Plus,
  Globe,
  Phone,
  MapPin,
  Users,
  DollarSign,
  ArrowUpDown,
  Edit2,
  Trash2,
  ExternalLink,
  LayoutGrid,
  List,
} from 'lucide-react';

export const CompaniesView: React.FC = () => {
  const {
    companies,
    getCompanyStats,
    deleteCompany,
    loadDemoData,
    selectedCompanyId,
    setSelectedCompanyId,
  } = useCrm();

  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'deals' | 'contacts'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Extract available industries
  const availableIndustries = useMemo(() => {
    const set = new Set(companies.map(c => c.industry).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [companies]);

  // Filter & Sort
  const filteredCompanies = useMemo(() => {
    return companies
      .filter(company => {
        const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry;
        const q = search.toLowerCase().trim();
        if (!q) return matchesIndustry;

        const matchesSearch =
          company.name.toLowerCase().includes(q) ||
          company.industry.toLowerCase().includes(q) ||
          company.city.toLowerCase().includes(q);

        return matchesIndustry && matchesSearch;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = a.name.localeCompare(b.name);
        } else if (sortBy === 'deals') {
          const valA = getCompanyStats(a.id).openDealValue;
          const valB = getCompanyStats(b.id).openDealValue;
          comp = valA - valB;
        } else if (sortBy === 'contacts') {
          const cntA = getCompanyStats(a.id).contactCount;
          const cntB = getCompanyStats(b.id).contactCount;
          comp = cntA - cntB;
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [companies, search, selectedIndustry, sortBy, sortOrder, getCompanyStats]);

  const toggleSort = (field: 'name' | 'deals' | 'contacts') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedIndustry('All');
  };

  return (
    <div className="p-4 md:p-8 max-w-8xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Companies</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Manage target accounts, customer organizations, and open pipeline values.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="hidden px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs lg:flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter and View Layout Controls */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company name, industry, or city..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400"
          />
        </div>

        {/* Industry Filter Dropdown & Grid/List switcher */}
        <div className="flex items-center gap-2">
          <select
            value={selectedIndustry}
            onChange={e => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-hidden"
          >
            {availableIndustries.map(ind => (
              <option key={ind} value={ind}>
                Industry: {ind}
              </option>
            ))}
          </select>

          {/* Grid vs Table View Switch */}
          <div className="flex bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewLayout === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewLayout === 'table' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Companies Content */}
      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description="Create your first business account or load sample demo data to see pipeline calculations."
          actionLabel="Create Company"
          onAction={() => setIsAddModalOpen(true)}
          secondaryActionLabel="Load Sample Data"
          onSecondaryAction={() => loadDemoData(true)}
        />
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-stone-200 text-center">
          <p className="text-sm text-stone-600 mb-3">No companies match your search criteria.</p>
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : viewLayout === 'grid' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map(company => {
            const { contactCount, openDealValue } = getCompanyStats(company.id);

            return (
              <div
                key={company.id}
                className="bg-white rounded-xl border border-stone-200 hover:border-orange-300 transition-all p-5 shadow-xs flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      onClick={() => setSelectedCompanyId(company.id)}
                      className="cursor-pointer"
                    >
                      <h3 className="font-bold text-stone-900 text-base group-hover:text-orange-600 transition-colors">
                        {company.name}
                      </h3>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-600">
                        {company.industry}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCompanyToEdit(company)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                        title="Edit company"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCompanyToDelete(company)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete company"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="space-y-2 text-xs text-stone-600 mb-5">
                    {company.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{company.city}</span>
                      </div>
                    )}

                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline truncate flex items-center gap-1"
                        >
                          <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      </div>
                    )}

                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="font-mono text-[11px]">{company.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metrics (Calculated Real Values) */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold text-stone-800">{contactCount}</span>
                    <span>contacts</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      Open Deals
                    </span>
                    <span className="font-mono font-bold text-orange-600 tabular-nums">
                      {formatCurrency(openDealValue)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
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
                      <span>Company Name</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">Industry</th>
                  <th className="py-3 px-4 font-semibold">City</th>
                  <th className="py-3 px-4 font-semibold">Website</th>
                  <th
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-stone-900"
                    onClick={() => toggleSort('contacts')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Contacts</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-stone-900"
                    onClick={() => toggleSort('deals')}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Open Pipeline</span>
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCompanies.map(company => {
                  const { contactCount, openDealValue } = getCompanyStats(company.id);

                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td
                        onClick={() => setSelectedCompanyId(company.id)}
                        className="py-3 px-4 font-semibold text-stone-900 group-hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        {company.name}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{company.industry}</td>
                      <td className="py-3 px-4 text-stone-600">{company.city || '—'}</td>
                      <td className="py-3 px-4">
                        {company.website ? (
                          <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <span>{company.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-stone-700">
                        {contactCount}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-orange-600 tabular-nums">
                        {formatCurrency(openDealValue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedCompanyId(company.id)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                            title="View details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCompanyToEdit(company)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCompanyToDelete(company)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete"
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
        </div>
      )}

      {/* Add Modal */}
      <CompanyFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      {companyToEdit && (
        <CompanyFormModal
          isOpen={true}
          companyToEdit={companyToEdit}
          onClose={() => setCompanyToEdit(null)}
        />
      )}

      {/* Details Modal */}
      {selectedCompanyId && (
        <CompanyDetailModal
          companyId={selectedCompanyId}
          onClose={() => setSelectedCompanyId(null)}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!companyToDelete}
        title="Delete Company"
        message={`Are you sure you want to delete ${companyToDelete?.name}? Contacts and deals linked to this company will safely remain intact with company reference unlinked.`}
        confirmLabel="Delete Company"
        onConfirm={() => {
          if (companyToDelete) {
            deleteCompany(companyToDelete.id);
            setCompanyToDelete(null);
          }
        }}
        onCancel={() => setCompanyToDelete(null)}
      />
    </div>
  );
};
