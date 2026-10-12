import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Activity, ActivityType } from '../../types/crm';
import { formatDate } from '../../services/storage';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ActivityFormModal } from './ActivityFormModal';
import { EmptyState } from '../common/EmptyState';
import {
  CalendarCheck,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  Clock,
  Edit2,
  Trash2,
  User,
  Kanban,
  AlertCircle,
} from 'lucide-react';

export const ActivitiesView: React.FC = () => {
  const {
    activities,
    activitiesSummary,
    getContact,
    getDeal,
    toggleActivityCompleted,
    deleteActivity,
    loadDemoData,
    setSelectedContactId,
    setSelectedDealId,
    setActiveView,
  } = useCrm();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Done' | 'Overdue'>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-purple-600" />;
      case 'Meeting':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'Task':
        return <CheckSquare className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-stone-600" />;
    }
  };

  const nowTime = new Date().getTime();

  // Filter & Search
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // Type filter
      if (selectedType !== 'All' && act.type !== selectedType) return false;

      // Status filter
      const isOverdue = !act.completed && act.dueDate && new Date(act.dueDate).getTime() < nowTime;
      if (statusFilter === 'Open' && act.completed) return false;
      if (statusFilter === 'Done' && !act.completed) return false;
      if (statusFilter === 'Overdue' && !isOverdue) return false;

      // Text search
      const q = search.toLowerCase().trim();
      if (!q) return true;

      const contact = getContact(act.contactId);
      const deal = getDeal(act.dealId);
      const title = act.title.toLowerCase();
      const desc = (act.description || '').toLowerCase();
      const contactName = contact ? `${contact.firstName} ${contact.lastName}`.toLowerCase() : '';
      const dealTitle = (deal?.title || '').toLowerCase();

      return (
        title.includes(q) || desc.includes(q) || contactName.includes(q) || dealTitle.includes(q)
      );
    });
  }, [activities, selectedType, statusFilter, search, nowTime, getContact, getDeal]);

  const resetFilters = () => {
    setSearch('');
    setSelectedType('All');
    setStatusFilter('All');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Activities & Tasks</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Log calls, emails, customer meetings, and track follow-up deadlines.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Activity</span>
        </button>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'All'
              ? 'bg-white border-stone-300 ring-2 ring-stone-400/20 shadow-xs'
              : 'bg-white/70 border-stone-200 hover:bg-white'
          }`}
        >
          <span className="text-[11px] font-semibold text-stone-500 block uppercase">
            Total Logged
          </span>
          <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
            {activitiesSummary.total}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('Open')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Open'
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-400/20 shadow-xs'
              : 'bg-white border-stone-200 hover:bg-orange-50/40'
          }`}
        >
          <span className="text-[11px] font-semibold text-orange-700 block uppercase">
            Open Tasks
          </span>
          <span className="text-xl font-bold font-mono text-orange-700 tabular-nums">
            {activitiesSummary.open}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('Overdue')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Overdue'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
              : 'bg-white border-stone-200 hover:bg-rose-50/40'
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-700 block uppercase">
            Overdue
          </span>
          <span className="text-xl font-bold font-mono text-rose-600 tabular-nums">
            {activitiesSummary.overdue}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('Done')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Done'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
              : 'bg-white border-stone-200 hover:bg-emerald-50/40'
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-700 block uppercase">
            Completed
          </span>
          <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {activitiesSummary.completed}
          </span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search activities by title, notes, contact, deal..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Call', 'Email', 'Meeting', 'Task', 'Note'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedType(tab)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedType === tab
                  ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab}
            </button>
          ))}

          {(search || selectedType !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={resetFilters}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium ml-2 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Activities Timeline List */}
      {activities.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No activities recorded"
          description="Log customer meetings, calls, tasks, or follow-ups to keep your pipeline active."
          actionLabel="Schedule Activity"
          onAction={() => setIsAddModalOpen(true)}
          secondaryActionLabel="Load Sample Activities"
          onSecondaryAction={() => loadDemoData(true)}
        />
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-stone-200 text-center">
          <p className="text-sm text-stone-600 mb-3">No activities match your active search or filters.</p>
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map(act => {
            const contact = getContact(act.contactId);
            const deal = getDeal(act.dealId);
            const isOverdue =
              !act.completed && act.dueDate && new Date(act.dueDate).getTime() < nowTime;

            return (
              <div
                key={act.id}
                className={`p-4 rounded-xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  act.completed
                    ? 'border-stone-200 opacity-75 bg-stone-50/50'
                    : isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-400/20 bg-rose-50/20'
                    : 'border-stone-200 hover:border-orange-200 shadow-2xs'
                }`}
              >
                {/* Checkbox + Title + Meta */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleActivityCompleted(act.id)}
                    className="mt-1 text-stone-400 hover:text-orange-600 transition-colors shrink-0"
                    aria-label={act.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {act.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="p-1 rounded-md bg-stone-100 shrink-0">
                        {getActivityIcon(act.type)}
                      </span>
                      <h4
                        className={`text-sm font-semibold truncate ${
                          act.completed ? 'line-through text-stone-500' : 'text-stone-900'
                        }`}
                      >
                        {act.title}
                      </h4>
                      <Badge activityType={act.type} variant="type">
                        {act.type}
                      </Badge>
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>OVERDUE</span>
                        </span>
                      )}
                    </div>

                    {act.description && (
                      <p className="text-xs text-stone-600 mb-2 leading-relaxed line-clamp-2">
                        {act.description}
                      </p>
                    )}

                    {/* Linked entities */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      {contact && (
                        <button
                          onClick={() => {
                            setSelectedContactId(contact.id);
                            setActiveView('contacts');
                          }}
                          className="flex items-center gap-1 hover:text-orange-600 transition-colors font-medium"
                        >
                          <User className="w-3 h-3 text-stone-400" />
                          <span>
                            {contact.firstName} {contact.lastName}
                          </span>
                        </button>
                      )}

                      {deal && (
                        <button
                          onClick={() => {
                            setSelectedDealId(deal.id);
                            setActiveView('deals');
                          }}
                          className="flex items-center gap-1 hover:text-orange-600 transition-colors font-medium"
                        >
                          <Kanban className="w-3 h-3 text-stone-400" />
                          <span className="truncate max-w-[200px]">{deal.title}</span>
                        </button>
                      )}

                      {act.dueDate && (
                        <span
                          className={`flex items-center gap-1 text-[11px] ${
                            isOverdue ? 'text-rose-600 font-bold' : 'text-stone-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Due: {formatDate(act.dueDate)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <button
                    onClick={() => setActivityToEdit(act)}
                    className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                    title="Edit activity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActivityToDelete(act)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Delete activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <ActivityFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      {activityToEdit && (
        <ActivityFormModal
          isOpen={true}
          activityToEdit={activityToEdit}
          onClose={() => setActivityToEdit(null)}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!activityToDelete}
        title="Delete Activity"
        message={`Are you sure you want to remove "${activityToDelete?.title}"?`}
        confirmLabel="Delete Activity"
        onConfirm={() => {
          if (activityToDelete) {
            deleteActivity(activityToDelete.id);
            setActivityToDelete(null);
          }
        }}
        onCancel={() => setActivityToDelete(null)}
      />
    </div>
  );
};
