const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

// Verify DB connection
db.verifyConnection();

dotenv.config();

const app = express();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Rental Expense Tracker API Running');
});

// Routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const analyticsRoutes = require('./routes/analytics');

const errorHandler = require('./middleware/errorMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
