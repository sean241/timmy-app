"use client";

import { useState, useEffect } from "react";
import {
    Users, Clock, AlertTriangle, Smartphone, Sun, CloudRain,
    CheckCircle, XCircle, ArrowRight, FileText, AlertOctagon, MoreHorizontal, Loader2, MapPin
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

// --- Types ---
type LogType = 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';

interface DashboardStats {
    scheduled: number;
    present: number;
    late: number;
    absent: number; // No-show
    kiosksOnline: number;
    totalKiosks: number;
    siteStats?: { id: string; name: string; present: number; scheduled: number; late: number; }[];
    totalEmployees: number;
    totalHoursScheduled: number;
    alerts?: { type: 'critical' | 'warning' | 'success', title: string, desc: string, action?: any }[];
}

interface LiveFeedItem {
    id: string;
    time: string; // HH:MM
    name: string;
    site: string;
    avatar: string | null;
    status: 'ok' | 'late' | 'out';
    type: 'IN' | 'OUT';
    delay?: string;
}

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // UI State
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({ scheduled: 0, present: 0, late: 0, absent: 0, kiosksOnline: 0, totalKiosks: 0, siteStats: [], totalEmployees: 0, totalHoursScheduled: 0, alerts: [] });
    const [feed, setFeed] = useState<LiveFeedItem[]>([]);
    const [weather, setWeather] = useState("sun");
    const [userName, setUserName] = useState("Manager");

    useEffect(() => {
        setMounted(true);
        fetchDashboardData();

        // Auto-refresh every minute
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Get User & Org
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id, first_name').eq('id', user.id).single();
            if (!profile?.organization_id) return;

            setUserName(profile.first_name || "Manager");
            const orgId = profile.organization_id;

            // 2. Define Time Range (Today)
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

            // 3. Parallel Fetches
            const [
                { data: shifts },
                { data: logs },
                { data: employees },
                { data: kiosks },
                { data: sites },
                { data: orgData },
                { count: totalEmployeesCount },
                { data: yesterdayLogs }
            ] = await Promise.all([
                // Shifts today (Include unassigned for total hours calculation)
                supabase.from('shifts').select('*').eq('organization_id', orgId).gte('start_time', startOfDay).lt('start_time', endOfDay),
                // Logs today
                supabase.from('attendance_logs').select('*, employee:employees(id, first_name, last_name, avatar_url), site:sites(name)').eq('organization_id', orgId).gte('timestamp', startOfDay).order('timestamp', { ascending: false }).limit(20),
                // Active Employees
                supabase.from('employees').select('id, first_name, last_name').eq('organization_id', orgId).eq('is_active', true),
                // Kiosks
                supabase.from('kiosks').select('id, last_heartbeat_at, name').eq('organization_id', orgId),
                // Sites (for lookup if needed)
                supabase.from('sites').select('id, name').eq('organization_id', orgId),
                // Org Settings for default start time
                supabase.from('organizations').select('settings').eq('id', orgId).single(),
                // Total active employees count
                supabase.from('employees').select('id', { count: 'exact' }).eq('organization_id', orgId).eq('is_active', true),
                // Yesterday logs for anomalies
                supabase.from('attendance_logs').select('employee_id, type').eq('organization_id', orgId).gte('timestamp', new Date(Date.now() - 86400000 * 2).toISOString()).lt('timestamp', startOfDay) // Fetch last 48h roughly to be safe, clipped by startOfDay
            ]);

            // 4. Compute KPIs
            const scheduledCount = shifts?.length || 0;
            const shiftMap = new Map();
            let totalHoursScheduled = 0;

            shifts?.forEach((s: any) => {
                if (s.employee_id) shiftMap.set(s.employee_id, s);
                const start = new Date(s.start_time).getTime();
                const end = new Date(s.end_time).getTime();
                let durationHours = (end - start) / (1000 * 60 * 60);
                // Deduct break if any (stored in minutes)
                if (s.break_minutes) {
                    durationHours -= (s.break_minutes / 60);
                }
                totalHoursScheduled += Math.max(0, durationHours);
            });

            const settings = orgData?.settings as any;
            const defaultStartStr = settings?.planning?.start_time || "08:00";
            const toleranceMinutes = settings?.attendance?.tolerance_minutes || 15;

            // Process Logs to find CURRENT status
            // We need ALL logs for status, but we only fetched 20 for feed. 
            // Let's fetch ALL logs today for stats (lightweight columns)
            const { data: allLogs } = await supabase.from('attendance_logs').select('employee_id, type, timestamp, site_id').eq('organization_id', orgId).gte('timestamp', startOfDay).order('timestamp', { ascending: true });

            const presentSet = new Set<string>();
            const lateSet = new Set<string>();
            const employeeStatus = new Map<string, { type: string, time: string }>();

            allLogs?.forEach((log: any) => {
                employeeStatus.set(log.employee_id, { type: log.type, time: log.timestamp });
            });

            // Calculate Present
            employeeStatus.forEach((status, empId) => {
                const type = status.type; // 'CHECK_IN' or 'CHECK_OUT'
                if (type === 'CHECK_IN' || type === 'IN') { // Handle potential enum variations
                    presentSet.add(empId);
                }
            });

            // Calculate Late (Shift started > 15m ago AND (no log OR log > start+15m))
            // Only relevant for scheduled employees OR if using default time
            const nowTime = new Date().getTime();

            // 1. Check existing Shifts for Late Arrival OR Missing Start
            shifts?.forEach((s: any) => {
                const shiftStart = new Date(s.start_time).getTime();
                const tolerance = toleranceMinutes * 60 * 1000;

                // Did they check in?
                const firstLog = allLogs?.find((l: any) => l.employee_id === s.employee_id && (l.type === 'IN' || l.type === 'CHECK_IN'));

                if (firstLog) {
                    // Arrived. Was it late?
                    const logTime = new Date(firstLog.timestamp).getTime();
                    if (logTime > shiftStart + tolerance) {
                        lateSet.add(s.employee_id);
                    }
                } else {
                    // Not arrived yet. Is it too late?
                    if (nowTime > shiftStart + tolerance) {
                        lateSet.add(s.employee_id);
                    }
                }
            });

            // 2. Check Spontaneous Arrivals (No Shift) for Lateness against Default Time
            // Iterate over all logs today to find people who clocked in late but had NO shift
            allLogs?.forEach((log: any) => {
                if ((log.type === 'IN' || log.type === 'CHECK_IN') && !shiftMap.has(log.employee_id)) {
                    // Check against default start time
                    const [h, m] = defaultStartStr.split(':');
                    const d = new Date(log.timestamp);
                    d.setHours(parseInt(h), parseInt(m), 0, 0);
                    const targetStartMs = d.getTime();
                    const logTime = new Date(log.timestamp).getTime();

                    const toleranceMs = toleranceMinutes * 60 * 1000;

                    if (logTime > targetStartMs + toleranceMs) {
                        lateSet.add(log.employee_id);
                    }
                }
            });

            // Calculate Kiosks Online (Heartbeat < 1h)
            const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const onlineKiosks = kiosks?.filter((k: any) => k.last_heartbeat_at > cutoff).length || 0;

            // 6. Compute Site Stats (New Feature)
            const siteStatsMap = new Map<string, { id: string, name: string, present: number, scheduled: number, late: number }>();

            // Initialize with all sites
            sites?.forEach((s: any) => {
                siteStatsMap.set(s.id, { id: s.id, name: s.name, present: 0, scheduled: 0, late: 0 });
            });

            // Count Scheduled
            shifts?.forEach((s: any) => {
                if (s.site_id && siteStatsMap.has(s.site_id)) {
                    siteStatsMap.get(s.site_id)!.scheduled++;
                }
            });

            // Count Present (Latest Check-in is IN)
            const activeEmployeesOnSite = new Map<string, string>(); // empId -> siteId
            employeeStatus.forEach((status, empId) => {
                const type = status.type;
                if (type === 'CHECK_IN' || type === 'IN') {
                    // Find which site they are on? 
                    // Use the site from the LAST log (allLogs is ordered asc, so we need to be careful).
                    // Actually 'allLogs' is ASC. So last log is current status.
                    const lastLog = allLogs?.filter((l: any) => l.employee_id === empId).pop();
                    if (lastLog && lastLog.site_id && siteStatsMap.has(lastLog.site_id)) {
                        siteStatsMap.get(lastLog.site_id)!.present++;
                        activeEmployeesOnSite.set(empId, lastLog.site_id);
                    }
                }
            });

            // Count Late (Using our calculated lateSet)
            lateSet.forEach(empId => {
                // If they are present, we know their site.
                if (activeEmployeesOnSite.has(empId)) {
                    const siteId = activeEmployeesOnSite.get(empId)!;
                    siteStatsMap.get(siteId)!.late++;
                } else {
                    // If absent, use their scheduled shift site
                    const shift = shiftMap.get(empId);
                    if (shift && siteStatsMap.has(shift.site_id)) {
                        siteStatsMap.get(shift.site_id)!.late++;
                    }
                }
            });

            // Calculate Anomalies (Yesterday)
            const anomaliesSet = new Set<string>();
            const yesterdayMap = new Map<string, string[]>();
            yesterdayLogs?.forEach((l: any) => {
                const arr = yesterdayMap.get(l.employee_id) || [];
                arr.push(l.type);
                yesterdayMap.set(l.employee_id, arr);
            });
            yesterdayMap.forEach((types, empId) => {
                const ins = types.filter(t => t === 'IN' || t === 'CHECK_IN').length;
                const outs = types.filter(t => t === 'OUT' || t === 'CHECK_OUT').length;
                if (ins !== outs) anomaliesSet.add(empId);
            });

            // Build Alerts
            const alertsList: any[] = [];

            // Kiosks Offline (>1h)
            // Kiosks Offline (>1h)
            const nowTs = Date.now();
            const oneHour = 60 * 60 * 1000;
            const offlineKiosksList = kiosks?.filter((k: any) => !k.last_heartbeat_at || (nowTs - new Date(k.last_heartbeat_at).getTime() > oneHour)) || [];
            if (offlineKiosksList.length > 0) {
                alertsList.push({ type: 'critical', title: `${offlineKiosksList.length} Kiosque(s) Hors Ligne`, desc: offlineKiosksList.map((k: any) => k.name).join(', '), action: '/admin/terminals' });
            }

            // Anomalies Yesterday
            if (anomaliesSet.size > 0) {
                alertsList.push({ type: 'warning', title: `${anomaliesSet.size} Anomalies hier`, desc: "Oublis de pointage suspectés", action: '/admin/time-entries' });
            }

            // Default Success
            if (alertsList.length === 0) {
                alertsList.push({ type: 'success', title: "Système Opérationnel", desc: "Aucune alerte à signaler" });
            }


            setStats({
                scheduled: scheduledCount,
                present: presentSet.size,
                late: lateSet.size,
                absent: Math.max(0, scheduledCount - presentSet.size),
                kiosksOnline: onlineKiosks,
                totalKiosks: kiosks?.length || 0,
                siteStats: Array.from(siteStatsMap.values()), // Show all sites (removed filter)
                totalEmployees: totalEmployeesCount || 0,
                totalHoursScheduled: totalHoursScheduled,
                alerts: alertsList
            });

            // 5. Build Feed
            const newFeed = (logs || []).map((log: any) => {
                const emp = log.employee;
                const shift = shiftMap.get(log.employee_id);
                const logTime = new Date(log.timestamp);
                const timeStr = logTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let status: LiveFeedItem['status'] = 'ok';
                let delay = '';

                // Determine Status (Hybrid: Shift OR Default)
                if (log.type === 'CHECK_IN' || log.type === 'IN') {
                    let targetStartMs = 0;
                    if (shift) {
                        targetStartMs = new Date(shift.start_time).getTime();
                    } else {
                        // Parse default start time (e.g. "08:00")
                        const [h, m] = defaultStartStr.split(':');
                        const d = new Date(logTime);
                        d.setHours(parseInt(h), parseInt(m), 0, 0);
                        targetStartMs = d.getTime();
                    }

                    const diff = logTime.getTime() - targetStartMs;
                    // Use configured tolerance or 15m default
                    const toleranceMs = toleranceMinutes * 60 * 1000;

                    if (diff > toleranceMs) {
                        status = 'late';
                        delay = `+ ${Math.floor(diff / 60000)} m`;
                    }
                }

                if (log.type === 'CHECK_OUT' || log.type === 'OUT') status = 'out';

                return {
                    id: log.id,
                    time: timeStr,
                    name: emp ? `${emp.first_name} ${emp.last_name} ` : 'Unknown',
                    site: log.site?.name || 'Site',
                    avatar: emp?.avatar_url || null,
                    status: status,
                    type: ((log.type === 'CHECK_IN' || log.type === 'IN') ? 'IN' : 'OUT') as 'IN' | 'OUT',
                    delay
                };
            });
            setFeed(newFeed);
            setLoading(false);

        } catch (error) {
            console.error("Dashboard Fetch Error", error);
            setLoading(false);
        }
    };

    if (!mounted) return null;

    // --- EMPTY STATE (Onboarding) ---
    if (!loading && stats.totalEmployees === 0) {
        return (
            <div className="max-w-4xl mx-auto w-full py-12 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-3xl font-bold text-[#0F4C5C]">Bienvenue sur Timmy ! 👋</h1>
                    <p className="text-gray-500 text-lg">Votre espace est prêt. Il ne reste plus qu'à le configurer.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => router.push('/admin/sites')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#0F4C5C] transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-50 text-[#0F4C5C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MapPin size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">1. Créez vos Sites</h3>
                        <p className="text-sm text-gray-500">Définissez vos chantiers, bureaux ou points de vente.</p>
                    </div>

                    <div onClick={() => router.push('/admin/employees')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#0F4C5C] transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">2. Ajoutez vos Employés</h3>
                        <p className="text-sm text-gray-500">Invitez votre équipe ou créez leurs profils manuellement.</p>
                    </div>

                    <div onClick={() => router.push('/admin/terminals')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#0F4C5C] transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">3. Connectez un Kiosque</h3>
                        <p className="text-sm text-gray-500">Transformez une tablette en pointeuse numérique.</p>
                    </div>

                    <div onClick={() => router.push('/admin/planning')} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#0F4C5C] transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">4. Planifiez les Shifts</h3>
                        <p className="text-sm text-gray-500">Organisez le temps de travail et publiez le planning.</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN DASHBOARD (With Data) ---
    return (
        <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-500 mb-20">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bonjour, {userName} 👋</h1>
                    <p className="text-gray-500">
                        {stats.siteStats && stats.siteStats.length > 0
                            ? "Voici ce qui se passe sur vos sites aujourd'hui."
                            : "Tout est calme pour le moment."}
                    </p>
                </div>

                {/* Weather Widget (Hidden on mobile if too crowded?) */}
                <div className={`hidden md:flex items - center gap - 3 px - 4 py - 2 rounded - xl border shadow - sm transition - colors ${weather === 'sun' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 'bg-blue-50 border-blue-100 text-blue-800'} `}>
                    {weather === 'sun' ? <Sun size={24} className="text-yellow-500 animate-pulse-slow" /> : <CloudRain size={24} className="text-blue-500" />}
                    <div>
                        <div className="font-bold text-sm">Libreville</div>
                        <div className="text-xs opacity-80">{weather === 'sun' ? '32°C • Ensoleillé' : '28°C • Averses'}</div>
                    </div>
                </div>
            </div>

            {/* --- ZONE 1: KPIs --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Presence */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-[#0F4C5C] transition-colors cursor-pointer" onClick={() => router.push('/admin/time-entries')}>
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Présents</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                {loading ? <Loader2 className="animate-spin" /> : stats.present}
                                <span className="text-lg text-gray-400 font-normal"> / {stats.scheduled}</span>
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-[#0F4C5C]">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-auto z-10">
                        <div
                            className="bg-[#0F4C5C] h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${stats.scheduled > 0 ? (stats.present / stats.scheduled) * 100 : 0}% ` }}
                        ></div>
                    </div>
                    <Users size={100} className="absolute -bottom-4 -right-4 text-gray-50 opacity-10 group-hover:scale-110 transition-transform" />
                </div>

                {/* 2. Retards */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-orange-300 transition-colors cursor-pointer" onClick={() => router.push('/admin/time-entries')}>
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Retards</p>
                            <h3 className="text-3xl font-bold text-orange-600">
                                {loading ? '-' : stats.late}
                            </h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <Clock size={20} />
                        </div>
                    </div>
                    {stats.late > 0 ? (
                        <div className="z-10 text-xs font-bold text-orange-600 flex items-center gap-1 mt-auto">
                            Voir la liste <ArrowRight size={12} />
                        </div>
                    ) : (
                        <div className="z-10 text-xs font-medium text-gray-400 mt-auto">Aucun retard</div>
                    )}
                    <Clock size={100} className="absolute -bottom-4 -right-4 text-orange-50 opacity-10 group-hover:scale-110 transition-transform" />
                </div>

                {/* 3. Kiosques */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-green-300 transition-colors cursor-pointer" onClick={() => router.push('/admin/terminals')}>
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Kiosques</p>
                            <h3 className={`text-3xl font-bold ${stats.kiosksOnline === stats.totalKiosks && stats.totalKiosks > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                                {loading ? '-' : `${stats.kiosksOnline} / ${stats.totalKiosks}`}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <Smartphone size={20} />
                        </div>
                    </div>
                    <div className="z-10 flex items-center gap-2 mt-auto">
                        <span className={`w-2 h-2 rounded-full ${stats.kiosksOnline > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                        <span className="text-xs font-medium text-green-700">{stats.kiosksOnline > 0 ? 'Système actif' : 'Hors ligne'}</span>
                    </div>
                    <Smartphone size={100} className="absolute -bottom-4 -right-4 text-green-50 opacity-10 group-hover:scale-110 transition-transform" />
                </div>

                {/* 4. REPLACED CARD: Planification / Heures */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-violet-300 transition-colors cursor-pointer" onClick={() => router.push('/admin/planning')}>
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Planifié (24h)</p>
                            <h3 className="text-3xl font-bold text-violet-600">
                                {loading ? '-' : Math.round(stats.totalHoursScheduled)}<span className="text-lg font-medium text-violet-300">h</span>
                            </h3>
                        </div>
                        <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="z-10 text-xs font-bold text-violet-600 flex items-center gap-1 mt-auto">
                        Voir le planning <ArrowRight size={12} />
                    </div>
                    <Clock size={100} className="absolute -bottom-4 -right-4 text-violet-50 opacity-10 group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* --- NEW ZONE: SITE BREAKDOWN --- */}
            {
                stats.siteStats && stats.siteStats.length > 0 ? (
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-slate-500" />
                            État des Chantiers
                        </h2>
                        {/* Auto-responsive grid: 1 col for 1 item, 3 cols for many */}
                        <div className={`grid gap-4 ${stats.siteStats.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {stats.siteStats.map(site => (
                                <div key={site.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800 truncate" title={site.name}>{site.name}</h3>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-600">
                                            {site.present}/{site.scheduled}
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                        {/* Present Green */}
                                        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(site.present / Math.max(site.scheduled, 1)) * 100}%` }}></div>
                                        {/* Remainder */}
                                    </div>
                                    <div className="flex justify-between text-xs items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <div className="flex items-center gap-1 text-emerald-600 font-bold">
                                                {site.present} Présents
                                            </div>
                                        </div>
                                        {site.late > 0 && (
                                            <div className="flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
                                                <Clock size={10} />
                                                {site.late} Retards
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Empty Site States (Data loaded but nothing today) */
                    !loading && stats.totalEmployees > 0 && (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
                            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                                <CloudRain size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800">Aucune activité chantier</h3>
                            <p className="text-sm text-slate-500">Aucun shift planifié ni pointage enregistré pour aujourd'hui sur vos sites.</p>
                        </div>
                    )
                )
            }


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- ZONE 2: LIVE FEED --- */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            En Direct (Live Feed)
                        </h2>
                        {feed.length > 0 && <span className="text-xs text-gray-400">Dernière maj: {new Date().toLocaleTimeString()}</span>}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-48 text-gray-400 flex-col gap-2">
                                <Loader2 className="animate-spin" />
                                <span>Chargement...</span>
                            </div>
                        ) : feed.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-gray-400">
                                Calme plat... 🦗 Aucun pointage aujourd'hui.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {feed.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors animate-in slide-in-from-left-2 duration-300">
                                        <div className="font-mono text-sm font-bold text-gray-500 w-12 text-center bg-gray-50 rounded py-1">{item.time}</div>
                                        <div className="relative">
                                            {item.avatar ? (
                                                <img src={item.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-gray-200">
                                                    {item.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 truncate">{item.name}</div>
                                            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                <AlertOctagon size={10} />
                                                {item.site}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {item.type === 'IN' ? (
                                                <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full shadow-sm border ${item.status === 'late'
                                                    ? parseInt(item.delay?.replace('+', '')?.replace('m', '') || '0') > 60
                                                        ? 'bg-red-50 text-red-700 border-red-200' // Critical Late (> 1h)
                                                        : 'bg-orange-50 text-orange-700 border-orange-200' // Standard Late
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200' // On Time
                                                    }`}>
                                                    {item.status === 'late' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                                    {item.status === 'late' ? `Retard ${item.delay}` : 'À l\'heure'}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-gray-500 text-sm font-bold bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                                    <ArrowRight size={14} /> Départ
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ZONE 3: ACTIONS / STATUS --- */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Alertes & Statuts</h2>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
                        {stats.alerts?.map((alert, idx) => (
                            <div
                                key={idx}
                                onClick={() => alert.action && router.push(alert.action)}
                                className={`p-4 flex gap-3 items-start transition-colors ${alert.action ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                            >
                                <div className={`mt-1 p-1.5 rounded-full shrink-0 ${alert.type === 'critical' ? 'bg-red-100 text-red-600' :
                                    alert.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                        'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    {alert.type === 'critical' ? <XCircle size={16} /> :
                                        alert.type === 'warning' ? <AlertTriangle size={16} /> :
                                            <CheckCircle size={16} />}
                                </div>
                                <div>
                                    <div className={`font-bold text-sm ${alert.type === 'critical' ? 'text-red-700' :
                                        alert.type === 'warning' ? 'text-orange-800' :
                                            'text-slate-800'
                                        }`}>{alert.title}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{alert.desc}</div>
                                </div>
                                {alert.action && <ArrowRight size={14} className="ml-auto text-slate-300 mt-1" />}
                            </div>
                        ))}
                    </div>

                    {/* Raccourcis */}
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => router.push('/admin/planning')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-[#0F4C5C] hover:border-[#0F4C5C] transition-all">
                            <Clock size={12} /> Planning
                        </button>
                        <button onClick={() => router.push('/admin/time-entries')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-[#0F4C5C] hover:border-[#0F4C5C] transition-all">
                            <FileText size={12} /> Pointages
                        </button>
                        <button onClick={() => router.push('/admin/employees')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-[#0F4C5C] hover:border-[#0F4C5C] transition-all">
                            <Users size={12} /> Staff
                        </button>
                    </div>

                    {/* Support Card */}
                    <div className="bg-[#0F4C5C] rounded-xl p-5 text-white shadow-lg relative overflow-hidden group cursor-pointer mt-4">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Besoin d'aide ?</h3>
                            <p className="text-blue-100 text-sm mb-4">Contactez notre support dédié.</p>
                            <button className="bg-white text-[#0F4C5C] px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                                Support WhatsApp
                            </button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                            <Smartphone size={120} />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
