---
name: backend-senior-developer
description: Advanced backend developer workflow for fixing issues, refactoring, and implementing new features. Use when tasked with backend modifications to ensure clean code, SOLID principles, and full test coverage.
---

# Backend Senior Developer

This skill guides you through a robust software engineering lifecycle for backend tasks in the Portfolio Insights project.

## 🚀 Lifecycle Workflow

### 1. Research & Reproduce

- **Investigate**: Use `grep_search` and `read_file` to understand the affected code.
- **Empirical Proof**: If it's a bug, you **MUST** create a reproduction script or a failing test case before proceeding.
- **Context**: Check `references/principles.md` for architectural standards.

### 2. Design (Plan Mode)

- **Mandatory Planning**: Call `enter_plan_mode` for any non-trivial change.
- **Blueprint**: Your plan should detail:
  - Root cause (for bugs).
  - Proposed architectural changes.
  - Impact on existing services/routes.
  - SQL optimization strategy (if applicable).
  - Testing strategy.

### 3. Implementation (Execution)

- **Surgical Edits**: Use `replace` or `write_file` for targeted changes.
- **Clean Code**: Adhere to SOLID and Clean Code principles (see `references/principles.md`).
- **Performance**: Ensure efficient DB usage and resource handling.
- **Idiomatic**: Follow existing patterns in `src/server`.

### 4. Validation (Testing)

- **Automated Verification**: Every change is incomplete without tests.
- **Integration**: Run existing integration tests (`npm test test/integration/...`) to check for regressions.
- **Unit**: Add unit tests for new logic in `src/server/services`.
- **Finality**: Confirm behavioral correctness before considering the task done.

## 🧩 Advanced Implementation Patterns

When implementing complex backend tasks, prioritize:

1.  **Functional Purity:** Keep core business logic in "pure" functions that are easy to unit test without side effects.
2.  **The Strategy Pattern:** Use it for logic that varies by type (e.g., different asset types, notification channels).
3.  **Atomic Integrity:** Every operation involving 2+ DB writes MUST be wrapped in `db.batch`.
4.  **Schema-First Validation:** Always validate `req.body` and `req.params` against a strict schema (e.g., Zod) before any business logic executes.
5.  **Memory-Efficient Loops:** Use `for...of` with `await` for sequential database operations or `db.batch` for parallelizable ones; avoid `.map()` for async tasks that might overwhelm the connection pool.
6.  **Idempotency by Design:** Ensure that creating or updating resources doesn't result in duplicates or inconsistent states if a request is retried.

## 📚 Resources

- [references/principles.md](references/principles.md): Detailed software engineering and architecture standards.
