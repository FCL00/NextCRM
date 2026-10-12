import { supabase, isSupabaseConfigured } from './supabase';
import { Company, Contact, Deal, Activity, User, DealStage, ContactStatus, DealPriority, ActivityType } from '../types/crm';

// Database row mappings
function mapCompanyFromDb(row: any): Company {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    industry: row.industry,
    website: row.website || '',
    phone: row.phone || '',
    city: row.city || '',
    address: row.address || '',
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapContactFromDb(row: any): Contact {
  return {
    id: row.id,
    userId: row.user_id,
    companyId: row.company_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone || '',
    jobTitle: row.job_title || '',
    status: row.status as ContactStatus,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDealFromDb(row: any): Deal {
  return {
    id: row.id,
    userId: row.user_id,
    companyId: row.company_id,
    contactId: row.contact_id,
    title: row.title,
    value: Number(row.value) || 0,
    stage: row.stage as DealStage,
    expectedCloseDate: row.expected_close_date,
    description: row.description || '',
    priority: row.priority as DealPriority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapActivityFromDb(row: any): Activity {
  return {
    id: row.id,
    userId: row.user_id,
    contactId: row.contact_id,
    dealId: row.deal_id,
    title: row.title,
    type: row.type as ActivityType,
    description: row.description || '',
    dueDate: row.due_date,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 1. Supabase Authentication
export async function supabaseSignUp(name: string, email: string, password: string): Promise<User> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Signup failed: user not returned.');

  // Create or sync profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    name,
    email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.warn('Profile creation note:', profileError.message);
  }

  return {
    id: data.user.id,
    name: name,
    email: data.user.email || email,
    createdAt: data.user.created_at || new Date().toISOString(),
  };
}

export async function supabaseSignIn(email: string, password: string): Promise<User> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error('User not found.');

  // Fetch profile name if exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', data.user.id)
    .single();

  const name = profile?.name || data.user.user_metadata?.name || email.split('@')[0];

  return {
    id: data.user.id,
    name,
    email: data.user.email || email,
    createdAt: data.user.created_at || new Date().toISOString(),
  };
}

export async function supabaseSignOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSupabaseCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const user = session.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  const name = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return {
    id: user.id,
    name,
    email: user.email || '',
    createdAt: user.created_at || new Date().toISOString(),
  };
}

// 2. Companies CRUD
export async function fetchSupabaseCompanies(userId: string): Promise<Company[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching companies from Supabase:', error);
    throw error;
  }
  return (data || []).map(mapCompanyFromDb);
}

export async function createSupabaseCompany(userId: string, company: Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Company> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('companies')
    .insert({
      user_id: userId,
      name: company.name,
      industry: company.industry,
      website: company.website,
      phone: company.phone,
      city: company.city,
      address: company.address,
      notes: company.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCompanyFromDb(data);
}

export async function updateSupabaseCompany(userId: string, id: string, updates: Partial<Company>): Promise<Company> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.industry !== undefined) dbUpdates.industry = updates.industry;
  if (updates.website !== undefined) dbUpdates.website = updates.website;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.city !== undefined) dbUpdates.city = updates.city;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { data, error } = await supabase
    .from('companies')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return mapCompanyFromDb(data);
}

export async function deleteSupabaseCompany(userId: string, id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// 3. Contacts CRUD
export async function fetchSupabaseContacts(userId: string): Promise<Contact[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts from Supabase:', error);
    throw error;
  }
  return (data || []).map(mapContactFromDb);
}

export async function createSupabaseContact(userId: string, contact: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('contacts')
    .insert({
      user_id: userId,
      company_id: contact.companyId || null,
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      job_title: contact.jobTitle,
      status: contact.status,
      notes: contact.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return mapContactFromDb(data);
}

export async function updateSupabaseContact(userId: string, id: string, updates: Partial<Contact>): Promise<Contact> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.jobTitle !== undefined) dbUpdates.job_title = updates.jobTitle;
  if (updates.companyId !== undefined) dbUpdates.company_id = updates.companyId || null;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { data, error } = await supabase
    .from('contacts')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return mapContactFromDb(data);
}

export async function deleteSupabaseContact(userId: string, id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// 4. Deals CRUD
export async function fetchSupabaseDeals(userId: string): Promise<Deal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals from Supabase:', error);
    throw error;
  }
  return (data || []).map(mapDealFromDb);
}

export async function createSupabaseDeal(userId: string, deal: Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('deals')
    .insert({
      user_id: userId,
      company_id: deal.companyId || null,
      contact_id: deal.contactId || null,
      title: deal.title,
      value: deal.value,
      stage: deal.stage,
      expected_close_date: deal.expectedCloseDate,
      description: deal.description,
      priority: deal.priority,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDealFromDb(data);
}

export async function updateSupabaseDeal(userId: string, id: string, updates: Partial<Deal>): Promise<Deal> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.value !== undefined) dbUpdates.value = updates.value;
  if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
  if (updates.companyId !== undefined) dbUpdates.company_id = updates.companyId || null;
  if (updates.contactId !== undefined) dbUpdates.contact_id = updates.contactId || null;
  if (updates.expectedCloseDate !== undefined) dbUpdates.expected_close_date = updates.expectedCloseDate;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;

  const { data, error } = await supabase
    .from('deals')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return mapDealFromDb(data);
}

export async function deleteSupabaseDeal(userId: string, id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// 5. Activities CRUD
export async function fetchSupabaseActivities(userId: string): Promise<Activity[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching activities from Supabase:', error);
    throw error;
  }
  return (data || []).map(mapActivityFromDb);
}

export async function createSupabaseActivity(userId: string, activity: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      contact_id: activity.contactId || null,
      deal_id: activity.dealId || null,
      title: activity.title,
      type: activity.type,
      description: activity.description,
      due_date: activity.dueDate || null,
      completed: activity.completed,
    })
    .select()
    .single();

  if (error) throw error;
  return mapActivityFromDb(data);
}

export async function updateSupabaseActivity(userId: string, id: string, updates: Partial<Activity>): Promise<Activity> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.contactId !== undefined) dbUpdates.contact_id = updates.contactId || null;
  if (updates.dealId !== undefined) dbUpdates.deal_id = updates.dealId || null;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

  const { data, error } = await supabase
    .from('activities')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return mapActivityFromDb(data);
}

export async function deleteSupabaseActivity(userId: string, id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// 6. Test connection
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabase) {
    return { ok: false, message: 'Supabase URL or public Anon Key is missing in environment variables.' };
  }

  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code === '42P01') {
      return {
        ok: false,
        message: 'Connected to Supabase project, but tables are missing. Please execute the SQL migration script.',
      };
    }
    return { ok: true, message: 'Successfully connected to Supabase PostgreSQL!' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Connection failed.' };
  }
}
