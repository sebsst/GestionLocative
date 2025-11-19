import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Documents', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      propertyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(
          'contrat',
          'photo',
          'facture',
          'diagnostic',
          'autre'
        ),
        defaultValue: 'autre'
      },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL link for external documents'
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
    await queryInterface.addIndex('Documents', ['propertyId']);
    await queryInterface.addIndex('Documents', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Documents');
  }
};