import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Communication = sequelize.define('Communication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('appel', 'courrier', 'sms', 'email'),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('envoye', 'recu', 'lu'),
    defaultValue: 'envoye'
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true
});

export default Communication;
