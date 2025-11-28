import { sequelize } from '../config/database.js';
import '../models/index.js'; // Import all models

async function syncDatabase() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected successfully\n');

        console.log('🔄 Synchronizing database schema...');
        console.log('⚠️  This will create missing tables and columns');
        console.log('⚠️  Existing data will be preserved\n');

        // Sync with alter: true to update existing tables
        await sequelize.sync({ alter: true });

        console.log('\n✅ Database synchronized successfully!');
        console.log('📊 All tables and columns are now up to date\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error synchronizing database:', error);
        process.exit(1);
    }
}

syncDatabase();
