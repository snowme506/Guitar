const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = '/data/guitar/guitar.db';

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lesson_configs (
      lesson_id TEXT PRIMARY KEY,
      title TEXT,
      chord_diagram TEXT,
      sheet_image_data TEXT,
      target_count INTEGER DEFAULT 2,
      hidden INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      goals_json TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      star_reward INTEGER,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id TEXT UNIQUE,
      total_stars INTEGER DEFAULT 0,
      best_score INTEGER DEFAULT 0,
      stars_earned INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      last_played TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS global_progress (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_stars INTEGER DEFAULT 0,
      earned_badges_json TEXT DEFAULT '[]',
      outfits_json TEXT DEFAULT '[]',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 初始化全局进度表
  const global = db.prepare('SELECT * FROM global_progress WHERE id = 1').get();
  if (!global) {
    db.prepare('INSERT INTO global_progress (id, total_stars, earned_badges_json, outfits_json) VALUES (1, 0, ?, ?)').run('[]', '[]');
  }
}

module.exports = { getDb };
