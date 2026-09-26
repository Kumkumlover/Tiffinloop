import { describe, it, expect } from 'vitest';
import {
  normalizeCity,
  normalizePhone,
  parseDate,
  normalizeOrderStatus,
  parseServes,
  normalizeCuisine,
} from '@/lib/normalizers';

describe('Data Normalizers Unit Tests', () => {
  describe('normalizeCity', () => {
    it('should map all Bengaluru variations to "Bengaluru"', () => {
      expect(normalizeCity('Bengaluru')).toBe('Bengaluru');
      expect(normalizeCity('Bangalore')).toBe('Bengaluru');
      expect(normalizeCity('BLR')).toBe('Bengaluru');
      expect(normalizeCity('Blr')).toBe('Bengaluru');
      expect(normalizeCity('bangalore')).toBe('Bengaluru');
    });

    it('should map all Mumbai variations to "Mumbai"', () => {
      expect(normalizeCity('Mumbai')).toBe('Mumbai');
      expect(normalizeCity('MUM')).toBe('Mumbai');
      expect(normalizeCity('Bombay')).toBe('Mumbai');
      expect(normalizeCity('mumbai')).toBe('Mumbai');
    });

    it('should map all Pune variations to "Pune"', () => {
      expect(normalizeCity('Pune')).toBe('Pune');
      expect(normalizeCity('PUNE')).toBe('Pune');
      expect(normalizeCity('pune')).toBe('Pune');
      expect(normalizeCity('PNQ')).toBe('Pune');
    });
  });

  describe('normalizePhone', () => {
    it('should handle 10-digit Indian mobile numbers', () => {
      const res = normalizePhone('9812345678');
      expect(res.canonical).toBe('+919812345678');
      expect(res.display).toBe('+91 98123 45678');
    });

    it('should handle leading 0 format', () => {
      const res = normalizePhone('09725988156');
      expect(res.canonical).toBe('+919725988156');
      expect(res.display).toBe('+91 97259 88156');
    });

    it('should handle spaced +91 format', () => {
      const res = normalizePhone('+91 92930 23078');
      expect(res.canonical).toBe('+919293023078');
      expect(res.display).toBe('+91 92930 23078');
    });

    it('should handle missing / empty phones gracefully', () => {
      const res = normalizePhone('');
      expect(res.canonical).toBeNull();
      expect(res.display).toBe('Not Provided');
    });
  });

  describe('parseDate', () => {
    it('should normalize ISO format YYYY-MM-DD', () => {
      expect(parseDate('2026-09-23')).toBe('2026-09-23');
    });

    it('should normalize DD/MM/YYYY format', () => {
      expect(parseDate('23/09/2026')).toBe('2026-09-23');
      expect(parseDate('24/08/2026')).toBe('2026-08-24');
      expect(parseDate('11/09/2026')).toBe('2026-09-11');
    });

    it('should normalize textual dates like 19-Sep-2026', () => {
      expect(parseDate('19-Sep-2026')).toBe('2026-09-19');
    });
  });

  describe('normalizeOrderStatus', () => {
    it('should normalize all Delivered variations', () => {
      expect(normalizeOrderStatus('Delivered')).toBe('DELIVERED');
      expect(normalizeOrderStatus('DELIVERED')).toBe('DELIVERED');
      expect(normalizeOrderStatus('delivered')).toBe('DELIVERED');
      expect(normalizeOrderStatus('Completed')).toBe('DELIVERED');
    });

    it('should normalize all Pending & In-Progress variations', () => {
      expect(normalizeOrderStatus('Pending')).toBe('PENDING');
      expect(normalizeOrderStatus('pending')).toBe('PENDING');
      expect(normalizeOrderStatus('in-progress')).toBe('IN_PROGRESS');
      expect(normalizeOrderStatus('In Progress')).toBe('IN_PROGRESS');
    });

    it('should normalize all Cook Dropout variations', () => {
      expect(normalizeOrderStatus('Cook No-Show')).toBe('COOK_DROPOUT');
      expect(normalizeOrderStatus('No Show')).toBe('COOK_DROPOUT');
      expect(normalizeOrderStatus('cook_dropout')).toBe('COOK_DROPOUT');
      expect(normalizeOrderStatus('cook no show')).toBe('COOK_DROPOUT');
      expect(normalizeOrderStatus('Cancelled - Cook Unavailable')).toBe('COOK_DROPOUT');
    });
  });

  describe('parseServes', () => {
    it('should parse comma-separated diet strings', () => {
      expect(parseServes('Veg, Jain')).toEqual(['Veg', 'Jain']);
      expect(parseServes('Veg, Non-Veg')).toEqual(['Veg', 'Non-Veg']);
      expect(parseServes('Veg')).toEqual(['Veg']);
    });
  });

  describe('normalizeCuisine', () => {
    it('should trim and validate standard cuisines', () => {
      expect(normalizeCuisine('South Indian')).toBe('South Indian');
      expect(normalizeCuisine('Maharashtrian')).toBe('Maharashtrian');
      expect(normalizeCuisine('North Indian')).toBe('North Indian');
    });
  });
});
