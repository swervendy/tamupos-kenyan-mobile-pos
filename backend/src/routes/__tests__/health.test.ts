import request from 'supertest';
import express from 'express';
import healthRoutes from '../health';

const app = express();
app.use('/api', healthRoutes);

describe('GET /api/health', () => {
  it('should return 200 with a health message', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK', message: '😋TamuPOS API is running' });
  });
}); 