import React, { useState } from 'react';
import { Supplier, MESSAGE_TEMPLATES } from '../types/supplier';
import { createWhatsAppUrl, interpolateMessage, copyToClipboard, formatBroadcastNumbers } from '../utils/whatsapp';
import {
  MessageCircle,
  X,
  Copy,
  Check,
  Send,
  Users,
  Sparkles,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

interface WhatsAppBroadcastDrawerProps {
  selectedSuppliers: Supplier[];
  onClose: () => void;
  onClearSelection: () => void;
}

export const WhatsAppBroadcastDrawer: React.FC<WhatsAppBroadcastDrawerProps> = ({
  selectedSuppliers,
  onClose,
  onClearSelection,
}) => {
  const [message, setMessage] = useState(
    'Assalamu Alaikum / Hello, I am inquiring about current product availability, MOQ, and updated wholesale price list. Looking forward to hearing from you.'
  );
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [openedSuppliers, setOpenedSuppliers] = useState<Record<string, boolean>>({});

  const count = selectedSuppliers.length;

  const handleCopyNumbers = async () => {
    const numbers = selectedSuppliers.map((s) => s.cleanPhone || s.phone);
    const text = formatBroadcastNumbers(numbers);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedNumbers(true);
      setTimeout(() => setCopiedNumbers(false), 2500);
    }
  };

  const handleCopyMessage = async () => {
    const ok = await copyToClipboard(message);
    if (ok) {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleSendSingle = (supplier: Supplier) => {
    const personalizedText = interpolateMessage(message, {
      name: supplier.name,
      company: supplier.companyName,
      category: supplier.categories[0] || 'products',
    });
    const url = createWhatsAppUrl(supplier.cleanPhone || supplier.phone, personalizedText);
    window.open(url, '_blank', 'noopener,noreferrer');

    setOpenedSuppliers((prev) => ({
      ...prev,
      [supplier.id]: true,
    }));
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:p-4 animate-in slide-in-from-bottom duration-300">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden ring-4 ring-emerald-950/5">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
              <MessageCircle className="w-5 h-5 fill-white" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 leading-none">
                WhatsApp Direct Broadcast & Outreach
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/80 text-white">
                  {count} {count === 1 ? 'Supplier' : 'Suppliers'} Selected
                </span>
              </h3>
              <p className="text-[11px] text-emerald-100/90 mt-1">
                Deep links trigger WhatsApp directly with prefilled text — no re-typing required.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearSelection}
              className="px-2.5 py-1 text-xs font-medium text-emerald-200 hover:text-white hover:bg-emerald-600/50 rounded-lg transition"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-600/50 rounded-lg transition"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {/* Quick Template Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Message Template
              </label>
              <span className="text-[11px] text-slate-500">
                Variables: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono text-[10px]">&#123;name&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono text-[10px]">&#123;company&#125;</code>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {MESSAGE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(tmpl.text)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 rounded-lg border border-slate-200 transition"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            {/* Custom Message Field */}
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Write your common inquiry message here..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 placeholder-slate-400 resize-none transition"
              />
              <button
                type="button"
                onClick={handleCopyMessage}
                className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs transition"
                title="Copy message text to clipboard"
              >
                {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedMessage ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Buttons: Copy Numbers for WhatsApp Broadcast List */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Create WhatsApp Broadcast List
                </p>
                <p className="text-[11px] text-slate-500">
                  Copy selected numbers to paste into WhatsApp Broadcast or Groups
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyNumbers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95"
            >
              {copiedNumbers ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Numbers Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy {count} Numbers</span>
                </>
              )}
            </button>
          </div>

          {/* Sequential Outreach List: One-click deep link launch per supplier */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Recipients & Deep Links ({count})</span>
              <span className="text-[11px] font-normal text-slate-500">
                Tap button to launch deep link in WhatsApp
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedSuppliers.map((supp) => {
                const isOpened = openedSuppliers[supp.id];
                return (
                  <div
                    key={supp.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                      isOpened
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {supp.name}
                        </p>
                        {isOpened && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {supp.companyName || supp.phone}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                        {supp.phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendSingle(supp)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-2xs transition active:scale-95 shrink-0 ${
                        isOpened
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          : 'bg-[#25D366] hover:bg-[#20bd5a] text-white'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>{isOpened ? 'Sent' : 'Send'}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="text-[11px] text-slate-500">
            Tip: Keep WhatsApp Web or Desktop App open in background for instantaneous message dispatch.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
