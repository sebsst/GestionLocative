import { Rent, Lease, Property, Tenant } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const getAll = async (req, res, next) => {
  try {
    const { year, month, status, leaseId } = req.query;
    const where = {};

    if (year) where.year = year;
    if (month) where.month = month;
    if (status) where.status = status;
    if (leaseId) where.leaseId = leaseId;

    const rents = await Rent.findAll({
      where,
      include: [
        {
          model: Lease,
          include: [
            { model: Property },
            { model: Tenant }
          ]
        }
      ],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({
      success: true,
      data: rents
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const rent = await Rent.findByPk(req.params.id, {
      include: [
        {
          model: Lease,
          include: [
            { model: Property },
            { model: Tenant }
          ]
        }
      ]
    });

    if (!rent) {
      throw new AppError('Loyer non trouvé', 404);
    }

    res.json({
      success: true,
      data: rent
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { leaseId, month, year } = req.body;

    // Check if rent already exists for this month/year
    const existingRent = await Rent.findOne({
      where: { leaseId, month, year }
    });

    if (existingRent) {
      throw new AppError('Un loyer existe déjà pour cette période', 400);
    }

    const rent = await Rent.create(req.body);

    res.status(201).json({
      success: true,
      data: rent
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const rent = await Rent.findByPk(req.params.id);

    if (!rent) {
      throw new AppError('Loyer non trouvé', 404);
    }

    await rent.update(req.body);

    res.json({
      success: true,
      data: rent
    });
  } catch (error) {
    next(error);
  }
};

export const markAsPaid = async (req, res, next) => {
  try {
    const { paidAmount, paymentDate, paymentMethod } = req.body;
    const rent = await Rent.findByPk(req.params.id);

    if (!rent) {
      throw new AppError('Loyer non trouvé', 404);
    }

    const status = paidAmount >= rent.expectedAmount ? 'paye' : 'partiel';

    await rent.update({
      paidAmount,
      paymentDate,
      paymentMethod,
      status
    });

    res.json({
      success: true,
      data: rent
    });
  } catch (error) {
    next(error);
  }
};

export const getLateRents = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const lateRents = await Rent.findAll({
      where: {
        status: { [Op.in]: ['en_attente', 'partiel'] },
        [Op.or]: [
          { year: { [Op.lt]: currentYear } },
          {
            year: currentYear,
            month: { [Op.lt]: currentMonth }
          }
        ]
      },
      include: [
        {
          model: Lease,
          include: [
            { model: Property },
            { model: Tenant }
          ]
        }
      ],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({
      success: true,
      data: lateRents
    });
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const rents = await Rent.findAll({
      where: { year: currentYear }
    });

    const totalExpected = rents.reduce((sum, rent) => sum + parseFloat(rent.expectedAmount), 0);
    const totalPaid = rents.reduce((sum, rent) => sum + parseFloat(rent.paidAmount), 0);
    const totalLate = rents.filter(r => r.status === 'en_retard' || r.status === 'en_attente').length;

    res.json({
      success: true,
      data: {
        year: currentYear,
        totalExpected,
        totalPaid,
        totalLate,
        collectionRate: totalExpected > 0 ? (totalPaid / totalExpected * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const generateMonthlyRents = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    // Get all active leases
    const leases = await Lease.findAll({
      where: { status: 'actif' }
    });

    const createdRents = [];

    for (const lease of leases) {
      // Check if rent already exists
      const existingRent = await Rent.findOne({
        where: { leaseId: lease.id, month, year }
      });

      if (!existingRent) {
        const rent = await Rent.create({
          leaseId: lease.id,
          month,
          year,
          expectedAmount: parseFloat(lease.rentAmount) + parseFloat(lease.chargesAmount),
          status: 'en_attente'
        });
        createdRents.push(rent);
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdRents.length} loyers générés pour ${month}/${year}`,
      data: createdRents
    });
  } catch (error) {
    next(error);
  }
};
