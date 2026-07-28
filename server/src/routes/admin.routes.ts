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

import si from 'systeminformation';

router.get('/server-health', async (req, res) => {
  try {
    const [cpu, mem, fsSize, networkStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats()
    ]);
    
    // Aggregate disk space from all filesystems
    let totalSize = 0;
    let totalUsed = 0;
    fsSize.forEach(fs => {
      if (fs.type !== 'squashfs' && fs.size > 0) { // filter out snap mounts
        totalSize += fs.size;
        totalUsed += fs.used;
      }
    });

    res.json({
      cpu: cpu.currentLoad,
      memory: {
        total: mem.total,
        used: mem.active
      },
      disk: {
        total: totalSize,
        used: totalUsed
      },
      network: {
        rx: networkStats[0]?.rx_sec || 0,
        tx: networkStats[0]?.tx_sec || 0
      }
    });
  } catch (err) {
    console.error('Server health error:', err);
    res.status(500).json({ error: 'Failed to fetch server health' });
  }
});

export default router;
