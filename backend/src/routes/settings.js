const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings — all settings (public)
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT key, value, label, category FROM site_settings ORDER BY category, key');
    const settings = {};
    for (const row of result.rows) {
      settings[row.key] = { value: row.value, label: row.label, category: row.category };
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/settings/flat — flat key-value (public, for easy use)
router.get('/flat', async (req, res) => {
  try {
    const result = await query('SELECT key, value FROM site_settings');
    const settings = {};
    for (const row of result.rows) settings[row.key] = row.value;
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/settings — update a setting (admin)
router.put('/', authenticate, async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'key is required.' });
  try {
    const result = await query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING *`,
      [key, value]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/settings/bulk — bulk update (admin)
router.put('/bulk', authenticate, async (req, res) => {
  const { settings } = req.body; // { key: value, ... }
  if (typeof settings !== 'object') {
    return res.status(400).json({ error: 'settings must be an object.' });
  }
  try {
    const promises = Object.entries(settings).map(([key, value]) =>
      query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      )
    );
    await Promise.all(promises);
    res.json({ message: 'Settings updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
