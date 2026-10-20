import React, { useState } from 'react';
import { Supplier } from '../types/supplier';
import { SupplierCard } from './SupplierCard';
import { ChevronDown, ChevronRight, Layers, CheckSquare } from 'lucide-react';

interface CategoryGroupViewProps {
  suppliers: Supplier[];
  selectedIds: string[];
  isAdmin: boolean;
  searchQuery?: string;
  onToggleSelect: (id: string) => void;
  onSelectMultiple: (ids: string[]) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onViewDetails: (supplier: Supplier) => void;
  onTogglePriceVisibility?: (id: string, currentHidden: boolean) => void;
}

export const CategoryGroupView: React.FC<CategoryGroupViewProps> = ({
  suppliers,
  selectedIds,
  isAdmin,
  searchQuery = '',
  onToggleSelect,
  onSelectMultiple,
  onEdit,
  onDelete,
  onViewDetails,
  onTogglePriceVisibility,
}) => {
  // Group suppliers by category
  const grouped = React.useMemo(() => {
    const map = new Map<string, Supplier[]>();
    suppliers.forEach((s) => {
      const cats = s.categories && s.categories.length > 0 ? s.categories : ['Uncategorized'];
      cats.forEach((cat) => {
        if (!map.has(cat)) {
          map.set(cat, []);
        }
        map.get(cat)!.push(s);
      });
    });

    // Sort categories alphabetically
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [suppliers]);

  // Track expanded state for categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  if (grouped.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-slate-500">কোনো ক্যাটাগরিতে সাপ্লায়ার পাওয়া যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([category, items]) => {
        const isCollapsed = !!collapsedCategories[category];
        const categoryIds = items.map((i) => i.id);
        const allSelected = categoryIds.every((id) => selectedIds.includes(id));

        return (
          <div
            key={category}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
          >
            {/* Category Header */}
            <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => toggleCategoryCollapse(category)}
                className="flex items-center gap-2.5 text-left text-slate-800 hover:text-emerald-700 transition"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-emerald-600" />
                )}
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-100/70 text-emerald-800">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{category}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                    {items.length} {items.length === 1 ? 'supplier' : 'suppliers'}
                  </span>
                </div>
              </button>

              {/* Select All in Category */}
              <button
                type="button"
                onClick={() => {
                  if (allSelected) {
                    const remaining = selectedIds.filter((id) => !categoryIds.includes(id));
                    onSelectMultiple(remaining);
                  } else {
                    const combined = Array.from(new Set([...selectedIds, ...categoryIds]));
                    onSelectMultiple(combined);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                  allSelected
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{allSelected ? 'সবগুলো বাদ দিন' : 'সবগুলো সিলেক্ট করুন'}</span>
              </button>
            </div>

            {/* Category Suppliers Grid */}
            {!isCollapsed && (
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((supplier) => (
                    <SupplierCard
                      key={`${category}-${supplier.id}`}
                      supplier={supplier}
                      isSelected={selectedIds.includes(supplier.id)}
                      isAdmin={isAdmin}
                      searchQuery={searchQuery}
                      onToggleSelect={onToggleSelect}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onViewDetails={onViewDetails}
                      onTogglePriceVisibility={onTogglePriceVisibility}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
