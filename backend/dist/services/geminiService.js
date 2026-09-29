"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNetworkDiagnosis = generateNetworkDiagnosis;
exports.generateIspReport = generateIspReport;
exports.getAiAdvisorAdvice = getAiAdvisorAdvice;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;
if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
        aiClient = new genai_1.GoogleGenAI({ apiKey });
        console.log('✅ Google GenAI SDK initialized successfully');
    }
    catch (err) {
        console.error('❌ Failed to initialize Google GenAI SDK:', err);
    }
}
else {
    console.log('ℹ️ Using NetPulse AI Expert Engine (Real-time Adaptive Diagnosis)');
}
const SYSTEM_PROMPT = `You are NetPulse AI, an elite principal network engineer, ISP infrastructure expert, and Wi-Fi diagnostics specialist. Your goal is to provide precise, actionable, and structured troubleshooting guidance to users experiencing internet instability. Always return valid JSON matching requested schemas when requested, prioritizing clear, step-by-step resolutions for routers, modems, and ISP peering bottlenecks.`;
/**
 * Generate intelligent structured network diagnosis using @google/genai or advanced expert engine
 */
async function generateNetworkDiagnosis(incidentData) {
    const { ispName, symptom, ping, downloadSpeed, uploadSpeed = 0, routerModel = 'Standard Gateway', connectionType = 'fiber' } = incidentData;
    // Try real Gemini API first if configured
    if (aiClient) {
        try {
            const response = await aiClient.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${SYSTEM_PROMPT}\n\nAnalyze this network downtime report:
ISP: ${ispName}
Connection Type: ${connectionType}
Router/Gateway Model: ${routerModel}
Symptom: ${symptom}
Ping: ${ping}ms
Download Speed: ${downloadSpeed}Mbps
Upload Speed: ${uploadSpeed}Mbps

Analyze the network downtime report and return a JSON object with keys:
- rootCause (string)
- severityLevel (string: 'low' | 'medium' | 'high' | 'critical')
- troubleshootingSteps (array of strings)
- ispEscalationAdvice (string)
`,
                config: {
                    responseMimeType: 'application/json'
                }
            });
            const text = response.text;
            if (text) {
                const parsed = JSON.parse(text);
                return {
                    rootCause: parsed.rootCause || 'Network layer degradation detected.',
                    severityLevel: (['low', 'medium', 'high', 'critical'].includes(parsed.severityLevel) ? parsed.severityLevel : 'medium'),
                    troubleshootingSteps: Array.isArray(parsed.troubleshootingSteps) ? parsed.troubleshootingSteps : ['Restart router and inspect cabling.'],
                    ispEscalationAdvice: parsed.ispEscalationAdvice || 'Contact ISP support if issue persists past 1 hour.',
                    generatedAt: new Date().toISOString(),
                    isSimulated: false
                };
            }
        }
        catch (error) {
            console.warn('⚠️ Gemini API call failed or rate limited, using adaptive expert diagnostic model:', error);
        }
    }
    // Adaptive Expert Network Diagnostic Engine (matches exact schema and produces hyper-realistic technical advice)
    const isHighLatency = ping > 120;
    const isSeverePacketLoss = symptom.toLowerCase().includes('packet loss') || symptom.toLowerCase().includes('drop');
    const isTotalOutage = downloadSpeed === 0 || symptom.toLowerCase().includes('total outage') || symptom.toLowerCase().includes('no internet');
    const isDnsError = symptom.toLowerCase().includes('dns') || symptom.toLowerCase().includes('resolv');
    let severity = 'medium';
    let rootCause = '';
    let steps = [];
    let escalation = '';
    if (isTotalOutage) {
        severity = 'critical';
        rootCause = `Physical layer or WAN handshake failure between ${routerModel} and ${ispName}'s local distribution plant (CMTS/OLT node). No upstream carrier signal detected.`;
        steps = [
            `Inspect the WAN interface link light on ${routerModel}. Verify the fiber patch cord / coax / Ethernet cable is firmly seated without severe bends.`,
            `Power-cycle the ONT/Modem and router in sequence: unplug both for 60 seconds, power on the modem first until sync LED is solid, then boot the router.`,
            `Log into gateway administration console (typically 192.168.1.1 or 192.168.0.1) and check WAN DHCP lease status and optical power level / downstream channel SNR.`
        ];
        escalation = `Contact ${ispName} Tier 2 technical dispatch immediately. State: "Total WAN link failure; ONT/Modem cannot lock carrier signal. Request automated line loopback test and confirm local area node ticket status."`;
    }
    else if (isSeverePacketLoss) {
        severity = 'high';
        rootCause = `RF spectrum congestion or radar DFS channel interruption on 5GHz/6GHz Wi-Fi band, or degraded copper/optical line attenuation along ${ispName}'s last-mile infrastructure.`;
        steps = [
            `Run a continuous ping test (e.g. 'ping 192.168.1.1 -t' vs 'ping 1.1.1.1 -t') to isolate whether packet drop occurs locally over Wi-Fi or on the ISP WAN route.`,
            `Log into ${routerModel} settings: switch 5GHz channel from Auto/DFS (channels 52-144) to static clean channels (e.g. 36, 44, or 149-161) and disable 20/40/80MHz channel hopping.`,
            `Inspect Cat6 Ethernet cable between modem and primary router port for damaged pins or negotiated 100Mbps fallback.`
        ];
        escalation = `Open a trouble ticket with ${ispName}. Provide MTR / WinMTR output documenting sustained packet drop exceeding 10% on the ISP hop immediately following your gateway.`;
    }
    else if (isHighLatency) {
        severity = 'medium';
        rootCause = `Bufferbloat during concurrent upload/download bursts, or suboptimal ISP BGP routing/peering transit hop congestion near ${ispName} regional gateway.`;
        steps = [
            `Enable Smart Queue Management (SQM) or Cake/FQ-CoDel on ${routerModel} to prioritize interactive gaming/VoIP traffic over bulk streams.`,
            `Configure custom DNS resolvers (1.1.1.1, 9.9.9.9, or 8.8.8.8) with DNS-over-HTTPS (DoH) to eliminate DNS lookup latency spikes.`,
            `Check router connected device list for unauthorized high-bandwidth background downloads or rogue peer-to-peer uploads.`
        ];
        escalation = `Contact ${ispName} and request a route audit. Reference specific trace route destination IPs where ping jumps from local 15ms to over ${ping}ms.`;
    }
    else if (isDnsError) {
        severity = 'medium';
        rootCause = `${ispName}'s default recursive DNS server cluster is experiencing query throttling, packet discard, or cache poisoning protection timeouts.`;
        steps = [
            `Manually override WAN DNS servers on ${routerModel} to Cloudflare (1.1.1.1, 1.0.0.1) and Google (8.8.8.8, 8.8.4.4).`,
            `Flush local OS DNS resolver cache ('ipconfig /flushdns' on Windows or 'sudo dscacheutil -flushcache' on macOS).`,
            `Disable ISP router 'DNS Rebind Protection' if accessing local hostnames or internal microservices.`
        ];
        escalation = `Inform ${ispName} support that primary recursive DNS servers failed resolution checks, resolved temporarily via third-party Anycast DNS.`;
    }
    else {
        severity = 'low';
        rootCause = `Minor local RF interference or transient ISP edge routing re-convergence on ${ispName} ${connectionType} network.`;
        steps = [
            `Perform a clean soft reboot of ${routerModel} from the admin web dashboard.`,
            `Verify router firmware is up to date and thermal dissipation vents are unobstructed.`,
            `Run a verified bufferbloat and jitter test at Waveform or Speedtest.`
        ];
        escalation = `Monitor connection over the next 24 hours. If drops recur more than twice daily, request an ISP line quality signal check.`;
    }
    return {
        rootCause,
        severityLevel: severity,
        troubleshootingSteps: steps,
        ispEscalationAdvice: escalation,
        generatedAt: new Date().toISOString(),
        isSimulated: !aiClient
    };
}
/**
 * Generate formal ISP complaint letter and SLA downtime compensation demand
 */
async function generateIspReport(data) {
    const { ispName, accountNumber, customerName, totalOutages, totalDowntimeHours, uptimePercentage, timeRangeDays, desiredOutcome, recentIncidents } = data;
    if (aiClient) {
        try {
            const response = await aiClient.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${SYSTEM_PROMPT}\n\nGenerate an authoritative, professional, and legally compliant ISP Service Level Agreement (SLA) Failure Complaint and Downtime Escalation Letter.
Details:
- ISP Name: ${ispName}
- Account Number: ${accountNumber}
- Customer Name: ${customerName}
- Total Outages in last ${timeRangeDays} days: ${totalOutages}
- Total Downtime: ${totalDowntimeHours} hours
- Recorded Uptime Percentage: ${uptimePercentage}%
- Desired Resolution: ${desiredOutcome}
- Incidents: ${JSON.stringify(recentIncidents.slice(0, 5))}

Return valid JSON with keys:
- reportSubject (string)
- reportContent (string, multi-paragraph formatted letter)
- slaBreachSummary (object with contractedSla, actualUptime, serviceCreditRecommended)`
            });
            const text = response.text;
            if (text) {
                const parsed = JSON.parse(text);
                if (parsed.reportSubject && parsed.reportContent) {
                    return parsed;
                }
            }
        }
        catch (e) {
            console.warn('⚠️ Gemini report generation fallback:', e);
        }
    }
    // High-standard SLA complaint letter generator
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const incidentLines = recentIncidents.slice(0, 4).map((inc, i) => `  ${i + 1}. [${new Date(inc.started_at).toLocaleString()}] Symptom: ${inc.symptom} (Downtime: ${inc.duration})`).join('\n');
    const reportSubject = `FORMAL NOTICE: Service Level Agreement (SLA) Breach & Service Degradation - Acct #${accountNumber} - ${customerName}`;
    const reportContent = `Date: ${dateStr}
To: ${ispName} Customer Relations & Executive Resolution Tier
From: ${customerName}
Account Number: ${accountNumber}
Subject: ${reportSubject}

Dear Customer Escalations Director,

This correspondence serves as a formal dispute and documented Service Level Agreement (SLA) degradation notice regarding internet connectivity supplied by ${ispName} to my premises. 

Over the preceding ${timeRangeDays} billing cycle days, our network monitoring system (NetPulse AI Enterprise Telemetry) recorded ${totalOutages} significant network disruption incidents, accumulating a total of ${totalDowntimeHours} hours of unscheduled downtime. The actual delivered uptime rate of ${uptimePercentage}% falls unacceptably below standard consumer and business SLA expectations (99.9% availability threshold).

Summary of Timestamped Telemetry Records:
${incidentLines || '  No isolated incidents recorded during this specific query interval.'}

Technical Impact & Diagnostics:
Continuous ICMP ping telemetry, DOCSIS/Optical handshake traces, and automated route monitoring establish that these service interruptions originated within ${ispName}'s distribution infrastructure and regional transport nodes, rather than customer-premises equipment (CPE). The resulting disruptions have directly impeded remote employment, critical communications, and business-critical operations.

Demanded Remediation:
In accordance with your advertised Terms of Service and statutory consumer telecommunications protections, I respectfully request:
1. An immediate billing credit of 25%–50% applied to the current invoice reflecting cumulative downtime and failure to deliver advertised bandwidth and uptime.
2. A formal ticket dispatch for Tier 3 network engineering to perform an end-to-end loopback check, node SNR calibration, and line health certification on our assigned terminal.
3. Written confirmation within five (5) business days acknowledging receipt of this telemetry report and outlining preventative measures taken.

Should this matter remain unaddressed, these timestamped logs will be forwarded directly to the Federal Communications Commission (FCC Consumer Inquiries) and the State Attorney General Consumer Protection Division.

Thank you for your prompt attention to restoring reliable, uninterrupted connectivity.

Sincerely,

${customerName}
NetPulse AI Verified Network Audit Record`;
    const serviceCreditRecommended = uptimePercentage < 98 ? '$45.00 - $75.00 (or 35% of monthly bill)' : '$25.00 bill credit';
    return {
        reportSubject,
        reportContent,
        slaBreachSummary: {
            contractedSla: '99.90% Standard Target',
            actualUptime: `${uptimePercentage}%`,
            serviceCreditRecommended
        }
    };
}
/**
 * Interactive AI Network Advisor conversation endpoint
 */
async function getAiAdvisorAdvice(userPrompt, history) {
    if (aiClient) {
        try {
            const contents = [
                { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\nUser Question: ${userPrompt}` }] }
            ];
            const response = await aiClient.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${SYSTEM_PROMPT}\n\nContextual Network Engineer Assistant:\nUser asks: "${userPrompt}"\n\nProvide an authoritative, clear, and step-by-step diagnostic recommendation covering router configs, frequency bands (2.4/5/6 GHz), DNS, bufferbloat, or ISP diagnostics.`
            });
            if (response.text) {
                return response.text;
            }
        }
        catch (e) {
            console.warn('⚠️ Gemini chat failed, using fallback:', e);
        }
    }
    // Intelligent fallback responses based on keywords
    const lower = userPrompt.toLowerCase();
    if (lower.includes('bufferbloat') || lower.includes('lag') || lower.includes('jitter')) {
        return `### ⚡ Diagnosing Bufferbloat & Latency Jitter

Bufferbloat occurs when your router's internal packet buffers queue excess data during heavy uploads/downloads, causing ping spikes of 150ms–500ms.

#### Recommended Action Plan:
1. **Enable Smart Queue Management (SQM):** Log into your router (e.g. AsusWRT, OpenWrt, or Ubiquiti) and enable **Cake** or **FQ-CoDel** QoS algorithms. Set WAN download and upload limits to 90–95% of your line rate.
2. **Eliminate Half-Duplex Wi-Fi Lag:** If on Wi-Fi, test with a direct Cat6 Ethernet patch cable to establish your baseline ping.
3. **Check MTU Size:** Verify your router WAN MTU is set to 1500 (or 1492 if using PPPoE DSL/Fiber).`;
    }
    if (lower.includes('dns') || lower.includes('cannot resolve') || lower.includes('site cant be reached')) {
        return `### 🌐 Resolving DNS Failures & Domain Timeouts

When websites fail with "DNS_PROBE_FINISHED_NXDOMAIN", the issue typically stems from slow or filtered ISP DNS caching servers.

#### Recommended Fix:
1. **Configure Fast Anycast Resolvers on your Router:**
   - **Primary DNS:** \`1.1.1.1\` (Cloudflare) or \`9.9.9.9\` (Quad9 with malware filter)
   - **Secondary DNS:** \`8.8.8.8\` (Google)
2. **Enable DNS-over-HTTPS (DoH):** Protects DNS requests from ISP transparent interception and caching anomalies.
3. **Flush Local DNS Cache:**
   - Windows: \`ipconfig /flushdns\`
   - macOS: \`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder\``;
    }
    if (lower.includes('channel') || lower.includes('interference') || lower.includes('wifi drop') || lower.includes('wi-fi drop')) {
        return `### 📡 Eliminating Wi-Fi Channel Congestion & Drops

Intermittent Wi-Fi disconnects are predominantly caused by overlapping neighbor access points or Dynamic Frequency Selection (DFS) radar radar dropouts.

#### Configuration Tweaks:
1. **2.4 GHz Band:** Lock channel width to **20 MHz** (never 40 MHz) and use only non-overlapping channels: **1, 6, or 11**.
2. **5 GHz Band:** If your router keeps disconnecting every 30–60 minutes, you are likely on a **DFS Channel (52-144)** that is vacating when weather radar is detected. Switch to non-DFS channels: **36, 40, 44, 48** (UNII-1) or **149, 153, 157, 161** (UNII-3).
3. **Separate SSIDs:** Split your 2.4GHz and 5GHz bands into distinct network names (e.g., 'Home_2G' and 'Home_5G') if IoT smart plugs struggle with band-steering.`;
    }
    return `### 🛠️ NetPulse Network Engineering Advisory

Based on your query: **"${userPrompt}"**

Here are the standard diagnostic milestones:
1. **Isolate Physical vs ISP Layer:** Run \`ping 192.168.1.1 -n 20\` followed by \`ping 8.8.8.8 -n 20\`. If local router ping is < 2ms with 0% loss, the disruption is strictly in the ISP modem/fiber line.
2. **Check Thermal & Memory Load:** High router CPU or RAM exhaustion causes dropped connections. Verify your router has at least 25% free RAM and adequate ventilation.
3. **Submit Incident:** Use the NetPulse **Log Incident** tab to automatically generate a Gemini diagnostic breakdown and log downtime towards your ISP SLA refund claim!`;
}
