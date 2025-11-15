import { LeaseOccupancyPeriod, Lease } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getByLeaseId = async (req, res, next) => {
  try {
    const periods = await LeaseOccupancyPeriod.findAll({
      where: { leaseId: req.params.leaseId },
      order: [['startDate', 'ASC']],
      include: [{
        model: Lease,
        attributes: ['id', 'startDate', 'endDate']
      }]
    });

    res.json({
      success: true,
      data: periods
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentPeriod = async (req, res, next) => {
  try {
    const currentDate = new Date();

    const period = await LeaseOccupancyPeriod.findOne({
      where: {
        leaseId: req.params.leaseId,
        startDate: { [Op.lte]: currentDate },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: currentDate } }
        ]
      },
      order: [['startDate', 'DESC']],
      include: [{
        model: Lease,
        attributes: ['id', 'startDate', 'endDate']
      }]
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        message: 'Aucune période d\'occupation active trouvée'
      });
    }

    res.json({
      success: true,
      data: period
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { leaseId, startDate, endDate, numberOfOccupants } = req.body;

    // Validation
    if (!leaseId || !startDate || !numberOfOccupants) {
      return res.status(400).json({
        success: false,
        message: 'leaseId, startDate et numberOfOccupants sont requis'
      });
    }

    // Verify lease exists
    const lease = await Lease.findByPk(leaseId);
    if (!lease) {
      return res.status(404).json({
        success: false,
        message: 'Bail non trouvé'
      });
    }

    // Check for overlapping periods
    const overlappingPeriods = await LeaseOccupancyPeriod.findAll({
      where: { leaseId },
      transaction: t
    });

    const newStart = new Date(startDate);
    const newEnd = endDate ? new Date(endDate) : null;

    for (const period of overlappingPeriods) {
      const periodStart = new Date(period.startDate);
      const periodEnd = period.endDate ? new Date(period.endDate) : null;

      // Check for overlap
      const startsBeforePeriodEnds = !periodEnd || newStart <= periodEnd;
      const endsAfterPeriodStarts = !newEnd || newEnd >= periodStart;

      if (startsBeforePeriodEnds && endsAfterPeriodStarts) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Cette période chevauche une période existante'
        });
      }
    }

    const period = await LeaseOccupancyPeriod.create({
      leaseId,
      startDate,
      endDate: endDate || null,
      numberOfOccupants
    }, { transaction: t });

    await t.commit();

    const createdPeriod = await LeaseOccupancyPeriod.findByPk(period.id, {
      include: [{
        model: Lease,
        attributes: ['id', 'startDate', 'endDate']
      }]
    });

    res.status(201).json({
      success: true,
      data: createdPeriod
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const update = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const period = await LeaseOccupancyPeriod.findByPk(req.params.id, { transaction: t });

    if (!period) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    const { startDate, endDate, numberOfOccupants } = req.body;

    // Check for overlapping periods (excluding current period)
    if (startDate || endDate !== undefined) {
      const overlappingPeriods = await LeaseOccupancyPeriod.findAll({
        where: {
          leaseId: period.leaseId
        },
        transaction: t
      });

      const newStart = startDate ? new Date(startDate) : new Date(period.startDate);
      const newEnd = endDate !== undefined ? (endDate ? new Date(endDate) : null) : (period.endDate ? new Date(period.endDate) : null);

      for (const otherPeriod of overlappingPeriods) {
        if (otherPeriod.id === period.id) continue; // Skip self

        const periodStart = new Date(otherPeriod.startDate);
        const periodEnd = otherPeriod.endDate ? new Date(otherPeriod.endDate) : null;

        const startsBeforePeriodEnds = !periodEnd || newStart <= periodEnd;
        const endsAfterPeriodStarts = !newEnd || newEnd >= periodStart;

        if (startsBeforePeriodEnds && endsAfterPeriodStarts) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: 'Cette période chevauche une période existante'
          });
        }
      }
    }

    await period.update({
      startDate: startDate || period.startDate,
      endDate: endDate !== undefined ? endDate : period.endDate,
      numberOfOccupants: numberOfOccupants || period.numberOfOccupants
    }, { transaction: t });

    await t.commit();

    const updatedPeriod = await LeaseOccupancyPeriod.findByPk(period.id, {
      include: [{
        model: Lease,
        attributes: ['id', 'startDate', 'endDate']
      }]
    });

    res.json({
      success: true,
      data: updatedPeriod
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const remove = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const period = await LeaseOccupancyPeriod.findByPk(req.params.id, { transaction: t });

    if (!period) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    await period.destroy({ transaction: t });
    await t.commit();

    res.json({
      success: true,
      message: 'Période supprimée avec succès'
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
