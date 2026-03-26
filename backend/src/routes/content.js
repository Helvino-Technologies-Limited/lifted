const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/content/:page — get all content for a page
router.get('/:page', async (req, res) => {
  try {
    const result = await query(
      'SELECT section, field, content FROM page_content WHERE page = $1',
      [req.params.page]
    );
    // Transform into nested object: { section: { field: content } }
    const content = {};
    for (const row of result.rows) {
      if (!content[row.section]) content[row.section] = {};
      content[row.section][row.field] = row.content;
    }
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/content — get all content (admin)
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM page_content ORDER BY page, section, field');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/content — upsert content (admin)
router.put('/', authenticate, async (req, res) => {
  const { page, section, field, content } = req.body;
  if (!page || !section || !field) {
    return res.status(400).json({ error: 'page, section, and field are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO page_content (page, section, field, content, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (page, section, field)
       DO UPDATE SET content = $4, updated_at = NOW()
       RETURNING *`,
      [page, section, field, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/content/bulk — bulk update (admin)
router.put('/bulk', authenticate, async (req, res) => {
  const { updates } = req.body; // array of { page, section, field, content }
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'updates must be an array.' });
  }
  try {
    const promises = updates.map(({ page, section, field, content }) =>
      query(
        `INSERT INTO page_content (page, section, field, content, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (page, section, field)
         DO UPDATE SET content = $4, updated_at = NOW()`,
        [page, section, field, content]
      )
    );
    await Promise.all(promises);
    res.json({ message: 'Content updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
