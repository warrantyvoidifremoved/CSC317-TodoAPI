const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'todos.db'), (err) => {
    if (err) console.error('Database opening error:', err);
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            priority TEXT DEFAULT 'low',
            isComplete INTEGER DEFAULT 0,
            isFun INTEGER DEFAULT 1
        )
    `);
});

module.exports = db;