import User from './User.js';
import Property from './Property.js';
import Tenant from './Tenant.js';
import Lease from './Lease.js';
import LeaseOccupant from './LeaseOccupant.js';
import LeaseOccupancyPeriod from './LeaseOccupancyPeriod.js';
import LeaseRentPeriod from './LeaseRentPeriod.js';
import LeaseTenant from './LeaseTenant.js';
import Rent from './Rent.js';
import Communication from './Communication.js';
import Charge from './Charge.js';
import ChargeDistribution from './ChargeDistribution.js';
import ChargeAllocation from './ChargeAllocation.js';
import ChargeRegularization from './ChargeRegularization.js';
import ChargeRegularizationDetail from './ChargeRegularizationDetail.js';
import Work from './Work.js';
import Artisan from './Artisan.js';
import Quote from './Quote.js';
import PropertyRentHistory from './PropertyRentHistory.js';
import FiscalDeclaration from './FiscalDeclaration.js';
import Document from './Document.js';
import LeaseDocument from './LeaseDocument.js';

// Property associations
Property.belongsTo(Property, { as: 'building', foreignKey: 'buildingId' });
Property.hasMany(Property, { as: 'apartments', foreignKey: 'buildingId' });

// Lease associations
Property.hasMany(Lease, { foreignKey: 'propertyId' });
Lease.belongsTo(Property, { foreignKey: 'propertyId' });

Tenant.hasMany(Lease, { foreignKey: 'tenantId' });
Lease.belongsTo(Tenant, { foreignKey: 'tenantId' });

// Lease occupants
Lease.hasMany(LeaseOccupant, { foreignKey: 'leaseId', as: 'occupants' });
LeaseOccupant.belongsTo(Lease, { foreignKey: 'leaseId' });

// Lease occupancy periods
Lease.hasMany(LeaseOccupancyPeriod, { foreignKey: 'leaseId', as: 'occupancyPeriods' });
LeaseOccupancyPeriod.belongsTo(Lease, { foreignKey: 'leaseId' });

// Lease rent periods
Lease.hasMany(LeaseRentPeriod, { foreignKey: 'leaseId', as: 'rentPeriods' });
LeaseRentPeriod.belongsTo(Lease, { foreignKey: 'leaseId' });

// Rent associations
Lease.hasMany(Rent, { foreignKey: 'leaseId' });
Rent.belongsTo(Lease, { foreignKey: 'leaseId' });

// Communication associations
Tenant.hasMany(Communication, { foreignKey: 'tenantId' });
Communication.belongsTo(Tenant, { foreignKey: 'tenantId' });

// Charge associations
Property.hasMany(Charge, { foreignKey: 'propertyId' });
Charge.belongsTo(Property, { foreignKey: 'propertyId' });

Charge.hasMany(ChargeDistribution, { foreignKey: 'chargeId', as: 'distributions' });
ChargeDistribution.belongsTo(Charge, { foreignKey: 'chargeId' });
ChargeDistribution.belongsTo(Property, { foreignKey: 'propertyId' });
ChargeDistribution.belongsTo(Lease, { foreignKey: 'leaseId' });
Lease.hasMany(ChargeDistribution, { foreignKey: 'leaseId', as: 'chargeDistributions' });

// ChargeAllocation associations
Charge.hasMany(ChargeAllocation, { foreignKey: 'chargeId', as: 'allocations' });
ChargeAllocation.belongsTo(Charge, { foreignKey: 'chargeId' });
ChargeAllocation.belongsTo(Lease, { foreignKey: 'leaseId' });
Lease.hasMany(ChargeAllocation, { foreignKey: 'leaseId', as: 'chargeAllocations' });

// Work associations
Property.hasMany(Work, { foreignKey: 'propertyId' });
Work.belongsTo(Property, { foreignKey: 'propertyId' });

Artisan.hasMany(Work, { foreignKey: 'artisanId' });
Work.belongsTo(Artisan, { foreignKey: 'artisanId' });

// Quote associations
Property.hasMany(Quote, { foreignKey: 'propertyId' });
Quote.belongsTo(Property, { foreignKey: 'propertyId' });

Artisan.hasMany(Quote, { foreignKey: 'artisanId' });
Quote.belongsTo(Artisan, { foreignKey: 'artisanId' });

// PropertyRentHistory associations
Property.hasMany(PropertyRentHistory, { foreignKey: 'propertyId', as: 'rentHistory' });
PropertyRentHistory.belongsTo(Property, { foreignKey: 'propertyId' });

// ChargeRegularization associations
Lease.hasMany(ChargeRegularization, { foreignKey: 'leaseId', as: 'chargeRegularizations' });
ChargeRegularization.belongsTo(Lease, { foreignKey: 'leaseId' });

ChargeRegularization.hasMany(ChargeRegularizationDetail, { foreignKey: 'regularizationId', as: 'details' });
ChargeRegularizationDetail.belongsTo(ChargeRegularization, { foreignKey: 'regularizationId' });

// Document associations
Property.hasMany(Document, { foreignKey: 'propertyId', as: 'documents' });
Document.belongsTo(Property, { foreignKey: 'propertyId' });

// LeaseDocument associations
Lease.hasMany(LeaseDocument, { foreignKey: 'leaseId', as: 'documents' });
LeaseDocument.belongsTo(Lease, { foreignKey: 'leaseId' });

// LeaseTenant associations (many-to-many between Lease and Tenant)
Lease.hasMany(LeaseTenant, { foreignKey: 'leaseId', as: 'leaseTenantsRelations' });
LeaseTenant.belongsTo(Lease, { foreignKey: 'leaseId' });

Tenant.hasMany(LeaseTenant, { foreignKey: 'tenantId', as: 'tenantLeasesRelations' });
LeaseTenant.belongsTo(Tenant, { foreignKey: 'tenantId' });

export {
  User,
  Property,
  Tenant,
  Lease,
  LeaseOccupant,
  LeaseOccupancyPeriod,
  LeaseRentPeriod,
  LeaseTenant,
  Rent,
  Communication,
  Charge,
  ChargeDistribution,
  ChargeAllocation,
  ChargeRegularization,
  ChargeRegularizationDetail,
  Work,
  Artisan,
  Quote,
  PropertyRentHistory,
  FiscalDeclaration,
  Document,
  LeaseDocument
};
