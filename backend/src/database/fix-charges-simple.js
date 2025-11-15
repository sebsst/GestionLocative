import sequelize from '../config/database.js';
import { Charge } from '../models/index.js';

async function fixCharges() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie.');

    // Récupérer toutes les charges avec raw: true pour éviter la validation
    const [charges] = await sequelize.query('SELECT * FROM "Charges"');
    console.log(`${charges.length} charges trouvées.`);

    let updated = 0;

    for (const charge of charges) {
      const updates = {};
      let needsUpdate = false;

      // Vérifier et corriger le champ name
      if (!charge.name || charge.name === '') {
        const typeNames = {
          copropriete: 'Copropriété',
          electricite: 'Électricité',
          eau: 'Eau',
          ordures: 'Ordures ménagères',
          jardin: 'Entretien jardin',
          entretien: 'Entretien',
          assurance: 'Assurance',
          chauffage: 'Chauffage',
          taxe_fonciere: 'Taxe foncière',
          autre: 'Autre charge'
        };
        updates.name = typeNames[charge.type] || 'Charge';
        needsUpdate = true;
      }

      // Vérifier et corriger le champ frequency
      if (!charge.frequency || charge.frequency === '') {
        updates.frequency = 'ponctuel';
        needsUpdate = true;
      }

      // Si des mises à jour sont nécessaires, les appliquer
      if (needsUpdate) {
        await sequelize.query(
          `UPDATE "Charges" SET ${Object.keys(updates).map((key, i) => `"${key}" = $${i + 1}`).join(', ')} WHERE id = $${Object.keys(updates).length + 1}`,
          {
            bind: [...Object.values(updates), charge.id]
          }
        );
        console.log(`✓ Charge ${charge.id} mise à jour:`, updates);
        updated++;
      }
    }

    console.log(`\n✅ Migration terminée: ${updated} charge(s) mise(s) à jour.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

fixCharges();
