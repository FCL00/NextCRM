import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-stone-200 relative max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              {isPrivacy ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <p className="text-xs text-stone-500">Last updated: October 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 text-sm text-stone-600 space-y-4 leading-relaxed pr-2">
          {isPrivacy ? (
            <>
              <p>
                At <strong>Next CRM</strong>, we respect your privacy and are committed to protecting the confidential customer relationships, deals, and notes you manage inside your workspace.
              </p>
              <h4 className="font-semibold text-stone-800 text-sm">1. Data Ownership & Privacy</h4>
              <p>
                All company records, contact profiles, sales pipeline values, and team activities belong exclusively to you. We enforce strict client and database partition isolation so no other organization or user can view your sales data.
              </p>
              <h4 className="font-semibold text-stone-800 text-sm">2. Data Security & Storage</h4>
              <p>
                Authentication credentials use cryptographically secure hashing (SHA-256 with salts). We never store your passwords in plaintext. CRM information is securely saved in your browser storage or dedicated database backend.
              </p>
              <h4 className="font-semibold text-stone-800 text-sm">3. Analytics & Telemetry</h4>
              <p>
                We do not sell your personal or business customer information to third-party ad networks or data brokers.
              </p>
            </>
          ) : (
            <>
              <p>
                Welcome to <strong>Next CRM</strong>. By creating an account or accessing our workspace tools, you agree to these Terms of Service.
              </p>
              <h4 className="font-semibold text-stone-800 text-sm">1. Acceptable Business Use</h4>
              <p>
                Next CRM is designed for business-to-business deal pipeline management, contact tracking, and customer communications. You agree not to use the platform for unlawful spam, harassment, or malicious activity.
              </p>
              <h4 className="font-semibold text-stone-800 text-sm">2. Workspace Integrity</h4>
              <p>
                You are responsible for safeguarding your login credentials. Demo data loaded into test workspaces can be modified or cleared at any time.
              </p>
              <h4 className="font-semibold text-stone-800 text-sm">3. Limitation of Liability</h4>
              <p>
                Next CRM provides pipeline calculation and forecasting tools to assist sales processes. We strive for high reliability and data consistency.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
