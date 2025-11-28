import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Property = sequelize.define('Property', {
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
    comment: 'Propriétaire principal du bien'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'appartement',
      'maison',
      'immeuble',
      'terrain',
      'garage',
      'fond_commerce',
      'meuble'
    ),
    allowNull: false
  },
  locationType: {
    type: DataTypes.ENUM(
      'logement_seul',
      'appartement_immeuble',
      'appartement_copropriete'
    ),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surface: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  rooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  inCopropriete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  inImmeuble: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  buildingId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Properties',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currentRent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('disponible', 'loue', 'en_travaux', 'vendu'),
    defaultValue: 'disponible'
  },
  fiscalNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cadastralReference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  propertyTax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Taxe foncière annuelle'
  }
}, {
  timestamps: true
});

export default Property;
