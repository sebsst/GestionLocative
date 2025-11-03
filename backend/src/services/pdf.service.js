import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateRentReminder = async (tenant, lease, property, rent) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('RAPPEL DE PAIEMENT', { align: 'center' });
    doc.moveDown();

    // Date
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.moveDown();

    // Tenant info
    doc.fontSize(14).text('Destinataire:');
    doc.fontSize(12)
      .text(`${tenant.firstName} ${tenant.lastName}`)
      .text(tenant.address || '')
      .text(`${tenant.postalCode || ''} ${tenant.city || ''}`);
    doc.moveDown();

    // Property info
    doc.fontSize(14).text('Bien concerné:');
    doc.fontSize(12)
      .text(property.name)
      .text(property.address)
      .text(`${property.postalCode} ${property.city}`);
    doc.moveDown();

    // Rent details
    doc.fontSize(14).text('Détails du loyer:');
    doc.fontSize(12)
      .text(`Période: ${rent.month}/${rent.year}`)
      .text(`Montant attendu: ${rent.expectedAmount} €`)
      .text(`Montant payé: ${rent.paidAmount} €`)
      .text(`Reste à payer: ${parseFloat(rent.expectedAmount) - parseFloat(rent.paidAmount)} €`, { underline: true });
    doc.moveDown();

    // Message
    doc.fontSize(12)
      .text('Madame, Monsieur,', { align: 'justify' })
      .moveDown()
      .text(`Nous vous rappelons que le loyer du mois ${rent.month}/${rent.year} est en attente de paiement.`, { align: 'justify' })
      .moveDown()
      .text('Nous vous prions de bien vouloir régulariser cette situation dans les plus brefs délais.', { align: 'justify' })
      .moveDown()
      .text('Cordialement,', { align: 'justify' });

    doc.end();
  });
};

export const generateLateRentNotice = async (tenant, lease, property, rent) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('MISE EN DEMEURE', { align: 'center', underline: true });
    doc.moveDown(2);

    // Date
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.moveDown();

    // Tenant info
    doc.fontSize(14).text('Destinataire:');
    doc.fontSize(12)
      .text(`${tenant.firstName} ${tenant.lastName}`)
      .text(tenant.address || '')
      .text(`${tenant.postalCode || ''} ${tenant.city || ''}`);
    doc.moveDown(2);

    // Subject
    doc.fontSize(14).text('Objet: Mise en demeure de payer', { underline: true });
    doc.moveDown();

    // Message
    doc.fontSize(12)
      .text('Madame, Monsieur,', { align: 'justify' })
      .moveDown()
      .text(`Par la présente, nous constatons que le loyer du mois ${rent.month}/${rent.year} concernant le logement situé ${property.address}, ${property.postalCode} ${property.city} n'a pas été réglé.`, { align: 'justify' })
      .moveDown()
      .text(`Montant dû: ${parseFloat(rent.expectedAmount) - parseFloat(rent.paidAmount)} €`, { underline: true })
      .moveDown()
      .text('En conséquence, nous vous mettons en demeure de régler cette somme dans un délai de 8 jours à compter de la réception de la présente.', { align: 'justify' })
      .moveDown()
      .text('À défaut de paiement dans ce délai, nous nous verrons dans l\'obligation d\'engager une procédure judiciaire à votre encontre, sans autre avis.', { align: 'justify' })
      .moveDown(2)
      .text('Veuillez agréer, Madame, Monsieur, nos salutations distinguées.', { align: 'justify' });

    doc.end();
  });
};

export const generateFiscalDeclaration = async (year, properties, charges, works, rents) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(18).text('DÉCLARATION DE REVENUS FONCIERS', { align: 'center', underline: true });
    doc.fontSize(14).text(`Année ${year}`, { align: 'center' });
    doc.moveDown(2);

    // RECETTES
    doc.fontSize(16).text('RECETTES', { underline: true });
    doc.moveDown();

    const totalRents = rents.reduce((sum, rent) => sum + parseFloat(rent.paidAmount || 0), 0);

    doc.fontSize(12)
      .text(`211 - Loyers bruts: ${totalRents.toFixed(2)} €`)
      .moveDown()
      .text(`215 - TOTAL REVENUS BRUTS: ${totalRents.toFixed(2)} €`, { underline: true });
    doc.moveDown(2);

    // FRAIS ET CHARGES
    doc.fontSize(16).text('FRAIS ET CHARGES', { underline: true });
    doc.moveDown();

    const chargesByType = {};
    let totalCharges = 0;

    charges.forEach(charge => {
      const type = charge.type;
      const amount = parseFloat(charge.amount || 0);
      chargesByType[type] = (chargesByType[type] || 0) + amount;
      totalCharges += amount;
    });

    doc.fontSize(12);
    if (chargesByType.assurance) {
      doc.text(`223 - Primes d'assurances: ${chargesByType.assurance.toFixed(2)} €`);
    }

    const totalWorks = works
      .filter(w => w.status === 'paye')
      .reduce((sum, work) => sum + parseFloat(work.amount || 0), 0);

    if (totalWorks > 0) {
      doc.text(`224 - Paiements travaux: ${totalWorks.toFixed(2)} €`);
    }

    if (chargesByType.taxe_fonciere) {
      doc.text(`227 - Taxes foncières: ${chargesByType.taxe_fonciere.toFixed(2)} €`);
    }

    const totalFrais = totalCharges + totalWorks;
    doc.moveDown()
      .text(`240 - TOTAL FRAIS ET CHARGES: ${totalFrais.toFixed(2)} €`, { underline: true });

    doc.moveDown(2);

    // REVENU
    doc.fontSize(16).text('REVENU', { underline: true });
    doc.moveDown();

    const revenu = totalRents - totalFrais;
    doc.fontSize(12)
      .text(`260 - REVENU PAR IMMEUBLE: ${revenu.toFixed(2)} €`, { underline: true })
      .moveDown()
      .text(`263 - ${revenu >= 0 ? 'Bénéfice' : 'Déficit'}: ${Math.abs(revenu).toFixed(2)} €`, { bold: true });

    doc.moveDown(2);

    // Liste des travaux
    if (works.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('LISTE DES TRAVAUX', { underline: true });
      doc.moveDown();

      doc.fontSize(10);
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 150;
      const col3 = 350;
      const col4 = 480;

      // Header
      doc.text('Date', col1, tableTop);
      doc.text('Fournisseur', col2, tableTop);
      doc.text('Objet', col3, tableTop);
      doc.text('Montant', col4, tableTop);

      let currentY = tableTop + 20;

      works.filter(w => w.status === 'paye').forEach(work => {
        const workDate = work.workDate ? new Date(work.workDate).toLocaleDateString('fr-FR') : '-';
        doc.text(workDate, col1, currentY);
        doc.text(work.artisan?.name || '-', col2, currentY, { width: 180 });
        doc.text(work.nature, col3, currentY, { width: 120 });
        doc.text(`${work.amount} €`, col4, currentY);
        currentY += 20;
      });
    }

    doc.end();
  });
};

export const generateLeaseContract = async (lease, tenant, property) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(18).text('CONTRAT DE LOCATION', { align: 'center', underline: true });
    doc.moveDown(2);

    // Parties
    doc.fontSize(14).text('Entre les soussignés:', { underline: true });
    doc.moveDown();

    doc.fontSize(12)
      .text('Le bailleur:', { underline: true })
      .text('[Nom du bailleur]')
      .text('[Adresse du bailleur]')
      .moveDown()
      .text('Et:', { underline: true })
      .moveDown()
      .text('Le locataire:', { underline: true })
      .text(`${tenant.firstName} ${tenant.lastName}`)
      .text(tenant.address || '')
      .text(`${tenant.postalCode || ''} ${tenant.city || ''}`);

    doc.moveDown(2);

    // Property
    doc.fontSize(14).text('Désignation du bien loué:', { underline: true });
    doc.moveDown();

    doc.fontSize(12)
      .text(property.name)
      .text(property.address)
      .text(`${property.postalCode} ${property.city}`)
      .text(`Type: ${property.type}`)
      .text(`Surface: ${property.surface} m²`)
      .text(`Nombre de pièces: ${property.rooms}`);

    doc.moveDown(2);

    // Terms
    doc.fontSize(14).text('Conditions:', { underline: true });
    doc.moveDown();

    doc.fontSize(12)
      .text(`Date de début: ${new Date(lease.startDate).toLocaleDateString('fr-FR')}`)
      .text(lease.endDate ? `Date de fin: ${new Date(lease.endDate).toLocaleDateString('fr-FR')}` : 'Durée indéterminée')
      .text(`Loyer mensuel: ${lease.rentAmount} €`)
      .text(`Charges mensuelles: ${lease.chargesAmount} €`)
      .text(`Dépôt de garantie: ${lease.deposit} €`)
      .text(`Nombre d'occupants: ${lease.numberOfOccupants}`);

    doc.moveDown(2);

    doc.fontSize(12).text('Fait en deux exemplaires, dont un remis au locataire.', { align: 'justify' });
    doc.moveDown(2);

    // Signatures
    doc.fontSize(12)
      .text(`Fait à _________________, le ${new Date().toLocaleDateString('fr-FR')}`)
      .moveDown(3)
      .text('Le bailleur                                                    Le locataire')
      .moveDown(2)
      .text('_________________                                    _________________');

    doc.end();
  });
};

export default {
  generateRentReminder,
  generateLateRentNotice,
  generateFiscalDeclaration,
  generateLeaseContract
};
