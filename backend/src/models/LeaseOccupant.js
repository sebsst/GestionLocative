import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaseOccupant = sequelize.define('LeaseOccupant', {
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
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  entryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  exitDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

export default LeaseOccupant;
