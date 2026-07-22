import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import authRoutes from './routes/auth.routes';
import plansRoutes from './routes/plans.routes';
import subscriptionsRoutes from './routes/subscriptions.routes';
import ordersRoutes from './routes/orders.routes';
import adminRoutes from './routes/admin.routes';
import supportRoutes from './routes/support.routes';
import invoicesRoutes from './routes/invoices.routes';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security Middlewares
app.use(helmet());

// Restrict CORS in production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://your-frontend-domain.com'] 
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support/tickets', supportRoutes);
app.use('/api/invoices', invoicesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
