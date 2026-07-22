import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

// Initialize Ethereal Email for testing
const initEthereal = async () => {
  if (transporter) return;

  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log('Ethereal Email connected for testing.');
  } catch (error) {
    console.error('Failed to initialize Ethereal Email:', error);
  }
};

const sendEmail = async (to: string, subject: string, html: string) => {
  await initEthereal();
  if (!transporter) return;

  try {
    const info = await transporter.sendMail({
      from: '"Wave Word VPS Hosting" <no-reply@hosting.local>',
      to,
      subject,
      html,
    });

    console.log(`\n================================`);
    console.log(`📧 Email sent to: ${to}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log(`================================\n`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendWelcomeEmail = async (to: string, name: string) => {
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

export const sendPurchaseConfirmation = async (to: string, name: string, planName: string, amount: number) => {
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

export const sendTicketUpdate = async (to: string, name: string, ticketSubject: string, status: string) => {
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
