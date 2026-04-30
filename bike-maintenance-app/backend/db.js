const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'bike_maintenance.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS bikes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    type TEXT DEFAULT 'road',
    strava_gear_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bike_id INTEGER NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    brand TEXT,
    installed_km REAL DEFAULT 0,
    install_date TEXT,
    replace_at_km REAL,
    service_at_km REAL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bike_id INTEGER NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
    name TEXT,
    distance_km REAL NOT NULL,
    date TEXT NOT NULL,
    moving_time_s INTEGER,
    elevation_m REAL,
    strava_activity_id TEXT
  );

  CREATE TABLE IF NOT EXISTS service_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    km_at_service REAL,
    type TEXT NOT NULL DEFAULT 'service',
    notes TEXT,
    cost REAL
  );
`);

module.exports = db;
