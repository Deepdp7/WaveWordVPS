"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoices_controller_1 = require("../controllers/invoices.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/me', auth_1.authenticateToken, invoices_controller_1.getMyInvoices);
exports.default = router;
