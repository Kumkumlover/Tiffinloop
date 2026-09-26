# Build 1 Data Contract Specification: Ops Emergency Triage Tool

**Project:** TiffinLoop Ops Crisis & Dropout Resolution  
**Author:** Lead Researcher & Systems Architect  
**Methodology:** `contract-first` (ECC Framework)  
**Date:** 2026-09-26  
**Simulation Anchor Time:** 10:30 AM, 23 September 2026  
**Status:** Authoritative Contract for Build 1 (Chat 1 - The Builder)  

---

## 1. Boundary & Authority Statement

Per the **Contract-First Collaboration** standard, this document serves as the **single source of truth** governing:
1. Data models exchanged between the server-side ingestion engine and the `/ops` UI.
2. API contract shapes for triage endpoints (`/api/triage/candidates`, `/api/triage/reassign`, `/api/triage/notify`).
3. State persistence payloads stored in the in-memory mutation layer and browser `localStorage`.

No frontend component or serverless handler may introduce uncontracted fields or deviate from enum definitions declared herein.

---

## 2. Core Domain Types & Enums

```typescript
/** Canonical hubs supported by TiffinLoop */
export type CanonicalCity = 'Bengaluru' | 'Mumbai' | 'Pune';

/** Regional cuisine specialties */
export type CuisineType = 
  | 'North Indian' 
  | 'Punjabi' 
  | 'South Indian' 
  | 'Gujarati' 
  | 'Bengali' 
  | 'Maharashtrian' 
  | 'Continental';

/** Supported dietary categories */
export type DietType = 'Veg' | 'Jain' | 'Non-Veg';

/** Delivery meal windows */
export type MealType = 'Lunch' | 'Dinner';

/** Subscriber subscription plans */
export type MealPlan = 'Lunch Only' | 'Dinner Only' | 'Lunch + Dinner';

/** Canonical Order Statuses */
export type CanonicalOrderStatus = 
  | 'DELIVERED' 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'COOK_DROPOUT';

/** Source through which a cook's dropout was captured */
export type DropoutDetectionSource = 
  | 'SHEET_ON_LEAVE'       // Found in cooks.csv (e.g. CK086, CK087)
  | 'WHATSAPP_UNRECORDED';  // Detected via WhatsApp chat at 7:41 AM (CK090 Sunita Kulkarni)

/** Dropout resolution lifecycle state */
export type DropoutTriageStatus = 
  | 'UNRESOLVED'   // Orders are disrupted, no reassignments chosen
  | 'IN_TRIAGE'    // Operator is currently configuring split/reassignments
  | 'RESOLVED';    // All orders reassigned or refunded, notifications dispatched
```

---

## 3. Normalized Entity Contracts

### 3.1 Normalized Cook (`NormalizedCook`)
Represents a home cook after source ingestion and capacity calculation.

```typescript
export interface NormalizedCook {
  cookId: string;                     // e.g. "CK086"
  cookName: string;                   // e.g. "Lakshmi Iyer"
  city: CanonicalCity;                // Canonical "Bengaluru"
  cuisineSpecialty: CuisineType;      // e.g. "South Indian"
  serves: DietType[];                 // e.g. ["Veg", "Jain"] or ["Veg", "Non-Veg"]
  phone: string | null;               // Canonical E.164 "+919812345678" or null
  phoneDisplay: string;               // "+91 98123 45678" or "Not Provided"
  sheetStatus: 'active' | 'on_leave' | 'inactive';
  statusSince: string | null;         // ISO Date "YYYY-MM-DD"
  joinedDate: string;                 // ISO Date "YYYY-MM-DD"
  maxDailyOrders: number;             // Kitchen maximum ceiling (e.g. 40)
  activeOrdersToday: number;          // Active scheduled orders for 23-Sep-2026
  remainingCapacity: number;          // maxDailyOrders - activeOrdersToday
  isDropoutToday: boolean;            // true if on_leave in sheet or dropped out in WhatsApp
  historicalDropouts: number;         // 30-day historical no-show count (from orders.csv)
}
```

### 3.2 Normalized Subscriber (`NormalizedSubscriber`)
Represents an active customer receiving daily meals.

```typescript
export interface NormalizedSubscriber {
  subscriberId: string;               // e.g. "SUB0511"
  subscriberName: string;             // e.g. "Tariq Hussain"
  city: CanonicalCity;                // Canonical "Bengaluru"
  phone: string | null;               // Canonical E.164 "+919812345678" or null
  phoneDisplay: string;               // "+91 98123 45678"
  assignedCookId: string;             // Default cook ID e.g. "CK087"
  mealPlan: MealPlan;                 // e.g. "Lunch Only"
  cuisinePref: CuisineType;           // e.g. "South Indian"
  diet: DietType;                     // "Veg" | "Jain" | "Non-Veg"
  subscriptionStatus: 'active' | 'paused';
  startDate: string;                  // ISO Date "YYYY-MM-DD"
  
  // Deduplication & Entity Clustering Flags
  isDuplicateAlias: boolean;          // true for SUB0512 (points to primary SUB0511)
  canonicalSubscriberId: string;      // "SUB0511" for both SUB0511 and SUB0512
  duplicateClusterCount: number;      // 2 for Tariq Hussain
}
```

### 3.3 Normalized Order (`NormalizedOrder`)
Represents an individual meal order in the system.

```typescript
export interface NormalizedOrder {
  orderId: string;                    // e.g. "ORD07108"
  orderDate: string;                  // ISO Date "2026-09-23"
  subscriberId: string;               // e.g. "SUB0502"
  cookId: string;                     // Assigned cook ID e.g. "CK086"
  mealType: MealType;                 // "Lunch" | "Dinner"
  status: CanonicalOrderStatus;       // "PENDING" | "IN_PROGRESS" | etc.
  amountInr: number;                  // e.g. 199
  
  // Enriched relational attributes for instant triage rendering
  subscriberName: string;             // "Bhavna Shah"
  subscriberDiet: DietType;           // "Jain"
  subscriberCuisine: CuisineType;     // "South Indian"
  subscriberPhone: string | null;     // "+91..."
  deliveryCity: CanonicalCity;        // "Bengaluru"
  deliveryWindow: string;             // "12:30 PM - 2:00 PM"
}
```

---

## 4. Dropout Alert Contract (`DropoutAlert`)

Generated by the real-time detection engine to represent an emergency cook failure this morning.

```typescript
export interface DropoutAlert {
  alertId: string;                    // e.g. "ALERT-CK086-20260923"
  cookId: string;                     // "CK086"
  cookName: string;                   // "Lakshmi Iyer"
  city: CanonicalCity;                // "Bengaluru"
  cuisineSpecialty: CuisineType;      // "South Indian"
  detectionSource: DropoutDetectionSource; 
  reportedTime: string;               // "2026-09-23T06:52:00+05:30"
  reportedNote: string;               // "Fever, not cooking today. (Sheet updated by Priya)"
  triageStatus: DropoutTriageStatus;  // "UNRESOLVED" | "IN_TRIAGE" | "RESOLVED"
  
  // Impacted Metrics
  totalAffectedOrders: number;        // e.g. 9
  lunchOrdersCount: number;           // e.g. 5
  dinnerOrdersCount: number;          // e.g. 4
  uniqueSubscribersCount: number;     // e.g. 9
  hasDuplicateSubscriber: boolean;   // true for CK087 (Tariq Hussain SUB0511/512)
  hasJainOrders: boolean;             // true if any affected order requires Jain diet
  
  // Affected Order Identifiers
  affectedOrders: NormalizedOrder[];
}
```

### Exact Seed Instantiations on 23-Sep-2026:
1. `ALERT-CK086-20260923`: Lakshmi Iyer, Bengaluru, `SHEET_ON_LEAVE`, 9 orders (5 Lunch, 4 Dinner, 1 Jain).
2. `ALERT-CK087-20260923`: Geeta Rao, Bengaluru, `SHEET_ON_LEAVE`, 9 orders (5 Lunch, 4 Dinner, 1 Jain, Tariq duplicate).
3. `ALERT-CK090-20260923`: Sunita Kulkarni, Mumbai, `WHATSAPP_UNRECORDED`, 6 orders (4 Lunch, 2 Dinner, 0 Jain).

---

## 5. Fallback Candidate Contract (`FallbackCandidate`)

Returned by the ranking engine when an operator evaluates replacement cooks for an affected order batch.

```typescript
export interface FallbackCandidate {
  cookId: string;                     // e.g. "CK088"
  cookName: string;                   // "Meena Nair"
  city: CanonicalCity;                // "Bengaluru"
  cuisineSpecialty: CuisineType;      // "South Indian"
  serves: DietType[];                 // ["Veg", "Non-Veg"]
  phone: string | null;               // "+91 94497 80371"
  
  // Capacity Metrics
  maxDailyOrders: number;             // 12
  activeOrdersToday: number;          // 4
  remainingCapacity: number;          // 8
  
  // Compatibility Scoring Breakdown
  totalScore: number;                 // e.g. 156.7 (Max 170)
  scoreBreakdown: {
    cuisineScore: number;             // 100.0 (Exact match) or 40.0 (Regional)
    capacityScore: number;            // 26.7 (8 / 12 * 40)
    reliabilityScore: number;         // 30.0 (0 historical dropouts)
  };
  
  // Boolean Flags for Operator Confidence
  isExactCuisineMatch: boolean;       // true
  isJainCertified: boolean;           // false (Meena Nair does NOT serve Jain!)
  historicalDropouts: number;         // 0
  recommendationTag: 'BEST_MATCH' | 'HIGH_CAPACITY' | 'DIET_SPECIALIST' | 'AFFINITY_MATCH';
}
```

---

## 6. Triage Decision & Batch Split Contract

Captures the operator's operational action to reassign or refund disrupted orders.

```typescript
export type ReassignmentStrategy = 
  | 'SINGLE_COOK_BATCH'     // All orders assigned to one backup cook (e.g. Mumbai -> CK091)
  | 'MULTI_COOK_SPLIT'      // Orders divided across 2+ cooks due to capacity limit (Bengaluru)
  | 'REFUND_ALL'            // All orders cancelled with instant refund
  | 'HYBRID_ASSIGN_REFUND';  // Some orders reassigned, remainder refunded

export interface OrderReassignmentItem {
  orderId: string;
  subscriberId: string;
  subscriberName: string;
  mealType: MealType;
  diet: DietType;
  action: 'REASSIGN' | 'REFUND';
  assignedCookId: string | null;      // Backup cook ID or null if refund
  assignedCookName: string | null;    // Backup cook name or null
  refundAmountInr: number;            // Full order price
  goodwillCreditInr: number;          // ₹50 apology credit
  reason: string;                     // e.g. "Capacity exhausted; subscriber declined cuisine change"
}

export interface TriageDecision {
  decisionId: string;                 // UUID e.g. "DEC-20260923-001"
  dropoutAlertId: string;             // Reference to DropoutAlert
  droppedOutCookId: string;           // "CK086"
  timestamp: string;                  // ISO "2026-09-23T10:32:15+05:30"
  operatorId: string;                 // "Priya (Ops Desk)"
  strategy: ReassignmentStrategy;
  items: OrderReassignmentItem[];
  
  // Execution Summary
  totalOrdersProcessed: number;       // e.g. 9
  totalReassignedCount: number;       // e.g. 8
  totalRefundedCount: number;         // e.g. 1
  totalRefundAmountInr: number;       // ₹199 + ₹50 credit
}
```

---

## 7. Simulated Communication Contract (`NotificationPayload`)

Models the WhatsApp/SMS notification payload dispatched to subscribers.

```typescript
export type NotificationType = 
  | 'COOK_REASSIGNED' 
  | 'ORDER_REFUNDED' 
  | 'DUPLICATE_CONSOLIDATED';

export interface NotificationPayload {
  notificationId: string;             // e.g. "NOTIF-ORD07117-01"
  orderId: string;                    // "ORD07117"
  subscriberId: string;               // "SUB0511"
  subscriberName: string;             // "Tariq Hussain"
  recipientPhone: string;             // "+91 98123 45678"
  channel: 'WHATSAPP' | 'SMS';
  notificationType: NotificationType;
  deliveryWindow: string;             // "12:30 PM - 2:00 PM"
  
  // Deduplication Safeguards
  isDuplicateSuppressed: boolean;     // true for SUB0512! Suppresses second message
  suppressedAliasId?: string;         // "SUB0512"
  
  // Message Content
  headline: string;                   // "Update on your Lunch Tiffin today"
  messageBody: string;                // Complete WhatsApp text
  scheduledSendTime: string;          // "10:35 AM, 23-Sep-2026"
  sentStatus: 'SIMULATED_SENT' | 'FAILED';
}
```

### Sample Rendered Message Payloads

#### Sample 1: Cook Reassignment Message (Veg / Normal)
```
Hi Mahesh! 👋 
Quick update on your Lunch tiffin today (23-Sep): 
Your regular cook Lakshmi Iyer is unwell today. To make sure your meal arrives on time for lunch (12:30 PM - 2:00 PM), our expert home cook Meena Nair is preparing your South Indian Veg meal today! 🍲
Zero extra charge. Track your tiffin: tiffinloop.in/t/ORD07105
```

#### Sample 2: Deduplicated Combined Message (Tariq Hussain `SUB0511` / `SUB0512`)
```
Hi Tariq! 👋 
Important update on your Lunch tiffin today (23-Sep):
Your assigned cook Geeta Rao is on leave today. We have reassigned your meal to Meena Nair (South Indian Veg) for delivery between 12:30 PM - 2:00 PM.

Notice: We noticed duplicate active profiles for your phone number (SUB0511 & SUB0512). We have consolidated your lunch delivery into a single fresh tiffin today and refunded the redundant charge of ₹129 to your wallet. You will no longer receive duplicate notifications.
```

#### Sample 3: Refund & Apology Message (Jain Escalation)
```
Hi Bhavna, 🙏
We apologize sincerely! Your cook Lakshmi Iyer is unavailable today, and to protect your strict Jain dietary requirements, we could not find an approved South Indian Jain replacement kitchen in time for 12:30 PM lunch.
We have issued a 100% instant refund of ₹199 to your UPI account, plus a ₹50 goodwill credit to your TiffinLoop wallet. Please accept our apologies!
```

---

## 8. Traceability Audit Event Contract (`AuditLogEntry`)

Persisted to the audit ledger to fulfill **Success Criterion 4 (Ops Traceability)**:

```typescript
export interface AuditLogEntry {
  auditId: string;                    // e.g. "AUD-001"
  timestamp: string;                  // ISO "2026-09-23T10:34:00+05:30"
  eventType: 
    | 'DROPOUT_DETECTED' 
    | 'FALLBACK_EVALUATED' 
    | 'REASSIGNMENT_EXECUTED' 
    | 'REFUND_ISSUED' 
    | 'NOTIFICATION_DISPATCHED';
  operator: string;                   // "Priya (Ops Desk)"
  affectedCookId: string;             // "CK086"
  affectedOrderId?: string;           // "ORD07108"
  subscriberId?: string;              // "SUB0502"
  actionDetails: string;              // Summary of decision taken
  meta: Record<string, unknown>;      // Arbitrary audit context
}
```
