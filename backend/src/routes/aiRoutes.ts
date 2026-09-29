import { Router } from 'express';
import { diagnoseNetwork, generateReport, advisorChat } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post('/diagnose', diagnoseNetwork);
router.post('/report', generateReport);
router.post('/chat', advisorChat);

export default router;
