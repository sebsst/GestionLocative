import sequelize from '../config/database.js';
import ChargeRegularization from '../models/ChargeRegularization.js';
import ChargeRegularizationDetail from '../models/ChargeRegularizationDetail.js';
import Rent from '../models/Rent.js';

async function recreateChargeRegularizationTables() {
  try {
    console.log('Starting migration: Recreate ChargeRegularization tables...');

    // Drop existing tables if they exist (in correct order due to foreign keys)
    console.log('Dropping ChargeRegularizationDetails table if exists...');
    await sequelize.query('DROP TABLE IF EXISTS "ChargeRegularizationDetails" CASCADE;');
    console.log('✓ ChargeRegularizationDetails table dropped');

    console.log('Dropping ChargeRegularizations table if exists...');
    await sequelize.query('DROP TABLE IF EXISTS "ChargeRegularizations" CASCADE;');
    console.log('✓ ChargeRegularizations table dropped');

    // Drop enum type if exists
    console.log('Dropping enum type if exists...');
    await sequelize.query('DROP TYPE IF EXISTS "enum_ChargeRegularizations_status" CASCADE;');
    console.log('✓ Enum type dropped');

    // Create ChargeRegularization table
    console.log('Creating ChargeRegularizations table...');
    await ChargeRegularization.sync({ force: true });
    console.log('✓ ChargeRegularizations table created');

    // Create ChargeRegularizationDetail table
    console.log('Creating ChargeRegularizationDetails table...');
    await ChargeRegularizationDetail.sync({ force: true });
    console.log('✓ ChargeRegularizationDetails table created');

    // Add chargeProvisions column to Rent table if it doesn't exist
    console.log('Adding chargeProvisions column to Rents table...');
    await Rent.sync({ alter: true });
    console.log('✓ Rents table updated');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

recreateChargeRegularizationTables();
