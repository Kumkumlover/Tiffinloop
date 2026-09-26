# The ECC End-to-End Project Lifecycle Guide
### Companion Handbook for Stampmyvisa Development

Welcome to the **ECC (Everything Claude Code) Agent Operating System**. This document serves as your permanent reference and execution manual for developing **Stampmyvisa** from initial concept to production-ready deployment.

---

## The Core Loop

```
Plan ──► Test ──► Implement ──► Review ──► Verify ──► Remember ──► Improve
```

Instead of conversing loosely and losing track of context, every phase produces a **committable file on disk**. If you pause and return tomorrow, the agent picks up exactly where you left off.

---

## Phase-by-Phase Roadmap

### Phase 1: Day 0 — Project Scaffold & Guardrails
- **Objective:** Establish the tech stack, package manager, git hooks, and coding standards before writing features.
- **Artifacts Created:**
  - `AGENTS.md` (Already active! Controls agent behavior)
  - Project configuration (`package.json`, `pyproject.toml`, or `Cargo.toml`)
  - Testing framework setup (Vitest, Jest, PyTest, etc.)
- **Human Role:** Choose your preferred languages, frameworks, and database.
- **Agent Role:** Scaffolds the tooling, installs dependencies, and verifies that `npm test` or `pytest` runs cleanly.

---

### Phase 2: Product & Architecture Staging (Plan-PRD)
- **Objective:** Lock the *Why* (PRD) and *How* (Architecture & Implementation Plan) before touching code.
- **Workflow:**
  1. **PRD Creation:** Run the `product-capability` skill to define the scope, user personas, and acceptance criteria in `.agents/prds/{feature}.prd.md`.
  2. **Architecture Decisions:** Run `architecture-decision-records` to log critical tech decisions in `docs/adr/0001-{decision}.md`.
  3. **Plan Decomposition:** Run the planner to break down the PRD into thin vertical slices at `.agents/plans/{feature}.plan.md`.
- **🛑 Human Gate 1 (Plan Alignment):** You review the plan on disk, adjust anything you don't like, and give the green light. No code is written until you approve.

---

### Phase 3: Vertical-Slice Construction (TDD First)
- **Objective:** Build real working software in thin vertical slices (Database ↔ Backend API ↔ UI) using strict Test-Driven Development.
- **The Red-Green-Refactor Loop (`tdd-workflow`):**
  1. **RED:** The agent writes an automated test describing the desired behavior. It runs the test and verifies that it **fails**.
  2. **GREEN:** The agent writes the minimal code needed to make the test pass.
  3. **REFACTOR:** The agent cleans up the code, adds types, and refactors while ensuring tests remain green.
- **Human Role:** Watch the test suite turn green and give feedback on business logic.

---

### Phase 4: Adversarial Review & Security
- **Objective:** Have an independent, objective agent persona inspect the diff before anything is finalized.
- **Actions:**
  - Invoke `code-reviewer` agent to audit code quality, edge cases, error handling, and performance.
  - Invoke `security-reviewer` agent to check for sensitive data leakage, unvalidated inputs, SQLi, XSS, and authentication holes.
- **Human Role:** Review the findings and decide if any non-critical recommendations should be addressed now or deferred.

---

### Phase 5: Automated Verification & Gated Delivery
- **Objective:** Mechanically prove that the entire project builds and passes all checks.
- **Actions:**
  - Execute `verification-loop` skill: Typechecks, linter checks, test suite, and build artifacts.
  - UI Testing: Run `browser-qa` / Playwright to verify user journeys in a real browser.
- **🛑 Human Gate 2 (Commit Gate):** You inspect the git diff and approve the commit message. The agent creates a structured conventional commit (`feat(...)`, `test(...)`).

---

### Phase 6: Session Memory & Continuous Learning
- **Objective:** Make the AI smarter on your project over time.
- **Actions:**
  - Use `agent-self-evaluation` to score the delivered code on accuracy, completeness, and maintainability.
  - Log any non-obvious fixes or debugging insights in a growth log (`growth-log`).
  - Use `rules-distill` to automatically append any recurring project-specific rules to `AGENTS.md`.

---

## What We Do Next: Kicking Off Stampmyvisa

We are now ready for **Phase 1: Project Scaffolding & Requirements Intake**.
Tell me about Stampmyvisa:
1. What is the core vision and primary target user? (e.g., B2C travelers applying for visas, or B2B travel agents managing client visas?)
2. What are the key features for MVP v1? (e.g., document checklist, automated form filling, OCR extraction, status tracking, payment gateway?)
3. What is your preferred tech stack? (e.g., Next.js / TypeScript + Node.js / Python FastAPI + Supabase / PostgreSQL?)
