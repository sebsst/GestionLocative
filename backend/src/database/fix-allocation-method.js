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

    console.log('🔄 Correction de la colonne allocationMethod...');

    // Supprimer la colonne si elle existe
    await sequelize.query(`
      ALTER TABLE "ChargeDistributions"
      DROP COLUMN IF EXISTS "allocationMethod";
    `);
    console.log('✅ Colonne allocationMethod supprimée');

    // Recréer la colonne avec le bon type
    await sequelize.query(`
      ALTER TABLE "ChargeDistributions"
      ADD COLUMN "allocationMethod" "enum_ChargeDistributions_allocationMethod" NOT NULL DEFAULT 'fixe';
    `);
    console.log('✅ Colonne allocationMethod recréée');

    await sequelize.close();
    console.log('✅ Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrate();
