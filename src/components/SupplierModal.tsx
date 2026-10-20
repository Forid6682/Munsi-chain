import React, { useState, useEffect } from 'react';
import {
  Supplier,
  SupplierFormData,
  CommunicationChannelId,
  AVAILABLE_CHANNELS,
  COMMON_CATEGORIES,
  COMMON_TAGS,
} from '../types/supplier';
import { cleanPhoneNumber } from '../utils/whatsapp';
import {
  X,
  Star,
  Building,
  Phone,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  ExternalLink,
  Plus,
  Package,
  Send,
  Mail,
  PhoneCall,
  Check,
  Shield,
  EyeOff,
} from 'lucide-react';

interface SupplierModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onSave: (data: SupplierFormData) => Promise<void>;
  initialData?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  isAdmin,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [imo, setImo] = useState('');

  // Selected communication channels
  const [channels, setChannels] = useState<CommunicationChannelId[]>(['whatsapp', 'phone']);

  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');

  // Products
  const [products, setProducts] = useState<string[]>([]);
  const [productInput, setProductInput] = useState('');

  const [pricingCatalog, setPricingCatalog] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  // Admin hide toggles
  const [isPricingHidden, setIsPricingHidden] = useState(false);
  const [isNotesHidden, setIsNotesHidden] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCompanyName(initialData.companyName || '');
      setPhone(initialData.phone || '');
      setFacebookUrl(initialData.facebookUrl || '');
      setTelegram(initialData.telegram || '');
      setEmail(initialData.email || '');
      setImo(initialData.imo || '');
      setChannels(
        initialData.communicationChannels && initialData.communicationChannels.length > 0
          ? initialData.communicationChannels
          : ['whatsapp', 'phone']
      );
      setLocation(initialData.location || '');
      setCategories(initialData.categories || []);
      setProducts(initialData.products || []);
      setPricingCatalog(initialData.pricingCatalog || '');
      setRating(initialData.rating || 5);
      setNotes(initialData.notes || '');
      setTags(initialData.tags || []);
      setIsPricingHidden(!!initialData.isPricingHidden);
      setIsNotesHidden(!!initialData.isNotesHidden);
      setIsHidden(!!initialData.isHidden);
    } else {
      setName('');
      setCompanyName('');
      setPhone('');
      setFacebookUrl('');
      setTelegram('');
      setEmail('');
      setImo('');
      setChannels(['whatsapp', 'phone', 'facebook']);
      setLocation('');
      setCategories(['Fabric & Textiles']);
      setProducts([]);
      setPricingCatalog('');
      setRating(5);
      setNotes('');
      setTags(['Wholesale']);
      setIsPricingHidden(false);
      setIsNotesHidden(false);
      setIsHidden(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleChannel = (id: CommunicationChannelId) => {
    setChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddProduct = () => {
    const trimmed = productInput.trim();
    if (!trimmed) return;
    // Split by commas if multiple entered
    const splitItems = trimmed
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !products.includes(s));

    if (splitItems.length > 0) {
      setProducts((prev) => [...prev, ...splitItems]);
      setProductInput('');
    }
  };

  const handleRemoveProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setCustomCategory('');
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('সাপ্লায়ারের নাম প্রদান করুন (Supplier Name is required)');
      return;
    }
    if (!phone.trim()) {
      setError('যোগাযোগের ফোন নাম্বার দিন (Phone Number is required)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        name: name.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        facebookUrl: facebookUrl.trim(),
        telegram: telegram.trim(),
        email: email.trim(),
        imo: imo.trim(),
        communicationChannels: channels.length > 0 ? channels : ['whatsapp', 'phone'],
        location: location.trim(),
        categories: categories.length > 0 ? categories : ['Other'],
        products,
        pricingCatalog: pricingCatalog.trim(),
        rating,
        notes: notes.trim(),
        tags,
        isPricingHidden,
        isNotesHidden,
        isHidden,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'সাপ্লায়ার সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewClean = cleanPhoneNumber(phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold">
              {initialData ? 'সাপ্লায়ারের তথ্য পরিবর্তন করুন' : 'নতুন সাপ্লায়ার যুক্ত করুন'}
            </h3>
            <p className="text-xs text-emerald-100">
              যোগাযোগ মাধ্যম, প্রডাক্ট লিস্ট এবং প্রাইস ক্যাটালগ নির্ধারণ করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Supplier Name & Business Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সাপ্লায়ার / ব্যক্তির নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                কোম্পানি বা ব্যবসার নাম
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="যেমন: বেঙ্গল ফেব্রিক্স এন্ড ইয়ার্নস"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
              />
            </div>
          </div>

          {/* Communication Channels Selector */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                যোগাযোগের মাধ্যম সমূহ নির্বাচন করুন (Select Communication Channels)
              </label>
              <p className="text-[11px] text-slate-500 mb-2.5">
                যে মাধ্যমগুলো সিলেক্ট করবেন, সাপ্লায়ার কার্ড ও লিস্টে শুধুমাত্র সেই বাটনগুলোই প্রদর্শিত হবে।
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_CHANNELS.map((ch) => {
                  const isChecked = channels.includes(ch.id);
                  return (
                    <button
                      type="button"
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition text-left ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Inputs for Selected Channels */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80">
              {/* Phone / WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    ফোন ও হোয়াটসঅ্যাপ নাম্বার <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1712-345678"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 text-slate-900"
                    required
                  />
                  {phone && (
                    <p className="mt-1 text-[10px] text-emerald-700 font-mono">
                      WhatsApp Target: +{previewClean}
                    </p>
                  )}
                </div>

                {channels.includes('facebook') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook প্রোফাইল বা পেজ লিংক
                      </span>
                    </label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/supplier.page"
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Telegram, Email, IMO */}
              {(channels.includes('telegram') || channels.includes('email') || channels.includes('imo')) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {channels.includes('telegram') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 text-[#229ED9]">
                        <Send className="w-3.5 h-3.5" /> Telegram User/Link
                      </label>
                      <input
                        type="text"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="@username বা link"
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  )}

                  {channels.includes('email') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 text-rose-600">
                        <Mail className="w-3.5 h-3.5" /> Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="supplier@company.com"
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  )}

                  {channels.includes('imo') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1 text-sky-600">
                        <PhoneCall className="w-3.5 h-3.5" /> IMO নাম্বার
                      </label>
                      <input
                        type="text"
                        value={imo}
                        onChange={(e) => setImo(e.target.value)}
                        placeholder="+880 1712-345678"
                        className="w-full rounded-xl border border-slate-300 p-2 text-xs focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Specific Products List (For search indexing) */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
            <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-700" />
              প্রডাক্টের তালিকা (Products Supplied - সার্চে দ্রুত খুঁজে পাওয়ার জন্য)
            </label>
            <p className="text-[11px] text-emerald-800">
              এই সাপ্লায়ার যেসব নির্দিষ্ট মালামাল/প্রডাক্ট সরবরাহ করেন তা লিখুন (কমা দিয়ে একাধিক লিখতে পারেন):
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProduct();
                  }
                }}
                placeholder="যেমন: কটন টুইল, পপলিন ফেব্রিক, মেটাল জিপার, ৫-প্লাই কার্টন..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> যোগ করুন
              </button>
            </div>

            {/* Render added products chips */}
            {products.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {products.map((prod, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-emerald-900 border border-emerald-300 shadow-2xs"
                  >
                    <span>{prod}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(idx)}
                      className="p-0.5 text-slate-400 hover:text-rose-600 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Location / Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              ঠিকানা বা শপের অবস্থান
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="যেমন: শপ ২৪, ইসলামপুর কাপড়ের মার্কেট, ঢাকা"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 text-slate-900"
            />
          </div>

          {/* Product Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              প্রডাক্ট ক্যাটাগরি (Product Categories)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_CATEGORIES.map((cat) => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCategory();
                  }
                }}
                placeholder="নতুন ক্যাটাগরি লিখুন..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddCustomCategory}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Pricing List / Catalog Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              প্রাইসিং ও ক্যাটালগের বিবরণ (Text or Price Range)
            </label>
            <textarea
              value={pricingCatalog}
              onChange={(e) => setPricingCatalog(e.target.value)}
              rows={2}
              placeholder="যেমন: ৳১৪০ - ৳৩৮০/গজ। সর্বনিম্ন অর্ডার: ৩০০ গজ। ৩০% অগ্রিম, বাকি ডেলিভারিতে।"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 text-slate-900"
            />
          </div>

          {/* Private Rating (1 to 5 Stars) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              প্রাইভেট রেটিং (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-slate-200 text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{rating} out of 5 Stars</span>
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              ব্যক্তিগত নোট (Custom Notes - ডেলিভারি স্পিড, পেমেন্ট শর্ত ইত্যাদি)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="যেমন: ডেলিভারি খুব দ্রুত দেয়। তবে কাস্টম অর্ডারে ৫০% অ্যাডভান্স চায়।"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 text-slate-900"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              লেবেল বা ট্যাগ
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition ${
                      isSelected
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="কাস্টম ট্যাগ লিখুন..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Admin Privacy & Visibility Section */}
          <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>এ্যাডমিন প্রাইভেসি ও কন্ট্রোল (Admin Hide Controls)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              এখান থেকে প্রডাক্টের প্রাইস ও সংবেদনশীল তথ্য সাধারণ ভিউ থেকে লুকিয়ে রাখতে পারেন:
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPricingHidden}
                  onChange={(e) => setIsPricingHidden(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">
                  প্রডাক্ট প্রাইস ও ক্যাটালগ গোপন রাখুন (Hide Price & Catalog)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNotesHidden}
                  onChange={(e) => setIsNotesHidden(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">
                  অভ্যন্তরীণ নোট গোপন রাখুন (Hide Private Notes)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHidden}
                  onChange={(e) => setIsHidden(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">
                  সম্পূর্ণ সাপ্লায়ারকে সাধারণ লিস্ট থেকে গোপন রাখুন (Hide Supplier from General Directory)
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : initialData ? 'আপডেট করুন' : 'সাপ্লায়ার সেভ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
