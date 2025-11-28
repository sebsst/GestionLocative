const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        // Get the first user ID to assign existing data
        const [users] = await queryInterface.sequelize.query(
            'SELECT id FROM Users ORDER BY createdAt ASC LIMIT 1'
        );

        if (users.length === 0) {
            throw new Error('No user found. Please create at least one user before running this migration.');
        }

        const firstUserId = users[0].id;
        console.log(`Assigning existing data to user: ${firstUserId}`);

        // Add userId to Properties
        await queryInterface.addColumn('Properties', 'userId', {
            type: DataTypes.UUID,
            allowNull: true, // Temporarily allow null
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        });

        // Update existing properties
        await queryInterface.sequelize.query(
            `UPDATE Properties SET userId = '${firstUserId}' WHERE userId IS NULL`
        );

        // Make userId NOT NULL
        await queryInterface.changeColumn('Properties', 'userId', {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        });

        // Add userId to Tenants
        await queryInterface.addColumn('Tenants', 'userId', {
            type: DataTypes.UUID,
            allowNull: true
        });

        await queryInterface.sequelize.query(
            `UPDATE Tenants SET userId = '${firstUserId}' WHERE userId IS NULL`
        );

        await queryInterface.changeColumn('Tenants', 'userId', {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        });

        // Add userId to Artisans
        await queryInterface.addColumn('Artisans', 'userId', {
            type: DataTypes.UUID,
            allowNull: true
        });

        await queryInterface.sequelize.query(
            `UPDATE Artisans SET userId = '${firstUserId}' WHERE userId IS NULL`
        );

        await queryInterface.changeColumn('Artisans', 'userId', {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        });

        // Add userId to FiscalDeclarations
        await queryInterface.addColumn('FiscalDeclarations', 'userId', {
            type: DataTypes.UUID,
            allowNull: true
        });

        await queryInterface.sequelize.query(
            `UPDATE FiscalDeclarations SET userId = '${firstUserId}' WHERE userId IS NULL`
        );

        await queryInterface.changeColumn('FiscalDeclarations', 'userId', {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        });

        // Update FiscalDeclarations unique index
        await queryInterface.removeIndex('FiscalDeclarations', ['year']);
        await queryInterface.addIndex('FiscalDeclarations', ['userId', 'year'], {
            unique: true,
            name: 'unique_user_year_declaration'
        });

        console.log('Migration completed successfully!');
    },

    down: async (queryInterface) => {
        // Remove userId columns
        await queryInterface.removeColumn('Properties', 'userId');
        await queryInterface.removeColumn('Tenants', 'userId');
        await queryInterface.removeColumn('Artisans', 'userId');
        await queryInterface.removeColumn('FiscalDeclarations', 'userId');

        // Restore original FiscalDeclarations index
        await queryInterface.removeIndex('FiscalDeclarations', 'unique_user_year_declaration');
        await queryInterface.addIndex('FiscalDeclarations', ['year'], {
            unique: true
        });
    }
};
