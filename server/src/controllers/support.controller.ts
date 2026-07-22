import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { subject, message } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        status: 'open'
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
