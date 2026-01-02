const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

module.exports = (pool) => {
    
  // Get all categories
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create category
  router.post('/', authenticateToken, async (req, res) => {
    const { name, color, icon } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO categories (user_id, name, color, icon)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, name, color || '#667eea', icon]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update category
  router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    try {
      const result = await pool.query(
        `UPDATE categories 
         SET name = COALESCE($1, name),
             color = COALESCE($2, color),
             icon = COALESCE($3, icon)
         WHERE id = $4 AND user_id = $5 RETURNING *`,
        [name, color, icon, id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete category
  router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};