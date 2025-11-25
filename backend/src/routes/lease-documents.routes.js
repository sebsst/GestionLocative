import express from 'express';
import upload from '../middleware/upload.middleware.js';
import {
    uploadDocuments,
    getLeaseDocuments,
    downloadDocument,
    deleteDocument
} from '../controllers/lease-documents.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload documents for a lease (multiple files)
router.post('/leases/:id/documents', upload.array('files', 10), uploadDocuments);

// Get all documents for a lease
router.get('/leases/:id/documents', getLeaseDocuments);

// Download a specific document
router.get('/lease-documents/:id/download', downloadDocument);

// Delete a document
router.delete('/lease-documents/:id', deleteDocument);

export default router;
