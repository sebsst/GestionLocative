import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log
});

async function migrate() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connecté avec succès');

    console.log('🔄 Création de la table LeaseOccupancyPeriods...');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "LeaseOccupancyPeriods" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "leaseId" UUID NOT NULL REFERENCES "Leases"(id) ON DELETE CASCADE,
        "startDate" DATE NOT NULL,
        "endDate" DATE,
        "numberOfOccupants" INTEGER NOT NULL DEFAULT 1 CHECK ("numberOfOccupants" >= 1),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Table LeaseOccupancyPeriods créée');

    console.log('🔄 Création des index...');
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "lease_occupancy_periods_lease_id_start_date"
      ON "LeaseOccupancyPeriods" ("leaseId", "startDate");
    `);
    console.log('✅ Index créés');

    await sequelize.close();
    console.log('✅ Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrate();
