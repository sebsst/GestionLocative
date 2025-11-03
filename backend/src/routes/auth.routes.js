import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis')
  ],
  validate,
  authController.register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis')
  ],
  validate,
  authController.login
);

router.get('/me', authenticate, authController.getMe);

router.put('/profile', authenticate,
  [
    body('firstName').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
    body('lastName').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('email').optional().isEmail().withMessage('Email invalide')
  ],
  validate,
  authController.updateProfile
);

router.put('/change-password', authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
    body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
  ],
  validate,
  authController.changePassword
);

router.get('/email-settings', authenticate, authController.getEmailSettings);

router.put('/email-settings', authenticate,
  [
    body('emailSmtpHost').optional().notEmpty().withMessage("L'hôte SMTP ne peut pas être vide"),
    body('emailSmtpPort').optional().isInt({ min: 1, max: 65535 }).withMessage('Le port SMTP doit être entre 1 et 65535'),
    body('emailSmtpSecure').optional().isBoolean().withMessage('emailSmtpSecure doit être un booléen'),
    body('emailSmtpUser').optional().notEmpty().withMessage("L'utilisateur SMTP ne peut pas être vide"),
    body('emailFrom').optional().isEmail().withMessage("L'adresse email d'expéditeur est invalide")
  ],
  validate,
  authController.updateEmailSettings
);

export default router;
