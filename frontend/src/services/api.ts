import { NetworkIncident, UptimeAnalytics, LiveNetworkTelemetry, RouterConfig, AiDiagnosis } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('netpulse_auth_token') || 'demo-token';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const api = {
  // Incidents
  async getIncidents(filters?: { status?: string; isp?: string }): Promise<NetworkIncident[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isp) params.append('isp', filters.isp);

    const res = await fetch(`${BASE_URL}/incidents?${params.toString()}`, {
      headers: getAuthHeader()
    });
    const json = await res.json();
    return json.data || [];
  },

  async getIncidentById(id: string): Promise<NetworkIncident> {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      headers: getAuthHeader()
    });
    const json = await res.json();
    return json.data;
  },

  async createIncident(data: Partial<NetworkIncident>): Promise<NetworkIncident> {
    const res = await fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to log incident');
    return json.data;
  },

  async updateIncident(id: string, updates: Partial<NetworkIncident>): Promise<NetworkIncident> {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update incident');
    return json.data;
  },

  async deleteIncident(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/incidents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete incident');
  },

  // Analytics
  async getUptimeAnalytics(): Promise<UptimeAnalytics> {
    const res = await fetch(`${BASE_URL}/analytics/uptime`, {
      headers: getAuthHeader()
    });
    const json = await res.json();
    return json.data;
  },

  async getLiveStatus(): Promise<LiveNetworkTelemetry> {
    const res = await fetch(`${BASE_URL}/analytics/live-status`, {
      headers: getAuthHeader()
    });
    const json = await res.json();
    return json.data;
  },

  // AI Advisory & Reports
  async diagnoseNetwork(data: {
    ispName: string;
    symptom: string;
    ping?: number;
    downloadSpeed?: number;
    uploadSpeed?: number;
    routerModel?: string;
    connectionType?: string;
  }): Promise<AiDiagnosis> {
    const res = await fetch(`${BASE_URL}/ai/diagnose`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to diagnose');
    return json.data;
  },

  async generateReport(data: {
    ispName: string;
    accountNumber?: string;
    customerName?: string;
    timeRangeDays?: number;
    desiredOutcome?: string;
  }): Promise<{
    reportSubject: string;
    reportContent: string;
    slaBreachSummary: {
      contractedSla: string;
      actualUptime: string;
      serviceCreditRecommended: string;
    };
  }> {
    const res = await fetch(`${BASE_URL}/ai/report`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to generate report');
    return json.data;
  },

  async chatWithDoctor(prompt: string, history?: any[]): Promise<string> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ prompt, history })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI Doctor failed to reply');
    return json.data.reply;
  },

  // Routers
  async getRouters(): Promise<RouterConfig[]> {
    const res = await fetch(`${BASE_URL}/routers`, {
      headers: getAuthHeader()
    });
    const json = await res.json();
    return json.data || [];
  },

  async createRouter(data: Partial<RouterConfig>): Promise<RouterConfig> {
    const res = await fetch(`${BASE_URL}/routers`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to register router');
    return json.data;
  },

  async deleteRouter(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/routers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete router');
  }
};
