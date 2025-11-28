const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addColumn('Charges', 'metadata', {
            type: DataTypes.JSON,
            allowNull: true
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('Charges', 'metadata');
    }
};
