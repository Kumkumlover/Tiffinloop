import { describe, it, expect, beforeAll } from 'vitest';
import { loadTiffinLoopDataset } from '@/lib/data-loader';

describe('Data Loader & Ingestion Integration Tests', () => {
  let dataset: Awaited<ReturnType<typeof loadTiffinLoopDataset>>;

  beforeAll(async () => {
    dataset = await loadTiffinLoopDataset();
  });

  it('should parse all 92 cooks with clean normalized fields', () => {
    expect(dataset.cooks.length).toBe(92);
    const lakshmi = dataset.cooks.find(c => c.cookId === 'CK086');
    expect(lakshmi).toBeDefined();
    expect(lakshmi?.cookName).toBe('Lakshmi Iyer');
    expect(lakshmi?.city).toBe('Bengaluru');
    expect(lakshmi?.serves).toContain('Veg');
    expect(lakshmi?.serves).toContain('Jain');
    expect(lakshmi?.maxDailyOrders).toBe(40);
  });

  it('should parse all 532 subscribers and detect duplicate Tariq Hussain', () => {
    expect(dataset.subscribers.length).toBe(532);
    const tariq1 = dataset.subscribers.find(s => s.subscriberId === 'SUB0511');
    const tariq2 = dataset.subscribers.find(s => s.subscriberId === 'SUB0512');
    expect(tariq1).toBeDefined();
    expect(tariq2).toBeDefined();
    expect(tariq1?.phone).toBe(tariq2?.phone);
    expect(tariq1?.isDuplicateOf || tariq2?.isDuplicateOf).toBeDefined();
  });

  it('should parse all orders and accurately filter orders for today (23-Sep-2026)', () => {
    expect(dataset.orders.length).toBe(7138);
    const todayOrders = dataset.orders.filter(o => o.isToday);
    expect(todayOrders.length).toBe(238);
  });

  it('should detect exactly 3 dropouts for today including Sunita Kulkarni from WhatsApp', () => {
    const dropouts = dataset.activeDropouts;
    expect(dropouts.length).toBe(3);

    const ck086 = dropouts.find(d => d.cookId === 'CK086');
    const ck087 = dropouts.find(d => d.cookId === 'CK087');
    const ck090 = dropouts.find(d => d.cookId === 'CK090');

    expect(ck086).toBeDefined();
    expect(ck086?.source).toBe('SHEET_ON_LEAVE');
    expect(ck086?.affectedOrders.length).toBe(9);

    expect(ck087).toBeDefined();
    expect(ck087?.source).toBe('SHEET_ON_LEAVE');
    expect(ck087?.affectedOrders.length).toBe(9);

    expect(ck090).toBeDefined();
    expect(ck090?.source).toBe('WHATSAPP_UNRECORDED');
    expect(ck090?.affectedOrders.length).toBe(6);
    expect(ck090?.reason).toContain('gaon jana pad raha hai');

    // Total affected orders today = 9 + 9 + 6 = 24
    const totalDisrupted = dropouts.reduce((acc, d) => acc + d.affectedOrders.length, 0);
    expect(totalDisrupted).toBe(24);
  });
});
