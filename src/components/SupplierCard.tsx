import React, { useState } from 'react';
import { Supplier } from '../types/supplier';
import { ChannelActionButtons } from './ChannelActionButtons';
import { copyToClipboard } from '../utils/whatsapp';
import {
  MapPin,
  Star,
  Tag,
  Check,
  Copy,
  Edit,
  Trash2,
  DollarSign,
  FileText,
  Building,
  Package,
  EyeOff,
  Eye,
  Lock,
} from 'lucide-react';

interface SupplierCardProps {
  supplier: Supplier;
  isSelected: boolean;
  isAdmin: boolean;
  searchQuery?: string;
  onToggleSelect: (id: string) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onViewDetails: (supplier: Supplier) => void;
  onTogglePriceVisibility?: (id: string, currentHidden: boolean) => void;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  isSelected,
  isAdmin,
  searchQuery = '',
  onToggleSelect,
  onEdit,
  onDelete,
  onViewDetails,
  onTogglePriceVisibility,
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

  const isPriceHidden = supplier.isPricingHidden && !isAdmin;
  const isNotesHidden = supplier.isNotesHidden && !isAdmin;

  // Highlight products matching search
  const q = searchQuery.toLowerCase().trim();
  const matchingProducts = q && supplier.products
    ? supplier.products.filter((p) => p.toLowerCase().includes(q))
    : [];

  return (
    <div
      onClick={() => onViewDetails(supplier)}
      className={`group relative rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md'
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
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                  {supplier.name}
                </h3>
                {supplier.isHidden && (
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                    Hidden
                  </span>
                )}
              </div>
              {supplier.companyName ? (
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{supplier.companyName}</span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Rating Badge */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200/80 shrink-0">
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

        {/* Specific Products List (Important for search) */}
        {supplier.products && supplier.products.length > 0 && (
          <div className="mt-2.5">
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
              <Package className="w-3 h-3 text-emerald-600" />
              <span>প্রডাক্ট সমূহ ({supplier.products.length}):</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {supplier.products.slice(0, 5).map((prod, idx) => {
                const isMatch = matchingProducts.includes(prod);
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                      isMatch
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold ring-1 ring-amber-400'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {prod}
                  </span>
                );
              })}
              {supplier.products.length > 5 && (
                <span className="text-[10px] text-slate-400 px-1 py-0.5">
                  +{supplier.products.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pricing / Catalog preview (with Admin Hide/Show protection) */}
        <div className="mt-2.5">
          {isPriceHidden ? (
            <div className="flex items-center gap-2 p-2 bg-slate-100/80 rounded-xl text-slate-500 text-xs border border-dashed border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="italic">প্রডাক্ট প্রাইস ও ক্যাটালগ গোপন রাখা হয়েছে (Admin Restricted)</span>
            </div>
          ) : supplier.pricingCatalog ? (
            <div className="relative flex items-start justify-between gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-start gap-1.5 min-w-0">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="line-clamp-2 leading-relaxed">
                  <strong className="text-slate-700 font-medium">Pricing: </strong>
                  {supplier.pricingCatalog}
                </p>
              </div>

              {/* Admin toggle price visibility button */}
              {isAdmin && onTogglePriceVisibility && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePriceVisibility(supplier.id, !!supplier.isPricingHidden);
                  }}
                  className={`p-1 rounded-md text-xs shrink-0 transition ${
                    supplier.isPricingHidden
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title={supplier.isPricingHidden ? 'Price is Hidden. Click to Unhide.' : 'Price is Visible. Click to Hide from public.'}
                >
                  {supplier.isPricingHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Location snippet */}
        {supplier.location && (
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{supplier.location}</span>
          </p>
        )}

        {/* Notes snippet (if not hidden) */}
        {!isNotesHidden && supplier.notes && (
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

      {/* Action Footer: Dynamically renders ONLY selected communication channels */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <ChannelActionButtons supplier={supplier} compact={false} />

        {/* Copy Phone & Manage */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopyPhone}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition"
            title={copied ? 'Copied!' : `Copy phone: ${supplier.phone}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

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
