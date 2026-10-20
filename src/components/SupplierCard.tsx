import React, { useState } from 'react';
import { Supplier } from '../types/supplier';
import { createWhatsAppUrl, copyToClipboard } from '../utils/whatsapp';
import {
  MessageCircle,
  MapPin,
  Star,
  Tag,
  Check,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  DollarSign,
  FileText,
  Building,
} from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onViewDetails: (supplier: Supplier) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyToClipboard(supplier.phone);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = createWhatsAppUrl(
      supplier.cleanPhone || supplier.phone,
      `Hello ${supplier.name}, I am contacting you regarding your products.`
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!supplier.facebookUrl) return;
    window.open(supplier.facebookUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onViewDetails(supplier)}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Banner / Selection bar */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Checkbox & Header */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(supplier.id);
              }}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-slate-300 text-transparent hover:border-emerald-500'
              }`}
              title={isSelected ? 'Deselect from WhatsApp Broadcast' : 'Select for WhatsApp Broadcast'}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                {supplier.name}
              </h2>
              {supplier.companyName ? (
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{supplier.companyName}</span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Rating Badge */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="text-xs font-bold text-amber-900">{supplier.rating}.0</span>
          </div>
        </div>

        {/* Categories Chips */}
        {supplier.categories && supplier.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {supplier.categories.map((cat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100/70 text-emerald-800 border border-emerald-200/50"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Pricing / Catalog preview */}
        {supplier.pricingCatalog && (
          <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">
              <strong className="text-slate-700 font-medium">Pricing: </strong>
              {supplier.pricingCatalog}
            </p>
          </div>
        )}

        {/* Location snippet */}
        {supplier.location && (
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{supplier.location}</span>
          </p>
        )}

        {/* Notes snippet */}
        {supplier.notes && (
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-1 italic flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>"{supplier.notes}"</span>
          </p>
        )}

        {/* Tags / Labels */}
        {supplier.tags && supplier.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {supplier.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer: WhatsApp, Facebook & Quick Actions */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Direct WhatsApp Deep Link */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg shadow-2xs transition active:scale-95"
            title="Open WhatsApp chat with prefilled message"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white stroke-none" />
            <span>WhatsApp</span>
          </button>

          {/* Direct Facebook Link */}
          {supplier.facebookUrl ? (
            <button
              type="button"
              onClick={handleFacebookClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1877F2] hover:bg-[#0c63d4] text-white text-xs font-semibold rounded-lg shadow-2xs transition active:scale-95"
              title="Open Facebook Profile / Page in browser or Facebook App"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="hidden sm:inline">Facebook</span>
            </button>
          ) : (
            <span
              className="px-2 py-1 text-[11px] text-slate-400 bg-slate-100 rounded-md"
              title="No Facebook link provided"
            >
              No FB
            </span>
          )}

          {/* Copy Phone Number */}
          <button
            type="button"
            onClick={handleCopyPhone}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition"
            title={copied ? 'Copied!' : `Copy phone: ${supplier.phone}`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Edit & Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(supplier);
            }}
            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            title="Edit Supplier"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete supplier "${supplier.name}"?`)) {
                onDelete(supplier.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete Supplier"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
