import sequelize from '../config/database.js';

async function addChargeMetadata() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données établie.');

        // Ajouter la colonne metadata si elle n'existe pas
        await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Charges' AND column_name = 'metadata'
        ) THEN
          ALTER TABLE "Charges" ADD COLUMN "metadata" JSONB;
        END IF;
      END $$;
    `);

        console.log('✓ Colonne metadata ajoutée.');
        console.log('\n✅ Migration terminée avec succès!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

addChargeMetadata();
