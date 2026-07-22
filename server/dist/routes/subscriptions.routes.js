"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptions_controller_1 = require("../controllers/subscriptions.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/me', auth_1.authenticateToken, subscriptions_controller_1.getMySubscriptions);
router.post('/:id/cancel', auth_1.authenticateToken, subscriptions_controller_1.cancelSubscription);
exports.default = router;
