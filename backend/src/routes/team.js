const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { uploadImage, cloudinaryUpload } = require('../middleware/upload');

const router = express.Router();

// GET /api/team
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM team_members WHERE active = TRUE ORDER BY display_order ASC, id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/team (admin)
router.post('/', authenticate, uploadImage.single('photo'), cloudinaryUpload, async (req, res) => {
  const { name, title, bio, email, linkedin_url, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });
  try {
    const photoUrl = req.file ? req.file.path : null;
    const result = await query(
      `INSERT INTO team_members (name, title, bio, photo_url, email, linkedin_url, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, title, bio, photoUrl, email, linkedin_url, display_order || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/team/:id (admin)
router.put('/:id', authenticate, uploadImage.single('photo'), cloudinaryUpload, async (req, res) => {
  const { name, title, bio, email, linkedin_url, display_order, active } = req.body;
  try {
    let photoUrl;
    if (req.file) photoUrl = req.file.path;

    const existing = await query('SELECT * FROM team_members WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Not found.' });

    const result = await query(
      `UPDATE team_members SET
        name = COALESCE($1, name),
        title = COALESCE($2, title),
        bio = COALESCE($3, bio),
        photo_url = COALESCE($4, photo_url),
        email = COALESCE($5, email),
        linkedin_url = COALESCE($6, linkedin_url),
        display_order = COALESCE($7, display_order),
        active = COALESCE($8, active),
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [name, title, bio, photoUrl, email, linkedin_url, display_order, active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/team/:id (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
