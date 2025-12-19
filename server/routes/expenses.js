const express = require('express');
const supabase = require('../db');
const verifyToken = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Get all expenses for a user (optional filter by month)
router.get('/', verifyToken, asyncHandler(async (req, res) => {
    // const userId = req.user.id; // Removed user filter for centralized view
    const { month } = req.query; // Format: YYYY-MM

    let query = supabase
        .from('expenses')
        .select('*, users(username)') // Join to get username
        // .eq('user_id', userId) // Commented out to show ALL expenses
        .order('date', { ascending: false });

    // Supabase JS doesn't have strftime. We can filter by date range.
    if (month) {
        const startDate = `${month}-01`;
        // Calculate end of month roughly or use next month starts
        const nextMonthDate = new Date(startDate);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        const endDate = nextMonthDate.toISOString().slice(0, 10);

        query = query.gte('date', startDate).lt('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(error.message);
    }
    res.json(data);
}));

// Add new expense
router.post('/', verifyToken, asyncHandler(async (req, res) => {
    const { amount, description, category, date } = req.body;
    const userId = req.user.id;

    if (!amount || !category || !date) {
        res.status(400);
        throw new Error('Amount, category, and date are required');
    }

    const { data, error } = await supabase
        .from('expenses')
        .insert([{ user_id: userId, amount, description, category, date }])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    res.status(201).json(data);
}));

// Delete expense
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('user_id', userId)
        .select(); // needed to know if something was deleted

    if (error) {
        throw new Error(error.message);
    }

    // Supabase returns the deleted rows in data. Check if empty.
    if (!data || data.length === 0) {
        res.status(404);
        throw new Error('Expense not found or unauthorized');
    }

    res.json({ message: 'Expense deleted' });
}));

module.exports = router;
