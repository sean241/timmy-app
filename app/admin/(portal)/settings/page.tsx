"use client";

import { useState, useRef, useEffect } from "react";
import {
    Building2, Users, Bell, CreditCard, Puzzle, User,
    Save, Upload, Plus, Trash2, CheckCircle, AlertCircle,
    Mail, Shield, Smartphone, FileText, Download, Loader2,
    FileSpreadsheet, Calendar, Calculator, Lock as LockIcon, BarChart3, UserPlus, X, Camera, Clock, Send, Eye, EyeOff
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";

// --- Toast Component ---
import Toast from "@/components/Toast";
import { OrganizationSettings } from "@/types/settings";
import {
    COMPANY_SECTORS, COUNTRIES, PAYROLL_CYCLES, EXPORT_FORMATS,
    LATENESS_TOLERANCES, ROUNDING_RULES, AUTO_BREAK_DURATION,
    WEEK_START_DAYS, DAYS_OF_WEEK, ALERT_THRESHOLDS
} from "@/lib/settings-options";
import { inviteUser } from "@/app/actions/invite";



export default function SettingsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<"general" | "team" | "notifications" | "billing" | "integrations" | "logs" | "profile">("general");
    const [organizationId, setOrganizationId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrgId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
                if (profile) {
                    setOrganizationId(profile.organization_id);
                }
            }
        };
        fetchOrgId();
    }, []);

    const tabs = [
        { id: "general", label: t.settings.tabs.general, icon: Building2 },
        { id: "team", label: t.settings.tabs.team, icon: Users },
        { id: "notifications", label: t.settings.tabs.notifications, icon: Bell },
        { id: "billing", label: t.settings.tabs.billing, icon: CreditCard },
        { id: "integrations", label: t.settings.tabs.integrations, icon: Puzzle },
        { id: "logs", label: t.settings.tabs.logs, icon: FileText },
        { id: "profile", label: t.settings.tabs.profile, icon: User },
    ] as const;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t.settings.title}</h1>
                <p className="text-gray-500 mt-1">{t.settings.desc}</p>
            </div>

            <div className="flex flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col">
                    <div className="p-4 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                    ? "bg-white text-[#0F4C5C] shadow-sm ring-1 ring-gray-200"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === "general" && <GeneralSettings organizationId={organizationId} />}
                    {activeTab === "team" && <TeamSettings organizationId={organizationId} />}
                    {activeTab === "notifications" && <NotificationSettings organizationId={organizationId} />}
                    {activeTab === "billing" && <BillingSettings />}
                    {activeTab === "integrations" && <IntegrationSettings organizationId={organizationId} />}
                    {activeTab === "logs" && <SystemLogs />}
                    {activeTab === "profile" && <ProfileSettings />}
                </div>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function SystemLogs() {
    const { t } = useLanguage();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('app_logs')
                .select('*, profiles(first_name, last_name, email)')
                .order('created_at', { ascending: false })
                .limit(100); // Increased limit for better search

            if (error) {
                console.error("Error fetching logs:", error);
            } else {
                setLogs(data || []);
            }
            setIsLoading(false);
        };

        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const searchLower = searchQuery.toLowerCase();
        return (
            log.action.toLowerCase().includes(searchLower) ||
            log.level.toLowerCase().includes(searchLower) ||
            (log.profiles?.first_name?.toLowerCase() || "").includes(searchLower) ||
            (log.profiles?.last_name?.toLowerCase() || "").includes(searchLower) ||
            (log.profiles?.email?.toLowerCase() || "").includes(searchLower)
        );
    });

    const handleExport = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(filteredLogs, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `system_logs_${new Date().toISOString()}.json`;
        link.click();
    };

    const toggleDetails = (id: string) => {
        if (expandedLogId === id) {
            setExpandedLogId(null);
        } else {
            setExpandedLogId(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t.systemLogs.title}</h2>
                    <p className="text-sm text-gray-500">{t.systemLogs.desc}</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <Download size={16} />
                    {t.systemLogs.export}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Puzzle size={18} className="text-gray-400" /> {/* Using Puzzle as generic search icon if Search not imported, or replace with Search */}
                </div>
                <input
                    type="text"
                    placeholder={t.systemLogs.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#0F4C5C] focus:border-[#0F4C5C] sm:text-sm transition duration-150 ease-in-out"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.systemLogs.table.date}</th>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.systemLogs.table.level}</th>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.systemLogs.table.action}</th>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.systemLogs.table.user}</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-center">{t.systemLogs.table.details}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                        {t.common.loading}
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {t.systemLogs.empty}
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <>
                                        <tr key={log.id} className={`hover:bg-gray-50/50 transition-colors ${expandedLogId === log.id ? "bg-gray-50" : ""}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${log.level === 'ERROR' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    log.level === 'WARN' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {log.action}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {log.profiles ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs">{log.profiles.first_name} {log.profiles.last_name}</span>
                                                        <span className="text-[10px] text-gray-400">{log.profiles.email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Système</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => toggleDetails(log.id)}
                                                    className={`p-2 rounded-full transition-colors ${expandedLogId === log.id ? "bg-[#0F4C5C] text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                                                    title={expandedLogId === log.id ? t.systemLogs.hideDetails : t.systemLogs.viewDetails}
                                                >
                                                    <AlertCircle size={18} className="rotate-180" /> {/* Using AlertCircle as Info icon substitute */}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedLogId === log.id && (
                                            <tr className="bg-gray-50 animate-in fade-in duration-200">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                                        <pre className="text-xs text-green-400 font-mono">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function GeneralSettings({ organizationId }: { organizationId: string | null }) {
    const { t } = useLanguage();
    const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const DEFAULT_SETTINGS: OrganizationSettings = {
        general: { sector: 'BTP', timezone: 'Africa/Libreville', currency: 'XAF', logo_url: '' },
        payroll: { cycle: 'MONTHLY_1', format: 'XLSX', use_matricule: true },
        attendance: { tolerance_minutes: 5, rounding_rule: 'EXACT', auto_break: { enabled: true, duration_minutes: 60, threshold_hours: 6 }, overtime: { enabled: true, daily_threshold: 8, weekly_threshold: 40 } },
        planning: { week_start: 'MONDAY', working_days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], night_shift: { start: '22:00', end: '06:00' }, start_time: '08:00', end_time: '17:00' },
        notifications: { channels: { email: true, whatsapp: true }, alerts: { late_arrival: true, early_departure: false, overtime: false, no_show: { enabled: true, threshold_minutes: 30 }, device_offline: { enabled: true, threshold_minutes: 60 } }, reports: { daily_digest: true, weekly_summary: false }, employee_comms: { send_planning: true, shift_reminder: true } },
        features: { beta_access: false, allow_geofencing: true }
    };

    const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);
    const [companyName, setCompanyName] = useState("");
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!organizationId) return;
        const fetchSettings = async () => {
            const { data, error } = await supabase.from('organizations').select('settings, name, logo_url').eq('id', organizationId).single();
            if (data) {
                setCompanyName(data.name || "");
                if (data.settings) {
                    setSettings(prev => ({
                        ...prev,
                        ...data.settings,
                        general: {
                            ...prev.general,
                            ...(data.settings.general || {}),
                            logo_url: data.logo_url || data.settings.general?.logo_url || ""
                        },
                        payroll: { ...prev.payroll, ...(data.settings.payroll || {}) },
                        attendance: { ...prev.attendance, ...(data.settings.attendance || {}) },
                        planning: { ...prev.planning, ...(data.settings.planning || {}) },
                        notifications: { ...prev.notifications, ...(data.settings.notifications || {}) },
                        features: { ...prev.features, ...(data.settings.features || {}) },
                    }));
                }
            }
        };
        fetchSettings();
    }, [organizationId]);

    const handleSave = async () => {
        if (!organizationId) return;
        setStatus("saving");

        const { error } = await supabase.from('organizations').update({
            settings: settings as any,
            name: companyName,
            logo_url: settings.general.logo_url
        }).eq('id', organizationId);

        if (error) {
            console.error("Error saving settings:", error);
            setToast({ message: "Erreur lors de la sauvegarde", type: "error" });
            setStatus("idle");
        } else {
            setStatus("success");
            setToast({ message: t.settings.general.saved, type: "success" });
            setTimeout(() => setStatus("idle"), 2000);
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setToast({ message: "L'image est trop volumineuse (Max 2Mo)", type: "error" });
            return;
        }

        setUploadingLogo(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `org-logo-${organizationId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Supabase Storage (using 'avatars' bucket as it is public)
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update State
            setSettings(prev => ({
                ...prev,
                general: { ...prev.general, logo_url: publicUrl }
            }));

            setToast({ message: "Logo ajouté avec succès", type: "success" });

        } catch (error: any) {
            console.error("Error uploading logo:", error);
            setToast({ message: "Erreur lors de l'upload du logo", type: "error" });
        } finally {
            setUploadingLogo(false);
        }
    };

    // Helper to get translated label from key
    const getLabel = (keyPath: string) => {
        const keys = keyPath.split('.');
        let current: any = t;
        for (const key of keys) {
            if (current[key] === undefined) return keyPath;
            current = current[key];
        }
        return current as string;
    };

    const toggleWorkingDay = (day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN') => {
        setSettings(prev => {
            const currentDays = prev.planning.working_days;
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];
            return {
                ...prev,
                planning: { ...prev.planning, working_days: newDays }
            };
        });
    };

    return (
        <div className="max-w-2xl space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.general.companyInfo}</h2>
                <button
                    onClick={handleSave}
                    disabled={status !== "idle"}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${status === "success"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-[#0F4C5C] text-white hover:bg-[#0a3641]"
                        }`}
                >
                    {status === "saving" ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {t.settings.general.saving}
                        </>
                    ) : status === "success" ? (
                        <>
                            <CheckCircle size={16} />
                            {t.settings.general.saved}
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            {t.settings.general.save}
                        </>
                    )}
                </button>
            </div>

            {/* Logo */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                <label className="block text-sm font-bold text-gray-900">{t.settings.general.logo}</label>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 overflow-hidden relative">
                        {settings.general.logo_url ? (
                            <img
                                src={settings.general.logo_url}
                                alt="Company Logo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Building2 size={32} />
                        )}
                        {uploadingLogo && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="animate-spin text-white" size={24} />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Upload size={16} />
                            {uploadingLogo ? "Téléchargement..." : t.settings.general.uploadLogo}
                        </button>
                        <p className="text-xs text-gray-500">{t.settings.general.logoDesc}</p>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.companyName}</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.industry}</label>
                        <select
                            value={settings.general.sector}
                            onChange={(e) => setSettings({ ...settings, general: { ...settings.general, sector: e.target.value } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                        >
                            {COMPANY_SECTORS.map(opt => (
                                <option key={opt.value} value={opt.value}>{getLabel(opt.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.currency}</label>
                        <select
                            value={settings.general.currency}
                            onChange={(e) => setSettings({ ...settings, general: { ...settings.general, currency: e.target.value } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                        >
                            {COUNTRIES.map(c => (
                                <option key={c.code} value={c.currency}>{c.currency} - {c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.timezone}</label>
                        <select
                            value={settings.general.timezone}
                            onChange={(e) => setSettings({ ...settings, general: { ...settings.general, timezone: e.target.value } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                        >
                            <option value="Africa/Libreville">Afrique/Libreville (GMT+1)</option>
                            <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                        </select>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Payroll Rules */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">{t.settings.general.payrollRules}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.payrollCycle}</label>
                        <select
                            value={settings.payroll.cycle}
                            onChange={(e) => setSettings({ ...settings, payroll: { ...settings.payroll, cycle: e.target.value as any } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                        >
                            {PAYROLL_CYCLES.map(opt => (
                                <option key={opt.value} value={opt.value}>{getLabel(opt.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.exportFormat}</label>
                        <select
                            value={settings.payroll.format}
                            onChange={(e) => setSettings({ ...settings, payroll: { ...settings.payroll, format: e.target.value as any } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                        >
                            {EXPORT_FORMATS.map(opt => (
                                <option key={opt.value} value={opt.value}>{getLabel(opt.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Attendance Rules (Anti-Conflict) */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">{t.settings.general.attendanceRules}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.latenessTolerance}</label>
                        <select
                            value={settings.attendance.tolerance_minutes}
                            onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, tolerance_minutes: parseInt(e.target.value) as any } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                        >
                            {LATENESS_TOLERANCES.map(opt => (
                                <option key={opt.value} value={opt.value}>{getLabel(opt.labelKey)}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">{t.settings.general.latenessDesc}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.roundingRule}</label>
                        <select
                            value={settings.attendance.rounding_rule}
                            onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, rounding_rule: e.target.value as any } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                        >
                            {ROUNDING_RULES.map(opt => (
                                <option key={opt.value} value={opt.value}>{getLabel(opt.labelKey)}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">{t.settings.general.roundingDesc}</p>
                    </div>
                </div>

                {/* NEW ROW: Weekly Target */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">Objectif Hebdo (Heures Normales)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.attendance.overtime?.weekly_threshold || 40}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    attendance: {
                                        ...settings.attendance,
                                        overtime: {
                                            ...(settings.attendance.overtime || { enabled: true, daily_threshold: 8 }),
                                            weekly_threshold: parseInt(e.target.value) || 0
                                        }
                                    }
                                })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white pr-12"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-sm">
                                H/sem
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Base de calcul pour la jauge (ex: 35h ou 40h)</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <div className="font-bold text-gray-900 text-sm">{t.settings.general.autoLunch}</div>
                        <div className="text-xs text-gray-500">{t.settings.general.autoLunchDesc}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={settings.attendance.auto_break.duration_minutes}
                            onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, auto_break: { ...settings.attendance.auto_break, duration_minutes: parseInt(e.target.value) as any } } })}
                            disabled={!settings.attendance.auto_break.enabled}
                            className={`px-3 py-1.5 rounded-lg border border-gray-300 text-sm outline-none transition-colors ${!settings.attendance.auto_break.enabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}`}
                        >
                            {AUTO_BREAK_DURATION.map(opt => (
                                <option key={opt.value} value={opt.value}>{getLabel(opt.labelKey)}</option>
                            ))}
                        </select>
                        <span className="text-xs text-gray-500">{t.settings.general.ifDay} {settings.attendance.auto_break.threshold_hours}h</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.attendance.auto_break.enabled}
                                onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, auto_break: { ...settings.attendance.auto_break, enabled: e.target.checked } } })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F4C5C]"></div>
                        </label>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Schedule Parameters */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">{t.settings.general.scheduleSettings}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.stdDayDuration}</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={settings.attendance.overtime.daily_threshold}
                                onChange={(e) => setSettings({ ...settings, attendance: { ...settings.attendance, overtime: { ...settings.attendance.overtime, daily_threshold: parseInt(e.target.value) } } })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{t.settings.general.hours}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.startOfWeek}</label>
                        <select
                            value={settings.planning.week_start}
                            onChange={(e) => setSettings({ ...settings, planning: { ...settings.planning, week_start: e.target.value as any } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                        >
                            {WEEK_START_DAYS.map(opt => (
                                <option key={opt.value} value={opt.value}>{getLabel(opt.labelKey)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.startTime}</label>
                        <input
                            type="time"
                            value={settings.planning.start_time || "08:00"}
                            onChange={(e) => setSettings({ ...settings, planning: { ...settings.planning, start_time: e.target.value } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.endTime}</label>
                        <input
                            type="time"
                            value={settings.planning.end_time || "17:00"}
                            onChange={(e) => setSettings({ ...settings, planning: { ...settings.planning, end_time: e.target.value } })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">{t.settings.general.workingDays}</label>
                    <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                            <label key={day.id} className="cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={settings.planning.working_days.includes(day.id as any)}
                                    onChange={() => toggleWorkingDay(day.id as any)}
                                />
                                <div className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 font-medium text-sm peer-checked:bg-[#0F4C5C] peer-checked:text-white peer-checked:border-[#0F4C5C] transition-all hover:bg-gray-50 peer-checked:hover:bg-[#0a3641]">
                                    {getLabel(day.labelKey)}
                                </div>
                            </label>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.settings.general.workingDaysDesc}</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.general.nightHours}</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm text-gray-500">{t.settings.general.from}</span>
                            <input
                                type="time"
                                value={settings.planning.night_shift.start}
                                onChange={(e) => setSettings({ ...settings, planning: { ...settings.planning, night_shift: { ...settings.planning.night_shift, start: e.target.value } } })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                            />
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm text-gray-500">{t.settings.general.to}</span>
                            <input
                                type="time"
                                value={settings.planning.night_shift.end}
                                onChange={(e) => setSettings({ ...settings, planning: { ...settings.planning, night_shift: { ...settings.planning.night_shift, end: e.target.value } } })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TeamSettings({ organizationId }: { organizationId: string | null }) {
    const { t } = useLanguage();
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "success">("idle");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const fetchTeam = async () => {
        if (!organizationId) return;
        setIsLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch profiles linked to this organization
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('organization_id', organizationId);

        if (error) {
            console.error("Error fetching team:", error);
            setToast({ message: "Erreur lors du chargement de l'équipe", type: "error" });
        } else {
            setTeamMembers(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTeam();
    }, [organizationId]);

    const handleDeleteMember = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;

        const { error } = await supabase
            .from('profiles')
            .delete() // Note: This might fail if linked to auth.users due to FK, usually we just remove org_id or set inactive
            .eq('id', id);

        // Since we can't easily delete auth users from client, we might just want to set organization_id to null
        // But for now let's try to update organization_id to null to "remove" them from the team
        /* 
        const { error } = await supabase
            .from('profiles')
            .update({ organization_id: null })
            .eq('id', id);
        */

        // For this demo, let's assume we can't delete the OWNER, and for others we just show a toast
        setToast({ message: "Fonctionnalité de suppression à venir (nécessite admin)", type: "error" });
    };

    const handleResendInvite = async (email: string, role: string) => {
        if (!organizationId) return;

        // Optimistic feedback
        setToast({ message: "Envoi de l'invitation...", type: "success" });

        try {
            const result = await inviteUser(email, role, organizationId);
            if (result.error) {
                setToast({ message: result.error, type: "error" });
            } else {
                setToast({ message: "Invitation renvoyée avec succès !", type: "success" });
            }
        } catch (error) {
            console.error(error);
            setToast({ message: "Erreur lors de l'envoi", type: "error" });
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteStatus("sending");

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = formData.get('email') as string;
        const role = formData.get('role') as string;

        if (!organizationId) {
            setToast({ message: "Erreur: Organisation non identifiée", type: "error" });
            setInviteStatus("idle");
            return;
        }

        try {
            const result = await inviteUser(email, role, organizationId);

            if (result.error) {
                setToast({ message: result.error, type: "error" });
                setInviteStatus("idle");
            } else {
                setInviteStatus("success");
                setToast({ message: t.settings.team.inviteModal.sent, type: "success" });

                // Refresh the team list
                await fetchTeam();

                setTimeout(() => {
                    setInviteStatus("idle");
                    setIsInviteModalOpen(false);
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            setToast({ message: "Une erreur est survenue", type: "error" });
            setInviteStatus("idle");
        }
    };

    return (
        <div className="space-y-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t.settings.team.title}</h2>
                    <p className="text-sm text-gray-500">{t.settings.team.desc}</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-[#FFC107] text-[#0F4C5C] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#FFD54F] transition-colors flex items-center gap-2"
                >
                    <Plus size={16} />
                    {t.settings.team.invite}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium text-gray-500">{t.settings.team.table.user}</th>
                            <th className="px-6 py-3 font-medium text-gray-500">{t.settings.team.table.role}</th>
                            <th className="px-6 py-3 font-medium text-gray-500">{t.settings.team.table.status}</th>
                            <th className="px-6 py-3 font-medium text-gray-500 text-right">{t.settings.team.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                    {t.common.loading}
                                </td>
                            </tr>
                        ) : teamMembers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    Aucun membre trouvé.
                                </td>
                            </tr>
                        ) : (
                            teamMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${!member.first_name ? 'bg-orange-100 text-orange-600' : 'bg-[#0F4C5C] text-white'}`}>
                                                {member.first_name ? `${member.first_name[0]}${member.last_name?.[0] || ''}` : <Mail size={14} />}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${!member.first_name ? 'text-gray-500 italic' : 'text-gray-900'}`}>
                                                    {member.first_name ? `${member.first_name} ${member.last_name}` : t.settings.team.table.pendingUser}
                                                </div>
                                                <div className="text-gray-500 text-xs">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${member.role === 'OWNER' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            member.role === 'MANAGER' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            {member.role === 'OWNER' && <Shield size={10} />}
                                            {member.role === 'MANAGER' && <Users size={10} />}
                                            {member.role === 'ACCOUNTANT' && <FileText size={10} />}
                                            {member.role === 'OWNER' ? t.settings.team.roles.owner :
                                                member.role === 'MANAGER' ? t.settings.team.roles.manager :
                                                    member.role === 'ACCOUNTANT' ? t.settings.team.roles.accountant :
                                                        member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {!member.first_name ? (
                                            <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-medium bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                                                <Clock size={12} />
                                                {t.settings.team.table.pending}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                                <CheckCircle size={12} />
                                                {t.settings.team.table.active}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {currentUser?.id === member.id ? (
                                            <span className="text-gray-300 italic text-xs">{t.settings.team.table.you}</span>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                {!member.first_name && (
                                                    <button
                                                        onClick={() => handleResendInvite(member.email, member.role)}
                                                        className="text-blue-500 hover:text-blue-700 p-1 relative group"
                                                        title={t.settings.team.table.resendInvite || "Renvoyer l'invitation"}
                                                    >
                                                        <Send size={16} />
                                                        {/* Custom Tooltip (Optional, browser title is often enough but this is nicer) */}
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                            {t.settings.team.table.resendInvite || "Renvoyer l'invitation"}
                                                        </span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p className="font-bold mb-1">{t.settings.team.roles.infoTitle}</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>{t.settings.team.roles.owner}</strong> : {t.settings.team.roles.ownerDesc}</li>
                    <li><strong>{t.settings.team.roles.manager}</strong> : {t.settings.team.roles.managerDesc}</li>
                    <li><strong>{t.settings.team.roles.accountant}</strong> : {t.settings.team.roles.accountantDesc}</li>
                </ul>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{t.settings.team.inviteModal.title}</h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Trash2 size={20} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleInvite} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.team.inviteModal.email}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="collegue@entreprise.com"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.team.inviteModal.role}</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="radio" name="role" value="MANAGER" defaultChecked className="mt-1 text-[#0F4C5C] focus:ring-[#0F4C5C]" />
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{t.settings.team.roles.manager}</div>
                                            <div className="text-xs text-gray-500">{t.settings.team.roles.managerDesc}</div>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="radio" name="role" value="ACCOUNTANT" className="mt-1 text-[#0F4C5C] focus:ring-[#0F4C5C]" />
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{t.settings.team.roles.accountant}</div>
                                            <div className="text-xs text-gray-500">{t.settings.team.roles.accountantDesc}</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold text-sm hover:bg-gray-50"
                                >
                                    {t.settings.team.inviteModal.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteStatus === "sending"}
                                    className="flex-1 bg-[#0F4C5C] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#0a3641] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {inviteStatus === "sending" ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            {t.settings.team.inviteModal.sending}
                                        </>
                                    ) : inviteStatus === "success" ? (
                                        <>
                                            <CheckCircle size={16} />
                                            {t.settings.team.inviteModal.sent}
                                        </>
                                    ) : (
                                        t.settings.team.inviteModal.send
                                    )}
                                </button>
                            </div>
                        </form>
                    </div >
                </div >
            )
            }
        </div >
    );
}

function NotificationSettings({ organizationId }: { organizationId: string | null }) {
    const { t } = useLanguage();
    const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Default settings matching the JSON structure
    const DEFAULT_NOTIFICATIONS = {
        channels: { email: true, whatsapp: true },
        alerts: {
            late_arrival: true,
            early_departure: false,
            overtime: false,
            no_show: { enabled: true, threshold_minutes: 30 },
            device_offline: { enabled: true, threshold_minutes: 60 }
        },
        reports: { daily_digest: true, weekly_summary: false },
        employee_comms: { send_planning: true, shift_reminder: true }
    };

    const [settings, setSettings] = useState(DEFAULT_NOTIFICATIONS);

    useEffect(() => {
        if (!organizationId) return;
        const fetchSettings = async () => {
            const { data, error } = await supabase.from('organizations').select('settings').eq('id', organizationId).single();
            if (data && data.settings && data.settings.notifications) {
                setSettings(prev => ({ ...prev, ...data.settings.notifications }));
            }
        };
        fetchSettings();
    }, [organizationId]);

    const handleSave = async () => {
        if (!organizationId) return;
        setStatus("saving");

        // We need to fetch current settings first to not overwrite other sections
        const { data: currentData } = await supabase.from('organizations').select('settings').eq('id', organizationId).single();
        const currentSettings = currentData?.settings || {};

        const updatedSettings = {
            ...currentSettings,
            notifications: settings
        };

        const { error } = await supabase.from('organizations').update({ settings: updatedSettings }).eq('id', organizationId);

        if (error) {
            setToast({ message: "Erreur lors de la sauvegarde", type: "error" });
            setStatus("idle");
        } else {
            setStatus("success");
            setToast({ message: t.settings.general.saved, type: "success" });
            setTimeout(() => setStatus("idle"), 2000);
        }
    };

    const updateChannel = (key: keyof typeof settings.channels, value: boolean) => {
        setSettings(prev => ({ ...prev, channels: { ...prev.channels, [key]: value } }));
    };

    const updateAlert = (key: keyof typeof settings.alerts, value: boolean) => {
        setSettings(prev => ({ ...prev, alerts: { ...prev.alerts, [key]: value } }));
    };

    const updateReport = (key: keyof typeof settings.reports, value: boolean) => {
        setSettings(prev => ({ ...prev, reports: { ...prev.reports, [key]: value } }));
    };

    const updateComm = (key: keyof typeof settings.employee_comms, value: boolean) => {
        setSettings(prev => ({ ...prev, employee_comms: { ...prev.employee_comms, [key]: value } }));
    };

    return (
        <div className="max-w-2xl space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.notifications.title}</h2>
                <button
                    onClick={handleSave}
                    disabled={status !== "idle"}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${status === "success"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-[#0F4C5C] text-white hover:bg-[#0a3641]"
                        }`}
                >
                    {status === "saving" ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {t.settings.general.saving}
                        </>
                    ) : status === "success" ? (
                        <>
                            <CheckCircle size={16} />
                            {t.settings.general.saved}
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            {t.settings.general.save}
                        </>
                    )}
                </button>
            </div>

            {/* Channels */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">{t.settings.notifications.channels}</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <Mail size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Email</div>
                                <div className="text-xs text-gray-500">{t.settings.notifications.emailDesc}</div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.channels.email}
                                onChange={(e) => updateChannel('email', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F4C5C]"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">WhatsApp</div>
                                <div className="text-xs text-gray-500">{t.settings.notifications.whatsappDesc}</div>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.channels.whatsapp}
                                onChange={(e) => updateChannel('whatsapp', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Operational Alerts (Urgencies) */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900">{t.settings.notifications.operationalAlerts}</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-[#0F4C5C] focus:ring-[#0F4C5C]"
                            checked={settings.alerts.late_arrival}
                            onChange={(e) => updateAlert('late_arrival', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">{t.settings.notifications.lateAlert}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-[#0F4C5C] focus:ring-[#0F4C5C]"
                            checked={settings.alerts.no_show.enabled}
                            onChange={(e) => setSettings(prev => ({ ...prev, alerts: { ...prev.alerts, no_show: { ...prev.alerts.no_show, enabled: e.target.checked } } }))}
                        />
                        <span className="text-sm text-gray-700">{t.settings.notifications.absentAlert}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-[#0F4C5C] focus:ring-[#0F4C5C]"
                            checked={settings.alerts.early_departure}
                            onChange={(e) => updateAlert('early_departure', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">{t.settings.notifications.earlyAlert}</span>
                    </label>
                </div>
            </div>

            {/* Technical Alerts */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    {t.settings.notifications.technicalAlerts}
                    <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{t.settings.notifications.critical}</span>
                </h3>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-red-600 focus:ring-red-600"
                            checked={settings.alerts.device_offline.enabled}
                            onChange={(e) => setSettings(prev => ({ ...prev, alerts: { ...prev.alerts, device_offline: { ...prev.alerts.device_offline, enabled: e.target.checked } } }))}
                        />
                        <span className="text-sm text-gray-900 font-medium">{t.settings.notifications.syncAlert}</span>
                    </label>
                </div>
            </div>

            {/* Reports */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900">{t.settings.notifications.reports}</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-[#0F4C5C] focus:ring-[#0F4C5C]"
                            checked={settings.reports.daily_digest}
                            onChange={(e) => updateReport('daily_digest', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">{t.settings.notifications.dailyReport}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-[#0F4C5C] focus:ring-[#0F4C5C]"
                            checked={settings.reports.weekly_summary}
                            onChange={(e) => updateReport('weekly_summary', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">{t.settings.notifications.weeklyReport}</span>
                    </label>
                </div>
            </div>

            {/* Employee Alerts */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900">{t.settings.notifications.employeeAlerts}</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-[#0F4C5C] focus:ring-[#0F4C5C]"
                            checked={settings.employee_comms.send_planning}
                            onChange={(e) => updateComm('send_planning', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">{t.settings.notifications.scheduleAlert}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-[#0F4C5C] focus:ring-[#0F4C5C]"
                            checked={settings.employee_comms.shift_reminder}
                            onChange={(e) => updateComm('shift_reminder', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">{t.settings.notifications.shiftReminder}</span>
                    </label>
                </div>
                <div className="flex gap-2 items-start p-3 bg-blue-50 text-blue-800 rounded-lg text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p>{t.settings.notifications.whatsappConsent}</p>
                </div>
            </div>
        </div>
    );
}

function BillingSettings() {
    const { t } = useLanguage();
    const [isMobileMoneyModalOpen, setIsMobileMoneyModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isBillingDetailsModalOpen, setIsBillingDetailsModalOpen] = useState(false);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Mobile Money State
    const [mmFile, setMmFile] = useState<File | null>(null);
    const [mmStatus, setMmStatus] = useState<"idle" | "submitting" | "success">("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upgrade State
    const [upgradeStatus, setUpgradeStatus] = useState<"idle" | "submitting" | "success">("idle");

    // Billing Details State
    const [billingDetails, setBillingDetails] = useState({
        company: "BTP Gabon Construction",
        address: "BP 1234, Zone Industrielle Oloumi, Libreville",
        nif: "123456-A",
        rccm: "2024-B-12345",
        email: "compta@btpgabon.com"
    });
    const [billingStatus, setBillingStatus] = useState<"idle" | "saving" | "success">("idle");

    const handleMobileMoneySubmit = () => {
        if (!mmFile) return; // Should probably show error, but for now just return
        setMmStatus("submitting");
        setTimeout(() => {
            setMmStatus("success");
            setToast({ message: "Proof of payment sent successfully!", type: "success" });
            setTimeout(() => {
                setMmStatus("idle");
                setMmFile(null);
                setIsMobileMoneyModalOpen(false);
            }, 1000);
        }, 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMmFile(e.target.files[0]);
        }
    };

    const handleUpgrade = () => {
        setUpgradeStatus("submitting");
        setTimeout(() => {
            setUpgradeStatus("success");
            setToast({ message: "Plan change request sent!", type: "success" });
            setTimeout(() => {
                setUpgradeStatus("idle");
                setIsUpgradeModalOpen(false);
            }, 1000);
        }, 2000);
    };

    const handleBillingSave = (e: React.FormEvent) => {
        e.preventDefault();
        setBillingStatus("saving");
        setTimeout(() => {
            setBillingStatus("success");
            setToast({ message: "Billing details updated!", type: "success" });
            setTimeout(() => {
                setBillingStatus("idle");
                setIsBillingDetailsModalOpen(false);
            }, 1000);
        }, 1500);
    };

    return (
        <div className="max-w-3xl space-y-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <h2 className="text-xl font-bold text-gray-900">{t.settings.billing.title}</h2>

            {/* Current Plan */}
            <div className="bg-gradient-to-br from-[#0F4C5C] to-[#0a3641] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-sm border border-white/10">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            {t.settings.billing.active}
                        </div>
                        <h3 className="text-3xl font-bold mb-1">TIMMY PRO</h3>
                        <p className="text-blue-100 text-sm">{t.settings.billing.monthly}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">20 000 F<span className="text-lg text-blue-200 font-normal">{t.settings.billing.month}</span></div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between text-sm mb-2 font-medium">
                        <span>{t.settings.billing.employeeUsage}</span>
                        <span>12 / 20</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                        <div className="bg-[#FFC107] h-full rounded-full w-[60%] shadow-[0_0_10px_rgba(255,193,7,0.5)]"></div>
                    </div>
                    <p className="text-xs text-blue-200 mt-2">{t.settings.billing.upgradePrompt} <button onClick={() => setIsUpgradeModalOpen(true)} className="underline hover:text-white font-bold">{t.settings.billing.upgradeLink}</button></p>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{t.settings.billing.paymentMethod}</h3>
                    <button className="text-[#0F4C5C] text-sm font-bold hover:underline">{t.settings.billing.edit}</button>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center">
                        <span className="font-bold text-xs text-gray-600">VISA</span>
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-gray-900">•••• •••• •••• 4242</div>
                        <div className="text-xs text-gray-500">{t.settings.billing.expires} 12/28</div>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">{t.settings.billing.altPayment}</h4>
                    <button
                        onClick={() => setIsMobileMoneyModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg font-bold text-sm border border-orange-100 hover:bg-orange-100 transition-colors"
                    >
                        <Smartphone size={16} />
                        {t.settings.billing.mobileMoneyBtn}
                    </button>
                </div>
            </div>

            {/* Billing Details (NIF/RCCM) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{t.settings.billing.billingDetails}</h3>
                    <button
                        onClick={() => setIsBillingDetailsModalOpen(true)}
                        className="text-[#0F4C5C] text-sm font-bold hover:underline"
                    >
                        {t.settings.billing.edit}
                    </button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                    <div className="font-bold text-gray-900">{billingDetails.company}</div>
                    <div>{billingDetails.address}</div>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">NIF: {billingDetails.nif}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">RCCM: {billingDetails.rccm}</span>
                    </div>
                    <div className="mt-2 text-gray-500 text-xs">Billing Email: {billingDetails.email}</div>
                </div>
            </div>

            {/* Invoices */}
            <div>
                <h3 className="font-bold text-gray-900 mb-4">{t.settings.billing.invoiceHistory}</h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.settings.billing.table.date}</th>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.settings.billing.table.amount}</th>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.settings.billing.table.status}</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-right">{t.settings.billing.table.invoice}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[1, 2, 3].map((i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-gray-900">15 Dec 2024</td>
                                    <td className="px-6 py-4 font-medium">20 000 F</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                            {t.settings.billing.table.paid}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-[#0F4C5C] transition-colors flex items-center justify-end gap-1 w-full">
                                            <Download size={16} />
                                            <span className="text-xs">PDF</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Money Modal */}
            {isMobileMoneyModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{t.settings.billing.mmModal.title}</h3>
                            <button onClick={() => setIsMobileMoneyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Trash2 size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800 text-sm space-y-2">
                                <p className="font-bold">{t.settings.billing.mmModal.instructions}</p>
                                <p>{t.settings.billing.mmModal.sendTo} <span className="font-bold">20 000 FCFA</span> {t.settings.billing.mmModal.number}</p>
                                <div className="text-xl font-mono font-bold text-center py-2 bg-white rounded border border-orange-200 select-all">
                                    074 00 00 00
                                </div>
                                <p className="text-xs text-center text-orange-600">{t.settings.billing.mmModal.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">{t.settings.billing.mmModal.proof}</label>
                                <input
                                    type="text"
                                    placeholder={t.settings.billing.mmModal.refPlaceholder}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none mb-3"
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${mmFile ? "border-[#0F4C5C] bg-blue-50" : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                                        }`}
                                >
                                    {mmFile ? (
                                        <>
                                            <FileText size={24} className="mb-2 text-[#0F4C5C]" />
                                            <span className="text-sm font-bold text-[#0F4C5C]">{mmFile.name}</span>
                                            <span className="text-xs text-gray-500">{t.settings.billing.mmModal.change}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={24} className="mb-2 text-gray-400" />
                                            <span className="text-xs font-medium text-gray-500">{t.settings.billing.mmModal.upload}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsMobileMoneyModalOpen(false)}
                                className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                {t.settings.team.inviteModal.cancel}
                            </button>
                            <button
                                onClick={handleMobileMoneySubmit}
                                disabled={mmStatus !== "idle" || !mmFile}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${mmStatus === "success"
                                    ? "bg-green-500 text-white"
                                    : !mmFile
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-[#0F4C5C] text-white hover:bg-[#0a3641]"
                                    }`}
                            >
                                {mmStatus === "submitting" ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {t.settings.team.inviteModal.sending}
                                    </>
                                ) : mmStatus === "success" ? (
                                    <>
                                        <CheckCircle size={16} />
                                        {t.settings.team.inviteModal.sent}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        {t.settings.billing.mmModal.sendProof}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{t.settings.billing.upgradeModal.title}</h3>
                            <button onClick={() => setIsUpgradeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Trash2 size={20} className="rotate-45" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-8">
                                {/* Current Plan */}
                                <div className="space-y-4 opacity-60 grayscale">
                                    <div className="text-center">
                                        <div className="font-bold text-gray-500 mb-1">{t.settings.billing.upgradeModal.current}</div>
                                        <div className="text-2xl font-bold text-gray-900">TIMMY PRO</div>
                                        <div className="text-lg font-medium text-gray-500">20 000 F <span className="text-sm font-normal">{t.settings.billing.month}</span></div>
                                    </div>
                                    <ul className="space-y-3 text-sm text-gray-600">
                                        <li className="flex items-center gap-2"><CheckCircle size={16} /> Max 20 Employees</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={16} /> 1 Site</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={16} /> Email Support</li>
                                    </ul>
                                    <button disabled className="w-full py-2 bg-gray-100 text-gray-400 font-bold rounded-lg text-sm cursor-not-allowed">
                                        {t.settings.billing.upgradeModal.activePlan}
                                    </button>
                                </div>

                                {/* Business Plan */}
                                <div className="space-y-4 relative">
                                    <div className="absolute -top-4 -right-4 bg-[#FFC107] text-[#0F4C5C] text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                        {t.settings.billing.upgradeModal.recommended}
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-[#0F4C5C] mb-1">UNLIMITED</div>
                                        <div className="text-2xl font-bold text-gray-900">BUSINESS</div>
                                        <div className="text-lg font-medium text-[#0F4C5C]">45 000 F <span className="text-sm font-normal text-gray-500">{t.settings.billing.month}</span></div>
                                    </div>
                                    <ul className="space-y-3 text-sm text-gray-900 font-medium">
                                        <li className="flex items-center gap-2 text-[#0F4C5C]"><CheckCircle size={16} /> <span className="font-bold">Unlimited Employees</span></li>
                                        <li className="flex items-center gap-2 text-[#0F4C5C]"><CheckCircle size={16} /> <span className="font-bold">Unlimited Sites</span></li>
                                        <li className="flex items-center gap-2 text-[#0F4C5C]"><CheckCircle size={16} /> <span className="font-bold">Dedicated WhatsApp Support</span></li>
                                    </ul>
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={upgradeStatus !== "idle"}
                                        className={`w-full py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-[#0F4C5C]/20 flex items-center justify-center gap-2 ${upgradeStatus === "success"
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "bg-[#0F4C5C] text-white hover:bg-[#0a3641]"
                                            }`}
                                    >
                                        {upgradeStatus === "submitting" ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                {t.settings.billing.upgradeModal.processing}
                                            </>
                                        ) : upgradeStatus === "success" ? (
                                            <>
                                                <CheckCircle size={16} />
                                                {t.settings.billing.upgradeModal.sent}
                                            </>
                                        ) : (
                                            t.settings.billing.upgradeModal.choose
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing Details Modal */}
            {isBillingDetailsModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">{t.settings.billing.editModal.title}</h3>
                            <button onClick={() => setIsBillingDetailsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleBillingSave}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.billing.editModal.company}</label>
                                    <input
                                        type="text"
                                        value={billingDetails.company}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, company: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.billing.editModal.address}</label>
                                    <textarea
                                        value={billingDetails.address}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none h-24 resize-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">NIF</label>
                                        <input
                                            type="text"
                                            value={billingDetails.nif}
                                            onChange={(e) => setBillingDetails({ ...billingDetails, nif: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none font-mono"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">RCCM</label>
                                        <input
                                            type="text"
                                            value={billingDetails.rccm}
                                            onChange={(e) => setBillingDetails({ ...billingDetails, rccm: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.billing.editModal.email}</label>
                                    <input
                                        type="email"
                                        value={billingDetails.email}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsBillingDetailsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    {t.settings.team.inviteModal.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={billingStatus !== "idle"}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${billingStatus === "success"
                                        ? "bg-green-500 text-white"
                                        : "bg-[#0F4C5C] text-white hover:bg-[#0a3641]"
                                        }`}
                                >
                                    {billingStatus === "saving" ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            {t.settings.general.saving}
                                        </>
                                    ) : billingStatus === "success" ? (
                                        <>
                                            <CheckCircle size={16} />
                                            {t.settings.general.saved}
                                        </>
                                    ) : (
                                        t.settings.general.save
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function IntegrationSettings({ organizationId }: { organizationId: string | null }) {
    const { t } = useLanguage();
    const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [integrations, setIntegrations] = useState<OrganizationSettings['integrations']>({
        whatsapp: { enabled: false, quota_limit: 1000, quota_used: 0 },
        google_sheets: { enabled: false },
        calendar: { enabled: false }
    });

    useEffect(() => {
        if (!organizationId) return;
        const fetchSettings = async () => {
            const { data } = await supabase.from('organizations').select('settings').eq('id', organizationId).single();
            if (data?.settings?.integrations) {
                setIntegrations(prev => ({
                    ...prev,
                    ...data.settings.integrations
                }));
            }
        };
        fetchSettings();
    }, [organizationId]);

    const handleSave = async () => {
        if (!organizationId) return;
        setStatus("saving");

        // Fetch current settings first to merge
        const { data: currentData } = await supabase.from('organizations').select('settings').eq('id', organizationId).single();
        const currentSettings = currentData?.settings || {};

        const { error } = await supabase.from('organizations').update({
            settings: {
                ...currentSettings,
                integrations: integrations
            }
        }).eq('id', organizationId);

        if (error) {
            console.error("Error saving integrations:", error);
            setToast({ message: "Erreur lors de la sauvegarde", type: "error" });
            setStatus("idle");
        } else {
            setStatus("success");
            setToast({ message: t.settings.general.saved, type: "success" });
            setTimeout(() => setStatus("idle"), 2000);
        }
    };

    const toggleIntegration = (key: keyof NonNullable<OrganizationSettings['integrations']>) => {
        setIntegrations(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [key]: {
                    ...prev[key],
                    enabled: !prev[key].enabled
                }
            };
        });
    };

    return (
        <div className="max-w-2xl space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.integrations.title}</h2>
                <button
                    onClick={handleSave}
                    disabled={status !== "idle"}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${status === "success"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-[#0F4C5C] text-white hover:bg-[#0a3641]"
                        }`}
                >
                    {status === "saving" ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {t.settings.general.saving}
                        </>
                    ) : status === "success" ? (
                        <>
                            <CheckCircle size={16} />
                            {t.settings.general.saved}
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            {t.settings.general.save}
                        </>
                    )}
                </button>
            </div>

            {/* WhatsApp API Status */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${integrations?.whatsapp.enabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">WhatsApp Business API</h3>
                        <p className="text-sm text-gray-500">{t.settings.integrations.whatsappDesc}</p>
                    </div>
                    <div className="ml-auto">
                        {integrations?.whatsapp.enabled ? (
                            <button
                                onClick={() => toggleIntegration('whatsapp')}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold border border-green-100 hover:bg-red-50 hover:text-red-700 hover:border-red-100 transition-colors group"
                            >
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse group-hover:bg-red-500"></span>
                                <span className="group-hover:hidden">{t.settings.integrations.connected}</span>
                                <span className="hidden group-hover:block">Déconnecter</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => toggleIntegration('whatsapp')}
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                            >
                                Connecter
                            </button>
                        )}
                    </div>
                </div>
                {integrations?.whatsapp.enabled && (
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t.settings.integrations.quota}</div>
                            <div className="text-xl font-bold text-gray-900">{integrations.whatsapp.quota_used} <span className="text-sm text-gray-400 font-normal">/ {integrations.whatsapp.quota_limit}</span></div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t.settings.integrations.quality}</div>
                            <div className="text-xl font-bold text-green-600">{t.settings.integrations.excellent}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Money Exports */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t.settings.integrations.mobileMoney}</h3>
                        <p className="text-sm text-gray-500">{t.settings.integrations.mobileMoneyDesc}</p>
                    </div>
                    <div className="ml-auto">
                        <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm cursor-not-allowed">
                            {t.settings.integrations.comingSoon}
                        </button>
                    </div>
                </div>
            </div>

            {/* Google Sheets Sync */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${integrations?.google_sheets.enabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        <FileSpreadsheet size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t.settings.integrations.googleSheets}</h3>
                        <p className="text-sm text-gray-500">{t.settings.integrations.googleSheetsDesc}</p>
                    </div>
                    <div className="ml-auto">
                        <button
                            onClick={() => toggleIntegration('google_sheets')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${integrations?.google_sheets.enabled
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {integrations?.google_sheets.enabled ? "Déconnecter" : t.settings.integrations.connectGoogle}
                        </button>
                    </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex gap-2 items-start">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p>{t.settings.integrations.googleSheetsInfo}</p>
                </div>
            </div>

            {/* Calendar Sync */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${integrations?.calendar.enabled ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t.settings.integrations.calendar}</h3>
                        <p className="text-sm text-gray-500">{t.settings.integrations.calendarDesc}</p>
                    </div>
                    <div className="ml-auto">
                        <button
                            onClick={() => toggleIntegration('calendar')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${integrations?.calendar.enabled
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {integrations?.calendar.enabled ? "Déconnecter" : t.settings.integrations.connect}
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{t.settings.integrations.companyStrategy}</h3>
                <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{t.settings.integrations.premium}</span>
            </div>

            {/* Accounting & ERP */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t.settings.integrations.accounting}</h3>
                        <p className="text-sm text-gray-500">{t.settings.integrations.accountingDesc}</p>
                    </div>
                    <div className="ml-auto">
                        <button className="px-4 py-2 border border-gray-200 text-gray-400 rounded-lg font-bold text-sm cursor-not-allowed">
                            {t.settings.integrations.comingSoon}
                        </button>
                    </div>
                </div>
            </div>

            {/* Access Control (IoT) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                        <LockIcon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t.settings.integrations.accessControl}</h3>
                        <p className="text-sm text-gray-500">{t.settings.integrations.accessControlDesc}</p>
                    </div>
                    <div className="ml-auto">
                        <button className="px-4 py-2 border border-gray-200 text-gray-400 rounded-lg font-bold text-sm cursor-not-allowed">
                            {t.settings.integrations.comingSoon}
                        </button>
                    </div>
                </div>
            </div>

            {/* BI & Analytics */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t.settings.integrations.bi}</h3>
                        <p className="text-sm text-gray-500">{t.settings.integrations.biDesc}</p>
                    </div>
                    <div className="ml-auto">
                        <button className="px-4 py-2 border border-gray-200 text-gray-400 rounded-lg font-bold text-sm cursor-not-allowed">
                            {t.settings.integrations.comingSoon}
                        </button>
                    </div>
                </div>
            </div>

            {/* Timmy Hiring (Jaden) */}
            <div className="bg-gradient-to-r from-[#0F4C5C] to-[#0a3641] p-6 rounded-xl border border-[#0F4C5C] text-white relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{t.settings.integrations.hiring}</h3>
                            <span className="bg-[#FFC107] text-[#0F4C5C] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{t.settings.integrations.poweredBy}</span>
                        </div>
                        <p className="text-blue-100 text-sm mt-1">{t.settings.integrations.hiringDesc}</p>
                    </div>
                    <div className="ml-auto">
                        <button className="px-4 py-2 bg-white text-[#0F4C5C] rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm">
                            {t.settings.integrations.discover}
                        </button>
                    </div>
                </div>
            </div>

            {/* Webhook */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                        <Puzzle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t.settings.integrations.webhook}</h3>
                        <p className="text-sm text-gray-500">{t.settings.integrations.webhookDesc}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Callback URL</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="https://your-api.com/webhook" className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none font-mono text-sm" />
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">
                            Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileSettings() {
    const { t, language, setLanguage } = useLanguage();
    const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
    const [profile, setProfile] = useState({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        phoneCode: "+241",
        role: "",
        avatarUrl: ""
    });

    // Password change state
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Avatar upload state
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile({
                        id: data.id,
                        firstName: data.first_name || "",
                        lastName: data.last_name || "",
                        email: data.email || user.email || "",
                        phone: data.phone || "",
                        phoneCode: data.phone_code || "+241",
                        role: data.role || "",
                        avatarUrl: data.avatar_url || ""
                    });
                }
            }
        };
        fetchProfile();
    }, []);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setIsUploadingAvatar(true);

        try {
            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profile.id);

            if (updateError) {
                throw updateError;
            }

            // 4. Update Local State
            setProfile(prev => ({ ...prev, avatarUrl: publicUrl }));
            window.dispatchEvent(new Event('profile-updated')); // Notify TopNav
            setToast({ message: "Photo de profil mise à jour !", type: "success" });

        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            setToast({ message: "Erreur lors de l'upload. Vérifiez que le bucket 'avatars' existe et est public.", type: "error" });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("saving");

        try {
            // 1. Update Profile Data
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    first_name: profile.firstName,
                    last_name: profile.lastName,
                    phone: profile.phone,
                    phone_code: profile.phoneCode
                    // Email is usually managed via Auth, updating it here in profiles is fine for display but doesn't change auth email
                })
                .eq('id', profile.id);

            if (profileError) throw profileError;

            // 2. Update Password (if provided)
            if (newPassword) {
                if (newPassword.length < 6) {
                    throw new Error(t.updatePassword?.errors?.length || "Le mot de passe doit contenir au moins 6 caractères");
                }
                if (newPassword !== confirmPassword) {
                    throw new Error(t.updatePassword?.errors?.match || "Les mots de passe ne correspondent pas");
                }

                const { error: passwordError } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (passwordError) throw passwordError;
            }

            setStatus("success");
            setToast({ message: t.settings.general.saved, type: "success" });
            window.dispatchEvent(new Event('profile-updated')); // Notify TopNav

            // Clear password fields
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => setStatus("idle"), 2000);

        } catch (error: any) {
            console.error("Error saving profile:", error);
            setToast({ message: error.message || "Erreur lors de la sauvegarde", type: "error" });
            setStatus("idle");
        }
    };

    const getInitials = () => {
        return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || <User size={32} />;
    };

    return (
        <div className="max-w-2xl space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.profile.title}</h2>
                <button
                    onClick={handleSave}
                    disabled={status !== "idle"}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${status === "success"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-[#0F4C5C] text-white hover:bg-[#0a3641]"
                        }`}
                >
                    {status === "saving" ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {t.settings.general.saving}
                        </>
                    ) : status === "success" ? (
                        <>
                            <CheckCircle size={16} />
                            {t.settings.general.saved}
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            {t.settings.general.save}
                        </>
                    )}
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg overflow-hidden relative">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                getInitials()
                            )}

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>

                        <button
                            type="button"
                            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#0F4C5C] shadow-sm transition-colors z-10"
                        >
                            {isUploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={16} />}
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                            {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {profile.role === 'OWNER' ? t.settings.team.roles.owner :
                                profile.role === 'MANAGER' ? t.settings.team.roles.manager :
                                    profile.role === 'ACCOUNTANT' ? t.settings.team.roles.accountant :
                                        profile.role}
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-[#0F4C5C] font-bold mt-1 hover:underline"
                        >
                            Modifier la photo
                        </button>
                    </div>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.firstName}</label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.lastName}</label>
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                                    title="L'email ne peut pas être modifié ici"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.phone}</label>
                            <div className="flex gap-2">
                                <select
                                    value={profile.phoneCode}
                                    onChange={(e) => setProfile({ ...profile, phoneCode: e.target.value })}
                                    className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                                >
                                    <option value="+241">🇬🇦 +241</option>
                                    <option value="+33">🇫🇷 +33</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+221">🇸🇳 +221</option>
                                    <option value="+225">🇨🇮 +225</option>
                                    <option value="+237">🇨🇲 +237</option>
                                </select>
                                <div className="relative flex-1">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                        placeholder="074 00 00 00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Password Change Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">{t.settings.profile.security}</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.newPassword}</label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.confirmPassword}</label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                        Laissez vide si vous ne souhaitez pas modifier votre mot de passe.
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">{t.settings.profile.preferences}</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-gray-900">{t.settings.profile.language}</div>
                            <div className="text-xs text-gray-500">{t.settings.profile.languageDesc}</div>
                        </div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                            className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none text-sm font-medium"
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
