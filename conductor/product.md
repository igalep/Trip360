# Initial Concept
I would like to build a budget manager for my trips. The landing page will have a list of trips with metadata: Name, destination, dates, and number of nights. Each trip card/container will show a destination picture. Clicking a trip opens a ledger screen with default sections (flight, accommodation, transportation, restaurants, shopping, misc). The user can add custom sections to a trip.

# Product Definition
## Vision & Core Value
A clean, high-performance web application designed for travelers to manage trip budgets dynamically. It replaces traditional spreadsheets with a mobile-friendly, reactive ledger that updates in real-time.

## Key Features
1. **Trip Lifecycle Dashboard**: Displays active and historical trips with destination cards (utilizing high-quality destination illustrations), travel dates, and calculated nights.
2. **Dynamic Ledger**: Multi-pane (Desktop) or tabbed (Mobile) view featuring:
   - Quick expense logging (amount, description, cash/card, date, currency converter).
   - Core sections (flight, accommodation, transport, restaurants, shopping, misc) and user-defined custom sections.
3. **Calculations Matrix**: Aggregates expenses by category and displays:
   - Base Overhead Total (Flight + Accommodation + Transport).
   - Grand Total (All sections).
   - Overage warnings when the trip limit is exceeded.
4. **Cross-Platform Sync**: Persistent database sync using Turso DB / libSQL.

## UI/UX Principles
- **Theme**: Google Material Design / Stitch framework. High contrast typography, clean surfaces, and responsive layout.
- **Color Aesthetics**: Light grey background (#F8F9FA), primary blue accent (#1A73E8), and soft highlights (#FFF8E1 for variable costs, #E6F4EA for shopping, and #FCE8E6 for over-limit warnings).
- **Responsiveness**: Double-column split screen on desktop, and clean tabbed screen on mobile devices.
