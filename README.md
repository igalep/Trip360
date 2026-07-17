# BudgetControl - Personal Finance Manager

A high-performance personal financial manager built with React 19, Vite, Express, and Turso/SQLite (libSQL). It features a premium, responsive interface tailored for tracking travel budgets, category lists, custom metrics, and mobile integration.

## 🚀 Getting Started

Follow these steps to initialize the database and run the application locally.

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Install Dependencies
Run the following command in the project root to install the packages:
```bash
npm install
```

### 3. Initialize the Database
SeedTest data and create the SQLite database tables by running:
```bash
npm run db:init
```
This generates the local SQLite files and seeds initial defaults.

### 4. Run the Dev Server
Launch the backend server alongside Vite's Hot Module Replacement (HMR) for the frontend:
```bash
npm run server
```
Once started, the application will be available at:
* Frontend & Backend: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Core Commands

* **Launch Dev Environment**: `npm run server`
* **Production Build**: `npm run build` (compiles static frontend to `/dist`)
* **Production Boot**: `npm start` (runs the server in production mode)
* **Reinitialize Database**: `npm run db:init`
* **Sync Web App to Mobile Wrapper**: `npx cap sync` (updates Capacitor platform bundles)

---

## 🧪 Testing & Validation

To run all backend endpoint integration tests and frontend UI tests sequentially (using `--runInBand` to avoid SQLite concurrency locks):
```bash
./run-tests.sh
```
Or alternatively:
```bash
npm test
```
All test files are separated:
* **Backend Endpoint Tests**: `/tests/server/`
* **Frontend UI Tests**: `/tests/ui/`
