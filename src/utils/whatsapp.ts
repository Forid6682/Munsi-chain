/**
 * Cleans phone number by removing non-digits and ensuring standard country code.
 * If 11-digit Bangladesh number starting with '01', prepends '88'.
 */
export function cleanPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Remove all non-numeric characters except leading plus if any
  const digits = rawPhone.replace(/\D/g, '');

  // If local Bangladesh 11 digits (e.g. 01712345678), convert to 8801712345678
  if (digits.length === 11 && digits.startsWith('01')) {
    return `88${digits}`;
  }

  // If local 10 digits (e.g. India or US without code), allow as is or retain
  return digits;
}

/**
 * Builds the official WhatsApp Web / Mobile App deep link URL
 */
export function createWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  if (!cleanPhone) return '#';

  const base = `https://wa.me/${cleanPhone}`;
  if (!message || message.trim() === '') {
    return base;
  }
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Replaces placeholders in message templates:
 * {name} -> Supplier Name
 * {company} -> Company Name
 * {category} -> Main Category
 * {myCompany} -> User's business name or 'Munsi Enterprises'
 */
export function interpolateMessage(
  template: string,
  variables: { name?: string; company?: string; category?: string; myCompany?: string }
): string {
  return template
    .replace(/{name}/g, variables.name || 'Supplier')
    .replace(/{company}/g, variables.company || variables.name || 'Company')
    .replace(/{category}/g, variables.category || 'materials')
    .replace(/{myCompany}/g, variables.myCompany || 'our business');
}

/**
 * Copies plain text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Formats multiple phone numbers into a WhatsApp-ready list or comma-separated list
 */
export function formatBroadcastNumbers(numbers: string[]): string {
  return numbers
    .map((num) => {
      const clean = cleanPhoneNumber(num);
      return clean ? `+${clean}` : '';
    })
    .filter(Boolean)
    .join(', ');
}
