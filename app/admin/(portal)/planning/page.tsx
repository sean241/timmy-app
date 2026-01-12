"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter,
    Copy, Send, User, MapPin, Coffee, AlertTriangle, CheckCircle,
    MoreHorizontal, Plus, X, Loader2, Printer, Wand2, Sun, Moon, AlertOctagon, Trash2, RefreshCw, Search, ChevronDown, Mail, MessageCircle, ArrowRight, CheckSquare, Square, MousePointerClick
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useLanguage } from '@/app/context/LanguageContext';
import Toast from "@/components/Toast";


// Native Helper for Date
const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const addDaysToDate = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDateShort = (date: Date, locale: string = 'fr') => {
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short', day: 'numeric' });
};

// --- Types ---
type DbShift = {
    id: string;
    organization_id: string;
    employee_id: string;
    site_id: string;
    start_time: string; // ISO
    end_time: string; // ISO
    status: 'DRAFT' | 'PUBLISHED';
    color_code?: string;
    notes?: string;
    break_minutes?: number;
    // Computed/Joined
    site?: { name: string };
};

// UI Shift (Derived from DbShift)
interface Shift {
    id: string;
    dayIndex: number; // 0=Mon
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    site: string;
    siteId: string;
    siteColor: string;
    status: 'draft' | 'published';
    type: 'work'; // We focus on work for now
    breakDuration?: string;
    note?: string;
    hasConflict?: boolean;
    conflictReason?: string; // e.g. "Overlap" or "Rest Warning"
    dbRecord: DbShift; // Keep reference
}

type ShiftTemplate = {
    id: string;
    label: string;
    startTime: string;
    endTime: string;
    color: string;
    breakMinutes: number;
};

const DEFAULT_TEMPLATES: ShiftTemplate[] = [
    { id: 't1', label: 'Ouverture', startTime: '07:00', endTime: '15:00', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', breakMinutes: 45 },
    { id: 't2', label: 'Journée Standard', startTime: '09:00', endTime: '17:00', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', breakMinutes: 60 },
    { id: 't3', label: 'Fermeture', startTime: '15:00', endTime: '23:00', color: 'bg-orange-100 text-orange-800 border-orange-200', breakMinutes: 45 },
];

interface Employee {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    weeklyHours: number;
    maxHours: number; // Default 48
    shifts: Shift[];
    job_title?: string;
}

interface Site {
    id: string;
    name: string;
    color?: string; // We can assign colors dynamically
}

// Site Colors Palette (Pastel) - We can keep this for UI mapping
const PASTEL_COLORS = [
    'bg-blue-100 border-blue-200 text-blue-800',
    'bg-orange-100 border-orange-200 text-orange-800',
    'bg-purple-100 border-purple-200 text-purple-800',
    'bg-emerald-100 border-emerald-200 text-emerald-800',
    'bg-pink-100 border-pink-200 text-pink-800',
    'bg-cyan-100 border-cyan-200 text-cyan-800',
];

export default function PlanningPage() {
    // --- Context & State ---
    const { t, language } = useLanguage();
    const searchParams = useSearchParams();
    const initialSiteId = searchParams.get('siteId') || "";

    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    // Data State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [unassignedShifts, setUnassignedShifts] = useState<Shift[]>([]); // Derived or fetched? Usually DB shifts have emp_id or null.
    // If DB requires emp_id, maybe we have a "Unassigned" placeholder employee or logic?
    // Schema says employee_id is NOT NULL. So we CANNOT have unassigned shifts in DB unless we create a "Unassigned" dummy employee.
    // OR we change schema. For now, let's assume we filter by "Unassigned" dummy if it exists, or empty.
    // Wait, let's check schema: employee_id uuid references public.employees(id) not null.
    // So shift MUST be assigned. I will disable "Unassigned" row for now or use a "Unassigned" virtual employee in my UI logic if I find one.

    // Actually, user wants "Bourse aux shifts". I might need to create a "Unassigned" employee in DB with name "Unassigned".
    // For now I will skip unassigned row integration with DB to avoid complexity, or just handle it as a local staging area.

    const [dbShifts, setDbShifts] = useState<DbShift[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [defaultBreakMinutes, setDefaultBreakMinutes] = useState(60);
    const [weeklyTarget, setWeeklyTarget] = useState(35);
    const [filterSiteId, setFilterSiteId] = useState(initialSiteId);
    const [filterSearch, setFilterSearch] = useState("");
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [publishChannels, setPublishChannels] = useState({ email: true, whatsapp: true });

    // Templates State
    const [templates, setTemplates] = useState<ShiftTemplate[]>(DEFAULT_TEMPLATES);

    // UI State
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishStatus, setPublishStatus] = useState<"idle" | "sending" | "success">("idle");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [copyTargetWeeks, setCopyTargetWeeks] = useState<string[]>([]); // Array of ISO start dates strings
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success'>('idle');

    const [newShiftTarget, setNewShiftTarget] = useState<{ dayIndex: number, employeeId: string | null } | null>(null);
    const [newShiftData, setNewShiftData] = useState({ startTime: '08:00', endTime: '17:00', siteId: '', note: '', breakMinutes: 60 });
    const [editingShiftId, setEditingShiftId] = useState<string | null>(null);

    // Drag & Drop
    const [draggedShift, setDraggedShift] = useState<{ shift: Shift, sourceEmployeeId: string | null } | null>(null);
    const [draggedTemplate, setDraggedTemplate] = useState<ShiftTemplate | null>(null);

    const [unassignedEmployeeId, setUnassignedEmployeeId] = useState<string | null>(null);

    // --- Effects ---
    useEffect(() => {
        setMounted(true);
        fetchOrgAndData();
    }, [currentWeekStart]); // Refetch when week changes

    // --- Data Fetching ---
    const fetchOrgAndData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
        if (profile?.organization_id) {
            setOrganizationId(profile.organization_id);
            fetchData(profile.organization_id);
        }
    };

    const fetchData = async (orgId: string) => {
        // 0. Fetch Settings FIRST to get defaults
        let targetHours = 35;
        let breakMins = 60;

        const { data: orgData } = await supabase.from('organizations').select('settings').eq('id', orgId).single();
        if (orgData?.settings) {
            const settings = orgData.settings as any;
            targetHours = settings?.attendance?.overtime?.weekly_threshold || 35;
            breakMins = settings?.attendance?.auto_break?.duration_minutes ?? 60;

            // Generate Dynamic Templates based on Settings
            const startT = settings.planning?.start_time || '08:00';
            const endT = settings.planning?.end_time || '17:00';

            // Safe parsing for mid-day split
            // Default split: Morning ends 13:00, Afternoon starts 14:00. 
            // If custom times are weird, we keep defaults.

            setTemplates([
                {
                    id: 'std',
                    label: 'Journée Standard',
                    startTime: startT,
                    endTime: endT,
                    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    breakMinutes: breakMins
                },
                {
                    id: 'morning',
                    label: 'Matin',
                    startTime: startT,
                    endTime: '13:00',
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    breakMinutes: 0
                },
                {
                    id: 'afternoon',
                    label: 'Après-midi',
                    startTime: '14:00',
                    endTime: endT,
                    color: 'bg-orange-50 text-orange-700 border-orange-200',
                    breakMinutes: 0
                },
                // Keep Night/Custom ones from default if needed, or simple extras
                { id: 'night', label: 'Nuit', startTime: '22:00', endTime: '06:00', color: 'bg-purple-100 text-purple-800 border-purple-200', breakMinutes: 45 },
            ]);
        }
        setWeeklyTarget(targetHours);
        setDefaultBreakMinutes(breakMins);
        setNewShiftData(prev => ({ ...prev, breakMinutes: breakMins }));

        // 1. Fetch Employees
        const { data: empData } = await supabase.from('employees').select('*').eq('organization_id', orgId).eq('is_active', true).order('first_name');

        // 1.5 Handle Unassigned Placeholder
        let placeholderId = null;
        let realEmployees = empData || [];

        if (empData) {
            // Robust search for any existing placeholder (by email or name) to prevent duplicates
            const placeholders = empData.filter(e =>
                e.email === `unassigned_${orgId}@timmy.app` ||
                (`${e.first_name} ${e.last_name}`.toLowerCase().includes('pourvoir'))
            );

            if (placeholders.length > 0) {
                // Use the first one found as the official placeholder for the "Unassigned" row
                placeholderId = placeholders[0].id;

                // Hide ALL identified placeholders from the standard employee list
                const idsToHide = placeholders.map(p => p.id);
                realEmployees = empData.filter(e => !idsToHide.includes(e.id));
            } else {
                // Auto-create placeholder if absolutely none exist
                // Providing a dummy PIN '0000' as it is a required field
                const { data: newP, error } = await supabase.from('employees').insert({
                    organization_id: orgId,
                    first_name: 'Postes',
                    last_name: 'À Pourvoir',
                    email: `unassigned_${orgId}@timmy.app`,
                    job_title: 'Bourse aux shifts',
                    pin_code: '0000',
                    is_active: true
                }).select().single();

                if (newP) {
                    placeholderId = newP.id;
                } else if (error) {
                    console.error("Failed to create placeholder employee:", error);
                }
            }
        }
        setUnassignedEmployeeId(placeholderId);

        // 2. Fetch Sites
        const { data: siteData } = await supabase.from('sites').select('id, name').eq('organization_id', orgId);
        setSites(siteData || []);

        // 3. Fetch Shifts for Range
        const startIso = currentWeekStart.toISOString();
        const endWeek = addDaysToDate(currentWeekStart, 7);
        const endIso = endWeek.toISOString();

        const { data: shiftData } = await supabase.from('shifts')
            .select(`*, site:sites(name)`)
            .eq('organization_id', orgId)
            .gte('start_time', startIso)
            .lt('start_time', endIso);

        setDbShifts(shiftData || []);

        // 4. Map DB Shifts to UI Employees
        if (realEmployees && shiftData) updateEmployeeState(realEmployees, shiftData, siteData || [], targetHours);
        else if (realEmployees) updateEmployeeState(realEmployees, [], siteData || [], targetHours);

        // 4.5 Set Unassigned Shifts separately
        if (placeholderId && shiftData) {
            const openShifts = shiftData.filter((s: any) => s.employee_id === placeholderId).map((s: any) => {
                const d = new Date(s.start_time);
                const diffTime = Math.abs(d.getTime() - currentWeekStart.getTime());
                const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                return {
                    id: s.id,
                    dayIndex: dayIndex,
                    startTime: new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    endTime: new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    site: s.site?.name || '?',
                    siteId: s.site_id,
                    siteColor: 'bg-gray-100 text-gray-800 border-gray-300',
                    status: s.status,
                    type: 'work',
                    note: s.notes,
                    breakDuration: s.break_minutes ? `${s.break_minutes}m` : undefined,
                    dbRecord: s
                } as Shift;
            });
            setUnassignedShifts(openShifts);
        } else {
            setUnassignedShifts([]);
        }

        setIsLoading(false);
    };

    // --- Helpers ---
    const updateEmployeeState = (emps: any[], shifts: any[], sites: any[], targetHours: number) => {
        // Map Shifts to UI format
        const uiEmployees = emps.map(emp => {
            // Pre-filter shifts for this employee
            let empRawShifts = shifts.filter(s => s.employee_id === emp.id);
            // Sort by start time for consistent rest calculation
            empRawShifts.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

            const empShifts = empRawShifts.map((s, index) => {
                const d = new Date(s.start_time);

                // Calculate day index relative to week start
                const diffTime = Math.abs(d.getTime() - currentWeekStart.getTime());
                const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // Colors
                const siteIndex = sites.findIndex(site => site.id === s.site_id);
                const color = PASTEL_COLORS[siteIndex % PASTEL_COLORS.length] || PASTEL_COLORS[0];

                // --- CONFLICT & RULES CHECK ---
                const sStart = d.getTime();
                const sEnd = new Date(s.end_time).getTime();
                let conflictReason: string | undefined = undefined;
                let hasConflict = false;

                // 1. Overlap Check
                const isOverlapping = empRawShifts.some(other => {
                    if (other.id === s.id) return false;
                    const oStart = new Date(other.start_time).getTime();
                    const oEnd = new Date(other.end_time).getTime();
                    return (sStart < oEnd && sEnd > oStart);
                });

                if (isOverlapping) {
                    hasConflict = true;
                    conflictReason = "Chevauchement d'horaires";
                }

                // 2. Advanced Rest & Amplitude Rule
                if (!hasConflict && index > 0) {
                    const prevShift = empRawShifts[index - 1];
                    const prevStart = new Date(prevShift.start_time);
                    const prevEnd = new Date(prevShift.end_time);
                    const currentStart = new Date(s.start_time);
                    const currentEnd = new Date(s.end_time);

                    const restMs = currentStart.getTime() - prevEnd.getTime();
                    const restHours = restMs / (1000 * 60 * 60);

                    // Only check if rest is actually short (< 11h)
                    if (restHours < 11 && restHours >= 0) {
                        const isSameDayBreak = prevEnd.toDateString() === currentStart.toDateString();
                        const isPrevNightShift = prevStart.toDateString() !== prevEnd.toDateString();
                        const dailyAmplitude = (currentEnd.getTime() - prevStart.getTime()) / (1000 * 60 * 60);

                        let violation = false;

                        if (!isSameDayBreak) {
                            // Break over night is too short
                            violation = true;
                        } else if (isPrevNightShift) {
                            // If previous shift was overnight, we CANNOT restart immediately same morning
                            violation = true;
                        } else if (dailyAmplitude > 13) {
                            // Even if same day, max amplitude (start to end of both shifts) > 13h
                            violation = true;
                        }

                        if (violation) {
                            hasConflict = true;
                            conflictReason = `Repos insuffisant: ${restHours.toFixed(1)}h (min 11h) ou Amplitude > 13h`;
                        }
                    }
                }

                return {
                    id: s.id,
                    dayIndex: dayIndex,
                    startTime: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    endTime: new Date(s.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    site: s.site?.name || "Unknown",
                    siteId: s.site_id,
                    siteColor: color,
                    status: s.status.toLowerCase(),
                    type: 'work',
                    hasConflict: hasConflict,
                    conflictReason: conflictReason,
                    dbRecord: s
                } as Shift;
            });

            return {
                id: emp.id,
                name: `${emp.first_name} ${emp.last_name}`,
                role: emp.job_title || "Employee",
                avatar: emp.avatar_url,
                weeklyHours: calculateHours(empShifts), // Real calculation
                maxHours: targetHours, // Dynamic Target
                shifts: empShifts
            } as Employee;
        });

        setEmployees(uiEmployees);
    };

    // --- Actions ---

    const handleSaveNewShift = async () => {
        if (!organizationId || !newShiftTarget || !newShiftData.siteId) return;

        const targetDate = addDaysToDate(currentWeekStart, newShiftTarget.dayIndex);
        const [sh, sm] = newShiftData.startTime.split(':');
        targetDate.setHours(parseInt(sh), parseInt(sm));
        const startIso = targetDate.toISOString();

        const [eh, em] = newShiftData.endTime.split(':');
        const endDate = new Date(targetDate);
        endDate.setHours(parseInt(eh), parseInt(em));
        // Handle overnight? If end < start, add 1 day.
        if (endDate < targetDate) endDate.setDate(endDate.getDate() + 1);
        const endIso = endDate.toISOString();

        const payload = {
            organization_id: organizationId,
            employee_id: newShiftTarget.employeeId!, // Must handle null
            site_id: newShiftData.siteId,
            start_time: startIso,
            end_time: endIso,
            notes: newShiftData.note,
            break_minutes: newShiftData.breakMinutes
        };

        let error;
        if (editingShiftId) {
            const { error: err } = await supabase.from('shifts').update({
                site_id: newShiftData.siteId,
                start_time: startIso,
                end_time: endIso,
                notes: newShiftData.note,
                break_minutes: newShiftData.breakMinutes
            }).eq('id', editingShiftId);
            error = err;
        } else {
            const { error: err } = await supabase.from('shifts').insert({ ...payload, status: 'DRAFT' });
            error = err;
        }

        if (error) {
            setToast({ message: t.planning.toast.addError, type: "error" });
            console.error(error);
        } else {
            setToast({ message: editingShiftId ? t.planning.toast.updateSuccess : t.planning.toast.addSuccess, type: "success" });
            setIsAddModalOpen(false);
            setEditingShiftId(null);
            fetchData(organizationId);
        }
    };

    const handleDeleteShift = async () => {
        if (!editingShiftId) return;
        if (!confirm(t.planning.modal.confirmDelete)) return;

        const { error } = await supabase.from('shifts').delete().eq('id', editingShiftId);

        if (error) {
            setToast({ message: t.planning.toast.deleteError, type: "error" });
        } else {
            setToast({ message: t.planning.toast.deleteSuccess, type: "success" });
            setIsAddModalOpen(false);
            setEditingShiftId(null);
            fetchData(organizationId!);
        }
    };

    // Drag & Drop
    const handleDragStart = (e: React.DragEvent, shift: Shift, sourceEmployeeId: string | null) => {
        setDraggedShift({ shift, sourceEmployeeId });
        // e.dataTransfer.setData("text/plain", shift.id); // Firefox might need this
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = draggedTemplate ? "copy" : "move";
    };

    const handleDrop = async (e: React.DragEvent, targetDayIndex: number, targetEmployeeId: string | null) => {
        e.preventDefault();
        console.log("DROP Triggered", { targetDayIndex, targetEmployeeId, draggedTemplate });

        // 1. TEMPLATE DROP (CREATE)
        if (draggedTemplate && organizationId) {
            // Target can be an employee OR the unassigned row (targetEmployeeId can be null if we defined logic for it, but here we expect 'unassignedEmployeeId')
            // If dropping on "Unassigned Row", targetEmployeeId should be unassignedEmployeeId
            const finalEmployeeId = targetEmployeeId || unassignedEmployeeId;
            if (!finalEmployeeId) return;

            const targetDate = addDaysToDate(currentWeekStart, targetDayIndex);

            // Set Start Time
            const [sh, sm] = draggedTemplate.startTime.split(':');
            const startDate = new Date(targetDate);
            startDate.setHours(parseInt(sh), parseInt(sm));

            // Set End Time
            const [eh, em] = draggedTemplate.endTime.split(':');
            const endDate = new Date(targetDate);
            endDate.setHours(parseInt(eh), parseInt(em));

            // Handle Overnight (if end hour < start hour)
            if (parseInt(eh) < parseInt(sh)) {
                endDate.setDate(endDate.getDate() + 1);
            }

            const payload = {
                organization_id: organizationId,
                employee_id: finalEmployeeId,
                site_id: sites[0]?.id || (sites.length > 0 ? sites[0].id : null), // Fallback or strict?
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                status: 'DRAFT',
                break_minutes: draggedTemplate.breakMinutes,
                notes: `Model: ${draggedTemplate.label}`
            };

            if (!payload.site_id) {
                setToast({ message: t.planning.toast.noSite, type: "error" });
                setDraggedTemplate(null);
                return;
            }

            const { error } = await supabase.from('shifts').insert(payload);
            if (error) {
                console.error("Template drop error", error);
                setToast({ message: t.planning.toast.addError, type: "error" });
            } else {
                setToast({ message: t.planning.toast.templateApplied, type: "success" });
                fetchData(organizationId);
            }
            setDraggedTemplate(null);
            return;
        }

        // 2. SHIFT DROP (MOVE)
        // Adjust check: we can drop if we have targetEmployeeId OR (targetEmployeeId is null/special for unassigned)
        if (!draggedShift || !organizationId) return;

        const finalTargetEmpId = targetEmployeeId || unassignedEmployeeId;
        if (!finalTargetEmpId) return;

        const { shift, sourceEmployeeId } = draggedShift;

        const orgId = organizationId;

        // Calculate NEW Start/End times
        const dayDiff = targetDayIndex - shift.dayIndex;
        // Db Record iso strings
        const oldStart = new Date(shift.dbRecord.start_time);
        const oldEnd = new Date(shift.dbRecord.end_time);

        const newStart = addDaysToDate(oldStart, dayDiff);
        const newEnd = addDaysToDate(oldEnd, dayDiff);

        // Optimistic Update (Optional) or just wait for DB
        // Let's do DB update
        const { error } = await supabase.from('shifts').update({
            employee_id: finalTargetEmpId,
            start_time: newStart.toISOString(),
            end_time: newEnd.toISOString()
        }).eq('id', shift.id);

        if (error) {
            setToast({ message: t.planning.toast.moveError, type: "error" });
        } else {
            fetchData(orgId);
        }
        setDraggedShift(null);
    };

    // --- Render Helpers ---
    const calculateHours = (shifts: Shift[]) => {
        let totalMinutes = 0;
        shifts.forEach(s => {
            const d1 = new Date(s.dbRecord.start_time);
            const d2 = new Date(s.dbRecord.end_time);
            const diffMs = d2.getTime() - d1.getTime();

            let shiftMinutes = diffMs / (1000 * 60);

            // Deduct break time accurately
            // Check if break_minutes exists in dbRecord, otherwise fallback to 0
            const breakMinutes = s.dbRecord.break_minutes || 0;
            shiftMinutes = shiftMinutes - breakMinutes;

            totalMinutes += Math.max(0, shiftMinutes);
        });
        return Math.max(0, parseFloat((totalMinutes / 60).toFixed(1))); // Convert to Hours
    };

    // Days Array for Header
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = addDaysToDate(currentWeekStart, i);
        return formatDateShort(d, language);
    });


    // --- UI Actions ---
    const openAddModal = (dayIndex: number, employeeId: string | null) => {
        setEditingShiftId(null);
        setNewShiftTarget({ dayIndex, employeeId });
        setNewShiftData({ startTime: '08:00', endTime: '17:00', siteId: sites[0]?.id || '', note: '', breakMinutes: defaultBreakMinutes });
        setIsAddModalOpen(true);
    };

    const openEditModal = (shift: Shift, employeeId: string) => {
        setEditingShiftId(shift.id);
        setNewShiftTarget({ dayIndex: shift.dayIndex, employeeId });
        setNewShiftData({
            startTime: shift.startTime,
            endTime: shift.endTime,
            siteId: shift.siteId,
            note: shift.note || '',
            breakMinutes: shift.dbRecord.break_minutes || defaultBreakMinutes
        });
        setIsAddModalOpen(true);
    };

    const handlePublish = async () => {
        if (!organizationId) return;
        setPublishStatus("sending");

        // Update all DRAFT shifts in current view to PUBLISHED
        const startIso = currentWeekStart.toISOString();
        const endWeek = addDaysToDate(currentWeekStart, 7);
        const endIso = endWeek.toISOString();

        const { error } = await supabase.from('shifts')
            .update({ status: 'PUBLISHED' })
            .eq('organization_id', organizationId)
            .eq('status', 'DRAFT')
            .gte('start_time', startIso)
            .lt('start_time', endIso);

        if (error) {
            setToast({ message: t.planning.toast.publishError, type: "error" });
            setPublishStatus("idle");
        } else {
            setPublishStatus("success");
            setToast({ message: t.planning.toast.publishSuccess, type: "success" }); // Added toast
            setTimeout(() => {
                setPublishStatus("idle");
                setIsPublishModalOpen(false);
                fetchData(organizationId);
            }, 1000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleWeekChange = (offset: number) => {
        const newDate = addDaysToDate(currentWeekStart, offset * 7);
        setCurrentWeekStart(newDate);
    };

    const handleCopySchedule = async () => {
        if (!organizationId || copyTargetWeeks.length === 0 || dbShifts.length === 0) return;
        setCopyStatus("copying");

        const newShiftsBatch: any[] = [];

        // For each selected target week
        copyTargetWeeks.forEach(targetWeekIso => {
            const targetStart = new Date(targetWeekIso);
            // Time difference in milliseconds between Target Week Start and Current Week Start
            const timeDiff = targetStart.getTime() - currentWeekStart.getTime();

            // Clone each shift from current week
            // Actually we copy ALL shifts visible, usually draft or published, but new ones become DRAFT.
            // Let's allow copying Published ones too as templates.

            // Loop all dbShifts displayed (source)
            dbShifts.forEach(sourceShift => {
                const oldStart = new Date(sourceShift.start_time);
                const oldEnd = new Date(sourceShift.end_time);

                // Apply offset
                const newStart = new Date(oldStart.getTime() + timeDiff);
                const newEnd = new Date(oldEnd.getTime() + timeDiff);

                const payload: any = {
                    organization_id: organizationId,
                    employee_id: sourceShift.employee_id,
                    site_id: sourceShift.site_id,
                    start_time: newStart.toISOString(),
                    end_time: newEnd.toISOString(),
                    status: 'DRAFT'
                };

                // Only include optional fields if they exist to avoid 400 errors on schema mismatch
                if (sourceShift.notes) payload.notes = sourceShift.notes;
                if (sourceShift.break_minutes !== undefined && sourceShift.break_minutes !== null) {
                    payload.break_minutes = sourceShift.break_minutes;
                }

                newShiftsBatch.push(payload);
            });
        });

        const { error } = await supabase.from('shifts').insert(newShiftsBatch);

        if (error) {
            console.error("Copy failed", error);
            setToast({ message: t.planning.toast.copyError, type: "error" });
            setCopyStatus("idle");
        } else {
            setToast({ message: t.planning.toast.copySuccess.replace('{count}', newShiftsBatch.length.toString()), type: "success" });
            setCopyStatus("success");
            setTimeout(() => {
                setCopyStatus("idle");
                setIsCopyModalOpen(false);
                setCopyTargetWeeks([]);
                // If we copied TO the current view (unlikely logic but possible), refetch.
                // If not, we don't need to refetch immediately unless we want to, but good practice.
                fetchData(organizationId);
            }, 1000);
        }
    };

    const toggleCopyTargetWeek = (weekIso: string) => {
        if (copyTargetWeeks.includes(weekIso)) {
            setCopyTargetWeeks(copyTargetWeeks.filter(w => w !== weekIso));
        } else {
            setCopyTargetWeeks([...copyTargetWeeks, weekIso]);
        }
    };

    const handleQuickFill = async (employeeId: string) => {
        if (!organizationId || sites.length === 0) {
            setToast({ message: t.planning.toast.noSite, type: "error" });
            return;
        }

        const defaultSiteId = sites[0].id;
        const newShifts = [];

        // Check availability Mon-Fri (0 to 4)
        const emp = employees.find(e => e.id === employeeId);
        if (!emp) return;

        for (let i = 0; i < 5; i++) {
            const hasShiftOnDay = emp.shifts.some(s => s.dayIndex === i);
            if (!hasShiftOnDay) {
                const dayDate = addDaysToDate(currentWeekStart, i);

                // Set 08:00
                const start = new Date(dayDate);
                start.setHours(8, 0, 0, 0);

                // Set 17:00
                const end = new Date(dayDate);
                end.setHours(17, 0, 0, 0);

                // Adjust for timezone offset if necessary, but here we are working with local dates constructed from currentWeekStart which is already local-ish (00:00).
                // Actually toISOString() uses UTC. 
                // We need to be careful. constructLocalIsoString is not available here. 
                // Let's use the same logic as handleSaveNewShift if possible, or just standard Date because our dates are local-oriented.
                // Re-using the manual offset logic to ensure it stays at 08:00 local time.

                // Quick hack for ISO string preserving local time values as UTC (simple way used in previous steps if any, checking Add Shift logic)
                // In Add Shift: `const start = new Date(baseDate); start.setHours(sh, sm, 0, 0); ... start.toISOString()`
                // This sends UTC. If I am in UTC+1, 8:00 becomes 7:00Z. 
                // If the display converts back to local, it's fine. 

                newShifts.push({
                    organization_id: organizationId,
                    employee_id: employeeId,
                    site_id: defaultSiteId,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    status: 'DRAFT'
                });
            }
        }

        if (newShifts.length === 0) {
            setToast({ message: t.planning.toast.magicFillEmpty, type: "info" });
            return;
        }

        const { error } = await supabase.from('shifts').insert(newShifts);

        if (error) {
            console.error("Quick fill error:", error);
            setToast({ message: t.planning.toast.addError, type: "error" });
        } else {
            setToast({ message: t.planning.toast.magicFillSuccess.replace('{count}', newShifts.length.toString()), type: "success" });
            fetchData(organizationId);
        }
    };

    const draftCount = dbShifts.filter(s => s.status === 'DRAFT').length;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] print:h-auto print:block">
            <style type="text/css" media="print">
                {`
                    @page { size: landscape; margin: 5mm; }
                    body { -webkit-print-color-adjust: exact; }
                `}
            </style>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {/* --- A. CONTROL BAR (Hidden on Print) --- */}
            <div className="flex flex-col xl:flex-row justify-between gap-4 items-start xl:items-center mb-6 shrink-0 print:hidden">

                {/* Period Selector */}
                <div className="flex items-center gap-4 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <button onClick={() => handleWeekChange(-1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronLeft size={20} /></button>
                    <div className="flex items-center gap-2 px-2">
                        <CalendarIcon size={18} className="text-[#0F4C5C]" />
                        <span className="font-bold text-gray-900">
                            {currentWeekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} - {addDaysToDate(currentWeekStart, 6).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <button onClick={() => handleWeekChange(1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight size={20} /></button>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <button onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))} className="text-sm font-medium text-gray-600 hover:text-[#0F4C5C] px-2">{t.planning.today}</button>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        {/* Search Filter */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder={t.planning.filters.search}
                                value={filterSearch}
                                onChange={e => setFilterSearch(e.target.value)}
                                className="bg-white pl-9 pr-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] w-40 focus:w-60 transition-all placeholder:text-gray-400"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-[#0F4C5C] transition-colors" />
                        </div>

                        {/* Site Filter */}
                        <div className="relative">
                            <select
                                value={filterSiteId}
                                onChange={e => setFilterSiteId(e.target.value)}
                                className="appearance-none bg-white pl-9 pr-8 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] cursor-pointer hover:border-gray-300"
                            >
                                <option value="">{t.planning.filters.allSites}</option>
                                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Smart Actions */}
                    <button
                        onClick={() => setIsCopyModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm" title={t.planning.copyBtn}
                    >
                        <Copy size={16} />
                        <span className="hidden sm:inline">{t.planning.copyBtn}</span>
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
                        title={t.planning.printBtn}
                    >
                        <Printer size={16} />
                        <span className="hidden sm:inline">{t.planning.printBtn}</span>
                    </button>

                    <button
                        onClick={() => setIsPublishModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FFC107] text-[#0F4C5C] rounded-lg text-sm font-bold hover:bg-[#e6ad06] shadow-sm transition-colors"
                    >
                        <Send size={16} />
                        {t.planning.publishBtn}
                        {draftCount > 0 && (
                            <span className="bg-[#0F4C5C] text-[#FFC107] text-xs px-2 py-0.5 rounded-full ml-1 min-w-[20px] text-center">
                                {draftCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* --- PRINT HEADER (Visible only on Print) --- */}
            <div className="hidden print:flex justify-between items-center mb-8 border-b border-gray-900 pb-4">
                <div className="flex items-center gap-3">
                    {/* Logo Placeholder */}
                    <div className="w-12 h-12 bg-[#0F4C5C] rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t.planning.title}</h1>
                        <p className="text-gray-600">
                            {currentWeekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {addDaysToDate(currentWeekStart, 6).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                    <p>{t.planning.generatedOn} {mounted ? new Date().toLocaleDateString('en-US') : ''}</p>
                    <p>{t.common.copyright}</p>
                </div>
            </div>

            {/* --- TEMPLATES TOOLBAR --- */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm print:hidden">
                <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Wand2 size={14} />
                        {t.planning.templates}
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar flex-1">
                        {templates.map(tmpl => (
                            <div
                                key={tmpl.id}
                                draggable
                                onDragStart={(e) => {
                                    setDraggedTemplate(tmpl);
                                    e.dataTransfer.effectAllowed = "copy";
                                    // Set drag image or data if needed
                                }}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-grab active:cursor-grabbing border shadow-sm hover:shadow-md transition-all
                                    ${tmpl.color}
                                `}
                            >
                                {tmpl.label} ({tmpl.startTime}-{tmpl.endTime})
                            </div>
                        ))}
                    </div>
                    {/* HINT */}
                    <div className="text-[10px] text-gray-400 italic flex items-center gap-1 hidden sm:flex border-l border-gray-200 pl-4">
                        <MousePointerClick size={12} />
                        {t.planning.templatesHint}
                    </div>
                </div>
            </div>

            {/* --- B. GRID (SCROLLABLE) --- */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col print:border-none print:shadow-none print:overflow-visible">

                {/* Header Row (Days) */}
                <div className="flex border-b border-gray-200 bg-gray-50/50 print:bg-gray-100 print:border-gray-900">
                    <div className="w-64 shrink-0 p-4 font-bold text-gray-500 text-xs uppercase tracking-wider border-r border-gray-200 print:text-gray-900 print:border-gray-900 flex justify-between items-end">
                        <span>{t.planning.employees}</span>
                        <span className="text-[10px] normal-case font-normal text-gray-400">{t.planning.headerTotal} / {weeklyTarget}h</span>
                    </div>
                    <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200 print:divide-gray-900">
                        {weekDays.map((day, i) => {
                            const d = addDaysToDate(currentWeekStart, i);
                            const isToday = new Date().toDateString() === d.toDateString();
                            return (
                                <div key={i} className={`p-3 text-center text-sm font-medium flex flex-col items-center justify-center
                                    ${isToday ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : ''}
                                    ${!isToday && i >= 5 ? 'bg-gray-50 text-gray-500 print:bg-transparent print:text-gray-900' : ''}
                                    ${!isToday && i < 5 ? 'text-gray-900' : ''}
                                `}>
                                    {day}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 print:overflow-visible print:divide-gray-900">

                    {/* SKELETON LOADER */}
                    {isLoading && (
                        <div className="divide-y divide-gray-100">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex animate-pulse">
                                    <div className="w-64 shrink-0 p-4 border-r border-gray-100 flex items-center gap-3 bg-white">
                                        <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                            <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100">
                                        {Array.from({ length: 7 }).map((_, j) => (
                                            <div key={j} className="p-2 space-y-2">
                                                {j % 2 === 0 && <div className="h-16 bg-slate-50 rounded-md border border-slate-100"></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* 1. Unassigned Shifts (Bourse aux shifts) */}
                    {unassignedEmployeeId && (
                        <div className="flex bg-stripes-gray border-b border-gray-300 print:hidden min-h-[80px]">
                            {/* Header Column */}
                            <div className="w-64 shrink-0 p-4 border-r border-gray-300 flex items-center justify-between group bg-amber-50/50 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div>
                                    <div className="font-bold text-gray-600 text-sm flex items-center gap-2 uppercase tracking-tight">
                                        <AlertOctagon size={16} className="text-amber-500" />
                                        {t.planning.unassigned}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 font-medium">{unassignedShifts.length} shifts disponibles</div>
                                </div>
                                <button
                                    onClick={() => openAddModal(0, unassignedEmployeeId)} // Default to Monday
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg transition-all"
                                    title="Add Open Shift"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Days Grid */}
                            <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200">
                                {Array.from({ length: 7 }).map((_, dayIndex) => {
                                    // Shifts for this day
                                    const shifts = unassignedShifts.filter(s => s.dayIndex === dayIndex);

                                    return (
                                        <div
                                            key={dayIndex}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, dayIndex, unassignedEmployeeId)}
                                            onClick={() => openAddModal(dayIndex, unassignedEmployeeId)}
                                            className="p-1 min-h-[80px] hover:bg-amber-50/30 transition-colors relative cursor-pointer"
                                        >
                                            <div className="flex flex-wrap gap-1">
                                                {shifts.map(shift => (
                                                    <div key={shift.id} className="w-full">
                                                        <ShiftCard
                                                            shift={shift}
                                                            onDragStart={(e: any) => handleDragStart(e, shift, unassignedEmployeeId)}
                                                            onClick={() => openEditModal(shift, unassignedEmployeeId)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Hint for empty state */}
                                            {shifts.length === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100">
                                                    <span className="text-[10px] text-gray-300 italic">Drop here</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 2. Employee Rows */}
                    {
                        employees.filter(emp => {
                            if (filterSearch && !emp.name.toLowerCase().includes(filterSearch.toLowerCase())) return false;
                            if (filterSiteId && !emp.shifts.some(s => s.siteId === filterSiteId)) return false;
                            return true;
                        }).map((employee) => {
                            const currentWeeklyHours = calculateHours(employee.shifts);
                            const isOvertime = currentWeeklyHours > 40;
                            const isCriticalOvertime = currentWeeklyHours > 48;
                            const progressPercent = Math.min((currentWeeklyHours / employee.maxHours) * 100, 100);

                            // Gauge Color Logic
                            let gaugeColor = 'bg-green-500';
                            if (currentWeeklyHours > 40 && currentWeeklyHours <= 45) gaugeColor = 'bg-orange-400';
                            if (currentWeeklyHours > 45) gaugeColor = 'bg-red-500';

                            return (
                                <div key={employee.id} className="flex break-inside-avoid">
                                    {/* Resource Column */}
                                    <div className="w-64 shrink-0 p-4 border-r border-gray-100 flex flex-col justify-center gap-2 bg-white print:border-gray-900 sticky left-0 z-10 group-hover:bg-blue-50/10 transition-colors min-h-[100px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm relative">
                                                {employee.avatar ? (
                                                    <img src={employee.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-xs">{employee.name.charAt(0)}</span>
                                                )}
                                                {/* Quick Action Button overlay */}
                                                <button
                                                    onClick={() => handleQuickFill(employee.id)}
                                                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-200 text-gray-400 hover:text-[#0F4C5C] shadow-sm transform scale-75 hover:scale-100 transition-all print:hidden"
                                                    title={t.planning.tooltips.quickFill}
                                                >
                                                    <Wand2 size={12} />
                                                </button>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-gray-900 text-sm truncate">{employee.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{employee.role}</p>
                                            </div>
                                        </div>

                                        {/* Hours Counter */}
                                        <div className="mt-1 print:hidden">
                                            <div className="flex justify-between items-center text-xs mb-1">
                                                <span className={`font-bold transition-colors ${currentWeeklyHours > employee.maxHours ? 'text-red-600' :
                                                    currentWeeklyHours >= 35 ? 'text-amber-600' : 'text-emerald-600'
                                                    }`}>
                                                    {currentWeeklyHours}h
                                                </span>
                                                <span className="text-gray-400 text-[10px]">obj. {employee.maxHours}h</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${currentWeeklyHours > employee.maxHours ? 'bg-red-500' :
                                                        currentWeeklyHours >= 35 ? 'bg-amber-400' : 'bg-emerald-400'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (currentWeeklyHours / employee.maxHours) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        {/* Print Only */}
                                        <div className="hidden print:block text-xs font-bold text-gray-900 mt-1">
                                            Total: {currentWeeklyHours}h
                                        </div>
                                    </div>

                                    {/* Days Grid */}
                                    <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200 print:divide-gray-900">
                                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                                            const shifts = employee.shifts.filter(s => s.dayIndex === dayIndex);
                                            const hasConflict = shifts.length > 1;

                                            return (
                                                <div
                                                    key={dayIndex}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, dayIndex, employee.id)}
                                                    onClick={() => openAddModal(dayIndex, employee.id)}
                                                    className={`p-2 min-h-[100px] relative group hover:bg-gray-50 transition-colors ${hasConflict ? 'bg-red-50/50' : ''} cursor-pointer`}
                                                >
                                                    <div className="space-y-2">
                                                        {shifts.map(shift => (
                                                            <ShiftCard
                                                                key={shift.id}
                                                                shift={shift}
                                                                onDragStart={(e) => handleDragStart(e, shift, employee.id)}
                                                                onClick={() => openEditModal(shift, employee.id)}
                                                            />
                                                        ))}
                                                        <button
                                                            onClick={() => openAddModal(dayIndex, employee.id)}
                                                            className="w-full py-1 text-xs text-gray-300 hover:text-gray-500 hover:bg-gray-200 rounded border border-transparent hover:border-gray-300 border-dashed transition-all opacity-0 group-hover:opacity-100 print:hidden"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div >
            </div >

            < div className="hidden print:flex justify-between mt-8 pt-8 border-t border-gray-900 break-inside-avoid" >
                <div className="w-1/3">
                    <p className="font-bold text-sm mb-16">{t.planning.managerSig}</p>
                    <div className="border-b border-gray-900 w-full"></div>
                </div>
                <div className="w-1/3">
                    <p className="font-bold text-sm mb-16">{t.planning.siteManagerSig}</p>
                    <div className="border-b border-gray-900 w-full"></div>
                </div>
            </div >

            {/* --- MODALS --- */}

            {/* 1. Publish Modal */}
            {
                isPublishModalOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity print:hidden">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            {/* HEADER */}
                            <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <Send className="h-5 w-5 text-[#FFC107]" />
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        {t.planning.modal.publishTitle}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsPublishModalOpen(false)}
                                    className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            {/* BODY */}
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                        <Send size={32} className="text-amber-600 ml-1" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{t.planning.modal.confirmPublishTitle}</h4>
                                    <p className="text-gray-500">
                                        {t.planning.modal.confirmPublishDesc} <strong className="text-gray-900">{draftCount} {t.planning.modal.shiftsDraft}</strong> {t.planning.modal.currentlyDraft}
                                        {t.planning.modal.willNotify}
                                    </p>
                                </div>

                                {/* Channel Selection */}
                                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-[#0F4C5C] transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={publishChannels.email}
                                            onChange={(e) => setPublishChannels({ ...publishChannels, email: e.target.checked })}
                                            className="w-5 h-5 text-[#0F4C5C] rounded focus:ring-[#0F4C5C]"
                                        />
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-900 block">{t.planning.modal.channels.email}</span>
                                            <span className="text-xs text-gray-500">{t.planning.modal.channels.emailDesc}</span>
                                        </div>
                                        <Mail size={20} className="text-gray-400" />
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-[#0F4C5C] transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={publishChannels.whatsapp}
                                            onChange={(e) => setPublishChannels({ ...publishChannels, whatsapp: e.target.checked })}
                                            className="w-5 h-5 text-[#0F4C5C] rounded focus:ring-[#0F4C5C]"
                                        />
                                        <div className="flex-1">
                                            <span className="font-bold text-gray-900 block">{t.planning.modal.channels.whatsapp}</span>
                                            <span className="text-xs text-gray-500">{t.planning.modal.channels.whatsappDesc}</span>
                                        </div>
                                        <MessageCircle size={20} className="text-gray-400" />
                                    </label>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    onClick={() => setIsPublishModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                                >
                                    {t.planning.modal.cancel}
                                </button>
                                <button
                                    onClick={handlePublish}
                                    disabled={publishStatus !== 'idle'}
                                    className="flex-1 bg-[#0F4C5C] hover:bg-[#0a3641] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
                                >
                                    {publishStatus === 'sending' ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            {t.planning.modal.sending}
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            {t.planning.modal.confirm}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 1.5 Copy Modal */}
            {
                isCopyModalOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity print:hidden">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                            {/* HEADER */}
                            <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <Copy className="h-5 w-5 text-[#FFC107]" />
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        {t.planning.modal.copyTitle}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsCopyModalOpen(false)}
                                    className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* BODY */}
                            <div className="p-8 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-8">

                                {/* LEFT: SOURCE */}
                                <div className="flex-1 flex flex-col gap-4">
                                    <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2">{t.planning.modal.source}</h4>
                                    <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center h-full min-h-[150px]">
                                        <CalendarIcon size={32} className="text-[#0F4C5C] mb-3" />
                                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">{t.planning.modal.currentWeek}</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {formatDateShort(currentWeekStart, language)} - {formatDateShort(addDaysToDate(currentWeekStart, 6), language)}
                                        </p>
                                        <div className="mt-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-200">
                                            {dbShifts.length} shifts
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="bg-gray-100 p-2 rounded-full text-gray-400">
                                        <ArrowRight size={24} />
                                    </div>
                                </div>

                                {/* RIGHT: DESTINATION */}
                                <div className="flex-1 flex flex-col gap-4">
                                    <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2">{t.planning.modal.destination}</h4>
                                    <p className="text-xs text-gray-500">{t.planning.modal.selectWeeks}</p>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                        {Array.from({ length: 8 }).map((_, i) => {
                                            const weekStart = addDaysToDate(currentWeekStart, (i + 1) * 7);
                                            const weekEnd = addDaysToDate(weekStart, 6);
                                            const weekIso = weekStart.toISOString();
                                            const isSelected = copyTargetWeeks.includes(weekIso);

                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => toggleCopyTargetWeek(weekIso)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-[#0F4C5C] bg-[#0F4C5C]/5' : 'border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <CalendarIcon size={16} className={isSelected ? 'text-[#0F4C5C]' : 'text-gray-400'} />
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {formatDateShort(weekStart, language)} - {formatDateShort(weekEnd, language)}
                                                        </span>
                                                    </div>
                                                    <div className={isSelected ? 'text-[#0F4C5C]' : 'text-gray-300'}>
                                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>

                            {/* FOOTER */}
                            <div className="p-6 pt-2 bg-white rounded-b-xl shrink-0 flex justify-end gap-3 border-t border-gray-100">
                                <button
                                    onClick={() => setIsCopyModalOpen(false)}
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                                >
                                    {t.planning.modal.cancel}
                                </button>
                                <button
                                    onClick={handleCopySchedule}
                                    disabled={copyTargetWeeks.length === 0 || copyStatus !== 'idle'}
                                    className="bg-[#FFC107] hover:bg-[#e0a800] text-[#0F4C5C] font-extrabold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {copyStatus === 'copying' ? <Loader2 size={18} className="animate-spin" /> : <Copy size={18} />}
                                    {copyStatus === 'success' ? t.planning.modal.copied : (copyTargetWeeks.length > 0 ? t.planning.modal.copyAction.replace('{count}', copyTargetWeeks.length.toString()) : t.planning.modal.copySimple)}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 2. Add Shift Modal */}
            {
                isAddModalOpen && newShiftTarget && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                            {/* HEADER */}
                            <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <Plus className="h-5 w-5 text-[#FFC107]" strokeWidth={3} />
                                    <h3 className="text-lg font-bold text-white tracking-wide">
                                        {editingShiftId ? t.planning.modal.editShiftTitle : t.planning.modal.newShiftTitle}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* BODY */}
                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">

                                {/* Context Info (Employee & Date) */}
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center font-bold text-sm">
                                        {employees.find(e => e.id === newShiftTarget.employeeId)?.name.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">
                                            {employees.find(e => e.id === newShiftTarget.employeeId)?.name || 'Unassigned'}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            {addDaysToDate(currentWeekStart, newShiftTarget.dayIndex).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Time Range */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.planning.modal.start}</label>
                                        <input
                                            type="time"
                                            value={newShiftData.startTime}
                                            onChange={(e) => setNewShiftData({ ...newShiftData, startTime: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium text-sm text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.planning.modal.end}</label>
                                        <input
                                            type="time"
                                            value={newShiftData.endTime}
                                            onChange={(e) => setNewShiftData({ ...newShiftData, endTime: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium text-sm text-center"
                                        />
                                    </div>
                                </div>

                                {/* Break Duration */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.planning.modal.break}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newShiftData.breakMinutes}
                                        onChange={(e) => setNewShiftData({ ...newShiftData, breakMinutes: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium text-sm"
                                    />
                                </div>

                                {/* Site Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.planning.modal.site}</label>
                                    <div className="relative">
                                        <select
                                            value={newShiftData.siteId}
                                            onChange={(e) => setNewShiftData({ ...newShiftData, siteId: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium text-sm appearance-none"
                                        >
                                            <option value="">{t.planning.modal.sitePlaceholder}</option>
                                            {sites.map(site => (
                                                <option key={site.id} value={site.id}>{site.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <ChevronRight className="h-4 w-4 text-slate-300 rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes Field */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.planning.modal.note}</label>
                                    <textarea
                                        value={newShiftData.note}
                                        onChange={(e) => setNewShiftData({ ...newShiftData, note: e.target.value })}
                                        placeholder={t.planning.modal.notePlaceholder}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white text-sm resize-none min-h-[80px]"
                                    />
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="p-6 pt-2 bg-white rounded-b-xl shrink-0 flex gap-3">
                                {editingShiftId && (
                                    <button
                                        onClick={handleDeleteShift}
                                        className="px-4 py-3.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveNewShift}
                                    className="flex-1 bg-[#FFC107] hover:bg-[#e0a800] text-[#0F4C5C] font-extrabold text-base py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
                                >
                                    {editingShiftId ? <RefreshCw size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                                    {editingShiftId ? t.planning.modal.update : t.planning.modal.create}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}

// --- Sub-Component: Shift Card ---
function ShiftCard({ shift, onDragStart, onClick }: { shift: Shift, onDragStart: (e: React.DragEvent) => void, onClick: () => void }) {
    const isDraft = shift.status === 'draft';

    // Determine Day/Night Icon (Simple logic: if starts before 6am or ends after 8pm)
    const startH = parseInt(shift.startTime.split(':')[0]);
    const endH = parseInt(shift.endTime.split(':')[0]);
    const isNightShift = startH < 6 || endH > 20;

    return (
        <div
            draggable="true"
            onDragStart={onDragStart}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`
            rounded-md border p-2 text-xs shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group/card relative
            ${shift.siteColor}
            ${isDraft ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDNMMCA0TDMgMEw0IDFMMSAzWiIgZmlsbD0icmdiYSgwLDAsMCwwLjA1KSIvPjwvc3ZnPg==")]' : ''}
            ${isDraft ? 'opacity-80 border-dashed' : 'border-solid'}
            ${shift.hasConflict ? 'ring-2 ring-red-500 ring-offset-1 z-10' : ''}
            print:border-gray-900 print:bg-white print:text-gray-900
        `}>
            {/* Conflict Badge (Hidden on Print) */}
            {shift.hasConflict && (
                <div className="absolute -top-2 -left-2 z-30 group/badge print:hidden">
                    <div className="bg-red-600 text-white rounded-full p-1 shadow-md animate-bounce ring-2 ring-white cursor-pointer">
                        <AlertTriangle size={14} strokeWidth={3} />
                    </div>
                    {/* Custom Tooltip */}
                    <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none z-40">
                        {shift.conflictReason}
                        {/* Arrow */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                </div>
            )}

            {/* Status Indicator (Hidden on Print) */}
            {isDraft && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full border border-white print:hidden"></div>
            )}

            <div className="font-bold mb-0.5 flex justify-between items-center">
                <span className={`${shift.hasConflict ? "text-red-700" : ""} print:text-gray-900`}>{shift.startTime} - {shift.endTime}</span>
                <div className="flex gap-1 print:hidden">
                    {isNightShift ? <Moon size={10} className="text-indigo-500" /> : <Sun size={10} className="text-amber-500" />}
                </div>
            </div>
            <div className="flex items-center gap-1 truncate opacity-90">
                <MapPin size={10} />
                {shift.site}
            </div>

            {/* Hover Actions (Hidden on Print) */}
            <div className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity print:hidden">
                <MoreHorizontal size={14} className="text-current" />
            </div>
        </div>
    );
}
