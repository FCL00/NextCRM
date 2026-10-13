import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Company,
  Contact,
  Deal,
  Activity,
  DealStage,
  ContactStatus,
  ToastMessage,
  AppView,
} from '../types/crm';
import * as storage from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import * as supabaseService from '../services/supabaseService';

interface CrmContextType {
  // Auth state
  user: User | null;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemoUser: () => Promise<void>;

  // Supabase Status
  isSupabase: boolean;
  isConnectModalOpen: boolean;
  openConnectModal: () => void;
  closeConnectModal: () => void;

  // Data Collections (strictly isolated for active user)
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  hasData: boolean;
  isLoadingData: boolean;

  // Companies CRUD
  createCompany: (data: Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Company>;
  updateCompany: (id: string, data: Partial<Omit<Company, 'id' | 'userId' | 'createdAt'>>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;

  // Contacts CRUD
  createContact: (data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (id: string, data: Partial<Omit<Contact, 'id' | 'userId' | 'createdAt'>>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;

  // Deals CRUD
  createDeal: (data: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Deal>;
  updateDeal: (id: string, data: Partial<Omit<Deal, 'id' | 'userId' | 'createdAt'>>) => Promise<Deal>;
  moveDealStage: (id: string, stage: DealStage) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;

  // Activities CRUD
  createActivity: (data: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Activity>;
  updateActivity: (id: string, data: Partial<Omit<Activity, 'id' | 'userId' | 'createdAt'>>) => Promise<Activity>;
  toggleActivityCompleted: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  // Demo & Reset
  loadDemoData: (replace?: boolean) => Promise<void>;
  clearUserData: () => Promise<void>;

  // Metrics
  openPipelineValue: number;
  revenueWon: number;
  lostDealValue: number;
  totalContactsCount: number;
  totalCompaniesCount: number;
  dealsByStage: Record<DealStage, { count: number; value: number }>;
  contactsByStatus: Record<ContactStatus, number>;
  activitiesSummary: { total: number; open: number; overdue: number; completed: number };

  // Modals & UI States
  quickAddType: 'contact' | 'company' | 'deal' | 'activity' | null;
  openQuickAdd: (type: 'contact' | 'company' | 'deal' | 'activity') => void;
  closeQuickAdd: () => void;

  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  selectedDealId: string | null;
  setSelectedDealId: (id: string | null) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Helper getters
  getCompany: (id: string | null | undefined) => Company | undefined;
  getContact: (id: string | null | undefined) => Contact | undefined;
  getDeal: (id: string | null | undefined) => Deal | undefined;
  getCompanyStats: (companyId: string) => { contactCount: number; openDealValue: number };
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return storage.getCurrentUser();
  });
  const navigate = useNavigate();
  const location = useLocation();

  const activeView: AppView = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/contacts')) return 'contacts';
    if (path.startsWith('/companies')) return 'companies';
    if (path.startsWith('/deals')) return 'deals';
    if (path.startsWith('/activities')) return 'activities';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/dashboard') || path.startsWith('/overview')) return 'overview';
    return 'landing';
  }, [location.pathname]);

  const setActiveView = useCallback((view: AppView) => {
    if (view === 'overview') {
      navigate('/dashboard');
    } else if (view === 'landing') {
      navigate('/');
    } else {
      navigate(`/${view}`);
    }
  }, [navigate]);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // CRM Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // UI modal helpers
  const [quickAddType, setQuickAddType] = useState<'contact' | 'company' | 'deal' | 'activity' | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'tst_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Listen to Supabase Auth state changes if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Check existing session
    supabaseService.getSupabaseCurrentUser().then(currentUser => {
      if (currentUser) {
        setUser(currentUser);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = await supabaseService.getSupabaseCurrentUser();
        setUser(u);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Reload data for the active user (either from Supabase PostgreSQL or isolated storage)
  const reloadUserData = useCallback(async (userId: string) => {
    setIsLoadingData(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const [cmp, cnt, dls, act] = await Promise.all([
          supabaseService.fetchSupabaseCompanies(userId),
          supabaseService.fetchSupabaseContacts(userId),
          supabaseService.fetchSupabaseDeals(userId),
          supabaseService.fetchSupabaseActivities(userId),
        ]);
        setCompanies(cmp);
        setContacts(cnt);
        setDeals(dls);
        setActivities(act);
      } else {
        setCompanies(storage.getCompanies(userId));
        setContacts(storage.getContacts(userId));
        setDeals(storage.getDeals(userId));
        setActivities(storage.getActivities(userId));
      }
    } catch (err: any) {
      console.error('Error loading CRM data:', err);
      showToast('Error loading CRM records from database: ' + (err?.message || ''), 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      reloadUserData(user.id);
    } else {
      setCompanies([]);
      setContacts([]);
      setDeals([]);
      setActivities([]);
    }
  }, [user, reloadUserData]);

  // Auth Operations
  const signIn = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const loggedIn = await supabaseService.supabaseSignIn(email, pass);
      setUser(loggedIn);
      setIsAuthModalOpen(false);
      navigate('/dashboard');
      showToast(`Welcome back, ${loggedIn.name}! Connected to Supabase.`);
    } else {
      const loggedIn = await storage.signInUser(email, pass);
      setUser(loggedIn);
      setIsAuthModalOpen(false);
      navigate('/dashboard');
      showToast(`Welcome back, ${loggedIn.name}!`);
    }
  };

  const signUp = async (name: string, email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const created = await supabaseService.supabaseSignUp(name, email, pass);
      setUser(created);
      setIsAuthModalOpen(false);
      navigate('/dashboard');
      showToast(`Account created in Supabase Auth!`, 'success');
      // Populate initial demo records to Supabase for the user
      await loadDemoData(true);
    } else {
      const created = await storage.signUpUser(name, email, pass);
      storage.loadDemoData(created.id, true);
      setUser(created);
      setIsAuthModalOpen(false);
      navigate('/dashboard');
      showToast(`Account created! Sample CRM workspace loaded.`, 'success');
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabaseService.supabaseSignOut();
    } else {
      storage.signOutUser();
    }
    setUser(null);
    navigate('/');
    showToast('You have been signed out.');
  };

  const loginAsDemoUser = async () => {
    const demoEmail = 'alex.morgan@nextcrm.demo';
    const demoPass = 'DemoPass2026!';

    if (isSupabaseConfigured && supabase) {
      try {
        await signIn(demoEmail, demoPass);
      } catch {
        // Create demo account in Supabase if not exists
        await signUp('Alex Morgan', demoEmail, demoPass);
      }
    } else {
      const users = (JSON.parse(localStorage.getItem('nextcrm_users') || '[]') as any[]);
      let existingDemo = users.find((u: any) => u.email === demoEmail);

      if (!existingDemo) {
        existingDemo = await storage.signUpUser('Alex Morgan', demoEmail, demoPass);
        storage.loadDemoData(existingDemo.id, true);
      } else {
        storage.setCurrentUser(existingDemo);
      }

      setUser(existingDemo);
      setIsAuthModalOpen(false);
      navigate('/dashboard');
      showToast('Signed in to demo workspace as Alex Morgan');
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openConnectModal = () => setIsConnectModalOpen(true);
  const closeConnectModal = () => setIsConnectModalOpen(false);

  // Companies CRUD
  const createCompany = async (data: Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      const created = await supabaseService.createSupabaseCompany(user.id, data);
      setCompanies(prev => [created, ...prev]);
      showToast(`Company "${created.name}" created in Supabase`);
      return created;
    } else {
      const created = storage.createCompany(user.id, data);
      setCompanies(prev => [...prev, created]);
      showToast(`Company "${created.name}" created`);
      return created;
    }
  };

  const updateCompany = async (id: string, data: Partial<Omit<Company, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      const updated = await supabaseService.updateSupabaseCompany(user.id, id, data);
      setCompanies(prev => prev.map(c => (c.id === id ? updated : c)));
      showToast(`Company "${updated.name}" updated`);
      return updated;
    } else {
      const updated = storage.updateCompany(user.id, id, data);
      setCompanies(prev => prev.map(c => (c.id === id ? updated : c)));
      showToast(`Company "${updated.name}" updated`);
      return updated;
    }
  };

  const deleteCompany = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    const target = companies.find(c => c.id === id);
    if (isSupabaseConfigured && supabase) {
      await supabaseService.deleteSupabaseCompany(user.id, id);
    } else {
      storage.deleteCompany(user.id, id);
    }
    setCompanies(prev => prev.filter(c => c.id !== id));
    setContacts(prev => prev.map(c => (c.companyId === id ? { ...c, companyId: null } : c)));
    setDeals(prev => prev.map(d => (d.companyId === id ? { ...d, companyId: null } : d)));
    if (selectedCompanyId === id) setSelectedCompanyId(null);
    showToast(`Company "${target?.name || 'record'}" removed`, 'info');
  };

  // Contacts CRUD
  const createContact = async (data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      const created = await supabaseService.createSupabaseContact(user.id, data);
      setContacts(prev => [created, ...prev]);
      showToast(`Contact "${created.firstName} ${created.lastName}" added in Supabase`);
      return created;
    } else {
      const created = storage.createContact(user.id, data);
      setContacts(prev => [...prev, created]);
      showToast(`Contact "${created.firstName} ${created.lastName}" added`);
      return created;
    }
  };

  const updateContact = async (id: string, data: Partial<Omit<Contact, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      const updated = await supabaseService.updateSupabaseContact(user.id, id, data);
      setContacts(prev => prev.map(c => (c.id === id ? updated : c)));
      showToast(`Contact updated in Supabase`);
      return updated;
    } else {
      const updated = storage.updateContact(user.id, id, data);
      setContacts(prev => prev.map(c => (c.id === id ? updated : c)));
      showToast(`Contact updated`);
      return updated;
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    const target = contacts.find(c => c.id === id);
    if (isSupabaseConfigured && supabase) {
      await supabaseService.deleteSupabaseContact(user.id, id);
    } else {
      storage.deleteContact(user.id, id);
    }
    setContacts(prev => prev.filter(c => c.id !== id));
    setDeals(prev => prev.map(d => (d.contactId === id ? { ...d, contactId: null } : d)));
    setActivities(prev => prev.map(a => (a.contactId === id ? { ...a, contactId: null } : a)));
    if (selectedContactId === id) setSelectedContactId(null);
    showToast(`Contact "${target?.firstName} ${target?.lastName}" removed`, 'info');
  };

  // Deals CRUD
  const createDeal = async (data: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      const created = await supabaseService.createSupabaseDeal(user.id, data);
      setDeals(prev => [created, ...prev]);
      showToast(`Deal "${created.title}" saved to Supabase`);
      return created;
    } else {
      const created = storage.createDeal(user.id, data);
      setDeals(prev => [...prev, created]);
      showToast(`Deal "${created.title}" added to pipeline`);
      return created;
    }
  };

  const updateDeal = async (id: string, data: Partial<Omit<Deal, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      const updated = await supabaseService.updateSupabaseDeal(user.id, id, data);
      setDeals(prev => prev.map(d => (d.id === id ? updated : d)));
      showToast(`Deal updated in Supabase`);
      return updated;
    } else {
      const updated = storage.updateDeal(user.id, id, data);
      setDeals(prev => prev.map(d => (d.id === id ? updated : d)));
      showToast(`Deal updated`);
      return updated;
    }
  };

  const moveDealStage = async (id: string, stage: DealStage) => {
    if (!user) throw new Error('Authentication required');
    try {
      if (isSupabaseConfigured && supabase) {
        const updated = await supabaseService.updateSupabaseDeal(user.id, id, { stage });
        setDeals(prev => prev.map(d => (d.id === id ? updated : d)));
      } else {
        const updated = storage.updateDealStage(user.id, id, stage);
        setDeals(prev => prev.map(d => (d.id === id ? updated : d)));
      }
      showToast(`Deal moved to ${stage}`);
    } catch {
      showToast('Failed to update deal stage', 'error');
    }
  };

  const deleteDeal = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    const target = deals.find(d => d.id === id);
    if (isSupabaseConfigured && supabase) {
      await supabaseService.deleteSupabaseDeal(user.id, id);
    } else {
      storage.deleteDeal(user.id, id);
    }
    setDeals(prev => prev.filter(d => d.id !== id));
    setActivities(prev => prev.map(a => (a.dealId === id ? { ...a, dealId: null } : a)));
    if (selectedDealId === id) setSelectedDealId(null);
    showToast(`Deal "${target?.title || 'record'}" removed`, 'info');
  };

  // Activities CRUD
  const createActivity = async (data: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      const created = await supabaseService.createSupabaseActivity(user.id, data);
      setActivities(prev => [created, ...prev]);
      showToast(`Activity "${created.title}" recorded in Supabase`);
      return created;
    } else {
      const created = storage.createActivity(user.id, data);
      setActivities(prev => [created, ...prev]);
      showToast(`Activity "${created.title}" scheduled`);
      return created;
    }
  };

  const updateActivity = async (id: string, data: Partial<Omit<Activity, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      const updated = await supabaseService.updateSupabaseActivity(user.id, id, data);
      setActivities(prev => prev.map(a => (a.id === id ? updated : a)));
      showToast(`Activity updated`);
      return updated;
    } else {
      const updated = storage.updateActivity(user.id, id, data);
      setActivities(prev => prev.map(a => (a.id === id ? updated : a)));
      showToast(`Activity updated`);
      return updated;
    }
  };

  const toggleActivityCompleted = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    const item = activities.find(a => a.id === id);
    if (!item) return;

    if (isSupabaseConfigured && supabase) {
      const updated = await supabaseService.updateSupabaseActivity(user.id, id, { completed: !item.completed });
      setActivities(prev => prev.map(a => (a.id === id ? updated : a)));
      showToast(updated.completed ? 'Activity marked as completed' : 'Activity marked as open');
    } else {
      const updated = storage.toggleActivityCompleted(user.id, id);
      setActivities(prev => prev.map(a => (a.id === id ? updated : a)));
      showToast(updated.completed ? 'Activity marked as completed' : 'Activity marked as open');
    }
  };

  const deleteActivity = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    if (isSupabaseConfigured && supabase) {
      await supabaseService.deleteSupabaseActivity(user.id, id);
    } else {
      storage.deleteActivity(user.id, id);
    }
    setActivities(prev => prev.filter(a => a.id !== id));
    showToast('Activity deleted', 'info');
  };

  // Demo Data loading
  const loadDemoData = async (replace = true) => {
    if (!user) return;
    if (isSupabaseConfigured && supabase) {
      // Create records in Supabase
      try {
        const c1 = await supabaseService.createSupabaseCompany(user.id, {
          name: 'Apex Logic Inc.',
          industry: 'Technology',
          website: 'https://apexlogic.io',
          phone: '+1 (415) 882-9012',
          city: 'San Francisco, CA',
          notes: 'Series B cloud infrastructure platform.',
        });
        const c2 = await supabaseService.createSupabaseCompany(user.id, {
          name: 'Vanguard Retail Co.',
          industry: 'Retail',
          website: 'https://vanguardretail.com',
          phone: '+1 (312) 604-3320',
          city: 'Chicago, IL',
          notes: 'Omnichannel lifestyle retailer expanding into 30 new stores.',
        });
        const c3 = await supabaseService.createSupabaseCompany(user.id, {
          name: 'Nordic Health Systems',
          industry: 'Healthcare',
          website: 'https://nordichealth.org',
          phone: '+1 (612) 390-1120',
          city: 'Minneapolis, MN',
          notes: 'Regional healthcare provider network.',
        });
        const c4 = await supabaseService.createSupabaseCompany(user.id, {
          name: 'Beacon Academies',
          industry: 'Education',
          website: 'https://beaconacademies.edu',
          phone: '+1 (617) 542-9981',
          city: 'Boston, MA',
          notes: 'Non-profit STEM academy network.',
        });
        const c5 = await supabaseService.createSupabaseCompany(user.id, {
          name: 'Summit Financial Partners',
          industry: 'Professional Services',
          website: 'https://summitpartners.co',
          phone: '+1 (212) 755-4009',
          city: 'New York, NY',
          notes: 'Boutique advisory firm managing commercial debt restructuring.',
        });

        // Contacts
        const cnt1 = await supabaseService.createSupabaseContact(user.id, {
          companyId: c1.id,
          firstName: 'Elena',
          lastName: 'Rostova',
          email: 'elena.rostova@apexlogic.io',
          phone: '+1 (415) 882-9014',
          jobTitle: 'VP of Engineering',
          status: 'Active',
        });
        const cnt2 = await supabaseService.createSupabaseContact(user.id, {
          companyId: c2.id,
          firstName: 'Sarah',
          lastName: 'Jenkins',
          email: 'sjenkins@vanguardretail.com',
          phone: '+1 (312) 604-3325',
          jobTitle: 'Chief Commercial Officer',
          status: 'Active',
        });
        const cnt3 = await supabaseService.createSupabaseContact(user.id, {
          companyId: c3.id,
          firstName: 'Dr. Evelyn',
          lastName: 'Vance',
          email: 'evance@nordichealth.org',
          phone: '+1 (612) 390-1124',
          jobTitle: 'Chief Medical Information Officer',
          status: 'Active',
        });

        // Deals across stages
        await supabaseService.createSupabaseDeal(user.id, {
          companyId: c1.id,
          contactId: cnt1.id,
          title: 'Cloud Fleet Observability Expansion',
          value: 85000,
          stage: 'Proposal',
          expectedCloseDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
          priority: 'High',
        });
        await supabaseService.createSupabaseDeal(user.id, {
          companyId: c2.id,
          contactId: cnt2.id,
          title: 'Retail POS Unified Data Hub',
          value: 72000,
          stage: 'Negotiation',
          expectedCloseDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          priority: 'High',
        });
        await supabaseService.createSupabaseDeal(user.id, {
          companyId: c3.id,
          contactId: cnt3.id,
          title: 'Clinical Communications & Care Platform',
          value: 120000,
          stage: 'Won',
          expectedCloseDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
          priority: 'High',
        });

        // Activity
        await supabaseService.createSupabaseActivity(user.id, {
          contactId: cnt1.id,
          title: 'Executive Architecture Review Meeting',
          type: 'Meeting',
          description: 'Deep dive on cluster scaling and SOC 2 requirements.',
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
          completed: false,
        });

        await reloadUserData(user.id);
        showToast('Sample records created in your Supabase database!');
      } catch (err: any) {
        showToast('Could not insert sample data into Supabase: ' + err?.message, 'error');
      }
    } else {
      const res = storage.loadDemoData(user.id, replace);
      setCompanies(res.companies);
      setContacts(res.contacts);
      setDeals(res.deals);
      setActivities(res.activities);
      showToast('Demo data loaded successfully!');
    }
  };

  const clearUserData = async () => {
    if (!user) return;
    if (isSupabaseConfigured && supabase) {
      await Promise.all([
        ...companies.map(c => supabaseService.deleteSupabaseCompany(user.id, c.id)),
        ...contacts.map(c => supabaseService.deleteSupabaseContact(user.id, c.id)),
        ...deals.map(d => supabaseService.deleteSupabaseDeal(user.id, d.id)),
        ...activities.map(a => supabaseService.deleteSupabaseActivity(user.id, a.id)),
      ]);
      setCompanies([]);
      setContacts([]);
      setDeals([]);
      setActivities([]);
      showToast('All Supabase records cleared', 'info');
    } else {
      storage.resetUserData(user.id);
      setCompanies([]);
      setContacts([]);
      setDeals([]);
      setActivities([]);
      showToast('All workspace records cleared', 'info');
    }
  };

  // Live Metrics Calculations
  const openPipelineValue = useMemo(() => {
    return deals
      .filter(d => ['Lead', 'Qualified', 'Proposal', 'Negotiation'].includes(d.stage))
      .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  }, [deals]);

  const revenueWon = useMemo(() => {
    return deals
      .filter(d => d.stage === 'Won')
      .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  }, [deals]);

  const lostDealValue = useMemo(() => {
    return deals
      .filter(d => d.stage === 'Lost')
      .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  }, [deals]);

  const totalContactsCount = contacts.length;
  const totalCompaniesCount = companies.length;

  const dealsByStage = useMemo(() => {
    const initial: Record<DealStage, { count: number; value: number }> = {
      Lead: { count: 0, value: 0 },
      Qualified: { count: 0, value: 0 },
      Proposal: { count: 0, value: 0 },
      Negotiation: { count: 0, value: 0 },
      Won: { count: 0, value: 0 },
      Lost: { count: 0, value: 0 },
    };
    return deals.reduce((acc, deal) => {
      if (acc[deal.stage]) {
        acc[deal.stage].count += 1;
        acc[deal.stage].value += Number(deal.value) || 0;
      }
      return acc;
    }, initial);
  }, [deals]);

  const contactsByStatus = useMemo(() => {
    const counts: Record<ContactStatus, number> = {
      Lead: 0,
      Active: 0,
      Inactive: 0,
    };
    contacts.forEach(c => {
      if (counts[c.status] !== undefined) {
        counts[c.status] += 1;
      }
    });
    return counts;
  }, [contacts]);

  const activitiesSummary = useMemo(() => {
    const now = new Date().getTime();
    let open = 0;
    let completed = 0;
    let overdue = 0;

    activities.forEach(a => {
      if (a.completed) {
        completed += 1;
      } else {
        open += 1;
        if (a.dueDate && new Date(a.dueDate).getTime() < now) {
          overdue += 1;
        }
      }
    });

    return { total: activities.length, open, completed, overdue };
  }, [activities]);

  const hasData = companies.length > 0 || contacts.length > 0 || deals.length > 0;

  // Helpers
  const getCompany = useCallback((id: string | null | undefined) => {
    if (!id) return undefined;
    return companies.find(c => c.id === id);
  }, [companies]);

  const getContact = useCallback((id: string | null | undefined) => {
    if (!id) return undefined;
    return contacts.find(c => c.id === id);
  }, [contacts]);

  const getDeal = useCallback((id: string | null | undefined) => {
    if (!id) return undefined;
    return deals.find(d => d.id === id);
  }, [deals]);

  const getCompanyStats = useCallback((companyId: string) => {
    const contactCount = contacts.filter(c => c.companyId === companyId).length;
    const openDealValue = deals
      .filter(d => d.companyId === companyId && !['Won', 'Lost'].includes(d.stage))
      .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    return { contactCount, openDealValue };
  }, [contacts, deals]);

  const openQuickAdd = (type: 'contact' | 'company' | 'deal' | 'activity') => {
    setQuickAddType(type);
  };

  const closeQuickAdd = () => {
    setQuickAddType(null);
  };

  return (
    <CrmContext.Provider
      value={{
        user,
        activeView,
        setActiveView,
        authMode,
        setAuthMode,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        loginAsDemoUser,

        isSupabase: isSupabaseConfigured,
        isConnectModalOpen,
        openConnectModal,
        closeConnectModal,

        companies,
        contacts,
        deals,
        activities,
        hasData,
        isLoadingData,

        createCompany,
        updateCompany,
        deleteCompany,

        createContact,
        updateContact,
        deleteContact,

        createDeal,
        updateDeal,
        moveDealStage,
        deleteDeal,

        createActivity,
        updateActivity,
        toggleActivityCompleted,
        deleteActivity,

        loadDemoData,
        clearUserData,

        openPipelineValue,
        revenueWon,
        lostDealValue,
        totalContactsCount,
        totalCompaniesCount,
        dealsByStage,
        contactsByStatus,
        activitiesSummary,

        quickAddType,
        openQuickAdd,
        closeQuickAdd,

        selectedContactId,
        setSelectedContactId,
        selectedCompanyId,
        setSelectedCompanyId,
        selectedDealId,
        setSelectedDealId,

        toasts,
        showToast,
        removeToast,

        getCompany,
        getContact,
        getDeal,
        getCompanyStats,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) throw new Error('useCrm must be used within a CrmProvider');
  return context;
};
