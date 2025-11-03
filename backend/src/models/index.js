import User from './User.js';
import Property from './Property.js';
import Tenant from './Tenant.js';
import Lease from './Lease.js';
import LeaseOccupant from './LeaseOccupant.js';
import Rent from './Rent.js';
import Communication from './Communication.js';
import Charge from './Charge.js';
import ChargeDistribution from './ChargeDistribution.js';
import Work from './Work.js';
import Artisan from './Artisan.js';
import Quote from './Quote.js';
import PropertyRentHistory from './PropertyRentHistory.js';

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

export {
  User,
  Property,
  Tenant,
  Lease,
  LeaseOccupant,
  Rent,
  Communication,
  Charge,
  ChargeDistribution,
  Work,
  Artisan,
  Quote,
  PropertyRentHistory
};
