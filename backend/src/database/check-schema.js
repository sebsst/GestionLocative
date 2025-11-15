import sequelize from '../config/database.js';

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie.\n');

    // Get table schema
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'Charges'
      ORDER BY ordinal_position;
    `);

    console.log('Colonnes de la table Charges:');
    console.log('================================');
    columns.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | NULL: ${col.is_nullable === 'YES' ? 'Oui' : 'Non'}`);
    });

    console.log('\n');

    // Check for data in name and frequency columns
    const [charges] = await sequelize.query('SELECT id, type, name, frequency FROM "Charges" LIMIT 5');

    console.log(`\nPremiers enregistrements (${charges.length}):`);
    charges.forEach(c => {
      console.log(`  - ID: ${c.id}`);
      console.log(`    Type: ${c.type}`);
      console.log(`    Name: ${c.name ? `"${c.name}"` : 'NULL'}`);
      console.log(`    Frequency: ${c.frequency ? `"${c.frequency}"` : 'NULL'}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkSchema();
