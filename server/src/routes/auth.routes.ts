import { Router } from 'express';
import { signup, login, refresh } from '../controllers/auth.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per window
  message: { error: 'Too many authentication attempts, please try again later.' }
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);

export default router;
