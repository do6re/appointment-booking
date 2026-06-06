import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params);
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const runMigrations = async (): Promise<void> => {
  const migrations = [
    // Services table
    `
    CREATE TABLE IF NOT EXISTS services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      duration_minutes INTEGER DEFAULT 60,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
    `,
    // Availability table
    `
    CREATE TABLE IF NOT EXISTS availability (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      slot_duration_minutes INTEGER DEFAULT 30,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(day_of_week, start_time, end_time)
    )
    `,
    // Appointments table
    `
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      service_type VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(date, time)
    )
    `,
    // Seed default services
    `
    INSERT INTO services (name, description, duration_minutes) 
    VALUES 
      ('Komplette Entrümpelung', 'Komplettes Ausräumen von Räumen oder Objekten', 120),
      ('Teilentrümpelung', 'Selektives Ausräumen von einzelnen Bereichen', 90),
      ('Haushalt Auflösung', 'Professionelle Auflösung von Hausständen', 180),
      ('Gartenarbeit', 'Gartenentrümpelung und Aufräumarbeiten', 120)
    ON CONFLICT DO NOTHING
    `,
    // Seed default availability (Mo-Fr, 8-17 Uhr)
    `
    INSERT INTO availability (day_of_week, start_time, end_time, slot_duration_minutes)
    VALUES
      (1, '08:00', '17:00', 30),
      (2, '08:00', '17:00', 30),
      (3, '08:00', '17:00', 30),
      (4, '08:00', '17:00', 30),
      (5, '08:00', '17:00', 30)
    ON CONFLICT DO NOTHING
    `,
  ];

  for (const migration of migrations) {
    try {
      await pool.query(migration);
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  console.log('✅ Database migrations completed');
};

export default pool;
