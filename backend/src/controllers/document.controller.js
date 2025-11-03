import { Tenant, Lease, Property, Rent } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import * as pdfService from '../services/pdf.service.js';
import * as emailService from '../services/email.service.js';

export const generateRentReminder = async (req, res, next) => {
  try {
    const { rentId } = req.params;

    const rent = await Rent.findByPk(rentId, {
      include: [
        {
          model: Lease,
          include: [
            { model: Property },
            { model: Tenant }
          ]
        }
      ]
    });

    if (!rent) {
      throw new AppError('Loyer non trouvé', 404);
    }

    const pdfBuffer = await pdfService.generateRentReminder(
      rent.Lease.Tenant,
      rent.Lease,
      rent.Lease.Property,
      rent
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rappel-loyer-${rent.month}-${rent.year}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const sendRentReminder = async (req, res, next) => {
  try {
    const { rentId } = req.params;

    const rent = await Rent.findByPk(rentId, {
      include: [
        {
          model: Lease,
          include: [
            { model: Property },
            { model: Tenant }
          ]
        }
      ]
    });

    if (!rent) {
      throw new AppError('Loyer non trouvé', 404);
    }

    const tenant = rent.Lease.Tenant;

    if (!tenant.email) {
      throw new AppError('Le locataire n\'a pas d\'adresse email', 400);
    }

    await emailService.sendRentReminder(tenant, rent.Lease, rent);

    res.json({
      success: true,
      message: 'Rappel envoyé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const generateLateRentNotice = async (req, res, next) => {
  try {
    const { rentId } = req.params;

    const rent = await Rent.findByPk(rentId, {
      include: [
        {
          model: Lease,
          include: [
            { model: Property },
            { model: Tenant }
          ]
        }
      ]
    });

    if (!rent) {
      throw new AppError('Loyer non trouvé', 404);
    }

    const pdfBuffer = await pdfService.generateLateRentNotice(
      rent.Lease.Tenant,
      rent.Lease,
      rent.Lease.Property,
      rent
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=mise-en-demeure-${rent.month}-${rent.year}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const sendLateRentNotice = async (req, res, next) => {
  try {
    const { rentId } = req.params;

    const rent = await Rent.findByPk(rentId, {
      include: [
        {
          model: Lease,
          include: [
            { model: Property },
            { model: Tenant }
          ]
        }
      ]
    });

    if (!rent) {
      throw new AppError('Loyer non trouvé', 404);
    }

    const tenant = rent.Lease.Tenant;

    if (!tenant.email) {
      throw new AppError('Le locataire n\'a pas d\'adresse email', 400);
    }

    const pdfBuffer = await pdfService.generateLateRentNotice(
      tenant,
      rent.Lease,
      rent.Lease.Property,
      rent
    );

    await emailService.sendEmail({
      to: tenant.email,
      subject: 'Mise en demeure - Loyer impayé',
      text: 'Veuillez trouver ci-joint la mise en demeure pour loyer impayé.',
      attachments: [
        {
          filename: `mise-en-demeure-${rent.month}-${rent.year}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    res.json({
      success: true,
      message: 'Mise en demeure envoyée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

export const generateLeaseContract = async (req, res, next) => {
  try {
    const { leaseId } = req.params;

    const lease = await Lease.findByPk(leaseId, {
      include: [
        { model: Property },
        { model: Tenant }
      ]
    });

    if (!lease) {
      throw new AppError('Bail non trouvé', 404);
    }

    const pdfBuffer = await pdfService.generateLeaseContract(
      lease,
      lease.Tenant,
      lease.Property
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrat-location-${lease.Tenant.lastName}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
