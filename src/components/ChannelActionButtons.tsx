import React, { useState } from 'react';
import { Supplier, CommunicationChannelId } from '../types/supplier';
import { createWhatsAppUrl, copyToClipboard } from '../utils/whatsapp';
import {
  MessageCircle,
  Phone,
  Send,
  Mail,
  PhoneCall,
  Check,
  Copy,
} from 'lucide-react';

interface ChannelActionButtonsProps {
  supplier: Supplier;
  compact?: boolean;
}

export const ChannelActionButtons: React.FC<ChannelActionButtonsProps> = ({
  supplier,
  compact = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // If supplier has explicit communicationChannels array, filter to those channels
  const activeChannels: CommunicationChannelId[] =
    supplier.communicationChannels && supplier.communicationChannels.length > 0
      ? supplier.communicationChannels
      : ['whatsapp', 'phone', ...(supplier.facebookUrl ? (['facebook'] as CommunicationChannelId[]) : [])];

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {/* 1. WhatsApp */}
      {activeChannels.includes('whatsapp') && supplier.phone && (
        <button
          type="button"
          onClick={() => {
            const url = createWhatsAppUrl(
              supplier.cleanPhone || supplier.phone,
              `Hello ${supplier.name}, I am contacting you regarding your products.`
            );
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          className={`inline-flex items-center gap-1.5 font-bold rounded-lg shadow-2xs transition active:scale-95 ${
            compact
              ? 'px-2 py-1 text-[11px] bg-[#25D366] hover:bg-[#20bd5a] text-white'
              : 'px-2.5 py-1.5 text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white'
          }`}
          title="WhatsApp এ মেসেজ পাঠান"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white stroke-none shrink-0" />
          <span>WhatsApp</span>
        </button>
      )}

      {/* 2. Direct Phone Call */}
      {activeChannels.includes('phone') && supplier.phone && (
        <a
          href={`tel:${supplier.cleanPhone || supplier.phone}`}
          className={`inline-flex items-center gap-1 font-semibold rounded-lg shadow-2xs transition active:scale-95 ${
            compact
              ? 'px-2 py-1 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white'
              : 'px-2.5 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
          title={`সরাসরি কল করুন: ${supplier.phone}`}
        >
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span>Call</span>
        </a>
      )}

      {/* 3. Facebook Profile / Page */}
      {activeChannels.includes('facebook') && supplier.facebookUrl && (
        <button
          type="button"
          onClick={() => window.open(supplier.facebookUrl, '_blank', 'noopener,noreferrer')}
          className={`inline-flex items-center gap-1 font-semibold rounded-lg shadow-2xs transition active:scale-95 ${
            compact
              ? 'px-2 py-1 text-[11px] bg-[#1877F2] hover:bg-[#0c63d4] text-white'
              : 'px-2.5 py-1.5 text-xs bg-[#1877F2] hover:bg-[#0c63d4] text-white'
          }`}
          title="Facebook প্রোফাইল বা পেজ খুলুন"
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>
      )}

      {/* 4. Telegram */}
      {activeChannels.includes('telegram') && supplier.telegram && (
        <button
          type="button"
          onClick={() => {
            const handle = supplier.telegram!.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
            window.open(`https://t.me/${handle}`, '_blank', 'noopener,noreferrer');
          }}
          className={`inline-flex items-center gap-1 font-semibold rounded-lg shadow-2xs transition active:scale-95 ${
            compact
              ? 'px-2 py-1 text-[11px] bg-[#229ED9] hover:bg-[#1b8bc2] text-white'
              : 'px-2.5 py-1.5 text-xs bg-[#229ED9] hover:bg-[#1b8bc2] text-white'
          }`}
          title="Telegram এ চ্যাট করুন"
        >
          <Send className="w-3.5 h-3.5 shrink-0" />
          <span>Telegram</span>
        </button>
      )}

      {/* 5. Email */}
      {activeChannels.includes('email') && supplier.email && (
        <a
          href={`mailto:${supplier.email}?subject=${encodeURIComponent(`Inquiry for Products - ${supplier.companyName || ''}`)}`}
          className={`inline-flex items-center gap-1 font-semibold rounded-lg shadow-2xs transition active:scale-95 ${
            compact
              ? 'px-2 py-1 text-[11px] bg-rose-600 hover:bg-rose-700 text-white'
              : 'px-2.5 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white'
          }`}
          title={`ইমেইল পাঠান: ${supplier.email}`}
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span>Email</span>
        </a>
      )}

      {/* 6. IMO */}
      {activeChannels.includes('imo') && (supplier.imo || supplier.phone) && (
        <button
          type="button"
          onClick={() => handleCopy('imo', supplier.imo || supplier.phone)}
          className={`inline-flex items-center gap-1 font-semibold rounded-lg shadow-2xs transition active:scale-95 ${
            compact
              ? 'px-2 py-1 text-[11px] bg-sky-600 hover:bg-sky-700 text-white'
              : 'px-2.5 py-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white'
          }`}
          title="IMO নাম্বার কপি করুন"
        >
          {copiedKey === 'imo' ? (
            <Check className="w-3.5 h-3.5 text-white shrink-0" />
          ) : (
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{copiedKey === 'imo' ? 'Copied' : 'IMO'}</span>
        </button>
      )}
    </div>
  );
};
