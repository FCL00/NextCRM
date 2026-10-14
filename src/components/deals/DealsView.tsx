import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Deal, DealStage } from '../../types/crm';
import { formatCurrency, formatDate } from '../../services/storage';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DealFormModal } from './DealFormModal';
import { DealDetailModal } from './DealDetailModal';
import { EmptyState } from '../common/EmptyState';
import {
  Kanban,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Calendar,
  Building,
  User,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const DealsView: React.FC = () => {
  const {
    deals,
    dealsByStage,
    getCompany,
    getContact,
    moveDealStage,
    deleteDeal,
    loadDemoData,
    selectedDealId,
    setSelectedDealId,
  } = useCrm();

  const [search, setSearch] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');
  const [viewLayout, setViewLayout] = useState<'kanban' | 'table'>('kanban');
  const [sortBy, setSortBy] = useState<'value' | 'date' | 'title'>('value');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalStage, setAddModalStage] = useState<DealStage>('Lead');
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  // Drag and drop states
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  const stages: DealStage[] = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const stageTheme: Record<DealStage, { bg: string; border: string; headerText: string; accent: string }> = {
    Lead: { bg: 'bg-stone-50/70', border: 'border-stone-200', headerText: 'text-stone-800', accent: 'bg-stone-400' },
    Qualified: { bg: 'bg-sky-50/50', border: 'border-sky-200', headerText: 'text-sky-900', accent: 'bg-sky-500' },
    Proposal: { bg: 'bg-amber-50/50', border: 'border-amber-200', headerText: 'text-amber-900', accent: 'bg-amber-500' },
    Negotiation: { bg: 'bg-orange-50/60', border: 'border-orange-200', headerText: 'text-orange-900', accent: 'bg-orange-600' },
    Won: { bg: 'bg-emerald-50/60', border: 'border-emerald-200', headerText: 'text-emerald-900', accent: 'bg-emerald-600' },
    Lost: { bg: 'bg-stone-100/60', border: 'border-stone-200', headerText: 'text-stone-600', accent: 'bg-stone-500' },
  };

  // Filter & Sort
  const filteredDeals = useMemo(() => {
    return deals
      .filter(deal => {
        const matchesStage = selectedStageFilter === 'All' || deal.stage === selectedStageFilter;
        const q = search.toLowerCase().trim();
        if (!q) return matchesStage;

        const company = getCompany(deal.companyId);
        const contact = getContact(deal.contactId);
        const title = deal.title.toLowerCase();
        const compName = (company?.name || '').toLowerCase();
        const contactName = contact ? `${contact.firstName} ${contact.lastName}`.toLowerCase() : '';

        const matchesSearch =
          title.includes(q) || compName.includes(q) || contactName.includes(q);

        return matchesStage && matchesSearch;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'value') {
          comp = Number(a.value) - Number(b.value);
        } else if (sortBy === 'date') {
          comp = new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime();
        } else if (sortBy === 'title') {
          comp = a.title.localeCompare(b.title);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [deals, search, selectedStageFilter, sortBy, sortOrder, getCompany, getContact]);

  // Group deals by stage for Kanban
  const dealsByColumn = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      Lead: [],
      Qualified: [],
      Proposal: [],
      Negotiation: [],
      Won: [],
      Lost: [],
    };
    filteredDeals.forEach(deal => {
      if (map[deal.stage]) {
        map[deal.stage].push(deal);
      }
    });
    return map;
  }, [filteredDeals]);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stage: DealStage) => {
    if (dragOverStage === stage) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      moveDealStage(dealId, stage);
    }
    setDraggedDealId(null);
  };

  const openAddForStage = (stage: DealStage) => {
    setAddModalStage(stage);
    setIsAddModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-8xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Deals Pipeline</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Visualize opportunities, drag between stages, and project incoming revenue.
          </p>
        </div>

        <button
          onClick={() => openAddForStage('Lead')}
          className="hidden px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs lg:flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Control Bar: Search, Stage filter & Layout Switcher */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search deals by title, company, or contact..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400"
          />
        </div>

        {/* Filters and View Switch */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStageFilter}
            onChange={e => setSelectedStageFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 focus:outline-hidden"
          >
            <option value="All">All Stages</option>
            {stages.map(s => (
              <option key={s} value={s}>
                {s} ({dealsByStage[s]?.count || 0})
              </option>
            ))}
          </select>

          {/* Kanban vs Table View Toggle */}
          <div className="flex bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setViewLayout('kanban')}
              className={`p-1.5 rounded-md transition-colors ${
                viewLayout === 'kanban' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Kanban view"
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

      {/* Main Deals Content */}
      {deals.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="No deals in pipeline"
          description="Track your first sales conversation or generate sample data to test the board."
          actionLabel="Create Opportunity"
          onAction={() => openAddForStage('Lead')}
          secondaryActionLabel="Load Sample Deals"
          onSecondaryAction={() => loadDemoData(true)}
        />
      ) : viewLayout === 'kanban' ? (
        /* Interactive Kanban Board (6 columns exact) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {stages.map(stage => {
            const columnDeals = dealsByColumn[stage] || [];
            const summary = dealsByStage[stage] || { count: 0, value: 0 };
            const isDropTarget = dragOverStage === stage;
            const theme = stageTheme[stage];

            return (
              <div
                key={stage}
                onDragOver={e => handleDragOver(e, stage)}
                onDragLeave={e => handleDragLeave(e, stage)}
                onDrop={e => handleDrop(e, stage)}
                className={`rounded-xl border transition-all flex flex-col min-w-[200px] ${
                  theme.bg
                } ${
                  isDropTarget ? 'border-orange-500 ring-2 ring-orange-500/20' : theme.border
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-stone-200/80 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${theme.accent}`} />
                      <h3 className={`text-xs font-bold truncate ${theme.headerText}`}>{stage}</h3>
                      <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                        ({columnDeals.length})
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-stone-800 mt-0.5 tabular-nums">
                      {formatCurrency(summary.value)}
                    </div>
                  </div>

                  <button
                    onClick={() => openAddForStage(stage)}
                    className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-md transition-colors"
                    title={`Add deal to ${stage}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2.5 min-h-[160px] flex-1">
                  {columnDeals.length === 0 ? (
                    <div className="h-28 border border-dashed border-stone-200 rounded-lg flex items-center justify-center text-[11px] text-stone-400">
                      Drop deals here
                    </div>
                  ) : (
                    columnDeals.map(deal => {
                      const company = getCompany(deal.companyId);
                      const contact = getContact(deal.contactId);

                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={e => handleDragStart(e, deal.id)}
                          onClick={() => setSelectedDealId(deal.id)}
                          className="bg-white p-3.5 rounded-lg border border-stone-200 hover:border-orange-300 shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group select-none"
                        >
                          {/* Priority and Value */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-mono font-bold text-stone-900 text-xs tabular-nums">
                              {formatCurrency(deal.value)}
                            </span>
                            {deal.priority && (
                              <Badge priority={deal.priority} variant="priority">
                                {deal.priority}
                              </Badge>
                            )}
                          </div>

                          {/* Deal Title */}
                          <h4 className="text-xs font-semibold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                            {deal.title}
                          </h4>

                          {/* Company & Contact */}
                          <div className="space-y-1 text-[11px] text-stone-500 mb-2.5">
                            {company && (
                              <div className="flex items-center gap-1.5 truncate">
                                <Building className="w-3 h-3 text-stone-400 shrink-0" />
                                <span className="truncate font-medium text-stone-700">{company.name}</span>
                              </div>
                            )}
                            {contact && (
                              <div className="flex items-center gap-1.5 truncate">
                                <User className="w-3 h-3 text-stone-400 shrink-0" />
                                <span className="truncate">
                                  {contact.firstName} {contact.lastName}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Footer Close Target & Accessible Stage Switcher */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(deal.expectedCloseDate)}</span>
                            </span>

                            {/* Stage select fallback for accessibility */}
                            <select
                              value={deal.stage}
                              onClick={e => e.stopPropagation()}
                              onChange={e => moveDealStage(deal.id, e.target.value as DealStage)}
                              className="text-[10px] bg-stone-50 border border-stone-200 rounded px-1 py-0.5 text-stone-600 focus:outline-hidden"
                            >
                              {stages.map(s => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List View */
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Deal Title</th>
                  <th className="py-3 px-4 font-semibold">Account</th>
                  <th className="py-3 px-4 font-semibold">Primary Contact</th>
                  <th className="py-3 px-4 font-semibold">Stage</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Close Target</th>
                  <th className="py-3 px-4 font-semibold text-right">Value</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDeals.map(deal => {
                  const company = getCompany(deal.companyId);
                  const contact = getContact(deal.contactId);

                  return (
                    <tr
                      key={deal.id}
                      className="hover:bg-orange-50/30 transition-colors group"
                    >
                      <td
                        onClick={() => setSelectedDealId(deal.id)}
                        className="py-3 px-4 font-semibold text-stone-900 group-hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        {deal.title}
                      </td>
                      <td className="py-3 px-4 text-stone-700">{company?.name || '—'}</td>
                      <td className="py-3 px-4 text-stone-600">
                        {contact ? `${contact.firstName} ${contact.lastName}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={deal.stage}
                          onChange={e => moveDealStage(deal.id, e.target.value as DealStage)}
                          className="px-2 py-1 text-xs rounded border border-stone-200 bg-white font-medium text-stone-800"
                        >
                          {stages.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {deal.priority ? (
                          <Badge priority={deal.priority} variant="priority">
                            {deal.priority}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-500 font-mono">
                        {formatDate(deal.expectedCloseDate)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900 tabular-nums">
                        {formatCurrency(deal.value)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDealId(deal.id)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                            title="View deal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDealToEdit(deal)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                            title="Edit deal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDealToDelete(deal)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete deal"
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

      {/* Add Deal Modal */}
      <DealFormModal
        isOpen={isAddModalOpen}
        defaultStage={addModalStage}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Deal Modal */}
      {dealToEdit && (
        <DealFormModal
          isOpen={true}
          dealToEdit={dealToEdit}
          onClose={() => setDealToEdit(null)}
        />
      )}

      {/* Details Modal */}
      {selectedDealId && (
        <DealDetailModal
          dealId={selectedDealId}
          onClose={() => setSelectedDealId(null)}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!dealToDelete}
        title="Delete Deal"
        message={`Are you sure you want to delete "${dealToDelete?.title}"? This cannot be undone and will update pipeline metrics immediately.`}
        confirmLabel="Delete Deal"
        onConfirm={() => {
          if (dealToDelete) {
            deleteDeal(dealToDelete.id);
            setDealToDelete(null);
          }
        }}
        onCancel={() => setDealToDelete(null)}
      />
    </div>
  );
};
