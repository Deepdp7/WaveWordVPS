"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per window
    message: { error: 'Too many authentication attempts, please try again later.' }
});
router.post('/signup', authLimiter, auth_controller_1.signup);
router.post('/login', authLimiter, auth_controller_1.login);
router.post('/refresh', auth_controller_1.refresh);
exports.default = router;
