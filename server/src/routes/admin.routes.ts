import { Router } from 'express';
import {
  getPlans, createPlan, updatePlan, deletePlan,
  getCustomers, getOrders, refundOrder,
  getSubscriptions, updateSubscription,
  getVpsInstances, provisionVps,
  getSupportTickets, updateSupportTicket
} from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

router.get('/customers', getCustomers);
router.get('/orders', getOrders);
router.post('/orders/:id/refund', refundOrder);

router.get('/subscriptions', getSubscriptions);
router.put('/subscriptions/:id', updateSubscription);

router.get('/vps', getVpsInstances);
router.put('/vps/:id/provision', provisionVps);

router.post('/reset-db', requireAdmin, async (req, res, next) => {
  const { resetDatabase } = await import('../controllers/admin.controller');
  resetDatabase(req, res).catch(next);
});

router.get('/support/tickets', getSupportTickets);
router.put('/support/tickets/:id', updateSupportTicket);

export default router;
