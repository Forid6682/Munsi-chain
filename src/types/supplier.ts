export type CommunicationChannelId = 'whatsapp' | 'phone' | 'facebook' | 'telegram' | 'email' | 'imo';

export interface CommunicationChannelOption {
  id: CommunicationChannelId;
  name: string;
  iconName: string;
  color: string;
  placeholder: string;
}

export const AVAILABLE_CHANNELS: CommunicationChannelOption[] = [
  { id: 'whatsapp', name: 'WhatsApp', iconName: 'MessageCircle', color: '#25D366', placeholder: '+880 1712-345678' },
  { id: 'phone', name: 'Phone Call', iconName: 'Phone', color: '#059669', placeholder: '+880 1712-345678' },
  { id: 'facebook', name: 'Facebook', iconName: 'Facebook', color: '#1877F2', placeholder: 'https://facebook.com/supplier.page' },
  { id: 'telegram', name: 'Telegram', iconName: 'Send', color: '#229ED9', placeholder: 'https://t.me/username or @username' },
  { id: 'email', name: 'Email', iconName: 'Mail', color: '#EA4335', placeholder: 'supplier@company.com' },
  { id: 'imo', name: 'IMO', iconName: 'PhoneCall', color: '#0084FF', placeholder: '+880 1712-345678' },
];

export interface Supplier {
  id: string;
  ownerId: string;
  name: string;
  companyName?: string;
  phone: string;
  cleanPhone: string;
  facebookUrl?: string;
  telegram?: string;
  email?: string;
  imo?: string;
  communicationChannels: CommunicationChannelId[]; // Which channels are enabled/shown
  location?: string;
  categories: string[];
  products: string[]; // Specific products provided, e.g. ["Cotton Twill", "Oxford Fabric", "Silk"]
  pricingCatalog?: string;
  rating: number; // 1 to 5
  notes?: string;
  tags: string[];
  
  // Admin Privacy & Visibility controls
  isPricingHidden?: boolean; // Admin can hide price/catalog details
  isNotesHidden?: boolean;   // Admin can hide sensitive notes
  isHidden?: boolean;        // Admin can hide supplier from general listing

  createdAt: string;
  updatedAt: string;
}

export type SupplierFormData = Omit<Supplier, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'cleanPhone'> & {
  cleanPhone?: string;
};

export interface AdminSettings {
  globalHidePricing: boolean;
  globalHideNotes: boolean;
  adminPasscode: string;
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  globalHidePricing: false,
  globalHideNotes: false,
  adminPasscode: '1234',
};

export const COMMON_CATEGORIES = [
  'Fabric & Textiles',
  'Electronics & Components',
  'Packaging & Boxes',
  'Raw Materials',
  'Apparel & Garments',
  'Hardware & Tools',
  'Chemicals & Dyes',
  'Printing & Labels',
  'Logistics & Courier',
  'Office & Supplies',
  'Food & Ingredients',
  'Other',
];

export const COMMON_TAGS = [
  'Priority',
  'Wholesale',
  'Backup Supplier',
  'Verified Quality',
  'Credit / 30-Day Terms',
  'Fast Delivery',
  'MOQ Flexible',
  'Cash on Delivery',
];

export const MESSAGE_TEMPLATES = [
  {
    label: 'Product Inquiry & Stock',
    text: 'Hello {name}, I am reaching out from {myCompany} regarding your {category} products. Could you please share current stock availability and latest price list?',
  },
  {
    label: 'Price Quote (RFQ)',
    text: 'Hi {name}, hope you are doing well. We need a quotation for a bulk order of {category}. Could you provide unit pricing, MOQ, and expected delivery lead time?',
  },
  {
    label: 'Order Follow-up',
    text: 'Hello {company}, could you please provide a quick status update on our recent order/dispatch?',
  },
  {
    label: 'Sample Request',
    text: 'Assalamu Alaikum / Greetings {name}, we would like to evaluate samples for your products before placing our wholesale order. Please let us know the sample process.',
  },
];
