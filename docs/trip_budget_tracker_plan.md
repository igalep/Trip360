# Implementation Plan - Trip Budget Tracker App (with Turso DB & Vercel)

This design document describes the full-stack architecture, database schema, API routing, and frontend implementation for the Trip Budget Tracker App.

## Goal Description
Build a responsive, premium web application for managing travel budgets. The app consists of:
1. **Express Backend (`src/server`)**: Connects to Turso/libSQL database using `@libsql/client`.
2. **Vercel Serverless Integration**: Backend is exposed via Vercel serverless function endpoint `/api/*`.
3. **Database Schema**: Structured table definitions for `trips`, `categories` (default and user-added custom ones), and `expenses`.
4. **Dashboard View**: Grid list of trips showing destination photo cards, metadata (name, destination, dates, nights), and a "Create New Trip" modal.
5. **Ledger View**: A split panel (desktop) or tabbed interface (mobile) enabling quick logging (with card/cash toggle and currency converter) and an automated totals bar (Base Overhead vs Grand Total).

---

## Technical Architecture & Database Schema

### Turso DB SQLite Schema
We will create a `schema.sql` file in the root containing:

```sql
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  end_date TEXT NOT NULL,   -- YYYY-MM-DD
  nights INTEGER NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  budget_limit REAL NOT NULL DEFAULT 1000.0,
  image_url TEXT
);

-- Categories Table (default + custom sections)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL, -- identifier, e.g., 'flight', 'accommodation'
  group_name TEXT NOT NULL, -- 'fixed' | 'transit' | 'living' | 'connectivity' | 'leisure' | 'custom'
  is_default INTEGER NOT NULL DEFAULT 0, -- 1 = default, 0 = user custom
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  amount REAL NOT NULL, -- base currency value
  original_amount REAL NOT NULL, -- inputted amount
  original_currency TEXT NOT NULL,
  conversion_rate REAL NOT NULL DEFAULT 1.0,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('card', 'cash')),
  description TEXT,
  date TEXT NOT NULL, -- YYYY-MM-DD
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

---

## Proposed Changes

### Database Setup
#### [NEW] `schema.sql`
Defines the structure for Turso DB/SQLite.

#### [NEW] `src/server/db.ts`
Initializes the libSQL client using:
```typescript
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({ url, authToken });
```

---

### Backend Components (`src/server`)
We will create a structured Express app conforming to `AGENTS.md` rules.

#### [NEW] `src/server/server.ts`
Main entry point for Express:
- Exports the `app` instance (so it can be used on Vercel as a wildcard api handler).
- Registers middleware (JSON parser, CORS).
- Mounts `/api/trips` and `/api/expenses` routes.

#### [NEW] `src/server/schemas/trip.schema.ts` & `expense.schema.ts`
Zod validation schemas for all payload validation.

#### [NEW] `src/server/routes/trips.routes.ts`
Endpoints for:
- `GET /api/trips` - Retrieve all trips + sum of expenses.
- `POST /api/trips` - Create a trip. Automatically inserts default categories: Flight, Accommodation, Transportation, Restaurants, Shopping, Misc.
- `GET /api/trips/:id` - Retrieve full trip details including categories and expenses.
- `POST /api/trips/:id/categories` - Create a custom category for the trip.

#### [NEW] `src/server/routes/expenses.routes.ts`
Endpoints for:
- `POST /api/expenses` - Create expense.
- `DELETE /api/expenses/:id` - Delete expense.

---

### Frontend Components (`src`)

#### [NEW] `src/components/Icons.tsx`
Inline SVG icons for:
- Default categories (flight, accommodation, transportation, restaurants, shopping, misc)
- Navigation and general utilities.

#### [NEW] `src/components/Dashboard.tsx`
Landing page trip grid view:
- Destination cards with trip name, destination, dates, nights, and total spent.
- Modal dialog for adding trips. Uses automatic night calculations.

#### [NEW] `src/components/LedgerView.tsx`
Active trip view:
- Form Panel (Left Pane / Mobile screen) for category chips, original/base amount inputs, cash/card toggle, metadata.
- Summary Pane (Right Pane / Main Screen) listing category sums, Base Overhead calculation, and Grand Total. Highlighted groups with soft colors.
- Custom Section Modal: allows users to append a new category by name and icon.

#### [MODIFY] `src/App.tsx`
Integrates router / toggle between views, dark/light mode toggle, and responsive canvas sizing.

#### [MODIFY] `src/index.css`
Aesthetics upgrade:
- Material Stitch color tokens (`#F8F9FA`, `#1A73E8`, `#FFFFFF`).
- Variable costs accent: `#FFF8E1` (light) / `#2a2416` (dark).
- Shopping accent: `#E6F4EA` (light) / `#162a1c` (dark).
- Over-budget warning: `#FCE8E6` (light) / `#3b1d1d` (dark).

---

### Configuration Files
#### [NEW] `vercel.json`
Reroutes API requests on production:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}
```

#### [NEW] `api/index.ts`
Exposes the Express backend on Vercel:
```typescript
import app from '../src/server/server';
export default app;
```

#### [MODIFY] `vite.config.ts`
Configures Vite local server to proxy `/api` calls to local Express server running on port `3001`.

---

## Verification Plan

### Automated Tests
Run TypeScript compilation and lint checks:
```bash
npm run build
npm run lint
```

### Manual Verification
1. **Backend Local Run**: Boot the Express backend and initialize local `dev.db`.
2. **Create Trip**: Add a trip. Verify default categories are generated in the database.
3. **Add Expense**: Log an expense (e.g. Flight 400). Verify Base Overhead calculations.
4. **Custom Section**: Add a custom category "Gifts". Ensure it appears in the logging dropdown and matrix.
5. **Limit Alert**: Add expenses exceeding the budget. Check color shift to red.
6. **Mobile check**: Ensure layout switches to tabbed structure on thin viewports.
