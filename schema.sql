-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  end_date TEXT NOT NULL,   -- YYYY-MM-DD
  nights INTEGER NOT NULL,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  budget_limit REAL NOT NULL DEFAULT 1000.0,
  image_url TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
