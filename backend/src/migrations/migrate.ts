import { initializeDatabase } from '../database';

initializeDatabase()
  .then(() => {
    console.log('✅ Database migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
