import sequelize from '../config/database.js';
import { User } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Synchronize database
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');

    // Check if admin user exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@gestion-locative.com' } });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@gestion-locative.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@gestion-locative.com');
    console.log('🔑 Password: Admin123!');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seedDatabase();
