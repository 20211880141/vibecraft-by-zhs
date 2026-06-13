import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'chat.db');

let db;
try {
  db = new Database(DB_PATH);
} catch (err) {
  console.error('[DB] 无法打开数据库:', err.message);
  process.exit(1);
}

// 启用 WAL 模式提升并发性能
try {
  db.pragma('journal_mode = WAL');
} catch (err) {
  console.warn('[DB] WAL 模式设置失败，使用默认模式:', err.message);
}

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    channel TEXT DEFAULT 'general',
    target_user TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    edited INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// 索引优化
try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_username ON messages(username)');
} catch (err) {
  console.warn('[DB] 索引创建警告:', err.message);
}

// FTS5 全文搜索
try {
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
      content, username, channel,
      content= messages,
      content_rowid= id,
      tokenize='unicode61'
    )
  `);

  // 同步已存在的消息
  db.exec(`
    INSERT OR REPLACE INTO messages_fts(rowid, content, username, channel)
    SELECT id, content, username, channel FROM messages
  `);

  // 新增触发器
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
      INSERT INTO messages_fts(rowid, content, username, channel)
      VALUES (new.id, new.content, new.username, new.channel);
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
      INSERT INTO messages_fts(messages_fts, rowid, content, username, channel)
      VALUES ('delete', old.id, old.content, old.username, old.channel);
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
      INSERT INTO messages_fts(messages_fts, rowid, content, username, channel)
      VALUES ('delete', old.id, old.content, old.username, old.channel);
      INSERT INTO messages_fts(rowid, content, username, channel)
      VALUES (new.id, new.content, new.username, new.channel);
    END
  `);
} catch (err) {
  console.warn('[DB] FTS5 初始化警告:', err.message);
}

// 初始化默认频道
const insertChannel = db.prepare('INSERT OR IGNORE INTO channels (name) VALUES (?)');
insertChannel.run('general');
insertChannel.run('random');

// 确保 uploads 目录存在
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export default db;