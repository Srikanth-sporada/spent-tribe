const express = require('express');
const supabase = require('../db');
const verifyToken = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Get monthly analytics (Top categories, Total spent)
router.get('/monthly', verifyToken, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { month } = req.query; // Format: YYYY-MM

    if (!month) {
        res.status(400);
        throw new Error('Month is required (YYYY-MM)');
    }

    const startDate = `${month}-01`;
    const nextMonthDate = new Date(startDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const endDate = nextMonthDate.toISOString().slice(0, 10);

    const { data: expenses, error } = await supabase
        .from('expenses')
        .select('amount, category, users(username)') // Fetch username
        // .eq('user_id', userId) // Centralized
        .gte('date', startDate)
        .lt('date', endDate);

    if (error) {
        throw new Error(error.message);
    }

    // Aggregate by Category
    const categoryTotals = expenses.reduce((acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = 0;
        acc[curr.category] += Number(curr.amount);
        return acc;
    }, {});

    const byCategory = Object.keys(categoryTotals)
        .map(cat => ({ category: cat, total: categoryTotals[cat] }))
        .sort((a, b) => b.total - a.total);

    // Aggregate by User
    const userTotals = expenses.reduce((acc, curr) => {
        const username = curr.users?.username || 'Unknown';
        if (!acc[username]) acc[username] = 0;
        acc[username] += Number(curr.amount);
        return acc;
    }, {});

    const byUser = Object.keys(userTotals)
        .map(u => ({ username: u, total: userTotals[u] }))
        .sort((a, b) => b.total - a.total);

    res.json({ byCategory, byUser }); // Return both breakdowns
}));

module.exports = router;
