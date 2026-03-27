const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { cloudinary } = require('../middleware/upload');
const multer = require('multer');
const { Readable } = require('stream');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/');
    if (allowed) cb(null, true);
    else cb(new Error('Only PDF or image files are allowed.'));
  },
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

const streamUpload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });

// GET /api/newsletters (public)
router.get('/', async (req, res) => {
  const { published } = req.query;
  try {
    let sql = 'SELECT * FROM newsletters WHERE 1=1';
    const params = [];
    if (published !== undefined) {
      params.push(published === 'true');
      sql += ` AND published = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/newsletters (admin)
router.post('/', authenticate, upload, async (req, res) => {
  const { title, description, published } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  try {
    let fileUrl = null;
    let coverUrl = null;

    if (req.files?.pdf?.[0]) {
      const result = await streamUpload(req.files.pdf[0].buffer, {
        folder: 'lifted-to-lift/newsletters',
        resource_type: 'raw',
        public_id: `newsletter-${Date.now()}`,
      });
      fileUrl = result.secure_url;
    }

    if (req.files?.cover?.[0]) {
      const result = await streamUpload(req.files.cover[0].buffer, {
        folder: 'lifted-to-lift/newsletters/covers',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      coverUrl = result.secure_url;
    }

    const result = await query(
      `INSERT INTO newsletters (title, description, file_url, cover_image_url, published)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description || null, fileUrl, coverUrl, published === 'true']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/newsletters/:id (admin)
router.put('/:id', authenticate, upload, async (req, res) => {
  const { title, description, published } = req.body;
  try {
    let fileUrl = undefined;
    let coverUrl = undefined;

    if (req.files?.pdf?.[0]) {
      const result = await streamUpload(req.files.pdf[0].buffer, {
        folder: 'lifted-to-lift/newsletters',
        resource_type: 'raw',
        public_id: `newsletter-${Date.now()}`,
      });
      fileUrl = result.secure_url;
    }

    if (req.files?.cover?.[0]) {
      const result = await streamUpload(req.files.cover[0].buffer, {
        folder: 'lifted-to-lift/newsletters/covers',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      coverUrl = result.secure_url;
    }

    const result = await query(
      `UPDATE newsletters SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        file_url = COALESCE($3, file_url),
        cover_image_url = COALESCE($4, cover_image_url),
        published = COALESCE($5, published),
        updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [title, description,
       fileUrl,
       coverUrl,
       published !== undefined ? published === 'true' : undefined,
       req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/newsletters/:id (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM newsletters WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
