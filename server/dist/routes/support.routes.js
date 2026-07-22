"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const support_controller_1 = require("../controllers/support.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateToken, support_controller_1.createTicket);
router.get('/me', auth_1.authenticateToken, support_controller_1.getMyTickets);
exports.default = router;
