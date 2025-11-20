import { Lease, Property, Tenant, LeaseOccupant, LeaseOccupancyPeriod, LeaseTenant } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const getAll = async (req, res, next) => {
  try {
    const { propertyId, tenantId, status } = req.query;
    const where = {};

    if (propertyId) where.propertyId = propertyId;
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    const leases = await Lease.findAll({
      where,
      include: [
        { model: Property },
        { model: Tenant },
        { model: LeaseOccupant, as: 'occupants' }
      ],
      order: [['startDate', 'DESC']]
    });

    res.json({
      success: true,
      data: leases
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const lease = await Lease.findByPk(req.params.id, {
      include: [
        { model: Property },
        { model: Tenant },
        { model: LeaseOccupant, as: 'occupants' }
      ]
    });

    if (!lease) {
      throw new AppError('Bail non trouvé', 404);
    }

    res.json({
      success: true,
      data: lease
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { occupants, ...leaseData } = req.body;

    // Vérifier si le bien est déjà loué
    const existingLease = await Lease.findOne({
      where: {
        propertyId: leaseData.propertyId,
        status: 'actif'
      }
    });

    if (existingLease) {
      // Terminer le bail précédent la veille du nouveau bail
      const newStartDate = new Date(leaseData.startDate);
      const endDate = new Date(newStartDate);
      endDate.setDate(endDate.getDate() - 1);

      await existingLease.update({
        endDate: endDate,
        status: 'termine'
      });

      await closeLeaseAssociations(existingLease.id, endDate);
    }

    // Créer le bail
    const lease = await Lease.create(leaseData);

    // Ajouter les occupants si fournis
    if (occupants && occupants.length > 0) {
      const occupantPromises = occupants.map(occupant =>
        LeaseOccupant.create({
          ...occupant,
          leaseId: lease.id
        })
      );
      await Promise.all(occupantPromises);
    }

    // Mettre à jour le statut du bien
    await Property.update(
      { status: 'loue' },
      { where: { id: leaseData.propertyId } }
    );

    const createdLease = await Lease.findByPk(lease.id, {
      include: [
        { model: Property },
        { model: Tenant },
        { model: LeaseOccupant, as: 'occupants' }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdLease
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const lease = await Lease.findByPk(req.params.id);

    if (!lease) {
      throw new AppError('Bail non trouvé', 404);
    }

    const { occupants, ...leaseData } = req.body;

    await lease.update(leaseData);

    // Mettre à jour les occupants si fournis
    if (occupants) {
      // Supprimer les anciens occupants
      await LeaseOccupant.destroy({ where: { leaseId: lease.id } });

      // Ajouter les nouveaux occupants
      if (occupants.length > 0) {
        const occupantPromises = occupants.map(occupant =>
          LeaseOccupant.create({
            ...occupant,
            leaseId: lease.id
          })
        );
        await Promise.all(occupantPromises);
      }
    }

    const updatedLease = await Lease.findByPk(lease.id, {
      include: [
        { model: Property },
        { model: Tenant },
        { model: LeaseOccupant, as: 'occupants' }
      ]
    });

    res.json({
      success: true,
      data: updatedLease
    });
  } catch (error) {
    next(error);
  }
};

export const terminate = async (req, res, next) => {
  try {
    const { endDate } = req.body;
    const lease = await Lease.findByPk(req.params.id);

    if (!lease) {
      throw new AppError('Bail non trouvé', 404);
    }

    const actualEndDate = endDate || new Date();

    await lease.update({
      endDate: actualEndDate,
      status: 'termine'
    });

    await closeLeaseAssociations(lease.id, actualEndDate);

    // Mettre à jour le statut du bien
    await Property.update(
      { status: 'disponible' },
      { where: { id: lease.propertyId } }
    );

    res.json({
      success: true,
      data: lease
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const lease = await Lease.findByPk(req.params.id);

    if (!lease) {
      throw new AppError('Bail non trouvé', 404);
    }

    // Mettre à jour le statut du bien si le bail était actif
    if (lease.status === 'actif') {
      await Property.update(
        { status: 'disponible' },
        { where: { id: lease.propertyId } }
      );
    }

    await lease.destroy();

    res.json({
      success: true,
      message: 'Bail supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// Gestion des occupants
export const addOccupant = async (req, res, next) => {
  try {
    const lease = await Lease.findByPk(req.params.id);

    if (!lease) {
      throw new AppError('Bail non trouvé', 404);
    }

    const occupant = await LeaseOccupant.create({
      ...req.body,
      leaseId: lease.id
    });

    res.status(201).json({
      success: true,
      data: occupant
    });
  } catch (error) {
    next(error);
  }
};

export const updateOccupant = async (req, res, next) => {
  try {
    const occupant = await LeaseOccupant.findByPk(req.params.occupantId);

    if (!occupant) {
      throw new AppError('Occupant non trouvé', 404);
    }

    await occupant.update(req.body);

    res.json({
      success: true,
      data: occupant
    });
  } catch (error) {
    next(error);
  }
};

export const removeOccupant = async (req, res, next) => {
  try {
    const occupant = await LeaseOccupant.findByPk(req.params.occupantId);

    if (!occupant) {
      throw new AppError('Occupant non trouvé', 404);
    }

    await occupant.destroy();

    res.json({
      success: true,
      message: 'Occupant supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

const closeLeaseAssociations = async (leaseId, endDate) => {
  // Clôturer les périodes d'occupation actives
  await LeaseOccupancyPeriod.update(
    { endDate: endDate },
    {
      where: {
        leaseId: leaseId,
        endDate: null
      }
    }
  );

  // Clôturer les associations de locataires actives
  await LeaseTenant.update(
    { endDate: endDate },
    {
      where: {
        leaseId: leaseId,
        endDate: null
      }
    }
  );
};
