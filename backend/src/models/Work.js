import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Work = sequelize.define('Work', {
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
  type: {
    type: DataTypes.ENUM('reparation', 'renovation', 'entretien', 'amelioration'),
    allowNull: false
  },
  nature: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  estimatedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  workDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimatedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  artisanId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Artisans',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('prevu', 'en_cours', 'termine', 'paye', 'annule'),
    defaultValue: 'prevu'
  },
  isCommon: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  invoice: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

export default Work;
