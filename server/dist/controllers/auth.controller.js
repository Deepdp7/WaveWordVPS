"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const email_service_1 = require("../services/email.service");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        // First user becomes admin, others are customers
        const count = await prisma.user.count();
        const role = count === 0 ? 'admin' : 'customer';
        const user = await prisma.user.create({
            data: { name, email, passwordHash, phone, role }
        });
        (0, email_service_1.sendWelcomeEmail)(user.email, user.name).catch(console.error);
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.json({
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token required' });
            return;
        }
        try {
            const payload = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
            const user = await prisma.user.findUnique({ where: { id: payload.id } });
            if (!user) {
                res.status(401).json({ error: 'Invalid token' });
                return;
            }
            const accessToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
            res.json({ accessToken });
        }
        catch (err) {
            res.status(403).json({ error: 'Invalid refresh token' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.refresh = refresh;
