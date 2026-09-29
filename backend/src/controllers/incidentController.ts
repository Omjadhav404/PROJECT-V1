import { Request, Response, NextFunction } from 'express';
import { incidentSchema, updateIncidentSchema } from '../schemas/validation.js';
import { storageService } from '../services/storageService.js';
import { generateNetworkDiagnosis } from '../services/geminiService.js';

export async function createIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = incidentSchema.parse(req.body);
    const userId = req.user?.id || 'default-user';

    // Trigger automated Gemini AI diagnostic evaluation
    const aiDiagnosis = await generateNetworkDiagnosis({
      ispName: validated.ispName,
      symptom: validated.symptom,
      ping: validated.pingMs || 0,
      downloadSpeed: validated.downloadSpeed || 0,
      uploadSpeed: validated.uploadSpeed || 0,
      routerModel: validated.routerModel,
      connectionType: validated.connectionType
    });

    const incident = await storageService.createIncident({
      user_id: userId,
      isp_name: validated.ispName,
      router_model: validated.routerModel,
      connection_type: validated.connectionType,
      symptom: validated.symptom,
      download_speed: validated.downloadSpeed,
      upload_speed: validated.uploadSpeed,
      ping_ms: validated.pingMs,
      status: validated.status || 'active',
      ai_diagnosis: aiDiagnosis,
      started_at: validated.startedAt,
      resolved_at: validated.resolvedAt || undefined
    });

    res.status(201).json({
      success: true,
      message: 'Network incident logged and diagnosed successfully',
      data: incident
    });
  } catch (error) {
    next(error);
  }
}

export async function getIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || 'default-user';
    const status = req.query.status as string | undefined;
    const ispName = req.query.isp as string | undefined;

    const incidents = await storageService.getIncidents(userId, { status, ispName });

    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    next(error);
  }
}

export async function getIncidentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const incident = await storageService.getIncidentById(id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    next(error);
  }
}

export async function updateIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = updateIncidentSchema.parse(req.body);

    const updates: any = {};
    if (validated.status !== undefined) updates.status = validated.status;
    if (validated.resolvedAt !== undefined) updates.resolved_at = validated.resolvedAt;
    if (validated.symptom !== undefined) updates.symptom = validated.symptom;
    if (validated.downloadSpeed !== undefined) updates.download_speed = validated.downloadSpeed;
    if (validated.uploadSpeed !== undefined) updates.upload_speed = validated.uploadSpeed;
    if (validated.pingMs !== undefined) updates.ping_ms = validated.pingMs;

    // Automatically set resolved_at if status changed to resolved and not set
    if (validated.status === 'resolved' && !updates.resolved_at) {
      updates.resolved_at = new Date().toISOString();
    }

    const updated = await storageService.updateIncident(id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found'
      });
    }

    res.json({
      success: true,
      message: 'Incident updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const success = await storageService.deleteIncident(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Incident not found or already removed'
      });
    }

    res.json({
      success: true,
      message: 'Incident removed successfully'
    });
  } catch (error) {
    next(error);
  }
}
