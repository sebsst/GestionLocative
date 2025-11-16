import { sequelize } from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function addFiscalDeductibleAndFilesToWorks() {
  try {
    console.log('Starting migration: Add isFiscalDeductible, quote, and invoiceFile to Works table...');

    // Add isFiscalDeductible column
    await sequelize.query(`
      ALTER TABLE "Works"
      ADD COLUMN IF NOT EXISTS "isFiscalDeductible" BOOLEAN DEFAULT true;
    `, { type: QueryTypes.RAW });
    console.log('✓ Added isFiscalDeductible column');

    // Add quote column
    await sequelize.query(`
      ALTER TABLE "Works"
      ADD COLUMN IF NOT EXISTS quote TEXT;
    `, { type: QueryTypes.RAW });
    console.log('✓ Added quote column');

    // Add invoiceFile column
    await sequelize.query(`
      ALTER TABLE "Works"
      ADD COLUMN IF NOT EXISTS "invoiceFile" TEXT;
    `, { type: QueryTypes.RAW });
    console.log('✓ Added invoiceFile column');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

addFiscalDeductibleAndFilesToWorks()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
