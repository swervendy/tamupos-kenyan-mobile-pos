import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all categories for the authenticated user's restaurant
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: req.user!.restaurantId
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Return just the category names for now (to match existing frontend expectations)
    const categoryNames = categories.map((category: any) => category.name);
    res.json(categoryNames);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add new category
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists for this restaurant
    const existingCategory = await prisma.category.findUnique({
      where: {
        restaurantId_name: {
          restaurantId: req.user!.restaurantId,
          name: name
        }
      }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name,
        restaurantId: req.user!.restaurantId
      }
    });

    // Get updated list of categories
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: req.user!.restaurantId
      },
      orderBy: {
        name: 'asc'
      }
    });

    const categoryNames = categories.map((category: any) => category.name);
    res.json({ message: 'Category added successfully', categories: categoryNames });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router; 