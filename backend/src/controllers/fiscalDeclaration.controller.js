import { FiscalDeclaration } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAll = async (req, res, next) => {
  try {
    const declarations = await FiscalDeclaration.findAll({
      order: [['year', 'DESC']]
    });

    res.json({
      success: true,
      data: declarations
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const declaration = await FiscalDeclaration.findByPk(req.params.id);

    if (!declaration) {
      throw new AppError('Déclaration non trouvée', 404);
    }

    res.json({
      success: true,
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

export const getByYear = async (req, res, next) => {
  try {
    const { year } = req.params;

    let declaration = await FiscalDeclaration.findOne({
      where: { year: parseInt(year) }
    });

    // Si la déclaration n'existe pas pour cette année, créer un brouillon
    if (!declaration) {
      declaration = await FiscalDeclaration.create({
        year: parseInt(year),
        status: 'brouillon'
      });
    }

    res.json({
      success: true,
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    // Vérifier si une déclaration existe déjà pour cette année
    const existing = await FiscalDeclaration.findOne({
      where: { year: req.body.year }
    });

    if (existing) {
      throw new AppError('Une déclaration existe déjà pour cette année', 400);
    }

    const declaration = await FiscalDeclaration.create(req.body);

    res.status(201).json({
      success: true,
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const declaration = await FiscalDeclaration.findByPk(req.params.id);

    if (!declaration) {
      throw new AppError('Déclaration non trouvée', 404);
    }

    await declaration.update(req.body);

    res.json({
      success: true,
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

export const updateByYear = async (req, res, next) => {
  try {
    const { year } = req.params;

    let declaration = await FiscalDeclaration.findOne({
      where: { year: parseInt(year) }
    });

    if (!declaration) {
      // Créer si n'existe pas
      declaration = await FiscalDeclaration.create({
        ...req.body,
        year: parseInt(year)
      });
    } else {
      // Mettre à jour
      await declaration.update(req.body);
    }

    res.json({
      success: true,
      data: declaration
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const declaration = await FiscalDeclaration.findByPk(req.params.id);

    if (!declaration) {
      throw new AppError('Déclaration non trouvée', 404);
    }

    await declaration.destroy();

    res.json({
      success: true,
      message: 'Déclaration supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};
