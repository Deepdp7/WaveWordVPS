import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getMyInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const invoices = await prisma.invoice.findMany({
      where: { order: { userId } },
      include: { order: { include: { plan: true } } },
      orderBy: { issuedAt: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: id as string },
      include: {
        order: {
          include: {
            plan: true,
            user: true
          }
        }
      }
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    // Check if user is admin or the invoice belongs to the user
    if (req.user?.role !== 'admin' && (invoice as any).order?.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
