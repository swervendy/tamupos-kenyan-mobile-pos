import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, OrderMode } from '../generated/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key'; // Use an env variable in production!

// ======== USER REGISTRATION ========
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password, restaurantName } = req.body;

  if (!name || !email || !password || !restaurantName) {
    return res.status(400).json({ error: 'All fields are required: name, email, password, restaurantName' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to create the restaurant and the user together
    const newUser = await prisma.$transaction(async (tx) => {
      // Create the restaurant first
      const newRestaurant = await tx.restaurant.create({
        data: { name: restaurantName },
      });

      // Create the user and assign them as the OWNER of the new restaurant
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'OWNER',
          restaurantId: newRestaurant.id,
        },
      });
      return user;
    });

    res.status(201).json({ message: 'User and restaurant created successfully', userId: newUser.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


// ======== USER LOGIN ========
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        restaurantId: user.restaurantId,
        defaultMode: user.defaultMode
      },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Convert backend format to frontend format for defaultMode
    const frontendModeMapping: Record<string, string> = {
      'TAB': 'tab',
      'TABLE': 'table',
      'TAKE_AWAY': 'takeAway', 
      'DELIVERY': 'delivery'
    };

    // Return token and user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    const userForFrontend = {
      ...userWithoutPassword,
      defaultMode: frontendModeMapping[user.defaultMode] || 'tab'
    };
    
    res.json({
      message: 'Login successful',
      token,
      user: userForFrontend,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// ======== UPDATE USER DEFAULT MODE ========
router.patch('/default-mode', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { defaultMode } = req.body;
  const userId = req.user?.userId;

  if (!defaultMode) {
    return res.status(400).json({ error: 'Default mode is required' });
  }

  // Convert frontend format to backend format
  const modeMapping: Record<string, string> = {
    'tab': 'TAB',
    'table': 'TABLE', 
    'takeAway': 'TAKE_AWAY',
    'delivery': 'DELIVERY'
  };

  const backendMode = modeMapping[defaultMode];
  if (!backendMode) {
    return res.status(400).json({ error: 'Invalid mode. Must be one of: tab, table, takeAway, delivery' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { defaultMode: backendMode as OrderMode },
      select: { id: true, name: true, email: true, role: true, defaultMode: true, restaurantId: true }
    });

    res.json({ 
      message: 'Default mode updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update default mode error:', error);
    res.status(500).json({ error: 'Failed to update default mode' });
  }
});

export default router; 