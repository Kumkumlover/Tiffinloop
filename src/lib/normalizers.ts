import {
  CanonicalCity,
  CanonicalOrderStatus,
  CuisineType,
  DietType,
} from './types';

export const CITY_ALIAS_MAP: Record<string, CanonicalCity> = {
  bengaluru: 'Bengaluru',
  bangalore: 'Bengaluru',
  blr: 'Bengaluru',
  mumbai: 'Mumbai',
  mum: 'Mumbai',
  bombay: 'Mumbai',
  pune: 'Pune',
  pnq: 'Pune',
};

export function normalizeCity(rawCity: string | null | undefined): CanonicalCity {
  if (!rawCity) return 'Bengaluru';
  const sanitized = rawCity.trim().toLowerCase();
  const canonical = CITY_ALIAS_MAP[sanitized];
  if (!canonical) {
    if (sanitized.includes('bang') || sanitized.includes('blr') || sanitized.includes('beng')) return 'Bengaluru';
    if (sanitized.includes('mum') || sanitized.includes('bomb')) return 'Mumbai';
    if (sanitized.includes('pun')) return 'Pune';
    return 'Bengaluru';
  }
  return canonical;
}

export function normalizePhone(rawPhone: string | null | undefined): {
  canonical: string | null;
  display: string;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return { canonical: null, display: 'Not Provided' };
  }

  const digits = rawPhone.replace(/\D/g, '');

  let clean10 = '';
  if (digits.length === 10) {
    clean10 = digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    clean10 = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    clean10 = digits.slice(2);
  }

  if (clean10.length === 10) {
    return {
      canonical: `+91${clean10}`,
      display: `+91 ${clean10.slice(0, 5)} ${clean10.slice(5)}`,
    };
  }

  return { canonical: null, display: 'Not Provided' };
}

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

export function parseDate(rawDate: string | null | undefined): string | null {
  if (!rawDate || !rawDate.trim()) return null;
  const s = rawDate.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
    const [d, m, y] = s.split('-');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD-Mon-YYYY (e.g. 19-Sep-2026)
  const textualMatch = s.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{4})$/);
  if (textualMatch) {
    const day = textualMatch[1].padStart(2, '0');
    const month = MONTH_MAP[textualMatch[2].toLowerCase()] || '01';
    const year = textualMatch[3];
    return `${year}-${month}-${day}`;
  }

  return s;
}

export function normalizeOrderStatus(rawStatus: string | null | undefined): CanonicalOrderStatus {
  if (!rawStatus) return 'PENDING';
  const s = rawStatus.trim().toLowerCase();

  if (s === 'delivered' || s === 'completed') return 'DELIVERED';
  if (s === 'pending') return 'PENDING';
  if (s === 'in-progress' || s === 'in progress') return 'IN_PROGRESS';
  if (s === 'cancelled') return 'CANCELLED';
  if (s === 'refunded') return 'REFUNDED';

  if (
    s.includes('no show') ||
    s.includes('no-show') ||
    s.includes('dropout') ||
    s.includes('cook unavailable')
  ) {
    return 'COOK_DROPOUT';
  }

  return 'PENDING';
}

export function parseServes(rawServes: string | null | undefined): DietType[] {
  if (!rawServes) return ['Veg'];
  const parts = rawServes.split(',').map(p => p.trim());
  const diets: DietType[] = [];

  for (const p of parts) {
    const lower = p.toLowerCase();
    if (lower === 'jain') diets.push('Jain');
    else if (lower === 'non-veg' || lower === 'non veg') diets.push('Non-Veg');
    else if (lower === 'veg') diets.push('Veg');
  }

  return diets.length > 0 ? diets : ['Veg'];
}

export function normalizeCuisine(rawCuisine: string | null | undefined): CuisineType {
  if (!rawCuisine) return 'North Indian';
  const c = rawCuisine.trim();
  const valid: CuisineType[] = [
    'North Indian',
    'Punjabi',
    'South Indian',
    'Gujarati',
    'Bengali',
    'Maharashtrian',
    'Continental',
  ];
  const found = valid.find(v => v.toLowerCase() === c.toLowerCase());
  return found || 'North Indian';
}

export const ANCHOR_DATE = '2026-09-23';

export function isOrderForToday(orderDate: string): boolean {
  return orderDate === ANCHOR_DATE;
}
