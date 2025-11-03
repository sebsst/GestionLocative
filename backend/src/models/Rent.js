import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Rent = sequelize.define('Rent', {
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
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expectedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('virement', 'cheque', 'especes', 'prelevement'),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('en_attente', 'paye', 'partiel', 'en_retard'),
    defaultValue: 'en_attente'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['leaseId', 'month', 'year']
    }
  ]
});

export default Rent;
