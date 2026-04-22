const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { uploadImage, cloudinaryUpload } = require('../middleware/upload');

const router = express.Router();

// GET /api/children — public, optional ?active=true&sponsored=false
router.get('/', async (req, res) => {
  try {
    const conditions = [];
    const params = [];

    if (req.query.active !== undefined) {
      params.push(req.query.active === 'true');
      conditions.push(`active = $${params.length}`);
    }
    if (req.query.sponsored !== undefined) {
      params.push(req.query.sponsored === 'true');
      conditions.push(`sponsored = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT * FROM sponsored_children ${where} ORDER BY display_order ASC, id ASC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/children (admin)
router.post('/', authenticate, uploadImage.single('photo'), cloudinaryUpload, async (req, res) => {
  const { name, age, grade, story, sponsored, active, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required.' });
  try {
    const photoUrl = req.file ? req.file.path : null;
    const photoPublicId = req.file ? req.file.filename : null;
    const result = await query(
      `INSERT INTO sponsored_children (name, age, grade, story, photo_url, photo_public_id, sponsored, active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        name,
        age ? parseInt(age) : null,
        grade || null,
        story || null,
        photoUrl,
        photoPublicId,
        sponsored === 'true' || sponsored === true,
        active !== 'false' && active !== false,
        display_order ? parseInt(display_order) : 0,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/children/:id (admin)
router.put('/:id', authenticate, uploadImage.single('photo'), cloudinaryUpload, async (req, res) => {
  const { name, age, grade, story, sponsored, active, display_order } = req.body;
  try {
    const existing = await query('SELECT * FROM sponsored_children WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Not found.' });

    const photoUrl = req.file ? req.file.path : existing.rows[0].photo_url;
    const photoPublicId = req.file ? req.file.filename : existing.rows[0].photo_public_id;

    const result = await query(
      `UPDATE sponsored_children SET
        name = COALESCE($1, name),
        age = $2,
        grade = $3,
        story = $4,
        photo_url = $5,
        photo_public_id = $6,
        sponsored = $7,
        active = $8,
        display_order = COALESCE($9, display_order)
       WHERE id = $10 RETURNING *`,
      [
        name || existing.rows[0].name,
        age !== undefined ? (age ? parseInt(age) : null) : existing.rows[0].age,
        grade !== undefined ? grade : existing.rows[0].grade,
        story !== undefined ? story : existing.rows[0].story,
        photoUrl,
        photoPublicId,
        sponsored !== undefined ? (sponsored === 'true' || sponsored === true) : existing.rows[0].sponsored,
        active !== undefined ? (active !== 'false' && active !== false) : existing.rows[0].active,
        display_order ? parseInt(display_order) : existing.rows[0].display_order,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/children/:id (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM sponsored_children WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
