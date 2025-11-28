import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import propertyRoutes from './routes/property.routes.js';
import propertyRentHistoryRoutes from './routes/propertyRentHistory.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import leaseRoutes from './routes/lease.routes.js';
import leaseOccupancyPeriodRoutes from './routes/leaseOccupancyPeriod.routes.js';
import leaseRentPeriodRoutes from './routes/leaseRentPeriod.routes.js';
import leaseTenantRoutes from './routes/leaseTenant.routes.js';
import rentRoutes from './routes/rent.routes.js';
import chargeRoutes from './routes/charge.routes.js';
import chargeAllocationRoutes from './routes/chargeAllocation.routes.js';
import chargeRegularizationRoutes from './routes/chargeRegularization.routes.js';
import workRoutes from './routes/work.routes.js';
import documentRoutes from './routes/document.routes.js';
import fiscalRoutes from './routes/fiscal.routes.js';
import fiscalDeclarationRoutes from './routes/fiscalDeclaration.routes.js';
import activityRoutes from './routes/activity.routes.js';
import dataRoutes from './routes/data.routes.js';
import searchRoutes from './routes/search.routes.js';
import leaseDocumentsRoutes from './routes/lease-documents.routes.js';
import userAccessRoutes from './routes/user-access.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/property-rent', propertyRentHistoryRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/lease-occupancy-periods', leaseOccupancyPeriodRoutes);
app.use('/api/lease-rent-periods', leaseRentPeriodRoutes);
app.use('/api/lease-tenants', leaseTenantRoutes);
app.use('/api/rents', rentRoutes);
app.use('/api/charges', chargeRoutes);
app.use('/api/charge-allocations', chargeAllocationRoutes);
app.use('/api/charge-regularizations', chargeRegularizationRoutes);
app.use('/api/works', workRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/fiscal', fiscalRoutes);
app.use('/api/fiscal-declarations', fiscalDeclarationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', leaseDocumentsRoutes);
app.use('/api', userAccessRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database (in production, use migrations)
    if (process.env.NODE_ENV === 'development') {
      // Sync with force: false to avoid ALTER issues on existing tables
      // Use migrations scripts for ChargeRegularization tables
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

export default app;
