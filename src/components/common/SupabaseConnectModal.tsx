import React, { useState } from 'react';
import { isSupabaseConfigured, supabaseUrl, saveManualSupabaseCredentials, clearManualSupabaseCredentials } from '../../services/supabase';
import { testSupabaseConnection } from '../../services/supabaseService';
import { X, Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({ isOpen, onClose }) => {
  const [urlInput, setUrlInput] = useState(supabaseUrl);
  const [keyInput, setKeyInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ ok: false, message: err?.message || 'Connection test failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.startsWith('https://')) {
      alert('Supabase URL must start with https://');
      return;
    }
    if (!keyInput.trim()) {
      alert('Please enter your public anon key.');
      return;
    }
    saveManualSupabaseCredentials(urlInput.trim(), keyInput.trim());
  };

  const sqlSchemaSnippet = `-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'General Business',
  website TEXT,
  phone TEXT,
  city TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  job_title TEXT,
  status TEXT NOT NULL DEFAULT 'Lead' CHECK (status IN ('Lead', 'Active', 'Inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value NUMERIC(14, 2) NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'Lead' CHECK (stage IN ('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')),
  expected_close_date DATE,
  description TEXT,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Task' CHECK (type IN ('Call', 'Email', 'Meeting', 'Note', 'Task')),
  description TEXT,
  due_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS and add policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profiles" ON public.profiles;
CREATE POLICY "Users can manage own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own companies" ON public.companies;
CREATE POLICY "Users can manage own companies" ON public.companies FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own contacts" ON public.contacts;
CREATE POLICY "Users can manage own contacts" ON public.contacts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own deals" ON public.deals;
CREATE POLICY "Users can manage own deals" ON public.deals FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own activities" ON public.activities;
CREATE POLICY "Users can manage own activities" ON public.activities FOR ALL USING (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">Supabase Database Connection</h3>
            <p className="text-xs text-stone-500">
              Connect Next CRM to your actual Supabase PostgreSQL database and Auth
            </p>
          </div>
        </div>

        {/* Current Status */}
        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 ${
          isSupabaseConfigured
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/60 border-amber-200 text-amber-900'
        }`}>
          {isSupabaseConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <h4 className="font-bold">
              {isSupabaseConfigured ? 'Supabase Configuration Detected' : 'Supabase Credentials Not Yet Configured'}
            </h4>
            <p className="mt-1 leading-relaxed">
              {isSupabaseConfigured
                ? `Connected to: ${supabaseUrl}. All contacts, companies, deals, and activities persist to your Supabase PostgreSQL instance.`
                : 'Next CRM is configured to use Supabase PostgreSQL and Supabase Auth. To connect your actual project, configure your environment variables or paste your project credentials below.'}
            </p>
          </div>
        </div>

        {/* Step 1: SQL Setup Instructions */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Step 1: Database Migration (SQL Setup)
            </h4>
            <button
              onClick={copySql}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <p className="text-xs text-stone-600">
            Open your <strong>Supabase Dashboard → SQL Editor → New Query</strong>, paste the schema below, and click <strong>Run</strong>. This creates the tables (profiles, companies, contacts, deals, activities) with Row Level Security (RLS) enabled.
          </p>

          <pre className="p-3 bg-stone-900 text-stone-200 rounded-lg text-[11px] font-mono max-h-40 overflow-y-auto leading-relaxed">
            {sqlSchemaSnippet}
          </pre>
        </div>

        {/* Step 2: Connection Credentials */}
        <div className="mb-6 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Step 2: Connect Your Project Credentials
          </h4>
          <p className="text-xs text-stone-600">
            Obtain your <strong>Project URL</strong> and <strong>Public Anon Key</strong> from <em>Supabase Dashboard → Project Settings → API</em>.
          </p>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Project URL (VITE_SUPABASE_URL)</label>
              <input
                type="url"
                required
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Public Anon Key (VITE_SUPABASE_ANON_KEY)</label>
              <input
                type="password"
                required
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Never enter the service-role secret key. Only the public anon key is safe for frontend clients.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !isSupabaseConfigured}
                className="px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Database Connection</span>
              </button>

              <div className="flex items-center gap-2">
                {localStorage.getItem('nextcrm_supabase_url') && (
                  <button
                    type="button"
                    onClick={clearManualSupabaseCredentials}
                    className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Clear Credentials
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs"
                >
                  Save & Connect
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs font-medium mt-2 flex items-center gap-2 ${
                testResult.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {testResult.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
