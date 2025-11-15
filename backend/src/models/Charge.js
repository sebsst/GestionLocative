import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Charge = sequelize.define('Charge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Properties',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'copropriete',
      'electricite',
      'eau',
      'ordures',
      'taxe_ordures',
      'jardin',
      'entretien',
      'assurance',
      'chauffage',
      'taxe_fonciere',
      'autre'
    ),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  frequency: {
    type: DataTypes.ENUM('mensuel', 'trimestriel', 'annuel', 'ponctuel'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isCommon: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  distributionMethod: {
    type: DataTypes.ENUM('surface', 'occupants', 'appartement', 'personnalise'),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  invoice: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

export default Charge;
