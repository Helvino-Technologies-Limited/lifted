const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/impact-items — public
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM donate_impact_items WHERE active = TRUE ORDER BY display_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/impact-items/all — admin (includes inactive)
router.get('/all', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM donate_impact_items ORDER BY display_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/impact-items (admin)
router.post('/', authenticate, async (req, res) => {
  const { amount, label, display_order, active } = req.body;
  if (!amount || !label) return res.status(400).json({ error: 'Amount and label are required.' });
  try {
    const result = await query(
      `INSERT INTO donate_impact_items (amount, label, display_order, active)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        amount,
        label,
        display_order ? parseInt(display_order) : 0,
        active !== false && active !== 'false',
      ]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/impact-items/:id (admin)
router.put('/:id', authenticate, async (req, res) => {
  const { amount, label, display_order, active } = req.body;
  try {
    const existing = await query('SELECT * FROM donate_impact_items WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Not found.' });

    const result = await query(
      `UPDATE donate_impact_items SET
        amount = $1,
        label = $2,
        display_order = $3,
        active = $4,
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [
        amount !== undefined ? amount : existing.rows[0].amount,
        label !== undefined ? label : existing.rows[0].label,
        display_order !== undefined ? parseInt(display_order) : existing.rows[0].display_order,
        active !== undefined ? (active !== false && active !== 'false') : existing.rows[0].active,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/impact-items/:id (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM donate_impact_items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
