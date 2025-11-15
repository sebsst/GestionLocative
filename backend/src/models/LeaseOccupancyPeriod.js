import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaseOccupancyPeriod = sequelize.define('LeaseOccupancyPeriod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  leaseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Leases',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  numberOfOccupants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['leaseId', 'startDate']
    }
  ]
});

export default LeaseOccupancyPeriod;
