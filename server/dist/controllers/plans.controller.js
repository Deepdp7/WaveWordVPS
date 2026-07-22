"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanById = exports.getPlans = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getPlans = async (req, res) => {
    try {
        const { type } = req.query; // static | vps
        let whereClause = { isActive: true };
        if (type) {
            whereClause.type = type;
        }
        const plans = await prisma.hostingPlan.findMany({
            where: whereClause,
            orderBy: { priceMonthly: 'asc' }
        });
        res.json(plans);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPlans = getPlans;
const getPlanById = async (req, res) => {
    try {
        const id = req.params.id;
        const plan = await prisma.hostingPlan.findUnique({
            where: { id }
        });
        if (!plan) {
            res.status(404).json({ error: 'Plan not found' });
            return;
        }
        res.json(plan);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPlanById = getPlanById;
