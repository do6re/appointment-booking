import { query } from '../database';

const seedData = async () => {
  try {
    // Seed services
    await query(`
      DELETE FROM services WHERE name IN 
      ('Komplette Entrümpelung', 'Teilentrümpelung', 'Haushalt Auflösung', 'Gartenarbeit')
    `);

    await query(`
      INSERT INTO services (name, description, duration_minutes) VALUES
      ('Komplette Entrümpelung', 'Komplettes Ausräumen von Räumen oder Objekten', 120),
      ('Teilentrümpelung', 'Selektives Ausräumen von einzelnen Bereichen', 90),
      ('Haushalt Auflösung', 'Professionelle Auflösung von Hausständen', 180),
      ('Gartenarbeit', 'Gartenentrümpelung und Aufräumarbeiten', 120)
    `);

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

seedData().then(() => process.exit(0));
