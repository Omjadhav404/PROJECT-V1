"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouters = getRouters;
exports.createRouter = createRouter;
exports.deleteRouter = deleteRouter;
const validation_js_1 = require("../schemas/validation.js");
const storageService_js_1 = require("../services/storageService.js");
async function getRouters(req, res, next) {
    try {
        const userId = req.user?.id || 'default-user';
        const routers = await storageService_js_1.storageService.getRouters(userId);
        res.json({
            success: true,
            data: routers
        });
    }
    catch (error) {
        next(error);
    }
}
async function createRouter(req, res, next) {
    try {
        const validated = validation_js_1.routerConfigSchema.parse(req.body);
        const userId = req.user?.id || 'default-user';
        const router = await storageService_js_1.storageService.createRouter({
            user_id: userId,
            device_name: validated.deviceName,
            ip_address: validated.ipAddress,
            ssid: validated.ssid,
            notes: validated.notes
        });
        res.status(201).json({
            success: true,
            message: 'Router configuration registered successfully',
            data: router
        });
    }
    catch (error) {
        next(error);
    }
}
async function deleteRouter(req, res, next) {
    try {
        const { id } = req.params;
        const success = await storageService_js_1.storageService.deleteRouter(id);
        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Router device not found'
            });
        }
        res.json({
            success: true,
            message: 'Router configuration removed'
        });
    }
    catch (error) {
        next(error);
    }
}
