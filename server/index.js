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

// CORS Configuration
const allowedOrigins = [
    'https://spent-tribe.onslate.in',
    'https://www.spent-tribe.onslate.in',
    'https://spent-tribe.vercel.app',
    'https://www.spent-tribe.vercel.app',
    'https://stb.development.catalystappsail.in',
    'https://localhost',
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log('Checking origin:', origin); // Debug log

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('Allowed: No origin');
            return callback(null, true);
        }

        // Check if origin is allowed or if it's localhost
        if (allowedOrigins.indexOf(origin) !== -1 || /^http:\/\/localhost:\d+$/.test(origin)) {
            console.log('Allowed:', origin);
            callback(null, true);
        } else {
            console.error('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Enable pre-flight for all routes
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
