import sequelize from '../config/database.js';
import {
  Property,
  Tenant,
  Lease,
  LeaseOccupant,
  LeaseOccupancyPeriod,
  Rent,
  Charge,
  ChargeDistribution,
  ChargeAllocation,
  Work,
  Artisan,
  Quote,
  PropertyRentHistory,
  FiscalDeclaration
} from '../models/index.js';

// Export de toutes les données
export const exportData = async (req, res, next) => {
  try {
    // Récupérer toutes les données (pas de filtrage par userId pour l'instant)
    const properties = await Property.findAll();
    const tenants = await Tenant.findAll();
    const leases = await Lease.findAll();
    const leaseOccupants = await LeaseOccupant.findAll();
    const leaseOccupancyPeriods = await LeaseOccupancyPeriod.findAll();
    const rents = await Rent.findAll();
    const charges = await Charge.findAll();
    const chargeDistributions = await ChargeDistribution.findAll();
    const chargeAllocations = await ChargeAllocation.findAll();
    const works = await Work.findAll();
    const artisans = await Artisan.findAll();
    const quotes = await Quote.findAll();
    const propertyRentHistories = await PropertyRentHistory.findAll();
    const fiscalDeclarations = await FiscalDeclaration.findAll();

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      data: {
        properties: properties.map(p => p.toJSON()),
        tenants: tenants.map(t => t.toJSON()),
        leases: leases.map(l => l.toJSON()),
        leaseOccupants: leaseOccupants.map(lo => lo.toJSON()),
        leaseOccupancyPeriods: leaseOccupancyPeriods.map(lop => lop.toJSON()),
        rents: rents.map(r => r.toJSON()),
        charges: charges.map(c => c.toJSON()),
        chargeDistributions: chargeDistributions.map(cd => cd.toJSON()),
        chargeAllocations: chargeAllocations.map(ca => ca.toJSON()),
        works: works.map(w => w.toJSON()),
        artisans: artisans.map(a => a.toJSON()),
        quotes: quotes.map(q => q.toJSON()),
        propertyRentHistories: propertyRentHistories.map(prh => prh.toJSON()),
        fiscalDeclarations: fiscalDeclarations.map(fd => fd.toJSON())
      }
    };

    res.json(exportData);
  } catch (error) {
    console.error('Erreur lors de l\'export des données:', error);
    next(error);
  }
};

// Import de toutes les données
export const importData = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: { message: 'Données d\'import invalides' }
      });
    }

    // Supprimer toutes les données existantes
    // Les cascades se chargeront de supprimer les données liées
    await FiscalDeclaration.destroy({ where: {}, transaction: t });
    await PropertyRentHistory.destroy({ where: {}, transaction: t });
    await Artisan.destroy({ where: {}, transaction: t });
    await Tenant.destroy({ where: {}, transaction: t });
    await Property.destroy({ where: {}, transaction: t });

    // Importer les nouvelles données
    const idMapping = {}; // Pour mapper les anciens IDs aux nouveaux

    // Properties
    if (data.properties) {
      for (const prop of data.properties) {
        const oldId = prop.id;
        delete prop.id;
        const newProp = await Property.create({ ...prop }, { transaction: t });
        idMapping[`property_${oldId}`] = newProp.id;
      }
    }

    // Tenants
    if (data.tenants) {
      for (const tenant of data.tenants) {
        const oldId = tenant.id;
        delete tenant.id;
        const newTenant = await Tenant.create({ ...tenant }, { transaction: t });
        idMapping[`tenant_${oldId}`] = newTenant.id;
      }
    }

    // Artisans
    if (data.artisans) {
      for (const artisan of data.artisans) {
        const oldId = artisan.id;
        delete artisan.id;
        const newArtisan = await Artisan.create({ ...artisan }, { transaction: t });
        idMapping[`artisan_${oldId}`] = newArtisan.id;
      }
    }

    // Leases
    if (data.leases) {
      for (const lease of data.leases) {
        const oldId = lease.id;
        delete lease.id;
        const newLease = await Lease.create({
          ...lease,
          propertyId: idMapping[`property_${lease.propertyId}`],
          tenantId: idMapping[`tenant_${lease.tenantId}`]
        }, { transaction: t });
        idMapping[`lease_${oldId}`] = newLease.id;
      }
    }

    // LeaseOccupants
    if (data.leaseOccupants) {
      for (const occupant of data.leaseOccupants) {
        delete occupant.id;
        await LeaseOccupant.create({
          ...occupant,
          leaseId: idMapping[`lease_${occupant.leaseId}`]
        }, { transaction: t });
      }
    }

    // LeaseOccupancyPeriods
    if (data.leaseOccupancyPeriods) {
      for (const period of data.leaseOccupancyPeriods) {
        delete period.id;
        await LeaseOccupancyPeriod.create({
          ...period,
          leaseId: idMapping[`lease_${period.leaseId}`]
        }, { transaction: t });
      }
    }

    // Rents
    if (data.rents) {
      for (const rent of data.rents) {
        delete rent.id;
        await Rent.create({
          ...rent,
          leaseId: idMapping[`lease_${rent.leaseId}`]
        }, { transaction: t });
      }
    }

    // Charges
    if (data.charges) {
      for (const charge of data.charges) {
        const oldId = charge.id;
        delete charge.id;
        const newCharge = await Charge.create({
          ...charge,
          propertyId: idMapping[`property_${charge.propertyId}`]
        }, { transaction: t });
        idMapping[`charge_${oldId}`] = newCharge.id;
      }
    }

    // ChargeDistributions
    if (data.chargeDistributions) {
      for (const dist of data.chargeDistributions) {
        delete dist.id;
        await ChargeDistribution.create({
          ...dist,
          chargeId: idMapping[`charge_${dist.chargeId}`],
          leaseId: dist.leaseId ? idMapping[`lease_${dist.leaseId}`] : null,
          propertyId: dist.propertyId ? idMapping[`property_${dist.propertyId}`] : null
        }, { transaction: t });
      }
    }

    // ChargeAllocations
    if (data.chargeAllocations) {
      for (const alloc of data.chargeAllocations) {
        delete alloc.id;
        await ChargeAllocation.create({
          ...alloc,
          chargeId: idMapping[`charge_${alloc.chargeId}`],
          leaseId: idMapping[`lease_${alloc.leaseId}`]
        }, { transaction: t });
      }
    }

    // Works
    if (data.works) {
      for (const work of data.works) {
        const oldId = work.id;
        delete work.id;
        const newWork = await Work.create({
          ...work,
          propertyId: idMapping[`property_${work.propertyId}`],
          artisanId: work.artisanId ? idMapping[`artisan_${work.artisanId}`] : null
        }, { transaction: t });
        idMapping[`work_${oldId}`] = newWork.id;
      }
    }

    // Quotes
    if (data.quotes) {
      for (const quote of data.quotes) {
        delete quote.id;
        await Quote.create({
          ...quote,
          workId: idMapping[`work_${quote.workId}`]
        }, { transaction: t });
      }
    }

    // PropertyRentHistories
    if (data.propertyRentHistories) {
      for (const history of data.propertyRentHistories) {
        delete history.id;
        await PropertyRentHistory.create({
          ...history,
          propertyId: idMapping[`property_${history.propertyId}`]
        }, { transaction: t });
      }
    }

    // FiscalDeclarations
    if (data.fiscalDeclarations) {
      for (const declaration of data.fiscalDeclarations) {
        delete declaration.id;
        await FiscalDeclaration.create({
          ...declaration
        }, { transaction: t });
      }
    }

    await t.commit();

    res.json({
      success: true,
      message: 'Données importées avec succès'
    });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de l\'import des données:', error);
    next(error);
  }
};

// Réinitialisation de toutes les données
export const resetData = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    // Supprimer toutes les données
    // Les cascades se chargeront de supprimer les données liées
    await FiscalDeclaration.destroy({ where: {}, transaction: t });
    await PropertyRentHistory.destroy({ where: {}, transaction: t });
    await Artisan.destroy({ where: {}, transaction: t });
    await Tenant.destroy({ where: {}, transaction: t });
    await Property.destroy({ where: {}, transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Toutes les données ont été supprimées avec succès'
    });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la réinitialisation:', error);
    next(error);
  }
};
