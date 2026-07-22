import { Router } from 'express';
import { getMySubscriptions, cancelSubscription } from '../controllers/subscriptions.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateToken, getMySubscriptions);
router.post('/:id/cancel', authenticateToken, cancelSubscription);

export default router;
