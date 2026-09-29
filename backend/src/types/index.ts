export type ConnectionType = 'fiber' | 'cable' | 'dsl' | 'satellite' | '5g_home';
export type IncidentStatus = 'active' | 'resolved' | 'investigating';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AiDiagnosis {
  rootCause: string;
  severityLevel: SeverityLevel;
  troubleshootingSteps: string[];
  ispEscalationAdvice: string;
  generatedAt?: string;
  isSimulated?: boolean;
}

export interface NetworkIncident {
  id: string;
  user_id: string;
  isp_name: string;
  router_model?: string;
  connection_type: ConnectionType;
  symptom: string;
  download_speed?: number;
  upload_speed?: number;
  ping_ms?: number;
  status: IncidentStatus;
  ai_diagnosis?: AiDiagnosis;
  started_at: string;
  resolved_at?: string;
  created_at: string;
}

export interface RouterConfig {
  id: string;
  user_id: string;
  device_name: string;
  ip_address?: string;
  ssid?: string;
  notes?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  default_isp?: string;
  created_at: string;
}

export interface UptimeAnalytics {
  uptimePercentage: number;
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  totalDowntimeHours: number;
  mtbfHours: number; // Mean Time Between Failures
  averagePingMs: number;
  averageDownloadSpeed: number;
  averageUploadSpeed: number;
  peakOutageHours: { hour: string; count: number }[];
  ispReliability: { ispName: string; incidentCount: number; uptimeScore: number }[];
  dailyUptimeTimeline: { date: string; uptimePercent: number; incidents: number }[];
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}
