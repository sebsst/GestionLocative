import { Property, Lease, Tenant, PropertyRentHistory, UserPropertyAccess, User } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';
import { getAccessibleProperties, canEditProperty, canDeleteProperty } from '../utils/permissions.js';

export const getAll = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    const userId = req.userId;

    // Get all accessible properties (owned + shared)
    const accessibleProps = await getAccessibleProperties(userId);

    // Apply filters
    let filteredProperties = accessibleProps.all;

    if (type) {
      filteredProperties = filteredProperties.filter(p => p.type === type);
    }
    if (status) {
      filteredProperties = filteredProperties.filter(p => p.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProperties = filteredProperties.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.address?.toLowerCase().includes(searchLower) ||
        p.city?.toLowerCase().includes(searchLower)
      );
    }

    // Load relationships for filtered properties
    const propertyIds = filteredProperties.map(p => p.id);
    const propertiesWithRelations = await Property.findAll({
      where: { id: { [Op.in]: propertyIds } },
      include: [
        { model: Property, as: 'building' },
        { model: Property, as: 'apartments' },
        { model: User, as: 'owner', attributes: ['id', 'email', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add access info to properties
    const enrichedProperties = propertiesWithRelations.map(prop => {
      const accessInfo = filteredProperties.find(p => p.id === prop.id);
      return {
        ...prop.toJSON(),
        isShared: accessInfo?.isShared || false,
        accessRole: accessInfo?.accessRole,
        canEdit: accessInfo?.canEdit !== undefined ? accessInfo.canEdit : (prop.userId === userId),
        canDelete: accessInfo?.canDelete !== undefined ? accessInfo.canDelete : (prop.userId === userId),
        canInvite: accessInfo?.canInvite !== undefined ? accessInfo.canInvite : (prop.userId === userId)
      };
    });

    res.json({
      success: true,
      data: enrichedProperties
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const userId = req.userId;
    const propertyId = req.params.id;

    const property = await Property.findByPk(propertyId, {
      include: [
        { model: Property, as: 'building' },
        { model: Property, as: 'apartments' },
        { model: User, as: 'owner', attributes: ['id', 'email', 'firstName', 'lastName'] },
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

    // Check if user has access
    const isOwner = property.userId === userId;
    let accessInfo = null;

    if (!isOwner) {
      accessInfo = await UserPropertyAccess.findOne({
        where: {
          userId,
          propertyId,
          isActive: true
        }
      });

      if (!accessInfo) {
        throw new AppError('Vous n\'avez pas accès à ce bien', 403);
      }
    }

    // Add access permissions to response
    const propertyData = {
      ...property.toJSON(),
      isShared: !isOwner,
      accessRole: isOwner ? 'owner' : accessInfo?.role,
      canEdit: isOwner || accessInfo?.canEdit,
      canDelete: isOwner || accessInfo?.canDelete,
      canInvite: isOwner || accessInfo?.canInvite
    };

    res.json({
      success: true,
      data: propertyData
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Add userId to property data
    const propertyData = {
      ...req.body,
      userId
    };

    const property = await Property.create(propertyData);

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
    const userId = req.userId;
    const propertyId = req.params.id;

    const property = await Property.findByPk(propertyId);

    if (!property) {
      throw new AppError('Bien immobilier non trouvé', 404);
    }

    // Check if user can edit this property
    const canEdit = await canEditProperty(userId, propertyId);
    if (!canEdit) {
      throw new AppError('Vous n\'avez pas la permission de modifier ce bien', 403);
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
    const userId = req.userId;
    const propertyId = req.params.id;

    const property = await Property.findByPk(propertyId);

    if (!property) {
      throw new AppError('Bien immobilier non trouvé', 404);
    }

    // Check if user can delete this property
    const canDelete = await canDeleteProperty(userId, propertyId);
    if (!canDelete) {
      throw new AppError('Vous n\'avez pas la permission de supprimer ce bien', 403);
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
    const userId = req.userId;

    // Get accessible properties
    const accessibleProps = await getAccessibleProperties(userId);
    const propertyIds = accessibleProps.all.map(p => p.id);

    const total = await Property.count({ where: { id: { [Op.in]: propertyIds } } });
    const available = await Property.count({
      where: {
        id: { [Op.in]: propertyIds },
        status: 'disponible'
      }
    });
    const rented = await Property.count({
      where: {
        id: { [Op.in]: propertyIds },
        status: 'loue'
      }
    });
    const inWork = await Property.count({
      where: {
        id: { [Op.in]: propertyIds },
        status: 'en_travaux'
      }
    });

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
