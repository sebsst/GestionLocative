import { Op } from 'sequelize';
import { Property, Tenant, Lease } from '../models/index.js';

export const globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({
                success: true,
                data: {
                    properties: [],
                    tenants: [],
                    leases: []
                }
            });
        }

        const searchTerm = q.trim();
        const searchPattern = `%${searchTerm}%`;

        // Search properties
        const properties = await Property.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: searchPattern } },
                    { address: { [Op.iLike]: searchPattern } },
                    { city: { [Op.iLike]: searchPattern } },
                    { postalCode: { [Op.iLike]: searchPattern } }
                ]
            },
            limit: 5,
            order: [['name', 'ASC']]
        });

        // Search tenants
        const tenants = await Tenant.findAll({
            where: {
                [Op.or]: [
                    { firstName: { [Op.iLike]: searchPattern } },
                    { lastName: { [Op.iLike]: searchPattern } },
                    { email: { [Op.iLike]: searchPattern } },
                    { phone: { [Op.iLike]: searchPattern } },
                    { mobile: { [Op.iLike]: searchPattern } }
                ]
            },
            limit: 5,
            order: [['lastName', 'ASC'], ['firstName', 'ASC']]
        });

        // Search leases (by property or tenant)
        const leases = await Lease.findAll({
            include: [
                {
                    model: Property,
                    as: 'Property',
                    where: {
                        [Op.or]: [
                            { name: { [Op.iLike]: searchPattern } },
                            { address: { [Op.iLike]: searchPattern } }
                        ]
                    },
                    required: false
                },
                {
                    model: Tenant,
                    as: 'Tenant',
                    where: {
                        [Op.or]: [
                            { firstName: { [Op.iLike]: searchPattern } },
                            { lastName: { [Op.iLike]: searchPattern } }
                        ]
                    },
                    required: false
                }
            ],
            where: {
                [Op.or]: [
                    { '$Property.name$': { [Op.iLike]: searchPattern } },
                    { '$Property.address$': { [Op.iLike]: searchPattern } },
                    { '$Tenant.firstName$': { [Op.iLike]: searchPattern } },
                    { '$Tenant.lastName$': { [Op.iLike]: searchPattern } }
                ]
            },
            limit: 5,
            order: [['startDate', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                properties: properties.map(p => ({
                    id: p.id,
                    name: p.name,
                    address: p.address,
                    city: p.city,
                    postalCode: p.postalCode,
                    type: p.type,
                    status: p.status
                })),
                tenants: tenants.map(t => ({
                    id: t.id,
                    firstName: t.firstName,
                    lastName: t.lastName,
                    email: t.email,
                    phone: t.phone || t.mobile
                })),
                leases: leases.map(l => ({
                    id: l.id,
                    propertyId: l.propertyId,
                    propertyName: l.Property?.name,
                    tenantName: `${l.Tenant?.firstName} ${l.Tenant?.lastName}`,
                    startDate: l.startDate,
                    endDate: l.endDate,
                    status: l.status
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};
