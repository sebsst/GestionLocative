import { LeaseDocument, Lease } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload documents for a lease
 */
export const uploadDocuments = async (req, res) => {
    try {
        const { id: leaseId } = req.params;
        const { category, description } = req.body;

        // Verify lease exists
        const lease = await Lease.findByPk(leaseId);
        if (!lease) {
            // Delete uploaded files if lease doesn't exist
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Bail non trouvé'
            });
        }

        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier uploadé'
            });
        }

        // Create document records
        const documents = await Promise.all(
            req.files.map(file =>
                LeaseDocument.create({
                    leaseId,
                    category: category || 'other',
                    filename: file.filename,
                    originalName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    filePath: `uploads/leases/${file.filename}`,
                    description: description || null
                })
            )
        );

        res.status(201).json({
            success: true,
            message: `${documents.length} document(s) uploadé(s) avec succès`,
            data: documents
        });
    } catch (error) {
        console.error('Error uploading documents:', error);

        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload des documents',
            error: error.message
        });
    }
};

/**
 * Get all documents for a lease
 */
export const getLeaseDocuments = async (req, res) => {
    try {
        const { id: leaseId } = req.params;

        // Verify lease exists
        const lease = await Lease.findByPk(leaseId);
        if (!lease) {
            return res.status(404).json({
                success: false,
                message: 'Bail non trouvé'
            });
        }

        const documents = await LeaseDocument.findAll({
            where: { leaseId },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Error fetching lease documents:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des documents',
            error: error.message
        });
    }
};

/**
 * Download a document
 */
export const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await LeaseDocument.findByPk(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        const filePath = path.join(__dirname, '../../', document.filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Fichier non trouvé sur le serveur'
            });
        }

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
        res.setHeader('Content-Type', document.mimeType);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du téléchargement du document',
            error: error.message
        });
    }
};

/**
 * Delete a document
 */
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await LeaseDocument.findByPk(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        const filePath = path.join(__dirname, '../../', document.filePath);

        // Delete file from filesystem
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete record from database
        await document.destroy();

        res.json({
            success: true,
            message: 'Document supprimé avec succès'
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du document',
            error: error.message
        });
    }
};
