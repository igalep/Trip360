# Implementation Plan - Core Trip Budget Tracker

This document outlines the detailed tasks and phases to implement the Core Trip Budget Tracker.

## Phase 1: DB Schema & Backend Setup
- [ ] Task: Database Setup
    - [ ] Write schema.sql definition file
    - [ ] Setup src/server/db.ts connection to Turso DB/SQLite
- [ ] Task: Express Server Setup & Route Validation
    - [ ] Setup Jest testing config for backend
    - [ ] Write failing Jest tests for validation schemas (Zod)
    - [ ] Implement Express app src/server/server.ts and Zod validation middleware
    - [ ] Verify validation tests pass
- [ ] Task: Trips Route Implementation
    - [ ] Write failing Jest tests for GET /api/trips and POST /api/trips
    - [ ] Implement routes and repository queries for trips
    - [ ] Verify trips API tests pass
- [ ] Task: Expenses & Categories Route Implementation
    - [ ] Write failing Jest tests for GET /api/trips/:id, POST /api/expenses, and DELETE /api/expenses/:id
    - [ ] Implement routes and repository queries for expenses and categories
    - [ ] Verify expense API tests pass
- [ ] Task: Conductor - User Manual Verification 'Phase 1: DB Schema & Backend Setup' (Protocol in workflow.md)

## Phase 2: Core Frontend Views
- [ ] Task: Dashboard Component
    - [ ] Write failing Jest/React-testing-library tests for Dashboard
    - [ ] Implement src/components/Dashboard.tsx with trip cards, destination headers, and nights calculation
    - [ ] Verify Dashboard tests pass
- [ ] Task: Ledger Component Base & Quick Logging
    - [ ] Write failing Jest/React-testing-library tests for Ledger entry form
    - [ ] Implement src/components/LedgerView.tsx entry form (chips, amount converter, cash/card segmented toggle)
    - [ ] Verify Ledger entry form tests pass
- [ ] Task: Ledger Summary Matrix & Sticky Footer
    - [ ] Write failing Jest/React-testing-library tests for summary table & calculations
    - [ ] Implement src/components/LedgerView.tsx summary matrix (category lists, Base Overhead block, Grand Total block)
    - [ ] Verify summary table tests pass
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Core Frontend Views' (Protocol in workflow.md)

## Phase 3: Custom Sections & Aesthetics
- [ ] Task: Custom Sections Addition
    - [ ] Write failing Jest/React-testing-library tests for Custom Section modal
    - [ ] Implement category creation dialog and save custom category to DB
    - [ ] Verify custom section tests pass
- [ ] Task: Aesthetic Polish & Dark Theme
    - [ ] Implement dark-mode styling rules in src/index.css
    - [ ] Verify validation error outlines (red) and highlights (variable yellow, shopping green, overage red)
    - [ ] Review responsive viewports and Capacitor mobile-first CSS rules
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Custom Sections & Aesthetics' (Protocol in workflow.md)
