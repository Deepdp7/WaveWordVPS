import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendWelcomeEmail } from '../services/email.service';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // First user becomes admin, others are customers
    const count = await prisma.user.count();
    const role = count === 0 ? 'admin' : 'customer';

    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone, role }
    });

    sendWelcomeEmail(user.email, user.name).catch(console.error);

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
      res.json({ accessToken });
    } catch (err) {
      res.status(403).json({ error: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
