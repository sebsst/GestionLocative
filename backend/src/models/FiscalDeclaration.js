import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FiscalDeclaration = sequelize.define('FiscalDeclaration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  regime: {
    type: DataTypes.ENUM('reel', 'micro'),
    allowNull: false,
    defaultValue: 'reel'
  },
  // Revenus
  revenuBrut: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Charges - Case 221
  fraisGestion: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Case 223
  primesAssurance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Case 224
  depensesReparation: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Case 227
  chargesNonRecuperees: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Case 229
  taxeFonciere: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Case 230
  autresCharges: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Case 250
  interetsEmprunt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Amortissements et provisions (si LMNP/LMP)
  amortissements: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // Notes et observations
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Statut de la déclaration
  status: {
    type: DataTypes.ENUM('brouillon', 'complete', 'declaree'),
    allowNull: false,
    defaultValue: 'brouillon'
  },
  // Date de déclaration
  declarationDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['year']
    }
  ]
});

export default FiscalDeclaration;
