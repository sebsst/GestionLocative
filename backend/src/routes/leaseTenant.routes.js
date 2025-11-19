import express from 'express';
import {
  getTenantsByLeaseId,
  getCurrentTenantsByLeaseId,
  getLeasesByTenantId,
  addTenantToLease,
  updateLeaseTenant,
  removeTenantFromLease,
  setPrimaryTenant
} from '../controllers/leaseTenant.controller.js';

const router = express.Router();

// Get all tenants for a lease
router.get('/lease/:leaseId', getTenantsByLeaseId);

// Get current tenants for a lease
router.get('/lease/:leaseId/current', getCurrentTenantsByLeaseId);

// Get all leases for a tenant
router.get('/tenant/:tenantId', getLeasesByTenantId);

// Add a tenant to a lease
router.post('/', addTenantToLease);

// Update a lease-tenant relationship
router.put('/:id', updateLeaseTenant);

// Remove a tenant from a lease
router.delete('/:id', removeTenantFromLease);

// Set primary tenant
router.post('/set-primary', setPrimaryTenant);

export default router;
