const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');
const { uploadMedia, cloudinary } = require('../middleware/upload');

const router = express.Router();

// GET /api/media — list all media
router.get('/', async (req, res) => {
  const { type, category, page, featured } = req.query;
  try {
    let sql = 'SELECT * FROM media WHERE 1=1';
    const params = [];
    if (type) { params.push(type); sql += ` AND type = $${params.length}`; }
    if (category) { params.push(category); sql += ` AND category = $${params.length}`; }
    if (page) { params.push(page); sql += ` AND page = $${params.length}`; }
    if (featured === 'true') { sql += ` AND featured = TRUE`; }
    sql += ' ORDER BY display_order ASC, uploaded_at DESC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/media/upload — upload media (admin)
router.post('/upload', authenticate, uploadMedia.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const { alt_text, caption, category, page: pageName, display_order } = req.body;
  const isVideo = req.file.mimetype.startsWith('video/');

  try {
    const result = await query(
      `INSERT INTO media (filename, url, public_id, thumbnail_url, type, alt_text, caption, category, page, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.file.originalname,
        req.file.path,
        req.file.filename,
        isVideo ? req.file.path.replace('/upload/', '/upload/f_jpg,so_0/') : req.file.path,
        isVideo ? 'video' : 'image',
        alt_text || '',
        caption || '',
        category || 'general',
        pageName || null,
        display_order ? parseInt(display_order) : 0,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/media/:id — update media metadata (admin)
router.put('/:id', authenticate, async (req, res) => {
  const { alt_text, caption, category, page: pageName, display_order, featured } = req.body;
  try {
    const result = await query(
      `UPDATE media SET alt_text=$1, caption=$2, category=$3, page=$4, display_order=$5, featured=$6
       WHERE id=$7 RETURNING *`,
      [alt_text, caption, category, pageName, display_order, featured, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/media/:id — delete media (admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM media WHERE id = $1', [req.params.id]);
    const media = result.rows[0];
    if (!media) return res.status(404).json({ error: 'Not found.' });

    // Delete from Cloudinary
    if (media.public_id) {
      try {
        await cloudinary.uploader.destroy(media.public_id, {
          resource_type: media.type === 'video' ? 'video' : 'image',
        });
      } catch (e) {
        console.warn('Cloudinary delete warning:', e.message);
      }
    }

    await query('DELETE FROM media WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
