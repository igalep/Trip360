# Implementation Plan - Core Trip Budget Tracker

This document outlines the detailed tasks and phases to implement the Core Trip Budget Tracker.

## Phase 1: DB Schema & Backend Setup [checkpoint: be85c50]
- [x] Task: Database Setup [07cfcbc]
    - [ ] Write schema.sql definition file
    - [ ] Setup src/server/db.ts connection to Turso DB/SQLite
- [x] Task: Express Server Setup & Route Validation [bfecba5]
    - [ ] Setup Jest testing config for backend
    - [ ] Write failing Jest tests for validation schemas (Zod)
    - [ ] Implement Express app src/server/server.ts and Zod validation middleware
    - [ ] Verify validation tests pass
- [x] Task: Trips Route Implementation [be557a1]
    - [ ] Write failing Jest tests for GET /api/trips and POST /api/trips
    - [ ] Implement routes and repository queries for trips
    - [ ] Verify trips API tests pass
- [x] Task: Expenses & Categories Route Implementation [a0a210a]
    - [ ] Write failing Jest tests for GET /api/trips/:id, POST /api/expenses, and DELETE /api/expenses/:id
    - [ ] Implement routes and repository queries for expenses and categories
    - [ ] Verify expense API tests pass
- [x] Task: Conductor - User Manual Verification 'Phase 1: DB Schema & Backend Setup' (Protocol in workflow.md) [be85c50]

## Phase 2: Core Frontend Views
- [x] Task: Dashboard Component [7b9194a]
    - [x] Write failing Jest/React-testing-library tests for Dashboard
    - [x] Implement src/components/Dashboard.tsx with trip cards, destination headers, and nights calculation
    - [x] Verify Dashboard tests pass
- [x] Task: Ledger Component Base & Quick Logging [42b320d]
    - [x] Write failing Jest/React-testing-library tests for Ledger entry form
    - [x] Implement src/components/LedgerView.tsx entry form (chips, amount converter, cash/card segmented toggle)
    - [x] Verify Ledger entry form tests pass
- [x] Task: Ledger Summary Matrix & Sticky Footer [42b320d]
    - [x] Write failing Jest/React-testing-library tests for summary table & calculations
    - [x] Implement src/components/LedgerView.tsx summary matrix (category lists, Base Overhead block, Grand Total block)
    - [x] Verify summary table tests pass
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Core Frontend Views' (Protocol in workflow.md)

## Phase 3: Custom Sections & Aesthetics
- [x] Task: Custom Sections Addition [9eaa59f]
    - [x] Write failing Jest/React-testing-library tests for Custom Section modal
    - [x] Implement category creation dialog and save custom category to DB
    - [x] Verify custom section tests pass
- [ ] Task: Aesthetic Polish & Dark Theme
    - [ ] Implement dark-mode styling rules in src/index.css
    - [ ] Verify validation error outlines (red) and highlights (variable yellow, shopping green, overage red)
    - [ ] Review responsive viewports and Capacitor mobile-first CSS rules
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Custom Sections & Aesthetics' (Protocol in workflow.md)
