# Audit Report 0000: Baseline State & Review Framework
**Project:** Stampmyvisa  
**Framework:** Everything Claude Code (ECC)  
**Lifecycle Phase:** Phase 1 / Phase 2 Baseline  
**Auditor Persona:** Principal Code Reviewer & Security Auditor (`code-reviewer`, `security-reviewer`, `gateguard`)  
**Date:** 2026-09-26  
**Status:** ESTABLISHED  

---

## 1. Executive Summary

As Principal Code Reviewer and Security Auditor for **Stampmyvisa**, this baseline audit inspects the current repository state, verifies working tree cleanliness, and locks down the mandatory security, TDD, and GateGuard invariants that will govern all subsequent code submissions.

---

## 2. Working Tree & Artifact Inventory

| Target Surface | Current Status | Finding | Action / Expectation |
| :--- | :--- | :--- | :--- |
| **Git Working Tree** | `master` branch at `a2fd4bd` | Untracked: `AGENTS.md`, `ECC_PROJECT_LIFECYCLE.md` | Clean slate; no application code diff present |
| **Active Plans** | `.agents/plans/` | Empty (0 files) | Awaiting approval of upcoming feature plan |
| **Active PRDs** | `.agents/prds/` | Empty (0 files) | Awaiting product requirements document |
| **ADR Registry** | `docs/adr/` | Initialized | Architectural decisions will be reviewed against security policies |
| **Review Registry** | `.agents/reviews/` | Initialized | All diff reviews will be persisted here |

---

## 3. Code Review Invariants (`code-reviewer` Persona)

All future code diffs will be scrutinized against the following non-negotiable invariants:

### A. Test-Driven Development (TDD First)
1. **Red-Green-Refactor Proof:** Every PR/diff introducing business logic, API routes, or data mutations MUST include automated unit and integration tests. Diffs lacking tests will receive an immediate `BLOCK`.
2. **Coverage Bar:** Minimum 80% line and branch coverage across all new units.
3. **Mandatory Negative Testing:** Tests must not only prove the happy path. They must explicitly verify edge cases:
   - Malformed / empty payloads
   - Boundary condition values (e.g. passport validity < 6 months, maximum applicant age)
   - Network failure and third-party OCR API timeouts
   - Unauthorized access attempts and invalid credentials

### B. Code Simplicity & Maintainability
1. **Function Size:** Functions exceeding 50 lines must be decomposed.
2. **Nesting Depth:** Maximum 4 levels of nesting; enforce early guard returns.
3. **Immutability:** Prefer immutable data patterns (spread operator, pure transformations) over in-place object mutations.
4. **Log Hygiene:** Zero debug `console.log` or print statements permitted in production diffs.

---

## 4. Security & Compliance Invariants (`security-reviewer` Persona)

Stampmyvisa processes high-sensitivity identity data, international travel documents, and financial records. The following security requirements are strictly enforced:

### A. Visa Document Security & PII Protection
1. **Zero Raw PII in Logs:** Passport numbers, national ID numbers, dates of birth, full residential addresses, and payment details must NEVER appear in application logs, error traces, or third-party monitoring payloads.
2. **Storage Isolation:** Uploaded visa documents must reside in dedicated private object storage buckets (e.g. S3 / Cloud Storage / Supabase Storage) with public read access disabled.
3. **Signed Ephemeral URLs:** Document access must be mediated through short-lived presigned URLs with an expiration TTL $\le 15\text{ minutes}$. No static public URLs.
4. **Encryption Standards:** Data at rest must use AES-256 / KMS envelope encryption. All data in transit must enforce TLS 1.3.

### B. File Upload Hardening
1. **Magic Byte Verification:** File validation must inspect binary magic bytes (e.g., `%PDF-`, `\xFF\xD8\xFF` for JPEG, `\x89PNG` for PNG), never relying solely on file extensions or client-sent `Content-Type` headers.
2. **File Size Bounds:** Strict ceiling per document type (default 10 MB max for scanned PDFs and identity photos).
3. **Malicious Content Prevention:** SVGs must be rejected or rigorously sanitized to prevent embedded JavaScript execution (XSS via SVG).

### C. Authentication, Authorization & Tenant Isolation
1. **Token Transport:** Session tokens and JWTs must be stored exclusively in `httpOnly`, `Secure`, `SameSite=Strict` cookies. Never in `localStorage` or `sessionStorage`.
2. **Object-Level Authorization (IDOR Prevention):** Every endpoint accessing an application or document (`/api/applications/:id/documents/:docId`) must verify that the requesting authenticated user owns the resource or has explicit delegated organization permissions.
3. **B2B vs. B2C Isolation:** Multi-tenant boundaries must be enforced at the database query layer (e.g., Row Level Security or mandatory `tenant_id` query scoping).

### D. API & Injection Defenses
1. **Strict Input Validation:** All API endpoints must parse and validate inputs using declarative schemas (Zod or Pydantic) before executing business logic.
2. **Parameterized Queries:** Zero raw string concatenation in SQL or ORM queries.
3. **Rate Limiting:** Public endpoints, authentication endpoints, and compute-heavy AI/OCR endpoints must enforce IP and account-level rate limits.

---

## 5. GateGuard Pre-Action Enforcement

To prevent hallucinated imports, phantom package dependencies, and schema drift:

1. **Pre-Action Verification:** Every modified or newly created module must have verified importers and confirmed package entries in `package.json` / dependency manifests.
2. **Schema Synchronization:** Database entities and API DTOs must align strictly with approved ADR schemas and database migration files before implementation code is accepted.
3. **No Dead or Orphaned Code:** Unused exports, dangling types, and speculative abstractions will be flagged for elimination.

---

## 6. Noise-Filtering & Confidence Threshold Policy

To maximize signal and minimize developer fatigue:
- **>80% Confidence Gate:** Only actionable defects with high confidence will be flagged.
- **Pre-Report Proof Requirement:** For every `HIGH` or `CRITICAL` finding, the auditor must provide:
  1. The exact file path and line number.
  2. The specific, reproducible failure scenario (input, state, and bad outcome).
  3. Proof that existing framework guards or types do not prevent the failure.
- **Stylistic Feedback:** Grouped and consolidated at `LOW` severity; purely subjective styling preferences will be omitted.
- **Valid Zero Findings:** If a diff is clean, robustly tested, and adheres to all invariants, the auditor will return `VERDICT: APPROVE` without manufacturing cosmetic findings.

---

## 7. Review Verdict Rubric

| Verdict | Condition | Action Required |
| :--- | :--- | :--- |
| **`APPROVE`** | Zero CRITICAL or HIGH issues; all TDD invariants and tests pass | Ready for Phase 5 verification and Gate 2 commit |
| **`WARNING`** | Non-blocking issues (MEDIUM / LOW); edge case suggestions | Implementer may address immediately or document in follow-up |
| **`BLOCK`** | CRITICAL security vulnerability, missing tests, or unhandled failure mode | Work is halted; changes must be rectified before proceeding |
