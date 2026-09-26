import { describe, it, expect, beforeAll } from 'vitest';
import { loadTiffinLoopDataset } from '@/lib/data-loader';
import { generateOptimalTriagePlan } from '@/lib/fallback-engine';
import { generateSimulatedNotifications } from '@/lib/notification-service';

describe('Notification Service & Tariq Deduplicator Unit Tests', () => {
  let dataset: Awaited<ReturnType<typeof loadTiffinLoopDataset>>;

  beforeAll(async () => {
    dataset = await loadTiffinLoopDataset();
  });

  it('should generate simulated notifications with backup cook and delivery window', () => {
    const ck086Alert = dataset.activeDropouts.find(d => d.cookId === 'CK086')!;
    const plan = generateOptimalTriagePlan(ck086Alert, dataset);
    const notifications = generateSimulatedNotifications(plan.assignments, dataset, ck086Alert);

    expect(notifications.length).toBeGreaterThan(0);
    const first = notifications[0];
    expect(first.message).toContain('TiffinLoop Update');
    expect(first.message).toContain('Lakshmi Iyer');
    expect(first.phone).toBeDefined();
    expect(first.sentAt).toBeDefined();
  });

  it('should consolidate Tariq Hussain orders (ORD07117 and ORD07118) into a SINGLE message', () => {
    const ck087Alert = dataset.activeDropouts.find(d => d.cookId === 'CK087')!;
    const plan = generateOptimalTriagePlan(ck087Alert, dataset);
    const notifications = generateSimulatedNotifications(plan.assignments, dataset, ck087Alert);

    // Tariq Hussain phone: +919812345678
    const tariqNotifs = notifications.filter(n => n.phone === '+91 98123 45678' || n.phone === '+919812345678');
    expect(tariqNotifs.length).toBe(1);

    const msg = tariqNotifs[0].message;
    expect(msg).toContain('ORD07117');
    expect(msg).toContain('ORD07118');
    expect(tariqNotifs[0].isDuplicateConsolidated).toBe(true);
  });
});
