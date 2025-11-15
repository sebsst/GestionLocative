import sequelize from '../config/database.js';

async function fixPropertyIdNullable() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie.\n');

    // First, update any NULL propertyId values to a placeholder if they exist
    console.log('Étape 1: Vérification des valeurs NULL dans propertyId...');
    const [nullPropertyIds] = await sequelize.query('SELECT id FROM "Charges" WHERE "propertyId" IS NULL');
    console.log(`  Trouvé ${nullPropertyIds.length} charges avec propertyId NULL\n`);

    // Drop the constraint if there are existing values
    console.log('Étape 2: Modification de la contrainte NOT NULL sur propertyId...');
    await sequelize.query('ALTER TABLE "Charges" ALTER COLUMN "propertyId" DROP NOT NULL');
    console.log('  ✓ propertyId peut maintenant être NULL\n');

    // Verify the change
    const [columns] = await sequelize.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Charges' AND column_name = 'propertyId';
    `);

    if (columns[0] && columns[0].is_nullable === 'YES') {
      console.log('✅ Migration réussie: propertyId est maintenant nullable');
    } else {
      console.log('⚠ Attention: La modification n\'a peut-être pas fonctionné');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixPropertyIdNullable();
