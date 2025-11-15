import sequelize from '../config/database.js';
import Lease from '../models/Lease.js';
import LeaseRentPeriod from '../models/LeaseRentPeriod.js';

async function migrateToRentPeriods() {
  try {
    console.log('Starting migration: Convert existing lease data to LeaseRentPeriod...');

    // Create LeaseRentPeriods table if not exists
    console.log('Creating LeaseRentPeriods table...');
    await LeaseRentPeriod.sync({ alter: true });
    console.log('✓ LeaseRentPeriods table ready');

    // Get all leases
    console.log('\nFetching all leases...');
    const leases = await Lease.findAll();
    console.log(`Found ${leases.length} leases to migrate`);

    let created = 0;
    let skipped = 0;

    for (const lease of leases) {
      // Check if a rent period already exists for this lease
      const existingPeriod = await LeaseRentPeriod.findOne({
        where: { leaseId: lease.id }
      });

      if (existingPeriod) {
        console.log(`  ⊘ Skipping lease ${lease.id} - already has rent periods`);
        skipped++;
        continue;
      }

      // Create initial rent period for this lease
      await LeaseRentPeriod.create({
        leaseId: lease.id,
        startDate: lease.startDate,
        endDate: null, // Active period
        rentAmount: lease.rentAmount,
        chargesAmount: lease.chargesAmount || 0,
        totalAmount: parseFloat(lease.rentAmount) + parseFloat(lease.chargesAmount || 0),
        changeReason: 'initial',
        notes: 'Période initiale créée lors de la migration'
      });

      console.log(`  ✓ Created initial rent period for lease ${lease.id}`);
      created++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary:');
    console.log(`  Total leases: ${leases.length}`);
    console.log(`  Rent periods created: ${created}`);
    console.log(`  Skipped (already migrated): ${skipped}`);
    console.log('='.repeat(60));
    console.log('\n✅ Migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

migrateToRentPeriods();
