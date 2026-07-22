"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = exports.handleWebhook = exports.createOrder = void 0;
const client_1 = require("@prisma/client");
const razorpay_1 = __importDefault(require("razorpay"));
const email_service_1 = require("../services/email.service");
const prisma = new client_1.PrismaClient();
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { planId, billingCycle } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const plan = await prisma.hostingPlan.findUnique({ where: { id: planId } });
        if (!plan) {
            res.status(404).json({ error: 'Plan not found' });
            return;
        }
        let baseAmount = plan.priceMonthly;
        if (billingCycle === '1_year' && plan.price1Year)
            baseAmount = plan.price1Year * 12;
        else if (billingCycle === '2_years' && plan.price2Year)
            baseAmount = plan.price2Year * 24;
        else if (billingCycle === '3_years' && plan.price3Year)
            baseAmount = plan.price3Year * 36;
        else if (billingCycle === 'yearly' && plan.price1Year)
            baseAmount = plan.price1Year * 12; // fallback for old data
        const gstAmount = Math.round(baseAmount * 0.18);
        const amount = baseAmount + gstAmount;
        // Create DB Order
        const dbOrder = await prisma.order.create({
            data: {
                userId,
                planId,
                status: 'pending',
                amount,
                billingCycle
            }
        });
        try {
            // Create Razorpay Order
            const rzpOrder = await razorpay.orders.create({
                amount: Math.round(amount * 100), // in paise
                currency: 'INR',
                receipt: dbOrder.id,
            });
            res.json({ orderId: dbOrder.id, rzpOrderId: rzpOrder.id, amount, currency: 'INR' });
        }
        catch (rzpError) {
            console.error('Razorpay Error:', rzpError);
            // For MVP simulation when keys are dummy, return a mock RZP order ID
            res.json({ orderId: dbOrder.id, rzpOrderId: 'order_mock_' + dbOrder.id, amount, currency: 'INR', mock: true });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createOrder = createOrder;
const handleWebhook = async (req, res) => {
    try {
        // Note: In production, verify webhook signature
        // const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        // const signature = req.headers['x-razorpay-signature'];
        // For MVP, simulating payment success from frontend or simplified webhook payload
        const { orderId, rzpPaymentId, status } = req.body;
        if (status === 'success') {
            const order = await prisma.order.findUnique({ where: { id: orderId }, include: { plan: true } });
            if (!order || order.status === 'paid') {
                res.status(200).json({ status: 'ok' }); // Already processed
                return;
            }
            await prisma.$transaction(async (tx) => {
                // Mark order as paid
                await tx.order.update({
                    where: { id: orderId },
                    data: { status: 'paid' }
                });
                // Create Payment record
                await tx.payment.create({
                    data: {
                        orderId,
                        gateway: 'razorpay',
                        gatewayPaymentId: rzpPaymentId,
                        amount: order.amount,
                        status: 'success',
                        paidAt: new Date()
                    }
                });
                // Calculate end date
                const startDate = new Date();
                const endDate = new Date();
                if (order.billingCycle === '1_year' || order.billingCycle === 'yearly') {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
                else if (order.billingCycle === '2_years') {
                    endDate.setFullYear(endDate.getFullYear() + 2);
                }
                else if (order.billingCycle === '3_years') {
                    endDate.setFullYear(endDate.getFullYear() + 3);
                }
                else {
                    endDate.setMonth(endDate.getMonth() + 1);
                }
                // Create Subscription
                await tx.subscription.create({
                    data: {
                        userId: order.userId,
                        planId: order.planId,
                        orderId: order.id,
                        status: 'active',
                        startDate,
                        endDate,
                        autoRenew: true
                    }
                });
                // Create Invoice
                await tx.invoice.create({
                    data: {
                        orderId: order.id,
                        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                    }
                });
            });
            // Get user details for email
            const user = await prisma.user.findUnique({ where: { id: order.userId } });
            if (user) {
                // Send purchase confirmation email (fire and forget)
                (0, email_service_1.sendPurchaseConfirmation)(user.email, user.name, order.plan.name, order.amount).catch(console.error);
            }
        }
        res.status(200).json({ status: 'ok' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.handleWebhook = handleWebhook;
const getOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const order = await prisma.order.findUnique({ where: { id }, include: { plan: true } });
        if (!order || order.userId !== userId) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json(order);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getOrder = getOrder;
