import { body, param, query, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Validation rules for creating a property
export const validateCreateProperty = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom du bien est requis')
        .isLength({ min: 2, max: 200 })
        .withMessage('Le nom doit contenir entre 2 et 200 caractères'),

    body('address')
        .trim()
        .notEmpty()
        .withMessage('L\'adresse est requise')
        .isLength({ min: 5, max: 300 })
        .withMessage('L\'adresse doit contenir entre 5 et 300 caractères'),

    body('postalCode')
        .trim()
        .notEmpty()
        .withMessage('Le code postal est requis')
        .matches(/^\d{5}$/)
        .withMessage('Le code postal doit contenir 5 chiffres'),

    body('city')
        .trim()
        .notEmpty()
        .withMessage('La ville est requise')
        .isLength({ min: 2, max: 100 })
        .withMessage('La ville doit contenir entre 2 et 100 caractères'),

    body('type')
        .notEmpty()
        .withMessage('Le type de bien est requis')
        .isIn(['appartement', 'maison', 'immeuble', 'terrain', 'garage', 'fond_commerce', 'meuble', 'bureau', 'commerce', 'autre'])
        .withMessage('Type de bien invalide'),

    body('surface')
        .optional()
        .isFloat({ min: 0, max: 999999 })
        .withMessage('La surface doit être un nombre positif'),

    body('rooms')
        .optional()
        .isInt({ min: 0, max: 999 })
        .withMessage('Le nombre de pièces doit être un entier positif'),

    body('currentRent')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le loyer doit être un nombre positif'),

    body('propertyTax')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La taxe foncière doit être un nombre positif'),

    body('purchasePrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix d\'achat doit être un nombre positif'),

    body('purchaseDate')
        .optional()
        .isISO8601()
        .withMessage('La date d\'achat doit être une date valide'),

    body('status')
        .optional()
        .isIn(['disponible', 'loue', 'en_travaux', 'vendu'])
        .withMessage('Statut invalide'),

    body('cadastralReference')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('La référence cadastrale ne peut pas dépasser 100 caractères'),

    body('fiscalNumber')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Le numéro fiscal ne peut pas dépasser 50 caractères'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('La description ne peut pas dépasser 2000 caractères'),

    handleValidationErrors
];

// Validation rules for updating a property
export const validateUpdateProperty = [
    param('id')
        .isUUID()
        .withMessage('ID de bien invalide'),

    ...validateCreateProperty.slice(0, -1), // Reuse create validation rules except handleValidationErrors
    handleValidationErrors
];

// Validation rules for getting a property by ID
export const validatePropertyId = [
    param('id')
        .isUUID()
        .withMessage('ID de bien invalide'),

    handleValidationErrors
];

// Validation rules for query parameters
export const validatePropertyQuery = [
    query('type')
        .optional()
        .isIn(['appartement', 'maison', 'immeuble', 'terrain', 'garage', 'fond_commerce', 'meuble', 'bureau', 'commerce', 'autre'])
        .withMessage('Type de bien invalide'),

    query('status')
        .optional()
        .isIn(['disponible', 'loue', 'en_travaux', 'vendu'])
        .withMessage('Statut invalide'),

    query('search')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La recherche ne peut pas dépasser 200 caractères'),

    handleValidationErrors
];
