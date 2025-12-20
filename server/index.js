const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

// Verify DB connection
db.verifyConnection();

dotenv.config();

const app = express();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 5000;

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} Origin: ${req.headers.origin}`);
    next();
});

// Manual CORS implementation to ensure headers are ALWAYS sent
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, X-Requested-With, Accept");

    // Handle preflight requests directly
    if (req.method === 'OPTIONS') {
        console.log(`[CORS] Handling OPTIONS request for ${req.url}`);
        return res.sendStatus(200);
    }

    next();
});

// app.use(cors(corsOptions));
// app.options(/.*/, cors(corsOptions)); // Enable pre-flight for all routes
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
