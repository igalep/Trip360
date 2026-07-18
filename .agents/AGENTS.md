# BudgetControl - Engineering Context

This document defines the architecture, standards, and mandates for the BudgetControl project.

## 🚀 Project Overview

High-performance, full-stack personal financial management with a minimalist UI and unified Turso/libSQL architecture.

- **Core Goal:** Real-time personal finance tracking across Web & Android.
- **Key Tech:** React 19, Node.js (Express), Turso (libSQL), Zod, Gemini AI, Capacitor (Mobile).

## ⚙️ Key Commands

- **Dev:** npm run dev (Backend + Vite HMR).
- **Build:** npm run build (Frontend compile to /dist).
- **Production:** npm start (Run production server).
- **Database:** npm run db:init (Initialize schema.sql).
- **Test:** npm test (Run Jest integration and validation tests sequentially).
- **Sync:** npx cap sync (Web to Mobile).

## 📜 Core Mandates

1.  **Intent Verification:** Do not implement any changes without a clear, explicit request from the user.
2.  **Branch Isolation:** NEVER implement or modify code directly on the `main` branch. All work must be performed on a dedicated feature branch.
3.  **Explicit Approval & Test-First Commits:** Never commit any changes by yourself. Before committing, you must run all tests, present the results to the user, and explicitly ask the user for permission to commit.
4.  **Type Integrity:** Strict TypeScript only. NEVER use any casting on Request or Session. Use global augmentations in src/server/types/express.d.ts for req.userId.
5.  **Security First:** Passwords hashed with SHA-256 + salt in-browser, then bcrypt on-server. All protected routes MUST use requireAuth middleware.
6.  **UI Verification:** Every interactive element MUST have a unique data-testid (e.g., data-testid="submit-transaction").
7.  **Mobile UX:** Respect semantic colors (bg-app, text-main). Support Haptics and Pull-to-Refresh.
8.  **Task Scope:** Do only what is asked. Ask for confirmation before performing "just-in-case" improvements.

## 🏗️ Technical Standards

### 🗄 SQL & Database

- **Parameterization:** Always use ? placeholders. No template literals in queries.
- **Explicit Selection:** SELECT column1, column2 - NEVER SELECT \*.
- **Atomicity:** Use db.batch for multi-statement operations to reduce latency and ensure integrity.
- **SARGable:** Write queries that utilize indexes (e.g., avoid functions on WHERE columns).

### 🛡 Validation & Error Handling

- **Zod-First:** All body, query, and params MUST be validated via validateRequest middleware using schemas in src/server/schemas/.
- **Global Catch:** Use asyncHandler for routes. Standardized errors are handled by central Express middleware.

### 🏗️ Backend Organization

- **Loaders:** Keep server.ts lean. Delegate init logic (Express, DB, Jobs) to src/server/loaders/.
- **Separation of Concerns:**
  - **Repository Layer:** Raw SQL and data access.
  - **Service Layer:** Business logic and external API orchestration.
  - **Controller/Route Layer:** Request parsing and response mapping.

### 🧪 Testing & Quality Assurance

- **Test Location:** All tests must reside in the `/tests` directory at the project root:
  - **Backend Server Tests:** Located under `/tests/server/`. Test files should end with `.test.ts`.
  - **Frontend UI Tests:** Located under `/tests/ui/`. Test files should end with `.test.tsx` (using JSDOM environment).
- **Test Database Isolation:** Tests must use a separate SQLite test database file (configured via environment variable `TURSO_DATABASE_URL=file:test.db`).
- **Sequential Execution:** Tests interacting with the database must run sequentially (using `--runInBand` flag) to prevent SQLite concurrency lock issues.

