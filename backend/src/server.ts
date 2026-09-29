import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import incidentRoutes from './routes/incidentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import routerRoutes from './routes/routerRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.use(express.json());
app.use(morgan('dev'));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NetPulse AI Backend',
    version: '1.0.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
    supabaseConfigured: !!process.env.SUPABASE_URL
  });
});

// Mounted API Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/routers', routerRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
  🌐================================================================🌐
  ⚡  NetPulse AI: ISP & Wi-Fi Downtime Tracker & Advisory Assistant  ⚡
  🌐================================================================🌐
  🚀 Server running on: http://localhost:${PORT}
  📡 Health check:      http://localhost:${PORT}/api/health
  🤖 Gemini Diagnostic: Active (@google/genai & Adaptive Expert Model)
  💾 Database:          Supabase PostgreSQL + Local Safe Sync Store
  ====================================================================
  `);
});
