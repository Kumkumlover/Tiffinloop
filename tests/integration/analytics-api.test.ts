import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/analytics/route';

describe('Analytics API Integration Tests (TDD First)', () => {
  it('GET /api/analytics returns HTTP 200 with complete leadership schema', async () => {
    const req = new Request('http://localhost:3000/api/analytics');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.summary).toBeDefined();
    expect(data.summary.totalOrders30D).toBe(7138);
    expect(data.summary.totalDropouts30D).toBe(134);
    expect(data.regionalBreakdown).toBeDefined();
    expect(data.regionalBreakdown.length).toBe(3);
    expect(data.rogueCooks).toBeDefined();
    expect(data.dailyTimeline).toBeDefined();
    expect(data.predictiveSignals).toBeDefined();
    expect(data.strategicRecommendations).toBeDefined();
    expect(data.strategicRecommendations.length).toBe(4);
  });

  it('GET /api/analytics?simulateOffboarding=true returns counterfactual Pune metrics', async () => {
    const req = new Request('http://localhost:3000/api/analytics?simulateOffboarding=true');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.isSimulated).toBe(true);
    const pun = data.regionalBreakdown.find((r: any) => r.city === 'Pune');
    expect(pun.dropoutOrders).toBe(9);
    expect(pun.dropoutRate).toBeLessThan(1.0);
  });
});
