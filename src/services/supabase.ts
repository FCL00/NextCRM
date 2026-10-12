import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check runtime session overrides (allow user to test-connect from settings modal if env is pending)
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('nextcrm_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('nextcrm_supabase_key') : null;

export const supabaseUrl = (envUrl || storedUrl || '').trim();
export const supabaseAnonKey = (envAnonKey || storedKey || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 20 &&
  !supabaseUrl.includes('your-project-id')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabase = null;
  }
}

export function saveManualSupabaseCredentials(url: string, anonKey: string): boolean {
  if (url && url.startsWith('https://') && anonKey && anonKey.length > 20) {
    localStorage.setItem('nextcrm_supabase_url', url.trim());
    localStorage.setItem('nextcrm_supabase_key', anonKey.trim());
    window.location.reload();
    return true;
  }
  return false;
}

export function clearManualSupabaseCredentials(): void {
  localStorage.removeItem('nextcrm_supabase_url');
  localStorage.removeItem('nextcrm_supabase_key');
  window.location.reload();
}
