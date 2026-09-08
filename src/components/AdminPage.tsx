import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { PaymentRecord, SystemSettings, User } from '../types';

interface AdminPageProps {
  users: User[];
  payments: PaymentRecord[];
  settings: SystemSettings;
  onApprovePayment: (paymentId: string) => { success: boolean; message: string };
  onRejectPayment: (paymentId: string, reason?: string) => void;
  onAddUserMinutes: (userId: string, minutes: number) => void;
  onSaveSettings: (settings: SystemSettings) => void;
}

/** A standalone admin route, intentionally separate from the creator workspace. */
export const AdminPage: React.FC<AdminPageProps> = (props) => (
  <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 px-4 py-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30"><ShieldCheck className="h-5 w-5" /></div>
          <div><p className="text-sm font-black">Bgern Admin</p><p className="text-[11px] text-slate-400">Operations workspace</p></div>
        </div>
        <button
          onClick={() => {
            if (window.location.pathname.startsWith('/admin')) {
              window.history.pushState(null, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            } else {
              window.location.hash = '#/';
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Creator app
        </button>
      </div>
    </header>
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><AdminDashboard {...props} /></main>
  </div>
);
