# TiffinLoop — Ops Emergency Crisis Triage Desk & Reliability Platform
> **StampMyVisa AI Product Manager Hiring Assignment**  
> **Candidate:** Kumkumlover  
> **Simulation Anchor:** 10:30 AM, 23-Sep-2026 (Lunch dispatch at 12:30 PM — 2-hour window)

---

## 🔗 Quick Links
- **GitHub Repository:** [https://github.com/Kumkumlover/Tiffinloop](https://github.com/Kumkumlover/Tiffinloop)
- **Live Deployed Prototype (Vercel):** [https://tiffinloop.vercel.app](https://tiffinloop.vercel.app) *(or import 1-click via Vercel)*
- **One-Click Deploy to Vercel:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKumkumlover%2FTiffinloop)

---

## 🎯 Executive Summary & Problem Context

At **10:30 AM on 23-Sep-2026**, operations at TiffinLoop faced an acute delivery crisis across Bengaluru and Mumbai:
1. **Lakshmi Iyer (`CK086`, Bengaluru):** High fever, dropping out with 9 orders (5 Lunch, 4 Dinner). Includes 1 strict Jain order (`ORD07108` Bhavna Shah).
2. **Geeta Rao (`CK087`, Bengaluru):** Emergency family trip to Mysore, dropping out with 9 orders (5 Lunch, 4 Dinner). Includes 1 strict Jain order (`ORD07116` Chetan Mehta) and duplicate subscriber orders for Tariq Hussain (`SUB0511` & `SUB0512`).
3. **Sunita Kulkarni (`CK090`, Mumbai):** Rural family emergency sent via WhatsApp at 7:41 AM — **unrecorded in operations sheet!** 6 disrupted orders (4 Lunch, 2 Dinner).

**Total Disruption:** 3 cooks, 24 disrupted orders (14 Lunch / 10 Dinner), ₹3,466 revenue at immediate risk, exactly 120 minutes before lunch delivery.

---

## ⚡ Build 1: Key Innovations & Features

### 1. The 2-Click "Hero Triage" Pattern
- **Click 1 (`⚡ 1-Click Smart Match & Preview`):** Runs the deterministic constraint solver in $<50\text{ms}$. Matches fallback kitchens, verifies remaining daily capacity, applies MRV diet constraints, and drafts personalized customer notifications.
- **Click 2 (`✅ Confirm & Dispatch All`):** Reassigns orders, dispatches simulated WhatsApp communications, marks cook as resolved, and logs an immutable audit event.

### 2. Constraint-First / MRV Fallback Matching
- Uses **Minimum Remaining Values (MRV)** heuristic: orders with the strictest diet (`Jain` $\to$ `Veg` $\to$ `Non-Veg`) are assigned first.
- Guarantees that Jain orders reserve slots in Jain-certified kitchens (`CK061 Neha Patel`, `CK040 Nadia Fernandes`) before regular Veg orders consume their capacity.
- Weighted scoring algorithm:
  $$\text{Score} = (w_{\text{cuisine}} \times S_{\text{cuisine}}) + (w_{\text{capacity}} \times S_{\text{capacity}}) + (w_{\text{rel}} \times S_{\text{rel}})$$

### 3. Tariq Hussain Deduplication Rule
- Correctly links `SUB0511` and `SUB0512` via shared phone number (`+91 98123 45678`).
- Consolidates `#ORD07117` and `#ORD07118` into **1 unified WhatsApp message** to prevent subscriber confusion and double-messaging.

### 4. WhatsApp Anomaly Detection
- Analyzes unstructured WhatsApp chat logs (`whatsapp_chats.txt`) and dynamically surfaces Sunita Kulkarni's 7:41 AM emergency, elevating her to the crisis desk with a prominent **"Unsheeted Dropout Alert"** badge.

### 5. Ops Traceability & Audit Ledger
- Every triage decision, multi-cook split, and simulated dispatch is persisted with timestamped audit records in browser storage.
- Includes a live session reset button for easy iterative demonstration.

---

## 🛠️ Tech Stack & Engineering Standards

- **Framework:** Next.js 15.5+ (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS (Dark-mode crisis operations aesthetic), Lucide React
- **Testing:** Vitest (TDD-driven: 32 unit and integration tests)
- **Data Architecture:** Zero-modification immutable seed data policy (`tiffinloop_seed/` untouched; all normalizations performed in-memory)

---

## 🧪 Verification & Test Evidence

All 32 test cases are passing:

```bash
$ npm test
✓ tests/unit/baseline.test.ts (2 tests)
✓ tests/unit/normalizers.test.ts (15 tests)
✓ tests/unit/data-loader.test.ts (4 tests)
✓ tests/unit/notification.test.ts (2 tests)
✓ tests/integration/triage-flow.test.ts (4 tests)
✓ tests/unit/fallback-engine.test.ts (5 tests)

Test Files  6 passed (6)
     Tests  32 passed (32)
  Duration  760ms
```

### Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/Kumkumlover/Tiffinloop.git
cd Tiffinloop

# 2. Install dependencies
npm install

# 3. Run test suite
npm test

# 4. Start local development server
npm run dev
# Open http://localhost:3000 (Portal) or http://localhost:3000/ops (Triage Desk)
```

---

## 👥 Product & Architecture Artifacts
- **Product Requirement Document (PRD):** `.agents/plans/build1-ops-triage.plan.md`
- **Architecture Decision Record (ADR):** `docs/adr/0001-stack-and-architecture.md`
- **Data Contract:** `docs/research/build1-data-contract.md`
- **UI State Machine:** `docs/research/build1-ui-state-machine.md`
- **Verification Walkthrough:** `walkthrough.md`
