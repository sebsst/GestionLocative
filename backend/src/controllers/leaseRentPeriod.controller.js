import { LeaseRentPeriod, Lease } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

/**
 * Get all rent periods for a lease
 */
export const getAll = async (req, res, next) => {
  try {
    const { leaseId } = req.query;
    const where = {};

    if (leaseId) where.leaseId = leaseId;

    const periods = await LeaseRentPeriod.findAll({
      where,
      include: [{ model: Lease }],
      order: [['startDate', 'DESC']]
    });

    res.json({
      success: true,
      data: periods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current rent period for a lease
 */
export const getCurrentPeriod = async (req, res, next) => {
  try {
    const { leaseId } = req.params;
    const currentDate = new Date();

    const period = await LeaseRentPeriod.findOne({
      where: {
        leaseId,
        startDate: { [Op.lte]: currentDate },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: currentDate } }
        ]
      },
      order: [['startDate', 'DESC']]
    });

    if (!period) {
      throw new AppError('Aucune période de loyer active trouvée', 404);
    }

    res.json({
      success: true,
      data: period
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rent history for a lease
 */
export const getHistory = async (req, res, next) => {
  try {
    const { leaseId } = req.params;

    const periods = await LeaseRentPeriod.findAll({
      where: { leaseId },
      order: [['startDate', 'ASC']]
    });

    res.json({
      success: true,
      data: periods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new rent period
 */
export const create = async (req, res, next) => {
  try {
    const { leaseId, startDate, rentAmount, chargesAmount, changeReason, irlIndex, irlQuarter, notes } = req.body;

    // Verify lease exists
    const lease = await Lease.findByPk(leaseId);
    if (!lease) {
      throw new AppError('Bail non trouvé', 404);
    }

    // Check if there's a current active period
    const currentPeriod = await LeaseRentPeriod.findOne({
      where: {
        leaseId,
        endDate: null
      }
    });

    // If there's an active period, close it
    if (currentPeriod) {
      const newStartDate = new Date(startDate);
      const previousEndDate = new Date(newStartDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);

      await currentPeriod.update({
        endDate: previousEndDate
      });
    }

    // Create new period
    const period = await LeaseRentPeriod.create({
      leaseId,
      startDate,
      endDate: null,
      rentAmount,
      chargesAmount,
      totalAmount: parseFloat(rentAmount) + parseFloat(chargesAmount),
      changeReason,
      irlIndex,
      irlQuarter,
      notes
    });

    res.status(201).json({
      success: true,
      data: period
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing rent period
 */
export const update = async (req, res, next) => {
  try {
    const period = await LeaseRentPeriod.findByPk(req.params.id);

    if (!period) {
      throw new AppError('Période de loyer non trouvée', 404);
    }

    await period.update(req.body);

    res.json({
      success: true,
      data: period
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a rent period
 */
export const remove = async (req, res, next) => {
  try {
    const period = await LeaseRentPeriod.findByPk(req.params.id);

    if (!period) {
      throw new AppError('Période de loyer non trouvée', 404);
    }

    // Don't allow deleting if it's the only period
    const periodCount = await LeaseRentPeriod.count({
      where: { leaseId: period.leaseId }
    });

    if (periodCount === 1) {
      throw new AppError('Impossible de supprimer la seule période de loyer du bail', 400);
    }

    await period.destroy();

    res.json({
      success: true,
      message: 'Période de loyer supprimée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate IRL revision for a lease
 */
export const calculateIRLRevision = async (req, res, next) => {
  try {
    const { leaseId, newIrlIndex, irlQuarter, revisionDate } = req.body;

    // Get current period
    const currentPeriod = await LeaseRentPeriod.findOne({
      where: {
        leaseId,
        endDate: null
      }
    });

    if (!currentPeriod) {
      throw new AppError('Aucune période active trouvée', 404);
    }

    // Get the IRL index from the previous revision
    const previousIrlIndex = currentPeriod.irlIndex;

    if (!previousIrlIndex) {
      throw new AppError('Aucun indice IRL précédent trouvé. Veuillez le renseigner manuellement.', 400);
    }

    // Calculate new rent amount
    const irlIncrease = newIrlIndex / previousIrlIndex;
    const newRentAmount = (parseFloat(currentPeriod.rentAmount) * irlIncrease).toFixed(2);

    res.json({
      success: true,
      data: {
        currentRentAmount: currentPeriod.rentAmount,
        currentChargesAmount: currentPeriod.chargesAmount,
        currentTotalAmount: currentPeriod.totalAmount,
        previousIrlIndex,
        newIrlIndex,
        irlIncrease: ((irlIncrease - 1) * 100).toFixed(2) + '%',
        newRentAmount,
        newChargesAmount: currentPeriod.chargesAmount,
        newTotalAmount: (parseFloat(newRentAmount) + parseFloat(currentPeriod.chargesAmount)).toFixed(2),
        suggestedStartDate: revisionDate || new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};
