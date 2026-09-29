# Technical Implementation Plan: Build 2 — 30-Day Leadership & Operational Intelligence Dashboard

**Document:** `.agents/plans/build2-leadership-analytics.plan.md`  
**Status:** PROPOSED (Pending Human Gate 1 Sign-Off)  
**Lifecycle Phase:** Phase 1: PLAN  
**Framework:** Everything Claude Code (ECC) — TDD First, Contract-First  

---

## 1. Objective & Scope

Build 2 delivers the **Executive Leadership & Operational Intelligence Platform** at `/leadership` to satisfy the StampMyVisa APM assignment requirements. While Build 1 is a fast, tactical triage desk for ops coordinators during the 10:30 AM crisis, Build 2 is a strategic command center for the CEO, VP of Ops, and City GMs to:
1. Ingest and normalize all 7,138 historical orders (24-Aug-2026 to 23-Sep-2026) across all 5 dropout string variants (134 total dropouts).
2. Unpack the regional divergence: Pune (5.27% dropout rate, 36.6% of network dropouts) vs. Bengaluru (1.46%) vs. Mumbai (1.12%).
3. Expose the **Pune Rogue Cook Anomaly**: 2 cooks (Imran Agarwal `CK080` & Salman Sharma `CK062`) generated 40 of 49 Pune dropouts (81.63%).
4. Quantify the economic damage: ₹26,344 in direct GMV/refund loss, and **₹8.55 Lakhs in annualized subscriber churn**.
5. Analyze the **Festival Seasonality Shock**: Daily dropouts spiking 5.7x on 22–23 September.
6. Provide an early warning **Cook Health Score (CHS)** based on capacity stress and volume velocity.
7. Feature an interactive **"Simulate Rogue Cook Offboarding"** toggle demonstrating that Pune drops to 0.97% with zero capital cost.
8. Deliver 4 structured, high-ROI strategic initiatives for leadership.

---

## 2. Architecture & File Plan

### 2.1 Backend / Engine Layer
- **`src/lib/analytics-engine.ts` [NEW]**:
  - `computeLeadershipAnalytics(dataset: TiffinLoopDataset, simulatedOffboardIds?: string[]): LeadershipAnalyticsResponse`
  - Normalizes all 5 dropout strings from `orders.csv` without data drift.
  - Aggregates 30-day regional matrices, timeline series, cook quartiles, financial calculations, and CHS scores.
  - Computes counterfactual models when rogue cooks are offboarded.
- **`src/app/api/analytics/route.ts` [NEW]**:
  - GET endpoint returning baseline analytics or simulated offboarding analytics via `?simulateOffboarding=true`.

### 2.2 Frontend / UI Layer (`/leadership`)
- **`src/app/leadership/page.tsx` [NEW]**:
  - Main executive dashboard page with responsive grid and live state management.
- **`src/components/leadership/ExecutiveNavbar.tsx` [NEW]**:
  - Top bar linking `/ops` (Triage Desk) and `/leadership` (Executive View), live anchor timestamp, data sync indicator.
- **`src/components/leadership/ExecutiveFilterHeader.tsx` [NEW]**:
  - City filter (All, Bengaluru, Mumbai, Pune), time horizon filter (30D), and the hero **"Simulate Rogue Cook Offboarding"** toggle switch.
- **`src/components/leadership/MacroKPIBar.tsx` [NEW]**:
  - 4 executive metric tiles: Network Reliability Rate (98.12%), Total Financial Loss (₹26.3K direct + ₹8.55L churn), Pune Rogue Concentration (81.6%), Festival Surge Index (5.7x).
- **`src/components/leadership/RegionalReliabilityCard.tsx` [NEW]**:
  - City comparison table + comparative visual bars (BLR vs MUM vs PUN).
- **`src/components/leadership/DropoutTimelineChart.tsx` [NEW]**:
  - 30-day interactive SVG timeline showing order volume, dropout count, and festival week demarcation.
- **`src/components/leadership/RogueCookLeaderboard.tsx` [NEW]**:
  - Ranked vendor table highlighting `CK080` & `CK062`, failure rates, and visual badges for offboarded simulation state.
- **`src/components/leadership/PredictiveRiskPanel.tsx` [NEW]**:
  - Cook Health Score (CHS) early-warning cards for kitchens operating near capacity limits.
- **`src/components/leadership/StrategicRecommendationsCard.tsx` [NEW]**:
  - 4 high-ROI initiatives (3-Strike Policy, Pune Standby Pool, Festival Surge Bonus, Churn Shield) with projected financial impact and timelines.

### 2.3 Navigation Integration
- **`src/components/ops/EmergencyHeader.tsx` [MODIFY]**:
  - Add quick link to `/leadership` so evaluators can move between views with 1 click.
- **`src/app/page.tsx` [MODIFY]**:
  - Update landing page with prominent dual entry points: `[Launch Emergency Ops Desk (/ops)]` and `[Open Leadership Intelligence (/leadership)]`.

---

## 3. Test-Driven Development (TDD) Plan

Following ECC Invariant 1 (TDD First), we create failing tests first (`RED`), implement minimum code to pass (`GREEN`), then refactor:

### 3.1 Unit Test Suite (`tests/unit/analytics-engine.test.ts`)
1. **Normalization Test:** Verify all 5 dropout string variations (`cook_dropout`, `Cook No-Show`, `cook no show`, `No Show`, `Cancelled - Cook Unavailable`) aggregate to exactly 134 dropouts out of 7,138 orders.
2. **Regional Metrics Test:**
   - Bengaluru: 4,510 orders, 66 dropouts (1.46%)
   - Mumbai: 1,699 orders, 19 dropouts (1.12%)
   - Pune: 929 orders, 49 dropouts (5.27%)
3. **Rogue Cook Isolation Test:**
   - Imran Agarwal (`CK080`): 20 dropouts (35.1% fail rate)
   - Salman Sharma (`CK062`): 20 dropouts (25.3% fail rate)
   - Combined: 40/49 Pune dropouts (81.63%)
4. **Counterfactual Simulation Test:**
   - When `CK080` and `CK062` are offboarded, Pune dropouts drop to 9 and dropout rate drops to 0.97%.
5. **Financial & Churn Loss Test:**
   - Direct GMV loss = ₹19,644
   - Goodwill compensation = ₹6,700
   - Total direct loss = ₹26,344
   - Annualized churn = ₹855,154 across 33 estimated lost subscribers.
6. **Predictive Cook Health Score Test:**
   - Computes CHS for all cooks, flagging saturated/precursor cooks under risk.

### 3.2 Integration Test Suite (`tests/integration/analytics-api.test.ts`)
1. Verify `GET /api/analytics` returns HTTP 200 with full `LeadershipAnalyticsResponse` schema.
2. Verify `GET /api/analytics?simulateOffboarding=true` returns counterfactual data.

---

## 4. Human Gates & Milestones

- **Gate 1 (Plan Alignment):** STOP and obtain user sign-off on this plan.
- **Phase 2 (TDD Red):** Create tests, verify they fail.
- **Phase 3 (Implement Green):** Build `analytics-engine.ts`, API route, and UI components until all tests pass.
- **Phase 4 (Review & Verify):** Run `tsc --noEmit`, `vitest run`, and `next build`.
- **Gate 2 (Commit Gate):** Present walkthrough evidence and obtain user sign-off before committing to git.
