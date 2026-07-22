"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyInvoices = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getMyInvoices = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const invoices = await prisma.invoice.findMany({
            where: { order: { userId } },
            include: { order: { include: { plan: true } } },
            orderBy: { issuedAt: 'desc' }
        });
        res.json(invoices);
    }
    catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMyInvoices = getMyInvoices;
