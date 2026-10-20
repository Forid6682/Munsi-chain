import React, { useState } from 'react';
import { Supplier, MESSAGE_TEMPLATES } from '../types/supplier';
import { createWhatsAppUrl, interpolateMessage, copyToClipboard } from '../utils/whatsapp';
import { ChannelActionButtons } from './ChannelActionButtons';
import {
  X,
  Star,
  Building,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Edit,
  Trash2,
  Package,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onTogglePriceVisibility?: (id: string, currentHidden: boolean) => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
  onTogglePriceVisibility,
}) => {
  const [copied, setCopied] = useState(false);
  const [inquiryText, setInquiryText] = useState(
    'Hello, I would like to inquire about current price list and MOQ for your products.'
  );

  if (!supplier) return null;

  const handleCopyPhone = async () => {
    const ok = await copyToClipboard(supplier.phone);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenWhatsApp = () => {
    const customized = interpolateMessage(inquiryText, {
      name: supplier.name,
      company: supplier.companyName,
      category: supplier.categories[0] || (supplier.products?.[0] ?? 'materials'),
    });
    const url = createWhatsAppUrl(supplier.cleanPhone || supplier.phone, customized);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isPriceHidden = supplier.isPricingHidden && !isAdmin;
  const isNotesHidden = supplier.isNotesHidden && !isAdmin;

  const mapsUrl = supplier.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.location)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start justify-between pr-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Supplier Profile
                </span>
                <div className="flex items-center gap-1 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span className="text-xs font-bold text-amber-200">{supplier.rating}.0 / 5</span>
                </div>
                {supplier.isPricingHidden && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/40 text-rose-200 text-[10px] font-bold">
                    Price Hidden
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">
                {supplier.name}
              </h2>
              {supplier.companyName && (
                <p className="text-sm font-medium text-emerald-100 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-4 h-4 text-emerald-300 shrink-0" />
                  {supplier.companyName}
                </p>
              )}
            </div>
          </div>

          {/* Quick contact buttons — ONLY the selected channels */}
          <div className="mt-4 pt-3 border-t border-emerald-700/50 flex flex-wrap items-center gap-2">
            <ChannelActionButtons supplier={supplier} compact={false} />

            {/* Copy phone */}
            <button
              onClick={handleCopyPhone}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : supplier.phone}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Products List */}
          {supplier.products && supplier.products.length > 0 && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-700" />
                প্রডাক্ট তালিকা (Products Supplied)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {supplier.products.map((prod, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-emerald-900 border border-emerald-300 shadow-2xs"
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories & Tags */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              ক্যাটাগরি ও লেবেল
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {supplier.categories.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800"
                >
                  {c}
                </span>
              ))}
              {supplier.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200"
                >
                  <Tag className="w-3 h-3 text-slate-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing List & Catalog */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                প্রডাক্ট প্রাইস ও ক্যাটালগ
              </h4>
              {isAdmin && onTogglePriceVisibility && (
                <button
                  type="button"
                  onClick={() => onTogglePriceVisibility(supplier.id, !!supplier.isPricingHidden)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                    supplier.isPricingHidden
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {supplier.isPricingHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{supplier.isPricingHidden ? 'Hidden (Admin)' : 'Visible (Admin)'}</span>
                </button>
              )}
            </div>

            {isPriceHidden ? (
              <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl text-slate-500 text-xs border border-dashed border-slate-200">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="italic">প্রাইস ও ক্যাটালগের বিবরণ এ্যাডমিন কর্তৃক গোপন রাখা হয়েছে।</span>
              </div>
            ) : supplier.pricingCatalog ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {supplier.pricingCatalog}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">কোনো প্রাইসিং বিবরণ যোগ করা হয়নি।</p>
            )}
          </div>

          {/* Location & Maps */}
          {supplier.location && (
            <div className="flex items-start justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-700">ঠিকানা / লোকেশন</p>
                  <p className="text-xs text-slate-600 mt-0.5">{supplier.location}</p>
                </div>
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-700 hover:underline shrink-0 inline-flex items-center gap-1"
                >
                  Maps <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Custom Notes */}
          {!isNotesHidden && supplier.notes && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                ব্যক্তিগত নোট (Private Notes)
              </h4>
              <p className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-wrap">
                {supplier.notes}
              </p>
            </div>
          )}

          {/* Interactive WhatsApp Composer */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              হোয়াটসঅ্যাপে সরাসরি মেসেজ পাঠান
            </h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {MESSAGE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInquiryText(tmpl.text)}
                  className="px-2 py-0.5 text-[11px] bg-white border border-emerald-200 rounded text-emerald-800 hover:bg-emerald-100 transition"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
            <textarea
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-emerald-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleOpenWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp Deep Link লঞ্চ করুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(`Delete supplier "${supplier.name}"?`)) {
                onDelete(supplier.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>মুছে ফেলুন</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(supplier);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>তথ্য এডিট</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
