"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/lib/supabase";
import { getSignedUrlAction } from "@/app/actions/storage";
import { useLanguage } from '@/app/context/LanguageContext';
import {
    Search, Calendar, Download, Plus,
    ArrowRightCircle, ArrowLeftCircle,
    AlertCircle, CloudOff, MapPin, X, CheckCircle, Loader2,
    Users, Clock, UserCheck, AlertTriangle, Lock
} from 'lucide-react';

// Types
interface Log {
    id: string;
    employee_id: string;
    type: 'IN' | 'OUT';
    timestamp: string;
    created_at: string;
    photo?: string;
    site?: { name: string };
    employee?: { first_name: string; last_name: string; avatar_url: string; job_title?: string };
    kiosk?: { name: string };
    reason?: string; // For manual entries
    correction_reason?: string;
    is_manual_entry?: boolean;
}

export default function AttendanceLogsPage() {
    const { t } = useLanguage();
    const [view, setView] = useState<'logs' | 'timesheets' | 'reports'>('logs');
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    // Data for Filters & Modal
    const [employees, setEmployees] = useState<{ id: string, first_name: string, last_name: string, job_title?: string, is_active?: boolean, avatar_url?: string }[]>([]);
    const [sites, setSites] = useState<{ id: string, name: string }[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSite, setFilterSite] = useState("all");
    const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'last_week' | 'month' | 'custom'>('today');
    const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [shifts, setShifts] = useState<any[]>([]);

    // Modal State
    const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [manualEntryStatus, setManualEntryStatus] = useState<"idle" | "saving" | "success">("idle");
    const [manualForm, setManualForm] = useState({
        employee_id: "",
        type: "IN",
        date: "",
        time: "",
        site_id: "",
        reason: ""
    });

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Secure URL Mapping
    const [secureUrlMap, setSecureUrlMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const [orgSettings, setOrgSettings] = useState<any>(null);
    const [isPeriodLocked, setIsPeriodLocked] = useState(false);

    // Searchable Dropdown State
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

    // Sync search input when opening modal or editing
    useEffect(() => {
        if (isManualEntryModalOpen) {
            if (manualForm.employee_id) {
                const emp = employees.find(e => e.id === manualForm.employee_id);
                setEmployeeSearch(emp ? `${emp.first_name} ${emp.last_name}` : "");
            } else {
                setEmployeeSearch("");
            }
            setIsEmployeeDropdownOpen(false);
        }
    }, [isManualEntryModalOpen, manualForm.employee_id, employees]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
            if (profile?.organization_id) {
                setOrganizationId(profile.organization_id);
                fetchLogs(profile.organization_id);
                fetchAuxData(profile.organization_id);
                fetchSettings(profile.organization_id);
            }
        };

        fetchInitialData();
    }, []);

    const fetchSettings = async (orgId: string) => {
        const { data } = await supabase.from('organizations').select('settings').eq('id', orgId).single();
        if (data?.settings) {
            setOrgSettings(data.settings);
        }
    };

    const fetchLogs = async (orgId: string) => {
        setIsLoading(true);
        // console.log("Fetching logs for Org ID:", orgId);

        const { data, error } = await supabase
            .from('attendance_logs')
            .select(`
                *,
                employee:employees (first_name, last_name, avatar_url, job_title),
                site:sites (name),
                kiosk:kiosks (name)
            `)
            .eq('organization_id', orgId)
            .order('timestamp', { ascending: false });

        if (error) {
            console.error("Error fetching logs:", error);
        } else {
            // Map CHECK_IN/CHECK_OUT to IN/OUT for frontend consistency
            const mappedData = data?.map(log => ({
                ...log,
                type: log.type === 'CHECK_IN' ? 'IN' : 'OUT',
                photo: log.photo_url // Map DB column to Frontend field
            })) || [];

            setLogs(mappedData as Log[]);
        }
        setIsLoading(false);
    };

    const fetchAuxData = async (orgId: string) => {
        const { data: empData } = await supabase.from('employees').select('id, first_name, last_name, job_title, is_active, avatar_url').eq('organization_id', orgId).order('last_name');
        const { data: siteData } = await supabase.from('sites').select('id, name').eq('organization_id', orgId);

        // Fetch Shifts (Last 7 days + Next 2 days)
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 7);
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 2);

        const startOfHistory = new Date(pastDate.setHours(0, 0, 0, 0)).toISOString();
        const endOfFuture = new Date(futureDate.setHours(23, 59, 59, 999)).toISOString();

        const { data: shiftData } = await supabase
            .from('shifts')
            .select('*')
            .eq('organization_id', orgId)
            .gte('start_time', startOfHistory)
            .lt('start_time', endOfFuture);

        if (empData) {
            const realEmployees = empData.filter(e =>
                !`${e.first_name} ${e.last_name}`.toLowerCase().includes('pourvoir')
            );
            setEmployees(realEmployees);
        }
        if (siteData) setSites(siteData);
        if (shiftData) setShifts(shiftData);
    };

    const handleCorrect = (log: Log) => {
        const logDate = new Date(log.timestamp);
        // @ts-ignore - Supabase join returns object, but we need ID for form. 
        // We assume log.site_id exists on the log object itself (fk).
        // If not, we might need to rely on what we have or just default to empty if missing.
        // Usually Supabase returns the FK column too.

        setEditingId(log.id);
        setManualForm({
            employee_id: log.employee_id,
            type: log.type,
            date: logDate.toISOString().split('T')[0],
            time: logDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            site_id: (log as any).site_id || "",
            reason: log.correction_reason || ""
        });
        setIsManualEntryModalOpen(true);
    };

    const handleManualEntrySave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organizationId) return;

        setManualEntryStatus("saving");

        // Combine Date & Time
        const entryDate = new Date(`${manualForm.date}T${manualForm.time}:00`);

        // Validation: Prevent Future Entries
        if (entryDate > new Date()) {
            setManualEntryStatus("idle");
            setToast({ message: t.dashboard?.futureEntryError || "Impossible de pointer dans le futur", type: "error" });
            return;
        }

        const fullTimestamp = entryDate.toISOString();

        const payload = {
            organization_id: organizationId,
            employee_id: manualForm.employee_id,
            site_id: manualForm.site_id,
            type: manualForm.type === 'IN' ? 'CHECK_IN' : 'CHECK_OUT',
            timestamp: fullTimestamp,
            is_manual_entry: true,
            correction_reason: manualForm.reason,
            is_offline_sync: false,
            kiosk_id: null
        };

        let error;

        if (editingId) {
            // UPDATE
            const { error: updateError } = await supabase
                .from('attendance_logs')
                .update(payload)
                .eq('id', editingId);
            error = updateError;
        } else {
            // INSERT
            const { error: insertError } = await supabase
                .from('attendance_logs')
                .insert(payload);
            error = insertError;
        }

        if (error) {
            console.error("Error saving entry", error);
            setManualEntryStatus("idle");
            alert("Error saving entry");
        } else {
            setManualEntryStatus("success");
            setToast({ message: t.common?.success || "Succès", type: "success" });
            setTimeout(() => {
                setManualEntryStatus("idle");
                setIsManualEntryModalOpen(false);
                setEditingId(null);
                setManualForm({ ...manualForm, employee_id: "", reason: "" });
                if (organizationId) fetchLogs(organizationId);
            }, 1000);
        }
    };

    // Helper to get current Date Range
    const getFilterRange = () => {
        const today = new Date();
        const start = new Date(today);
        const end = new Date(today);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const getStartOfWeek = (d: Date) => {
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
            return new Date(d.setDate(diff));
        };

        if (dateFilter === 'yesterday') {
            start.setDate(today.getDate() - 1);
            end.setDate(today.getDate() - 1);
        } else if (dateFilter === 'week') {
            const monday = getStartOfWeek(new Date(today));
            start.setTime(monday.getTime());
            start.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            end.setTime(sunday.getTime());
            end.setHours(23, 59, 59, 999);
        } else if (dateFilter === 'last_week') {
            const monday = getStartOfWeek(new Date(today));
            monday.setDate(monday.getDate() - 7);
            start.setTime(monday.getTime());
            start.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            end.setTime(sunday.getTime());
            end.setHours(23, 59, 59, 999);
        } else if (dateFilter === 'month') {
            start.setDate(1);
            const nextMonth = new Date(start);
            nextMonth.setMonth(start.getMonth() + 1);
            nextMonth.setDate(0);
            end.setTime(nextMonth.getTime());
            end.setHours(23, 59, 59, 999);
        } else if (dateFilter === 'custom') {
            const s = new Date(customStartDate);
            const e = new Date(customEndDate);
            start.setTime(s.getTime());
            end.setTime(e.getTime());
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
        return { start, end };
    };

    const filteredLogs = useMemo(() => {
        const { start, end } = getFilterRange();

        return logs.filter(log => {
            // 1. Search
            const empName = log.employee ? `${log.employee.first_name} ${log.employee.last_name}` : "Unknown";
            if (searchQuery && !empName.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            // 2. Site
            if (filterSite !== "all" && (log as any).site_id !== filterSite) return false;

            // 3. Date
            const logDate = new Date(log.timestamp);
            if (logDate < start || logDate > end) return false;

            return true;
        });
    }, [logs, searchQuery, filterSite, dateFilter, customStartDate, customEndDate]);

    // Handle Secure URLs for Photos
    useEffect(() => {
        const fetchSecureUrls = async () => {
            const logsWithPhotos = filteredLogs.filter(log => log.photo && !log.photo.startsWith('http'));

            if (logsWithPhotos.length === 0) return;

            const newUrls: Record<string, string> = {};
            await Promise.all(logsWithPhotos.map(async (log) => {
                if (log.photo && !secureUrlMap[log.id]) {
                    const url = await getSignedUrlAction(log.photo);
                    if (url) {
                        newUrls[log.id] = url;
                    }
                }
            }));

            if (Object.keys(newUrls).length > 0) {
                setSecureUrlMap(prev => ({ ...prev, ...newUrls }));
            }
        };

        fetchSecureUrls();
    }, [filteredLogs]);

    // Timesheet Calculation
    const timesheetData = useMemo(() => {
        // Calculate if view is timesheets OR reports (since reports depend on timesheets)
        if (view !== 'timesheets' && view !== 'reports') return [] as {
            key: string;
            employeeName: string;
            jobTitle?: string;
            date: Date;
            firstIn: Date | null;
            lastOut: Date | null;
            totalMinutes: number;
            durationStr: string;
            breakDeduction: number;
            overtimeMinutes: number;
            overtimeStr: string;
        }[];

        const groups: Record<string, Log[]> = {};

        // Group by Employee + Date
        filteredLogs.forEach(log => {
            const d = new Date(log.timestamp);
            const ymd = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            const key = `${log.employee_id}_${ymd}`;

            if (!groups[key]) groups[key] = [];
            groups[key].push(log);
        });

        // Compute stats per group
        return Object.values(groups).map(dayLogs => {
            dayLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            const emp = dayLogs[0].employee;
            const date = new Date(dayLogs[0].timestamp);
            let totalMinutes = 0;
            let firstIn: Date | null = null;
            let lastOut: Date | null = null;

            let currentIn: Date | null = null;

            dayLogs.forEach(log => {
                const t = new Date(log.timestamp);
                if (log.type === 'IN') {
                    if (!firstIn) firstIn = t;
                    currentIn = t;
                } else if (log.type === 'OUT') {
                    lastOut = t;
                    if (currentIn) {
                        const diff = (t.getTime() - currentIn.getTime()) / 60000;
                        totalMinutes += diff;
                        currentIn = null;
                    }
                }
            });

            // Auto-Break Deduction Logic
            let breakDeduction = 0;
            const autoBreak = orgSettings?.attendance?.auto_break;
            // Check if enabled and if worked enough hours (default 6h)
            if (autoBreak?.enabled && totalMinutes > (autoBreak.threshold_hours || 6) * 60) {
                breakDeduction = autoBreak.duration_minutes || 0;
            }

            const finalMinutes = Math.max(0, totalMinutes - breakDeduction);

            // Overtime Calculation
            let overtimeMinutes = 0;
            const overtimeSettings = orgSettings?.attendance?.overtime;
            if (overtimeSettings?.enabled) {
                const threshold = (overtimeSettings.daily_threshold || 8) * 60;
                if (finalMinutes > threshold) {
                    overtimeMinutes = finalMinutes - threshold;
                }
            }

            const h = Math.floor(finalMinutes / 60);
            const m = Math.floor(finalMinutes % 60);

            const oh = Math.floor(overtimeMinutes / 60);
            const om = Math.floor(overtimeMinutes % 60);
            const overtimeStr = overtimeMinutes > 0 ? `+${oh}h${om.toString().padStart(2, '0')}` : '';

            return {
                key: `${dayLogs[0].employee_id}_${date.getTime()}`,
                employeeName: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
                jobTitle: emp?.job_title,
                date: date,
                firstIn,
                lastOut,
                totalMinutes: finalMinutes,
                durationStr: `${h}h${m.toString().padStart(2, '0')}`,
                breakDeduction,
                overtimeMinutes,
                overtimeStr
            };
        }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date desc
    }, [filteredLogs, view, orgSettings]);

    // Reports Aggregation
    const reportData = useMemo(() => {
        if (view !== 'reports') return [];

        const stats: Record<string, { id: string, name: string, job: string, days: number, totalMin: number, overtimeMin: number }> = {};

        timesheetData.forEach(item => {
            const id = item.key.split('_')[0];
            if (!stats[id]) {
                stats[id] = {
                    id: id,
                    name: item.employeeName,
                    job: item.jobTitle || "",
                    days: 0,
                    totalMin: 0,
                    overtimeMin: 0
                };
            }
            stats[id].days += 1;
            stats[id].totalMin += item.totalMinutes;
            stats[id].overtimeMin += item.overtimeMinutes;
        });

        return Object.values(stats).map(s => {
            const h = Math.floor(s.totalMin / 60);
            const m = Math.floor(s.totalMin % 60);

            const oh = Math.floor(s.overtimeMin / 60);
            const om = Math.floor(s.overtimeMin % 60);

            const emp = employees.find(e => e.id === s.id);

            return {
                id: s.id,
                name: s.name,
                job: s.job,
                avatar_url: emp?.avatar_url,
                days: s.days,
                totalMin: s.totalMin,
                overtimeMin: s.overtimeMin,
                totalStr: `${h}h${m.toString().padStart(2, '0')}`,
                overtimeStr: s.overtimeMin > 0 ? `+${oh}h${om.toString().padStart(2, '0')}` : '-'
            };
        }).sort((a, b) => b.totalMin - a.totalMin);
    }, [timesheetData, view, employees]);

    // Compute Dashboard Stats & Anomalies
    const { stats, anomalies, absences } = (() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        // 1. STATS (Today)
        const todayLogs = logs.filter(log => new Date(log.timestamp).getTime() >= startOfToday);
        const employeeStatus: Record<string, 'IN' | 'OUT'> = {};
        const uniqueEmployeesToday = new Set<string>();
        let offlineCount = 0;

        [...todayLogs].reverse().forEach(log => {
            employeeStatus[log.employee_id] = log.type;
            uniqueEmployeesToday.add(log.employee_id);
            if (!log.is_manual_entry && (Math.abs(new Date(log.created_at).getTime() - new Date(log.timestamp).getTime()) / 60000 > 5)) {
                offlineCount++;
            }
        });

        const onSiteCount = Object.values(employeeStatus).filter(status => status === 'IN').length;
        // Total 'Active' employees for stats denominator (exclude archived)
        const activeEmployees = employees.filter(e =>
            e.is_active !== false &&
            !`${e.first_name} ${e.last_name}`.toLowerCase().includes('pourvoir')
        ); // default to true if undefined

        // 2. ABSENCES (Today)
        // 2. ABSENCES (Today)
        // Logic: Check if employee has a shift. If so, use shift start. If not, use global start.
        let absenceList: typeof employees = [];
        const startStr = orgSettings?.planning?.start_time || "08:00";
        const [startH, startM] = startStr.split(':').map(Number);

        // Global Start Time Date Object for Today
        const workStart = new Date(today);
        workStart.setHours(startH, startM, 0, 0);

        absenceList = activeEmployees.map(emp => {
            // If already present (clocked in), not absent
            if (uniqueEmployeesToday.has(emp.id)) return null;

            // Check for specific shift TODAY
            const empShift = shifts.find(s => {
                const sDate = new Date(s.start_time);
                const isSameDay = s.employee_id === emp.id &&
                    sDate.getDate() === today.getDate() &&
                    sDate.getMonth() === today.getMonth() &&
                    sDate.getFullYear() === today.getFullYear();

                return isSameDay;
            });

            let expectedStart = startStr;
            let isLate = false;

            if (empShift) {
                const shiftStart = new Date(empShift.start_time);
                isLate = today > shiftStart;
                expectedStart = shiftStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            } else {
                // Fallback to Global Start
                isLate = today > workStart;
            }

            // Only return if actually late/absent based on their specific time
            if (isLate) {
                return { ...emp, expectedStart };
            }
            return null;
        }).filter(Boolean) as any[];


        // 3. ANOMALIES (Past Missing Checkout)
        // Group logs by Employee -> Day (excluding today)
        // If the LAST action of a past day is IN, it matches the anomaly criteria.
        const anomalyList: { employee_id: string, date: string, last_log: Log }[] = [];
        const logsByEmpDate: Record<string, Log[]> = {};

        logs.forEach(log => {
            const d = new Date(log.timestamp);
            // Skip today
            if (d.getTime() >= startOfToday) return;

            const dateKey = d.toISOString().split('T')[0];
            const key = `${log.employee_id}_${dateKey}`;

            if (!logsByEmpDate[key]) logsByEmpDate[key] = [];
            logsByEmpDate[key].push(log);
        });

        // Analyze each day group
        Object.entries(logsByEmpDate).forEach(([key, dayLogs]) => {
            // dayLogs are descending. The first one is the "last action" of that day.
            const lastAction = dayLogs[0];
            if (lastAction.type === 'IN') {
                // Anomaly Found
                const [empId, dateStr] = key.split('_');
                anomalyList.push({
                    employee_id: empId,
                    date: dateStr,
                    last_log: lastAction
                });
            }
        });

        return {
            stats: {
                totalEmployees: activeEmployees.length,
                activeToday: uniqueEmployeesToday.size,
                currentlyOnSite: onSiteCount,
                offlineSyncs: offlineCount
            },
            anomalies: anomalyList,
            absences: absenceList
        };
    })();

    const handleQuickFix = (anomaly: { employee_id: string, date: string, last_log: Log }) => {
        // 1. Determine Default Time
        let proposedTime = "18:00"; // Fallback

        // A. Check for Shift
        const anomalyDate = new Date(anomaly.date);
        const empShift = shifts.find(s => {
            const sDate = new Date(s.start_time);
            return s.employee_id === anomaly.employee_id &&
                sDate.getDate() === anomalyDate.getDate() &&
                sDate.getMonth() === anomalyDate.getMonth() &&
                sDate.getFullYear() === anomalyDate.getFullYear();
        });

        if (empShift) {
            // Use Shift End Time
            const endTime = new Date(empShift.end_time);
            proposedTime = endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else {
            // B. Use Org Default End Time
            const settingsEndTime = orgSettings?.planning?.end_time;
            if (settingsEndTime) {
                proposedTime = settingsEndTime;
            }
        }

        // 2. Open Modal Pre-filled
        setEditingId(null); // It's a new entry (OUT)
        setManualForm({
            employee_id: anomaly.employee_id,
            type: "OUT",
            date: anomaly.date,
            time: proposedTime,
            site_id: (anomaly.last_log as any).site_id || "",
            reason: "Oubli de pointage (Correction auto)"
        });
        setIsManualEntryModalOpen(true);
    };

    // --- LOCK / VALIDATION LOGIC ---

    const checkLockStatus = async () => {
        if (!organizationId) return;
        const { start, end } = getFilterRange();

        // Find if a LOCKED period covers this range
        const { data } = await supabase.from('payroll_periods')
            .select('id')
            .eq('organization_id', organizationId)
            .in('status', ['LOCKED', 'PAID'])
            .lte('start_date', start.toISOString())
            .gte('end_date', end.toISOString())
            .maybeSingle();

        setIsPeriodLocked(!!data);
    };

    useEffect(() => {
        checkLockStatus();
    }, [dateFilter, customStartDate, customEndDate, organizationId]);

    const handleValidatePeriod = async () => {
        if (!confirm(t.dashboard?.confirmLock || "Confirm Lock?")) return;
        if (!organizationId) return;

        const { start, end } = getFilterRange();
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        const { error } = await supabase.from('payroll_periods').insert({
            organization_id: organizationId,
            name: `Period ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
            start_date: startStr,
            end_date: endStr,
            status: 'LOCKED',
            locked_at: new Date().toISOString()
        });

        if (error) {
            console.error(error);
            alert("Error locking period");
        } else {
            setIsPeriodLocked(true);
        }
    };


    const handleExport = () => {
        import('xlsx').then(XLSX => {
            if (view === 'timesheets') {
                // Timesheet Smart Export
                const dataToExport = timesheetData.map(item => ({
                    [t.dashboard?.timesheet?.date || "Date"]: item.date.toLocaleDateString(),
                    [t.dashboard?.timesheet?.employee || "Employee"]: item.employeeName,
                    "Job Title": item.jobTitle || "",
                    [t.dashboard?.timesheet?.firstIn || "Start"]: item.firstIn?.toLocaleTimeString() || "",
                    [t.dashboard?.timesheet?.lastOut || "End"]: item.lastOut?.toLocaleTimeString() || "",
                    "Break Deduction": item.breakDeduction > 0 ? `${item.breakDeduction}m` : "",
                    [t.dashboard?.timesheet?.total || "Total Worked"]: item.durationStr,
                    [t.dashboard?.timesheet?.overtime || "Overtime"]: item.overtimeStr || "",
                }));

                const ws = XLSX.utils.json_to_sheet(dataToExport);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Timesheets");
                XLSX.writeFile(wb, `timesheets_${new Date().toISOString().split('T')[0]}.xlsx`);

            } else if (view === 'reports') {
                // Reports Export
                const dataToExport = reportData.map(item => ({
                    [t.dashboard?.report?.employee || "Employee"]: item.name,
                    "Job Title": item.job,
                    [t.dashboard?.report?.daysWorked || "Days Worked"]: item.days,
                    [t.dashboard?.report?.totalHours || "Total Hours"]: item.totalStr,
                    [t.dashboard?.report?.totalOvertime || "Total Overtime"]: item.overtimeStr
                }));
                const ws = XLSX.utils.json_to_sheet(dataToExport);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Synthesis");
                XLSX.writeFile(wb, `synthesis_${new Date().toISOString().split('T')[0]}.xlsx`);

            } else {
                // Standard Logs Export
                const dataToExport = filteredLogs.map(log => ({
                    Employee: log.employee ? `${log.employee.first_name} ${log.employee.last_name}` : "Unknown",
                    Type: log.type === 'IN' ? 'Clock In' : 'Clock Out',
                    Date: new Date(log.timestamp).toLocaleDateString(),
                    Time: new Date(log.timestamp).toLocaleTimeString(),
                    Site: log.site?.name || "N/A",
                    Source: log.kiosk?.name || "Manual",
                    "Is Manual": log.is_manual_entry ? "Yes" : "No",
                    "Reason": log.correction_reason || "",
                    "Offline Sync": !log.is_manual_entry && (Math.abs(new Date(log.created_at).getTime() - new Date(log.timestamp).getTime()) / 60000 > 5) ? "Yes" : "No"
                }));

                const ws = XLSX.utils.json_to_sheet(dataToExport);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Attendance Logs");
                XLSX.writeFile(wb, `attendance_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
            }
        });
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F4C5C]">{t.dashboard?.title || "Time Entries"}</h1>
                    <p className="text-sm text-slate-500">{t.dashboard?.subtitle || "Track, edit, and validate attendance."}</p>
                </div>
                <div className="flex gap-2">
                    {/* VALIDATION BUTTON */}
                    {isPeriodLocked ? (
                        <div className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-2 rounded-lg font-bold flex items-center gap-2 text-sm cursor-not-allowed">
                            <Lock className="h-4 w-4" /> {t.dashboard?.periodLocked || "Period Locked"}
                        </div>
                    ) : (
                        <button
                            onClick={handleValidatePeriod}
                            className="bg-slate-800 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-900 text-sm shadow-sm transition-colors"
                        >
                            <CheckCircle className="h-4 w-4" /> {t.dashboard?.validatePeriod || "Validate Period"}
                        </button>
                    )}

                    <button
                        onClick={handleExport}
                        className="border border-slate-300 bg-white text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50 text-sm"
                    >
                        <Download className="h-4 w-4" /> {t.dashboard?.exportExcel || "Export Excel"}
                    </button>
                    <button
                        onClick={() => {
                            // Set default date/time
                            const now = new Date();
                            setManualForm(prev => ({
                                ...prev,
                                date: now.toISOString().split('T')[0],
                                time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) // HH:MM
                            }));
                            setIsManualEntryModalOpen(true);
                        }}
                        className="bg-[#FFC107] text-[#0F4C5C] px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-[#e6ad06] text-sm"
                    >
                        <Plus className="h-5 w-5" /> {t.dashboard?.manualEntry || "Manual Entry"}
                    </button>
                </div>
            </div>

            {/* ERROR / ANOMALIES & ABSENCES */}
            <div className="space-y-4">
                {anomalies.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-bold text-red-800 text-sm mb-1">
                                    {anomalies.length} {anomalies.length > 1 ? (t.dashboard?.anomaliesTitle || "Anomalies Détectées") : "Anomalie Détectée"}
                                </h3>
                                <p className="text-xs text-red-600 mb-3">{t.dashboard?.anomaliesDesc || "The following employees forgot to clock out on previous days."}</p>

                                <div className="space-y-2">
                                    {anomalies.map((anomaly, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-red-100 shadow-sm">
                                            <div className="text-sm">
                                                <span className="font-bold text-slate-800">{anomaly.last_log.employee?.first_name} {anomaly.last_log.employee?.last_name}</span>
                                                <span className="text-slate-500 mx-2">•</span>
                                                <span className="text-slate-600">{new Date(anomaly.date).toLocaleDateString()}</span>
                                            </div>
                                            <button
                                                onClick={() => handleQuickFix(anomaly)}
                                                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold hover:bg-red-200 transition-colors"
                                            >
                                                {(() => {
                                                    // Duplicate logic for display (could actulaly be extracted to a helper if needed, but simple enough here)
                                                    let time = "18:00";
                                                    const d = new Date(anomaly.date);
                                                    const s = shifts.find(sh => {
                                                        const sd = new Date(sh.start_time);
                                                        return sh.employee_id === anomaly.employee_id && sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth();
                                                    });
                                                    if (s) time = new Date(s.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                                    else if (orgSettings?.planning?.end_time) time = orgSettings.planning.end_time;

                                                    const baseLabel = t.dashboard?.fixBtn || "Corriger";
                                                    return `${baseLabel} (${time})`;
                                                })()}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABSENCES BANNER (Daily) */}
                {absences.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-3">
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-bold text-orange-800 text-sm mb-1">
                                    {absences.length} {absences.length > 1 ? (t.dashboard?.absencesTitle || "Employés Absents") : "Employé Absent"}
                                </h3>
                                <p className="text-xs text-orange-600 mb-3">{t.dashboard?.absencesDesc || "La journée a commencé. Ces employés n'ont pas encore pointé."}</p>

                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                    {absences.map((emp, idx) => (
                                        <div key={emp.id} className="flex items-center justify-between bg-white p-2 rounded border border-orange-100 shadow-sm">
                                            <div className="text-sm flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                </div>
                                                <span className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</span>
                                                <span className="text-xs text-slate-400">{emp.job_title} • Attendu à {(emp as any).expectedStart}</span>
                                            </div>
                                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                                                {t.dashboard?.absentTag || "Absent"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div >
                        </div >
                    </div >
                )
                }
            </div >

            {/* 0. STATS WIDGET */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" >
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{stats.totalEmployees}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.dashboard?.totalEmployees || "Total Employees"}</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{stats.currentlyOnSite}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.dashboard?.onSite || "Currently On Site"}</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{stats.activeToday}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.dashboard?.activeToday || "Active Today"}</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                        <CloudOff size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{stats.offlineSyncs}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{t.dashboard?.offlineSyncs || "Offline Syncs"}</div>
                    </div>
                </div>
            </div >

            {/* 1.5 VIEW TOGGLE */}
            <div className="flex justify-end mb-4" >
                <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                    <button
                        onClick={() => setView('logs')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'logs' ? 'bg-white text-[#0F4C5C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.dashboard?.view?.logs || "Logs"}
                    </button>
                    <button
                        onClick={() => setView('timesheets')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'timesheets' ? 'bg-white text-[#0F4C5C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.dashboard?.view?.timesheets || "Timesheets"}
                    </button>
                    <button
                        onClick={() => setView('reports')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'reports' ? 'bg-white text-[#0F4C5C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {t.dashboard?.view?.reports || "Reports"}
                    </button>
                </div>
            </div >

            {/* 2. FILTERS */}
            <div className="flex flex-wrap gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm" >
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200 w-full sm:w-auto">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t.dashboard?.filters?.searchPlaceholder || "Search employee..."}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none w-full"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200 cursor-pointer hover:border-[#0F4C5C]">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                    >
                        <option value="today">{t.dashboard?.filters?.date?.today || "Today"}</option>
                        <option value="yesterday">{t.dashboard?.filters?.date?.yesterday || "Yesterday"}</option>
                        <option value="week">{t.dashboard?.filters?.date?.week || "This Week"}</option>
                        <option value="last_week">{t.dashboard?.filters?.date?.lastWeek || "Last Week"}</option>
                        <option value="month">{t.dashboard?.filters?.date?.month || "This Month"}</option>
                        <option value="custom">{t.dashboard?.filters?.date?.custom || "Custom Range"}</option>
                    </select>
                </div>

                {
                    dateFilter === 'custom' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="bg-slate-50 px-3 py-2 rounded border border-slate-200 text-sm outline-none focus:border-[#0F4C5C]"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="bg-slate-50 px-3 py-2 rounded border border-slate-200 text-sm outline-none focus:border-[#0F4C5C]"
                            />
                        </div>
                    )
                }

                <select
                    value={filterSite}
                    onChange={e => setFilterSite(e.target.value)}
                    className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded border border-slate-200 cursor-pointer hover:border-[#0F4C5C] text-sm font-medium text-slate-700 outline-none"
                >
                    <option value="all">{t.dashboard?.filters?.allSites || "All sites"}</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div >

            {/* 3. LOGS TABLE OR TIMESHEETS */}
            {
                view === 'timesheets' ? (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">{t.dashboard?.timesheet?.date || "Date"}</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">{t.dashboard?.timesheet?.employee || "Employee"}</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">{t.dashboard?.timesheet?.firstIn || "Start"}</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">{t.dashboard?.timesheet?.lastOut || "End"}</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">{t.dashboard?.timesheet?.total || "Total Worked"}</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">{t.dashboard?.timesheet?.overtime || "Overtime"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {timesheetData.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No active timesheets for this period.</td></tr>
                                ) : timesheetData.map(item => (
                                    <tr key={item.key} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{item.date.toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{item.employeeName}</div>
                                            <div className="text-xs text-slate-500">{item.jobTitle}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 font-mono text-xs">{item.firstIn?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '-'}</td>
                                        <td className="p-4 text-slate-600 font-mono text-xs">{item.lastOut?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '-'}</td>
                                        <td className="p-4 text-right">
                                            <div className="font-bold text-slate-900 font-mono">{item.durationStr}</div>
                                            {item.breakDeduction > 0 && (
                                                <div className="text-xs text-amber-600 font-medium">(-{item.breakDeduction}m pause)</div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {item.overtimeMinutes > 0 ? (
                                                <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">
                                                    {item.overtimeStr}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : view === 'reports' ? (
                    <div className="space-y-6">
                        {/* SUMMARY CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* TOTAL HOURS */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium">{t.dashboard?.report?.totalHours || "Total Heures"}</div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        {(() => {
                                            const totalM = Math.round(reportData.reduce((acc, curr) => acc + curr.totalMin, 0));
                                            const h = Math.floor(totalM / 60);
                                            const m = Math.floor(totalM % 60);
                                            return `${h}h${m.toString().padStart(2, '0')}`;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* TOTAL OVERTIME */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium">{t.dashboard?.report?.totalOvertime || "Heures Sup."}</div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        {(() => {
                                            const totalM = Math.round(reportData.reduce((acc, curr) => acc + curr.overtimeMin, 0));
                                            const h = Math.floor(totalM / 60);
                                            const m = Math.floor(totalM % 60);
                                            return `${h}h${m.toString().padStart(2, '0')}`;
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* ACTIVE EMPLOYEES */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium">Effectif Actif</div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        {reportData.length}
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F8FAFC] border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard?.report?.employee || "Employee"}</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dashboard?.report?.daysWorked || "Days Worked"}</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t.dashboard?.report?.totalHours || "Total Hours"}</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t.dashboard?.report?.totalOvertime || "Overtime"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reportData.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-500 italic">No data found for this period.</td></tr>
                                    ) : reportData.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {item.avatar_url ? (
                                                        <img src={item.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
                                                            {item.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                                                        <div className="text-xs text-slate-500">{item.job}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-700 font-medium text-sm">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold text-xs">{item.days} jours</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="font-bold text-slate-900 font-mono text-base">{item.totalStr}</div>
                                            </td>
                                            <td className="p-4 text-right">
                                                {item.overtimeMin > 0 ? (
                                                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold mono">
                                                        {item.overtimeStr}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 font-mono text-sm">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm" >
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Employee</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Movement</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Photo Proof</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Source</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">No logs found.</td></tr>
                                ) : filteredLogs.map((log) => {
                                    // Only calculate offline sync if it is NOT a manual entry
                                    const isOfflineSync = !log.is_manual_entry && (Math.abs(new Date(log.created_at).getTime() - new Date(log.timestamp).getTime()) / 60000 > 5);
                                    const logDate = new Date(log.timestamp);

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors group">

                                            {/* EMPLOYEE */}
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900">
                                                    {log.employee ? `${log.employee.first_name} ${log.employee.last_name}` : "Unknown"}
                                                </div>
                                                <div className="text-xs text-slate-500 uppercase">
                                                    {log.employee?.job_title || "No Title"}
                                                </div>
                                            </td>

                                            {/* TYPE (IN/OUT) */}
                                            <td className="p-4">
                                                {log.type === 'IN' ? (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                                                        <ArrowRightCircle className="h-3 w-3" /> CLOCK IN
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                                                        <ArrowLeftCircle className="h-3 w-3" /> CLOCK OUT
                                                    </span>
                                                )}
                                            </td>

                                            {/* PHOTO (Zoom on hover) */}
                                            <td className="p-4">
                                                {(() => {
                                                    const displayUrl = log.photo?.startsWith('http') ? log.photo : secureUrlMap[log.id];
                                                    if (!displayUrl) return <span className="text-xs text-slate-400 italic">No Photo</span>;

                                                    return (
                                                        <div className="relative group/photo h-10 w-10">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={displayUrl}
                                                                alt="Proof"
                                                                className="h-10 w-10 rounded object-cover border border-slate-200 cursor-zoom-in"
                                                            />
                                                            {/* Tooltip Zoom Image (On hover) */}
                                                            <div className="absolute left-12 top-[-50px] hidden group-hover/photo:block z-50">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={displayUrl}
                                                                    alt="Zoom"
                                                                    className="h-32 w-32 rounded-lg border-2 border-white shadow-xl object-cover"
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>

                                            {/* TIME & STATUS */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <div className="font-mono font-bold text-slate-800 text-base">
                                                            {logDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {logDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </div>
                                                    </div>

                                                    {/* LATE INDICATOR */}
                                                    {(() => {
                                                        if (log.type !== 'IN') return null;
                                                        // Default rules if settings not loaded yet
                                                        // Ideally we use orgSettings.planning.start_time, but per analysis it might be implicit
                                                        // Let's assume 08:00 AM start if not present
                                                        const startStr = orgSettings?.planning?.start_time || "08:00";
                                                        const tolerance = orgSettings?.attendance?.tolerance_minutes || 5;

                                                        const [startH, startM] = startStr.split(':').map(Number);
                                                        const logH = logDate.getHours();
                                                        const logM = logDate.getMinutes();

                                                        const startMinutes = startH * 60 + startM;
                                                        const logMinutes = logH * 60 + logM;

                                                        if (logMinutes > startMinutes + tolerance) {
                                                            const diff = logMinutes - startMinutes;
                                                            return (
                                                                <div className="relative group/late">
                                                                    <Clock className="h-4 w-4 text-red-500 cursor-help" />
                                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover/late:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                                        Late arrival (+{diff} min)
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            </td>

                                            {/* SOURCE & SYNC */}
                                            <td className="p-4">
                                                <div className="text-sm text-slate-600">{log.site?.name || "N/A"}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                                    {log.kiosk?.name || "Manual"}

                                                    {/* Offline Indicator */}
                                                    {isOfflineSync && (
                                                        <div className="group/offline relative">
                                                            <CloudOff className="h-3 w-3 text-amber-500 cursor-help" />
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/offline:block bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                                                Data synchronized later (Offline)
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Correction/Manual Reason Indicator */}
                                                    {log.correction_reason && (
                                                        <div className="group/reason relative">
                                                            <AlertCircle className="h-3 w-3 text-blue-500 cursor-help" />
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/reason:block bg-black text-white text-[10px] px-2 py-1 rounded w-max max-w-[200px] z-10 text-center">
                                                                Reason: {log.correction_reason}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleCorrect(log)}
                                                    className="text-sm text-slate-400 hover:text-[#0F4C5C] font-medium underline"
                                                >
                                                    Correct
                                                </button>
                                            </td>

                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            }

            {/* MANUAL ENTRY MODAL */}
            {
                isManualEntryModalOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            {/* HEADER */}
                            <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <Plus className="h-5 w-5 text-[#FFC107]" strokeWidth={3} />
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        {editingId ? "Correction Pointage" : (t.dashboard?.manualEntry || "Ajout Manuel")}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsManualEntryModalOpen(false)}
                                    className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* BODY */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <form id="manual-entry-form" onSubmit={handleManualEntrySave} className="space-y-5">

                                    {/* Employee (Searchable Dropdown) */}
                                    <div className="relative">
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.dashboard?.report?.employee || "Employé"}</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Search className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium placeholder:font-normal"
                                                placeholder="Rechercher un employé..."
                                                value={employeeSearch}
                                                onChange={e => {
                                                    setEmployeeSearch(e.target.value);
                                                    setIsEmployeeDropdownOpen(true);
                                                    // Clear selection if user types (must select from list)
                                                    if (manualForm.employee_id) setManualForm({ ...manualForm, employee_id: "" });
                                                }}
                                                onFocus={() => setIsEmployeeDropdownOpen(true)}
                                                // Handle blur with delay to allow click on item
                                                onBlur={() => setTimeout(() => setIsEmployeeDropdownOpen(false), 200)}
                                                required={!manualForm.employee_id} // Required if no ID selected
                                            />
                                            {/* Dropdown Icon */}
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <ArrowRightCircle className="h-4 w-4 text-slate-300 rotate-90" />
                                            </div>
                                        </div>

                                        {/* DROPDOWN LIST */}
                                        {isEmployeeDropdownOpen && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                                {employees
                                                    .filter(e => {
                                                        const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
                                                        return fullName.includes(employeeSearch.toLowerCase());
                                                    })
                                                    .length === 0 ? (
                                                    <div className="p-3 text-sm text-slate-500 text-center italic">Aucun employé trouvé.</div>
                                                ) : (
                                                    employees
                                                        .filter(e => {
                                                            const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
                                                            return fullName.includes(employeeSearch.toLowerCase());
                                                        })
                                                        .map(e => (
                                                            <div
                                                                key={e.id}
                                                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                                                                onMouseDown={(ev) => {
                                                                    ev.preventDefault(); // Prevent input blur
                                                                    setManualForm({ ...manualForm, employee_id: e.id });
                                                                    setEmployeeSearch(`${e.first_name} ${e.last_name}`);
                                                                    setIsEmployeeDropdownOpen(false);
                                                                }}
                                                            >
                                                                <div className="h-8 w-8 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center font-bold text-xs">
                                                                    {e.first_name.charAt(0)}{e.last_name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-800 text-sm">{e.first_name} {e.last_name}</div>
                                                                    <div className="text-xs text-slate-500">{e.job_title || "Employé"}</div>
                                                                </div>
                                                                {manualForm.employee_id === e.id && (
                                                                    <CheckCircle className="h-4 w-4 text-[#0F4C5C] ml-auto" />
                                                                )}
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Row: Type & Site */}
                                    <div className="grid grid-cols-2 gap-5">
                                        {/* Type Toggle */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 mb-1.5">Type</label>
                                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={() => setManualForm(prev => ({ ...prev, type: 'IN' }))}
                                                    className={`flex-1 py-2 rounded-md text-xs font-extrabold tracking-wide uppercase transition-all ${manualForm.type === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Entrée
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setManualForm(prev => ({ ...prev, type: 'OUT' }))}
                                                    className={`flex-1 py-2 rounded-md text-xs font-extrabold tracking-wide uppercase transition-all ${manualForm.type === 'OUT' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    Sortie
                                                </button>
                                            </div>
                                        </div>

                                        {/* Site Select */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 mb-1.5">Site</label>
                                            <select
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium text-sm"
                                                value={manualForm.site_id}
                                                onChange={e => setManualForm({ ...manualForm, site_id: e.target.value })}
                                            >
                                                <option value="">Sélectionner...</option>
                                                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Row: Date & Time */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.dashboard?.timesheet?.date || "Date"}</label>
                                            <input
                                                type="date"
                                                required
                                                max={new Date().toISOString().split('T')[0]} // Restricted to today
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium text-sm"
                                                value={manualForm.date}
                                                onChange={e => setManualForm({ ...manualForm, date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-800 mb-1.5">Heure</label>
                                            <input
                                                type="time"
                                                required
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium text-sm text-center"
                                                value={manualForm.time}
                                                onChange={e => setManualForm({ ...manualForm, time: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">
                                            Motif de correction <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white text-sm resize-none min-h-[80px]"
                                            placeholder="Ex: Oubli de code, Terminal hors service..."
                                            value={manualForm.reason}
                                            onChange={e => setManualForm({ ...manualForm, reason: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-400 mt-1.5">Ce motif apparaîtra dans l'historique d'audit.</p>
                                    </div>

                                </form>
                            </div>

                            {/* FOOTER */}
                            <div className="p-6 pt-2 bg-white rounded-b-xl shrink-0">
                                <button
                                    type="submit"
                                    form="manual-entry-form"
                                    disabled={manualEntryStatus === 'saving'}
                                    className="w-full bg-[#FFC107] hover:bg-[#e0a800] text-[#0F4C5C] font-extrabold text-base py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {manualEntryStatus === 'saving' ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" /> Enregistrement...
                                        </>
                                    ) : (
                                        "Enregistrer le pointage"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* TOAST */}
            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-[100] ${toast.type === 'success' ? 'bg-[#0F4C5C] text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                    <span className="font-bold text-base">{toast.message}</span>
                </div>
            )}

        </div >
    );
}
