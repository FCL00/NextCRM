import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Company } from '../../types/crm';
import { X, Building2, Globe, Phone, MapPin, FileText } from 'lucide-react';

interface CompanyFormModalProps {
  isOpen: boolean;
  companyToEdit?: Company | null;
  onClose: () => void;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  companyToEdit,
  onClose,
}) => {
  const { createCompany, updateCompany } = useCrm();

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyToEdit) {
      setName(companyToEdit.name);
      setIndustry(companyToEdit.industry);
      setWebsite(companyToEdit.website);
      setPhone(companyToEdit.phone || '');
      setCity(companyToEdit.city);
      setAddress(companyToEdit.address || '');
      setNotes(companyToEdit.notes || '');
    } else {
      setName('');
      setIndustry('Technology');
      setWebsite('');
      setPhone('');
      setCity('');
      setAddress('');
      setNotes('');
    }
    setError(null);
  }, [companyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Company name is required.');
      return;
    }

    try {
      if (companyToEdit) {
        updateCompany(companyToEdit.id, {
          name: name.trim(),
          industry: industry.trim(),
          website: website.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
          notes: notes.trim(),
        });
      } else {
        createCompany({
          name: name.trim(),
          industry: industry.trim() || 'General Business',
          website: website.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save company.');
    }
  };

  const industries = [
    'Technology',
    'Retail',
    'Healthcare',
    'Education',
    'Professional Services',
    'Finance',
    'Manufacturing',
    'Media',
    'Real Estate',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {companyToEdit ? 'Edit Company' : 'Add New Company'}
              </h3>
              <p className="text-xs text-stone-500">Record business account information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='px-4'>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Apex Logic Inc."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Industry</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Website URL</label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">City / Location</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
                />
              </div>
            </div>
          </div>

          <div className='px-4'>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Office Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="100 Market St, Suite 400"
              className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
            />
          </div>

          <div className='px-4'>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Account Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Key business focus, team size, procurement notes..."
              className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
            />
          </div>

          <div className="p-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs"
            >
              {companyToEdit ? 'Save Changes' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
