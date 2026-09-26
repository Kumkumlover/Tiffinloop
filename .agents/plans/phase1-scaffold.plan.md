# Implementation Plan: Phase 1 — Project Scaffolding & Test Harness

This plan defines the foundational scaffolding for the **TiffinLoop** application (StampMyVisa APM assignment) following the accepted architecture in [`docs/adr/0001-stack-and-architecture.md`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/docs/adr/0001-stack-and-architecture.md).

---

## User Review Required

> [!IMPORTANT]
> **Tech Stack & Deployment Target:**
> - **Framework:** Next.js 15+ (App Router, React 19, TypeScript)
> - **Styling:** Tailwind CSS + Lucide React icons
> - **Testing:** Vitest + React Testing Library (for sub-second TDD iteration)
> - **Data Parser:** `papaparse` + Node.js `fs` (zero-database, in-memory execution)
> - **Deployment Target:** Vercel (1-click zero-config deploy)

---

## Proposed Changes

### Project Scaffolding & Dependencies

#### [NEW] [`package.json`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/package.json)
- Core dependencies: `next`, `react`, `react-dom`, `lucide-react`, `papaparse`, `clsx`, `tailwind-merge`.
- Dev dependencies: `typescript`, `@types/react`, `@types/node`, `@types/papaparse`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/react`.
- Scripts: `dev`, `build`, `start`, `test`, `test:coverage`, `typecheck`.

#### [NEW] [`tsconfig.json`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/tsconfig.json)
- Strict mode enabled, `@/*` mapped to `./src/*`.

#### [NEW] [`vitest.config.ts`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/vitest.config.ts)
- Vitest configuration with path aliases and JSDOM environment for component testing.

#### [NEW] [`tailwind.config.js`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/tailwind.config.js) & [`postcss.config.js`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/postcss.config.js)
- Modern styling setup tailored for enterprise operations tooling (clean neutral slate with amber/red crisis badges).

---

### Source Directory Layout

```
src/
├── app/
│   ├── layout.tsx             # Root layout with navigation & simulation banner
│   ├── page.tsx               # Redirect to /ops
│   ├── globals.css            # Tailwind baseline & custom scrollbars
│   ├── ops/
│   │   └── page.tsx           # Build 1: Emergency Triage Desk
│   └── leadership/
│       └── page.tsx           # Build 2: 30-Day Reliability Dashboard
├── lib/
│   ├── types.ts               # Canonical TypeScript interfaces (Cook, Subscriber, Order, etc.)
│   ├── data-loader.ts         # In-memory CSV & WhatsApp parser
│   ├── normalizers.ts         # Pure normalization functions (cities, phones, statuses, dates)
│   ├── fallback-engine.ts     # Capacity math & candidate ranking algorithm
│   └── triage-store.ts        # Interactive session state & local storage hydration
└── components/
    ├── ui/                    # Badges, cards, modals, countdown timers
    ├── ops/                   # Dropout alerts, affected table, fallback picker, WhatsApp preview
    └── leadership/            # City charts, repeat no-show leaderboards, revenue impact
```

---

### Verification & Test Harness

#### [NEW] [`tests/unit/baseline.test.ts`](file:///c:/Users/user/Documents/antigravity/peaceful-brahmagupta/tests/unit/baseline.test.ts)
- Simple sanity test proving that Vitest runs, resolves imports, and asserts accurately.

---

## Verification Plan

### Automated Tests
1. **Dependency Installation**: `npm install` completes cleanly with 0 vulnerabilities.
2. **Typecheck**: `npx tsc --noEmit` verifies strict TypeScript setup.
3. **Test Suite Baseline**: `npm test` executes Vitest and passes with 100% green status.
4. **Seed Integrity**: Verify that `tiffinloop_seed/` checksums match Chat 3's locked baseline.

### Manual Verification
- Verify that `npm run build` succeeds locally without errors.
