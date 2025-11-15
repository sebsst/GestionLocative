import { ChargeAllocation, Charge, Lease, Tenant, Property } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const getAll = async (req, res, next) => {
  try {
    const { year, type, propertyId } = req.query;
    const where = {};
    const chargeWhere = {};

    // Filtrer les charges par année
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      chargeWhere.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Filtrer par type de charge
    if (type) {
      chargeWhere.type = type;
    }

    // Filtrer par bien (via le bail)
    const leaseInclude = {
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
    };

    if (propertyId) {
      leaseInclude.where = { propertyId };
    }

    const allocations = await ChargeAllocation.findAll({
      where,
      include: [
        {
          model: Charge,
          where: chargeWhere,
          include: [
            {
              model: Property,
              attributes: ['id', 'name', 'address']
            }
          ]
        },
        leaseInclude
      ],
      order: [[Charge, 'date', 'DESC']]
    });

    res.json({
      success: true,
      data: allocations
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const allocation = await ChargeAllocation.findByPk(req.params.id, {
      include: [
        {
          model: Charge,
          include: [{ model: Property }]
        },
        {
          model: Lease,
          include: [
            { model: Tenant },
            { model: Property }
          ]
        }
      ]
    });

    if (!allocation) {
      throw new AppError('Allocation non trouvée', 404);
    }

    res.json({
      success: true,
      data: allocation
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const allocation = await ChargeAllocation.create(req.body);

    const createdAllocation = await ChargeAllocation.findByPk(allocation.id, {
      include: [
        {
          model: Charge,
          include: [{ model: Property }]
        },
        {
          model: Lease,
          include: [
            { model: Tenant },
            { model: Property }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdAllocation
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const allocation = await ChargeAllocation.findByPk(req.params.id);

    if (!allocation) {
      throw new AppError('Allocation non trouvée', 404);
    }

    await allocation.update(req.body);

    const updatedAllocation = await ChargeAllocation.findByPk(allocation.id, {
      include: [
        {
          model: Charge,
          include: [{ model: Property }]
        },
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
      data: updatedAllocation
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const allocation = await ChargeAllocation.findByPk(req.params.id);

    if (!allocation) {
      throw new AppError('Allocation non trouvée', 404);
    }

    await allocation.destroy();

    res.json({
      success: true,
      message: 'Allocation supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les allocations pour une charge spécifique
export const getByChargeId = async (req, res, next) => {
  try {
    const allocations = await ChargeAllocation.findAll({
      where: { chargeId: req.params.chargeId },
      include: [
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
      data: allocations
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les allocations pour un bail spécifique
export const getByLeaseId = async (req, res, next) => {
  try {
    const allocations = await ChargeAllocation.findAll({
      where: { leaseId: req.params.leaseId },
      include: [
        {
          model: Charge,
          include: [{ model: Property }]
        }
      ],
      order: [[Charge, 'date', 'DESC']]
    });

    res.json({
      success: true,
      data: allocations
    });
  } catch (error) {
    next(error);
  }
};
