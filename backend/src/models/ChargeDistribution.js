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
    allowNull: false,
    references: {
      model: 'Properties',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  }
}, {
  timestamps: true
});

export default ChargeDistribution;
