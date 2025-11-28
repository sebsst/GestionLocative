import { User, UserPropertyAccess, Property } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { canInviteToProperty } from '../utils/permissions.js';

/**
 * Partager un bien avec un autre utilisateur
 */
export const shareProperty = async (req, res, next) => {
    try {
        const { id: propertyId } = req.params;
        const { email, role = 'viewer' } = req.body;
        const userId = req.userId;

        // Vérifier que l'utilisateur peut inviter sur ce bien
        const canInvite = await canInviteToProperty(userId, propertyId);
        if (!canInvite) {
            throw new AppError('Vous n\'avez pas la permission d\'inviter des utilisateurs sur ce bien', 403);
        }

        // Trouver l'utilisateur à inviter
        const invitedUser = await User.findOne({ where: { email } });
        if (!invitedUser) {
            throw new AppError('Utilisateur non trouvé avec cet email', 404);
        }

        // Vérifier que ce n'est pas le propriétaire
        const property = await Property.findByPk(propertyId);
        if (property.userId === invitedUser.id) {
            throw new AppError('Cet utilisateur est déjà propriétaire de ce bien', 400);
        }

        // Vérifier si l'accès existe déjà
        const existingAccess = await UserPropertyAccess.findOne({
            where: {
                userId: invitedUser.id,
                propertyId
            }
        });

        if (existingAccess) {
            // Mettre à jour l'accès existant
            existingAccess.role = role;
            existingAccess.isActive = true;
            existingAccess.grantedBy = userId;
            await existingAccess.save();

            return res.json({
                success: true,
                message: 'Accès mis à jour avec succès',
                data: existingAccess
            });
        }

        // Créer un nouvel accès
        const access = await UserPropertyAccess.create({
            userId: invitedUser.id,
            propertyId,
            grantedBy: userId,
            role
        });

        res.status(201).json({
            success: true,
            message: 'Bien partagé avec succès',
            data: access
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir la liste des utilisateurs ayant accès à un bien
 */
export const getSharedUsers = async (req, res, next) => {
    try {
        const { id: propertyId } = req.params;
        const userId = req.userId;

        // Vérifier que l'utilisateur peut voir les accès
        const canInvite = await canInviteToProperty(userId, propertyId);
        if (!canInvite) {
            throw new AppError('Vous n\'avez pas la permission de voir les accès à ce bien', 403);
        }

        const accesses = await UserPropertyAccess.findAll({
            where: { propertyId, isActive: true },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'grantor',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                }
            ]
        });

        res.json({
            success: true,
            data: accesses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Révoquer l'accès d'un utilisateur à un bien
 */
export const revokeAccess = async (req, res, next) => {
    try {
        const { id: accessId } = req.params;
        const userId = req.userId;

        const access = await UserPropertyAccess.findByPk(accessId);
        if (!access) {
            throw new AppError('Accès non trouvé', 404);
        }

        // Vérifier que l'utilisateur peut révoquer cet accès
        const canInvite = await canInviteToProperty(userId, access.propertyId);
        if (!canInvite) {
            throw new AppError('Vous n\'avez pas la permission de révoquer cet accès', 403);
        }

        access.isActive = false;
        await access.save();

        res.json({
            success: true,
            message: 'Accès révoqué avec succès'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour les permissions d'un accès
 */
export const updatePermissions = async (req, res, next) => {
    try {
        const { id: accessId } = req.params;
        const { role, canEdit, canDelete, canInvite } = req.body;
        const userId = req.userId;

        const access = await UserPropertyAccess.findByPk(accessId);
        if (!access) {
            throw new AppError('Accès non trouvé', 404);
        }

        // Vérifier que l'utilisateur peut modifier cet accès
        const canInvitePermission = await canInviteToProperty(userId, access.propertyId);
        if (!canInvitePermission) {
            throw new AppError('Vous n\'avez pas la permission de modifier cet accès', 403);
        }

        // Mettre à jour les permissions
        if (role) access.role = role;
        if (canEdit !== undefined) access.canEdit = canEdit;
        if (canDelete !== undefined) access.canDelete = canDelete;
        if (canInvite !== undefined) access.canInvite = canInvite;

        await access.save();

        res.json({
            success: true,
            message: 'Permissions mises à jour avec succès',
            data: access
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir les biens partagés avec l'utilisateur connecté
 */
export const getMySharedProperties = async (req, res, next) => {
    try {
        const userId = req.userId;

        const accesses = await UserPropertyAccess.findAll({
            where: {
                userId,
                isActive: true
            },
            include: [
                {
                    model: Property,
                    as: 'property',
                    include: [
                        {
                            model: User,
                            as: 'owner',
                            attributes: ['id', 'email', 'firstName', 'lastName']
                        }
                    ]
                },
                {
                    model: User,
                    as: 'grantor',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                }
            ]
        });

        const sharedProperties = accesses.map(access => ({
            ...access.property.toJSON(),
            accessRole: access.role,
            canEdit: access.canEdit,
            canDelete: access.canDelete,
            canInvite: access.canInvite,
            grantedBy: access.grantor,
            grantedAt: access.createdAt
        }));

        res.json({
            success: true,
            data: sharedProperties
        });
    } catch (error) {
        next(error);
    }
};
