import { z } from 'zod';

export const connectionTypeEnum = z.enum(['fiber', 'cable', 'dsl', 'satellite', '5g_home']);
export const incidentStatusEnum = z.enum(['active', 'resolved', 'investigating']);

export const incidentSchema = z.object({
  ispName: z.string().min(1, 'ISP name is required'),
  routerModel: z.string().optional(),
  connectionType: connectionTypeEnum.default('fiber'),
  symptom: z.string().min(3, 'Describe the symptom with at least 3 characters'),
  downloadSpeed: z.number().nonnegative().optional(),
  uploadSpeed: z.number().nonnegative().optional(),
  pingMs: z.number().int().nonnegative().optional(),
  startedAt: z.string().datetime({ message: 'Must be a valid ISO 8601 datetime' }),
  resolvedAt: z.string().datetime().optional().nullable(),
  status: incidentStatusEnum.optional().default('active'),
});

export const updateIncidentSchema = z.object({
  status: incidentStatusEnum.optional(),
  resolvedAt: z.string().datetime().optional().nullable(),
  symptom: z.string().min(3).optional(),
  downloadSpeed: z.number().nonnegative().optional(),
  uploadSpeed: z.number().nonnegative().optional(),
  pingMs: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const routerConfigSchema = z.object({
  deviceName: z.string().min(1, 'Device name is required'),
  ipAddress: z.string().optional(),
  ssid: z.string().optional(),
  notes: z.string().optional(),
});

export const aiDiagnoseSchema = z.object({
  ispName: z.string().min(1, 'ISP name is required'),
  symptom: z.string().min(3, 'Symptom description is required'),
  ping: z.number().nonnegative().optional().default(0),
  downloadSpeed: z.number().nonnegative().optional().default(0),
  uploadSpeed: z.number().nonnegative().optional().default(0),
  routerModel: z.string().optional().default('Standard Gateway'),
  connectionType: z.string().optional().default('fiber'),
  additionalNotes: z.string().optional(),
});

export const aiReportSchema = z.object({
  ispName: z.string().min(1, 'ISP name is required'),
  accountNumber: z.string().optional().default('ACC-NOT-SPECIFIED'),
  timeRangeDays: z.number().int().positive().optional().default(30),
  customerName: z.string().optional().default('Valued Subscriber'),
  desiredOutcome: z.string().optional().default('Billing credit and technician line check'),
});
