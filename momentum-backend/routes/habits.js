const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

module.exports = (pool) => {
  // Get all habits for user
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new habit
  router.post('/', authenticateToken, async (req, res) => {
    const { name, description, frequency, target_count, color, icon } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO habits (user_id, name, description, frequency, target_count, color, icon)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [req.user.id, name, description, frequency || 'daily', target_count || 1, color || '#3b82f6', icon]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update habit
  router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, description, frequency, target_count, color, icon } = req.body;
    try {
      const result = await pool.query(
        `UPDATE habits 
         SET name = $1, description = $2, frequency = $3, target_count = $4, 
             color = $5, icon = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 AND user_id = $8 RETURNING *`,
        [name, description, frequency, target_count, color, icon, id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Habit not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete habit
  router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Habit not found' });
      }
      res.json({ message: 'Habit deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Log habit completion
  router.post('/:id/complete', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { completed_date } = req.body;
    
    console.log('Complete habit request:', { habitId: id, userId: req.user.id }); // Debug log
    
    try {
      const result = await pool.query(
        `INSERT INTO completions (habit_id, user_id, completed_date)
         VALUES ($1, $2, $3) RETURNING *`,
        [id, req.user.id, completed_date || new Date().toISOString()]
      );
      
      console.log('Completion created:', result.rows[0]); // Debug log
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Complete habit error:', error); // Debug log
      res.status(500).json({ error: error.message });
    }
  });

  // Get habit logs for a date range
  router.get('/:id/logs', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    try {
      const result = await pool.query(
        `SELECT * FROM completions 
         WHERE habit_id = $1 AND user_id = $2 
         AND completed_at >= $3 AND completed_at <= $4
         ORDER BY completed_at DESC`,
        [id, req.user.id, start_date, end_date]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete habit log
  router.delete('/:habitId/log/:logId', authenticateToken, async (req, res) => {
    const { habitId, logId } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM completions WHERE id = $1 AND habit_id = $2 AND user_id = $3 RETURNING *',
        [logId, habitId, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Log not found' });
      }
      res.json({ message: 'Log deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get habit completions for a date range
  router.get('/:id/completions', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    
    console.log('Get completions request:', { habitId: id, userId: req.user.id, start_date, end_date }); // Debug log
    
    try {
      const result = await pool.query(
        `SELECT * FROM completions 
         WHERE habit_id = $1 AND user_id = $2 
         AND completed_date >= $3 AND completed_date <= $4
         ORDER BY completed_date DESC`,
        [id, req.user.id, start_date, end_date]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Get completions error:', error); // Debug log
      res.status(500).json({ error: error.message });
    }
  });

  // Delete habit completion
  router.delete('/:habitId/complete/:completionId', authenticateToken, async (req, res) => {
    const { habitId, completionId } = req.params;
    try {
      const result = await pool.query(
        'DELETE FROM completions WHERE id = $1 AND habit_id = $2 AND user_id = $3 RETURNING *',
        [completionId, habitId, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Completion not found' });
      }
      res.json({ message: 'Completion deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get habit streak
  router.get('/:id/streak', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    try {
      // Get all completions for this habit, ordered by date descending
      const result = await pool.query(
        `SELECT completed_date 
         FROM completions 
         WHERE habit_id = $1 AND user_id = $2 
         ORDER BY completed_date DESC`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.json({ current_streak: 0, longest_streak: 0 });
      }

      const completions = result.rows.map(row => new Date(row.completed_date));
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(today);
      
      for (let i = 0; i < completions.length; i++) {
        const completionDate = new Date(completions[i]);
        completionDate.setHours(0, 0, 0, 0);
        
        if (completionDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (completionDate.getTime() < checkDate.getTime()) {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;
      
      for (let i = 0; i < completions.length - 1; i++) {
        const current = new Date(completions[i]);
        const next = new Date(completions[i + 1]);
        current.setHours(0, 0, 0, 0);
        next.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      res.json({ 
        current_streak: currentStreak, 
        longest_streak: longestStreak 
      });
    } catch (error) {
      console.error('Get streak error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};