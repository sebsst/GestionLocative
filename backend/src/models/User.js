import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailSmtpHost: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailSmtpPort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 587
  },
  emailSmtpSecure: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  emailSmtpUser: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailSmtpPass: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailFrom: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emailConfigured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.emailSmtpPass;
  return values;
};

export default User;
