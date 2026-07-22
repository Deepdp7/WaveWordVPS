import { Router } from 'express';
import { createTicket, getMyTickets } from '../controllers/support.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createTicket);
router.get('/me', authenticateToken, getMyTickets);

export default router;
