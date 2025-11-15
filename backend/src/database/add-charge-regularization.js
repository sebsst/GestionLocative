import sequelize from '../config/database.js';
import ChargeRegularization from '../models/ChargeRegularization.js';
import ChargeRegularizationDetail from '../models/ChargeRegularizationDetail.js';
import Rent from '../models/Rent.js';

async function addChargeRegularizationTables() {
  try {
    console.log('Starting migration: Add ChargeRegularization tables...');

    // Sync ChargeRegularization table
    console.log('Creating ChargeRegularizations table...');
    await ChargeRegularization.sync({ alter: true });
    console.log('✓ ChargeRegularizations table created');

    // Sync ChargeRegularizationDetail table
    console.log('Creating ChargeRegularizationDetails table...');
    await ChargeRegularizationDetail.sync({ alter: true });
    console.log('✓ ChargeRegularizationDetails table created');

    // Add chargeProvisions column to Rent table if it doesn't exist
    console.log('Adding chargeProvisions column to Rents table...');
    await Rent.sync({ alter: true });
    console.log('✓ Rents table updated');

    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

addChargeRegularizationTables();
