import { UserPropertyAccess } from '../models/index.js';

/**
 * Middleware pour injecter le contexte utilisateur dans les requêtes
 * Ajoute automatiquement le userId aux scopes Sequelize
 */
export const userContext = (req, res, next) => {
    if (req.userId) {
        // Le userId est déjà injecté par le middleware auth
        // On peut l'utiliser pour filtrer les requêtes
        req.userContext = {
            userId: req.userId,
            // Fonction helper pour vérifier l'accès à un bien
            canAccessProperty: async (propertyId) => {
                // Vérifier si l'utilisateur est propriétaire
                const { Property } = await import('../models/index.js');
                const property = await Property.findOne({
                    where: { id: propertyId, userId: req.userId }
                });

                if (property) return { access: true, role: 'owner', property };

                // Vérifier si l'utilisateur a un accès partagé
                const access = await UserPropertyAccess.findOne({
                    where: {
                        userId: req.userId,
                        propertyId: propertyId,
                        isActive: true
                    },
                    include: [{ model: Property, as: 'property' }]
                });

                if (access) {
                    return {
                        access: true,
                        role: access.role,
                        canEdit: access.canEdit,
                        canDelete: access.canDelete,
                        canInvite: access.canInvite,
                        property: access.property
                    };
                }

                return { access: false };
            }
        };
    }
    next();
};

/**
 * Middleware pour vérifier l'accès à un bien spécifique
 * Utiliser après auth.js et userContext
 */
export const checkPropertyAccess = (options = {}) => {
    const { requireEdit = false, requireDelete = false } = options;

    return async (req, res, next) => {
        try {
            const propertyId = req.params.id || req.params.propertyId || req.body.propertyId;

            if (!propertyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Property ID is required'
                });
            }

            if (!req.userContext) {
                return res.status(401).json({
                    success: false,
                    message: 'User context not found'
                });
            }

            const accessInfo = await req.userContext.canAccessProperty(propertyId);

            if (!accessInfo.access) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have access to this property'
                });
            }

            // Vérifier les permissions spécifiques si nécessaire
            if (requireEdit && !accessInfo.canEdit && accessInfo.role !== 'owner') {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have edit permissions for this property'
                });
            }

            if (requireDelete && !accessInfo.canDelete && accessInfo.role !== 'owner') {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have delete permissions for this property'
                });
            }

            // Ajouter les informations d'accès à la requête
            req.propertyAccess = accessInfo;
            next();
        } catch (error) {
            console.error('Error checking property access:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking property access'
            });
        }
    };
};
