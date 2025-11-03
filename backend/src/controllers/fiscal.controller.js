import { Property, Charge, Work, Rent, Lease } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import * as pdfService from '../services/pdf.service.js';

export const getFiscalData = async (req, res, next) => {
  try {
    const { year } = req.params;
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // Get all rents for the year
    const rents = await Rent.findAll({
      where: { year: parseInt(year) },
      include: [
        {
          model: Lease,
          include: [{ model: Property }]
        }
      ]
    });

    // Get all charges for the year
    const charges = await Charge.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: Property }]
    });

    // Get all paid works for the year
    const works = await Work.findAll({
      where: {
        status: 'paye',
        paymentDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: Property }]
    });

    // Calculate totals
    const totalRents = rents.reduce((sum, rent) => sum + parseFloat(rent.paidAmount || 0), 0);

    const chargesByType = {};
    let totalCharges = 0;
    charges.forEach(charge => {
      const type = charge.type;
      const amount = parseFloat(charge.amount || 0);
      if (!chargesByType[type]) {
        chargesByType[type] = { total: 0, items: [] };
      }
      chargesByType[type].total += amount;
      chargesByType[type].items.push(charge);
      totalCharges += amount;
    });

    const totalWorks = works.reduce((sum, work) => sum + parseFloat(work.amount || 0), 0);

    const totalFraisEtCharges = totalCharges + totalWorks;
    const revenuNet = totalRents - totalFraisEtCharges;

    // Group by property
    const properties = await Property.findAll();
    const propertiesData = [];

    for (const property of properties) {
      const propertyRents = rents.filter(r => r.Lease.propertyId === property.id);
      const propertyCharges = charges.filter(c => c.propertyId === property.id);
      const propertyWorks = works.filter(w => w.propertyId === property.id);

      const propertyTotalRents = propertyRents.reduce((sum, r) => sum + parseFloat(r.paidAmount || 0), 0);
      const propertyTotalCharges = propertyCharges.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
      const propertyTotalWorks = propertyWorks.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
      const propertyRevenu = propertyTotalRents - propertyTotalCharges - propertyTotalWorks;

      propertiesData.push({
        property,
        totalRents: propertyTotalRents,
        totalCharges: propertyTotalCharges,
        totalWorks: propertyTotalWorks,
        revenu: propertyRevenu
      });
    }

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        recettes: {
          loyersBruts: totalRents,
          total: totalRents
        },
        fraisEtCharges: {
          byType: chargesByType,
          travaux: totalWorks,
          total: totalFraisEtCharges
        },
        revenu: {
          net: revenuNet,
          type: revenuNet >= 0 ? 'benefice' : 'deficit'
        },
        properties: propertiesData
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateFiscalDeclaration = async (req, res, next) => {
  try {
    const { year } = req.params;
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // Get all data
    const rents = await Rent.findAll({
      where: { year: parseInt(year) },
      include: [
        {
          model: Lease,
          include: [{ model: Property }]
        }
      ]
    });

    const charges = await Charge.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: Property }]
    });

    const works = await Work.findAll({
      where: {
        status: 'paye',
        paymentDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{ model: Property }]
    });

    const properties = await Property.findAll();

    // Generate PDF
    const pdfBuffer = await pdfService.generateFiscalDeclaration(
      year,
      properties,
      charges,
      works,
      rents
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=declaration-fiscale-${year}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const getChargesByProperty = async (req, res, next) => {
  try {
    const { year, propertyId } = req.query;
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const charges = await Charge.findAll({
      where: {
        propertyId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });

    const total = charges.reduce((sum, charge) => sum + parseFloat(charge.amount || 0), 0);

    res.json({
      success: true,
      data: {
        charges,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};
