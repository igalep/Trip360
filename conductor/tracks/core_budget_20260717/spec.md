# Specification - Core Trip Budget Tracker

This document specifies the requirements, endpoints, database schema, and design patterns for the initial track.

## 1. Scope
The goal of this track is to build the end-to-end flow of the Trip Budget Tracker:
- Initialize the Turso DB database with tables for trips, categories, and expenses.
- Implement an Express API exposed via serverless function.
- Create a Dark-mode, Material-based React UI consisting of the Dashboard and Ledger.

## 2. API Endpoints
- `GET /api/trips` - Returns list of trips with aggregated total spent.
- `POST /api/trips` - Creates a new trip and seeds it with default categories (flight, accommodation, transportation, restaurants, shopping, misc).
- `GET /api/trips/:id` - Returns trip details, associated categories, and logged expenses.
- `POST /api/trips/:id/categories` - Adds a custom category to the trip.
- `POST /api/expenses` - Logs an expense (computes conversion rates if foreign amount is provided).
- `DELETE /api/expenses/:id` - Deletes a logged expense.

## 3. UI Design Specifications
- **Dashboard**: Card list with destination name, start/end dates, number of nights, total spent. Destination illustration as header. "Create Trip" button.
- **LedgerView**:
  - Desktop: Dual column split. Left pane: Add expense form (chip category selectors, amount fields, card/cash switch). Right pane: Category summary breakdown. Sticky footer with Base Overhead and Grand Total.
  - Mobile: Swipe/tab based screens.
  - Custom Category modal.
  - Always Dark theme midnight layout.
