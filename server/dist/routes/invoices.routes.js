"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoices_controller_1 = require("../controllers/invoices.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/me', auth_1.authenticateToken, invoices_controller_1.getMyInvoices);
router.get('/:id', auth_1.authenticateToken, invoices_controller_1.getInvoiceById);
exports.default = router;
