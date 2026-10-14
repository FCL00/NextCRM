export type DealStage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type DealPriority = 'Low' | 'Medium' | 'High';
export type ContactStatus = 'Lead' | 'Active' | 'Inactive';
export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Note' | 'Task';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  city: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  companyId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: ContactStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  userId: string;
  companyId?: string | null;
  contactId?: string | null;
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate: string;
  description?: string;
  priority?: DealPriority;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  contactId?: string | null;
  dealId?: string | null;
  title: string;
  type: ActivityType;
  description?: string;
  dueDate?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type AppView = 'landing' | 'overview' | 'contacts' | 'companies' | 'deals' | 'activities' | 'analytics';

export type AuthMode = 'signin' | 'signup' | 'forgot-password';
