const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Register
router.post('/register', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('Username and password are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from('users')
        .insert([{ username, password_hash: hashedPassword }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400);
            throw new Error('Username already exists');
        }
        throw new Error(error.message);
    }

    res.status(201).json({ id: data.id, username: data.username });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('Username and password are required');
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

    if (error || !user) {
        res.status(401); // 401 for unauthorized/invalid creds
        throw new Error('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username } });
}));

module.exports = router;
