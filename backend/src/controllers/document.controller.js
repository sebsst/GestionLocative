import { Document, Property, Tenant, Lease, Rent } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import * as pdfService from '../services/pdf.service.js';
import * as emailService from '../services/email.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all documents for a property
 */
export const getPropertyDocuments = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const documents = await Document.findAll({
      where: { propertyId },
      include: [
        {
          model: Property,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single document
 */
export const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: Property,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!document) {
      throw new AppError('Document non trouvé', 404);
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a document for a property
 */
export const uploadDocument = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { name, type, description, url } = req.body;

    if (!req.file && !url) {
      throw new AppError('Aucun fichier ou URL fourni', 400);
    }

    // Verify property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new AppError('Bien non trouvé', 404);
    }

    const document = await Document.create({
      propertyId,
      name: name || (req.file ? req.file.originalname : 'Lien externe'),
      originalName: req.file ? req.file.originalname : null,
      fileName: req.file ? req.file.filename : null,
      filePath: req.file ? req.file.path : null,
      fileSize: req.file ? req.file.size : null,
      mimeType: req.file ? req.file.mimetype : null,
      type: type || 'autre',
      description,
      url
    });

    const createdDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: Property,
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdDocument
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update document metadata
 */
export const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, description, url } = req.body;

    const document = await Document.findByPk(id);
    if (!document) {
      throw new AppError('Document non trouvé', 404);
    }

    await document.update({
      name,
      type,
      description,
      url
    });

    const updatedDocument = await Document.findByPk(id, {
      include: [
        {
          model: Property,
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedDocument
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download a document
 */
export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);
    if (!document) {
      throw new AppError('Document non trouvé', 404);
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      throw new AppError('Fichier non trouvé sur le serveur', 404);
    }

    // Set headers for download
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);

    // Stream the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);
    if (!document) {
      throw new AppError('Document non trouvé', 404);
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete database record
    await document.destroy();

    res.json({
      success: true,
      message: 'Document supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate rent reminder PDF
 */
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

/**
 * Send rent reminder email
 */
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

/**
 * Generate late rent notice PDF
 */
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

/**
 * Send late rent notice email
 */
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

/**
 * Generate lease contract PDF
 */
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