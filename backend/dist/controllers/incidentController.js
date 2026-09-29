"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIncident = createIncident;
exports.getIncidents = getIncidents;
exports.getIncidentById = getIncidentById;
exports.updateIncident = updateIncident;
exports.deleteIncident = deleteIncident;
const validation_js_1 = require("../schemas/validation.js");
const storageService_js_1 = require("../services/storageService.js");
const geminiService_js_1 = require("../services/geminiService.js");
async function createIncident(req, res, next) {
    try {
        const validated = validation_js_1.incidentSchema.parse(req.body);
        const userId = req.user?.id || 'default-user';
        // Trigger automated Gemini AI diagnostic evaluation
        const aiDiagnosis = await (0, geminiService_js_1.generateNetworkDiagnosis)({
            ispName: validated.ispName,
            symptom: validated.symptom,
            ping: validated.pingMs || 0,
            downloadSpeed: validated.downloadSpeed || 0,
            uploadSpeed: validated.uploadSpeed || 0,
            routerModel: validated.routerModel,
            connectionType: validated.connectionType
        });
        const incident = await storageService_js_1.storageService.createIncident({
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
    }
    catch (error) {
        next(error);
    }
}
async function getIncidents(req, res, next) {
    try {
        const userId = req.user?.id || 'default-user';
        const status = req.query.status;
        const ispName = req.query.isp;
        const incidents = await storageService_js_1.storageService.getIncidents(userId, { status, ispName });
        res.json({
            success: true,
            count: incidents.length,
            data: incidents
        });
    }
    catch (error) {
        next(error);
    }
}
async function getIncidentById(req, res, next) {
    try {
        const { id } = req.params;
        const incident = await storageService_js_1.storageService.getIncidentById(id);
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
    }
    catch (error) {
        next(error);
    }
}
async function updateIncident(req, res, next) {
    try {
        const { id } = req.params;
        const validated = validation_js_1.updateIncidentSchema.parse(req.body);
        const updates = {};
        if (validated.status !== undefined)
            updates.status = validated.status;
        if (validated.resolvedAt !== undefined)
            updates.resolved_at = validated.resolvedAt;
        if (validated.symptom !== undefined)
            updates.symptom = validated.symptom;
        if (validated.downloadSpeed !== undefined)
            updates.download_speed = validated.downloadSpeed;
        if (validated.uploadSpeed !== undefined)
            updates.upload_speed = validated.uploadSpeed;
        if (validated.pingMs !== undefined)
            updates.ping_ms = validated.pingMs;
        // Automatically set resolved_at if status changed to resolved and not set
        if (validated.status === 'resolved' && !updates.resolved_at) {
            updates.resolved_at = new Date().toISOString();
        }
        const updated = await storageService_js_1.storageService.updateIncident(id, updates);
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
    }
    catch (error) {
        next(error);
    }
}
async function deleteIncident(req, res, next) {
    try {
        const { id } = req.params;
        const success = await storageService_js_1.storageService.deleteIncident(id);
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
    }
    catch (error) {
        next(error);
    }
}
