import { describe, it, expect } from 'vitest';
import { loadTiffinLoopDataset } from '@/lib/data-loader';
import { findFallbackCandidates, generateOptimalTriagePlan } from '@/lib/fallback-engine';
import { generateSimulatedNotifications } from '@/lib/notification-service';

describe('Integration: End-to-End Triage Flow', () => {
  it('should load full dataset and detect exactly 3 active dropouts (24 orders)', async () => {
    const dataset = await loadTiffinLoopDataset();
    expect(dataset.activeDropouts).toHaveLength(3);

    const cookIds = dataset.activeDropouts.map(d => d.cookId);
    expect(cookIds).toContain('CK086'); // Lakshmi Iyer (Bengaluru)
    expect(cookIds).toContain('CK087'); // Geeta Rao (Bengaluru)
    expect(cookIds).toContain('CK090'); // Sunita Kulkarni (Mumbai - WhatsApp alert)

    const totalOrders = dataset.activeDropouts.reduce((acc, d) => acc + d.affectedOrders.length, 0);
    expect(totalOrders).toBe(24);
  });

  it('should successfully triage Lakshmi Iyer (CK086) with MRV Jain routing', async () => {
    const dataset = await loadTiffinLoopDataset();
    const alert = dataset.activeDropouts.find(d => d.cookId === 'CK086')!;
    expect(alert).toBeDefined();

    const candidates = findFallbackCandidates(alert, dataset);
    expect(candidates.length).toBeGreaterThan(0);

    const plan = generateOptimalTriagePlan(alert, dataset);
    expect(plan.unassignedOrders).toHaveLength(0);
    expect(plan.assignments).toHaveLength(9);

    // Jain order check: Bhavna Shah (ORD07108) must NOT be assigned to a cook who does not serve Jain
    const jainOrderAssignment = plan.assignments.find(a => a.orderId === 'ORD07108')!;
    expect(jainOrderAssignment).toBeDefined();
    expect(jainOrderAssignment.backupCookId).toBeDefined();

    const backupCook = dataset.cookMap.get(jainOrderAssignment.backupCookId!);
    expect(backupCook).toBeDefined();
    expect(backupCook?.serves).toContain('Jain');

    // Notifications check
    const notifications = generateSimulatedNotifications(plan.assignments, dataset, alert);
    expect(notifications.length).toBeGreaterThanOrEqual(9);
    
    // Check delivery window in copy
    const lunchNotif = notifications.find(n => n.message.includes('12:30 PM'));
    expect(lunchNotif).toBeDefined();
  });

  it('should successfully triage Geeta Rao (CK087) with Tariq Hussain deduplication', async () => {
    const dataset = await loadTiffinLoopDataset();
    const alert = dataset.activeDropouts.find(d => d.cookId === 'CK087')!;
    expect(alert).toBeDefined();

    const plan = generateOptimalTriagePlan(alert, dataset);
    expect(plan.unassignedOrders).toHaveLength(0);
    expect(plan.assignments).toHaveLength(9);

    // Notifications check for Tariq Hussain
    const notifications = generateSimulatedNotifications(plan.assignments, dataset, alert);

    // Tariq Hussain has 2 orders: ORD07117 & ORD07118
    const tariqNotifs = notifications.filter(n => n.phone?.includes('98123'));
    expect(tariqNotifs).toHaveLength(1);
    expect(tariqNotifs[0].isDuplicateConsolidated).toBe(true);
    expect(tariqNotifs[0].message).toContain('ORD07117');
    expect(tariqNotifs[0].message).toContain('ORD07118');
  });

  it('should successfully triage Sunita Kulkarni (CK090) in Mumbai', async () => {
    const dataset = await loadTiffinLoopDataset();
    const alert = dataset.activeDropouts.find(d => d.cookId === 'CK090')!;
    expect(alert).toBeDefined();
    expect(alert.city).toBe('Mumbai');
    expect(alert.source).toBe('WHATSAPP_UNRECORDED');

    const candidates = findFallbackCandidates(alert, dataset);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(c => c.city === 'Mumbai')).toBe(true);

    const plan = generateOptimalTriagePlan(alert, dataset);
    expect(plan.unassignedOrders).toHaveLength(0);
    expect(plan.assignments).toHaveLength(6);

    const notifications = generateSimulatedNotifications(plan.assignments, dataset, alert);
    expect(notifications).toHaveLength(6);
  });
});
