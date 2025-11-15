import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChargeRegularization = sequelize.define('ChargeRegularization', {
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
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Année de régularisation'
  },
  periodStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Début de la période de régularisation'
  },
  periodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fin de la période de régularisation'
  },
  totalProvisions: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total des provisions versées'
  },
  totalRealCharges: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total des charges réelles'
  },
  regularizationAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Montant de régularisation (positif = dû par locataire, négatif = dû au locataire)'
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'refunded'),
    defaultValue: 'draft',
    comment: 'Statut de la régularisation'
  },
  sentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date d\'envoi du décompte'
  },
  paidDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date de paiement/remboursement'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes et commentaires'
  }
}, {
  tableName: 'ChargeRegularizations',
  timestamps: true
});

export default ChargeRegularization;
