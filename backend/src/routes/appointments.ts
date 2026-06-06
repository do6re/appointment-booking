import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../database';
import { sendBookingEmail, sendConfirmationEmail } from '../services/emailService';

const router: Router = express.Router();

// Get all available time slots
router.get('/available', async (req: Request, res: Response) => {
  try {
    const { date, service_type } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const dateObj = new Date(date as string);
    const dayOfWeek = dateObj.getDay();

    // Get availability for the day
    const availResult = await query(
      `SELECT * FROM availability WHERE day_of_week = $1`,
      [dayOfWeek]
    );

    if (availResult.rows.length === 0) {
      return res.json({ slots: [] });
    }

    const availability = availResult.rows[0];
    const slots: string[] = [];

    // Generate time slots
    const startTime = new Date(`2000-01-01 ${availability.start_time}`);
    const endTime = new Date(`2000-01-01 ${availability.end_time}`);
    const duration = availability.slot_duration_minutes;

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      slots.push(timeStr);
      currentTime = new Date(currentTime.getTime() + duration * 60000);
    }

    // Filter out booked slots
    const bookedResult = await query(
      `SELECT time FROM appointments WHERE date = $1 AND status != 'cancelled'`,
      [date]
    );

    const bookedTimes = bookedResult.rows.map((row) => row.time);
    const availableSlots = slots.filter((slot) => !bookedTimes.includes(slot));

    res.json({ date, slots: availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new appointment
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, date, time, service_type } = req.body;

    // Validation
    if (!name || !email || !date || !time || !service_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if slot is available
    const existingResult = await query(
      `SELECT id FROM appointments WHERE date = $1 AND time = $2 AND status != 'cancelled'`,
      [date, time]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: 'Time slot is not available' });
    }

    // Create appointment
    const appointmentId = uuidv4();
    await query(
      `INSERT INTO appointments (id, name, email, date, time, service_type, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
      [appointmentId, name, email, date, time, service_type]
    );

    // Send confirmation email to customer
    await sendBookingEmail(name, email, { date, time, service_type });

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@entrumpelungservice.de';
    await sendConfirmationEmail(adminEmail, { name, email, date, time, service_type });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointmentId,
      appointment: { id: appointmentId, name, email, date, time, service_type },
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM appointments WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
