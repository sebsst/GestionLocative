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

    console.log('🔄 Ajout des colonnes pour la répartition des charges...');

    // Ajouter leaseId
    await sequelize.query(`
      ALTER TABLE "ChargeDistributions"
      ADD COLUMN IF NOT EXISTS "leaseId" UUID REFERENCES "Leases"(id);
    `);
    console.log('✅ Colonne leaseId ajoutée');

    // Ajouter allocationMethod
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_ChargeDistributions_allocationMethod" AS ENUM ('par_occupant', 'par_appartement', 'par_jours', 'fixe');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await sequelize.query(`
      ALTER TABLE "ChargeDistributions"
      ADD COLUMN IF NOT EXISTS "allocationMethod" "enum_ChargeDistributions_allocationMethod" DEFAULT 'fixe';
    `);
    console.log('✅ Colonne allocationMethod ajoutée');

    // Ajouter coefficient
    await sequelize.query(`
      ALTER TABLE "ChargeDistributions"
      ADD COLUMN IF NOT EXISTS "coefficient" DECIMAL(10,4);
    `);
    console.log('✅ Colonne coefficient ajoutée');

    // Ajouter daysOccupied
    await sequelize.query(`
      ALTER TABLE "ChargeDistributions"
      ADD COLUMN IF NOT EXISTS "daysOccupied" INTEGER;
    `);
    console.log('✅ Colonne daysOccupied ajoutée');

    // Ajouter occupantsCount
    await sequelize.query(`
      ALTER TABLE "ChargeDistributions"
      ADD COLUMN IF NOT EXISTS "occupantsCount" INTEGER;
    `);
    console.log('✅ Colonne occupantsCount ajoutée');

    // Modifier propertyId pour permettre NULL
    await sequelize.query(`
      ALTER TABLE "ChargeDistributions"
      ALTER COLUMN "propertyId" DROP NOT NULL;
    `);
    console.log('✅ Colonne propertyId modifiée pour permettre NULL');

    await sequelize.close();
    console.log('✅ Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrate();
