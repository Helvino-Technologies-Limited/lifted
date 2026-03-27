require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const settingsRoutes = require('./routes/settings');
const mediaRoutes = require('./routes/media');
const teamRoutes = require('./routes/team');
const institutionsRoutes = require('./routes/institutions');
const newsRoutes = require('./routes/news');
const newslettersRoutes = require('./routes/newsletters');
const partnersRoutes = require('./routes/partners');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://liftedtolift.vercel.app',
  'https://liftedtolift.org',
  'https://www.liftedtolift.org',
  /\.vercel\.app$/,
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'LIFTED TO LIFT API' }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/newsletters', newslettersRoutes);
app.use('/api/partners', partnersRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 LIFTED TO LIFT API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
