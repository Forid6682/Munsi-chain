import React, { useState, useEffect } from 'react';
import { Supplier, SupplierFormData, COMMON_CATEGORIES, COMMON_TAGS } from '../types/supplier';
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
} from 'lucide-react';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SupplierFormData) => Promise<void>;
  initialData?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [pricingCatalog, setPricingCatalog] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCompanyName(initialData.companyName || '');
      setPhone(initialData.phone || '');
      setFacebookUrl(initialData.facebookUrl || '');
      setLocation(initialData.location || '');
      setCategories(initialData.categories || []);
      setPricingCatalog(initialData.pricingCatalog || '');
      setRating(initialData.rating || 5);
      setNotes(initialData.notes || '');
      setTags(initialData.tags || []);
    } else {
      setName('');
      setCompanyName('');
      setPhone('');
      setFacebookUrl('');
      setLocation('');
      setCategories(['Fabric & Textiles']);
      setPricingCatalog('');
      setRating(5);
      setNotes('');
      setTags(['Wholesale']);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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
      setError('Supplier Name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone Number is required for WhatsApp deep links.');
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
        location: location.trim(),
        categories: categories.length > 0 ? categories : ['Other'],
        pricingCatalog: pricingCatalog.trim(),
        rating,
        notes: notes.trim(),
        tags,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save supplier');
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
            <h3 className="text-lg font-bold">
              {initialData ? 'Edit Supplier Details' : 'Add New Supplier'}
            </h3>
            <p className="text-xs text-emerald-100">
              Complete profile with WhatsApp number and Facebook direct link
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Supplier Name & Business Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supplier / Contact Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Md. Rafiqul Islam"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Business / Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Bengal Fabrics & Yarns Ltd."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
              />
            </div>
          </div>

          {/* Phone (WhatsApp Enabled) & Facebook Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +880 1712-345678 or 01712345678"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                required
              />
              {phone && (
                <p className="mt-1 text-[11px] text-emerald-700 font-mono">
                  WhatsApp wa.me target: +{previewClean}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-blue-600 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook Profile / Page Link
                </span>
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5 text-[11px]"
                  >
                    Test Link <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/supplier.page"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
              />
            </div>
          </div>

          {/* Location / Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location / Address
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Shop 42, Islampur Market, Dhaka"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
            />
          </div>

          {/* Product Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Categories / Items Provided
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
            {/* Custom category input */}
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
                placeholder="Add custom product category..."
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
              Pricing List / Catalog Details (Text or Price Range)
            </label>
            <textarea
              value={pricingCatalog}
              onChange={(e) => setPricingCatalog(e.target.value)}
              rows={2}
              placeholder="e.g. ৳120 - ৳350 / yard. MOQ: 500 pcs. 30% advance on order, balance on delivery."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
            />
          </div>

          {/* Private Rating (1 to 5 Stars) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Private Rating (1 to 5 Stars)
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
              Custom Notes (Internal business notes, delivery speed, payment terms)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Always delivers within 48h. Always asks for 50% advance on custom dyed materials."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
            />
          </div>

          {/* Tags / Labels */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Tags / Labels
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
            {/* Custom Tag input */}
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
                placeholder="Add custom tag (e.g. Urgent, Direct Importer)..."
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

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
