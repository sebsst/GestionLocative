import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as searchController from '../controllers/search.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', searchController.globalSearch);

export default router;
