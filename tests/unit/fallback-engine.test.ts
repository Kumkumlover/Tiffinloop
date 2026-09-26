import { describe, it, expect, beforeAll } from 'vitest';
import { loadTiffinLoopDataset } from '@/lib/data-loader';
import {
  findFallbackCandidates,
  generateOptimalTriagePlan,
} from '@/lib/fallback-engine';

describe('Fallback Engine & Capacity Conflict Unit Tests', () => {
  let dataset: Awaited<ReturnType<typeof loadTiffinLoopDataset>>;

  beforeAll(async () => {
    dataset = await loadTiffinLoopDataset();
  });

  describe('findFallbackCandidates', () => {
    it('should find compatible backup cooks in Bengaluru for Lakshmi Iyer (CK086)', () => {
      const ck086Alert = dataset.activeDropouts.find(d => d.cookId === 'CK086')!;
      expect(ck086Alert).toBeDefined();

      const candidates = findFallbackCandidates(ck086Alert, dataset);
      expect(candidates.length).toBeGreaterThan(0);

      // All candidates must be in Bengaluru
      for (const cand of candidates) {
        expect(cand.city).toBe('Bengaluru');
        expect(cand.remainingCapacity).toBeGreaterThan(0);
        expect(cand.cookId).not.toBe('CK086');
        expect(cand.cookId).not.toBe('CK087'); // Geeta Rao is also dropped out
      }
    });

    it('should enforce strict Jain compliance for Jain orders', () => {
      // Find Bhavna Shah's order (ORD07108 - Jain)
      const jainOrder = dataset.orders.find(o => o.orderId === 'ORD07108')!;
      expect(jainOrder).toBeDefined();
      expect(jainOrder.subscriber?.diet).toBe('Jain');

      const candidates = findFallbackCandidates(
        { ...dataset.activeDropouts[0], affectedOrders: [jainOrder] },
        dataset,
        'Jain'
      );

      expect(candidates.length).toBeGreaterThan(0);
      for (const cand of candidates) {
        expect(cand.serves).toContain('Jain');
      }
    });

    it('should find Mumbai backup cooks for Sunita Kulkarni (CK090)', () => {
      const ck090Alert = dataset.activeDropouts.find(d => d.cookId === 'CK090')!;
      expect(ck090Alert).toBeDefined();

      const candidates = findFallbackCandidates(ck090Alert, dataset);
      expect(candidates.length).toBeGreaterThan(0);
      for (const cand of candidates) {
        expect(cand.city).toBe('Mumbai');
        expect(cand.cookId).not.toBe('CK090');
      }
    });
  });

  describe('generateOptimalTriagePlan & Split Resolution', () => {
    it('should generate a 100% covered plan for Lakshmi Iyer without over-allocating any cook', () => {
      const ck086Alert = dataset.activeDropouts.find(d => d.cookId === 'CK086')!;
      const plan = generateOptimalTriagePlan(ck086Alert, dataset);

      expect(plan.assignments.length).toBe(9);
      expect(plan.unassignedOrders.length).toBe(0);

      // Verify no cook received more orders than their remaining capacity
      const allocatedCounts: Record<string, number> = {};
      for (const a of plan.assignments) {
        if (a.backupCookId) {
          allocatedCounts[a.backupCookId] = (allocatedCounts[a.backupCookId] || 0) + 1;
        }
      }

      for (const [cookId, count] of Object.entries(allocatedCounts)) {
        const cook = dataset.cookMap.get(cookId)!;
        expect(count).toBeLessThanOrEqual(cook.remainingCapacity);
      }
    });

    it('should prioritize Jain orders first to certified Jain backup cooks', () => {
      const ck086Alert = dataset.activeDropouts.find(d => d.cookId === 'CK086')!;
      const plan = generateOptimalTriagePlan(ck086Alert, dataset);

      const jainAssignment = plan.assignments.find(a => a.orderId === 'ORD07108')!;
      expect(jainAssignment).toBeDefined();
      expect(jainAssignment.backupCookId).toBeDefined();

      const assignedCook = dataset.cookMap.get(jainAssignment.backupCookId!)!;
      expect(assignedCook.serves).toContain('Jain');
    });
  });
});
