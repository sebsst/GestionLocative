import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserPropertyAccess = sequelize.define('UserPropertyAccess', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Utilisateur invité qui a accès au bien'
    },
    propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Properties',
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Bien partagé'
    },
    grantedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'Utilisateur qui a accordé l\'accès'
    },
    role: {
        type: DataTypes.ENUM('owner', 'manager', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
        comment: 'Rôle de l\'utilisateur sur ce bien'
    },
    canEdit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Peut modifier le bien et ses baux'
    },
    canDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Peut supprimer le bien'
    },
    canInvite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Peut inviter d\'autres utilisateurs'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Accès actif ou révoqué'
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['userId', 'propertyId'],
            unique: true,
            name: 'unique_user_property_access'
        },
        {
            fields: ['propertyId']
        },
        {
            fields: ['userId']
        }
    ],
    hooks: {
        beforeCreate: (access) => {
            // Définir les permissions par défaut selon le rôle
            if (access.role === 'owner') {
                access.canEdit = true;
                access.canDelete = true;
                access.canInvite = true;
            } else if (access.role === 'manager') {
                access.canEdit = true;
                access.canDelete = false;
                access.canInvite = false;
            } else if (access.role === 'viewer') {
                access.canEdit = false;
                access.canDelete = false;
                access.canInvite = false;
            }
        },
        beforeUpdate: (access) => {
            // Mettre à jour les permissions si le rôle change
            if (access.changed('role')) {
                if (access.role === 'owner') {
                    access.canEdit = true;
                    access.canDelete = true;
                    access.canInvite = true;
                } else if (access.role === 'manager') {
                    access.canEdit = true;
                    access.canDelete = false;
                    access.canInvite = false;
                } else if (access.role === 'viewer') {
                    access.canEdit = false;
                    access.canDelete = false;
                    access.canInvite = false;
                }
            }
        }
    }
});

export default UserPropertyAccess;
