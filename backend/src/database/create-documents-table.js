import sequelize from '../config/database.js';
import Document from '../models/Document.js';

async function createDocumentsTable() {
  try {
    console.log('Starting migration: Create Documents table...');

    // Sync Document table
    console.log('Creating Documents table...');
    await Document.sync({ alter: true });
    console.log('✓ Documents table created');

    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

createDocumentsTable();