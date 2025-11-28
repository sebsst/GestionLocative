import { Property, UserPropertyAccess } from '../models/index.js';

/**
 * Vérifier si un utilisateur peut accéder à un bien
 */
export const canAccessProperty = async (userId, propertyId) => {
    // Vérifier si l'utilisateur est propriétaire
    const property = await Property.findOne({
        where: { id: propertyId, userId }
    });

    if (property) {
        return {
            access: true,
            role: 'owner',
            canEdit: true,
            canDelete: true,
            canInvite: true
        };
    }

    // Vérifier si l'utilisateur a un accès partagé
    const access = await UserPropertyAccess.findOne({
        where: {
            userId,
            propertyId,
            isActive: true
        }
    });

    if (access) {
        return {
            access: true,
            role: access.role,
            canEdit: access.canEdit,
            canDelete: access.canDelete,
            canInvite: access.canInvite
        };
    }

    return { access: false };
};

/**
 * Vérifier si un utilisateur peut modifier un bien
 */
export const canEditProperty = async (userId, propertyId) => {
    const accessInfo = await canAccessProperty(userId, propertyId);
    return accessInfo.access && (accessInfo.canEdit || accessInfo.role === 'owner');
};

/**
 * Vérifier si un utilisateur peut supprimer un bien
 */
export const canDeleteProperty = async (userId, propertyId) => {
    const accessInfo = await canAccessProperty(userId, propertyId);
    return accessInfo.access && (accessInfo.canDelete || accessInfo.role === 'owner');
};

/**
 * Vérifier si un utilisateur peut inviter d'autres utilisateurs sur un bien
 */
export const canInviteToProperty = async (userId, propertyId) => {
    const accessInfo = await canAccessProperty(userId, propertyId);
    return accessInfo.access && (accessInfo.canInvite || accessInfo.role === 'owner');
};

/**
 * Obtenir toutes les permissions d'un utilisateur sur un bien
 */
export const getPropertyPermissions = async (userId, propertyId) => {
    return await canAccessProperty(userId, propertyId);
};

/**
 * Obtenir tous les biens accessibles par un utilisateur
 * (biens possédés + biens partagés)
 */
export const getAccessibleProperties = async (userId) => {
    // Biens possédés
    const ownedProperties = await Property.findAll({
        where: { userId }
    });

    // Biens partagés
    const sharedAccesses = await UserPropertyAccess.findAll({
        where: {
            userId,
            isActive: true
        },
        include: [{ model: Property, as: 'property' }]
    });

    const sharedProperties = sharedAccesses.map(access => ({
        ...access.property.toJSON(),
        accessRole: access.role,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
        canInvite: access.canInvite,
        isShared: true
    }));

    return {
        owned: ownedProperties,
        shared: sharedProperties,
        all: [...ownedProperties, ...sharedProperties]
    };
};
