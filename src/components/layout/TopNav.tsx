import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import {
  Menu,
  Plus,
  Search,
  UserPlus,
  Building,
  Kanban,
  CalendarCheck,
  X,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency } from '../../services/storage';

interface TopNavProps {
  onOpenMobileDrawer: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileDrawer }) => {
  const {
    openQuickAdd,
    contacts,
    companies,
    deals,
    setSelectedContactId,
    setSelectedCompanyId,
    setSelectedDealId,
  } = useCrm();

  const navigate = useNavigate();
  const location = useLocation();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const quickAddRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close quick add menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setIsQuickAddOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when search modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Global search filtering
  const filteredResults = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { contacts: [], companies: [], deals: [] };

    return {
      contacts: contacts
        .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q))
        .slice(0, 4),
      companies: companies
        .filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.city.toLowerCase().includes(q))
        .slice(0, 4),
      deals: deals
        .filter(d => d.title.toLowerCase().includes(q) || d.stage.toLowerCase().includes(q))
        .slice(0, 4),
    };
  }, [searchQuery, contacts, companies, deals]);

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/contacts')) return 'Contacts';
    if (pathname.startsWith('/companies')) return 'Companies';
    if (pathname.startsWith('/deals')) return 'Deals & Pipeline';
    if (pathname.startsWith('/activities')) return 'Activities & Tasks';
    if (pathname.startsWith('/analytics')) return 'Sales Analytics';
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/overview')) return 'Overview Dashboard';
    return 'CRM Workspace';
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileDrawer}
          className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, Quick Add, Demo Button */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-500 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors border border-stone-200/60"
          title="Search contacts, companies, deals"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline">Search workspace...</span>
        </button>

        {/* Quick Add Dropdown */}
        <div className="relative" ref={quickAddRef}>
          <button
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Add</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {isQuickAddOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  openQuickAdd('deal');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
              >
                <Kanban className="w-4 h-4 text-orange-500" />
                <span>New Deal</span>
              </button>
              <button
                onClick={() => {
                  openQuickAdd('contact');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
              >
                <UserPlus className="w-4 h-4 text-stone-500" />
                <span>New Contact</span>
              </button>
              <button
                onClick={() => {
                  openQuickAdd('company');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
              >
                <Building className="w-4 h-4 text-stone-500" />
                <span>New Company</span>
              </button>
              <button
                onClick={() => {
                  openQuickAdd('activity');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
              >
                <CalendarCheck className="w-4 h-4 text-stone-500" />
                <span>New Activity</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Dialog Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-3 border-b border-stone-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-stone-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search across contacts, companies, deals..."
                className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 divide-y divide-stone-100">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  Type a name, email, company, or deal to jump directly to it
                </div>
              ) : (
                <>
                  {filteredResults.deals.length > 0 && (
                    <div className="py-2">
                      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 mb-1.5">
                        Deals
                      </div>
                      {filteredResults.deals.map(deal => (
                        <button
                          key={deal.id}
                          onClick={() => {
                            navigate('/deals');
                            setSelectedDealId(deal.id);
                            setIsSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 text-left text-xs transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-stone-900">{deal.title}</div>
                            <div className="text-stone-500">{deal.stage} stage</div>
                          </div>
                          <div className="font-mono font-bold text-orange-600">
                            {formatCurrency(deal.value)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredResults.contacts.length > 0 && (
                    <div className="py-2">
                      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 mb-1.5">
                        Contacts
                      </div>
                      {filteredResults.contacts.map(contact => (
                        <button
                          key={contact.id}
                          onClick={() => {
                            navigate('/contacts');
                            setSelectedContactId(contact.id);
                            setIsSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 text-left text-xs transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-stone-900">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-stone-500">{contact.email}</div>
                          </div>
                          <div className="text-stone-400">{contact.jobTitle}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredResults.companies.length > 0 && (
                    <div className="py-2">
                      <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 mb-1.5">
                        Companies
                      </div>
                      {filteredResults.companies.map(company => (
                        <button
                          key={company.id}
                          onClick={() => {
                            navigate('/companies');
                            setSelectedCompanyId(company.id);
                            setIsSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-stone-50 text-left text-xs transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-stone-900">{company.name}</div>
                            <div className="text-stone-500">{company.city}</div>
                          </div>
                          <div className="text-stone-400">{company.industry}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredResults.deals.length === 0 &&
                    filteredResults.contacts.length === 0 &&
                    filteredResults.companies.length === 0 && (
                      <div className="py-6 text-center text-xs text-stone-500">
                        No matches found for "{searchQuery}".
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
