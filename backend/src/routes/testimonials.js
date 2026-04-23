const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { uploadImage, cloudinaryUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM testimonials WHERE active = TRUE ORDER BY display_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/all', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM testimonials ORDER BY display_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/', authenticate, uploadImage.single('photo'), cloudinaryUpload, async (req, res) => {
  const { name, role, quote, display_order, active } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });
  if (!quote) return res.status(400).json({ error: 'Quote is required.' });
  try {
    const photoUrl = req.file ? req.file.path : null;
    const result = await query(
      `INSERT INTO testimonials (name, role, quote, photo_url, display_order, active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name,
        role || null,
        quote,
        photoUrl,
        parseInt(display_order) || 0,
        active !== false && active !== 'false',
      ]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id', authenticate, uploadImage.single('photo'), cloudinaryUpload, async (req, res) => {
  const { name, role, quote, display_order, active } = req.body;
  try {
    const existing = await query('SELECT * FROM testimonials WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Not found.' });
    const row = existing.rows[0];

    const photoUrl = req.file ? req.file.path : row.photo_url;

    const result = await query(
      `UPDATE testimonials SET
        name = $1,
        role = $2,
        quote = $3,
        photo_url = $4,
        display_order = $5,
        active = $6
       WHERE id = $7 RETURNING *`,
      [
        name !== undefined ? name : row.name,
        role !== undefined ? role : row.role,
        quote !== undefined ? quote : row.quote,
        photoUrl,
        display_order !== undefined ? parseInt(display_order) : row.display_order,
        active !== undefined ? (active !== false && active !== 'false') : row.active,
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
    await query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
