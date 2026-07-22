# Release History

## [v0.0.101] - 2026-07-23

- Trip Management 360 Alignment: Refocused platform mission around 360° travel lifecycle (Phase 1: Budget Management).
- Turso Cloud Integration: Enforced remote Turso Cloud database connection exclusively with zero downtime schema auto-migrations.
- Country Search Support: Expanded location geocoding autocomplete to support searching by country (e.g., Montenegro) in addition to cities.
- Profile Dropdown Menu: Replaced immediate avatar logout with interactive profile dropdown showing user details and explicit logout.
- UI Version Indicators: Integrated version indicator footers in both AuthView and Main Dashboard.

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
