"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketUpdate = exports.sendPurchaseConfirmation = exports.sendWelcomeEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter = null;
// Initialize Ethereal Email for testing
const initEthereal = async () => {
    if (transporter)
        return;
    try {
        const testAccount = await nodemailer_1.default.createTestAccount();
        transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log('Ethereal Email connected for testing.');
    }
    catch (error) {
        console.error('Failed to initialize Ethereal Email:', error);
    }
};
const sendEmail = async (to, subject, html) => {
    await initEthereal();
    if (!transporter)
        return;
    try {
        const info = await transporter.sendMail({
            from: '"Wave Word VPS Hosting" <no-reply@hosting.local>',
            to,
            subject,
            html,
        });
        console.log(`\n================================`);
        console.log(`📧 Email sent to: ${to}`);
        console.log(`Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}`);
        console.log(`================================\n`);
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
};
const sendWelcomeEmail = async (to, name) => {
    const subject = 'Welcome to Wave Word VPS Hosting!';
    const html = `
    <h2>Welcome aboard, ${name}!</h2>
    <p>Thank you for creating an account with us.</p>
    <p>You can now browse our Static and VPS hosting plans, and manage everything from your dashboard.</p>
    <br/>
    <p>Best regards,</p>
    <p>The Wave Word VPS Hosting Team</p>
  `;
    await sendEmail(to, subject, html);
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPurchaseConfirmation = async (to, name, planName, amount) => {
    const subject = `Your purchase of ${planName} was successful`;
    const html = `
    <h2>Hi ${name},</h2>
    <p>Your payment of ₹${amount} was received and your subscription for <strong>${planName}</strong> is now active!</p>
    <p>You can view your invoice and manage your plan in the customer dashboard.</p>
    <br/>
    <p>Thanks for your business,</p>
    <p>The Hosting Team</p>
  `;
    await sendEmail(to, subject, html);
};
exports.sendPurchaseConfirmation = sendPurchaseConfirmation;
const sendTicketUpdate = async (to, name, ticketSubject, status) => {
    const subject = `Update on your support ticket: ${ticketSubject}`;
    const html = `
    <h2>Hi ${name},</h2>
    <p>There has been an update to your support ticket "<strong>${ticketSubject}</strong>".</p>
    <p>The status is now: <strong>${status.toUpperCase()}</strong>.</p>
    <p>Please log in to your dashboard to view the details.</p>
    <br/>
    <p>Best regards,</p>
    <p>The Support Team</p>
  `;
    await sendEmail(to, subject, html);
};
exports.sendTicketUpdate = sendTicketUpdate;
