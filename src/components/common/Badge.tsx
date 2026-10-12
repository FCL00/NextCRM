import React from 'react';
import { DealStage, ContactStatus, DealPriority, ActivityType } from '../../types/crm';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'stage' | 'status' | 'priority' | 'type' | 'default';
  stage?: DealStage;
  status?: ContactStatus;
  priority?: DealPriority;
  activityType?: ActivityType;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  stage,
  status,
  priority,
  activityType,
  className = '',
}) => {
  let styleClasses = 'bg-stone-100 text-stone-700 border-stone-200';

  if (variant === 'stage' && stage) {
    switch (stage) {
      case 'Lead':
        styleClasses = 'bg-stone-100 text-stone-700 border-stone-300';
        break;
      case 'Qualified':
        styleClasses = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'Proposal':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Negotiation':
        styleClasses = 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'Won':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Lost':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
    }
  } else if (variant === 'status' && status) {
    switch (status) {
      case 'Active':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Lead':
        styleClasses = 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'Inactive':
        styleClasses = 'bg-stone-100 text-stone-500 border-stone-200';
        break;
    }
  } else if (variant === 'priority' && priority) {
    switch (priority) {
      case 'High':
        styleClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        break;
      case 'Medium':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Low':
        styleClasses = 'bg-stone-100 text-stone-600 border-stone-200';
        break;
    }
  } else if (variant === 'type' && activityType) {
    switch (activityType) {
      case 'Call':
        styleClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Email':
        styleClasses = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'Meeting':
        styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Task':
        styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Note':
        styleClasses = 'bg-stone-100 text-stone-600 border-stone-200';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styleClasses} whitespace-nowrap shrink-0 ${className}`}
    >
      {children}
    </span>
  );
};
