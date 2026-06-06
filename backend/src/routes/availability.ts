import express, { Router, Request, Response } from 'express';
import { query } from '../database';

const router: Router = express.Router();

// Get availability schedule
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT day_of_week, start_time, end_time, slot_duration_minutes 
       FROM availability 
       ORDER BY day_of_week ASC`
    );

    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const schedule = result.rows.map((row) => ({
      day: dayNames[row.day_of_week],
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      slotDuration: row.slot_duration_minutes,
    }));

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
