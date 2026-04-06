const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/messages — public, called from contact form
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), email.trim(), subject?.trim() || null, message.trim()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/messages — admin only, list all messages
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/messages/unread-count — admin only
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*) AS count FROM contact_messages WHERE read = FALSE'
    );
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/messages/:id/read — admin only, toggle read status
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const result = await query(
      'UPDATE contact_messages SET read = NOT read WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/messages/:id — admin only
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
