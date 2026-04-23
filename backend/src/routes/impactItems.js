const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

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

router.post('/', authenticate, async (req, res) => {
  const { program, focus_area, financial_need, quantity_required, amount_required, quantity_fulfilled_pct, amount_fulfilled_pct, display_order, active } = req.body;
  if (!program) return res.status(400).json({ error: 'Program is required.' });
  if (!financial_need) return res.status(400).json({ error: 'Financial need description is required.' });
  try {
    const result = await query(
      `INSERT INTO donate_impact_items
        (program, focus_area, financial_need, quantity_required, amount_required, quantity_fulfilled_pct, amount_fulfilled_pct, display_order, active, amount, label)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        program,
        focus_area || null,
        financial_need,
        quantity_required || null,
        amount_required || null,
        parseInt(quantity_fulfilled_pct) || 0,
        parseInt(amount_fulfilled_pct) || 0,
        parseInt(display_order) || 0,
        active !== false && active !== 'false',
        amount_required || program,
        financial_need,
      ]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { program, focus_area, financial_need, quantity_required, amount_required, quantity_fulfilled_pct, amount_fulfilled_pct, display_order, active } = req.body;
  try {
    const existing = await query('SELECT * FROM donate_impact_items WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Not found.' });
    const row = existing.rows[0];

    const result = await query(
      `UPDATE donate_impact_items SET
        program = $1,
        focus_area = $2,
        financial_need = $3,
        quantity_required = $4,
        amount_required = $5,
        quantity_fulfilled_pct = $6,
        amount_fulfilled_pct = $7,
        display_order = $8,
        active = $9,
        amount = $10,
        label = $11,
        updated_at = NOW()
       WHERE id = $12 RETURNING *`,
      [
        program !== undefined ? program : row.program,
        focus_area !== undefined ? focus_area : row.focus_area,
        financial_need !== undefined ? financial_need : row.financial_need,
        quantity_required !== undefined ? quantity_required : row.quantity_required,
        amount_required !== undefined ? amount_required : row.amount_required,
        quantity_fulfilled_pct !== undefined ? parseInt(quantity_fulfilled_pct) : row.quantity_fulfilled_pct,
        amount_fulfilled_pct !== undefined ? parseInt(amount_fulfilled_pct) : row.amount_fulfilled_pct,
        display_order !== undefined ? parseInt(display_order) : row.display_order,
        active !== undefined ? (active !== false && active !== 'false') : row.active,
        amount_required !== undefined ? (amount_required || program || row.amount) : row.amount,
        financial_need !== undefined ? financial_need : row.label,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM donate_impact_items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
