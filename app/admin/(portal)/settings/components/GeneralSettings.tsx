import { useState, useRef, useEffect } from "react";
import { CheckCircle, Save, Loader2, Building2, Upload } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";
import Toast from "@/components/Toast";
import { OrganizationSettings } from "@/types/settings";
import {
    COMPANY_SECTORS, COUNTRIES, PAYROLL_CYCLES, EXPORT_FORMATS,
    LATENESS_TOLERANCES, ROUNDING_RULES, AUTO_BREAK_DURATION,
    WEEK_START_DAYS, DAYS_OF_WEEK
} from "@/lib/settings-options";

export default function GeneralSettings({ organizationId }: { organizationId: string | null }) {
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

        } catch (error: unknown) {
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
                            <Image
                                src={settings.general.logo_url}
                                alt="Company Logo"
                                fill
                                className="object-cover"
                                unoptimized
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
