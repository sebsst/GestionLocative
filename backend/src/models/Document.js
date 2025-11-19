import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Document = sequelize.define('Document', {
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
    }
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
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['propertyId']
    },
    {
      fields: ['type']
    }
  ]
});

export default Document;