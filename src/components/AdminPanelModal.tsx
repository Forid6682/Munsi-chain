import React, { useState } from 'react';
import { Supplier, AdminSettings } from '../types/supplier';
import {
  Shield,
  X,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Package,
  Layers,
  Check,
  AlertCircle,
  Key,
  Database,
  Building,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  userEmail: string | null;
  onAuthenticateAdmin: (passcode: string) => boolean;
  onExitAdmin: () => void;
  suppliers: Supplier[];
  onUpdateSupplier: (id: string, partial: Partial<Supplier>) => Promise<void>;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: Partial<AdminSettings>) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  userEmail,
  onAuthenticateAdmin,
  onExitAdmin,
  suppliers,
  onUpdateSupplier,
  adminSettings,
  onUpdateAdminSettings,
}) => {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuthenticateAdmin(passcodeInput);
    if (!success) {
      setAuthError(true);
    } else {
      setAuthError(false);
      setPasscodeInput('');
      showNotice('এ্যাডমিন মোড সক্রিয় হয়েছে!');
    }
  };

  // Bulk actions
  const handleHideAllPrices = async () => {
    for (const s of suppliers) {
      if (!s.isPricingHidden) {
        await onUpdateSupplier(s.id, { isPricingHidden: true });
      }
    }
    showNotice('সকল সাপ্লায়ারের প্রাইস গোপন করা হয়েছে');
  };

  const handleShowAllPrices = async () => {
    for (const s of suppliers) {
      if (s.isPricingHidden) {
        await onUpdateSupplier(s.id, { isPricingHidden: false });
      }
    }
    showNotice('সকল সাপ্লায়ারের প্রাইস দৃশ্যমান করা হয়েছে');
  };

  const handleUnhideAllSuppliers = async () => {
    for (const s of suppliers) {
      if (s.isHidden) {
        await onUpdateSupplier(s.id, { isHidden: false });
      }
    }
    showNotice('সকল হিডেন সাপ্লায়ার প্রদর্শিত করা হয়েছে');
  };

  // Counts
  const hiddenPriceCount = suppliers.filter((s) => s.isPricingHidden).length;
  const hiddenSuppliersCount = suppliers.filter((s) => s.isHidden).length;
  const totalProductsCount = suppliers.reduce((acc, s) => acc + (s.products?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">এ্যাডমিন কন্ট্রোল প্যানেল</h3>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                    Admin Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    Locked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                সাপ্লায়ারের প্রাইস ও সংবেদনশীল তথ্য গোপন বা প্রকাশের ব্যবস্থাপনা
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Unlock view if not authenticated as admin */}
          {!isAdmin ? (
            <div className="max-w-md mx-auto py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">এ্যাডমিন পিন কোড প্রবেশ করান</h4>
                <p className="text-xs text-slate-500 mt-1">
                  প্রাইস এবং প্রাইভেসি সেটিংস পরিচালনা করতে পাসকোড দিন (ডিফল্ট: <strong>1234</strong>)
                </p>
                {userEmail === 'ahmedmdforid39@gmail.com' && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    Super Admin একাউন্ট ({userEmail}) শনাক্ত হয়েছে
                  </p>
                )}
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={(e) => {
                      setPasscodeInput(e.target.value);
                      setAuthError(false);
                    }}
                    placeholder="পাসকোড (1234)..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center tracking-widest font-mono"
                    autoFocus
                  />
                </div>
                {authError && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> ভুল পাসকোড! পুনরায় চেষ্টা করুন।
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition"
                >
                  এ্যাডমিন মোডে প্রবেশ করুন
                </button>
              </form>
            </div>
          ) : (
            /* Admin Mode Active */
            <div className="space-y-6">
              {/* Top Stats Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">মোট সাপ্লায়ার</p>
                  <p className="text-lg font-bold text-slate-900">{suppliers.length}</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <p className="text-[11px] text-amber-700 font-medium">প্রাইস গোপন রয়েছে</p>
                  <p className="text-lg font-bold text-amber-900">{hiddenPriceCount}</p>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                  <p className="text-[11px] text-rose-700 font-medium">হিডেন সাপ্লায়ার</p>
                  <p className="text-lg font-bold text-rose-900">{hiddenSuppliersCount}</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-[11px] text-emerald-700 font-medium">মোট প্রডাক্ট আইটেম</p>
                  <p className="text-lg font-bold text-emerald-900">{totalProductsCount}</p>
                </div>
              </div>

              {/* Quick Bulk Actions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">বাল্ক প্রাইভেসি একশন</h4>
                  <p className="text-[11px] text-slate-500">১ ক্লিকে সব সাপ্লায়ারের প্রাইস বা প্রোফাইল হাইড/আনহাইড করুন</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleHideAllPrices}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>সকল প্রাইস হাইড করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShowAllPrices}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>সকল প্রাইস দেখান</span>
                  </button>

                  {hiddenSuppliersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleUnhideAllSuppliers}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
                    >
                      <span>সকল হিডেন আনলক</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Per Supplier Visibility Management Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  সাপ্লায়ার প্রাইস ও ভিজিবিলিটি তালিকা ({suppliers.length})
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  <div className="bg-slate-100/80 px-4 py-2.5 grid grid-cols-12 text-xs font-bold text-slate-700">
                    <span className="col-span-5">সাপ্লায়ার ও প্রডাক্ট</span>
                    <span className="col-span-3 text-center">প্রডাক্ট প্রাইস</span>
                    <span className="col-span-2 text-center">নোটস</span>
                    <span className="col-span-2 text-right">লিস্টে প্রদর্শন</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {suppliers.map((s) => (
                      <div
                        key={s.id}
                        className="px-4 py-3 grid grid-cols-12 items-center text-xs hover:bg-slate-50 transition"
                      >
                        {/* Name & products */}
                        <div className="col-span-5 pr-2">
                          <p className="font-bold text-slate-900 truncate">{s.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{s.companyName || s.phone}</p>
                          {s.products && s.products.length > 0 && (
                            <p className="text-[10px] text-emerald-700 truncate mt-0.5">
                              {s.products.slice(0, 3).join(', ')}
                              {s.products.length > 3 ? ` (+${s.products.length - 3})` : ''}
                            </p>
                          )}
                        </div>

                        {/* Price Hide/Show Toggle */}
                        <div className="col-span-3 flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSupplier(s.id, { isPricingHidden: !s.isPricingHidden })
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              s.isPricingHidden
                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {s.isPricingHidden ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>লুকানো (Hidden)</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>দৃশ্যমান (Visible)</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Notes Hide/Show Toggle */}
                        <div className="col-span-2 flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSupplier(s.id, { isNotesHidden: !s.isNotesHidden })
                            }
                            className={`p-1.5 rounded-lg transition ${
                              s.isNotesHidden
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            title={s.isNotesHidden ? 'Notes are hidden' : 'Notes are visible'}
                          >
                            {s.isNotesHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Directory Hide/Show Toggle */}
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onUpdateSupplier(s.id, { isHidden: !s.isHidden })}
                            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                              s.isHidden
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {s.isHidden ? 'Hidden' : 'Active'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Session Controls */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  এ্যাডমিন মোড চালু থাকলে আপনি সকল হিডেন প্রাইস এবং নোট দেখতে পারবেন।
                </span>
                <button
                  type="button"
                  onClick={onExitAdmin}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
                >
                  এ্যাডমিন মোড থেকে বের হন (Lock)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
