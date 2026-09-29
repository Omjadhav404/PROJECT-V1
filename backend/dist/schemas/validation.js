"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiReportSchema = exports.aiDiagnoseSchema = exports.routerConfigSchema = exports.updateIncidentSchema = exports.incidentSchema = exports.incidentStatusEnum = exports.connectionTypeEnum = void 0;
const zod_1 = require("zod");
exports.connectionTypeEnum = zod_1.z.enum(['fiber', 'cable', 'dsl', 'satellite', '5g_home']);
exports.incidentStatusEnum = zod_1.z.enum(['active', 'resolved', 'investigating']);
exports.incidentSchema = zod_1.z.object({
    ispName: zod_1.z.string().min(1, 'ISP name is required'),
    routerModel: zod_1.z.string().optional(),
    connectionType: exports.connectionTypeEnum.default('fiber'),
    symptom: zod_1.z.string().min(3, 'Describe the symptom with at least 3 characters'),
    downloadSpeed: zod_1.z.number().nonnegative().optional(),
    uploadSpeed: zod_1.z.number().nonnegative().optional(),
    pingMs: zod_1.z.number().int().nonnegative().optional(),
    startedAt: zod_1.z.string().datetime({ message: 'Must be a valid ISO 8601 datetime' }),
    resolvedAt: zod_1.z.string().datetime().optional().nullable(),
    status: exports.incidentStatusEnum.optional().default('active'),
});
exports.updateIncidentSchema = zod_1.z.object({
    status: exports.incidentStatusEnum.optional(),
    resolvedAt: zod_1.z.string().datetime().optional().nullable(),
    symptom: zod_1.z.string().min(3).optional(),
    downloadSpeed: zod_1.z.number().nonnegative().optional(),
    uploadSpeed: zod_1.z.number().nonnegative().optional(),
    pingMs: zod_1.z.number().int().nonnegative().optional(),
    notes: zod_1.z.string().optional(),
});
exports.routerConfigSchema = zod_1.z.object({
    deviceName: zod_1.z.string().min(1, 'Device name is required'),
    ipAddress: zod_1.z.string().optional(),
    ssid: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.aiDiagnoseSchema = zod_1.z.object({
    ispName: zod_1.z.string().min(1, 'ISP name is required'),
    symptom: zod_1.z.string().min(3, 'Symptom description is required'),
    ping: zod_1.z.number().nonnegative().optional().default(0),
    downloadSpeed: zod_1.z.number().nonnegative().optional().default(0),
    uploadSpeed: zod_1.z.number().nonnegative().optional().default(0),
    routerModel: zod_1.z.string().optional().default('Standard Gateway'),
    connectionType: zod_1.z.string().optional().default('fiber'),
    additionalNotes: zod_1.z.string().optional(),
});
exports.aiReportSchema = zod_1.z.object({
    ispName: zod_1.z.string().min(1, 'ISP name is required'),
    accountNumber: zod_1.z.string().optional().default('ACC-NOT-SPECIFIED'),
    timeRangeDays: zod_1.z.number().int().positive().optional().default(30),
    customerName: zod_1.z.string().optional().default('Valued Subscriber'),
    desiredOutcome: zod_1.z.string().optional().default('Billing credit and technician line check'),
});
