import express from 'express';
import { getRecentActivities } from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get recent activities
router.get('/recent', getRecentActivities);

export default router;
