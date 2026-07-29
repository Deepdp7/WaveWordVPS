import { Router } from 'express';
import {
  getPlans, createPlan, updatePlan, deletePlan,
  getCustomers, getOrders, refundOrder, deleteOrder,
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
router.delete('/orders/:id', deleteOrder);

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
    const [cpu, mem, fsSize, networkStats, temp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.cpuTemperature()
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
      temperature: temp.main || temp.cores[0] || -1,
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

import fs from 'fs/promises';
import path from 'path';

router.get('/fs/list', async (req, res) => {
  try {
    const targetPath = req.query.path as string || '/home/deepdp';
    const files = await fs.readdir(targetPath, { withFileTypes: true });
    
    const fileList = await Promise.all(files.map(async (file) => {
      const filePath = path.join(targetPath, file.name);
      try {
        const stats = await fs.stat(filePath);
        return {
          name: file.name,
          isDirectory: file.isDirectory(),
          size: stats.size,
          mtime: stats.mtime
        };
      } catch (e) {
        return { name: file.name, isDirectory: file.isDirectory(), size: 0, mtime: new Date() };
      }
    }));
    
    // Sort directories first, then alphabetically
    fileList.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory ? -1 : 1;
    });

    res.json(fileList);
  } catch (err) {
    console.error('FS list error:', err);
    res.status(500).json({ error: 'Failed to list directory', details: (err as Error).message });
  }
});

router.post('/fs/mkdir', async (req, res) => {
  try {
    const { dirPath, name } = req.body;
    await fs.mkdir(path.join(dirPath, name));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

router.post('/fs/create', async (req, res) => {
  try {
    const { dirPath, name, content = '' } = req.body;
    await fs.writeFile(path.join(dirPath, name), content);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create file' });
  }
});

router.post('/fs/delete', async (req, res) => {
  try {
    const { targetPath } = req.body;
    await fs.rm(targetPath, { recursive: true, force: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

import multer from 'multer';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetPath = req.query.path as string || '/home/deepdp';
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.post('/fs/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }
  res.json({ success: true, count: (req.files as Express.Multer.File[]).length });
});

router.post('/ai/command', async (req, res) => {
  try {
    const { command, password } = req.body;
    let output = '';

    const executeSudo = async (cmd: string) => {
      if (!password) {
        return res.json({ success: true, requirePassword: true, output: 'This action requires sudo privileges. Please provide your sudo password.' });
      }
      try {
        const { stdout, stderr } = await execPromise(`echo "${password}" | sudo -S ${cmd}`);
        output = stdout || stderr || 'Command executed successfully.';
        res.json({ success: true, output });
      } catch (err: any) {
        if (err.message.includes('incorrect password') || err.message.includes('Authentication failed')) {
          res.json({ success: false, requirePassword: true, error: 'Incorrect sudo password. Please try again.' });
        } else {
          res.json({ success: false, error: err.message });
        }
      }
    };

    switch (command) {
      case 'Restart server':
        const { stdout: restartOut } = await execPromise('pm2 restart all');
        output = restartOut;
        res.json({ success: true, output });
        break;
      case 'Restart nginx':
        await executeSudo('systemctl restart nginx');
        return;
      case 'Reboot':
        await executeSudo('reboot');
        return;
      case 'Shutdown':
        await executeSudo('poweroff');
        return;
      default:
        output = "Command not recognized by the Smart Macro Assistant.";
        res.json({ success: true, output });
    }

  } catch (err: any) {
    res.status(500).json({ error: 'Command failed', details: err.message });
  }
});

router.get('/domains', async (req, res) => {
  try {
    // Read the Cloudflare Tunnel config
    // In a real environment, you might need to locate the correct config.yml dynamically
    const cloudflaredDir = '/home/deepdp/.cloudflared';
    const files = await fs.readdir(cloudflaredDir);
    const configFile = files.find(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    
    if (!configFile) {
      return res.json([]);
    }

    const configContent = await fs.readFile(path.join(cloudflaredDir, configFile), 'utf-8');
    
    // Parse YAML ingress rules simply using Regex
    const domains = [];
    const regex = /-\s*hostname:\s*([^\s]+)\s*service:\s*([^\s]+)/g;
    let match;
    while ((match = regex.exec(configContent)) !== null) {
      domains.push({
        hostname: match[1],
        service: match[2]
      });
    }

    res.json(domains);
  } catch (err: any) {
    console.error('Failed to fetch domains:', err);
    res.status(500).json({ error: 'Failed to fetch domains', details: err.message });
  }
});

export default router;
