# ADR-0001: Next.js App Router + Tailwind CSS with In-Memory Seed Engine

**Date**: 2026-09-26  
**Status**: accepted  
**Deciders**: Lead Researcher & Systems Architect, APM Ops Lead  

---

## Context

TiffinLoop operates a daily meal delivery network connecting 500+ subscribers with 90+ home cooks across Bengaluru, Mumbai, and Pune. Current daily operations depend on a patchwork of hand-updated spreadsheets and emergency WhatsApp messages. On the morning of **23-Sep-2026 at 10:30 AM**, three home cooks (`CK086`, `CK087`, and `CK090`) have dropped out, putting 24 lunch and dinner orders at risk of non-delivery. With lunch deliveries commencing at 12:30 PM (2-hour countdown), operations personnel require an emergency triage system capable of:

1. Ingesting raw, inconsistent seed data (`cooks.csv`, `subscribers.csv`, `orders.csv`, and `ops_whatsapp_export.txt`) without modifying source files.
2. Detecting active dropouts across both sheet statuses (`on_leave`) and real-time unstructured WhatsApp messages.
3. Executing an automated fallback matching algorithm that checks hard cook capacities, dietary compliance (e.g., strict Jain requirements), and cuisine affinity.
4. Providing two unified, self-explanatory web views: `/ops` (emergency triage) and `/leadership` (30-day reliability analytics).
5. Deploying seamlessly to a public URL on Vercel with zero database configuration overhead.

---

## Decision

We adopt a **Next.js (App Router, TypeScript) and Tailwind CSS** architecture powered by an **In-Memory Normalized Data Engine**:

1. **Frontend & Presentation:** Next.js App Router with React Server Components (RSC) and Client Components. Styled using **Tailwind CSS**, Lucide React iconography, and Radix UI / Shadcn UI primitives for an intuitive, zero-training operational experience.
2. **Data Ingestion & Storage:** Zero external database dependency. The raw CSV files from `tiffinloop_seed/` are loaded once via Node.js file system APIs on server initialization, parsed using `papaparse` / `csv-parse`, normalized through strict TypeScript domain types, and cached in an in-memory repository.
3. **Operational State & Reassignment:** Real-time triage actions (reassignments, order splits, refund escalations) are managed via an in-memory mutable session store paired with browser `localStorage` persistence, ensuring instantaneous interactive updates without altering source files.
4. **Target Views & Routing:**
   - [`/ops`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/docs/adr/0001-stack-and-architecture.md#views): Emergency Triage Desk with countdown timer, dropout alerts, 1-click fallback reassignment, conflict split resolution, and simulated WhatsApp subscriber communication modal.
   - [`/leadership`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/docs/adr/0001-stack-and-architecture.md#views): 30-day executive dashboard tracking city dropout rates, chronic no-show cooks (`CK080`, `CK062`), and revenue protection metrics.
   - `/api/triage`: Endpoints for matching candidate cooks, executing splits, and logging triage decisions.
   - `/api/analytics`: Aggregation endpoints for 30-day trend lines and cook scorecards.

---

## Alternatives Considered

### Alternative 1: Python/FastAPI Backend + React/Vite Frontend + SQLite / PostgreSQL
- **Pros**: Familiar data science and pandas tooling; robust SQL relational schema.
- **Cons**: Requires two separate deployment runtimes (e.g. Render/Fly.io for Python + Vercel for React), cross-origin CORS configuration, and database provisioning steps that add latency and failure modes.
- **Why not**: Fails the requirement for instantaneous, zero-config, single-repository deployment on Vercel.

### Alternative 2: Pure Client-Side Single Page Application (Vite + React)
- **Pros**: Simple static hosting on Vercel or GitHub Pages.
- **Cons**: Requires shipping all raw CSV files to the client browser; exposes parsing overhead and unnormalized data logic in frontend bundles; prevents clean server-side API abstraction for future real-world webhook/WhatsApp API integrations.
- **Why not**: Sub-optimal separation of concerns and weaker architecture for enterprise ops tools.

### Alternative 3: Next.js + SQLite (`better-sqlite3` on disk)
- **Pros**: SQL query interface, persistent file-based database.
- **Cons**: `better-sqlite3` relies on native C++ compilation bindings that often trigger build failures or read-only filesystem errors in Vercel Serverless Functions.
- **Why not**: In-memory TypeScript data structures over ~7,138 records require less than 5 MB of RAM and execute in sub-millisecond time without native binary compile risks.

---

## Consequences

### Positive
- **Zero-Config Vercel Deployment:** Single command or git push deploys the entire application with serverless functions and pre-rendered pages.
- **Microsecond Latency:** In-memory lookups, filtering, and scoring over 92 cooks, 532 subscribers, and 7,138 orders run with zero database roundtrip latency (< 2 ms).
- **Strict Data Immutability:** Seed CSV files in `tiffinloop_seed/` remain completely untouched, adhering to the core assignment constraint.
- **Full Type Safety:** Shared TypeScript interfaces across parsing, normalization, scoring algorithms, and React UI components prevent runtime schema bugs.

### Negative
- **Serverless In-Memory Ephemerality:** In a pure serverless deployment, in-memory state can reset across cold starts.
  - *Mitigation:* The frontend maintains the active triage session state in React state and hydrates from browser `localStorage`, ensuring the operator's reassignments persist throughout the interactive review.

### Risks
- **Memory Consumption:** If dataset size grew to millions of records, in-memory storage would exceed Vercel serverless memory limits (1024 MB).
  - *Assessment & Mitigation:* Current dataset is ~7.1k rows (~800 KB raw text). The footprint in Node.js memory is under 6 MB, well below serverless limits. If scaling to 100k+ records in production, an external PostgreSQL/Supabase database would be introduced via an ADR amendment.
