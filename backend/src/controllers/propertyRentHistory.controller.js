import { PropertyRentHistory, Property } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import sequelize from '../config/database.js';

export const getHistory = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const history = await PropertyRentHistory.findAll({
      where: { propertyId },
      order: [['startDate', 'DESC']]
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrent = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const current = await PropertyRentHistory.findOne({
      where: {
        propertyId,
        isCurrent: true
      }
    });

    res.json({
      success: true,
      data: current
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { propertyId } = req.params;
    const { rentAmount, chargesAmount, startDate, notes } = req.body;

    // Désactiver l'entrée actuelle s'il y en a une
    const currentEntry = await PropertyRentHistory.findOne({
      where: {
        propertyId,
        isCurrent: true
      }
    });

    if (currentEntry) {
      await currentEntry.update({
        isCurrent: false,
        endDate: new Date(startDate)
      }, { transaction: t });
    }

    // Créer la nouvelle entrée
    const newEntry = await PropertyRentHistory.create({
      propertyId,
      rentAmount,
      chargesAmount: chargesAmount || 0,
      startDate,
      isCurrent: true,
      notes
    }, { transaction: t });

    // Mettre à jour le loyer actuel de la propriété
    await Property.update({
      currentRent: rentAmount
    }, {
      where: { id: propertyId },
      transaction: t
    });

    await t.commit();

    res.status(201).json({
      success: true,
      data: newEntry
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await PropertyRentHistory.findByPk(id);

    if (!entry) {
      throw new AppError('Entrée non trouvée', 404);
    }

    await entry.update(req.body);

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await PropertyRentHistory.findByPk(id);

    if (!entry) {
      throw new AppError('Entrée non trouvée', 404);
    }

    if (entry.isCurrent) {
      throw new AppError('Impossible de supprimer l\'entrée actuelle', 400);
    }

    await entry.destroy();

    res.json({
      success: true,
      message: 'Entrée supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};
