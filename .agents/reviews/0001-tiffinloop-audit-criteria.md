# Audit Report 0001: TiffinLoop Evaluation Harness & Invariants Matrix
**Project:** TiffinLoop (StampMyVisa APM Assignment)  
**Lifecycle Phase:** Phase 2 / Pre-Implementation Audit Harness  
**Auditor Persona:** Principal Code Reviewer & Security Auditor (`code-reviewer`, `security-reviewer`, `gateguard`)  
**Date:** 2026-09-26  
**Status:** ACTIVE HARNESS ESTABLISHED  

---

## 1. Golden Seed Data Checksums (Baseline Integrity Lock)

Per **Constraint 6 (Data Integrity)**: Zero modification to `tiffinloop_seed/` files is permitted. Any manual edit to these files will result in an immediate **`CRITICAL BLOCK`**. All normalization, sanitization, and deduplication must occur strictly in application runtime memory.

| File Path | SHA-256 Baseline Hash | Enforced Status |
| :--- | :--- | :--- |
| `tiffinloop_seed/cooks.csv` | `22EF657D63F1C608D4C294F781B4E408FE96607BAB0A9EC674F18508C242EA8F` | 🔒 LOCKED |
| `tiffinloop_seed/orders.csv` | `04D11611ACEF8B2ED23300465ED48C6B30A723AD5D4F7A185E990E7B83D1F021` | 🔒 LOCKED |
| `tiffinloop_seed/subscribers.csv` | `C6C8AC76C4D249CC7ECC8147670B8E2D1DC0986F0AA3046D2270BB52EBD1284F` | 🔒 LOCKED |
| `tiffinloop_seed/ops_whatsapp_export.txt` | `95051DE0FBBEA34F19877A0CE0D8861B93A86ACAC16CA7F4B575598194856CBC` | 🔒 LOCKED |
| `tiffinloop_seed/README.txt` | `A4552970B1BE18C5556B0B9C7FF2286F7917DCA6AED7B087D5E4AFE9544F594C` | 🔒 LOCKED |

---

## 2. The 6 Non-Negotiable Audit Criteria & Failure Modes

### Criterion 1: Speed of Resolution (< 60s Triage)
- **Target Persona:** Ops Lead (Rohan / Priya) on 23-Sep-2026 at 10:30 AM (Lunch countdown 2 hrs).
- **Mandatory Detections:**
  1. `CK086` (Lakshmi Iyer, Bengaluru): 9 orders today (`on_leave` in sheet).
  2. `CK087` (Geeta Rao, Bengaluru): 9 orders today (`on_leave` in sheet).
  3. `CK090` (Sunita Kulkarni, Mumbai): 6 orders today (Messaged in WhatsApp at 7:41 AM, **NOT updated in sheet**).
- **Audit Verification Checks:**
  - [ ] **WhatsApp Ingestion Trap:** Does the system parse the WhatsApp export and identify Sunita Kulkarni (`CK090`) despite `cooks.csv` listing her as `active`? *Failing to detect Sunita is a critical failure.*
  - [ ] **Total Affected Orders:** Does the tool immediately surface all 24 affected orders (18 Bengaluru + 6 Mumbai) with subscriber names, meal times, addresses, diet types, and order amounts?
  - [ ] **Urgency Sorting:** Are Lunch orders (12:30 PM window) prioritized with visible countdown timers over Dinner orders (7:30 PM)?

---

### Criterion 2: Fallback Logic & Capacity Conflicts
- **Target:** Algorithmic reassignment of dropped orders to compatible active backup cooks.
- **Scoring & Ranking Invariants:**
  1. **City Hard Filter:** A subscriber in Bengaluru must NEVER be assigned to a cook in Mumbai or Pune, regardless of cuisine compatibility.
  2. **Dietary Hard Filter:**
     - `Jain` subscriber $\to$ MUST have a cook who serves `Jain`.
     - `Veg` subscriber $\to$ MUST have a cook who serves `Veg` or `Veg, Jain` or `Veg, Non-Veg`.
     - `Non-Veg` subscriber $\to$ Can receive from any compliant cook or matched preference.
  3. **Remaining Capacity Enforcement:**
     $$\text{remaining\_capacity} = \text{max\_daily\_orders} - \text{active\_orders\_today}$$
- **Conflict Handling (The Multi-Backup Split Challenge):**
  - If a single backup cook does not have sufficient remaining slots to absorb all 9 orders of `CK086` or `CK087`, the algorithm **must NOT over-assign or fail silently**.
  - It must intelligently split the batch across multiple backup cooks (e.g. 5 orders to Backup A, 4 orders to Backup B) or allow selective order escalation to instant refunds.

---

### Criterion 3: Subscriber Communication & The Tariq Hussain Trap
- **Target:** Contextual, empathetic simulated notification dispatch.
- **The Tariq Hussain Duplicate Trap:**
  - `SUB0511`: Tariq Hussain, `9812345678`, `CK087`, Lunch, ₹199 (`ORD07117`).
  - `SUB0512`: Tariq Husain, `+91 98123 45678`, `CK087`, Lunch, ₹129 (`ORD07118`).
- **Audit Verification Checks:**
  - [ ] **Deduplication Engine:** Normalizes phone numbers (stripping country codes `+91`, whitespace, hyphens) to detect identity collisions.
  - [ ] **Single Notification Guarantee:** Tariq must receive **ONE** consolidated notification referencing both lunch meal items/orders or warning Ops of a duplicate account, resolving Rohan's WhatsApp grievance (*"Tariq sir called again, asking why he gets two reminder messages every day"*).
  - [ ] **Message Quality:** Notification must specify:
    1. Acknowledgment of delay/dropout with empathetic tone.
    2. Assigned replacement cook name and cuisine.
    3. Revised delivery ETA within the meal window.
    4. One-click refund option if replacement is rejected.

---

### Criterion 4: Ops Traceability & Event Ledger
- **Target:** Complete historical audit trail of crisis resolution.
- **Audit Verification Checks:**
  - [ ] **Immutable Log Structure:** Every action taken in the triage UI must generate a structured event log entry containing:
    - Event Timestamp
    - Action Type (`AUTO_MATCH`, `SPLIT_MATCH`, `MANUAL_OVERRIDE`, `REFUND`)
    - Source Cook ID (`CK086`, `CK087`, `CK090`)
    - Target Backup Cook ID(s)
    - Affected Order IDs & Subscriber IDs
    - Dispatched Notification Preview
    - Operator ID / Timestamp
  - [ ] **Persistence:** Actions must persist across page reloads (e.g. SQLite / localStorage / file-backed JSON state).

---

### Criterion 5: The Second Build (Leadership 30-Day Analytics)
- **Target:** Dedicated `/leadership` one-page executive analytics view.
- **Historical Ground Truth (from `orders.csv` & `cooks.csv`):**
  - Total historical dropout orders: **134** (across 124 distinct cook-date events).
  - **Dropout Status Dirty Strings Handled:** `cook_dropout`, `cook no show`, `No Show`, `Cook No-Show`, `Cancelled - Cook Unavailable`.
  - **Top Repeat Offender Cooks:**
    - `CK080`: 20 dropouts (Repeat offender alert)
    - `CK062`: 20 dropouts (Repeat offender alert)
    - `CK032`: 7 dropouts
  - **City Distribution (by orders):**
    - Bengaluru: 66 dropouts
    - Pune: 49 dropouts
    - Mumbai: 19 dropouts
- **Audit Verification Checks:**
  - [ ] **Dual Date Format Parsing:** Correctly parses both `YYYY-MM-DD` and Indian `DD/MM/YYYY` formats without dropping or misinterpreting 30 non-ISO date strings.
  - [ ] **City Normalization:** Correctly unifies `BLR`, `Bangalore`, `Bengaluru`, `Mum`, `Mumbai`, `Bombay`, `Pune`, `PUNE`.
  - [ ] **Executive Actionability:** Highlights repeat no-show cooks for contract termination and identifies city-level supply vulnerability.

---

### Criterion 6: Code Quality, TDD & Security
- **Target:** Robust production-grade engineering under ECC.
- **Audit Verification Checks:**
  - [ ] **TDD Automated Tests:** Test suite verifying WhatsApp parser, capacity allocation, phone deduplication, and analytics math.
  - [ ] **Input Sanitization:** XSS protection on subscriber inputs, parameterized state transitions.
  - [ ] **No Dead Code / Hallucinated Imports:** Verified via `gateguard`.

---

## 3. Review Verdict Protocol

When Chat 1 submits diffs, the review will output:
1. Exact file and line citations.
2. Concrete failure scenarios (input, state, bad outcome).
3. Checksum verification of `tiffinloop_seed/`.
4. Verdict: **`APPROVE`**, **`WARNING`**, or **`BLOCK`**.
