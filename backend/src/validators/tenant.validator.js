import { body, param, query } from 'express-validator';
import { handleValidationErrors } from './property.validator.js';

// Validation rules for creating a tenant
export const validateCreateTenant = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Le prénom est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le prénom doit contenir entre 2 et 100 caractères'),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),

    body('email')
        .optional({ nullable: true })
        .trim()
        .isEmail()
        .withMessage('L\'email doit être valide')
        .normalizeEmail(),

    body('phone')
        .optional({ nullable: true })
        .trim()
        .matches(/^(\+33|0)[1-9](\d{2}){4}$/)
        .withMessage('Le numéro de téléphone doit être un numéro français valide'),

    body('mobile')
        .optional({ nullable: true })
        .trim()
        .matches(/^(\+33|0)[6-7](\d{2}){4}$/)
        .withMessage('Le numéro de mobile doit être un numéro français valide'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('L\'adresse ne peut pas dépasser 300 caractères'),

    body('postalCode')
        .optional()
        .trim()
        .matches(/^\d{5}$/)
        .withMessage('Le code postal doit contenir 5 chiffres'),

    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('La ville ne peut pas dépasser 100 caractères'),

    body('birthDate')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La date de naissance doit être une date valide')
        .custom((birthDate) => {
            if (birthDate) {
                const birth = new Date(birthDate);
                const today = new Date();
                const age = today.getFullYear() - birth.getFullYear();
                if (age < 18 || age > 120) {
                    throw new Error('Le locataire doit avoir entre 18 et 120 ans');
                }
            }
            return true;
        }),

    body('birthPlace')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Le lieu de naissance ne peut pas dépasser 100 caractères'),

    body('nationality')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('La nationalité ne peut pas dépasser 100 caractères'),

    body('profession')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La profession ne peut pas dépasser 200 caractères'),

    body('employer')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('L\'employeur ne peut pas dépasser 200 caractères'),

    body('monthlyIncome')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Le revenu mensuel doit être un nombre positif'),

    body('bankName')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Le nom de la banque ne peut pas dépasser 200 caractères'),

    body('iban')
        .optional()
        .trim()
        .matches(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/)
        .withMessage('L\'IBAN doit être valide'),

    body('bic')
        .optional()
        .trim()
        .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
        .withMessage('Le BIC doit être valide'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Les notes ne peuvent pas dépasser 2000 caractères'),

    handleValidationErrors
];

// Validation rules for updating a tenant
export const validateUpdateTenant = [
    param('id')
        .isUUID()
        .withMessage('ID de locataire invalide'),

    ...validateCreateTenant.slice(0, -1), // Reuse create validation rules except handleValidationErrors
    handleValidationErrors
];

// Validation rules for getting a tenant by ID
export const validateTenantId = [
    param('id')
        .isUUID()
        .withMessage('ID de locataire invalide'),

    handleValidationErrors
];

// Validation rules for query parameters
export const validateTenantQuery = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La recherche ne peut pas dépasser 200 caractères'),

    handleValidationErrors
];
