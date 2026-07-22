import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getMySubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
