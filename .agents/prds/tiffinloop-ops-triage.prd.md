# PRD: TiffinLoop Ops Crisis & Dropout Resolution Tool
## AI Product Manager Assignment — StampMyVisa

## 1. Problem Definition
- **Context:** TiffinLoop connects 500+ subscribers with 90+ home cooks across Bengaluru, Mumbai, and Pune. Current operations rely on hand-updated spreadsheets and WhatsApp.
- **Current Time:** 10:30 AM, 23 September 2026. Lunch window starts at 12:30 PM (2-hour countdown); Dinner window starts at 7:30 PM.
- **Core Failure Mode:** Cooks drop out with zero notice (illness, emergencies, no-shows). Ops discovers this too late, leading to hungry subscribers, uncommunicated failures, and customer churn.
- **Unaddressed Dropouts This Morning (23-Sep-2026):**
  1. `CK086` (Lakshmi Iyer, Bengaluru): 9 orders today (On leave in sheet).
  2. `CK087` (Geeta Rao, Bengaluru): 9 orders today (On leave in sheet).
  3. `CK090` (Sunita Kulkarni, Mumbai): 6 orders today (Messaged in WhatsApp at 7:41 AM — **NOT updated in sheet yet**).
  4. Duplicate Subscriber Trap: `SUB0511` & `SUB0512` (Tariq Hussain/Husain) receiving double notifications.

---

## 2. Product Objectives & Success Criteria
1. **Speed of Resolution (< 60 seconds):**
   - Ingest real seed data (handling inconsistencies without modifying source files).
   - Instantly detect and surface dropped-out cooks (from both sheet and WhatsApp alerts).
   - Display all affected subscribers with order IDs, meal times (Lunch/Dinner), addresses, diet restrictions, and amounts.
2. **Smart Fallback Matching & Conflict Handling:**
   - Rank backup cooks based on: Same City + Compatible Diet (`Veg`, `Jain`, `Non-Veg`) + Cuisine specialty.
   - **Hard Capacity Check:** Calculate `remaining_capacity = max_daily_orders - active_orders_today`.
   - **Conflict Resolution:** If a backup cook cannot cover all affected orders, intelligently split orders across multiple backup cooks or escalate remaining orders to refunds.
3. **Simulated Subscriber Communication:**
   - Generate contextual simulated messages before mealtime (e.g. backup cook re-assignment with estimated delivery vs refund notice).
   - Flag and deduplicate identical subscribers (e.g. Tariq Hussain).
4. **Ops Traceability & Decision Log:**
   - Permanent event log: Record dropout time, affected subscribers, chosen backup cook/refund decision, and notification timestamp.
5. **Leadership Dashboard (Build 2):**
   - One-page executive view analyzing the last 30 days.
   - Dropout frequency by City (Bengaluru vs Pune vs Mumbai).
   - Dropout frequency by Cook (highlighting repeat no-shows like CK080 and CK062 with 20 dropouts each).

---

## 3. Technical & User Constraints
- **Zero source file alteration:** Clean messy data in code, never by hand.
- **Self-explanatory UI:** A stranger must be able to use it with zero onboarding.
- **Two unified views:**
  - View 1: `/ops` (Emergency Triage & Reassignment Tool)
  - View 2: `/leadership` (30-Day Dropout Pattern & Reliability Analytics)
- **Deployment:** Public live URL (e.g. Vercel) + Public GitHub repo + 1-Page Post-Build PRD + Build Log.
