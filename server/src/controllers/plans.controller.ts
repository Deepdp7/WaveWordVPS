import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query; // static | vps
    
    let whereClause: any = { isActive: true };
    if (type) {
      whereClause.type = type;
    }

    const plans = await prisma.hostingPlan.findMany({
      where: whereClause,
      orderBy: { priceMonthly: 'asc' }
    });

    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const plan = await prisma.hostingPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
