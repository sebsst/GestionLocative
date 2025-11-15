import { Charge, ChargeDistribution, Property, Lease, Tenant } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const getAll = async (req, res, next) => {
  try {
    const { propertyId, type, year } = req.query;
    const where = {};

    if (propertyId) where.propertyId = propertyId;
    if (type) where.type = type;
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const charges = await Charge.findAll({
      where,
      include: [
        { model: Property },
        {
          model: ChargeDistribution,
          as: 'distributions',
          include: [{ model: Property }]
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: charges
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const charge = await Charge.findByPk(req.params.id, {
      include: [
        { model: Property },
        {
          model: ChargeDistribution,
          as: 'distributions',
          include: [{ model: Property }]
        }
      ]
    });

    if (!charge) {
      throw new AppError('Charge non trouvée', 404);
    }

    res.json({
      success: true,
      data: charge
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { distributions, ...chargeData } = req.body;

    // Log pour debug
    console.log('📝 Données reçues pour création de charge:', JSON.stringify(chargeData, null, 2));

    const charge = await Charge.create(chargeData, { transaction: t });

    // If it's a common charge, distribute it
    if (charge.isCommon && distributions && distributions.length > 0) {
      await distributeCharge(charge, distributions, t);
    }

    await t.commit();

    const createdCharge = await Charge.findByPk(charge.id, {
      include: [
        { model: Property },
        {
          model: ChargeDistribution,
          as: 'distributions',
          include: [{ model: Property }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdCharge
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const charge = await Charge.findByPk(req.params.id);

    if (!charge) {
      throw new AppError('Charge non trouvée', 404);
    }

    await charge.update(req.body);

    res.json({
      success: true,
      data: charge
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const charge = await Charge.findByPk(req.params.id);

    if (!charge) {
      throw new AppError('Charge non trouvée', 404);
    }

    await charge.destroy();

    res.json({
      success: true,
      message: 'Charge supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const distributeChargeManually = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const charge = await Charge.findByPk(req.params.id);

    if (!charge) {
      throw new AppError('Charge non trouvée', 404);
    }

    if (!charge.isCommon) {
      throw new AppError('Cette charge n\'est pas une charge commune', 400);
    }

    const { distributions } = req.body;

    // Delete existing distributions
    await ChargeDistribution.destroy({
      where: { chargeId: charge.id },
      transaction: t
    });

    // Create new distributions
    await distributeCharge(charge, distributions, t);

    await t.commit();

    const updatedCharge = await Charge.findByPk(charge.id, {
      include: [
        {
          model: ChargeDistribution,
          as: 'distributions',
          include: [{ model: Property }]
        }
      ]
    });

    res.json({
      success: true,
      data: updatedCharge
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const autoDistributeCharge = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const charge = await Charge.findByPk(req.params.id);

    if (!charge) {
      throw new AppError('Charge non trouvée', 404);
    }

    if (!charge.isCommon) {
      throw new AppError('Cette charge n\'est pas une charge commune', 400);
    }

    // Get the building
    const building = await Property.findByPk(charge.propertyId, {
      include: [{ model: Property, as: 'apartments' }]
    });

    if (!building || building.type !== 'immeuble') {
      throw new AppError('La propriété doit être un immeuble pour la distribution automatique', 400);
    }

    const apartments = building.apartments;

    if (!apartments || apartments.length === 0) {
      throw new AppError('Aucun appartement trouvé dans cet immeuble', 400);
    }

    // Delete existing distributions
    await ChargeDistribution.destroy({
      where: { chargeId: charge.id },
      transaction: t
    });

    // Calculate distribution based on method
    const distributions = calculateDistribution(charge, apartments);

    // Create distributions
    await distributeCharge(charge, distributions, t);

    await t.commit();

    const updatedCharge = await Charge.findByPk(charge.id, {
      include: [
        {
          model: ChargeDistribution,
          as: 'distributions',
          include: [{ model: Property }]
        }
      ]
    });

    res.json({
      success: true,
      data: updatedCharge
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Helper functions
const distributeCharge = async (charge, distributions, transaction) => {
  const distributionPromises = distributions.map(dist =>
    ChargeDistribution.create({
      chargeId: charge.id,
      propertyId: dist.propertyId,
      amount: dist.amount,
      percentage: dist.percentage
    }, { transaction })
  );

  await Promise.all(distributionPromises);
};

const calculateDistribution = (charge, apartments) => {
  const method = charge.distributionMethod;
  const totalAmount = parseFloat(charge.amount);

  switch (method) {
    case 'surface':
      const totalSurface = apartments.reduce((sum, apt) => sum + parseFloat(apt.surface || 0), 0);
      return apartments.map(apt => {
        const percentage = (parseFloat(apt.surface || 0) / totalSurface) * 100;
        return {
          propertyId: apt.id,
          amount: (totalAmount * percentage / 100).toFixed(2),
          percentage: percentage.toFixed(2)
        };
      });

    case 'appartement':
      const amountPerApartment = totalAmount / apartments.length;
      return apartments.map(apt => ({
        propertyId: apt.id,
        amount: amountPerApartment.toFixed(2),
        percentage: (100 / apartments.length).toFixed(2)
      }));

    case 'occupants':
      // This would require lease information, simplified for now
      const amountPerUnit = totalAmount / apartments.length;
      return apartments.map(apt => ({
        propertyId: apt.id,
        amount: amountPerUnit.toFixed(2),
        percentage: (100 / apartments.length).toFixed(2)
      }));

    default:
      throw new AppError('Méthode de distribution non valide', 400);
  }
};

// New distribution management functions
export const saveDistributions = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const charge = await Charge.findByPk(req.params.id);

    if (!charge) {
      throw new AppError('Charge non trouvée', 404);
    }

    const { method, distributions } = req.body;

    // Update charge distributionMethod
    if (method) {
      await charge.update({
        distributionMethod: method === 'par_occupant' ? 'occupants'
          : method === 'par_appartement' ? 'appartement'
          : method === 'par_jours' ? 'personnalise'
          : null
      }, { transaction: t });
    }

    // Delete existing distributions for this charge
    await ChargeDistribution.destroy({
      where: { chargeId: charge.id },
      transaction: t
    });

    // Create new distributions
    if (distributions && distributions.length > 0) {
      const distributionData = distributions.map(dist => ({
        chargeId: charge.id,
        leaseId: dist.leaseId,
        propertyId: dist.propertyId || null,
        allocationMethod: method,
        amount: parseFloat(dist.amount),
        occupantsCount: dist.occupantsCount || null,
        daysOccupied: dist.daysOccupied || null,
        coefficient: dist.coefficient || null
      }));

      await ChargeDistribution.bulkCreate(distributionData, { transaction: t });
    }

    await t.commit();

    // Reload charge with distributions
    const updatedCharge = await Charge.findByPk(charge.id, {
      include: [
        { model: Property },
        {
          model: ChargeDistribution,
          as: 'distributions',
          include: [
            { model: Property },
            {
              model: Lease,
              include: [
                { model: Tenant },
                { model: Property }
              ]
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: updatedCharge
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteDistributions = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const charge = await Charge.findByPk(req.params.id);

    if (!charge) {
      throw new AppError('Charge non trouvée', 404);
    }

    // Reset distributionMethod
    await charge.update({
      distributionMethod: null
    }, { transaction: t });

    await ChargeDistribution.destroy({
      where: { chargeId: charge.id },
      transaction: t
    });

    await t.commit();

    res.json({
      success: true,
      message: 'Distributions supprimées avec succès'
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getDistributions = async (req, res, next) => {
  try {
    const distributions = await ChargeDistribution.findAll({
      where: { chargeId: req.params.id },
      include: [
        { model: Property },
        {
          model: Lease,
          include: [
            { model: Tenant },
            { model: Property }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: distributions
    });
  } catch (error) {
    next(error);
  }
};
