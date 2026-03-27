const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { uploadImage, cloudinaryUpload } = require('../middleware/upload');

const router = express.Router();

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /api/news
router.get('/', async (req, res) => {
  const { published, featured } = req.query;
  try {
    let sql = 'SELECT * FROM news WHERE 1=1';
    const params = [];
    if (published !== undefined) {
      params.push(published === 'true');
      sql += ` AND published = $${params.length}`;
    }
    if (featured === 'true') sql += ' AND featured = TRUE';
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/news/:slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await query('SELECT * FROM news WHERE slug = $1', [req.params.slug]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/news (admin)
router.post('/', authenticate, uploadImage.single('image'), cloudinaryUpload, async (req, res) => {
  const { title, excerpt, body, author, published, featured, video_url } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  try {
    const slug = slugify(title) + '-' + Date.now();
    const imageUrl = req.file ? req.file.path : null;
    const result = await query(
      `INSERT INTO news (title, slug, excerpt, body, image_url, video_url, author, published, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, slug, excerpt, body, imageUrl, video_url || null, author || 'LIFTED TO LIFT', published === 'true', featured === 'true']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/news/:id (admin)
router.put('/:id', authenticate, uploadImage.single('image'), cloudinaryUpload, async (req, res) => {
  const { title, excerpt, body, author, published, featured, video_url } = req.body;
  try {
    const imageUrl = req.file ? req.file.path : undefined;
    const result = await query(
      `UPDATE news SET
        title = COALESCE($1, title),
        excerpt = COALESCE($2, excerpt),
        body = COALESCE($3, body),
        image_url = COALESCE($4, image_url),
        video_url = COALESCE($5, video_url),
        author = COALESCE($6, author),
        published = COALESCE($7, published),
        featured = COALESCE($8, featured),
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [title, excerpt, body, imageUrl,
       video_url !== undefined ? (video_url || null) : undefined,
       author,
       published !== undefined ? published === 'true' : undefined,
       featured !== undefined ? featured === 'true' : undefined,
       req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/news/:id (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
