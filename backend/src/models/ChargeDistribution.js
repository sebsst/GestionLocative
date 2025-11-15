import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChargeDistribution = sequelize.define('ChargeDistribution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  chargeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Charges',
      key: 'id'
    }
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Properties',
      key: 'id'
    }
  },
  leaseId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Leases',
      key: 'id'
    }
  },
  allocationMethod: {
    type: DataTypes.ENUM('par_occupant', 'par_appartement', 'par_jours', 'fixe'),
    allowNull: false,
    defaultValue: 'fixe'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  coefficient: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  daysOccupied: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  occupantsCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true
});

export default ChargeDistribution;
