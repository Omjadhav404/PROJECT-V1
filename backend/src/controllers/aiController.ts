import { Request, Response, NextFunction } from 'express';
import { aiDiagnoseSchema, aiReportSchema } from '../schemas/validation.js';
import { generateNetworkDiagnosis, generateIspReport, getAiAdvisorAdvice } from '../services/geminiService.js';
import { storageService } from '../services/storageService.js';

export async function diagnoseNetwork(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = aiDiagnoseSchema.parse(req.body);

    const diagnosis = await generateNetworkDiagnosis({
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
  } catch (error) {
    next(error);
  }
}

export async function generateReport(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = aiReportSchema.parse(req.body);
    const userId = req.user?.id || 'default-user';

    const incidents = await storageService.getIncidents(userId, { ispName: validated.ispName });
    const analytics = storageService.calculateAnalytics(userId);

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

    const report = await generateIspReport({
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
  } catch (error) {
    next(error);
  }
}

export async function advisorChat(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt, history = [] } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const reply = await getAiAdvisorAdvice(prompt, history);

    res.json({
      success: true,
      data: {
        reply,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
}
