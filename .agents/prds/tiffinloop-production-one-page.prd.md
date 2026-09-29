# TiffinLoop Production PRD: Ops Crisis & Intelligence Platform

**Author:** Principal Product Manager | **Baseline:** 7,138 Orders, 92 Cooks, 532 Users (BLR, MUM, PUN)  
**Constraint:** Strict One-Page Specification (~500 Words Maximum)

---

### 1. The Problem: Operational Blindness & Churn Bleed
TiffinLoop delivers daily subscription meals across Bengaluru, Mumbai, and Pune. Over 30 days (7,138 orders), 134 dropouts occurred (1.88% failure rate), causing ₹19,644 in lost GMV and ₹6,700 in emergency credits. Crucially, 95 subscribers suffered unannounced meal failures (19 repeatedly). Uncommunicated failures drive ~35% churn (33 subscribers), destroying **₹8.55 Lakhs in annualized recurring revenue** (81.3% monthly GMV). During Festival Week (23-Sep), disruptions spiked 5.7x to 10.08% (24 orders across 3 cooks), threatening immediate churn.

### 2. Who It's For: Dual-Persona Architecture
- **Ops Coordinator (Priya - Reactive Speed):** Needs sub-60s triage during the 120-minute pre-lunch window to catch sheet/WhatsApp dropouts, reassign orders without dietary violations (strict Jain), and dispatch alerts.
- **Leadership / CEO (Rohan - Strategic Governance):** Needs 30-day macro intelligence to spot regional failure drivers, govern rogue vendor risk, and protect subscriber retention over daily firefighting.

### 3. How We Measure Success: The Outcome Hierarchy
- **North Star Metric (NSM):** **Perfect Meal Delivery Rate (PMDR)** $\ge \mathbf{99.50\%}$ (disrupted meals dropping from 1.88% to $<0.5\%$).
- **Product Outcomes:** Triage resolution $< 60\text{s}$ (down from 45 min); $100\%$ pre-meal notification reach; Pune dropout rate reduced from $5.27\% \to < 1.00\%$.
- **Counter-Guardrails:** Zero Jain dietary violations (100% compliance); Kitchen capacity buffer $\ge 25\%$; Reassignment-to-Refund ratio $\ge 85:15$.

### 4. What Our Prototype Proved (Hypothesis De-Risking)
- **Deterministic Constraint Solver Works:** In-memory Most-Restricted-Variable (MRV) heuristic solved capacity deficits in $<100\text{ms}$. In Bengaluru, it routed 2 Jain orders to Jain-certified kitchens (`CK061`, `CK040`) and allocated Meena Nair's (`CK088`) 8 remaining slots to Veg lunch.
- **Entity Deduplication Defuses Complaints:** Merged Tariq Hussain's duplicate accounts (`SUB0511`/`SUB0512`), suppressing duplicate WhatsApp spam and double billing.
- **Pune is Vendor Governance Failure, Not Market Failure:** 40 of Pune's 49 dropouts (**81.63%**) stemmed from two cooks: Imran Agarwal (`CK080`, 20 drops, 35.1% failure) and Salman Sharma (`CK062`, 20 drops, 25.3% failure). Counterfactual simulation proved offboarding them plummets Pune's dropout rate from **5.27% to 0.97%**—making it our #1 city.

### 5. What We Deliberately Cut & Why (Risk/Complexity Pruning)
- **Live Twilio/Meta API:** Replaced with simulated chat previews to validate messaging reach and deduplication without third-party auth and template latency.
- **Black-Box ML Routing:** Replaced with deterministic heuristic scoring ($w_{\text{cui}}=100, w_{\text{cap}}=40, w_{\text{rel}}=30$) for sub-millisecond execution and full explainability.
- **Automated Cook Self-Termination:** Replaced with human-in-the-loop suspension prompts to prevent wrongful offboarding and legal contract friction.

### 6. Open Engineering Questions for Production
1. **3PL Courier Synchronization:** How do we dynamically re-route gig couriers (e.g. Dunzo/Shadowfax) when meals shift to backup kitchens 4 km away without missing 12:30 PM pickup?
2. **Morning 7:00 AM Heartbeat Protocol:** Can an automated WhatsApp push (*"Reply 1 to confirm prep"*) capture dropouts 5 hours before lunch rather than 2 hours before?
3. **Vendor Contract SLAs:** What legal penalty structure can enforce attendance during festival surge weeks without violating gig-worker labor classifications in Maharashtra and Karnataka?
