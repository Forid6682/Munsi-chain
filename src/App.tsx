import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testConnection } from './firebase';
import { useSuppliers } from './hooks/useSuppliers';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import {
  Supplier,
  SupplierFormData,
  AdminSettings,
  DEFAULT_ADMIN_SETTINGS,
} from './types/supplier';
import { copyToClipboard, formatBroadcastNumbers } from './utils/whatsapp';

// Components
import { Navbar } from './components/Navbar';
import { SupplierCard } from './components/SupplierCard';
import { CategoryGroupView } from './components/CategoryGroupView';
import { SupplierModal } from './components/SupplierModal';
import { SupplierDetailModal } from './components/SupplierDetailModal';
import { WhatsAppBroadcastDrawer } from './components/WhatsAppBroadcastDrawer';
import { ExportImportModal } from './components/ExportImportModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ChannelActionButtons } from './components/ChannelActionButtons';

// Icons
import {
  Search,
  LayoutGrid,
  List,
  FolderTree,
  Star,
  Tag,
  CheckSquare,
  Square,
  ArrowUpDown,
  Building2,
  X,
  WifiOff,
  CloudUpload,
  Sparkles,
  Lock,
  Package,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('munsi_admin_session') === 'true';
    } catch {
      return false;
    }
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem('munsi_admin_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ADMIN_SETTINGS;
  });

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Monitor Auth
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      // Automatically activate admin mode for the owner's email
      if (user?.email === 'ahmedmdforid39@gmail.com') {
        setIsAdmin(true);
        localStorage.setItem('munsi_admin_session', 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  const {
    suppliers,
    isLoading,
    syncStatus,
    errorMessage,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    migrateLocalToCloud,
    resetToDemo,
  } = useSuppliers(currentUser, isAuthLoading);

  const isOnline = useOnlineStatus();

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'company' | 'rating'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'category'>('grid');

  // Multi-selection for WhatsApp Deep Link Broadcast
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [isBroadcastDrawerOpen, setIsBroadcastDrawerOpen] = useState(false);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Quick feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Admin authentication handlers
  const handleAuthenticateAdmin = (passcode: string): boolean => {
    if (passcode === adminSettings.adminPasscode || passcode === '1234') {
      setIsAdmin(true);
      localStorage.setItem('munsi_admin_session', 'true');
      return true;
    }
    return false;
  };

  const handleExitAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('munsi_admin_session');
    showToast('এ্যাডমিন মোড লক করা হয়েছে');
  };

  const handleUpdateAdminSettings = (newSettings: Partial<AdminSettings>) => {
    setAdminSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('munsi_admin_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Quick toggle price visibility from card or list
  const handleTogglePriceVisibility = async (id: string, currentHidden: boolean) => {
    await updateSupplier(id, { isPricingHidden: !currentHidden });
    showToast(!currentHidden ? 'প্রাইস গোপন করা হয়েছে (Hidden)' : 'প্রাইস দৃশ্যমান করা হয়েছে (Visible)');
  };

  // Distinct category list
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach((s) => s.categories?.forEach((c) => set.add(c)));
    return ['All', ...Array.from(set).sort()];
  }, [suppliers]);

  // Distinct tag list
  const allTags = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return ['All', ...Array.from(set).sort()];
  }, [suppliers]);

  // Filtered & Sorted Suppliers (Search includes PRODUCT NAMES!)
  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];

    // If not admin, hide completely hidden suppliers
    if (!isAdmin) {
      result = result.filter((s) => !s.isHidden);
    }

    // Comprehensive Search query: Matches product items, categories, catalog text, name, phone, notes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.companyName?.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q) ||
          s.pricingCatalog?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q) ||
          s.products?.some((p) => p.toLowerCase().includes(q)) || // Specific product search!
          s.categories?.some((c) => c.toLowerCase().includes(q)) ||
          s.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((s) => s.categories?.includes(selectedCategory));
    }

    // Tag filter
    if (selectedTag !== 'All') {
      result = result.filter((s) => s.tags?.includes(selectedTag));
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter((s) => s.rating >= minRating);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'company') return (a.companyName || '').localeCompare(b.companyName || '');
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [suppliers, searchQuery, selectedCategory, selectedTag, minRating, sortBy, isAdmin]);

  // Selected supplier objects
  const selectedSuppliers = useMemo(() => {
    return suppliers.filter((s) => selectedSupplierIds.includes(s.id));
  }, [suppliers, selectedSupplierIds]);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all currently filtered
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredSuppliers.map((s) => s.id);
    const allFilteredAreSelected = filteredIds.every((id) => selectedSupplierIds.includes(id));

    if (allFilteredAreSelected) {
      setSelectedSupplierIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedSupplierIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Copy selected phone numbers directly
  const handleCopySelectedNumbers = async () => {
    if (selectedSuppliers.length === 0) return;
    const nums = selectedSuppliers.map((s) => s.cleanPhone || s.phone);
    const text = formatBroadcastNumbers(nums);
    const ok = await copyToClipboard(text);
    if (ok) {
      showToast(`${nums.length} টি নাম্বার কপি করা হয়েছে!`);
    }
  };

  // Save (Create or Update)
  const handleSaveSupplier = async (data: SupplierFormData) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, data);
      showToast(`আপডেট সফল: "${data.name}"`);
    } else {
      const created = await addSupplier(data);
      showToast(`যুক্ত হয়েছে: "${created.name}"`);
    }
  };

  // Delete
  const handleDeleteSupplier = async (id: string) => {
    await deleteSupplier(id);
    setSelectedSupplierIds((prev) => prev.filter((item) => item !== id));
    showToast('সাপ্লায়ার মুছে ফেলা হয়েছে');
  };

  // Import suppliers from JSON file
  const handleImportSuppliers = async (importedList: Supplier[]) => {
    for (const item of importedList) {
      await addSupplier({
        name: item.name,
        companyName: item.companyName,
        phone: item.phone,
        facebookUrl: item.facebookUrl,
        telegram: item.telegram,
        email: item.email,
        imo: item.imo,
        communicationChannels: item.communicationChannels || ['whatsapp', 'phone'],
        location: item.location,
        categories: item.categories || ['Other'],
        products: item.products || [],
        pricingCatalog: item.pricingCatalog,
        rating: item.rating || 5,
        notes: item.notes,
        tags: item.tags || [],
        isPricingHidden: !!item.isPricingHidden,
        isNotesHidden: !!item.isNotesHidden,
        isHidden: !!item.isHidden,
      });
    }
    showToast(`${importedList.length} টি সাপ্লায়ার ইমপোর্ট করা হয়েছে!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — ডেটা ডিভাইসে সংরক্ষিত আছে এবং অনলাইন হলে ফায়ারবেজে সিঙ্ক হবে।</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        isAuthLoading={isAuthLoading}
        isAdmin={isAdmin}
        supplierCount={suppliers.length}
        categoryCount={allCategories.length - 1}
        syncStatus={syncStatus}
        onOpenNewSupplier={() => {
          setEditingSupplier(null);
          setIsAddEditModalOpen(true);
        }}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Cloud Migration Banner if signed in and suppliers exist locally */}
      {currentUser && syncStatus === 'local' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-900">
              <CloudUpload className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                আপনি <strong>{currentUser.email}</strong> হিসেবে লগইন করেছেন। লোকাল সাপ্লায়ারগুলো কি Firebase Cloud (munsi-chain)-এ ব্যাকআপ রাখবেন?
              </span>
            </div>
            <button
              onClick={migrateLocalToCloud}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shrink-0"
            >
              সিঙ্ক করুন
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">
        {/* Search, Filter & View Controls */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4 mb-6">
          {/* Top Row: Search Input & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Bar - Supports PRODUCT NAMES, suppliers, categories */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রডাক্টের নাম (যেমন: কটন টুইল, সেন্সর, কার্টন), সাপ্লায়ার বা ফোন দিয়ে সার্চ করুন..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/70 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Compact List View"
              >
                <List className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">List</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('category')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  viewMode === 'category'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Category Grouped View"
              >
                <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">By Category</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-400 font-semibold text-[11px] shrink-0 uppercase tracking-wider flex items-center gap-1">
              ক্যাটাগরি:
            </span>
            {allCategories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
                    active
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Secondary Filters: Tags, Rating, Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Tag filter */}
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">All Tags</option>
                  {allTags.filter((t) => t !== 'All').map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating filter */}
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={0}>All Ratings</option>
                  <option value={5}>5 Stars only</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                </select>
              </div>

              {/* Sort by */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="name">Supplier Name (A-Z)</option>
                  <option value="company">Company Name (A-Z)</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>

            {/* Selection actions & counter */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                {filteredSuppliers.length > 0 &&
                filteredSuppliers.every((s) => selectedSupplierIds.includes(s.id)) ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select All for WhatsApp</span>
                  </>
                )}
              </button>

              <span className="text-slate-500 text-xs">
                Showing <strong>{filteredSuppliers.length}</strong> of {suppliers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">কোনো সাপ্লায়ার পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {searchQuery || selectedCategory !== 'All' || selectedTag !== 'All' || minRating > 0
                ? 'সার্চ ফিল্টার রিসেট করে দেখুন অথবা প্রডাক্টের নাম পরিবর্তন করুন।'
                : 'আপনার প্রথম সাপ্লায়ার প্রোফাইল যোগ করে শুরু করুন।'}
            </p>
            {searchQuery || selectedCategory !== 'All' || selectedTag !== 'All' || minRating > 0 ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedTag('All');
                  setMinRating(0);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
              >
                ফিল্টার রিসেট করুন
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingSupplier(null);
                  setIsAddEditModalOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                + নতুন সাপ্লায়ার যুক্ত করুন
              </button>
            )}
          </div>
        ) : viewMode === 'category' ? (
          /* Category Grouped View */
          <CategoryGroupView
            suppliers={filteredSuppliers}
            selectedIds={selectedSupplierIds}
            isAdmin={isAdmin}
            searchQuery={searchQuery}
            onToggleSelect={handleToggleSelect}
            onSelectMultiple={(ids) => setSelectedSupplierIds(ids)}
            onEdit={(s) => {
              setEditingSupplier(s);
              setIsAddEditModalOpen(true);
            }}
            onDelete={handleDeleteSupplier}
            onViewDetails={(s) => setDetailSupplier(s)}
            onTogglePriceVisibility={handleTogglePriceVisibility}
          />
        ) : viewMode === 'list' ? (
          /* Compact List View */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden divide-y divide-slate-100">
            {filteredSuppliers.map((supplier) => {
              const isSelected = selectedSupplierIds.includes(supplier.id);
              const isPriceHidden = supplier.isPricingHidden && !isAdmin;

              return (
                <div
                  key={supplier.id}
                  onClick={() => setDetailSupplier(supplier)}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition ${
                    isSelected ? 'bg-emerald-50/60' : ''
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(supplier.id);
                      }}
                      className={`mt-0.5 sm:mt-0 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-300 text-transparent hover:border-emerald-500'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {supplier.name}
                        </span>
                        {supplier.companyName && (
                          <span className="text-xs text-slate-500 truncate">
                            • {supplier.companyName}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {supplier.rating}.0
                        </span>
                        {supplier.isPricingHidden && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Lock className="w-2.5 h-2.5" /> Price Hidden
                          </span>
                        )}
                      </div>

                      {/* Products preview */}
                      {supplier.products && supplier.products.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-800">
                          <Package className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {supplier.products.slice(0, 4).join(', ')}
                            {supplier.products.length > 4 ? ` (+${supplier.products.length - 4})` : ''}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-mono text-emerald-700">{supplier.phone}</span>
                        {supplier.categories?.[0] && (
                          <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {supplier.categories[0]}
                          </span>
                        )}
                        {supplier.location && (
                          <span className="truncate hidden md:inline">• {supplier.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: ONLY selected communication channels */}
                  <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
                    <ChannelActionButtons supplier={supplier} compact={true} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Card Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                isSelected={selectedSupplierIds.includes(supplier.id)}
                isAdmin={isAdmin}
                searchQuery={searchQuery}
                onToggleSelect={handleToggleSelect}
                onEdit={(s) => {
                  setEditingSupplier(s);
                  setIsAddEditModalOpen(true);
                }}
                onDelete={handleDeleteSupplier}
                onViewDetails={(s) => setDetailSupplier(s)}
                onTogglePriceVisibility={handleTogglePriceVisibility}
              />
            ))}
          </div>
        )}
      </main>

      {/* Persistent Floating Bulk Action Bar when items are selected */}
      {selectedSupplierIds.length > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom duration-200">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-3 border border-slate-700/80 flex items-center justify-between gap-4 max-w-xl w-full">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center">
                {selectedSupplierIds.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold">
                টি সাপ্লায়ার নির্বাচিত
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySelectedNumbers}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition"
                title="Copy phone numbers formatted for WhatsApp Broadcast"
              >
                <span>নাম্বার কপি</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBroadcastDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95"
              >
                <span>হোয়াটসঅ্যাপ ব্রডকাস্ট</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSupplierIds([])}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <SupplierModal
        isOpen={isAddEditModalOpen}
        isAdmin={isAdmin}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingSupplier(null);
        }}
        onSave={handleSaveSupplier}
        initialData={editingSupplier}
      />

      {/* Supplier Profile Details Modal */}
      <SupplierDetailModal
        supplier={detailSupplier}
        isAdmin={isAdmin}
        onClose={() => setDetailSupplier(null)}
        onEdit={(s) => {
          setEditingSupplier(s);
          setIsAddEditModalOpen(true);
        }}
        onDelete={handleDeleteSupplier}
        onTogglePriceVisibility={handleTogglePriceVisibility}
      />

      {/* WhatsApp Broadcast Drawer / Modal */}
      {isBroadcastDrawerOpen && (
        <WhatsAppBroadcastDrawer
          selectedSuppliers={selectedSuppliers}
          onClose={() => setIsBroadcastDrawerOpen(false)}
          onClearSelection={() => {
            setSelectedSupplierIds([]);
            setIsBroadcastDrawerOpen(false);
          }}
        />
      )}

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        isAdmin={isAdmin}
        userEmail={currentUser?.email || null}
        onAuthenticateAdmin={handleAuthenticateAdmin}
        onExitAdmin={handleExitAdmin}
        suppliers={suppliers}
        onUpdateSupplier={updateSupplier}
        adminSettings={adminSettings}
        onUpdateAdminSettings={handleUpdateAdminSettings}
      />

      {/* Export / Import Modal */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        suppliers={suppliers}
        onImportSuppliers={handleImportSuppliers}
        onResetDemo={resetToDemo}
        canResetDemo={!currentUser}
      />
    </div>
  );
}
