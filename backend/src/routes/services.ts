import express, { Router, Request, Response } from 'express';
import { query } from '../database';

const router: Router = express.Router();

// Get all services
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, description, duration_minutes 
       FROM services 
       WHERE active = true 
       ORDER BY name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
