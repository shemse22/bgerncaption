import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Eye,
  Plus,
  Settings,
  AlertCircle,
  ExternalLink,
  Languages,
  Building2,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  Globe,
} from 'lucide-react';
import { User, PaymentRecord, SystemSettings, ManualPaymentPlatform, CaptionLanguageOption } from '../types';
import { formatTimeSeconds } from '../lib/subtitles';
import { INITIAL_PAYMENT_PLATFORMS, INITIAL_LANGUAGES } from '../lib/storage';

interface AdminDashboardProps {
  users: User[];
  payments: PaymentRecord[];
  settings: SystemSettings;
  onApprovePayment: (paymentId: string) => { success: boolean; message: string };
  onRejectPayment: (paymentId: string, reason?: string) => void;
  onAddUserMinutes: (userId: string, minutes: number) => void;
  onSaveSettings: (settings: SystemSettings) => Promise<any> | void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  payments,
  settings,
  onApprovePayment,
  onRejectPayment,
  onAddUserMinutes,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'platforms' | 'languages' | 'settings'>('approvals');
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual minute grant modal state
  const [grantUser, setGrantUser] = useState<User | null>(null);
  const [minutesToGrant, setMinutesToGrant] = useState<number>(10);

  // Manual Payment Platform Management State
  const platforms: ManualPaymentPlatform[] = settings.paymentPlatforms || INITIAL_PAYMENT_PLATFORMS;
  const [showPlatformModal, setShowPlatformModal] = useState<boolean>(false);
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [platformName, setPlatformName] = useState<string>('');
  const [platformAccountNumber, setPlatformAccountNumber] = useState<string>('');
  const [platformAccountHolder, setPlatformAccountHolder] = useState<string>('');
  const [platformInstructions, setPlatformInstructions] = useState<string>('');
  const [platformBadge, setPlatformBadge] = useState<string>('Instant');

  // Caption Languages Management State
  const supportedLanguages: CaptionLanguageOption[] = settings.supportedLanguages || INITIAL_LANGUAGES;
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [langName, setLangName] = useState<string>('');
  const [langNativeName, setLangNativeName] = useState<string>('');
  const [langFlag, setLangFlag] = useState<string>('🇪🇹');

  // Stats calculation (Real data calculated from payments and users)
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const approvedPayments = payments.filter((p) => p.status === 'approved');
  const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amountEtb, 0);
  const totalMinutesSold = approvedPayments.reduce((sum, p) => sum + p.minutes, 0);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (paymentId: string) => {
    const result = onApprovePayment(paymentId);
    if (result.success) {
      showToast('success', result.message);
    } else {
      showToast('error', result.message);
    }
  };

  const handleReject = (paymentId: string) => {
    const reason = prompt('Please enter a rejection reason (e.g. Invalid reference / receipt):');
    if (reason !== null) {
      onRejectPayment(paymentId, reason);
      showToast('success', 'Payment rejected.');
    }
  };

  const handleGrantMinutesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUser) return;
    onAddUserMinutes(grantUser.id, minutesToGrant);
    showToast('success', `Added ${minutesToGrant} minutes to ${grantUser.name}'s balance.`);
    setGrantUser(null);
  };

  // --- Manual Payment Platform Handlers ---
  const handleOpenAddPlatform = () => {
    setEditingPlatformId(null);
    setPlatformName('');
    setPlatformAccountNumber('');
    setPlatformAccountHolder('');
    setPlatformInstructions('Send payment screenshot along with your registered email');
    setPlatformBadge('Instant');
    setShowPlatformModal(true);
  };

  const handleOpenEditPlatform = (p: ManualPaymentPlatform) => {
    setEditingPlatformId(p.id);
    setPlatformName(p.name);
    setPlatformAccountNumber(p.accountNumber);
    setPlatformAccountHolder(p.accountHolder);
    setPlatformInstructions(p.instructions || '');
    setPlatformBadge(p.badge || 'Verified');
    setShowPlatformModal(true);
  };

  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformName.trim() || !platformAccountNumber.trim() || !platformAccountHolder.trim()) {
      showToast('error', 'Please fill in the platform name, account number, and account holder.');
      return;
    }

    const currentList = settings.paymentPlatforms || INITIAL_PAYMENT_PLATFORMS;
    let updatedList: ManualPaymentPlatform[];

    if (editingPlatformId) {
      updatedList = currentList.map((p) =>
        p.id === editingPlatformId
          ? {
              ...p,
              name: platformName.trim(),
              accountNumber: platformAccountNumber.trim(),
              accountHolder: platformAccountHolder.trim(),
              instructions: platformInstructions.trim(),
              badge: platformBadge.trim(),
            }
          : p
      );
    } else {
      const newPlatform: ManualPaymentPlatform = {
        id: `plat-${Date.now().toString(36)}`,
        name: platformName.trim(),
        accountNumber: platformAccountNumber.trim(),
        accountHolder: platformAccountHolder.trim(),
        instructions: platformInstructions.trim(),
        badge: platformBadge.trim(),
        isActive: true,
      };
      updatedList = [...currentList, newPlatform];
    }

    // Synchronize legacy telebirrAccount / cbeAccount fields if those platforms were modified
    let nextTelebirr = settings.telebirrAccount;
    let nextCbe = settings.cbeAccount;
    const telePlat = updatedList.find((p) => p.id === 'plat-telebirr' || p.name.toLowerCase().includes('telebirr'));
    if (telePlat) nextTelebirr = telePlat.accountNumber;
    const cbePlat = updatedList.find((p) => p.id === 'plat-cbe' || p.name.toLowerCase().includes('cbe') || p.name.toLowerCase().includes('commercial bank'));
    if (cbePlat) nextCbe = cbePlat.accountNumber;

    try {
      await onSaveSettings({
        ...settings,
        telebirrAccount: nextTelebirr,
        cbeAccount: nextCbe,
        paymentPlatforms: updatedList,
      });
      showToast('success', editingPlatformId ? `Updated ${platformName} and saved to database.` : `Added ${platformName} and saved to database.`);
    } catch (err: any) {
      showToast('error', `Failed to save to database: ${err?.message || 'Server error'}`);
    }
    setShowPlatformModal(false);
  };

  const handleTogglePlatform = async (platformId: string) => {
    const currentList = settings.paymentPlatforms || INITIAL_PAYMENT_PLATFORMS;
    const updatedList = currentList.map((p) =>
      p.id === platformId ? { ...p, isActive: !p.isActive } : p
    );
    try {
      await onSaveSettings({
        ...settings,
        paymentPlatforms: updatedList,
      });
      showToast('success', 'Payment platform status updated.');
    } catch (err: any) {
      showToast('error', `Failed to update status: ${err?.message || 'Server error'}`);
    }
  };

  const handleDeletePlatform = async (platformId: string, name: string) => {
    const currentList = settings.paymentPlatforms || INITIAL_PAYMENT_PLATFORMS;
    if (currentList.length <= 1) {
      showToast('error', 'At least one payment platform must remain available.');
      return;
    }
    const updatedList = currentList.filter((p) => p.id !== platformId);
    try {
      await onSaveSettings({
        ...settings,
        paymentPlatforms: updatedList,
      });
      showToast('success', `Deleted platform: ${name}`);
    } catch (err: any) {
      showToast('error', `Failed to delete platform: ${err?.message || 'Server error'}`);
    }
  };

  // --- Caption Language Handlers ---
  const handleToggleLanguage = (langId: string) => {
    const currentList = settings.supportedLanguages || INITIAL_LANGUAGES;
    const lang = currentList.find((l) => l.id === langId);
    if (lang?.isDefault) {
      showToast('error', 'Amharic is the default base language and cannot be disabled.');
      return;
    }
    const updatedList = currentList.map((l) =>
      l.id === langId ? { ...l, enabled: !l.enabled } : l
    );
    onSaveSettings({
      ...settings,
      supportedLanguages: updatedList,
    });
    showToast('success', `Updated availability for ${lang?.name || 'language'}.`);
  };

  const handleSaveLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!langName.trim() || !langNativeName.trim()) {
      showToast('error', 'Please provide both English name and native script name.');
      return;
    }
    const currentList = settings.supportedLanguages || INITIAL_LANGUAGES;
    const newLang: CaptionLanguageOption = {
      id: `lang-${langName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`,
      name: langName.trim(),
      nativeName: langNativeName.trim(),
      flag: langFlag.trim() || '🌐',
      enabled: true, // Now available for users!
    };
    const updatedList = [...currentList, newLang];
    onSaveSettings({
      ...settings,
      supportedLanguages: updatedList,
    });
    setShowLanguageModal(false);
    setLangName('');
    setLangNativeName('');
    showToast('success', `Added ${newLang.name} (${newLang.nativeName}) to user caption options.`);
  };

  const handleDeleteLanguage = (langId: string, name: string) => {
    const currentList = settings.supportedLanguages || INITIAL_LANGUAGES;
    const lang = currentList.find((l) => l.id === langId);
    if (lang?.isDefault) {
      showToast('error', 'Cannot delete default Amharic language.');
      return;
    }
    const updatedList = currentList.filter((l) => l.id !== langId);
    onSaveSettings({
      ...settings,
      supportedLanguages: updatedList,
    });
    showToast('success', `Removed language: ${name}`);
  };

  const filteredPayments = payments.filter((p) =>
    paymentFilter === 'all' ? true : p.status === paymentFilter
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-16 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-white animate-in slide-in-from-top-2 ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Admin Control Panel</h1>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              Protected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve manual Telebirr/CBE payments and manage user credit balances
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowMetrics(!showMetrics)}
          className="shrink-0 text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-2xs touch-tap"
        >
          {showMetrics ? '✕ Hide Overview' : '+ Show Overview'}
        </button>
      </div>

      {/* Stats Cards Row (100% Real Live Metrics) */}
      {showMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-3xl bg-white p-3.5 sm:p-4 border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{users.length}</div>
            <p className="text-[10px] text-slate-500 font-medium">
              {users.filter((u) => u.status === 'active').length} active accounts
            </p>
          </div>

          <div className="rounded-3xl bg-white p-3.5 sm:p-4 border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Minutes Sold</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{totalMinutesSold.toLocaleString()}</div>
            <p className="text-[10px] text-slate-400 font-medium">
              {approvedPayments.length} package orders
            </p>
          </div>

          <div className="rounded-3xl bg-white p-3.5 sm:p-4 border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Pending Approvals</span>
              <CreditCard className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600">{pendingPayments.length}</div>
            <p className="text-[10px] text-amber-600 font-semibold">
              {pendingPayments.length > 0 ? `${pendingPayments.length} requires action` : 'All caught up'}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-3.5 sm:p-4 border border-slate-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {totalRevenue.toLocaleString()} ETB
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Verified payments</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 text-xs font-bold transition relative flex items-center gap-1.5 whitespace-nowrap active:scale-95 touch-tap ${
            activeTab === 'approvals' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Payment Approvals</span>
          {pendingPayments.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingPayments.length}
            </span>
          )}
          {activeTab === 'approvals' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold transition relative whitespace-nowrap active:scale-95 touch-tap ${
            activeTab === 'users' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>User Management</span>
          {activeTab === 'users' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`pb-3 text-xs font-bold transition relative flex items-center gap-1.5 whitespace-nowrap active:scale-95 touch-tap ${
            activeTab === 'platforms' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Payment Platforms ({platforms.length})</span>
          {activeTab === 'platforms' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('languages')}
          className={`pb-3 text-xs font-bold transition relative flex items-center gap-1.5 whitespace-nowrap active:scale-95 touch-tap ${
            activeTab === 'languages' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Caption Languages ({supportedLanguages.filter(l => l.enabled).length} Active)</span>
          {activeTab === 'languages' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs font-bold transition relative whitespace-nowrap active:scale-95 touch-tap ${
            activeTab === 'settings' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>System Settings</span>
          {activeTab === 'settings' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: Payment Approvals Queue (Image 2 screen 3) */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPaymentFilter(filter)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition active:scale-95 touch-tap ${
                  paymentFilter === filter ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Mobile Card List (< md) */}
          <div className="space-y-3 md:hidden">
            {filteredPayments.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{p.userName}</h4>
                    <p className="text-[11px] text-slate-400">{p.userEmail}</p>
                  </div>
                  {p.status === 'pending' && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Pending
                    </span>
                  )}
                  {p.status === 'approved' && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Approved
                    </span>
                  )}
                  {p.status === 'rejected' && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                      Rejected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Package & Amount</span>
                    <span className="font-bold text-slate-800">{p.packageName}</span>
                    <div className="font-mono font-bold text-blue-700">{p.amountEtb} ETB</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Method & Ref</span>
                    <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                    <div className="font-mono text-[10px] text-slate-500 truncate">{p.referenceNumber}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setSelectedReceipt(p.receiptUrl)}
                    className="min-h-[38px] px-3 rounded-xl border border-slate-200 text-blue-600 hover:bg-blue-50 active:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 touch-tap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Receipt</span>
                  </button>

                  {p.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReject(p.id)}
                        className="min-h-[38px] px-3 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-bold text-xs transition active:scale-95 touch-tap"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="min-h-[38px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs active:scale-95 touch-tap flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table of Payments (>= md) */}
          <div className="hidden md:block rounded-3xl bg-white border border-slate-100 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4">Receipt</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPayments.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.userName}</div>
                        <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {p.packageName}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {p.amountEtb} ETB
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-700">{p.paymentMethod}</span>
                        <div className="font-mono text-[11px] text-slate-500">{p.referenceNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedReceipt(p.receiptUrl)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Pending
                          </span>
                        )}
                        {p.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Approved
                          </span>
                        )}
                        {p.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`approve-btn-${p.id}`}
                              onClick={() => handleApprove(p.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs active:scale-95 flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(p.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-bold text-[11px] transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm sm:text-xs font-semibold focus:outline-hidden"
            />
          </div>

          {/* Mobile User Cards (< md) */}
          <div className="space-y-3 md:hidden">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px] capitalize">
                    {u.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Plan</span>
                    <span className="font-bold text-slate-800 capitalize">{u.plan}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Balance</span>
                    <span className="font-mono font-bold text-blue-600">{formatTimeSeconds(u.availableMinutes)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setGrantUser(u)}
                  className="w-full min-h-[40px] py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 font-bold text-xs transition touch-tap flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Minutes</span>
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block rounded-3xl bg-white border border-slate-100 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Available Minutes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Credit Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold">{u.plan}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {formatTimeSeconds(u.availableMinutes)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setGrantUser(u)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition"
                      >
                        + Add Minutes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Payment Platforms (Admin can add manual payment platform by himself) */}
      {activeTab === 'platforms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manual Payment Platforms (የክፍያ መድረኮች)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, or toggle receiver payment platforms displayed to users in the Minute Top-Up modal
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddPlatform}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 touch-tap transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Platform</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {platforms.map((plat) => (
              <div
                key={plat.id}
                className={`p-4 sm:p-5 rounded-3xl bg-white border transition-all space-y-3 relative shadow-xs ${
                  plat.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{plat.name}</h4>
                        {plat.badge && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {plat.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {plat.isActive ? '🟢 Active in user checkout' : '⚪ Inactive / Hidden'}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePlatform(plat.id)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 touch-tap"
                    title={plat.isActive ? 'Disable Platform' : 'Enable Platform'}
                  >
                    {plat.isActive ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                        Disabled
                      </span>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Account / Phone:</span>
                    <span className="font-mono font-bold text-slate-900">{plat.accountNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Account Holder:</span>
                    <span className="font-bold text-slate-800">{plat.accountHolder}</span>
                  </div>
                  {plat.instructions && (
                    <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200/60 mt-1">
                      💡 {plat.instructions}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditPlatform(plat)}
                    className="min-h-[34px] px-3 py-1 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 touch-tap flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlatform(plat.id, plat.name)}
                    className="min-h-[34px] px-3 py-1 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 active:scale-95 touch-tap flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Caption Languages (Admin can add more languages, user available only Amharic by default) */}
      {activeTab === 'languages' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Caption Languages (የካፕሽን ቋንቋዎች)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Amharic is available to users by default. Enable or add additional languages to make them selectable for users in upload.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 touch-tap transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Language</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {supportedLanguages.map((lang) => (
              <div
                key={lang.id}
                className={`p-4 rounded-3xl bg-white border transition-all space-y-3 shadow-xs ${
                  lang.enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{lang.flag || '🌐'}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900">{lang.name}</h4>
                        {lang.isDefault && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{lang.nativeName}</p>
                    </div>
                  </div>

                  {lang.enabled ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Available to User
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                      Hidden from User
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleLanguage(lang.id)}
                    disabled={lang.isDefault}
                    className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold transition touch-tap active:scale-95 ${
                      lang.isDefault
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : lang.enabled
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {lang.isDefault
                      ? 'Always Active'
                      : lang.enabled
                      ? 'Disable for Users'
                      : 'Enable for Users'}
                  </button>

                  {!lang.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLanguage(lang.id, lang.name)}
                      className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition touch-tap"
                      title="Remove Language"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: System Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl rounded-3xl bg-white p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">System Platform Configuration</h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Free Sign-Up Minutes (for new registrations)
            </label>
            <input
              type="number"
              value={settings.freeMinutes}
              onChange={(e) =>
                onSaveSettings({ ...settings, freeMinutes: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm sm:text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Telebirr Receiver Account
            </label>
            <input
              type="text"
              value={settings.telebirrAccount}
              onChange={(e) => {
                const val = e.target.value;
                const currentPlatforms = settings.paymentPlatforms || INITIAL_PAYMENT_PLATFORMS;
                const updatedPlatforms = currentPlatforms.map((p) =>
                  p.id === 'plat-telebirr' || p.name.toLowerCase().includes('telebirr')
                    ? { ...p, accountNumber: val }
                    : p
                );
                onSaveSettings({
                  ...settings,
                  telebirrAccount: val,
                  paymentPlatforms: updatedPlatforms,
                });
              }}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm sm:text-xs font-bold font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              CBE Receiver Account
            </label>
            <input
              type="text"
              value={settings.cbeAccount}
              onChange={(e) => {
                const val = e.target.value;
                const currentPlatforms = settings.paymentPlatforms || INITIAL_PAYMENT_PLATFORMS;
                const updatedPlatforms = currentPlatforms.map((p) =>
                  p.id === 'plat-cbe' || p.name.toLowerCase().includes('cbe') || p.name.toLowerCase().includes('commercial bank')
                    ? { ...p, accountNumber: val }
                    : p
                );
                onSaveSettings({
                  ...settings,
                  cbeAccount: val,
                  paymentPlatforms: updatedPlatforms,
                });
              }}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm sm:text-xs font-bold font-mono"
            />
          </div>

          {/* Admin Security & Credentials */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-600">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal Security Credentials
            </h4>
            <p className="text-[11px] text-slate-500">
              These credentials protect access to this Admin Console at <code className="px-1 py-0.5 rounded bg-slate-100 font-mono">/admin</code>.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Admin Username
              </label>
              <input
                type="text"
                value={settings.adminUsername || 'admin'}
                onChange={(e) =>
                  onSaveSettings({ ...settings, adminUsername: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm sm:text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={settings.adminEmail || 'thebigel16@gmail.com'}
                onChange={(e) =>
                  onSaveSettings({ ...settings, adminEmail: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm sm:text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Admin Password
              </label>
              <input
                type="text"
                value={settings.adminPassword || 'bgern@2026'}
                onChange={(e) =>
                  onSaveSettings({ ...settings, adminPassword: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm sm:text-xs font-bold font-mono"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Google Gemini AI Transcription
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">
                This key performs the actual speech-to-text transcription of your uploaded videos into Amharic.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Google Gemini API Key
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={settings.geminiApiKey || ''}
                onChange={(e) =>
                  onSaveSettings({ ...settings, geminiApiKey: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm sm:text-xs font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Gemini Model
              </label>
              <select
                value={settings.geminiModel || 'gemini-1.5-pro'}
                onChange={(e) =>
                  onSaveSettings({ ...settings, geminiModel: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm sm:text-xs font-bold"
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => showToast('success', 'System settings saved successfully.')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 active:scale-95 touch-tap transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Receipt Image View Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="relative max-w-lg w-full bg-white rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1" />
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Bank Transfer Receipt</h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center justify-center touch-tap"
              >
                ✕
              </button>
            </div>
            <img
              src={selectedReceipt}
              alt="Receipt"
              className="w-full max-h-[65vh] object-contain rounded-2xl bg-slate-100"
            />
          </div>
        </div>
      )}

      {/* Grant Minutes Modal */}
      {grantUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="max-w-sm w-full bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1" />
            <h4 className="text-base font-bold text-slate-900">Grant Minutes</h4>
            <p className="text-xs text-slate-500">
              Grant transcription balance directly to <strong>{grantUser.name}</strong>.
            </p>

            <form onSubmit={handleGrantMinutesSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Minutes to Add
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={minutesToGrant}
                  onChange={(e) => setMinutesToGrant(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGrantUser(null)}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 touch-tap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 touch-tap"
                >
                  Grant Minutes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Manual Payment Platform Modal */}
      {showPlatformModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="max-w-md w-full bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">
                {editingPlatformId ? 'Edit Payment Platform' : 'Add Manual Payment Platform'}
              </h4>
              <button
                type="button"
                onClick={() => setShowPlatformModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlatform} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Platform Name (የመድረኩ ስም) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telebirr, CBE, Bank of Abyssinia, Awash Bank, Dashen"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Account Number / Phone / IBAN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +251 911 234 567 or 1000 4819 2837 4"
                  value={platformAccountNumber}
                  onChange={(e) => setPlatformAccountNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bgern Media / Amharic Caption Technologies PLC"
                  value={platformAccountHolder}
                  onChange={(e) => setPlatformAccountHolder(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Instructions for User
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Send transfer screenshot and paste reference number"
                  value={platformInstructions}
                  onChange={(e) => setPlatformInstructions(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Badge Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Instant, Popular, Verified, Zero Fee"
                  value={platformBadge}
                  onChange={(e) => setPlatformBadge(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlatformModal(false)}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 touch-tap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 touch-tap"
                >
                  {editingPlatformId ? 'Save Changes' : 'Add Platform'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Caption Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="max-w-md w-full bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1" />
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Add Caption Language</h4>
              <button
                type="button"
                onClick={() => setShowLanguageModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Only <strong>Amharic (አማርኛ)</strong> is available to users by default. Adding a language here and enabling it makes it selectable in the user upload options.
            </p>

            <form onSubmit={handleSaveLanguage} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Language Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tigrinya, Afaan Oromo, Somali, Sidama, English"
                  value={langName}
                  onChange={(e) => setLangName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Native Script Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ትግርኛ, Afaan Oromoo, Af-Soomaali, Sidaamu Afoo"
                  value={langNativeName}
                  onChange={(e) => setLangNativeName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Flag Emoji (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🇪🇹 or 🌐"
                  value={langFlag}
                  onChange={(e) => setLangFlag(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLanguageModal(false)}
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-95 touch-tap"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 touch-tap"
                >
                  Enable For Users
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
