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
    const result = await calculateDistribution(charge, apartments);
    const distributions = result.distributions || result;
    const calculationDetails = result.calculationDetails;

    // Create distributions
    await distributeCharge(charge, distributions, t);

    // Store calculation details in charge metadata if available
    if (calculationDetails) {
      await charge.update({
        metadata: calculationDetails
      }, { transaction: t });
    }

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

const calculateDistribution = async (charge, apartments) => {
  const method = charge.distributionMethod;
  const totalAmount = parseFloat(charge.amount);

  switch (method) {
    case 'surface':
      const totalSurface = apartments.reduce((sum, apt) => sum + parseFloat(apt.surface || 0), 0);
      return {
        distributions: apartments.map(apt => {
          const percentage = (parseFloat(apt.surface || 0) / totalSurface) * 100;
          return {
            propertyId: apt.id,
            amount: (totalAmount * percentage / 100).toFixed(2),
            percentage: percentage.toFixed(2)
          };
        }),
        calculationDetails: null
      };

    case 'appartement':
      // Import dynamically to avoid circular dependency
      const { LeaseOccupancyPeriod, Lease } = await import('../models/index.js');


      // Get charge date to determine the year
      const chargeDate = new Date(charge.date);
      const chargeYear = chargeDate.getFullYear();
      const yearStart = new Date(chargeYear, 0, 1);
      const yearEnd = new Date(chargeYear, 11, 31);

      // Calculate weighted units for each apartment
      const apartmentDetails = await Promise.all(apartments.map(async (apt) => {
        // Find active leases for this apartment during the charge year
        const leases = await Lease.findAll({
          where: {
            propertyId: apt.id,
            [Op.or]: [
              {
                startDate: { [Op.lte]: yearEnd },
                [Op.or]: [
                  { endDate: null },
                  { endDate: { [Op.gte]: yearStart } }
                ]
              }
            ]
          }
        });

        let totalWeightedDays = 0;
        const periods = [];

        for (const lease of leases) {
          // Get occupancy periods for this lease during the year
          const occupancyPeriods = await LeaseOccupancyPeriod.findAll({
            where: {
              leaseId: lease.id,
              [Op.or]: [
                {
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

          for (const period of occupancyPeriods) {
            const periodStart = new Date(period.startDate);
            const periodEnd = period.endDate ? new Date(period.endDate) : yearEnd;

            // Calculate overlap with the year
            const overlapStart = periodStart > yearStart ? periodStart : yearStart;
            const overlapEnd = periodEnd < yearEnd ? periodEnd : yearEnd;

            // Calculate days in this period
            const diffTime = Math.abs(overlapEnd - overlapStart);
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // Weight = days × number of occupants
            const occupants = period.numberOfOccupants || 1;
            const weight = days * occupants;
            totalWeightedDays += weight;

            periods.push({
              startDate: overlapStart.toISOString().split('T')[0],
              endDate: overlapEnd.toISOString().split('T')[0],
              days,
              occupants,
              weight
            });
          }
        }

        return {
          propertyId: apt.id,
          propertyName: apt.name || apt.address,
          weight: totalWeightedDays,
          periods
        };
      }));

      // Calculate total weight
      const totalWeight = apartmentDetails.reduce((sum, apt) => sum + apt.weight, 0);

      // Distribute based on weights
      if (totalWeight === 0) {
        // Fallback to equal distribution if no occupancy data
        const amountPerApartment = totalAmount / apartments.length;
        return {
          distributions: apartments.map(apt => ({
            propertyId: apt.id,
            amount: amountPerApartment.toFixed(2),
            percentage: (100 / apartments.length).toFixed(2)
          })),
          calculationDetails: {
            method: 'appartement',
            year: chargeYear,
            totalAmount,
            totalWeight: 0,
            apartments: apartmentDetails,
            note: 'Aucune donnée d\'occupation trouvée, répartition égale appliquée'
          }
        };
      }

      return {
        distributions: apartmentDetails.map(apt => {
          const percentage = (apt.weight / totalWeight) * 100;
          return {
            propertyId: apt.propertyId,
            amount: (totalAmount * percentage / 100).toFixed(2),
            percentage: percentage.toFixed(2)
          };
        }),
        calculationDetails: {
          method: 'appartement',
          year: chargeYear,
          totalAmount,
          totalWeight,
          apartments: apartmentDetails
        }
      };

    case 'occupants':
      // This would require lease information, simplified for now
      const amountPerUnit = totalAmount / apartments.length;
      return {
        distributions: apartments.map(apt => ({
          propertyId: apt.id,
          amount: amountPerUnit.toFixed(2),
          percentage: (100 / apartments.length).toFixed(2)
        })),
        calculationDetails: null
      };

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

export const getCalculationDetails = async (req, res, next) => {
  try {
    const charge = await Charge.findByPk(req.params.id);

    if (!charge) {
      throw new AppError('Charge non trouvée', 404);
    }

    res.json({
      success: true,
      data: charge.metadata || null
    });
  } catch (error) {
    next(error);
  }
};
