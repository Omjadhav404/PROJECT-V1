import { Request, Response, NextFunction } from 'express';
import { storageService } from '../services/storageService.js';

export async function getUptimeAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || 'default-user';
    const analytics = storageService.calculateAnalytics(userId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
}

export async function getLiveNetworkStatus(req: Request, res: Response, next: NextFunction) {
  try {
    // Generates realistic live telemetry with minor natural jitter
    const basePing = 14 + Math.floor(Math.sin(Date.now() / 4000) * 4);
    const jitter = Math.floor(Math.random() * 3);
    const packetLoss = Math.random() < 0.05 ? 0.2 : 0.0;
    const downloadBps = Math.round(520 + Math.sin(Date.now() / 3000) * 35);
    const uploadBps = Math.round(180 + Math.cos(Date.now() / 3500) * 15);

    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        gatewayIp: '192.168.1.1',
        ispName: 'Primary WAN Gateway',
        status: 'online',
        pingMs: basePing + jitter,
        jitterMs: jitter,
        packetLossPercent: packetLoss,
        currentDownloadMbps: downloadBps,
        currentUploadMbps: uploadBps,
        dnsLatencyMs: 9 + Math.floor(Math.random() * 4),
        activeConnectionsCount: 38
      }
    });
  } catch (error) {
    next(error);
  }
}
