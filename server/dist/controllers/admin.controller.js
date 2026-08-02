"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDatabase = exports.updateSupportTicket = exports.getSupportTickets = exports.provisionVps = exports.getVpsInstances = exports.updateSubscription = exports.getSubscriptions = exports.deleteOrder = exports.refundOrder = exports.getOrders = exports.getCustomers = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlans = void 0;
const client_1 = require("@prisma/client");
const email_service_1 = require("../services/email.service");
const prisma = new client_1.PrismaClient();
// Plans
const getPlans = async (req, res) => {
    const plans = await prisma.hostingPlan.findMany();
    res.json(plans);
};
exports.getPlans = getPlans;
const createPlan = async (req, res) => {
    const plan = await prisma.hostingPlan.create({ data: req.body });
    res.status(201).json(plan);
};
exports.createPlan = createPlan;
const updatePlan = async (req, res) => {
    const id = req.params.id;
    const plan = await prisma.hostingPlan.update({ where: { id }, data: req.body });
    res.json(plan);
};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res) => {
    const id = req.params.id;
    await prisma.hostingPlan.delete({ where: { id } });
    res.status(204).send();
};
exports.deletePlan = deletePlan;
// Customers
const getCustomers = async (req, res) => {
    const customers = await prisma.user.findMany({
        where: { role: 'customer' },
        select: { id: true, name: true, email: true, phone: true, createdAt: true }
    });
    res.json(customers);
};
exports.getCustomers = getCustomers;
// Orders
const getOrders = async (req, res) => {
    const orders = await prisma.order.findMany({
        include: { user: { select: { name: true, email: true } }, plan: { select: { name: true } }, invoices: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
};
exports.getOrders = getOrders;
const refundOrder = async (req, res) => {
    const id = req.params.id;
    const order = await prisma.order.update({ where: { id }, data: { status: 'refunded' } });
    res.json(order);
};
exports.refundOrder = refundOrder;
const deleteOrder = async (req, res) => {
    const id = req.params.id;
    try {
        // Manually delete related records to avoid foreign key constraints
        await prisma.invoice.deleteMany({ where: { orderId: id } });
        await prisma.payment.deleteMany({ where: { orderId: id } });
        await prisma.subscription.deleteMany({ where: { orderId: id } });
        // Finally delete the order
        await prisma.order.delete({ where: { id } });
        res.json({ success: true, message: 'Order deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
};
exports.deleteOrder = deleteOrder;
// Subscriptions
const getSubscriptions = async (req, res) => {
    const subscriptions = await prisma.subscription.findMany({
        include: { user: { select: { name: true, email: true } }, plan: { select: { name: true } } },
        orderBy: { startDate: 'desc' }
    });
    res.json(subscriptions);
};
exports.getSubscriptions = getSubscriptions;
const updateSubscription = async (req, res) => {
    const id = req.params.id;
    const subscription = await prisma.subscription.update({ where: { id }, data: req.body });
    res.json(subscription);
};
exports.updateSubscription = updateSubscription;
// VPS
const getVpsInstances = async (req, res) => {
    const instances = await prisma.vpsInstance.findMany({ include: { subscription: true } });
    res.json(instances);
};
exports.getVpsInstances = getVpsInstances;
const provisionVps = async (req, res) => {
    const id = req.params.id;
    const { ipAddress } = req.body;
    const instance = await prisma.vpsInstance.update({
        where: { id },
        data: { ipAddress, status: 'active', provisionedByAdminAt: new Date() }
    });
    res.json(instance);
};
exports.provisionVps = provisionVps;
// Support Tickets
const getSupportTickets = async (req, res) => {
    const tickets = await prisma.supportTicket.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
    res.json(tickets);
};
exports.getSupportTickets = getSupportTickets;
const updateSupportTicket = async (req, res) => {
    const id = req.params.id;
    const { status, reply } = req.body;
    const ticket = await prisma.supportTicket.update({
        where: { id },
        data: { status },
        include: { user: true }
    });
    // Send update email (fire and forget)
    (0, email_service_1.sendTicketUpdate)(ticket.user.email, ticket.user.name, ticket.subject, status).catch(console.error);
    res.json(ticket);
};
exports.updateSupportTicket = updateSupportTicket;
// Reset DB
const resetDatabase = async (req, res) => {
    try {
        // Delete in reverse order of foreign keys
        await prisma.payment.deleteMany();
        await prisma.invoice.deleteMany();
        await prisma.website.deleteMany();
        await prisma.vpsInstance.deleteMany();
        await prisma.subscription.deleteMany();
        await prisma.order.deleteMany();
        await prisma.supportTicket.deleteMany();
        await prisma.hostingPlan.deleteMany();
        await prisma.user.deleteMany();
        // Re-seed plans
        const plans = [
            { type: 'static', name: 'Starter', priceMonthly: 125, storageGb: 5, websiteLimit: 2 },
            { type: 'static', name: 'Professional', priceMonthly: 249, price1Year: 199, storageGb: 15, websiteLimit: 5 },
            { type: 'static', name: 'Business', priceMonthly: 449, price1Year: 359, storageGb: 50, websiteLimit: null },
            { type: 'vps', name: 'KVM 1', priceMonthly: 899, price1Year: 599, price2Year: 549, price3Year: 499, vcpu: 1, ramGb: 4, storageGb: 50, bandwidthTb: 1 },
            { type: 'vps', name: 'KVM 2', priceMonthly: 1299, price1Year: 849, price2Year: 749, price3Year: 699, vcpu: 2, ramGb: 8, storageGb: 100, bandwidthTb: 2 },
            { type: 'vps', name: 'KVM 4', priceMonthly: 2499, price1Year: 1699, price2Year: 1499, price3Year: 1099, vcpu: 4, ramGb: 16, storageGb: 200, bandwidthTb: 4 },
        ];
        for (const plan of plans) {
            await prisma.hostingPlan.create({ data: plan });
        }
        // Re-create Admin user
        const bcrypt = require('bcrypt');
        const passwordHash = await bcrypt.hash('987498', 10);
        await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'dp918121@gmail.com',
                passwordHash,
                role: 'admin'
            }
        });
        res.json({ message: 'Database reset successfully' });
    }
    catch (error) {
        console.error('Failed to reset DB:', error);
        res.status(500).json({ error: 'Failed to reset database' });
    }
};
exports.resetDatabase = resetDatabase;
