const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { uploadImage, cloudinaryUpload } = require('../middleware/upload');

const router = express.Router();

// GET /api/events — public, optional ?published=true&upcoming=true
router.get('/', async (req, res) => {
  try {
    const conditions = [];
    const params = [];

    if (req.query.published !== undefined) {
      params.push(req.query.published === 'true');
      conditions.push(`published = $${params.length}`);
    }
    if (req.query.upcoming === 'true') {
      conditions.push(`event_date >= NOW()`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT * FROM events ${where} ORDER BY event_date ASC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/events (admin)
router.post('/', authenticate, uploadImage.single('image'), cloudinaryUpload, async (req, res) => {
  const { title, description, event_date, location, published } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  if (!event_date) return res.status(400).json({ error: 'Event date is required.' });
  try {
    const imageUrl = req.file ? req.file.path : null;
    const imagePublicId = req.file ? req.file.filename : null;
    const result = await query(
      `INSERT INTO events (title, description, event_date, location, image_url, image_public_id, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        title,
        description || null,
        event_date,
        location || null,
        imageUrl,
        imagePublicId,
        published !== 'false' && published !== false,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/events/:id (admin)
router.put('/:id', authenticate, uploadImage.single('image'), cloudinaryUpload, async (req, res) => {
  const { title, description, event_date, location, published } = req.body;
  try {
    const existing = await query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Not found.' });

    const imageUrl = req.file ? req.file.path : existing.rows[0].image_url;
    const imagePublicId = req.file ? req.file.filename : existing.rows[0].image_public_id;

    const result = await query(
      `UPDATE events SET
        title = $1,
        description = $2,
        event_date = $3,
        location = $4,
        image_url = $5,
        image_public_id = $6,
        published = $7
       WHERE id = $8 RETURNING *`,
      [
        title || existing.rows[0].title,
        description !== undefined ? description : existing.rows[0].description,
        event_date || existing.rows[0].event_date,
        location !== undefined ? location : existing.rows[0].location,
        imageUrl,
        imagePublicId,
        published !== undefined ? (published !== 'false' && published !== false) : existing.rows[0].published,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/events/:id (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
