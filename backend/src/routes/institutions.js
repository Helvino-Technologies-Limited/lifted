const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { uploadImage, cloudinaryUpload } = require('../middleware/upload');

const router = express.Router();

// GET /api/institutions
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM pillar_institutions WHERE active = TRUE ORDER BY display_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/institutions (admin)
router.post('/', authenticate, uploadImage.single('photo'), cloudinaryUpload, async (req, res) => {
  const { name, description, category, location, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });
  try {
    const photoUrl = req.file ? req.file.path : null;
    const result = await query(
      `INSERT INTO pillar_institutions (name, description, photo_url, category, location, display_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, photoUrl, category, location, display_order || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/institutions/:id (admin)
router.put('/:id', authenticate, uploadImage.single('photo'), cloudinaryUpload, async (req, res) => {
  const { name, description, category, location, display_order, active } = req.body;
  try {
    const photoUrl = req.file ? req.file.path : undefined;
    const result = await query(
      `UPDATE pillar_institutions SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        photo_url = COALESCE($3, photo_url),
        category = COALESCE($4, category),
        location = COALESCE($5, location),
        display_order = COALESCE($6, display_order),
        active = COALESCE($7, active)
       WHERE id = $8 RETURNING *`,
      [name, description, photoUrl, category, location, display_order, active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/institutions/:id (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM pillar_institutions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
