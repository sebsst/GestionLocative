import { Tenant, Lease, Property, Communication } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    const userId = req.userId;
    const where = { userId }; // Filter by userId

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const tenants = await Tenant.findAll({
      where,
      include: [
        {
          model: Lease,
          include: [{ model: Property }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: tenants
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const userId = req.userId;

    const tenant = await Tenant.findOne({
      where: {
        id: req.params.id,
        userId // Only get tenant if owned by user
      },
      include: [
        {
          model: Lease,
          include: [{ model: Property }]
        },
        {
          model: Communication,
          order: [['date', 'DESC']]
        }
      ]
    });

    if (!tenant) {
      throw new AppError('Locataire non trouvé', 404);
    }

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Add userId to tenant data
    const tenantData = {
      ...req.body,
      userId
    };

    const tenant = await Tenant.create(tenantData);

    res.status(201).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const userId = req.userId;

    const tenant = await Tenant.findOne({
      where: {
        id: req.params.id,
        userId // Only update if owned by user
      }
    });

    if (!tenant) {
      throw new AppError('Locataire non trouvé ou non autorisé', 404);
    }

    await tenant.update(req.body);

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const userId = req.userId;

    const tenant = await Tenant.findOne({
      where: {
        id: req.params.id,
        userId // Only delete if owned by user
      }
    });

    if (!tenant) {
      throw new AppError('Locataire non trouvé ou non autorisé', 404);
    }

    await tenant.destroy();

    res.json({
      success: true,
      message: 'Locataire supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const addCommunication = async (req, res, next) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      throw new AppError('Locataire non trouvé', 404);
    }

    const communication = await Communication.create({
      ...req.body,
      tenantId: req.params.id
    });

    res.status(201).json({
      success: true,
      data: communication
    });
  } catch (error) {
    next(error);
  }
};

export const getCommunications = async (req, res, next) => {
  try {
    const communications = await Communication.findAll({
      where: { tenantId: req.params.id },
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: communications
    });
  } catch (error) {
    next(error);
  }
};
