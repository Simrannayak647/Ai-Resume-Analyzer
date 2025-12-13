// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzerRoutes from './routes/analyzerRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// Add this after line 23 (after middleware, before routes):
console.log('=== ROUTE DEBUG ===');
console.log('Mounting analyzerRoutes at /api');
console.log('Route file exists:', true);
console.log('Routes in analyzerRoutes:');
console.log('- POST /analyze');
console.log('- GET /test');
console.log('====================');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', analyzerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'resume-analyzer-api' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
