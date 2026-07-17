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
