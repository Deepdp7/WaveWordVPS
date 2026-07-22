"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orders_controller_1 = require("../controllers/orders.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, orders_controller_1.createOrder);
router.post('/webhook', orders_controller_1.handleWebhook); // In production, use express.raw for signature verification
router.get('/:id', auth_1.authenticateToken, orders_controller_1.getOrder);
exports.default = router;
