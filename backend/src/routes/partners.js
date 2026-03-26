const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM partners WHERE active = TRUE ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/', authenticate, uploadImage.single('logo'), async (req, res) => {
  const { name, website_url, type, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });
  try {
    const logoUrl = req.file ? req.file.path : null;
    const result = await query(
      `INSERT INTO partners (name, logo_url, website_url, type, display_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, logoUrl, website_url, type || 'partner', display_order || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id', authenticate, uploadImage.single('logo'), async (req, res) => {
  const { name, website_url, type, display_order, active } = req.body;
  try {
    const logoUrl = req.file ? req.file.path : undefined;
    const result = await query(
      `UPDATE partners SET
        name = COALESCE($1, name),
        logo_url = COALESCE($2, logo_url),
        website_url = COALESCE($3, website_url),
        type = COALESCE($4, type),
        display_order = COALESCE($5, display_order),
        active = COALESCE($6, active)
       WHERE id = $7 RETURNING *`,
      [name, logoUrl, website_url, type, display_order, active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM partners WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
