import { Request } from 'express';

// Custom interface to extend the Express Request type
// with the user payload from the JWT after authentication.
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    restaurantId: string;
  };
} 