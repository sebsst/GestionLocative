import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChargeAllocation = sequelize.define('ChargeAllocation', {
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
  leaseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Leases',
      key: 'id'
    }
  },
  allocationMethod: {
    type: DataTypes.ENUM('par_occupant', 'par_appartement', 'par_jours'),
    allowNull: false
  },
  allocatedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  coefficient: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  daysOccupied: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

export default ChargeAllocation;
