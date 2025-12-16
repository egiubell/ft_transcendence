import express, { Router, Request, Response } from 'express';
import pool from '../db/connection';

const router = Router();

// Get all games
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT g.id, g.player1_id, g.player2_id, g.winner_id, 
             g.player1_score, g.player2_score, g.status,
             u1.username as player1_username, u2.username as player2_username,
             g.started_at, g.ended_at, g.created_at
      FROM games g
      JOIN users u1 ON g.player1_id = u1.id
      JOIN users u2 ON g.player2_id = u2.id
      ORDER BY g.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new game
router.post('/', async (req: Request, res: Response) => {
  try {
    const { player1_id, player2_id } = req.body;

    if (!player1_id || !player2_id) {
      return res.status(400).json({ error: 'player1_id and player2_id are required' });
    }

    if (player1_id === player2_id) {
      return res.status(400).json({ error: 'Players must be different' });
    }

    const result = await pool.query(
      'INSERT INTO games (player1_id, player2_id, status) VALUES ($1, $2, $3) RETURNING *',
      [player1_id, player2_id, 'pending']
    );

    res.status(201).json({
      message: 'Game created',
      game: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get game by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update game result
router.put('/:id/finish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { winner_id, player1_score, player2_score } = req.body;

    if (!winner_id || player1_score === undefined || player2_score === undefined) {
      return res.status(400).json({ error: 'winner_id, player1_score, and player2_score are required' });
    }

    const result = await pool.query(
      'UPDATE games SET winner_id = $1, player1_score = $2, player2_score = $3, status = $4, ended_at = NOW() WHERE id = $5 RETURNING *',
      [winner_id, player1_score, player2_score, 'finished', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Update stats
    const game = result.rows[0];
    await pool.query(`
      UPDATE game_stats 
      SET total_games = total_games + 1, 
          wins = CASE WHEN $1 = $2 THEN wins + 1 ELSE wins END,
          losses = CASE WHEN $1 != $2 THEN losses + 1 ELSE losses END
      WHERE user_id IN ($1, $3)
    `, [winner_id, game.player1_id, game.player2_id]);

    res.json({
      message: 'Game finished',
      game: result.rows[0]
    });
  } catch (error) {
    console.error('Error finishing game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
