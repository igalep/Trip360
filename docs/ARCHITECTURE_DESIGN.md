# BudgetControl - Architecture & System Design

This document details the architectural principles, component structure, data flows, database schemas, and security model of **BudgetControl** — a comprehensive **Trip Management 360** platform.

---

## 🗺️ 1. Product Lifecycle & Architectural Scope

BudgetControl is engineered as a 360-degree travel lifecycle system.

```mermaid
graph TD
    subgraph "Phase 1: Budget Management (Current)"
        B1[Multi-Currency Ledger]
        B2[Live Exchange Rates API]
        B3[Category Budget Matrix]
        B4[Secure Web Crypto Auth]
    end

    subgraph "Phase 2: Execution (Planned)"
        E1[Real-time Itinerary Companion]
        E2[Geofenced Expense Alerts]
        E3[Offline Mobile Storage]
    end

    subgraph "Phase 3: Planning (Planned)"
        P1[AI Itinerary Generator]
        P2[Flight & Hotel Booking Vault]
        P3[Smart Packing Checklist]
    end
```

---

## 🏗️ 2. High-Level Architecture Overview

BudgetControl follows a unified full-stack architecture designed for high performance, strict type safety, zero-dependency client state management, and mobile cross-platform readiness.

```mermaid
graph TD
    Client["React 19 Frontend (Vite, TailwindCSS)"]
    Capacitor["Capacitor Mobile Layer (iOS / Android)"]
    Express["Express.js Server (Node.js)"]
    Validation["Zod Schema Validation Middleware"]
    Auth["Auth Service (Bcrypt + 30-Day Session Tokens)"]
    DB["Turso / libSQL Database (SQLite Schema)"]
    Currencies["External Exchange Rates API"]

    Client <--> Capacitor
    Client <-->|REST API + Bearer / Session Token| Express
    Express --> Validation
    Validation --> Auth
    Express <--> DB
    Express <--> Currencies
```

---

## 🛡️ 3. Security & Authentication Architecture

BudgetControl uses a hybrid zero-knowledge client pre-hashing and server-side password storage pattern:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Client as React Client (Crypto)
    participant Server as Express Server
    participant DB as libSQL Database

    User->>Client: Input Email & Plaintext Password
    Client->>Client: Pre-hash password with Web Crypto SHA-256 using lowercased email salt
    Client->>Server: Send pre-hashed string over HTTPS
    Server->>Server: Validate payload with Zod schemas
    Server->>Server: Hash pre-hashed string with Bcrypt (Salt rounds = 10)
    Server->>DB: Store user record & issue 30-day Session Token
    Server->>Client: Return Session Token + User Profile
    Client->>Client: Persist token in localStorage
```

### Key Security Features
- **Client Pre-Hashing**: Web Crypto SHA-256 (`crypto.subtle.digest`) pre-hashes passwords using lowercased email as a unique salt before transmission.
- **Server Storage**: Server hashes incoming pre-hashed values with `bcryptjs` (salt factor 10).
- **Session Tokens**: 30-day cryptographically random session tokens stored in `sessions` table.
- **Type Safety**: Global Express Request augmentation (`req.userId`, `req.user`) enforced without type casting (`src/server/types/express.d.ts`).
- **Global Unauthorized Handler**: React `AuthProvider` listens for `budgetcontrol-unauthorized` window events to purge expired tokens automatically.

---

## 🗄️ 4. Database Schema Design (`schema.sql`)

The database uses Turso / libSQL (SQLite compatible) with automatic schema migration checks on startup.

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : "has many"
    USERS ||--o{ TRIPS : "owns"
    TRIPS ||--o{ CATEGORIES : "contains"
    TRIPS ||--o{ EXPENSES : "tracks"
    CATEGORIES ||--o{ EXPENSES : "groups"

    USERS {
        TEXT id PK
        TEXT email UK
        TEXT password_hash
        TEXT name
        TEXT created_at
    }

    SESSIONS {
        TEXT id PK
        TEXT user_id FK
        TEXT token UK
        TEXT expires_at
        TEXT created_at
    }

    TRIPS {
        TEXT id PK
        TEXT user_id FK
        TEXT name
        TEXT destination
        TEXT start_date
        TEXT end_date
        INTEGER nights
        TEXT base_currency
        REAL budget_limit
        TEXT image_url
        TEXT created_at
    }

    CATEGORIES {
        TEXT id PK
        TEXT trip_id FK
        TEXT name
        TEXT icon
        TEXT group_name
        INTEGER is_default
    }

    EXPENSES {
        TEXT id PK
        TEXT trip_id FK
        TEXT category_id FK
        TEXT date
        REAL amount
        TEXT currency
        REAL base_amount
        REAL exchange_rate
        TEXT notes
        TEXT payment_method
        TEXT created_at
    }
```

---

## 🧱 5. Component Structure & React Patterns

The frontend adheres to Phase-based Component Decomposition:

- **Global Context**: `src/context/AuthContext.tsx` wraps `App.tsx` and provides authentication state to the entire app.
- **Custom Hooks**:
  - `src/hooks/useAuth.ts`: Consumes `AuthContext` with Vite Fast Refresh compatibility.
  - `src/hooks/useCurrencyRate.ts`: Handles dynamic currency exchange rate calculations with request cancellation (`AbortController`).
  - `src/hooks/useLedger.ts`: Manages transaction lists, memoized financial totals, and category breakdowns.
- **Modular Ledger Components**:
  - `src/components/ledger/ExpenseEntryForm.tsx`: Handles multi-currency expense entry.
  - `src/components/ledger/TransactionList.tsx`: Renders filterable transaction items with live rate editing.
  - `src/components/ledger/LedgerSummaryTable.tsx`: Visualizes budget limits vs actual spending matrix.

---

## ⚡ 6. Performance Optimizations

1. **Auto Migration Loader**: `src/server/loaders/db.ts` executes unconditional `ALTER TABLE` checks on server boot to guarantee zero downtime schema transitions.
2. **Parameterized SQL & Batching**: All queries use `?` parameter placeholders. Multi-statement operations use `db.batch` for atomic execution.
3. **Vite Fast Refresh Isolation**: React components and custom hooks are strictly separated across file boundaries to enable instant HMR updates.
