# Research Document 0001: Data Normalization Rules & Entity Ingestion

**Project:** TiffinLoop Ops Crisis & Dropout Resolution  
**Author:** Lead Researcher & Systems Architect  
**Date:** 2026-09-26  
**Simulation Anchor Time:** 10:30 AM, 23 September 2026  
**Status:** Approved for Implementation by Chat 1 (The Builder)  

---

## 1. Executive Summary & Core Invariant

The TiffinLoop operations infrastructure currently relies on data exported from disparate sources:
- WhatsApp signup threads
- Hand-maintained Google Sheets (`cooks.csv`, `subscribers.csv`)
- An unnormalized legacy order ledger (`orders.csv`)
- An unstructured ops WhatsApp chat log (`ops_whatsapp_export.txt`)

### The Non-Negotiable Invariant
> **Zero Source File Alteration:** Source CSVs and text files in `tiffinloop_seed/` are immutable production artifacts. No manual edits, script rewrites, or in-place file modifications are permitted. All data cleansing, alias resolution, type coercion, and deduplication **must occur in memory** during the ingestion pipeline.

---

## 2. City Normalization

### 2.1 Raw Data Variations Observed
Analysis of 92 cook profiles and 532 subscriber profiles reveals extensive alias and capitalization drift across all three operational hubs:

| Canonical Hub | City Code | Observed Raw Variations in Seed Data | Occurrence Breakdown |
| :--- | :--- | :--- | :--- |
| **Bengaluru** | `BLR` | `Bengaluru`, `Bangalore`, `BLR`, `Blr`, `bangalore` | Cooks: 44 \| Subscribers: 338 |
| **Mumbai** | `MUM` | `Mumbai`, `MUM`, `Bombay` | Cooks: 36 \| Subscribers: 124 |
| **Pune** | `PNQ` | `Pune`, `PUNE`, `pune` | Cooks: 12 \| Subscribers: 70 |

### 2.2 Canonical Mapping Table
```typescript
export type CanonicalCity = 'Bengaluru' | 'Mumbai' | 'Pune';

export const CITY_ALIAS_MAP: Record<string, CanonicalCity> = {
  // Bengaluru aliases
  'bengaluru': 'Bengaluru',
  'bangalore': 'Bengaluru',
  'blr': 'Bengaluru',
  
  // Mumbai aliases
  'mumbai': 'Mumbai',
  'mum': 'Mumbai',
  'bombay': 'Mumbai',
  
  // Pune aliases
  'pune': 'Pune',
  'pnq': 'Pune',
};

export function normalizeCity(rawCity: string | null | undefined): CanonicalCity {
  if (!rawCity) return 'Bengaluru'; // Default fallback or throw validation error
  const sanitized = rawCity.trim().toLowerCase();
  const canonical = CITY_ALIAS_MAP[sanitized];
  if (!canonical) {
    throw new Error(`Unrecognized city alias encountered: "${rawCity}"`);
  }
  return canonical;
}
```

---

## 3. Date & Timestamp Normalization

### 3.1 Observed Variations
The dataset spans 7,138 orders, 92 cooks, and 532 subscribers across multiple date notations:

1. **ISO Standard (`YYYY-MM-DD`):** 6,936 orders in `orders.csv`, all 92 `joined_date` entries in `cooks.csv`, all 532 `start_date` entries in `subscribers.csv`.
2. **British/Indian Format (`DD/MM/YYYY`):** 202 orders in `orders.csv`, 2 entries in `cooks.csv` (`status_since`).
3. **Alphanumeric Month (`DD-Mon-YYYY`):** 2 entries in `cooks.csv` (`status_since`, e.g. `19-Sep-2026`, `09-Sep-2026`).
4. **WhatsApp Chat Timestamps (`DD/MM/YY, h:mm a`):** e.g. `23/09/26, 7:41 am` in `ops_whatsapp_export.txt`.

### 3.2 Canonical Target Representation
- All calendar dates are normalized to strict ISO 8601 strings: `YYYY-MM-DD`.
- Operational simulation time is locked at: `2026-09-23T10:30:00+05:30`.
- Delivery windows for `2026-09-23`:
  - **Lunch Window:** `12:30 PM – 2:00 PM` (Starts in **2 hours** relative to 10:30 AM).
  - **Dinner Window:** `7:30 PM – 9:00 PM` (Starts in **9 hours** relative to 10:30 AM).

### 3.3 Normalization Implementation
```typescript
const MONTH_LOOKUP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
};

export function normalizeDate(rawDate: string | null | undefined): string | null {
  if (!rawDate || !rawDate.trim()) return null;
  const str = rawDate.trim();

  // Pattern 1: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Pattern 2: DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Pattern 3: DD-Mon-YYYY (e.g. 19-Sep-2026)
  const dMonYMatch = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dMonYMatch) {
    const [, day, mon, year] = dMonYMatch;
    const month = MONTH_LOOKUP[mon.toLowerCase()] || '01';
    return `${year}-${month}-${day.padStart(2, '0')}`;
  }

  return str;
}
```

---

## 4. Phone Number Standardization

### 4.1 Observed Variations
- **Empty / Unrecorded Phone Numbers:** 16 cooks (17.4%) and 69 subscribers (13.0%) have blank phone entries `""`.
- **10-Digit Standard:** e.g., `9170149810` (50 cooks, 264 subscribers).
- **11-Digit with Leading Zero:** e.g., `09459672275` (10 cooks, 68 subscribers).
- **International Prefix with Spaces:** e.g., `+91 99399 33063` (16 cooks, 131 subscribers).

### 4.2 Standardization Rules
1. Strip all whitespace, hyphens, and parentheses.
2. Remove leading `+91` or `91` if followed by 10 digits.
3. Remove leading `0` if followed by 10 digits.
4. Verify remaining string length is exactly 10 numeric digits.
5. Canonical storage: E.164 format `+91XXXXXXXXXX` (or `null` if blank).
6. Display formatting: `+91 XXXXX XXXXX`.

```typescript
export interface NormalizedPhone {
  raw: string;
  e164: string | null;
  display: string;
  isValid: boolean;
}

export function normalizePhone(rawPhone: string | null | undefined): NormalizedPhone {
  if (!rawPhone || !rawPhone.trim()) {
    return { raw: '', e164: null, display: 'Not Provided', isValid: false };
  }

  const raw = rawPhone.trim();
  let digits = raw.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    return {
      raw,
      e164: `+91${digits}`,
      display: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      isValid: true,
    };
  }

  return { raw, e164: null, display: raw, isValid: false };
}
```

---

## 5. Status Normalization & State Machine

### 5.1 Order Status Consolidation (7,138 Orders)
Historical records contain 17 distinct spelling/casing variations for order statuses. These map into 6 canonical enum states:

| Canonical Status | Raw Variations Observed | Historical Count | Operational Significance |
| :--- | :--- | :--- | :--- |
| `DELIVERED` | `Delivered`, `delivered`, `Completed`, `DELIVERED` | 5,144 | Successfully served orders. |
| `PENDING` | `Pending`, `pending` | 578 | Orders scheduled for today's delivery window. |
| `IN_PROGRESS` | `In Progress`, `in-progress` | 405 | Kitchen preparation underway. |
| `CANCELLED` | `Cancelled`, `cancelled`, `CANCELLED` | 572 | Subscriber-initiated cancellation. |
| `REFUNDED` | `refunded`, `Refunded` | 305 | Financial settlement returned to subscriber. |
| `COOK_DROPOUT` | `cook_dropout`, `cook no show`, `No Show`, `Cook No-Show`, `Cancelled - Cook Unavailable` | 134 | **Chronic operational failure:** Cook failed to deliver. |

```typescript
export type CanonicalOrderStatus = 
  | 'DELIVERED' 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'COOK_DROPOUT';

export function normalizeOrderStatus(raw: string): CanonicalOrderStatus {
  const s = raw.trim().toLowerCase();
  if (['delivered', 'completed'].includes(s)) return 'DELIVERED';
  if (['pending'].includes(s)) return 'PENDING';
  if (['in progress', 'in-progress'].includes(s)) return 'IN_PROGRESS';
  if (['cancelled'].includes(s)) return 'CANCELLED';
  if (['refunded'].includes(s)) return 'REFUNDED';
  if (['cook_dropout', 'cook no show', 'no show', 'cook no-show', 'cancelled - cook unavailable'].includes(s)) {
    return 'COOK_DROPOUT';
  }
  return 'PENDING';
}
```

### 5.2 Cook Status & Real-Time WhatsApp Fusion
In `cooks.csv`, cook statuses are:
- `active` (80 cooks)
- `on_leave` (9 cooks)
- `inactive` (3 cooks)

#### The Critical Real-Time Anomaly: Sunita Kulkarni (`CK090`)
- In `cooks.csv`, `CK090` is recorded as `status: active`!
- In `ops_whatsapp_export.txt` at **7:41 AM (23-Sep-2026)**:
  > *"Sunita Kulkarni: Bhaiya aaj nahi ho payega, gaon jana pad raha hai urgent. Sorry 🙏"*
- Priya (Ops) acknowledged at 8:02 AM ("Will do after standup"), but standup ended at 9:40 AM and Rohan instructed her to handle Bengaluru first. **Sunita was never updated in the spreadsheet.**
- **Ingestion Pipeline Rule:** The ingestion engine must fuse the static sheet with the live WhatsApp event stream. Any cook who reported a dropout on WhatsApp today receives derived status: `DROPOUT_UNRECORDED` with high-severity triage priority.

---

## 6. Dietary Compatibility Matrix

Cooks have a `serves` field defining the exact dietary categories they are certified to prepare. Subscribers have a strict `diet` field.

### 6.1 Dietary Permissibility Rules
1. **Jain Subscribers (`Jain`):**
   - **Zero Tolerance:** No root vegetables (potatoes, onions, garlic).
   - Can **ONLY** be served by cooks whose `serves` explicitly contains `Jain`.
   - *Example:* A cook serving `Veg, Non-Veg` cannot cook for a Jain subscriber under any circumstances.
2. **Vegetarian Subscribers (`Veg`):**
   - Can be served by any cook whose `serves` contains `Veg`.
   - (All 92 cooks in the TiffinLoop roster serve Veg).
3. **Non-Vegetarian Subscribers (`Non-Veg`):**
   - Can be served by cooks whose `serves` includes `Non-Veg` (if ordering non-veg dishes), or by `Veg` cooks if the order is vegetarian.

```typescript
export type DietType = 'Veg' | 'Jain' | 'Non-Veg';

export function isDietCompatible(cookServes: string, subscriberDiet: DietType): boolean {
  const supported = cookServes.split(',').map(s => s.trim().toLowerCase());
  const target = subscriberDiet.toLowerCase();
  return supported.includes(target);
}
```

---

## 7. Deduplication Engine: The Tariq Hussain Trap

### 7.1 Forensic Analysis
The ops chat notes:
> *23/09/26, 9:10 am - Rohan (Ops): Tariq sir called again, asking why he gets two reminder messages every day*

Querying `subscribers.csv` reveals two distinct entries:
1. `SUB0511`: Name = `Tariq Hussain`, Phone = `9812345678`, City = `Bengaluru`, Cook = `CK087`, Plan = `Lunch Only`, Start = `2025-10-20`
2. `SUB0512`: Name = `Tariq Husain`, Phone = `+91 98123 45678`, City = `Bangalore`, Cook = `CK087`, Plan = `Lunch Only`, Start = `2025-12-19`

In `orders.csv` on **23-Sep-2026**:
- `ORD07117`: `SUB0511`, Cook `CK087`, Lunch, Amount `₹199`
- `ORD07118`: `SUB0512`, Cook `CK087`, Lunch, Amount `₹129`

Both entries point to the same physical individual (identical 10-digit phone `9812345678`, same delivery hub, same cook `CK087`). Because `CK087` (Geeta Rao) dropped out today, Tariq is currently facing **two simultaneous cancelled orders** and would receive **two automated crisis WhatsApp notifications** if not deduplicated!

### 7.2 Deduplication Ingestion Rules
1. **Primary Cluster Key:** Normalized 10-digit phone number.
2. **Secondary Cluster Key:** Identical normalized city + Jaro-Winkler string similarity $\ge 0.88$ on subscriber name.
3. **Ops Triage Action:**
   - Link `SUB0512` as a duplicate alias of primary profile `SUB0511`.
   - In the `/ops` UI, display an explicit **Duplicate Subscriber Alert badge**.
   - Suppress redundant simulated notifications: send only **one combined triage message** to Tariq.
   - Flag the duplicate order for ops reconciliation (merge or auto-refund the duplicate charge of ₹129).

---

## 8. Today's Crisis Baseline (23-Sep-2026, 10:30 AM)

Following normalized data ingestion, the crisis triage desk detects exactly **24 affected orders** across **3 dropped-out cooks**:

| Cook ID | Cook Name | City | Status Source | Total Orders Today | Lunch Orders (12:30 PM) | Dinner Orders (7:30 PM) | Affected Subscribers |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`CK086`** | Lakshmi Iyer | Bengaluru | Sheet (`on_leave`) | 9 | 5 (1 Jain, 4 Veg) | 4 (Veg) | `SUB0495` – `SUB0503` |
| **`CK087`** | Geeta Rao | Bengaluru | Sheet (`on_leave`) | 9 | 5 (5 Veg; incl. Tariq x2) | 4 (1 Jain, 3 Veg) | `SUB0504` – `SUB0512` |
| **`CK090`** | Sunita Kulkarni | Mumbai | WhatsApp (7:41 AM) | 6 | 4 (Veg) | 2 (Veg) | `SUB0517` – `SUB0522` |
| **Total** | | | | **24** | **14** | **10** | **23 unique individuals** |

*(Note: 24 total orders belong to 23 unique human subscribers due to the Tariq Hussain duplication `SUB0511`/`SUB0512`).*
