import { Property, Lease, Tenant, PropertyRentHistory } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const getAll = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    const where = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const properties = await Property.findAll({
      where,
      include: [
        { model: Property, as: 'building' },
        { model: Property, as: 'apartments' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        { model: Property, as: 'building' },
        { model: Property, as: 'apartments' },
        {
          model: Lease,
          include: [{ model: Tenant }],
          order: [['createdAt', 'DESC']]
        },
        {
          model: PropertyRentHistory,
          as: 'rentHistory',
          order: [['startDate', 'DESC']]
        }
      ]
    });

    if (!property) {
      throw new AppError('Bien immobilier non trouvé', 404);
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      throw new AppError('Bien immobilier non trouvé', 404);
    }

    await property.update(req.body);

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const property = await Property.findByPk(req.params.id);

    if (!property) {
      throw new AppError('Bien immobilier non trouvé', 404);
    }

    await property.destroy();

    res.json({
      success: true,
      message: 'Bien immobilier supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const total = await Property.count();
    const available = await Property.count({ where: { status: 'disponible' } });
    const rented = await Property.count({ where: { status: 'loue' } });
    const inWork = await Property.count({ where: { status: 'en_travaux' } });

    res.json({
      success: true,
      data: {
        total,
        available,
        rented,
        inWork
      }
    });
  } catch (error) {
    next(error);
  }
};
