import { Company, Contact, Deal, Activity, User, DealStage } from '../types/crm';

// LocalStorage Keys
const USERS_KEY = 'nextcrm_users';
const CURRENT_USER_KEY = 'nextcrm_session_user';
const COMPANIES_KEY = 'nextcrm_companies';
const CONTACTS_KEY = 'nextcrm_contacts';
const DEALS_KEY = 'nextcrm_deals';
const ACTIVITIES_KEY = 'nextcrm_activities';

// Secure SHA-256 hash helper using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'nextcrm_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface StoredUser extends User {
  passwordHash: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Session Management
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Authentication Service
export async function signUpUser(name: string, email: string, password: string): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!name.trim()) throw new Error('Full name is required.');
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new Error('Please provide a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = getStoredUsers();
  if (users.some(u => u.email === trimmedEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const passwordHash = await hashPassword(password);
  const newUser: StoredUser = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    email: trimmedEmail,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const { passwordHash: _, ...safeUser } = newUser;
  setCurrentUser(safeUser);
  return safeUser;
}

export async function signInUser(email: string, password: string): Promise<User> {
  const trimmedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find(u => u.email === trimmedEmail);

  if (!user) {
    throw new Error('No account found with this email. Please check or sign up.');
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    throw new Error('Incorrect password. Please try again.');
  }

  const { passwordHash: _, ...safeUser } = user;
  setCurrentUser(safeUser);
  return safeUser;
}

export function signOutUser(): void {
  setCurrentUser(null);
}

// Generic Storage Handlers for User-Isolated CRM Data
function getCollection<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCollection<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// Companies CRUD (Strictly user-isolated)
export function getCompanies(userId: string): Company[] {
  const all = getCollection<Company>(COMPANIES_KEY);
  return all.filter(c => c.userId === userId);
}

export function createCompany(userId: string, data: Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Company {
  const all = getCollection<Company>(COMPANIES_KEY);
  const now = new Date().toISOString();
  const newCompany: Company = {
    ...data,
    id: 'cmp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  all.push(newCompany);
  setCollection(COMPANIES_KEY, all);
  return newCompany;
}

export function updateCompany(userId: string, id: string, data: Partial<Omit<Company, 'id' | 'userId' | 'createdAt'>>): Company {
  const all = getCollection<Company>(COMPANIES_KEY);
  const index = all.findIndex(c => c.id === id && c.userId === userId);
  if (index === -1) throw new Error('Company not found or access denied.');

  const updated: Company = {
    ...all[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  setCollection(COMPANIES_KEY, all);
  return updated;
}

export function deleteCompany(userId: string, id: string): void {
  const all = getCollection<Company>(COMPANIES_KEY);
  const filtered = all.filter(c => !(c.id === id && c.userId === userId));
  setCollection(COMPANIES_KEY, filtered);

  // Safely dissociate companyId from contacts and deals without deleting them
  const contacts = getCollection<Contact>(CONTACTS_KEY);
  const updatedContacts = contacts.map(c => (c.userId === userId && c.companyId === id ? { ...c, companyId: null, updatedAt: new Date().toISOString() } : c));
  setCollection(CONTACTS_KEY, updatedContacts);

  const deals = getCollection<Deal>(DEALS_KEY);
  const updatedDeals = deals.map(d => (d.userId === userId && d.companyId === id ? { ...d, companyId: null, updatedAt: new Date().toISOString() } : d));
  setCollection(DEALS_KEY, updatedDeals);
}

// Contacts CRUD (Strictly user-isolated)
export function getContacts(userId: string): Contact[] {
  const all = getCollection<Contact>(CONTACTS_KEY);
  return all.filter(c => c.userId === userId);
}

export function createContact(userId: string, data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Contact {
  const all = getCollection<Contact>(CONTACTS_KEY);
  const now = new Date().toISOString();
  const newContact: Contact = {
    ...data,
    id: 'cnt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  all.push(newContact);
  setCollection(CONTACTS_KEY, all);
  return newContact;
}

export function updateContact(userId: string, id: string, data: Partial<Omit<Contact, 'id' | 'userId' | 'createdAt'>>): Contact {
  const all = getCollection<Contact>(CONTACTS_KEY);
  const index = all.findIndex(c => c.id === id && c.userId === userId);
  if (index === -1) throw new Error('Contact not found or access denied.');

  const updated: Contact = {
    ...all[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  setCollection(CONTACTS_KEY, all);
  return updated;
}

export function deleteContact(userId: string, id: string): void {
  const all = getCollection<Contact>(CONTACTS_KEY);
  const filtered = all.filter(c => !(c.id === id && c.userId === userId));
  setCollection(CONTACTS_KEY, filtered);

  // Safely unlink from deals & activities
  const deals = getCollection<Deal>(DEALS_KEY);
  const updatedDeals = deals.map(d => (d.userId === userId && d.contactId === id ? { ...d, contactId: null, updatedAt: new Date().toISOString() } : d));
  setCollection(DEALS_KEY, updatedDeals);

  const activities = getCollection<Activity>(ACTIVITIES_KEY);
  const updatedActivities = activities.map(a => (a.userId === userId && a.contactId === id ? { ...a, contactId: null, updatedAt: new Date().toISOString() } : a));
  setCollection(ACTIVITIES_KEY, updatedActivities);
}

// Deals CRUD (Strictly user-isolated)
export function getDeals(userId: string): Deal[] {
  const all = getCollection<Deal>(DEALS_KEY);
  return all.filter(d => d.userId === userId);
}

export function createDeal(userId: string, data: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Deal {
  const all = getCollection<Deal>(DEALS_KEY);
  const now = new Date().toISOString();
  const newDeal: Deal = {
    ...data,
    id: 'del_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  all.push(newDeal);
  setCollection(DEALS_KEY, all);
  return newDeal;
}

export function updateDeal(userId: string, id: string, data: Partial<Omit<Deal, 'id' | 'userId' | 'createdAt'>>): Deal {
  const all = getCollection<Deal>(DEALS_KEY);
  const index = all.findIndex(d => d.id === id && d.userId === userId);
  if (index === -1) throw new Error('Deal not found or access denied.');

  const updated: Deal = {
    ...all[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  setCollection(DEALS_KEY, all);
  return updated;
}

export function updateDealStage(userId: string, id: string, stage: DealStage): Deal {
  return updateDeal(userId, id, { stage });
}

export function deleteDeal(userId: string, id: string): void {
  const all = getCollection<Deal>(DEALS_KEY);
  const filtered = all.filter(d => !(d.id === id && d.userId === userId));
  setCollection(DEALS_KEY, filtered);

  // Unlink activities from deal
  const activities = getCollection<Activity>(ACTIVITIES_KEY);
  const updatedActivities = activities.map(a => (a.userId === userId && a.dealId === id ? { ...a, dealId: null, updatedAt: new Date().toISOString() } : a));
  setCollection(ACTIVITIES_KEY, updatedActivities);
}

// Activities CRUD (Strictly user-isolated)
export function getActivities(userId: string): Activity[] {
  const all = getCollection<Activity>(ACTIVITIES_KEY);
  return all.filter(a => a.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createActivity(userId: string, data: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Activity {
  const all = getCollection<Activity>(ACTIVITIES_KEY);
  const now = new Date().toISOString();
  const newActivity: Activity = {
    ...data,
    id: 'act_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  all.push(newActivity);
  setCollection(ACTIVITIES_KEY, all);
  return newActivity;
}

export function updateActivity(userId: string, id: string, data: Partial<Omit<Activity, 'id' | 'userId' | 'createdAt'>>): Activity {
  const all = getCollection<Activity>(ACTIVITIES_KEY);
  const index = all.findIndex(a => a.id === id && a.userId === userId);
  if (index === -1) throw new Error('Activity not found or access denied.');

  const updated: Activity = {
    ...all[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  setCollection(ACTIVITIES_KEY, all);
  return updated;
}

export function toggleActivityCompleted(userId: string, id: string): Activity {
  const all = getCollection<Activity>(ACTIVITIES_KEY);
  const item = all.find(a => a.id === id && a.userId === userId);
  if (!item) throw new Error('Activity not found.');
  return updateActivity(userId, id, { completed: !item.completed });
}

export function deleteActivity(userId: string, id: string): void {
  const all = getCollection<Activity>(ACTIVITIES_KEY);
  const filtered = all.filter(a => !(a.id === id && a.userId === userId));
  setCollection(ACTIVITIES_KEY, filtered);
}

// Check if user already has data
export function hasUserData(userId: string): boolean {
  const companies = getCompanies(userId);
  const contacts = getContacts(userId);
  const deals = getDeals(userId);
  return companies.length > 0 || contacts.length > 0 || deals.length > 0;
}

// Reset / Clear user's data
export function resetUserData(userId: string): void {
  const allCompanies = getCollection<Company>(COMPANIES_KEY).filter(c => c.userId !== userId);
  setCollection(COMPANIES_KEY, allCompanies);

  const allContacts = getCollection<Contact>(CONTACTS_KEY).filter(c => c.userId !== userId);
  setCollection(CONTACTS_KEY, allContacts);

  const allDeals = getCollection<Deal>(DEALS_KEY).filter(d => d.userId !== userId);
  setCollection(DEALS_KEY, allDeals);

  const allActivities = getCollection<Activity>(ACTIVITIES_KEY).filter(a => a.userId !== userId);
  setCollection(ACTIVITIES_KEY, allActivities);
}

// Load Rich Demo Data (5 companies, 10 contacts, 10 deals across 6 stages, 8 activities)
export function loadDemoData(userId: string, replaceExisting = true): {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
} {
  if (replaceExisting) {
    resetUserData(userId);
  }

  const now = new Date();
  const dateStr = (offsetDays: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };
  const timeIsoStr = (offsetDays: number, hours = 10) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString();
  };

  // 1. Five Companies across realistic industries
  const company1Id = 'cmp_tech_' + Math.random().toString(36).substring(2, 6);
  const company2Id = 'cmp_ret_' + Math.random().toString(36).substring(2, 6);
  const company3Id = 'cmp_hlth_' + Math.random().toString(36).substring(2, 6);
  const company4Id = 'cmp_edu_' + Math.random().toString(36).substring(2, 6);
  const company5Id = 'cmp_prof_' + Math.random().toString(36).substring(2, 6);

  const demoCompanies: Company[] = [
    {
      id: company1Id,
      userId,
      name: 'Apex Logic Inc.',
      industry: 'Technology',
      website: 'https://apexlogic.io',
      phone: '+1 (415) 882-9012',
      city: 'San Francisco, CA',
      address: '420 Montgomery St, Suite 700',
      notes: 'Series B cloud infrastructure platform. Fast-growing engineering team evaluating enterprise pipeline tools.',
      createdAt: timeIsoStr(-45),
      updatedAt: timeIsoStr(-2),
    },
    {
      id: company2Id,
      userId,
      name: 'Vanguard Retail Co.',
      industry: 'Retail',
      website: 'https://vanguardretail.com',
      phone: '+1 (312) 604-3320',
      city: 'Chicago, IL',
      address: '233 S Wacker Dr',
      notes: 'Omnichannel lifestyle retailer expanding into 30 new physical stores and unifying ecommerce POS.',
      createdAt: timeIsoStr(-40),
      updatedAt: timeIsoStr(-4),
    },
    {
      id: company3Id,
      userId,
      name: 'Nordic Health Systems',
      industry: 'Healthcare',
      website: 'https://nordichealth.org',
      phone: '+1 (612) 390-1120',
      city: 'Minneapolis, MN',
      address: '900 Nicollet Mall',
      notes: 'Regional healthcare provider network with strict HIPAA compliance requirements.',
      createdAt: timeIsoStr(-35),
      updatedAt: timeIsoStr(-1),
    },
    {
      id: company4Id,
      userId,
      name: 'Beacon Academies',
      industry: 'Education',
      website: 'https://beaconacademies.edu',
      phone: '+1 (617) 542-9981',
      city: 'Boston, MA',
      address: '150 Cambridge St',
      notes: 'Non-profit STEM academy network scaling student enrollment software and donor tracking.',
      createdAt: timeIsoStr(-30),
      updatedAt: timeIsoStr(-7),
    },
    {
      id: company5Id,
      userId,
      name: 'Summit Financial Partners',
      industry: 'Professional Services',
      website: 'https://summitpartners.co',
      phone: '+1 (212) 755-4009',
      city: 'New York, NY',
      address: '375 Park Ave',
      notes: 'Boutique advisory firm managing commercial debt restructuring and asset optimization.',
      createdAt: timeIsoStr(-25),
      updatedAt: timeIsoStr(-5),
    },
  ];

  // 2. Ten Contacts linked to the companies
  const contactIds = Array.from({ length: 10 }, (_, i) => 'cnt_demo_' + (i + 1) + '_' + Math.random().toString(36).substring(2, 6));

  const demoContacts: Contact[] = [
    {
      id: contactIds[0],
      userId,
      companyId: company1Id,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@apexlogic.io',
      phone: '+1 (415) 882-9014',
      jobTitle: 'VP of Engineering',
      status: 'Active',
      notes: 'Key executive sponsor for developer tooling procurement.',
      createdAt: timeIsoStr(-35),
      updatedAt: timeIsoStr(-2),
    },
    {
      id: contactIds[1],
      userId,
      companyId: company1Id,
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'm.chen@apexlogic.io',
      phone: '+1 (415) 882-9018',
      jobTitle: 'Head of Operations',
      status: 'Active',
      notes: 'Manages quarterly SaaS budgets and internal rollout schedules.',
      createdAt: timeIsoStr(-30),
      updatedAt: timeIsoStr(-6),
    },
    {
      id: contactIds[2],
      userId,
      companyId: company2Id,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sjenkins@vanguardretail.com',
      phone: '+1 (312) 604-3325',
      jobTitle: 'Chief Commercial Officer',
      status: 'Active',
      notes: 'Evaluating POS synchronization across 30 flagship stores.',
      createdAt: timeIsoStr(-28),
      updatedAt: timeIsoStr(-3),
    },
    {
      id: contactIds[3],
      userId,
      companyId: company2Id,
      firstName: 'David',
      lastName: 'Miller',
      email: 'dmiller@vanguardretail.com',
      phone: '+1 (312) 604-3329',
      jobTitle: 'Procurement Director',
      status: 'Lead',
      notes: 'Requested contract revisions and volume discount schedule.',
      createdAt: timeIsoStr(-20),
      updatedAt: timeIsoStr(-8),
    },
    {
      id: contactIds[4],
      userId,
      companyId: company3Id,
      firstName: 'Dr. Evelyn',
      lastName: 'Vance',
      email: 'evance@nordichealth.org',
      phone: '+1 (612) 390-1124',
      jobTitle: 'Chief Medical Information Officer',
      status: 'Active',
      notes: 'Signed off on clinical pilot security and business associate agreement.',
      createdAt: timeIsoStr(-24),
      updatedAt: timeIsoStr(-1),
    },
    {
      id: contactIds[5],
      userId,
      companyId: company3Id,
      firstName: 'Arthur',
      lastName: 'Pendleton',
      email: 'apendleton@nordichealth.org',
      phone: '+1 (612) 390-1130',
      jobTitle: 'IT Security Architect',
      status: 'Active',
      notes: 'Completed SOC2 review and SSO requirements assessment.',
      createdAt: timeIsoStr(-22),
      updatedAt: timeIsoStr(-5),
    },
    {
      id: contactIds[6],
      userId,
      companyId: company4Id,
      firstName: 'Camila',
      lastName: 'Torres',
      email: 'ctorres@beaconacademies.edu',
      phone: '+1 (617) 542-9985',
      jobTitle: 'Superintendent',
      status: 'Active',
      notes: 'Champions digital classroom adoption and donor relationship management.',
      createdAt: timeIsoStr(-18),
      updatedAt: timeIsoStr(-7),
    },
    {
      id: contactIds[7],
      userId,
      companyId: company4Id,
      firstName: 'Liam',
      lastName: 'Gallagher',
      email: 'lgallagher@beaconacademies.edu',
      phone: '+1 (617) 542-9988',
      jobTitle: 'Admissions Director',
      status: 'Inactive',
      notes: 'Currently on sabbatical; Camila Torres is direct contact.',
      createdAt: timeIsoStr(-15),
      updatedAt: timeIsoStr(-10),
    },
    {
      id: contactIds[8],
      userId,
      companyId: company5Id,
      firstName: 'Julian',
      lastName: 'Hartwell',
      email: 'julian@summitpartners.co',
      phone: '+1 (212) 755-4015',
      jobTitle: 'Managing Partner',
      status: 'Lead',
      notes: 'Met at NYC Dealmaker Forum; interested in deal pipeline transparency.',
      createdAt: timeIsoStr(-12),
      updatedAt: timeIsoStr(-2),
    },
    {
      id: contactIds[9],
      userId,
      companyId: company5Id,
      firstName: 'Claire',
      lastName: 'Sinclair',
      email: 'claire@summitpartners.co',
      phone: '+1 (212) 755-4020',
      jobTitle: 'Director of Business Development',
      status: 'Active',
      notes: 'Coordinates due diligence process and advisory mandates.',
      createdAt: timeIsoStr(-10),
      updatedAt: timeIsoStr(-1),
    },
  ];

  // 3. Ten Deals distributed across all 6 pipeline stages
  // Exact stages: Lead, Qualified, Proposal, Negotiation, Won, Lost
  const dealIds = Array.from({ length: 10 }, (_, i) => 'del_demo_' + (i + 1) + '_' + Math.random().toString(36).substring(2, 6));

  const demoDeals: Deal[] = [
    // 1. Lead stage
    {
      id: dealIds[0],
      userId,
      companyId: company5Id,
      contactId: contactIds[8],
      title: 'Commercial Portfolio Pipeline Integration',
      value: 38000,
      stage: 'Lead',
      expectedCloseDate: dateStr(45),
      priority: 'Medium',
      description: 'Initial scoping conversation regarding private equity deal flow tracking and valuation templates.',
      createdAt: timeIsoStr(-12),
      updatedAt: timeIsoStr(-2),
    },
    {
      id: dealIds[1],
      userId,
      companyId: company2Id,
      contactId: contactIds[3],
      title: 'Store Supply Chain Modernization',
      value: 24500,
      stage: 'Lead',
      expectedCloseDate: dateStr(60),
      priority: 'Low',
      description: 'Exploratory discovery call booked to review retail inventory vendor management.',
      createdAt: timeIsoStr(-10),
      updatedAt: timeIsoStr(-4),
    },
    // 2. Qualified stage
    {
      id: dealIds[2],
      userId,
      companyId: company4Id,
      contactId: contactIds[6],
      title: 'Campus Student CRM & Donor Tracking',
      value: 42000,
      stage: 'Qualified',
      expectedCloseDate: dateStr(30),
      priority: 'High',
      description: 'Budget approved by school board; technical demo scheduled with admissions faculty.',
      createdAt: timeIsoStr(-15),
      updatedAt: timeIsoStr(-3),
    },
    // 3. Proposal stage
    {
      id: dealIds[3],
      userId,
      companyId: company1Id,
      contactId: contactIds[0],
      title: 'Cloud Fleet Observability Expansion',
      value: 85000,
      stage: 'Proposal',
      expectedCloseDate: dateStr(21),
      priority: 'High',
      description: 'Formal 3-year subscription proposal sent including enterprise SLA and dedicated technical account manager.',
      createdAt: timeIsoStr(-20),
      updatedAt: timeIsoStr(-1),
    },
    {
      id: dealIds[4],
      userId,
      companyId: company5Id,
      contactId: contactIds[9],
      title: 'M&A Deal Room Workspace License',
      value: 54000,
      stage: 'Proposal',
      expectedCloseDate: dateStr(25),
      priority: 'Medium',
      description: 'Custom proposal submitted for 40 partner seats with advanced audit trail and document watermarking.',
      createdAt: timeIsoStr(-14),
      updatedAt: timeIsoStr(-5),
    },
    // 4. Negotiation stage
    {
      id: dealIds[5],
      userId,
      companyId: company2Id,
      contactId: contactIds[2],
      title: 'Retail POS Unified Data Hub',
      value: 72000,
      stage: 'Negotiation',
      expectedCloseDate: dateStr(10),
      priority: 'High',
      description: 'Final legal terms redline underway with general counsel. Payment terms agreed to net-30.',
      createdAt: timeIsoStr(-25),
      updatedAt: timeIsoStr(-1),
    },
    // 5. Won stage
    {
      id: dealIds[6],
      userId,
      companyId: company3Id,
      contactId: contactIds[4],
      title: 'Clinical Communications & Care Coordination',
      value: 120000,
      stage: 'Won',
      expectedCloseDate: dateStr(-5),
      priority: 'High',
      description: 'Master services agreement executed! Enterprise deployment kicking off across 6 regional medical centers.',
      createdAt: timeIsoStr(-32),
      updatedAt: timeIsoStr(-5),
    },
    {
      id: dealIds[7],
      userId,
      companyId: company1Id,
      contactId: contactIds[1],
      title: 'Developer Core Seat Expansion',
      value: 48000,
      stage: 'Won',
      expectedCloseDate: dateStr(-12),
      priority: 'Medium',
      description: 'Signed annual renewal with +25 additional engineering licenses.',
      createdAt: timeIsoStr(-28),
      updatedAt: timeIsoStr(-12),
    },
    {
      id: dealIds[8],
      userId,
      companyId: company4Id,
      contactId: contactIds[6],
      title: 'Summer STEM Academy Portal',
      value: 18500,
      stage: 'Won',
      expectedCloseDate: dateStr(-18),
      priority: 'Low',
      description: 'Annual licensing contract finalized and invoiced for 2026 summer programs.',
      createdAt: timeIsoStr(-30),
      updatedAt: timeIsoStr(-18),
    },
    // 6. Lost stage
    {
      id: dealIds[9],
      userId,
      companyId: company3Id,
      contactId: contactIds[5],
      title: 'Telehealth Video Infrastructure Plugin',
      value: 36000,
      stage: 'Lost',
      expectedCloseDate: dateStr(-8),
      priority: 'Medium',
      description: 'Competitor bundle was selected due to preexisting legacy EHR contract lock-in. Will revisit in Q4.',
      createdAt: timeIsoStr(-26),
      updatedAt: timeIsoStr(-8),
    },
  ];

  // 4. Eight Activities across types: Call, Email, Meeting, Note, Task
  // Some completed, some open, at least one overdue!
  const demoActivities: Activity[] = [
    {
      id: 'act_demo_1_' + Math.random().toString(36).substring(2, 6),
      userId,
      contactId: contactIds[0],
      dealId: dealIds[3],
      title: 'Executive Architecture Review Meeting',
      type: 'Meeting',
      description: 'Deep dive with Elena Rostova and engineering leadership on security architecture and cluster autoscaling.',
      dueDate: timeIsoStr(2, 14),
      completed: false,
      createdAt: timeIsoStr(-2),
      updatedAt: timeIsoStr(-2),
    },
    {
      id: 'act_demo_2_' + Math.random().toString(36).substring(2, 6),
      userId,
      contactId: contactIds[2],
      dealId: dealIds[5],
      title: 'Send Revised Master Services Agreement',
      type: 'Task',
      description: 'Incorporate indemnification cap adjustment requested by retail legal team.',
      dueDate: timeIsoStr(-2, 17), // Overdue!
      completed: false,
      createdAt: timeIsoStr(-4),
      updatedAt: timeIsoStr(-1),
    },
    {
      id: 'act_demo_3_' + Math.random().toString(36).substring(2, 6),
      userId,
      contactId: contactIds[4],
      dealId: dealIds[6],
      title: 'Post-Sale Onboarding Kickoff Call',
      type: 'Call',
      description: '30-minute sync with CMIO Dr. Vance to confirm project management stakeholders and milestone dates.',
      dueDate: timeIsoStr(4, 11),
      completed: false,
      createdAt: timeIsoStr(-1),
      updatedAt: timeIsoStr(-1),
    },
    {
      id: 'act_demo_4_' + Math.random().toString(36).substring(2, 6),
      userId,
      contactId: contactIds[8],
      dealId: dealIds[0],
      title: 'Introductory Discovery Call',
      type: 'Call',
      description: 'Discussed PE firm deal flow volume, current friction points in Excel tracking, and timeline expectations.',
      dueDate: timeIsoStr(-6, 15),
      completed: true,
      createdAt: timeIsoStr(-7),
      updatedAt: timeIsoStr(-6),
    },
    {
      id: 'act_demo_5_' + Math.random().toString(36).substring(2, 6),
      userId,
      contactId: contactIds[6],
      dealId: dealIds[2],
      title: 'Send Product Demo Recording to Board',
      type: 'Email',
      description: 'Sent link to 15-minute product walkthrough with pricing matrix and student data residency FAQ.',
      dueDate: timeIsoStr(-3, 9),
      completed: true,
      createdAt: timeIsoStr(-3),
      updatedAt: timeIsoStr(-3),
    },
    {
      id: 'act_demo_6_' + Math.random().toString(36).substring(2, 6),
      userId,
      contactId: contactIds[9],
      dealId: dealIds[4],
      title: 'Follow up on M&A Deal Room Security Assessment',
      type: 'Email',
      description: 'Share SOC 2 Type II report and ISO 27001 certificate with Claire Sinclair.',
      dueDate: timeIsoStr(1, 16),
      completed: false,
      createdAt: timeIsoStr(-1),
      updatedAt: timeIsoStr(-1),
    },
    {
      id: 'act_demo_7_' + Math.random().toString(36).substring(2, 6),
      userId,
      contactId: contactIds[1],
      dealId: dealIds[7],
      title: 'Contract Signing & Billing Account Provisioned',
      type: 'Note',
      description: 'PO #88491 received and validated. Stripe annual recurring invoice scheduled for automated payout.',
      dueDate: null,
      completed: true,
      createdAt: timeIsoStr(-12),
      updatedAt: timeIsoStr(-12),
    },
    {
      id: 'act_demo_8_' + Math.random().toString(36).substring(2, 6),
      userId,
      contactId: contactIds[3],
      dealId: dealIds[1],
      title: 'Review Vanguard Retail Procurement Specs',
      type: 'Task',
      description: 'Analyze EDI vendor compliance specifications prior to quoting logistics module.',
      dueDate: timeIsoStr(5, 12),
      completed: false,
      createdAt: timeIsoStr(-3),
      updatedAt: timeIsoStr(-3),
    },
  ];

  // Save to localStorage
  const currentCompanies = getCollection<Company>(COMPANIES_KEY).filter(c => c.userId !== userId);
  setCollection(COMPANIES_KEY, [...currentCompanies, ...demoCompanies]);

  const currentContacts = getCollection<Contact>(CONTACTS_KEY).filter(c => c.userId !== userId);
  setCollection(CONTACTS_KEY, [...currentContacts, ...demoContacts]);

  const currentDeals = getCollection<Deal>(DEALS_KEY).filter(d => d.userId !== userId);
  setCollection(DEALS_KEY, [...currentDeals, ...demoDeals]);

  const currentActivities = getCollection<Activity>(ACTIVITIES_KEY).filter(a => a.userId !== userId);
  setCollection(ACTIVITIES_KEY, [...currentActivities, ...demoActivities]);

  return {
    companies: demoCompanies,
    contacts: demoContacts,
    deals: demoDeals,
    activities: demoActivities,
  };
}

// Helpers for formatted currency & dates
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
