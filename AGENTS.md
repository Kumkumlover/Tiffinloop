# Stampmyvisa — Agent Operating Guidelines & ECC Lifecycle

You are operating inside the **Stampmyvisa** project using the **Everything Claude Code (ECC) Agent Operating System**.

## Core Operating Philosophy
- **Optimize the context window. Persist everything else in files on disk.**
- **No unverified leaps:** Move strictly through the 6-phase engineering lifecycle:
  `Plan -> Test -> Implement -> Review -> Verify -> Remember -> Improve`
- **Committable Staging Files:** Always read and write artifacts into dedicated staging directories:
  - Requirements & PRDs: `.agents/prds/*.prd.md`
  - Technical Implementation Plans: `.agents/plans/*.plan.md`
  - Architecture Decisions: `docs/adr/*.md`
- **Two Human Gates:**
  - **Gate 1 (Plan Alignment):** Stop and obtain user sign-off on the plan before implementing any code.
  - **Gate 2 (Commit Gate):** Stop and obtain user sign-off after verification and review before committing.

## Active Rules & Engineering Invariants
1. **Test-Driven Development (TDD First):**
   - For all features and bug fixes, write the failing test first (`RED`), implement minimum code to pass (`GREEN`), then refactor. Maintain >=80% test coverage.
2. **Confidence-Based Code Reviews:**
   - Review code diffs with the `code-reviewer` agent persona before finalizing. Address issues with >80% confidence; consolidate stylistic feedback.
3. **Verification Before Claiming Done:**
   - Execute test suites, linters, and typecheckers. Never state that a feature works without showing execution evidence.
4. **Interactive Step-by-Step Guidance:**
   - The user is using this methodology for the first time. Guide them through one phase at a time. Explain what phase we are in, what we are producing, and what decision is required from them.
