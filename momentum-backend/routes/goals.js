const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

module.exports = (pool) => {

  // Get daily goal
  router.get('/', authenticateToken, async (req, res) => {
    try {
      let result = await pool.query(
        'SELECT * FROM daily_goals WHERE user_id = $1',
        [req.user.id]
      );
      
      // If no goal exists, create default one
      if (result.rows.length === 0) {
        result = await pool.query(
          `INSERT INTO daily_goals (user_id, target_completions)
           VALUES ($1, 3) RETURNING *`,
          [req.user.id]
        );
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update daily goal
  router.put('/', authenticateToken, async (req, res) => {
    const { target_completions } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO daily_goals (user_id, target_completions)
         VALUES ($1, $2)
         ON CONFLICT (user_id) 
         DO UPDATE SET target_completions = $2, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [req.user.id, target_completions]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};