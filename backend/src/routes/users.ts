import express, { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, avatar_url, created_at FROM users ORDER BY username'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID with stats
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userResult = await pool.query(
      'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const statsResult = await pool.query(
      'SELECT total_games, wins, losses FROM game_stats WHERE user_id = $1',
      [id]
    );

    const user = userResult.rows[0];
    const stats = statsResult.rows[0] || { total_games: 0, wins: 0, losses: 0 };

    res.json({
      ...user,
      stats
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user stats
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM game_stats WHERE user_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaderboard
router.get('/leaderboard/top', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit || 10;
    const result = await pool.query(`
      SELECT u.id, u.username, u.avatar_url, gs.total_games, gs.wins, gs.losses,
             ROUND((gs.wins::numeric / NULLIF(gs.total_games, 0) * 100)::numeric, 2) as win_rate
      FROM users u
      LEFT JOIN game_stats gs ON u.id = gs.user_id
      WHERE gs.total_games > 0
      ORDER BY gs.wins DESC, gs.total_games DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
