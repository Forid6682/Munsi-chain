import React, { useState } from 'react';
import { Supplier } from '../types/supplier';
import { X, Download, Upload, RefreshCw, FileSpreadsheet, FileCode, Check } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  onImportSuppliers: (imported: Supplier[]) => Promise<void>;
  onResetDemo: () => void;
  canResetDemo: boolean;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  onImportSuppliers,
  onResetDemo,
  canResetDemo,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(suppliers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `munsi_suppliers_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Company Name',
      'Phone',
      'Clean Phone (WhatsApp)',
      'Facebook URL',
      'Location',
      'Categories',
      'Pricing Catalog',
      'Rating',
      'Notes',
      'Tags',
    ];

    const rows = suppliers.map((s) => [
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.companyName || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.cleanPhone || '').replace(/"/g, '""')}"`,
      `"${(s.facebookUrl || '').replace(/"/g, '""')}"`,
      `"${(s.location || '').replace(/"/g, '""')}"`,
      `"${(s.categories || []).join('; ').replace(/"/g, '""')}"`,
      `"${(s.pricingCatalog || '').replace(/"/g, '""')}"`,
      s.rating || 5,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      `"${(s.tags || []).join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `munsi_suppliers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          await onImportSuppliers(parsed);
          setImportStatus(`Successfully imported ${parsed.length} suppliers!`);
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Invalid file format. Expected a JSON array of suppliers.');
        }
      } catch (err) {
        setImportStatus('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Data Backup & Export</h3>
            <p className="text-xs text-slate-400">Download backups or export to spreadsheet</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Export section */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Export Supplier Directory
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Export CSV</span>
                  <span className="text-[10px] text-slate-500">Excel / Google Sheets</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Export JSON</span>
                  <span className="text-[10px] text-slate-500">Full structured backup</span>
                </div>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Import Suppliers from JSON
            </h4>
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition text-slate-600 text-xs font-medium">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Click to select .JSON file</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo Data (if guest) */}
          {canResetDemo && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700">Restore Sample Directory</p>
                <p className="text-[11px] text-slate-500">Reload demo suppliers with full WhatsApp formatting</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Restore initial sample suppliers? Any unsaved local edits will be replaced.')) {
                    onResetDemo();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
