import { Router } from 'express';
import { getMyInvoices, getInvoiceById } from '../controllers/invoices.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateToken, getMyInvoices);
router.get('/:id', authenticateToken, getInvoiceById);

export default router;
