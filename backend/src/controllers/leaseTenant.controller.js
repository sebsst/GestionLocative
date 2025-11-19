import LeaseTenant from '../models/LeaseTenant.js';
import Tenant from '../models/Tenant.js';
import Lease from '../models/Lease.js';
import Property from '../models/Property.js';

// Get all tenants for a lease
export const getTenantsByLeaseId = async (req, res) => {
  try {
    const { leaseId } = req.params;
    const tenants = await LeaseTenant.findAll({
      where: { leaseId },
      include: [{
        model: Tenant,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      }],
      order: [['isPrimary', 'DESC'], ['startDate', 'DESC']]
    });

    res.json({
      success: true,
      data: tenants
    });
  } catch (error) {
    console.error('Error fetching lease tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des locataires',
      error: error.message
    });
  }
};

// Get current tenants for a lease
export const getCurrentTenantsByLeaseId = async (req, res) => {
  try {
    const { leaseId } = req.params;
    const { Op } = await import('sequelize');

    const tenants = await LeaseTenant.findAll({
      where: {
        leaseId,
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gte]: new Date() } }
        ]
      },
      include: [{
        model: Tenant,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      }],
      order: [['isPrimary', 'DESC'], ['startDate', 'DESC']]
    });

    res.json({
      success: true,
      data: tenants
    });
  } catch (error) {
    console.error('Error fetching current lease tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des locataires actuels',
      error: error.message
    });
  }
};

// Get all leases for a tenant
export const getLeasesByTenantId = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const leases = await LeaseTenant.findAll({
      where: { tenantId },
      include: [{
        model: Lease,
        include: [{
          model: Property,
          attributes: ['id', 'address', 'city', 'postalCode']
        }]
      }],
      order: [['startDate', 'DESC']]
    });

    res.json({
      success: true,
      data: leases
    });
  } catch (error) {
    console.error('Error fetching tenant leases:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des baux du locataire',
      error: error.message
    });
  }
};

// Add a tenant to a lease
export const addTenantToLease = async (req, res) => {
  try {
    const { leaseId, tenantId, isPrimary, startDate, endDate } = req.body;

    if (!leaseId || !tenantId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'leaseId, tenantId et startDate sont requis'
      });
    }

    // If this tenant is set as primary, unset other primary tenants
    if (isPrimary) {
      await LeaseTenant.update(
        { isPrimary: false },
        { where: { leaseId } }
      );
    }

    const leaseTenant = await LeaseTenant.create({
      leaseId,
      tenantId,
      isPrimary: isPrimary || false,
      startDate,
      endDate: endDate || null
    });

    res.status(201).json({
      success: true,
      message: 'Locataire ajouté au bail avec succès',
      data: leaseTenant
    });
  } catch (error) {
    console.error('Error adding tenant to lease:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du locataire au bail',
      error: error.message
    });
  }
};

// Update a lease-tenant relationship
export const updateLeaseTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPrimary, startDate, endDate } = req.body;

    const leaseTenant = await LeaseTenant.findByPk(id);

    if (!leaseTenant) {
      return res.status(404).json({
        success: false,
        message: 'Relation locataire-bail non trouvée'
      });
    }

    // If setting as primary, unset other primary tenants in the same lease
    if (isPrimary && !leaseTenant.isPrimary) {
      await LeaseTenant.update(
        { isPrimary: false },
        { where: { leaseId: leaseTenant.leaseId } }
      );
    }

    await leaseTenant.update({
      isPrimary,
      startDate,
      endDate
    });

    res.json({
      success: true,
      message: 'Relation locataire-bail mise à jour avec succès',
      data: leaseTenant
    });
  } catch (error) {
    console.error('Error updating lease-tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// Remove a tenant from a lease
export const removeTenantFromLease = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await LeaseTenant.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Relation locataire-bail non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Locataire retiré du bail avec succès'
    });
  } catch (error) {
    console.error('Error removing tenant from lease:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait du locataire',
      error: error.message
    });
  }
};

// Set a tenant as primary for a lease
export const setPrimaryTenant = async (req, res) => {
  try {
    const { leaseId, tenantId } = req.body;

    if (!leaseId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'leaseId et tenantId sont requis'
      });
    }

    // Unset all primary tenants for this lease
    await LeaseTenant.update(
      { isPrimary: false },
      { where: { leaseId } }
    );

    // Set the specified tenant as primary
    await LeaseTenant.update(
      { isPrimary: true },
      { where: { leaseId, tenantId } }
    );

    res.json({
      success: true,
      message: 'Locataire principal défini avec succès'
    });
  } catch (error) {
    console.error('Error setting primary tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la définition du locataire principal',
      error: error.message
    });
  }
};
