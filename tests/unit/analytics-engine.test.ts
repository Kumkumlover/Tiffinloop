import { describe, it, expect, beforeAll } from 'vitest';
import { loadTiffinLoopDataset } from '@/lib/data-loader';
import { computeLeadershipAnalytics } from '@/lib/analytics-engine';

describe('Analytics Engine Unit Tests (TDD First)', () => {
  let dataset: Awaited<ReturnType<typeof loadTiffinLoopDataset>>;

  beforeAll(async () => {
    dataset = await loadTiffinLoopDataset();
  });

  it('should normalize all 5 dropout string variations to exactly 134 dropouts out of 7,138 orders', () => {
    const analytics = computeLeadershipAnalytics(dataset);
    expect(analytics.summary.totalOrders30D).toBe(7138);
    expect(analytics.summary.totalDropouts30D).toBe(134);
    expect(analytics.summary.networkDropoutRate).toBeCloseTo(1.88, 2);
    expect(analytics.summary.networkReliabilityRate).toBeCloseTo(98.12, 2);
  });

  it('should compute exact regional breakdown for Bengaluru, Mumbai, and Pune', () => {
    const analytics = computeLeadershipAnalytics(dataset);
    const { regionalBreakdown } = analytics;
    expect(regionalBreakdown.length).toBe(3);

    const blr = regionalBreakdown.find(r => r.city === 'Bengaluru');
    const mum = regionalBreakdown.find(r => r.city === 'Mumbai');
    const pun = regionalBreakdown.find(r => r.city === 'Pune');

    expect(blr).toBeDefined();
    expect(blr?.totalOrders).toBe(4510);
    expect(blr?.dropoutOrders).toBe(66);
    expect(blr?.dropoutRate).toBeCloseTo(1.46, 2);

    expect(mum).toBeDefined();
    expect(mum?.totalOrders).toBe(1699);
    expect(mum?.dropoutOrders).toBe(19);
    expect(mum?.dropoutRate).toBeCloseTo(1.12, 2);

    expect(pun).toBeDefined();
    expect(pun?.totalOrders).toBe(929);
    expect(pun?.dropoutOrders).toBe(49);
    expect(pun?.dropoutRate).toBeCloseTo(5.27, 2);
    expect(pun?.shareOfAllDropouts).toBeCloseTo(36.57, 1);
  });

  it('should isolate Pune rogue cooks CK080 and CK062 accounting for 81.63% of Pune dropouts', () => {
    const analytics = computeLeadershipAnalytics(dataset);
    const { rogueCooks } = analytics;

    expect(rogueCooks.puneTotalDropouts).toBe(49);
    expect(rogueCooks.combinedRogueDropouts).toBe(40);
    expect(rogueCooks.concentrationPercentage).toBeCloseTo(81.63, 1);

    const imran = rogueCooks.cooks.find(c => c.cookId === 'CK080');
    const salman = rogueCooks.cooks.find(c => c.cookId === 'CK062');

    expect(imran).toBeDefined();
    expect(imran?.cookName).toBe('Imran Agarwal');
    expect(imran?.dropouts).toBe(20);
    expect(imran?.city).toBe('Pune');
    expect(imran?.governanceStatus).toBe('ROGUE');

    expect(salman).toBeDefined();
    expect(salman?.cookName).toBe('Salman Sharma');
    expect(salman?.dropouts).toBe(20);
    expect(salman?.city).toBe('Pune');
    expect(salman?.governanceStatus).toBe('ROGUE');
  });

  it('should support counterfactual simulation: removing CK080 and CK062 drops Pune failure rate to 0.97%', () => {
    const baseline = computeLeadershipAnalytics(dataset);
    expect(baseline.rogueCooks.counterfactualPuneRate).toBeCloseTo(0.97, 2);

    const simulated = computeLeadershipAnalytics(dataset, ['CK080', 'CK062']);
    const punSim = simulated.regionalBreakdown.find(r => r.city === 'Pune');

    expect(punSim?.dropoutOrders).toBe(9);
    expect(punSim?.dropoutRate).toBeCloseTo(0.97, 2);
    expect(simulated.summary.totalDropouts30D).toBe(94);
  });

  it('should calculate direct financial loss of ₹26,344 and annualized churn of ₹8.55 Lakhs', () => {
    const analytics = computeLeadershipAnalytics(dataset);
    const { summary } = analytics;

    expect(summary.totalGmvLostInr).toBe(19644);
    expect(summary.totalRefundCostInr).toBe(26344);
    expect(summary.uniqueSubscribersImpacted).toBe(95);
    expect(summary.repeatDisruptionSubscribers).toBe(19);
    expect(summary.annualizedChurnLossInr).toBe(855154);
  });

  it('should compute 30-day timeline series and isolate the festival surge starting 22-Sep', () => {
    const analytics = computeLeadershipAnalytics(dataset);
    const { dailyTimeline } = analytics;

    expect(dailyTimeline.length).toBeGreaterThanOrEqual(30);

    const day22 = dailyTimeline.find(d => d.date === '2026-09-22');
    expect(day22).toBeDefined();
    expect(day22?.dropouts).toBe(11);
    expect(day22?.isFestivalSurge).toBe(true);

    const day23 = dailyTimeline.find(d => d.date === '2026-09-23');
    expect(day23).toBeDefined();
    expect(day23?.dropouts).toBe(24);
    expect(day23?.isFestivalSurge).toBe(true);
  });

  it('should calculate predictive Cook Health Score (CHS) and flag at-risk kitchens', () => {
    const analytics = computeLeadershipAnalytics(dataset);
    const { predictiveSignals } = analytics;

    expect(predictiveSignals.length).toBeGreaterThan(0);
    const highRisk = predictiveSignals.filter(s => s.riskTier === 'HIGH');
    expect(highRisk.length).toBeGreaterThan(0);

    // Lakshmi Iyer (CK086) had 9 orders today near capacity and is in high risk
    const ck086 = predictiveSignals.find(s => s.cookId === 'CK086');
    expect(ck086).toBeDefined();
    expect(ck086?.warningReasons.length).toBeGreaterThan(0);
  });
});
