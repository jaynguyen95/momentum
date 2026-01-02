// FILE: momentum-backend/server.js

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully:', res.rows[0].now);
  }
});

// Import routes
const initAuthRoutes = require('./routes/auth');
const habitsRouter = require('./routes/habits');
const categoriesRouter = require('./routes/categories');
const goalsRouter = require('./routes/goals');

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Momentum API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', initAuthRoutes(pool));
app.use('/api/habits', habitsRouter(pool));
app.use('/api/categories', categoriesRouter(pool));
app.use('/api/goals', goalsRouter(pool));

// Start server
app.listen(PORT, () => {
  console.log(`Momentum API running on http://localhost:${PORT}`);
});

module.exports = { app, pool };