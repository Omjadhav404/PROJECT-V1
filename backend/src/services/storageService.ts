import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NetworkIncident, RouterConfig, UserProfile, UptimeAnalytics, AiDiagnosis } from '../types/index.js';
import { supabase } from './supabaseService.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface LocalStoreData {
  incidents: NetworkIncident[];
  routers: RouterConfig[];
  profiles: UserProfile[];
}

// Initial realistic seed data for instant wow-factor and historical analytics
const INITIAL_SEED_INCIDENTS: NetworkIncident[] = [
  {
    id: 'f87a1d52-2591-4e4b-9721-a4968364cf10',
    user_id: 'default-user',
    isp_name: 'Comcast Xfinity',
    router_model: 'Arris Surfboard SB8200 & ASUS RT-AX88U',
    connection_type: 'cable',
    symptom: 'Total Outage: Cable modem downstream DOCSIS 3.1 channel lock failure',
    download_speed: 0,
    upload_speed: 0,
    ping_ms: 0,
    status: 'resolved',
    started_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 34.5 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    ai_diagnosis: {
      rootCause: 'DOCSIS 3.1 Downstream OFDM Lock Disruption due to ISP Node Splitting or street amplifier power loss.',
      severityLevel: 'critical',
      troubleshootingSteps: [
        'Checked 192.168.100.1 modem event log: T3/T4 Ranging request timeouts detected.',
        'Inspected coaxial splitter and tightened RG6 connectors.',
        'Power-cycled modem for 60 seconds after upstream ISP plant node reset.'
      ],
      ispEscalationAdvice: 'Report DOCSIS SNR drop below 32dB on channel 4-12. Reference neighborhood outage ticket.'
    }
  },
  {
    id: 'b149c71a-6e3a-49a2-9477-d64e9a385311',
    user_id: 'default-user',
    isp_name: 'AT&T Fiber',
    router_model: 'BGW320-500 Gateway',
    connection_type: 'fiber',
    symptom: 'High Latency / Ping Spikes: 280ms jitter during peak streaming hours',
    download_speed: 120.4,
    upload_speed: 84.1,
    ping_ms: 284,
    status: 'resolved',
    started_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 17.2 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    ai_diagnosis: {
      rootCause: 'ISP regional peering exchange congestion along Level3/Lumen transit route and bufferbloat on local gateway.',
      severityLevel: 'medium',
      troubleshootingSteps: [
        'Enabled Smart Queue Management (SQM) / FQ-CoDel on router WAN interface.',
        'Changed DNS resolver to 1.1.1.1 (Cloudflare) and 9.9.9.9 (Quad9) with DNS-over-HTTPS.',
        'Isolated bandwidth-heavy background cloud backup synchronization.'
      ],
      ispEscalationAdvice: 'Submit MTR / Traceroute packet hops showing 200ms+ jump at first ISP edge gateway hop.'
    }
  },
  {
    id: '9c585c54-ee0e-4361-95c5-cc86e7368812',
    user_id: 'default-user',
    isp_name: 'Verizon Fios',
    router_model: 'Netgear Nighthawk RAXE500 (Wi-Fi 6E)',
    connection_type: 'fiber',
    symptom: 'Wi-Fi Drops & Packet Loss: 14% packet drop on 5GHz band intermittently',
    download_speed: 480.0,
    upload_speed: 390.5,
    ping_ms: 45,
    status: 'active',
    started_at: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    ai_diagnosis: {
      rootCause: 'Radar DFS channel collision (Dynamic Frequency Selection) forcing router 5GHz radio channel hop to congested 80MHz spectrum.',
      severityLevel: 'high',
      troubleshootingSteps: [
        'Log into router admin at 192.168.1.1 and disable DFS channel auto-selection.',
        'Pin 5GHz radio to clean non-DFS channel (e.g., 36, 44, or 149-161).',
        'Enable 802.11k/v fast BSS transition and verify channel width set to 80MHz.'
      ],
      ispEscalationAdvice: 'Optical ONT status is Green. Issue is localized to RF interference; no ISP truck roll needed unless ONT loses 10G link.'
    }
  }
];

const INITIAL_SEED_ROUTERS: RouterConfig[] = [
  {
    id: 'r1-asus-ax88u',
    user_id: 'default-user',
    device_name: 'ASUS RT-AX88U Pro (Main Gateway)',
    ip_address: '192.168.50.1',
    ssid: 'NetPulse_Gigabit_5G',
    notes: 'Firmware 3.0.0.6, SQM Cake active, Dual-WAN failover enabled',
    created_at: new Date(Date.now() - 60 * 86400 * 1000).toISOString(),
  },
  {
    id: 'r2-eero-mesh',
    user_id: 'default-user',
    device_name: 'Eero Pro 6E (Office Satellite)',
    ip_address: '192.168.50.45',
    ssid: 'NetPulse_Gigabit_Mesh',
    notes: 'Ethernet backhaul over Cat6a, 6GHz dedicated band active',
    created_at: new Date(Date.now() - 40 * 86400 * 1000).toISOString(),
  }
];

class StorageService {
  private inMemoryData: LocalStoreData = {
    incidents: [...INITIAL_SEED_INCIDENTS],
    routers: [...INITIAL_SEED_ROUTERS],
    profiles: [
      {
        id: 'default-user',
        email: 'admin@netpulse.ai',
        full_name: 'Network Operations Engineer',
        default_isp: 'AT&T Fiber',
        created_at: new Date(Date.now() - 90 * 86400 * 1000).toISOString()
      }
    ]
  };

  private isSupabaseLive: boolean | null = null;

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.incidents && Array.isArray(parsed.incidents)) {
          this.inMemoryData.incidents = parsed.incidents;
        }
        if (parsed.routers && Array.isArray(parsed.routers)) {
          this.inMemoryData.routers = parsed.routers;
        }
        if (parsed.profiles && Array.isArray(parsed.profiles)) {
          this.inMemoryData.profiles = parsed.profiles;
        }
      } else {
        this.saveLocalStorage();
      }
    } catch (err) {
      console.warn('⚠️ Local file storage init note:', err);
    }
  }

  private saveLocalStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.inMemoryData, null, 2), 'utf-8');
    } catch (err) {
      console.warn('⚠️ Failed to save local store file:', err);
    }
  }

  public async getIncidents(userId: string, filters?: { status?: string; ispName?: string }): Promise<NetworkIncident[]> {
    // Try Supabase first if available
    if (supabase) {
      try {
        let query = supabase.from('network_incidents').select('*').order('started_at', { ascending: false });
        if (userId && userId !== 'default-user') {
          query = query.eq('user_id', userId);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }
        if (filters?.ispName) {
          query = query.ilike('isp_name', `%${filters.ispName}%`);
        }
        const { data, error } = await query;
        if (!error && data) {
          this.isSupabaseLive = true;
          return data as NetworkIncident[];
        }
      } catch (e) {
        // Fall back seamlessly
      }
    }

    // Local in-memory filter
    let results = this.inMemoryData.incidents.filter(inc => {
      if (userId && userId !== 'default-user' && inc.user_id !== userId) return false;
      if (filters?.status && inc.status !== filters.status) return false;
      if (filters?.ispName && !inc.isp_name.toLowerCase().includes(filters.ispName.toLowerCase())) return false;
      return true;
    });

    return results.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }

  public async getIncidentById(id: string): Promise<NetworkIncident | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('network_incidents').select('*').eq('id', id).single();
        if (!error && data) return data as NetworkIncident;
      } catch (e) {
        // Fallback
      }
    }
    const found = this.inMemoryData.incidents.find(i => i.id === id);
    return found || null;
  }

  public async createIncident(incidentData: Omit<NetworkIncident, 'id' | 'created_at'>): Promise<NetworkIncident> {
    const newIncident: NetworkIncident = {
      ...incidentData,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('network_incidents').insert([newIncident]).select().single();
        if (!error && data) {
          this.inMemoryData.incidents.unshift(data as NetworkIncident);
          this.saveLocalStorage();
          return data as NetworkIncident;
        }
      } catch (e) {
        // Fallback
      }
    }

    this.inMemoryData.incidents.unshift(newIncident);
    this.saveLocalStorage();
    return newIncident;
  }

  public async updateIncident(id: string, updates: Partial<NetworkIncident>): Promise<NetworkIncident | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('network_incidents').update(updates).eq('id', id).select().single();
        if (!error && data) {
          const idx = this.inMemoryData.incidents.findIndex(i => i.id === id);
          if (idx !== -1) {
            this.inMemoryData.incidents[idx] = { ...this.inMemoryData.incidents[idx], ...data };
            this.saveLocalStorage();
          }
          return data as NetworkIncident;
        }
      } catch (e) {
        // Fallback
      }
    }

    const idx = this.inMemoryData.incidents.findIndex(i => i.id === id);
    if (idx === -1) return null;

    this.inMemoryData.incidents[idx] = {
      ...this.inMemoryData.incidents[idx],
      ...updates
    };
    this.saveLocalStorage();
    return this.inMemoryData.incidents[idx];
  }

  public async deleteIncident(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('network_incidents').delete().eq('id', id);
      } catch (e) {
        // Fallback
      }
    }

    const initialLen = this.inMemoryData.incidents.length;
    this.inMemoryData.incidents = this.inMemoryData.incidents.filter(i => i.id !== id);
    this.saveLocalStorage();
    return this.inMemoryData.incidents.length < initialLen;
  }

  public async getRouters(userId: string): Promise<RouterConfig[]> {
    if (supabase) {
      try {
        let query = supabase.from('router_configs').select('*').order('created_at', { ascending: false });
        if (userId && userId !== 'default-user') {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && data) return data as RouterConfig[];
      } catch (e) {
        // Fallback
      }
    }
    return this.inMemoryData.routers.filter(r => !userId || userId === 'default-user' || r.user_id === userId);
  }

  public async createRouter(routerData: Omit<RouterConfig, 'id' | 'created_at'>): Promise<RouterConfig> {
    const newRouter: RouterConfig = {
      ...routerData,
      id: uuidv4(),
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('router_configs').insert([newRouter]).select().single();
        if (!error && data) {
          this.inMemoryData.routers.unshift(data as RouterConfig);
          this.saveLocalStorage();
          return data as RouterConfig;
        }
      } catch (e) {
        // Fallback
      }
    }

    this.inMemoryData.routers.unshift(newRouter);
    this.saveLocalStorage();
    return newRouter;
  }

  public async deleteRouter(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('router_configs').delete().eq('id', id);
      } catch (e) {
        // Fallback
      }
    }
    const len = this.inMemoryData.routers.length;
    this.inMemoryData.routers = this.inMemoryData.routers.filter(r => r.id !== id);
    this.saveLocalStorage();
    return this.inMemoryData.routers.length < len;
  }

  public calculateAnalytics(userId: string): UptimeAnalytics {
    const incidents = this.inMemoryData.incidents;
    const totalIncidents = incidents.length;
    const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'investigating').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

    // Calculate total downtime in hours (past 30 days window: 720 hours total)
    const totalWindowHours = 720;
    let totalDowntimeHours = 0;
    let pingSum = 0;
    let pingCount = 0;
    let dlSum = 0;
    let ulSum = 0;
    let speedCount = 0;

    const hourCountMap: { [hour: string]: number } = {};
    const ispMap: { [isp: string]: { total: number; resolved: number } } = {};

    incidents.forEach(inc => {
      const start = new Date(inc.started_at).getTime();
      const end = inc.resolved_at ? new Date(inc.resolved_at).getTime() : Date.now();
      const durationHours = Math.max(0.1, (end - start) / (1000 * 3600));
      totalDowntimeHours += durationHours;

      if (inc.ping_ms && inc.ping_ms > 0) {
        pingSum += inc.ping_ms;
        pingCount++;
      }
      if (inc.download_speed !== undefined && inc.download_speed > 0) {
        dlSum += inc.download_speed;
        ulSum += (inc.upload_speed || 0);
        speedCount++;
      }

      // Hour of day peak analysis
      const hourStr = `${new Date(inc.started_at).getHours().toString().padStart(2, '0')}:00`;
      hourCountMap[hourStr] = (hourCountMap[hourStr] || 0) + 1;

      // ISP analysis
      if (!ispMap[inc.isp_name]) {
        ispMap[inc.isp_name] = { total: 0, resolved: 0 };
      }
      ispMap[inc.isp_name].total += 1;
      if (inc.status === 'resolved') ispMap[inc.isp_name].resolved += 1;
    });

    const uptimePercentage = Math.max(90.0, Math.min(99.99, Number((((totalWindowHours - totalDowntimeHours) / totalWindowHours) * 100).toFixed(2))));
    const mtbfHours = totalIncidents > 0 ? Number(((totalWindowHours - totalDowntimeHours) / totalIncidents).toFixed(1)) : totalWindowHours;
    const averagePingMs = pingCount > 0 ? Math.round(pingSum / pingCount) : 22;
    const averageDownloadSpeed = speedCount > 0 ? Number((dlSum / speedCount).toFixed(1)) : 350.5;
    const averageUploadSpeed = speedCount > 0 ? Number((ulSum / speedCount).toFixed(1)) : 120.0;

    // Peak hours array
    const peakOutageHours = Object.keys(hourCountMap).map(h => ({
      hour: h,
      count: hourCountMap[h]
    })).sort((a, b) => b.count - a.count);

    if (peakOutageHours.length === 0) {
      peakOutageHours.push({ hour: '14:00', count: 1 }, { hour: '19:00', count: 2 }, { hour: '22:00', count: 1 });
    }

    // ISP reliability array
    const ispReliability = Object.keys(ispMap).map(name => {
      const stats = ispMap[name];
      const score = Math.max(88, 100 - (stats.total * 3));
      return {
        ispName: name,
        incidentCount: stats.total,
        uptimeScore: score
      };
    });

    if (ispReliability.length === 0) {
      ispReliability.push(
        { ispName: 'Comcast Xfinity', incidentCount: 1, uptimeScore: 97.2 },
        { ispName: 'AT&T Fiber', incidentCount: 1, uptimeScore: 99.4 },
        { ispName: 'Verizon Fios', incidentCount: 1, uptimeScore: 98.8 }
      );
    }

    // Generate daily timeline for 14 days
    const dailyUptimeTimeline = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const dayIncidents = incidents.filter(inc => inc.started_at.startsWith(dateStr)).length;
      const uptimePercent = dayIncidents === 0 ? 100 : Number((100 - (dayIncidents * 1.8)).toFixed(1));
      dailyUptimeTimeline.push({
        date: dateStr.slice(5), // MM-DD
        uptimePercent,
        incidents: dayIncidents
      });
    }

    return {
      uptimePercentage,
      totalIncidents,
      activeIncidents,
      resolvedIncidents,
      totalDowntimeHours: Number(totalDowntimeHours.toFixed(1)),
      mtbfHours,
      averagePingMs,
      averageDownloadSpeed,
      averageUploadSpeed,
      peakOutageHours,
      ispReliability,
      dailyUptimeTimeline
    };
  }
}

export const storageService = new StorageService();
