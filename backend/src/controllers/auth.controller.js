import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    await user.update({ firstName, lastName, email });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Mot de passe actuel incorrect', 401);
    }

    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const getEmailSettings = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.json({
      success: true,
      data: {
        emailSmtpHost: user.emailSmtpHost,
        emailSmtpPort: user.emailSmtpPort,
        emailSmtpSecure: user.emailSmtpSecure,
        emailSmtpUser: user.emailSmtpUser,
        emailFrom: user.emailFrom,
        emailConfigured: user.emailConfigured
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmailSettings = async (req, res, next) => {
  try {
    const { emailSmtpHost, emailSmtpPort, emailSmtpSecure, emailSmtpUser, emailSmtpPass, emailFrom } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const updateData = {
      emailSmtpHost,
      emailSmtpPort,
      emailSmtpSecure,
      emailSmtpUser,
      emailFrom,
      emailConfigured: !!(emailSmtpHost && emailSmtpPort && emailSmtpUser && emailFrom)
    };

    // Only update password if provided
    if (emailSmtpPass) {
      updateData.emailSmtpPass = emailSmtpPass;
    }

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Paramètres email mis à jour avec succès',
      data: {
        emailSmtpHost: user.emailSmtpHost,
        emailSmtpPort: user.emailSmtpPort,
        emailSmtpSecure: user.emailSmtpSecure,
        emailSmtpUser: user.emailSmtpUser,
        emailFrom: user.emailFrom,
        emailConfigured: user.emailConfigured
      }
    });
  } catch (error) {
    next(error);
  }
};
