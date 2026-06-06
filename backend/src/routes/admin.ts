import express, { Router, Request, Response } from 'express';
import { query } from '../database';

const router: Router = express.Router();

// Get all appointments
router.get('/appointments', async (req: Request, res: Response) => {
  try {
    const { status, date } = req.query;

    let sql = `SELECT * FROM appointments WHERE 1=1`;
    const params: any[] = [];

    if (status) {
      sql += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (date) {
      sql += ` AND date = $${params.length + 1}`;
      params.push(date);
    }

    sql += ` ORDER BY date ASC, time ASC`;

    const result = await query(sql, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status
router.put('/appointments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await query(
      `UPDATE appointments 
       SET status = $1, notes = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
router.delete('/appointments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM appointments WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
