"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnoseNetwork = diagnoseNetwork;
exports.generateReport = generateReport;
exports.advisorChat = advisorChat;
const validation_js_1 = require("../schemas/validation.js");
const geminiService_js_1 = require("../services/geminiService.js");
const storageService_js_1 = require("../services/storageService.js");
async function diagnoseNetwork(req, res, next) {
    try {
        const validated = validation_js_1.aiDiagnoseSchema.parse(req.body);
        const diagnosis = await (0, geminiService_js_1.generateNetworkDiagnosis)({
            ispName: validated.ispName,
            symptom: validated.symptom,
            ping: validated.ping,
            downloadSpeed: validated.downloadSpeed,
            uploadSpeed: validated.uploadSpeed,
            routerModel: validated.routerModel,
            connectionType: validated.connectionType
        });
        res.json({
            success: true,
            data: diagnosis
        });
    }
    catch (error) {
        next(error);
    }
}
async function generateReport(req, res, next) {
    try {
        const validated = validation_js_1.aiReportSchema.parse(req.body);
        const userId = req.user?.id || 'default-user';
        const incidents = await storageService_js_1.storageService.getIncidents(userId, { ispName: validated.ispName });
        const analytics = storageService_js_1.storageService.calculateAnalytics(userId);
        const recentIncidents = incidents.slice(0, 10).map(inc => {
            const start = new Date(inc.started_at);
            const end = inc.resolved_at ? new Date(inc.resolved_at) : new Date();
            const diffMins = Math.round((end.getTime() - start.getTime()) / (60 * 1000));
            const durationStr = diffMins > 60 ? `${(diffMins / 60).toFixed(1)} hrs` : `${diffMins} mins`;
            return {
                started_at: inc.started_at,
                symptom: inc.symptom,
                duration: durationStr
            };
        });
        const report = await (0, geminiService_js_1.generateIspReport)({
            ispName: validated.ispName,
            accountNumber: validated.accountNumber,
            customerName: validated.customerName,
            totalOutages: incidents.length,
            totalDowntimeHours: analytics.totalDowntimeHours,
            uptimePercentage: analytics.uptimePercentage,
            averagePing: analytics.averagePingMs,
            timeRangeDays: validated.timeRangeDays,
            desiredOutcome: validated.desiredOutcome,
            recentIncidents
        });
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        next(error);
    }
}
async function advisorChat(req, res, next) {
    try {
        const { prompt, history = [] } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }
        const reply = await (0, geminiService_js_1.getAiAdvisorAdvice)(prompt, history);
        res.json({
            success: true,
            data: {
                reply,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        next(error);
    }
}
