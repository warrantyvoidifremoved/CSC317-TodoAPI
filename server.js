// A simple Express.js backend for a Todo list API

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// ➡️ Serve any static assets from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// In-memory array to store todo items
let todos = [];
let nextId = 1;

// ➡️ Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ➡️ GET all todo items
app.get('/todos', (req, res) => {
    res.json(todos);
});

// GET a specific todo item by ID
app.get('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const todo = todos.find(item => item.id === id);
    if (todo) {
        res.json(todo);
    } else {
        // ➡️ 404 if not found
        res.status(404).json({ message: 'Todo item not found' });
    }
});

// POST a new todo item
app.post('/todos', (req, res) => {
    const { name, priority = 'low', isFun } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const newTodo = {
        id: nextId++,
        name,
        priority,
        isComplete: false,
        isFun
    };

    todos.push(newTodo);

    // ➡️ Log every incoming TODO item into 'todo.log'
    const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(newTodo)}\n`;
    fs.appendFile(path.join(__dirname, 'todo.log'), logEntry, err => {
        if (err) console.error('Failed to write to todo.log:', err);
    });

    res.status(201).json(newTodo);
});

// DELETE a todo item by ID
app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = todos.findIndex(item => item.id === id);

    if (index !== -1) {
        todos.splice(index, 1);
        res.json({ message: `Todo item ${id} deleted.` });
    } else {
        res.status(404).json({ message: 'Todo item not found' });
    }
});

// ➡️ Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});