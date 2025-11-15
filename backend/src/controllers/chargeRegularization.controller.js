import {
  ChargeRegularization,
  ChargeRegularizationDetail,
  Lease,
  Tenant,
  Property,
  Rent,
  ChargeAllocation,
  LeaseRentPeriod,
  LeaseOccupancyPeriod
} from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Helper: Calculate number of days in a date range
 */
const getDaysInRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
};

/**
 * Helper: Get all rent periods active during a year
 */
const getRentPeriodsForYear = async (leaseId, year) => {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  const periods = await LeaseRentPeriod.findAll({
    where: {
      leaseId,
      [Op.or]: [
        {
          // Period starts before year end AND (has no end date OR ends after year start)
          startDate: { [Op.lte]: yearEnd },
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: yearStart } }
          ]
        }
      ]
    },
    order: [['startDate', 'ASC']]
  });

  return periods;
};

/**
 * Helper: Calculate pro-rata provisions based on rent periods
 */
const calculateProRataProvisions = (rentPeriods, year) => {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const totalDaysInYear = getDaysInRange(yearStart, yearEnd);

  let totalProvisions = 0;
  const periodBreakdown = [];

  for (const period of rentPeriods) {
    const periodStart = new Date(period.startDate);
    const periodEnd = period.endDate ? new Date(period.endDate) : yearEnd;

    // Determine the overlap with the year
    const overlapStart = periodStart > yearStart ? periodStart : yearStart;
    const overlapEnd = periodEnd < yearEnd ? periodEnd : yearEnd;

    const daysInPeriod = getDaysInRange(overlapStart, overlapEnd);
    const monthlyCharges = parseFloat(period.chargesAmount) || 0;

    // Calculate pro-rata based on days (assuming 30.42 days per month on average)
    const provisions = (monthlyCharges * daysInPeriod) / 30.42;

    totalProvisions += provisions;

    periodBreakdown.push({
      startDate: overlapStart.toISOString().split('T')[0],
      endDate: overlapEnd.toISOString().split('T')[0],
      days: daysInPeriod,
      monthlyCharges,
      provisions
    });
  }

  return { totalProvisions, periodBreakdown };
};

/**
 * Get all charge regularizations
 */
export const getAllRegularizations = async (req, res, next) => {
  try {
    const { year, leaseId, status } = req.query;

    const where = {};
    if (year) where.year = year;
    if (leaseId) where.leaseId = leaseId;
    if (status) where.status = status;

    const regularizations = await ChargeRegularization.findAll({
      where,
      include: [
        {
          model: Lease,
          include: [
            {
              model: Tenant,
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: Property,
              attributes: ['id', 'name', 'address']
            }
          ]
        },
        {
          model: ChargeRegularizationDetail,
          as: 'details'
        }
      ],
      order: [['year', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: regularizations
    });
  } catch (error) {
    console.error('Error fetching regularizations:', error);
    next(error);
  }
};

/**
 * Get regularization by ID
 */
export const getRegularizationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const regularization = await ChargeRegularization.findByPk(id, {
      include: [
        {
          model: Lease,
          include: [
            {
              model: Tenant,
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'civility']
            },
            {
              model: Property,
              attributes: ['id', 'name', 'address', 'postalCode', 'city']
            }
          ]
        },
        {
          model: ChargeRegularizationDetail,
          as: 'details'
        }
      ]
    });

    if (!regularization) {
      return res.status(404).json({
        success: false,
        error: { message: 'Régularisation non trouvée' }
      });
    }

    res.json({
      success: true,
      data: regularization
    });
  } catch (error) {
    console.error('Error fetching regularization:', error);
    next(error);
  }
};

/**
 * Calculate regularization for a lease and year
 */
export const calculateRegularization = async (req, res, next) => {
  try {
    const { leaseId, year } = req.body;

    if (!leaseId || !year) {
      return res.status(400).json({
        success: false,
        error: { message: 'Lease ID et année sont requis' }
      });
    }

    const lease = await Lease.findByPk(leaseId, {
      include: [
        { model: Tenant },
        { model: Property }
      ]
    });

    if (!lease) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bail non trouvé' }
      });
    }

    // Définir la période de régularisation
    const periodStart = `${year}-01-01`;
    const periodEnd = `${year}-12-31`;

    // Get rent periods for the year to calculate pro-rata provisions
    const rentPeriods = await getRentPeriodsForYear(leaseId, year);

    let totalProvisions = 0;
    let provisionsPeriodBreakdown = [];

    if (rentPeriods.length > 0) {
      // Use pro-rata calculation based on rent periods
      const proRataResult = calculateProRataProvisions(rentPeriods, year);
      totalProvisions = proRataResult.totalProvisions;
      provisionsPeriodBreakdown = proRataResult.periodBreakdown;
    } else {
      // Fallback: use actual paid rents
      const rents = await Rent.findAll({
        where: {
          leaseId,
          year,
          status: 'paye'
        }
      });

      totalProvisions = rents.reduce((sum, rent) => {
        return sum + (parseFloat(rent.chargeProvisions) || 0);
      }, 0);
    }

    // Calculer les charges réelles allouées au locataire
    const chargeAllocations = await ChargeAllocation.findAll({
      where: {
        leaseId,
        createdAt: {
          [Op.between]: [periodStart, periodEnd]
        }
      }
    });

    // Grouper les charges par type
    const chargesByType = {};
    let totalRealCharges = 0;

    for (const allocation of chargeAllocations) {
      const amount = parseFloat(allocation.amount) || 0;
      const chargeType = allocation.chargeType || 'autre';
      const chargeName = allocation.chargeName || 'Charge';

      if (!chargesByType[chargeType]) {
        chargesByType[chargeType] = {
          type: chargeType,
          name: chargeName,
          realAmount: 0
        };
      }

      chargesByType[chargeType].realAmount += amount;
      totalRealCharges += amount;
    }

    // Calculer la régularisation
    const regularizationAmount = totalRealCharges - totalProvisions;

    // Créer les détails
    const details = Object.values(chargesByType).map(charge => ({
      chargeType: charge.type,
      chargeName: charge.name,
      provisions: 0, // À répartir proportionnellement
      realAmount: charge.realAmount,
      difference: charge.realAmount
    }));

    // Répartir les provisions proportionnellement
    if (totalRealCharges > 0) {
      details.forEach(detail => {
        detail.provisions = (detail.realAmount / totalRealCharges) * totalProvisions;
        detail.difference = detail.realAmount - detail.provisions;
      });
    }

    res.json({
      success: true,
      data: {
        leaseId,
        year,
        periodStart,
        periodEnd,
        totalProvisions,
        totalRealCharges,
        regularizationAmount,
        details,
        provisionsPeriodBreakdown, // Include breakdown for transparency
        usedProRata: rentPeriods.length > 0
      }
    });
  } catch (error) {
    console.error('Error calculating regularization:', error);
    next(error);
  }
};

/**
 * Create a new regularization
 */
export const createRegularization = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const {
      leaseId,
      year,
      periodStart,
      periodEnd,
      totalProvisions,
      totalRealCharges,
      regularizationAmount,
      details,
      notes
    } = req.body;

    // Create regularization
    const regularization = await ChargeRegularization.create({
      leaseId,
      year,
      periodStart,
      periodEnd,
      totalProvisions,
      totalRealCharges,
      regularizationAmount,
      notes,
      status: 'draft'
    }, { transaction: t });

    // Create details
    if (details && details.length > 0) {
      const detailsToCreate = details.map(detail => ({
        regularizationId: regularization.id,
        chargeType: detail.chargeType,
        chargeName: detail.chargeName,
        provisions: detail.provisions,
        realAmount: detail.realAmount,
        difference: detail.difference
      }));

      await ChargeRegularizationDetail.bulkCreate(detailsToCreate, { transaction: t });
    }

    await t.commit();

    // Fetch complete regularization
    const created = await ChargeRegularization.findByPk(regularization.id, {
      include: [
        {
          model: Lease,
          include: [Tenant, Property]
        },
        {
          model: ChargeRegularizationDetail,
          as: 'details'
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: created
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating regularization:', error);
    next(error);
  }
};

/**
 * Update regularization
 */
export const updateRegularization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, sentDate, paidDate, notes } = req.body;

    const regularization = await ChargeRegularization.findByPk(id);

    if (!regularization) {
      return res.status(404).json({
        success: false,
        error: { message: 'Régularisation non trouvée' }
      });
    }

    await regularization.update({
      status: status || regularization.status,
      sentDate: sentDate !== undefined ? sentDate : regularization.sentDate,
      paidDate: paidDate !== undefined ? paidDate : regularization.paidDate,
      notes: notes !== undefined ? notes : regularization.notes
    });

    const updated = await ChargeRegularization.findByPk(id, {
      include: [
        {
          model: Lease,
          include: [Tenant, Property]
        },
        {
          model: ChargeRegularizationDetail,
          as: 'details'
        }
      ]
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating regularization:', error);
    next(error);
  }
};

/**
 * Delete regularization
 */
export const deleteRegularization = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const regularization = await ChargeRegularization.findByPk(id);

    if (!regularization) {
      return res.status(404).json({
        success: false,
        error: { message: 'Régularisation non trouvée' }
      });
    }

    // Delete details first
    await ChargeRegularizationDetail.destroy({
      where: { regularizationId: id },
      transaction: t
    });

    // Delete regularization
    await regularization.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Régularisation supprimée avec succès'
    });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting regularization:', error);
    next(error);
  }
};

/**
 * Get regularization statistics
 */
export const getRegularizationStats = async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const where = { year: currentYear };

    const stats = await ChargeRegularization.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('totalProvisions')), 'totalProvisions'],
        [sequelize.fn('SUM', sequelize.col('totalRealCharges')), 'totalRealCharges'],
        [sequelize.fn('SUM', sequelize.col('regularizationAmount')), 'totalRegularization'],
        'status'
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        year: currentYear,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    next(error);
  }
};
