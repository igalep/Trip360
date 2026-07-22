# Release History

## [v0.0.1] - 2026-07-23

### Initial Release Highlights

#### 🔐 User Management & Security
- **Authentication System:** Complete user registration and login workflows.
- **Client-Side Pre-Hashing:** Passwords pre-hashed in-browser using Web Crypto API (SHA-256 + salt) prior to network transmission.
- **Server-Side Security:** Password hashing and verification using `bcryptjs`.
- **Session Tokens:** Secure 30-day session tokens managed via authorization headers and `requireAuth` Express middleware.

#### 💱 Multi-Currency Budgeting
- **Multi-Currency Support:** Support for tracking expenses across multiple currencies with real-time balance calculations.
- **Budget & Category Management:** Flexible expense categories and budget allocations.

#### 🧱 Refactored Modular Architecture
- **Modular Component Design:** Decoupled React 19 components, custom hooks, and Express loaders/controllers/repositories.
- **Unified Turso/libSQL Engine:** Parameterized queries, explicit column selection, and atomic batch executions.

#### 🧪 Testing & Quality Assurance
- **100% Test Coverage:** Full integration and unit test coverage for frontend (JSDOM) and backend services (Jest + Supertest running in-band with isolated SQLite test database).
