import { body, param, query } from 'express-validator';
import { handleValidationErrors } from './property.validator.js';

// Validation rules for creating a lease
export const validateCreateLease = [
    body('propertyId')
        .notEmpty()
        .withMessage('L\'ID du bien est requis')
        .isUUID()
        .withMessage('ID de bien invalide'),

    body('tenantId')
        .notEmpty()
        .withMessage('L\'ID du locataire est requis')
        .isUUID()
        .withMessage('ID de locataire invalide'),

    body('startDate')
        .notEmpty()
        .withMessage('La date de début est requise')
        .isISO8601()
        .withMessage('La date de début doit être une date valide'),

    body('endDate')
        .optional({ nullable: true })
        .isISO8601()
        .withMessage('La date de fin doit être une date valide')
        .custom((endDate, { req }) => {
            if (endDate && req.body.startDate) {
                const start = new Date(req.body.startDate);
                const end = new Date(endDate);
                if (end <= start) {
                    throw new Error('La date de fin doit être postérieure à la date de début');
                }
            }
            return true;
        }),

    body('rentAmount')
        .notEmpty()
        .withMessage('Le montant du loyer est requis')
        .isFloat({ min: 0 })
        .withMessage('Le montant du loyer doit être un nombre positif'),

    body('chargesAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le montant des charges doit être un nombre positif'),

    body('deposit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le dépôt de garantie doit être un nombre positif'),

    body('numberOfOccupants')
        .optional()
        .isInt({ min: 1, max: 99 })
        .withMessage('Le nombre d\'occupants doit être un entier entre 1 et 99'),

    body('status')
        .optional()
        .isIn(['actif', 'termine', 'resilie', 'en_attente'])
        .withMessage('Statut invalide'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Les notes ne peuvent pas dépasser 2000 caractères'),

    handleValidationErrors
];

// Validation rules for updating a lease
export const validateUpdateLease = [
    param('id')
        .isUUID()
        .withMessage('ID de bail invalide'),

    ...validateCreateLease.slice(0, -1), // Reuse create validation rules except handleValidationErrors
    handleValidationErrors
];

// Validation rules for getting a lease by ID
export const validateLeaseId = [
    param('id')
        .isUUID()
        .withMessage('ID de bail invalide'),

    handleValidationErrors
];

// Validation rules for query parameters
export const validateLeaseQuery = [
    query('propertyId')
        .optional()
        .isUUID()
        .withMessage('ID de bien invalide'),

    query('tenantId')
        .optional()
        .isUUID()
        .withMessage('ID de locataire invalide'),

    query('status')
        .optional()
        .isIn(['actif', 'termine', 'resilie', 'en_attente'])
        .withMessage('Statut invalide'),

    handleValidationErrors
];
