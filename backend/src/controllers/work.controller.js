import { Work, Property, Artisan, Quote } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op } from 'sequelize';

export const getAll = async (req, res, next) => {
  try {
    const { propertyId, status, type, year } = req.query;
    const where = {};

    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      where.workDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const works = await Work.findAll({
      where,
      include: [
        { model: Property },
        { model: Artisan }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: works
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const work = await Work.findByPk(req.params.id, {
      include: [
        { model: Property },
        { model: Artisan }
      ]
    });

    if (!work) {
      throw new AppError('Travaux non trouvés', 404);
    }

    res.json({
      success: true,
      data: work
    });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const work = await Work.create(req.body);

    res.status(201).json({
      success: true,
      data: work
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const work = await Work.findByPk(req.params.id);

    if (!work) {
      throw new AppError('Travaux non trouvés', 404);
    }

    await work.update(req.body);

    res.json({
      success: true,
      data: work
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const work = await Work.findByPk(req.params.id);

    if (!work) {
      throw new AppError('Travaux non trouvés', 404);
    }

    await work.destroy();

    res.json({
      success: true,
      message: 'Travaux supprimés avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const works = await Work.findAll({
      where: {
        workDate: {
          [Op.between]: [
            new Date(`${currentYear}-01-01`),
            new Date(`${currentYear}-12-31`)
          ]
        }
      }
    });

    const totalAmount = works.reduce((sum, work) => sum + parseFloat(work.amount || 0), 0);
    const totalEstimated = works.reduce((sum, work) => sum + parseFloat(work.estimatedAmount || 0), 0);
    const completed = works.filter(w => w.status === 'termine' || w.status === 'paye').length;

    res.json({
      success: true,
      data: {
        year: currentYear,
        total: works.length,
        completed,
        totalAmount,
        totalEstimated
      }
    });
  } catch (error) {
    next(error);
  }
};

// Artisan management
export const getAllArtisans = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { specialty: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const artisans = await Artisan.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: artisans
    });
  } catch (error) {
    next(error);
  }
};

export const getArtisan = async (req, res, next) => {
  try {
    const artisan = await Artisan.findByPk(req.params.id, {
      include: [{ model: Work }, { model: Quote }]
    });

    if (!artisan) {
      throw new AppError('Artisan non trouvé', 404);
    }

    res.json({
      success: true,
      data: artisan
    });
  } catch (error) {
    next(error);
  }
};

export const createArtisan = async (req, res, next) => {
  try {
    const artisan = await Artisan.create(req.body);

    res.status(201).json({
      success: true,
      data: artisan
    });
  } catch (error) {
    next(error);
  }
};

export const updateArtisan = async (req, res, next) => {
  try {
    const artisan = await Artisan.findByPk(req.params.id);

    if (!artisan) {
      throw new AppError('Artisan non trouvé', 404);
    }

    await artisan.update(req.body);

    res.json({
      success: true,
      data: artisan
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArtisan = async (req, res, next) => {
  try {
    const artisan = await Artisan.findByPk(req.params.id);

    if (!artisan) {
      throw new AppError('Artisan non trouvé', 404);
    }

    await artisan.destroy();

    res.json({
      success: true,
      message: 'Artisan supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// Quote management
export const getAllQuotes = async (req, res, next) => {
  try {
    const { propertyId, artisanId, status } = req.query;
    const where = {};

    if (propertyId) where.propertyId = propertyId;
    if (artisanId) where.artisanId = artisanId;
    if (status) where.status = status;

    const quotes = await Quote.findAll({
      where,
      include: [
        { model: Property },
        { model: Artisan }
      ],
      order: [['quoteDate', 'DESC']]
    });

    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    next(error);
  }
};

export const createQuote = async (req, res, next) => {
  try {
    const quote = await Quote.create(req.body);

    res.status(201).json({
      success: true,
      data: quote
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findByPk(req.params.id);

    if (!quote) {
      throw new AppError('Devis non trouvé', 404);
    }

    await quote.update(req.body);

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    next(error);
  }
};
