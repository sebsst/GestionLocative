import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaseRentPeriod = sequelize.define('LeaseRentPeriod', {
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
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date de début de la période de loyer'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date de fin de la période (null si période active)'
  },
  rentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Montant du loyer hors charges'
  },
  chargesAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Montant des provisions sur charges'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Montant total (loyer + charges)'
  },
  changeReason: {
    type: DataTypes.ENUM(
      'initial',           // Création initiale du bail
      'irl_revision',      // Révision IRL
      'tenant_change',     // Changement de locataire
      'work_completion',   // Fin de travaux
      'occupant_change',   // Changement nombre d'occupants
      'charge_increase',   // Augmentation provisions charges
      'rent_decrease',     // Diminution du loyer
      'other'              // Autre raison
    ),
    allowNull: false,
    defaultValue: 'initial',
    comment: 'Raison du changement'
  },
  irlIndex: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    comment: 'Indice IRL utilisé pour la révision'
  },
  irlQuarter: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Trimestre IRL (ex: T1 2024)'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes et commentaires sur le changement'
  }
}, {
  tableName: 'LeaseRentPeriods',
  timestamps: true,
  indexes: [
    {
      fields: ['leaseId', 'startDate']
    },
    {
      fields: ['leaseId', 'endDate']
    }
  ]
});

// Hook pour calculer automatiquement le totalAmount
LeaseRentPeriod.beforeValidate((period) => {
  period.totalAmount = parseFloat(period.rentAmount || 0) + parseFloat(period.chargesAmount || 0);
});

export default LeaseRentPeriod;
