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
exports.default = router;
