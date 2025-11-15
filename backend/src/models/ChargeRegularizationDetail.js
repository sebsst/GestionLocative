import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChargeRegularizationDetail = sequelize.define('ChargeRegularizationDetail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  regularizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ChargeRegularizations',
      key: 'id'
    }
  },
  chargeType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type de charge (eau, électricité, etc.)'
  },
  chargeName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nom de la charge'
  },
  provisions: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Provisions versées pour cette charge'
  },
  realAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Montant réel de la charge'
  },
  difference: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Différence (positif = complément, négatif = trop-perçu)'
  }
}, {
  tableName: 'ChargeRegularizationDetails',
  timestamps: true
});

export default ChargeRegularizationDetail;
