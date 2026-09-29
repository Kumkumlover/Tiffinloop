# TiffinLoop — Ops Emergency Crisis Triage Desk & Reliability Platform
> **StampMyVisa AI Product Manager Hiring Assignment**  
> ⏱️ **Project Working Time:** **Exactly 3:30 hrs (3 hours 30 mins)** *(Hard limit: 4:00 hrs)*  
> 🕒 **Simulation Anchor:** 10:30 AM, 23-Sep-2026 (Lunch dispatch at 12:30 PM — 120-minute window)  
> 🧠 **Methodology:** Everything Claude Code (ECC) Agent Operating System (3 Parallel Threads)  
> 🧪 **Automated Verification:** 41 / 41 passing (Vitest, 100% green, 0 TS errors)

---

## 🏆 Core Hiring Assignment Deliverables (Direct Links)

> [!IMPORTANT]
> **Key submission deliverables required by StampMyVisa prompt:**

| Deliverable | Hard Constraint / Scope | Direct Link |
| :--- | :--- | :--- |
| 📄 **Deliverable 1: The Production PRD** | **Strict 1-Page Hard Limit** (481 body words, 5.0/5 Scorecard, covers all 6 prompt questions) | 👉 [**Read One-Page PRD**](.agents/prds/tiffinloop-production-one-page.prd.md) |
| 🪵 **Deliverable 4: Complete Build Log** | **Full Prompt History & AI Agent Responses** (33 turns, 3 parallel threads, 280+ KB) | 👉 [**Read Complete Build Log**](docs/BUILD_LOG.md) |
| ⚡ **Build 1: Ops Emergency Crisis Desk** | 10:30 AM Crisis: 2-click triage, MRV Jain solver, Tariq deduplication, WhatsApp anomaly detection | 👉 [**Launch `/ops` View**](http://localhost:3000/ops) |
| 📊 **Build 2: 30-Day Leadership View** | 7,138 orders, Pune rogue cook discovery, interactive counterfactual simulator, active policy actuators | 👉 [**Launch `/leadership` View**](http://localhost:3000/leadership) |
| 💻 **Code Repository** | Public GitHub repo, clean commit history, zero secrets | 👉 [**github.com/Kumkumlover/Tiffinloop**](https://github.com/Kumkumlover/Tiffinloop) |
| 🚀 **Deploy to Vercel** | 1-Click Import / Deploy on Vercel | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKumkumlover%2FTiffinloop) |


---

## 🎯 Executive Summary & Context

TiffinLoop delivers daily subscription meals to 500+ working professionals via 90+ home cooks across Bengaluru, Mumbai, and Pune. 

### The 10:30 AM Crisis Scenario (Build 1)
At **10:30 AM on 23-Sep-2026**, operations faced an emergency dropout surge exactly 120 minutes before the 12:30 PM lunch delivery:
1. **Lakshmi Iyer (`CK086`, Bengaluru):** High fever; 9 disrupted orders (5 Lunch, 4 Dinner), including 1 strict Jain order (`ORD07108` Bhavna Shah).
2. **Geeta Rao (`CK087`, Bengaluru):** Emergency family trip; 9 disrupted orders (5 Lunch, 4 Dinner), including 1 strict Jain order (`ORD07116` Chetan Mehta) and duplicate subscriber profiles for Tariq Hussain (`SUB0511` & `SUB0512`).
3. **Sunita Kulkarni (`CK090`, Mumbai):** Family emergency reported via WhatsApp at 7:41 AM — **omitted from operations sheets!** 6 disrupted orders (4 Lunch, 2 Dinner).

**Total Disruption:** 3 cooks, 24 disrupted orders (14 Lunch / 10 Dinner), ₹3,466 GMV at immediate risk.

---

## ⚡ Build 1: Ops Emergency Crisis Desk (`/ops`)

### 1. The 2-Click "Hero Triage" Pattern
- **Click 1 (`⚡ 1-Click Smart Match & Preview`):** Runs the deterministic constraint solver in $<50\text{ms}$. Matches fallback kitchens, verifies remaining daily capacity, applies MRV diet constraints, and drafts personalized customer notifications.
- **Click 2 (`✅ Confirm & Dispatch All`):** Reassigns orders, dispatches simulated WhatsApp communications, marks the cook as resolved, and records an immutable audit ledger entry.

### 2. Constraint-First / MRV Fallback Matching
- Uses **Minimum Remaining Values (MRV)** heuristic: orders with the strictest diet (`Jain` $\to$ `Veg` $\to$ `Non-Veg`) are assigned first.
- Guarantees that Jain orders reserve slots in Jain-certified kitchens (`CK061 Neha Patel`, `CK040 Nadia Fernandes`) before regular Veg orders consume their capacity.
- Weighted scoring algorithm:
  $$\text{Score} = (w_{\text{cuisine}} \times S_{\text{cuisine}}) + (w_{\text{capacity}} \times S_{\text{capacity}}) + (w_{\text{rel}} \times S_{\text{rel}})$$

### 3. Tariq Hussain Deduplication Rule
- Correctly links `SUB0511` and `SUB0512` via shared phone number (`+91 98123 45678`).
- Consolidates `#ORD07117` and `#ORD07118` into **1 unified WhatsApp message** to prevent subscriber confusion, double billing complaints, and spam.

### 4. WhatsApp Anomaly Detection
- Analyzes unstructured WhatsApp chat logs (`whatsapp_chats.txt`) and dynamically surfaces Sunita Kulkarni's 7:41 AM emergency, elevating her to the crisis desk with a prominent **"Unsheeted Dropout Alert"** badge.

### 5. Multi-City Hub Scoping
- Interactive filter pills (`All Hubs (3)`, `Bengaluru (2)`, `Mumbai (1)`, `Pune (0)`) with contextual empty states.

---

## 📊 Build 2: 30-Day Leadership Intelligence (`/leadership`)

While Build 1 is a rapid operational triage desk for coordinators during the 10:30 AM crisis, Build 2 is a strategic command center for leadership (CEO, VP of Ops, City GMs) to uncover systemic vulnerabilities and govern vendor reliability.

### Key Discoveries & Features

1. **Ingestion of 7,138 Orders Across All 5 Dropout Strings:**
   - Ingests and normalizes 30-day historical data across all 5 inconsistent status strings: `cook_dropout`, `Cook No-Show`, `cook no show`, `No Show`, and `Cancelled - Cook Unavailable` = **134 total dropouts** (1.88% failure rate).
2. **Regional Divergence Analysis:**
   - **Pune:** 5.27% dropout rate (49 dropouts / 930 orders) — **3.6x worse** than Bengaluru (1.46%) and **4.7x worse** than Mumbai (1.12%).
3. **The Pune Rogue Cook Anomaly:**
   - 40 of Pune's 49 dropouts (**81.63%**) were caused by just **two cooks**:
     - **Imran Agarwal (`CK080`):** 20 dropouts (35.1% failure rate).
     - **Salman Sharma (`CK062`):** 20 dropouts (25.3% failure rate).
4. **Hero Interactive Toggle (`[⚡ Simulate Offboarding CK080 & CK062]`):**
   - Counterfactual modeling proves that offboarding these 2 rogue vendors plummets Pune's dropout rate from **5.27% down to 0.97%**, instantly transforming Pune into TiffinLoop's most reliable city with zero additional marketing spend.
5. **Macro Economic Quantification:**
   - Total direct GMV and credit losses: ₹26,344.
   - **Annualized Subscriber Churn Damage:** 95 affected subscribers (19 repeated failures) $\times$ 35% churn $\times$ ₹25,914 annualized subscription value = **₹8.55 Lakhs ARR destroyed** (equivalent to 81.3% of monthly company GMV).
6. **Festival Seasonality Shock:**
   - Pinpoints the 22–23 September festival spike where dropouts surged **5.7x** to 10.08% of daily volume.
7. **Predictive Cook Health Score (CHS):**
   - Ranks active kitchens into Risk Tiers (Critical, Moderate, Healthy) based on utilization stress and volume acceleration to catch burnout before dropouts occur.
8. **Functional Strategic Policy Actuators:**
   - 4 actionable operational policies with live interactive toggles, confirmation toasts, and projected ARR recovery metrics:
     - *3-Strike Vendor Deactivation Policy* (+₹2.85L ARR)
     - *Festival Surge Buffer Pay (₹15/meal)* (+₹1.40L ARR)
     - *Pune Standby Kitchen Reserve (2 Hubs)* (+₹1.95L ARR)
     - *Proactive Churn Shield Auto-Credit (₹150)* (+₹2.35L ARR)

---

## 🧪 Verification & Automated Test Evidence

All 41 unit and integration tests are passing:

```bash
$ npm test
 ✓ tests/unit/baseline.test.ts (2 tests)
 ✓ tests/unit/normalizers.test.ts (15 tests)
 ✓ tests/unit/data-loader.test.ts (4 tests)
 ✓ tests/unit/analytics-engine.test.ts (7 tests)
 ✓ tests/integration/analytics-api.test.ts (2 tests)
 ✓ tests/unit/notification.test.ts (2 tests)
 ✓ tests/unit/fallback-engine.test.ts (5 tests)
 ✓ tests/integration/triage-flow.test.ts (4 tests)

 Test Files  8 passed (8)
      Tests  41 passed (41)
   Duration  854ms
```

### Type Checking & Production Build
```bash
$ npm run typecheck
✓ tsc --noEmit (0 errors)

$ npm run build
✓ Compiled successfully in 3.8s (All 8 static/dynamic routes generated)
```

---

## 💻 Running Locally

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

# 5. Open in browser:
# - Landing Page: http://localhost:3000
# - Build 1 (Ops Crisis Desk): http://localhost:3000/ops
# - Build 2 (Leadership Dashboard): http://localhost:3000/leadership
```

---

## 📁 Repository Architecture & Staging Files

```
├── .agents/
│   ├── plans/
│   │   ├── build1-ops-triage.plan.md
│   │   └── build2-leadership-analytics.plan.md
│   ├── prds/
│   │   ├── build1-ops-triage.prd.md
│   │   ├── build2-leadership-analytics.prd.md
│   │   └── tiffinloop-production-one-page.prd.md  <-- Deliverable 1 (Strict 1-Page PRD)
│   └── reviews/
│       └── build1-final-scorecard.md
├── docs/
│   ├── BUILD_LOG.md                                <-- Deliverable 4 (Full Prompt & AI History)
│   ├── adr/
│   │   └── 0001-stack-and-architecture.md
│   └── research/
│       ├── build1-data-contract.md
│       └── build1-ui-state-machine.md
├── src/
│   ├── app/
│   │   ├── api/analytics/route.ts
│   │   ├── api/triage/route.ts
│   │   ├── leadership/page.tsx                     <-- Build 2 Dashboard
│   │   ├── ops/page.tsx                            <-- Build 1 Triage Desk
│   │   └── page.tsx                                <-- Dual Entry Portal
│   ├── components/
│   │   ├── leadership/                             <-- 8 Executive Intelligence Components
│   │   └── ops/                                    <-- 7 Ops Triage Desk Components
│   └── lib/
│       ├── analytics-engine.ts                     <-- 30-Day Aggregation & Simulation Engine
│       ├── fallback-engine.ts                      <-- MRV Constraint Solver
│       ├── normalizers.ts                          <-- Data Inconsistency Sanitizers
│       └── types.ts
├── tests/
│   ├── integration/                                <-- API & User Journey Flows
│   └── unit/                                       <-- Heuristics, Math & Normalization Tests
└── tiffinloop_seed/                                <-- Immutable Ground Truth Data
```

---

## 📜 Assignment Compliance Checklist

- [x] **Zero Data Tampering:** `tiffinloop_seed/` remains strictly unmodified; all data cleaning is executed deterministically in memory.
- [x] **Tested Against Inconsistencies:** Handles all 5 dropout string variations, unsheeted WhatsApp emergencies, duplicate subscriber profiles, and strict dietary constraints (Jain).
- [x] **Dual Builds Completed:**
  - Build 1: Tactical Crisis Triage Desk (`/ops`).
  - Build 2: Strategic 30-Day Leadership Intelligence (`/leadership`).
- [x] **Deliverable 1 (The PRD):** Strictly 1-page (~500 words, 494 actual words), addressing all 6 required prompts.
- [x] **Deliverable 2 (Repository):** Public GitHub repository with clean history and zero exposed secrets.
- [x] **Deliverable 4 (Build Log):** Complete chronological prompt history AND AI responses stored in `docs/BUILD_LOG.md`.
