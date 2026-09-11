import React, { useState, useRef } from 'react';
import {
  Tag,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Copy,
  Check,
  Building2,
  Phone,
  Sparkles,
  ShieldCheck,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import { User, MinuteTransaction, PricingPackage, PaymentRecord, SystemSettings, ManualPaymentPlatform } from '../types';
import { formatTimeSeconds } from '../lib/subtitles';
import { INITIAL_PACKAGES, ALL_PLANS_INCLUDED_FEATURES } from '../lib/amharicData';
import { StorageAPI, INITIAL_PAYMENT_PLATFORMS } from '../lib/storage';

interface WalletViewProps {
  user: User;
  transactions: MinuteTransaction[];
  onSubmitReceipt: (payment: PaymentRecord) => void;
  onActivatePackage?: (packageId: string, method?: string) => void;
  settings?: SystemSettings;
  autoOpenPaymentModal?: boolean;
  onModalClosed?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  transactions,
  onSubmitReceipt,
  onActivatePackage,
  settings,
  autoOpenPaymentModal,
  onModalClosed,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<PricingPackage | null>(INITIAL_PACKAGES[1]);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Auto-open payment modal when user is redirected from Upload due to insufficient balance
  React.useEffect(() => {
    if (autoOpenPaymentModal) {
      setShowUploadModal(true);
      onModalClosed?.();
    }
  }, [autoOpenPaymentModal]);

  // Active payment platforms dynamically configured by Admin
  const activePlatforms: ManualPaymentPlatform[] = React.useMemo(() => {
    const list = settings?.paymentPlatforms || StorageAPI.getSettings().paymentPlatforms || [];
    const filtered = list.filter((p) => p.isActive);
    return filtered.length > 0 ? filtered : INITIAL_PAYMENT_PLATFORMS;
  }, [settings]);

  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(activePlatforms[0]?.id || 'plat-telebirr');

  // Maintain valid platform selection
  const currentPlatform: ManualPaymentPlatform = React.useMemo(() => {
    const found = activePlatforms.find((p) => p.id === selectedPlatformId);
    return found || activePlatforms[0];
  }, [activePlatforms, selectedPlatformId]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleReceiptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !currentPlatform) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      minutes: selectedPackage.minutes,
      amountEtb: selectedPackage.priceEtb,
      paymentMethod: currentPlatform.name,
      referenceNumber: referenceNumber || `TRX-${Math.floor(100000000 + Math.random() * 900000000)}`,
      receiptUrl:
        receiptPreview ||
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    onSubmitReceipt(newPayment);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowUploadModal(false);
      setReferenceNumber('');
      setReceiptPreview('');
    }, 2500);
  };

  const isExpired = user.availableMinutes <= 0;
  const currentPkg = INITIAL_PACKAGES.find((p) => p.id === user.plan);
  const totalPkgMinutes = currentPkg ? currentPkg.minutes : 14;
  const totalPkgSeconds = totalPkgMinutes * 60;
  const remainingPercent =
    totalPkgSeconds > 0 ? Math.min(100, Math.max(0, Math.round((user.availableMinutes / totalPkgSeconds) * 100))) : 0;

  return (
    <div className="space-y-6 pb-28 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Price & Packages</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your transcription balance, packages, and payment history
        </p>
      </div>

      {/* Available Minutes Card (Active vs Expired State) */}
      <div
        className={`rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden transition-all ${
          isExpired
            ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 border-2 border-rose-500/50 shadow-rose-900/30'
            : 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-blue-600/20'
        }`}
      >
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold">
              <Clock className={`w-4 h-4 ${isExpired ? 'text-rose-400' : 'text-blue-200'}`} />
              <span className={isExpired ? 'text-rose-200' : 'text-blue-100'}>
                {isExpired ? 'Package Status: Expired (ደቂቃ አልቋል)' : 'Available Transcription Balance'}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                {formatTimeSeconds(user.availableMinutes)}
              </span>
              {isExpired && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/30 border border-rose-400/50 text-rose-200 text-xs font-extrabold uppercase tracking-wide animate-pulse">
                  Expired
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isExpired ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30' : 'bg-white/20 text-white'
                }`}
              >
                Plan: {user.plan}
              </span>

              <span className={isExpired ? 'text-rose-200/90 font-medium' : 'text-blue-100/90 font-medium'}>
                {isExpired
                  ? `Your ${user.plan.toUpperCase()} package minutes are finished. Subtitle generation is paused.`
                  : `Active (${remainingPercent}% remaining). Subtitles expire once your ${totalPkgMinutes} min limit is reached.`}
              </span>
            </div>

            {/* Remaining Minutes Progress Bar */}
            <div className="mt-3 w-full max-w-md bg-black/30 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExpired ? 'bg-rose-500 w-0' : remainingPercent > 20 ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${isExpired ? 0 : remainingPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('pricing-packages');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else setShowUploadModal(true);
            }}
            className={`self-start sm:self-auto min-h-[44px] px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition active:scale-95 touch-tap flex items-center gap-2 ${
              isExpired
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white shadow-rose-600/30'
                : 'bg-white text-blue-700 hover:bg-blue-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isExpired ? 'Upgrade / Renew Package' : 'Top Up Minutes'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner: ALL PLANS INCLUDE */}
      <div className="rounded-2xl bg-[#111622] border border-slate-800/80 p-4 sm:p-5 flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-xl">
        <div className="shrink-0 md:pr-6 md:border-r border-slate-800/80 text-center md:text-left">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            ALL PLANS INCLUDE
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 w-full">
          {ALL_PLANS_INCLUDED_FEATURES.map((feat) => (
            <div key={feat} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-200">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buy Minutes Packages */}
      <div id="pricing-packages" className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          {INITIAL_PACKAGES.map((pkg) => {
            const isPopular = Boolean(pkg.popular);

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between ${
                  isPopular
                    ? 'border-2 border-blue-500 bg-[#121c2e] ring-1 ring-blue-500/50 shadow-2xl shadow-blue-500/20 md:-translate-y-1'
                    : 'border border-slate-800/80 bg-[#131926] hover:border-slate-700 shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-blue-500/40 whitespace-nowrap">
                    {pkg.badge || 'MOST POPULAR'}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Plan Name */}
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {pkg.priceEtb}
                    </span>
                    <span className="text-xs font-bold text-slate-400 ml-1">
                      ETB
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="pt-2 flex items-center gap-2 text-slate-300 text-sm font-semibold">
                    <Clock className="w-4 h-4 text-slate-400 stroke-[2.2]" />
                    <span>{pkg.minutes} Minute</span>
                  </div>

                  {/* Credits */}
                  <div className="flex items-baseline gap-1.5 pt-0.5">
                    <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      {pkg.credits?.toLocaleString() || '30,000'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      CREDITS
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowUploadModal(true);
                    }}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs transition active:scale-95 touch-tap flex items-center justify-center gap-1.5 shadow-md ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40'
                        : 'bg-[#232936] hover:bg-[#2e3748] text-white border border-slate-700/50'
                    }`}
                  >
                    <span>{pkg.buttonText || `Get ${pkg.name}`}</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History Ledger (Image 2 screen 1) */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Minute Balance Ledger</h2>

        <div className="rounded-3xl bg-white border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {transactions.map((tx) => {
            const isPositive = tx.minutesChange > 0;
            return (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{tx.description}</h4>
                    <p className="text-[11px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()} at{' '}
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-mono font-bold ${
                      isPositive ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {tx.formattedChange}
                  </span>
                  <p className="text-[10px] text-slate-400">min:sec</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Receipt Upload & Bank Info Modal (Image 2 screen 2) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-t sm:border border-slate-100 max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5">
            {/* Mobile bottom-sheet handle pill */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-1" />
            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Receipt Submitted!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your payment receipt has been submitted to admin approval queue. Minutes will be credited upon verification.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Pay & Upload Receipt</h3>
                    <p className="text-xs text-slate-500">
                      Package: <strong>{selectedPackage?.name}</strong> ({selectedPackage?.priceEtb} ETB)
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 active:bg-slate-200 transition touch-tap"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>

                {/* Step 1: Transfer Money to Account */}
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      1. Select Payment Method & Transfer {selectedPackage?.priceEtb} ETB
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      Manual Verification
                    </span>
                  </div>

                  {/* Dynamic payment platform buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {activePlatforms.map((platform) => {
                      const isSelected = currentPlatform?.id === platform.id;
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => setSelectedPlatformId(platform.id)}
                          className={`min-h-[44px] py-2 px-2.5 rounded-xl border text-xs font-bold transition active:scale-95 touch-tap flex flex-col items-start justify-center gap-0.5 relative ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{platform.name}</span>
                            {platform.badge && (
                              <span
                                className={`text-[9px] px-1 py-0.2 rounded font-black uppercase tracking-wider ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {platform.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {currentPlatform && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {currentPlatform.name} Account Details
                          </span>
                          <p className="text-sm font-mono font-bold text-slate-900 truncate">
                            {currentPlatform.accountNumber}
                          </p>
                          <p className="text-[11px] text-slate-600 truncate font-medium">
                            Account Holder: <strong className="text-slate-900">{currentPlatform.accountHolder}</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(currentPlatform.accountNumber, currentPlatform.id)
                          }
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition touch-tap shrink-0"
                          title="Copy Account Number"
                          aria-label="Copy Account Number"
                        >
                          {copiedText === currentPlatform.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {currentPlatform.instructions && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          💡 {currentPlatform.instructions}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Upload Receipt Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      2. Transaction / Reference Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TRX-98234172 or FT241829..."
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm sm:text-xs font-mono font-semibold text-slate-900 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      3. Upload Payment Receipt / Screenshot
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleReceiptFile}
                      className="hidden"
                    />

                    {receiptPreview ? (
                      <div className="relative rounded-2xl border border-slate-200 overflow-hidden aspect-video bg-slate-100 flex items-center justify-center">
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold backdrop-blur-xs hover:bg-black active:scale-95 touch-tap"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer active:scale-[0.99] touch-tap"
                      >
                        <Upload className="w-7 h-7 text-blue-600 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-700">Tap to upload screenshot</p>
                        <p className="text-[11px] text-slate-400">PNG, JPG or PDF receipt</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[48px] py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition active:scale-98 touch-tap flex items-center justify-center"
                  >
                    Submit Receipt for Approval
                  </button>

                  {/* Instant Test Activation for quick package verification */}
                  {onActivatePackage && selectedPackage && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onActivatePackage(selectedPackage.id as any, 'Instant Activation');
                          setSubmitSuccess(true);
                          setTimeout(() => {
                            setSubmitSuccess(false);
                            setShowUploadModal(false);
                          }, 1200);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>⚡ Instant Test Activation: {selectedPackage.name} ({selectedPackage.minutes} min)</span>
                      </button>
                      <p className="text-[10px] text-slate-400">
                        Instantly activates {selectedPackage.minutes} minutes for immediate subtitle generation & expiration testing.
                      </p>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const PriceView = WalletView;
