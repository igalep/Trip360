# Backend Engineering Principles

## 1. Clean Code & SOLID

- **S.O.L.I.D. Principles**: Follow strictly (SRP, OCP, LSP, ISP, DIP).
- **Design Patterns**: Utilize patterns like **Strategy**, **Factory**, and **Observer** to manage complexity in services.
- **Meaningful Names**: Use descriptive names for variables, functions, and classes.
- **Functions**: Small, single-purpose. Prefer "Pure Functions" for core calculations.
- **DRY (Don't Repeat Yourself)**: Abstract common logic into services or utilities.

## 2. Efficient Implementation & Resource Management

- **SQL Optimization**: Use SARGable queries, avoid `SELECT *`, use batches for multiple operations.
- **Memory Management**: For large datasets, use **Generators** or **Streams**. Avoid long-lived references in intervals (like the 15s alert loop).
- **Asynchronous Patterns**: Use `async/await` properly. For high-concurrency loops, manage promise limits to avoid event loop lag.
- **Caching**: Implement local memoization for expensive, repetitive calculations (e.g., portfolio value history).

## 3. Defensive Programming & Resilience

- **Idempotency**: Implement logic that is safe to retry (e.g., check for existence before insert).
- **Boundary Validation**: Validate all incoming data at the API/Service boundary using strict schemas.
- **Fail-Fast**: Use circuit-breaker-like logic for external integrations (Yahoo, Gemini) to prevent resource exhaustion during outages.
- **Error Propagation**: Never swallow errors. Always propagate with meaningful context or wrap in custom error classes.

## 4. Testing Standards

- **Reproduction First**: For bugs, always create a failing test case before fixing.
- **Test Types**:
  - **Unit Tests**: For isolated logic in services/utils.
  - **Integration Tests**: For API routes and DB interactions.
- **Coverage**: Aim for high coverage of the modified logic.
- **Mocking**: Use mocks for external services (like Yahoo Finance) to keep tests deterministic.

## 4. Architecture Standards

- **Service Layer**: All business logic stays in `src/server/services`.
- **Route Layer**: Thin handlers in `src/server/routes`.
- **Database**: Use the unified `db` instance from `src/server/db.ts`.
