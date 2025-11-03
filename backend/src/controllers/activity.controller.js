import { Lease, Rent, Work, Property, Tenant } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get recent activities
 * Returns a timeline of recent activities across the application
 */
export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activities = [];

    // Get recent leases (last 30 days)
    const recentLeases = await Lease.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: [
        {
          model: Tenant,
          attributes: ['firstName', 'lastName']
        },
        {
          model: Property,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    recentLeases.forEach(lease => {
      activities.push({
        type: 'lease',
        title: 'Nouveau bail créé',
        description: `${lease.Tenant.firstName} ${lease.Tenant.lastName} - ${lease.Property.name}`,
        date: lease.createdAt,
        icon: 'pi-file-edit',
        severity: 'info'
      });
    });

    // Get recent rent payments (last 30 days)
    const recentRents = await Rent.findAll({
      where: {
        status: 'paye',
        paymentDate: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          [Op.ne]: null
        }
      },
      include: [
        {
          model: Lease,
          include: [
            {
              model: Tenant,
              attributes: ['firstName', 'lastName']
            },
            {
              model: Property,
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['paymentDate', 'DESC']],
      limit: 10
    });

    recentRents.forEach(rent => {
      activities.push({
        type: 'rent',
        title: 'Paiement de loyer reçu',
        description: `${rent.Lease.Tenant.firstName} ${rent.Lease.Tenant.lastName} - ${rent.month}/${rent.year} (${rent.Lease.Property.name})`,
        date: rent.paymentDate,
        icon: 'pi-check-circle',
        severity: 'success'
      });
    });

    // Get recent works (last 30 days)
    const recentWorks = await Work.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: [
        {
          model: Property,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    recentWorks.forEach(work => {
      let title = 'Nouveau travail';
      let severity = 'info';

      if (work.status === 'termine') {
        title = 'Travail terminé';
        severity = 'success';
      } else if (work.status === 'en_cours') {
        title = 'Travail en cours';
        severity = 'warning';
      }

      activities.push({
        type: 'work',
        title: title,
        description: `${work.title} - ${work.Property.name}`,
        date: work.status === 'termine' ? work.completionDate : work.createdAt,
        icon: 'pi-wrench',
        severity: severity
      });
    });

    // Get terminated leases (last 30 days)
    const terminatedLeases = await Lease.findAll({
      where: {
        status: 'termine',
        endDate: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          [Op.ne]: null
        }
      },
      include: [
        {
          model: Tenant,
          attributes: ['firstName', 'lastName']
        },
        {
          model: Property,
          attributes: ['name']
        }
      ],
      order: [['endDate', 'DESC']],
      limit: 10
    });

    terminatedLeases.forEach(lease => {
      activities.push({
        type: 'lease_end',
        title: 'Fin de bail',
        description: `${lease.Tenant.firstName} ${lease.Tenant.lastName} - ${lease.Property.name}`,
        date: lease.endDate,
        icon: 'pi-sign-out',
        severity: 'warning'
      });
    });

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit the number of activities
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des activités récentes',
        details: error.message
      }
    });
  }
};
