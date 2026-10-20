export interface Supplier {
  id: string;
  ownerId: string;
  name: string;
  companyName?: string;
  phone: string;
  cleanPhone: string; // digits only with country code, e.g. 8801712345678
  facebookUrl?: string;
  location?: string;
  categories: string[];
  pricingCatalog?: string;
  rating: number; // 1 to 5
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type SupplierFormData = Omit<Supplier, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'cleanPhone'> & {
  cleanPhone?: string;
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
    text: 'Hello {name}, I am reaching out from {myCompany} regarding your {category} products. Could you please share the current stock availability and latest price list?',
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
