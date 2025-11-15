import sequelize from '../config/database.js';
import { Charge } from '../models/index.js';

async function fixChargeNames() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie.');

    // Find all charges
    const charges = await Charge.findAll();
    console.log(`${charges.length} charges trouvées.`);

    let updated = 0;
    for (const charge of charges) {
      // Si la charge n'a pas de name, on utilise le type comme nom
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

        const newName = typeNames[charge.type] || charge.type;
        await charge.update({ name: newName });
        console.log(`Charge ${charge.id}: nom mis à jour vers "${newName}"`);
        updated++;
      }

      // Si la charge n'a pas de frequency, on met "ponctuel" par défaut
      if (!charge.frequency || charge.frequency === '') {
        await charge.update({ frequency: 'ponctuel' });
        console.log(`Charge ${charge.id}: fréquence mise à jour vers "ponctuel"`);
        updated++;
      }
    }

    console.log(`\n✓ Migration terminée: ${updated} champs mis à jour.`);
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

fixChargeNames();
