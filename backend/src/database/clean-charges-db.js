import sequelize from '../config/database.js';

async function cleanChargesDB() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie.\n');

    // 1. Lister les charges actuelles
    const [charges] = await sequelize.query('SELECT id, type, name, frequency FROM "Charges"');
    console.log(`Charges trouvées: ${charges.length}`);
    charges.forEach(c => {
      console.log(`  - ID: ${c.id}, Type: ${c.type}, Name: "${c.name}", Frequency: "${c.frequency}"`);
    });
    console.log('');

    // 2. Supprimer temporairement la contrainte NOT NULL sur frequency
    try {
      await sequelize.query('ALTER TABLE "Charges" ALTER COLUMN "frequency" DROP NOT NULL');
      console.log('✓ Contrainte NOT NULL sur frequency supprimée temporairement');
    } catch (e) {
      console.log('  (Contrainte déjà absente)');
    }

    // 3. Mettre à jour les enregistrements avec name vide ou NULL
    const [nameResult] = await sequelize.query(`
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
      WHERE "name" IS NULL OR "name" = ''
    `);
    console.log(`✓ ${nameResult.rowCount || 0} nom(s) de charge mis à jour`);

    // 4. Mettre à jour les enregistrements avec frequency vide ou NULL
    // D'abord mettre à NULL les valeurs vides
    await sequelize.query(`
      UPDATE "Charges"
      SET "frequency" = NULL
      WHERE "frequency" = '' OR "frequency" NOT IN ('mensuel', 'trimestriel', 'annuel', 'ponctuel')
    `);
    console.log('✓ Valeurs invalides de frequency nettoyées');

    // Puis mettre 'ponctuel' pour les NULL
    const [freqResult] = await sequelize.query(`
      UPDATE "Charges"
      SET "frequency" = 'ponctuel'
      WHERE "frequency" IS NULL
    `);
    console.log(`✓ ${freqResult.rowCount || 0} fréquence(s) mise(s) à jour`);

    // 5. Vérifier qu'il n'y a plus de valeurs invalides
    const [invalidCharges] = await sequelize.query(`
      SELECT id, name, frequency FROM "Charges"
      WHERE "name" IS NULL OR "name" = '' OR "frequency" IS NULL OR "frequency" = ''
    `);

    if (invalidCharges.length > 0) {
      console.log('\n⚠ Charges avec des valeurs invalides restantes:');
      invalidCharges.forEach(c => console.log(`  - ID: ${c.id}, Name: "${c.name}", Frequency: "${c.frequency}"`));
      throw new Error('Des charges ont encore des valeurs invalides');
    }

    console.log('\n✓ Toutes les charges ont des valeurs valides');

    // 6. Lister le résultat final
    const [finalCharges] = await sequelize.query('SELECT id, type, name, frequency FROM "Charges"');
    console.log('\nCharges après nettoyage:');
    finalCharges.forEach(c => {
      console.log(`  - ID: ${c.id}, Type: ${c.type}, Name: "${c.name}", Frequency: "${c.frequency}"`);
    });

    console.log('\n✅ Nettoyage terminé avec succès!');
    console.log('\n⚠ IMPORTANT: Redémarrez le serveur backend pour que les modifications prennent effet.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors du nettoyage:', error.message);
    console.error(error);
    process.exit(1);
  }
}

cleanChargesDB();
