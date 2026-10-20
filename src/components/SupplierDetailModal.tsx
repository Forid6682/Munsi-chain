import React, { useState } from 'react';
import { Supplier, MESSAGE_TEMPLATES } from '../types/supplier';
import { createWhatsAppUrl, interpolateMessage, copyToClipboard } from '../utils/whatsapp';
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
  MessageCircle,
  Copy,
  Check,
  Edit,
  Trash2,
  Share2,
} from 'lucide-react';

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  onClose,
  onEdit,
  onDelete,
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
      category: supplier.categories[0],
    });
    const url = createWhatsAppUrl(supplier.cleanPhone || supplier.phone, customized);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenFacebook = () => {
    if (!supplier.facebookUrl) return;
    window.open(supplier.facebookUrl, '_blank', 'noopener,noreferrer');
  };

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

          {/* Quick contact pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Direct WhatsApp Callout */}
            <button
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white stroke-none" />
              <span>Chat on WhatsApp</span>
            </button>

            {/* Direct Facebook Callout */}
            {supplier.facebookUrl ? (
              <button
                onClick={handleOpenFacebook}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook Profile</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>
            ) : null}

            {/* Phone Call */}
            <a
              href={`tel:${supplier.cleanPhone || supplier.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>

            {/* Copy phone */}
            <button
              onClick={handleCopyPhone}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : supplier.phone}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Categories & Tags */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Categories & Labels
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
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Pricing List / Catalog Details
            </h4>
            {supplier.pricingCatalog ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {supplier.pricingCatalog}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No pricing details recorded yet.</p>
            )}
          </div>

          {/* Location & Maps */}
          {supplier.location && (
            <div className="flex items-start justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Location / Address</p>
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
          {supplier.notes && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                Private Notes (Delivery speed, advance policy, terms)
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
              Send Prefilled WhatsApp Message
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
                <span>Launch WhatsApp Deep Link</span>
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
            <span>Delete</span>
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
              <span>Edit Details</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
