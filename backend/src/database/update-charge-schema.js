import sequelize from '../config/database.js';

async function updateChargeSchema() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie.');

    // Ajouter les colonnes avec des valeurs par défaut si elles n'existent pas
    await sequelize.query(`
      DO $$
      BEGIN
        -- Ajouter la colonne name si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Charges' AND column_name = 'name'
        ) THEN
          ALTER TABLE "Charges" ADD COLUMN "name" VARCHAR(255);
        END IF;

        -- Ajouter la colonne frequency si elle n'existe pas
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Charges' AND column_name = 'frequency'
        ) THEN
          ALTER TABLE "Charges" ADD COLUMN "frequency" VARCHAR(255);
        END IF;
      END $$;
    `);

    console.log('✓ Colonnes ajoutées si nécessaire.');

    // Mettre à jour les enregistrements existants qui ont name ou frequency NULL
    await sequelize.query(`
      UPDATE "Charges"
      SET "name" = CASE
        WHEN type = 'copropriete' THEN 'Copropriété'
        WHEN type = 'electricite' THEN 'Électricité'
        WHEN type = 'eau' THEN 'Eau'
        WHEN type = 'ordures' THEN 'Ordures ménagères'
        WHEN type = 'jardin' THEN 'Entretien jardin'
        WHEN type = 'entretien' THEN 'Entretien'
        WHEN type = 'assurance' THEN 'Assurance'
        WHEN type = 'chauffage' THEN 'Chauffage'
        WHEN type = 'taxe_fonciere' THEN 'Taxe foncière'
        ELSE 'Autre charge'
      END
      WHERE "name" IS NULL OR "name" = '';
    `);

    // Mettre à jour frequency seulement si NULL (pas si chaîne vide car ENUM n'accepte pas '')
    await sequelize.query(`
      UPDATE "Charges"
      SET "frequency" = 'ponctuel'
      WHERE "frequency" IS NULL;
    `);

    console.log('✓ Enregistrements mis à jour.');

    // Maintenant, rendre les colonnes NOT NULL
    await sequelize.query(`
      ALTER TABLE "Charges"
      ALTER COLUMN "name" SET NOT NULL;
    `);

    await sequelize.query(`
      ALTER TABLE "Charges"
      ALTER COLUMN "frequency" SET NOT NULL;
    `);

    console.log('✓ Contraintes NOT NULL ajoutées.');

    console.log('\n✅ Migration terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

updateChargeSchema();
