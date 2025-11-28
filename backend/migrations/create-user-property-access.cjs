const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable('UserPropertyAccesses', {
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
                onDelete: 'CASCADE'
            },
            propertyId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Properties',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            grantedBy: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            role: {
                type: DataTypes.ENUM('owner', 'manager', 'viewer'),
                allowNull: false,
                defaultValue: 'viewer'
            },
            canEdit: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            canDelete: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            canInvite: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false
            }
        });

        // Add indexes
        await queryInterface.addIndex('UserPropertyAccesses', ['userId', 'propertyId'], {
            unique: true,
            name: 'unique_user_property_access'
        });

        await queryInterface.addIndex('UserPropertyAccesses', ['propertyId']);
        await queryInterface.addIndex('UserPropertyAccesses', ['userId']);

        console.log('UserPropertyAccesses table created successfully!');
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('UserPropertyAccesses');
    }
};
