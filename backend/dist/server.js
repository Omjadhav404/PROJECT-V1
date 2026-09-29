"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const incidentRoutes_js_1 = __importDefault(require("./routes/incidentRoutes.js"));
const aiRoutes_js_1 = __importDefault(require("./routes/aiRoutes.js"));
const analyticsRoutes_js_1 = __importDefault(require("./routes/analyticsRoutes.js"));
const routerRoutes_js_1 = __importDefault(require("./routes/routerRoutes.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security & Parsing Middlewares
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
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
app.use('/api/incidents', incidentRoutes_js_1.default);
app.use('/api/ai', aiRoutes_js_1.default);
app.use('/api/analytics', analyticsRoutes_js_1.default);
app.use('/api/routers', routerRoutes_js_1.default);
// Global Error Handler
app.use(errorHandler_js_1.errorHandler);
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
