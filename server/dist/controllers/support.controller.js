"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTickets = exports.createTicket = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createTicket = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { subject, message } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                subject,
                message,
                status: 'open'
            }
        });
        res.status(201).json(ticket);
    }
    catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createTicket = createTicket;
const getMyTickets = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const tickets = await prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    }
    catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMyTickets = getMyTickets;
