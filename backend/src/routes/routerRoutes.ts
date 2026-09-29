import { Router } from 'express';
import { getRouters, createRouter, deleteRouter } from '../controllers/routerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getRouters);
router.post('/', createRouter);
router.delete('/:id', deleteRouter);

export default router;
