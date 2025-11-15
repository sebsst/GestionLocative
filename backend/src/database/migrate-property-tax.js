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

    console.log('🔄 Ajout de la colonne propertyTax...');
    await sequelize.query(`
      ALTER TABLE "Properties"
      ADD COLUMN IF NOT EXISTS "propertyTax" DECIMAL(10,2);
    `);
    console.log('✅ Colonne propertyTax ajoutée avec succès');

    await sequelize.close();
    console.log('✅ Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrate();
