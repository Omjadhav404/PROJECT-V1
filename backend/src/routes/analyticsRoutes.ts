import { Router } from 'express';
import { getUptimeAnalytics, getLiveNetworkStatus } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/uptime', getUptimeAnalytics);
router.get('/live-status', getLiveNetworkStatus);

export default router;
