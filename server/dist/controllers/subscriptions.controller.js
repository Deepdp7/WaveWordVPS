"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.getMySubscriptions = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getMySubscriptions = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            include: {
                plan: true,
                websites: true,
                vpsInstances: true
            },
            orderBy: { startDate: 'desc' }
        });
        res.json(subscriptions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMySubscriptions = getMySubscriptions;
const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const subscription = await prisma.subscription.findUnique({ where: { id } });
        if (!subscription || subscription.userId !== userId) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        const updated = await prisma.subscription.update({
            where: { id },
            data: { status: 'cancelled', autoRenew: false }
        });
        res.json({ message: 'Subscription cancelled successfully', subscription: updated });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.cancelSubscription = cancelSubscription;
