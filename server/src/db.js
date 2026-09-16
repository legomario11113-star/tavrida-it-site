const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'submissions.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    ip TEXT
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO submissions (first_name, last_name, email, phone, message, ip)
  VALUES (@first_name, @last_name, @email, @phone, @message, @ip)
`);

function insertSubmission({ first_name, last_name, email, phone, message, ip }) {
  const info = insertStmt.run({
    first_name,
    last_name,
    email,
    phone: phone || '',
    message: message || '',
    ip: ip || ''
  });
  return info.lastInsertRowid;
}

module.exports = { db, insertSubmission };
