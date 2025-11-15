import sequelize from '../config/database.js';

async function createChargeAllocationsTable() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie.\n');

    console.log('Création de la table ChargeAllocations...');

    // Supprimer la table si elle existe (en cas de problème)
    await sequelize.query('DROP TABLE IF EXISTS "ChargeAllocations" CASCADE;');
    console.log('  ✓ Table existante supprimée (si présente)\n');

    // Créer l'enum pour allocationMethod
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_ChargeAllocations_allocationMethod" AS ENUM('par_occupant', 'par_appartement', 'par_jours');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('  ✓ ENUM allocationMethod créé\n');

    // Créer la table
    await sequelize.query(`
      CREATE TABLE "ChargeAllocations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "chargeId" UUID NOT NULL REFERENCES "Charges"("id") ON DELETE CASCADE,
        "leaseId" UUID NOT NULL REFERENCES "Leases"("id") ON DELETE CASCADE,
        "allocationMethod" "enum_ChargeAllocations_allocationMethod" NOT NULL,
        "allocatedAmount" DECIMAL(10, 2) NOT NULL,
        "coefficient" DECIMAL(10, 4),
        "daysOccupied" INTEGER,
        "notes" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('  ✓ Table ChargeAllocations créée\n');

    // Créer les index
    await sequelize.query(`
      CREATE INDEX "charge_allocations_charge_id" ON "ChargeAllocations"("chargeId");
      CREATE INDEX "charge_allocations_lease_id" ON "ChargeAllocations"("leaseId");
    `);
    console.log('  ✓ Index créés\n');

    console.log('✅ Migration réussie: Table ChargeAllocations créée avec succès');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createChargeAllocationsTable();
