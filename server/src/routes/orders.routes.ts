import { Router } from 'express';
import { createOrder, handleWebhook, getOrder } from '../controllers/orders.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createOrder);
router.post('/webhook', handleWebhook); // In production, use express.raw for signature verification
router.get('/:id', authenticateToken, getOrder);

export default router;
