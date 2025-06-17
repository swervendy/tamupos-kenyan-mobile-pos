import { Router, Request, Response } from 'express';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: '😋TamuPOS API is running' });
});

export default router; 