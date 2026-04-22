const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/needs — public, optional ?active=true&urgent=true
router.get('/', async (req, res) => {
  try {
    const conditions = [];
    const params = [];

    if (req.query.active !== undefined) {
      params.push(req.query.active === 'true');
      conditions.push(`active = $${params.length}`);
    }
    if (req.query.urgent !== undefined) {
      params.push(req.query.urgent === 'true');
      conditions.push(`urgent = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT * FROM needs ${where} ORDER BY urgent DESC, display_order ASC, id ASC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/needs (admin)
router.post('/', authenticate, async (req, res) => {
  const { title, description, category, quantity_needed, quantity_fulfilled, urgent, active, display_order } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  try {
    const result = await query(
      `INSERT INTO needs (title, description, category, quantity_needed, quantity_fulfilled, urgent, active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title,
        description || null,
        category || null,
        quantity_needed ? parseInt(quantity_needed) : null,
        quantity_fulfilled ? parseInt(quantity_fulfilled) : 0,
        urgent === true || urgent === 'true',
        active !== false && active !== 'false',
        display_order ? parseInt(display_order) : 0,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/needs/:id (admin)
router.put('/:id', authenticate, async (req, res) => {
  const { title, description, category, quantity_needed, quantity_fulfilled, urgent, active, display_order } = req.body;
  try {
    const existing = await query('SELECT * FROM needs WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Not found.' });

    const result = await query(
      `UPDATE needs SET
        title = $1,
        description = $2,
        category = $3,
        quantity_needed = $4,
        quantity_fulfilled = $5,
        urgent = $6,
        active = $7,
        display_order = $8
       WHERE id = $9 RETURNING *`,
      [
        title || existing.rows[0].title,
        description !== undefined ? description : existing.rows[0].description,
        category !== undefined ? category : existing.rows[0].category,
        quantity_needed !== undefined ? (quantity_needed ? parseInt(quantity_needed) : null) : existing.rows[0].quantity_needed,
        quantity_fulfilled !== undefined ? parseInt(quantity_fulfilled) : existing.rows[0].quantity_fulfilled,
        urgent !== undefined ? (urgent === true || urgent === 'true') : existing.rows[0].urgent,
        active !== undefined ? (active !== false && active !== 'false') : existing.rows[0].active,
        display_order !== undefined ? parseInt(display_order) : existing.rows[0].display_order,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/needs/:id (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM needs WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
