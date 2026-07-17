# UI/UX Design Specification: Trip Budget Tracker App

This document outlines the UI/UX architecture and interface layout for a cross-platform (Mobile & Desktop) Trip Budget Management Application, designed to replace legacy spreadsheet-based tracking.

---

## 1. Core Core Taxonomy (Data Model from Sheets)
Based on historical travel data, the application will enforce a flexible but standardized set of expense categories grouped logically to simplify entry:

*   **Fixed / Pre-Trip Expenses:** Flight, Accomondation, Insurance, Visa fees (e.g., Visa Baku).
*   **Transit & Logistics:** Car rental, Petrol, Toll + parking, Uber / Bolt / Bus / Transportation, Parking TLV.
*   **Daily Living:** Restaurants, Groceries, Convenient stores.
*   **Connectivity & Media:** Mobile / Airalo / Communication.
*   **Leisure & Personal:** Attractions, Shopping, Cash, Misc.

---

## 2. Global UI Theme & Component Framework
The interface layout utilizes **Google Material Design / Stitch** framework principles, featuring clean surfaces, high-contrast structural typography, and distinct contextual states.

### Color Palette
*   **Background / Canvas:** `#F8F9FA` (Off-white / Light Grey)
*   **Primary Accent:** `#1A73E8` (Google Blue for primary buttons and selection highlights)
*   **Card Background:** `#FFFFFF` (Pure white with subtle shadows)
*   **Alert / Highlight States:**
    *   `#FFF8E1` / `#FEEFC3` (Soft yellow for core variable expense inputs - matching sheet history)
    *   `#E6F4EA` / `#CEEAD6` (Soft green for shopping/discretionary items)
    *   `#FCE8E6` / `#FAD2CF` (Soft red/pink for total budget overages or mismatch callouts)

---

## 3. UI Views & Wireframe Layouts

### View A: Dashboard & Trip Selector (Desktop / Mobile Main)
*   **Top Bar:** Application branding, user profile icon, and an explicit **"Create New Trip"** action button.
*   **Trip Grid / List:** Cards showing active and historical trips (e.g., "Baku Trip", "Georgia Tour", "Budapest Express"). 
    *   *Card Metadata:* Destination name, travel dates, total budget spent, and currency indicator.

### View B: Active Trip Expense Ledger (The Core Form View)
This view replaces the vertical layout from the Google Sheets with a dual-column interactive split pane (Desktop) or a sequential tabbed view (Mobile).

#### 1. Quick-Entry Form Panel (Left Pane / Mobile Sheet)
An optimized input form designed for on-the-go logging:
*   **Dropdown / Chip Selector:** Category selector utilizing recognizable icons (Airplane for Flight, Bed for Accommodation, Car for Rental).
*   **Amount Input Field:** Large numerical focus field with automatic currency converter toggle.
*   **Payment Method Toggle:** Dual state switch between **[Card / Digital Payment]** and **[Physical Cash]** to maintain historical consistency with the "Cash" tracker column.

#### 2. Summary & Calculations Matrix (Right Pane / Main Screen)
A live-updating matrix mimicking the structure of the source spreadsheets:
*   **Categorized Expense List:** Every item from the taxonomy behaves as a line item showing its aggregated sum. 
*   **Dynamic Visual Blocks:**
    *   **Variable/Logistics Rows:** Rendered with a desaturated yellow background accent (`#FFF8E1`) for quick scanning of transit/living costs.
    *   **Shopping Row:** Highlighted in soft green (`#E6F4EA`) to separate discretionary leisure spend from baseline travel overheads.
*   **Sticky Footer Matrix (Totals Bar):**
    *   A dual-box indicator locking to the bottom of the screen.
    *   **Box 1 (Left):** Base Overhead Total (Sum of flights, transit, and lodging).
    *   **Box 2 (Right):** Grand Total (Including shopping, dining, and cash leakage) with bold, high-visibility typography.

---

## 4. Automation & Advanced Features Integration
To streamline manual updates, the UI includes hook points for the following automation architectures:
1.  **CSV/XLSX Parser Dropzone:** A drag-and-drop region in the desktop view allowing the ingestion of standard credit card export tables (e.g., CAL statement spreadsheets), automatically sorting items based on regex description matching.
2.  **Notification Ingestion Log:** A dedicated side-drawer displaying transaction items parsed from incoming SMS/Email notification hooks, allowing the user to approve an item into the trip budget with a single tap.
