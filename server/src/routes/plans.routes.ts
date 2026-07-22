import { Router } from 'express';
import { getPlans, getPlanById } from '../controllers/plans.controller';

const router = Router();

router.get('/', getPlans);
router.get('/:id', getPlanById);

export default router;
