const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM todos WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: 'Todo item not found' });
        res.json(row);
    });
});

app.post('/todos', (req, res) => {
    const { name, priority = 'low', isFun = true } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const stmt = `INSERT INTO todos (name, priority, isFun) VALUES (?, ?, ?)`;
    db.run(stmt, [name, priority, isFun ? 1 : 0], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const newTodo = {
            id: this.lastID,
            name,
            priority,
            isComplete: 0,
            isFun: isFun ? 1 : 0
        };

        const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(newTodo)}\n`;
        fs.appendFile(path.join(__dirname, 'todo.log'), logEntry, err => {
            if (err) console.error('Failed to write to todo.log:', err);
        });

        res.status(201).json(newTodo);
    });
});

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM todos WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Todo item not found' });
        }

        res.json({ message: `Todo item ${id} deleted.` });
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});