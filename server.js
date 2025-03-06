require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Database Connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(bodyParser.json());

// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// User Registration
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        
        // Check if user already exists
        const [existingUsers] = await connection.promise().query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await connection.promise().query(
            'INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, firstName, lastName]
        );

        // Create initial account
        await connection.promise().query(
            'INSERT INTO accounts (user_id, account_type, balance) VALUES (?, ?, ?)',
            [result.insertId, 'checking', 0]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await connection.promise().query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Account Balance
app.get('/account/balance', authenticateToken, async (req, res) => {
    try {
        const [accounts] = await connection.promise().query(
            'SELECT * FROM accounts WHERE user_id = ?', 
            [req.user.id]
        );

        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Transfer Funds (Fixed Version)
app.post('/transfer', authenticateToken, async (req, res) => {
    const { fromAccountId, toAccountId, amount } = req.body;

    try {
        await connection.promise().beginTransaction();

        // Deduct from source account
        const [updateSource] = await connection.promise().query(
            'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?', 
            [amount, fromAccountId, amount]
        );

        if (updateSource.affectedRows === 0) {
            await connection.promise().rollback();
            return res.status(400).json({ message: 'Insufficient balance or invalid account' });
        }

        // Add to destination account
        await connection.promise().query(
            'UPDATE accounts SET balance = balance + ? WHERE id = ?', 
            [amount, toAccountId]
        );

        // Log transaction
        await connection.promise().query(
            'INSERT INTO transactions (from_account, to_account, amount, timestamp, type) VALUES (?, ?, ?, NOW(), ?)', 
            [fromAccountId, toAccountId, amount, 'transfer']
        );

        await connection.promise().commit();
        res.json({ message: 'Transfer successful' });
    } catch (error) {
        await connection.promise().rollback();
        res.status(500).json({ message: 'Transfer failed', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
