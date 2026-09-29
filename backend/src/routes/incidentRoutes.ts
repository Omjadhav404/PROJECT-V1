import { Router } from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident
} from '../controllers/incidentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', createIncident);
router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.patch('/:id', updateIncident);
router.delete('/:id', deleteIncident);

export default router;
