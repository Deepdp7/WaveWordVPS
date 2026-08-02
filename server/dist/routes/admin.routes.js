"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken, auth_1.requireAdmin);
router.get('/plans', admin_controller_1.getPlans);
router.post('/plans', admin_controller_1.createPlan);
router.put('/plans/:id', admin_controller_1.updatePlan);
router.delete('/plans/:id', admin_controller_1.deletePlan);
router.get('/customers', admin_controller_1.getCustomers);
router.get('/orders', admin_controller_1.getOrders);
router.post('/orders/:id/refund', admin_controller_1.refundOrder);
router.delete('/orders/:id', admin_controller_1.deleteOrder);
router.get('/subscriptions', admin_controller_1.getSubscriptions);
router.put('/subscriptions/:id', admin_controller_1.updateSubscription);
router.get('/vps', admin_controller_1.getVpsInstances);
router.put('/vps/:id/provision', admin_controller_1.provisionVps);
router.post('/reset-db', auth_1.requireAdmin, async (req, res, next) => {
    const { resetDatabase } = await Promise.resolve().then(() => __importStar(require('../controllers/admin.controller')));
    resetDatabase(req, res).catch(next);
});
router.get('/support/tickets', admin_controller_1.getSupportTickets);
router.put('/support/tickets/:id', admin_controller_1.updateSupportTicket);
const systeminformation_1 = __importDefault(require("systeminformation"));
router.get('/server-health', async (req, res) => {
    try {
        const [cpu, mem, fsSize, networkStats, temp] = await Promise.all([
            systeminformation_1.default.currentLoad(),
            systeminformation_1.default.mem(),
            systeminformation_1.default.fsSize(),
            systeminformation_1.default.networkStats(),
            systeminformation_1.default.cpuTemperature()
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
    }
    catch (err) {
        console.error('Server health error:', err);
        res.status(500).json({ error: 'Failed to fetch server health' });
    }
});
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
router.get('/fs/list', async (req, res) => {
    try {
        const targetPath = req.query.path || '/home/deepdp';
        const files = await promises_1.default.readdir(targetPath, { withFileTypes: true });
        const fileList = await Promise.all(files.map(async (file) => {
            const filePath = path_1.default.join(targetPath, file.name);
            try {
                const stats = await promises_1.default.stat(filePath);
                return {
                    name: file.name,
                    isDirectory: file.isDirectory(),
                    size: stats.size,
                    mtime: stats.mtime
                };
            }
            catch (e) {
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
    }
    catch (err) {
        console.error('FS list error:', err);
        res.status(500).json({ error: 'Failed to list directory', details: err.message });
    }
});
router.post('/fs/mkdir', async (req, res) => {
    try {
        const { dirPath, name } = req.body;
        await promises_1.default.mkdir(path_1.default.join(dirPath, name));
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create directory' });
    }
});
router.post('/fs/create', async (req, res) => {
    try {
        const { dirPath, name, content = '' } = req.body;
        await promises_1.default.writeFile(path_1.default.join(dirPath, name), content);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create file' });
    }
});
router.post('/fs/delete', async (req, res) => {
    try {
        const { targetPath } = req.body;
        await promises_1.default.rm(targetPath, { recursive: true, force: true });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});
const multer_1 = __importDefault(require("multer"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const targetPath = req.query.path || '/home/deepdp';
        cb(null, targetPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
router.post('/fs/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
    }
    res.json({ success: true, count: req.files.length });
});
const archiver = require('archiver');
router.get('/fs/download', async (req, res) => {
    try {
        const targetPath = req.query.path;
        if (!targetPath) {
            return res.status(400).json({ error: 'Path is required' });
        }
        const stats = await promises_1.default.stat(targetPath);
        const fileName = path_1.default.basename(targetPath);
        if (stats.isFile()) {
            res.download(targetPath, fileName);
        }
        else if (stats.isDirectory()) {
            res.attachment(`${fileName}.zip`);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });
            archive.on('error', (err) => {
                res.status(500).send({ error: err.message });
            });
            archive.pipe(res);
            archive.directory(targetPath, false);
            archive.finalize();
        }
        else {
            res.status(400).json({ error: 'Unsupported file type' });
        }
    }
    catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Failed to download', details: err.message });
    }
});
router.post('/ai/command', async (req, res) => {
    try {
        const { command, password } = req.body;
        let output = '';
        const executeSudo = async (cmd) => {
            if (!password) {
                return res.json({ success: true, requirePassword: true, output: 'This action requires sudo privileges. Please provide your sudo password.' });
            }
            try {
                const { stdout, stderr } = await execPromise(`echo "${password}" | sudo -S ${cmd}`);
                output = stdout || stderr || 'Command executed successfully.';
                res.json({ success: true, output });
            }
            catch (err) {
                if (err.message.includes('incorrect password') || err.message.includes('Authentication failed')) {
                    res.json({ success: false, requirePassword: true, error: 'Incorrect sudo password. Please try again.' });
                }
                else {
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
    }
    catch (err) {
        res.status(500).json({ error: 'Command failed', details: err.message });
    }
});
router.get('/domains', async (req, res) => {
    try {
        // Read the Cloudflare Tunnel config
        // In a real environment, you might need to locate the correct config.yml dynamically
        const cloudflaredDir = '/home/deepdp/.cloudflared';
        const files = await promises_1.default.readdir(cloudflaredDir);
        const configFile = files.find(f => f.endsWith('.yml') || f.endsWith('.yaml'));
        if (!configFile) {
            return res.json([]);
        }
        const configContent = await promises_1.default.readFile(path_1.default.join(cloudflaredDir, configFile), 'utf-8');
        const rawDomains = [];
        const lines = configContent.split('\n');
        let currentHostname = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const hostMatch = line.match(/-\s*hostname:\s*([^\s]+)/);
            if (hostMatch) {
                currentHostname = hostMatch[1];
            }
            const serviceMatch = line.match(/\s*service:\s*([^\s#]+)(.*)/);
            if (serviceMatch && currentHostname) {
                const serviceVal = serviceMatch[1];
                const rest = serviceMatch[2];
                let isActive = true;
                let displayService = serviceVal;
                if (serviceVal === 'http_status:404' && rest.includes('# ORIGINAL_SERVICE:')) {
                    isActive = false;
                    displayService = rest.split('# ORIGINAL_SERVICE:')[1].trim();
                }
                rawDomains.push({
                    hostname: currentHostname,
                    service: displayService,
                    isActive
                });
                currentHostname = '';
            }
        }
        const domainGroups = new Map();
        rawDomains.forEach(d => {
            const isWww = d.hostname.startsWith('www.');
            const baseHostname = isWww ? d.hostname.replace('www.', '') : d.hostname;
            if (!domainGroups.has(baseHostname)) {
                domainGroups.set(baseHostname, {
                    hostname: baseHostname,
                    service: d.service,
                    isActive: d.isActive,
                    aliases: []
                });
            }
            if (isWww) {
                domainGroups.get(baseHostname).aliases.push(d.hostname);
            }
        });
        res.json(Array.from(domainGroups.values()));
    }
    catch (err) {
        console.error('Failed to fetch domains:', err);
        res.status(500).json({ error: 'Failed to fetch domains', details: err.message });
    }
});
router.post('/domains/toggle', async (req, res) => {
    try {
        const { hostname, isActive } = req.body;
        if (!hostname)
            return res.status(400).json({ error: 'hostname required' });
        const cloudflaredDir = '/home/deepdp/.cloudflared';
        const files = await promises_1.default.readdir(cloudflaredDir);
        const configFile = files.find(f => f.endsWith('.yml') || f.endsWith('.yaml'));
        if (!configFile) {
            return res.status(404).json({ error: 'Config file not found' });
        }
        const configPath = path_1.default.join(cloudflaredDir, configFile);
        let configContent = await promises_1.default.readFile(configPath, 'utf-8');
        const lines = configContent.split('\n');
        let currentHostname = '';
        let modified = false;
        const hostnamesToToggle = [hostname];
        if (!hostname.startsWith('www.')) {
            hostnamesToToggle.push(`www.${hostname}`);
        }
        else {
            hostnamesToToggle.push(hostname.replace('www.', ''));
        }
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const hostMatch = line.match(/-\s*hostname:\s*([^\s]+)/);
            if (hostMatch) {
                currentHostname = hostMatch[1];
            }
            if (line.match(/\s*service:/) && hostnamesToToggle.includes(currentHostname)) {
                if (isActive === false) {
                    // We want to turn it OFF
                    const serviceMatch = line.match(/\s*service:\s*([^\s#]+)/);
                    if (serviceMatch && serviceMatch[1] !== 'http_status:404') {
                        const originalService = serviceMatch[1];
                        // Replace service line while keeping indentation
                        lines[i] = line.replace(/service:\s*([^\s#]+)/, `service: http_status:404 # ORIGINAL_SERVICE: ${originalService}`);
                        modified = true;
                    }
                }
                else {
                    // We want to turn it ON
                    if (line.includes('http_status:404') && line.includes('# ORIGINAL_SERVICE:')) {
                        const originalService = line.split('# ORIGINAL_SERVICE:')[1].trim();
                        lines[i] = line.replace(/service:.*$/, `service: ${originalService}`);
                        modified = true;
                    }
                }
                // Don't break, because we might need to toggle both www and non-www
            }
        }
        if (modified) {
            await promises_1.default.writeFile(configPath, lines.join('\n'), 'utf-8');
            await execPromise('pm2 restart cloudflared');
        }
        res.json({ success: true, modified });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to toggle domain', details: err.message });
    }
});
exports.default = router;
