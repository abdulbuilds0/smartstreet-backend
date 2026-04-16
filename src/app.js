require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const { bootstrapDatabase } = require('./db/bootstrap');

const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const vendorRequestRoutes = require('./routes/vendorrequest.routes');

const app = express();

app.use(cors({
  origin: '*',
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/vendor-requests', vendorRequestRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await bootstrapDatabase();
    app.listen(PORT, () => console.log(`SmartStreet API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start SmartStreet API:', err);
    process.exit(1);
  }
}

startServer();
