import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Lease = sequelize.define('Lease', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Properties',
      key: 'id'
    }
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  chargesAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  deposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  numberOfOccupants: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  leaseDocument: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('actif', 'termine', 'resilie'),
    defaultValue: 'actif'
  },
  closureReason: {
    type: DataTypes.ENUM(
      'normal_end',           // Fin normale du bail
      'tenant_termination',   // Résiliation par le locataire
      'owner_termination',    // Résiliation par le propriétaire
      'mutual_agreement',     // Accord mutuel
      'other'                 // Autre
    ),
    allowNull: true,
    comment: 'Motif de clôture du bail'
  },
  closureNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes sur la clôture du bail'
  },
  depositReturned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Dépôt de garantie restitué'
  },
  depositReturnedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de restitution du dépôt'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

export default Lease;
