// backend/server.js (or index.js or app.js)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzerRoute from './routes/analyzerRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', analyzerRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Resume Analyzer API',
    version: '1.0.0',
    endpoints: {
      test: '/api/test',
      testGemini: '/api/test-gemini',
      analyze: '/api/analyze (POST)'
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.path);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.path,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'GET /api/test-gemini',
      'POST /api/analyze'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 ===================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🤖 Gemini test: http://localhost:${PORT}/api/test-gemini`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/analyze`);
  console.log('===================================\n');
});

export default app;