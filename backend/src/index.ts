import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import route modules
import healthRoutes from './routes/health';
import categoryRoutes from './routes/categories';
import itemRoutes from './routes/items';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import authRouter from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRouter);

// Basic route
app.get('/', (req, res) => {
  res.send('TamuPOS API is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
