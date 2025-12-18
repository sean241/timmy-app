import { useState, useEffect } from "react";
import { Loader2, Mail, Smartphone, Save, CheckCircle, AlertCircle, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";
import Toast from "@/components/Toast";

export default function NotificationSettings({ organizationId }: { organizationId: string | null }) {
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
