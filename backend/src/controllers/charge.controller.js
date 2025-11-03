import { Charge, ChargeDistribution, Property } from '../models/index.js';
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
