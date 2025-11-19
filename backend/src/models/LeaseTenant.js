import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const LeaseTenant = sequelize.define('LeaseTenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  leaseId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'lease_id'
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id'
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_primary'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date'
  }
}, {
  tableName: 'LeaseTenantsRelations',
  timestamps: true
});

export default LeaseTenant;
