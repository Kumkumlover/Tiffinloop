# Final Execution Plan: Build 1 — Ops Emergency Triage Tool
### Phase 2: Product & Architecture Staging (Synthesis of Chat 2 & Chat 3 Inputs)

Following the authoritative Data Contract in [`docs/research/build1-data-contract.md`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/docs/research/build1-data-contract.md), the UI State Machine in [`docs/research/build1-ui-state-machine.md`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/docs/research/build1-ui-state-machine.md), and the Adversarial Review directives in [`.agents/reviews/build1-plan-review.md`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/.agents/reviews/build1-plan-review.md), this document establishes the engineering contract for **Build 1**.

---

## 1. Core Architecture & Invariant Locks

1. **The Time Anchor**: 10:30 AM on 23-Sep-2026. Exactly **2 hours** to the 12:30 PM lunch delivery window.
2. **The 3 Active Dropouts (24 Disrupted Orders)**:
   - `CK086` (Lakshmi Iyer, Bengaluru): 9 orders (5 Lunch, 4 Dinner; 1 Jain: `ORD07108` Bhavna Shah).
   - `CK087` (Geeta Rao, Bengaluru): 9 orders (5 Lunch, 4 Dinner; 1 Jain: `ORD07116` Chetan Mehta; 2 Tariq Hussain orders: `ORD07117` & `ORD07118`).
   - `CK090` (Sunita Kulkarni, Mumbai): 6 orders (4 Lunch, 2 Dinner; all Veg). **Detected via WhatsApp chat at 7:41 AM (rural emergency), un-sheeted in CSV!**
3. **The 2-Click "Hero Triage" Pattern**:
   - Click 1: `⚡ 1-Click Smart Match & Preview` (Runs constraint-first matching, capacity check, and notification draft in <50ms).
   - Click 2: `✅ Confirm & Dispatch All` (Applies reassignment, dispatches simulated notifications, and logs immutable audit trail).
4. **Constraint-First / MRV Fallback Matching**:
   - Strictest diet sorted first: `Jain` $\to$ `Veg` $\to$ `Non-Veg`. Guarantees Jain subscribers reserve slots in Jain-certified backup cooks (`CK003`, `CK004`) before standard Veg orders consume their capacity.
5. **The Tariq Hussain Deduplication Rule**:
   - `SUB0511` & `SUB0512` consolidated into a single simulated WhatsApp message referencing both meal orders (`ORD07117` & `ORD07118`).

---

## 2. File & Component Breakdown

```
src/
├── lib/
│   ├── types.ts                   # Canonical TypeScript domain types & enums
│   ├── normalizers.ts             # Pure functions: cities, dates, phones, statuses
│   ├── data-loader.ts             # In-memory CSV & WhatsApp parser (immutable seed)
│   ├── fallback-engine.ts         # Capacity math, MRV constraint scoring & auto-splitter
│   ├── notification-service.ts    # WhatsApp/SMS template generator & Tariq deduplicator
│   └── triage-store.ts            # Client session state & audit event persistence
├── components/ops/
│   ├── EmergencyHeader.tsx        # 10:30 AM clock, 12:30 PM lunch countdown, KPI tiles
│   ├── DropoutCard.tsx            # Cook cards with status badges (Sheet vs WhatsApp alert)
│   ├── AffectedOrdersTable.tsx    # Order table prioritizing Lunch over Dinner, Jain alerts
│   ├── FallbackMatcher.tsx        # Ranked backup cooks with capacity meters & split controls
│   ├── NotificationModal.tsx      # WhatsApp preview modal with live delivery estimate
│   └── AuditTimeline.tsx          # Permanent traceability log of decisions
└── app/
    └── ops/
        └── page.tsx               # Master Ops Emergency Triage Workbench
```

---

## 3. Step-by-Step TDD Implementation Plan (Phase 3 Roadmap)

### Step 3.1: Data Normalizer & WhatsApp Parser (`normalizers.ts`, `data-loader.ts`)
- **TDD (RED):** Write `tests/unit/normalizers.test.ts` & `tests/unit/data-loader.test.ts`:
  - Test all city aliases (`blr`, `bangalore` $\to$ `Bengaluru`).
  - Test date parsing (`23/09/2026`, `2026-09-23`).
  - Test WhatsApp parsing: detect Lakshmi (`CK086`), Geeta (`CK087`), and Sunita (`CK090`).
  - Test duplicate Tariq Hussain identification.
- **Implement (GREEN):** Implement types and parsing logic in `src/lib/`.

### Step 3.2: Fallback Engine with MRV & Capacity Splitting (`fallback-engine.ts`)
- **TDD (RED):** Write `tests/unit/fallback-engine.test.ts`:
  - Test hard gates (City, Active status, Capacity $>0$).
  - Test MRV dietary priority (Jain orders get priority slots in `CK003`/`CK004`).
  - Test capacity calculation: $\text{remaining} = \text{max\_daily\_orders} - \text{active\_orders\_today}$.
  - Test auto-split when 1 backup cook cannot absorb all orders.
- **Implement (GREEN):** Implement scoring formula ($w_{\text{cui}}=100, w_{\text{cap}}=40, w_{\text{rel}}=30$).

### Step 3.3: Notification Service & Tariq Deduplicator (`notification-service.ts`)
- **TDD (RED):** Write `tests/unit/notification.test.ts`:
  - Test single consolidated message for Tariq Hussain containing both order IDs.
  - Test notification copy with backup cook name and delivery window.
- **Implement (GREEN):** Implement notification formatting logic.

### Step 3.4: Complete UI Construction (`/ops`)
- Implement `EmergencyHeader`, `DropoutCard`, `AffectedOrdersTable`, `FallbackMatcher`, `NotificationModal`, `AuditTimeline`.
- Assemble inside `src/app/ops/page.tsx` with responsive, crisis-oriented Tailwind design.
- Verify end-to-end integration via Vitest integration tests.

---

## 4. Acceptance Criteria & Audit Verification

| Criterion | Target Metric | Verification Method |
| :--- | :--- | :--- |
| **Resolution Speed** | Complete triage in $<60\text{s}$ | 2-Click Hero Triage pattern verified in UI |
| **Dropout Detection** | 3 cooks detected (24 orders) | Verified via `data-loader.test.ts` (Sunita included) |
| **Dietary Accuracy** | 100% Jain compliance | Verified via `fallback-engine.test.ts` (MRV sorting) |
| **Capacity Safety** | 0 cook over-allocation | Remaining capacity checked before and after split |
| **Tariq Duplicate** | 1 combined message | Verified via `notification.test.ts` |
| **Traceability** | Every action logged | Audit timeline entries persisted to localStorage |
