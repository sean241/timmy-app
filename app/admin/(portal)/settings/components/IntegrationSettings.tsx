import { useState, useEffect } from "react";
import { Loader2, Save, Smartphone, CheckCircle, CreditCard, FileSpreadsheet, AlertCircle, Calendar, Calculator, LockIcon, BarChart3, UserPlus, Puzzle, Search, Filter, ExternalLink, CloudLightning, Database, Lock, Settings, MessageSquare, Briefcase, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";
import Toast from "@/components/Toast";
import { OrganizationSettings } from "@/types/settings";

type IntegrationCategory = 'all' | 'communication' | 'productivity' | 'finance' | 'developer';

export default function IntegrationSettings({ organizationId }: { organizationId: string | null }) {
    const { t } = useLanguage();
    const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [integrations, setIntegrations] = useState<OrganizationSettings['integrations']>({
        whatsapp: { enabled: true, quota_limit: 1000, quota_used: 124 },
        google_sheets: { enabled: true },
        calendar: { enabled: true }
    });

    // UX State
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<IntegrationCategory>('all');

    useEffect(() => {
        if (!organizationId) return;
        const fetchSettings = async () => {
            const { data } = await supabase.from('organizations').select('settings').eq('id', organizationId).single();
            if (data?.settings?.integrations) {
                // If it's a "simulation", we might want to preserve the mocked 'enabled' states for demo purposes if they are not in DB
                // For now, let's assume valid DB data overrides defaults, but if DB is empty for a key, we keep default.
                // However, user asked for "simulation" of configuration so I will force some enabled states in the initial state above and merge carefully.
                // Actually, standard behavior is DB overrides local defaults.
                // But for "simulation" request, I will just ensure the rendered list has them "enabled" in strict sense if the user wants to see what it looks like "active".
                // The prompt says "simule fonctionnement/configuration", so I will set them to enabled in the initial state or mock the data.
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
            // Handle potentially undefined keys by defaulting
            const current = prev[key] || { enabled: false };
            return {
                ...prev,
                [key]: {
                    ...current,
                    enabled: !current.enabled
                }
            };
        });
    };

    // --- Integration Definitions for Rendering ---
    const allIntegrations = [
        {
            id: 'whatsapp',
            title: t.settings.integrations.whatsapp.title,
            desc: t.settings.integrations.whatsapp.desc,
            icon: Smartphone,
            category: 'communication',
            enabled: integrations?.whatsapp?.enabled ?? true, // Simulating enabled
            color: 'green',
            initials: 'Wa',
            renderDetails: () => (
                (integrations?.whatsapp?.enabled ?? true) && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t.settings.integrations.whatsapp.quota}</div>
                            <div className="text-xl font-bold text-gray-900">{integrations?.whatsapp?.quota_used || 124} <span className="text-sm text-gray-400 font-normal">/ {integrations?.whatsapp?.quota_limit || 1000}</span></div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t.settings.integrations.whatsapp.quality}</div>
                            <div className="text-xl font-bold text-green-600">{t.settings.integrations.whatsapp.excellent}</div>
                        </div>
                    </div>
                )
            )
        },
        {
            id: 'exports_mobile_money',
            title: t.settings.integrations.mobileMoneyExports.title,
            desc: t.settings.integrations.mobileMoneyExports.desc,
            icon: CreditCard,
            category: 'finance',
            enabled: false,
            color: 'orange',
            initials: 'Em',
            comingSoon: true
        },
        {
            id: 'google_sheets',
            title: t.settings.integrations.googleSheets.title,
            desc: t.settings.integrations.googleSheets.desc,
            icon: FileSpreadsheet,
            category: 'productivity',
            enabled: true, // Simulating enabled
            color: 'green',
            initials: 'Gs',
            renderDetails: () => (
                <div className="mt-3 bg-green-50 p-3 rounded-lg text-xs text-green-800 flex gap-2 items-start border border-green-100">
                    <CheckCircle size={14} className="shrink-0 mt-0.5 text-green-600" />
                    <div>
                        <p className="font-bold mb-1">{t.settings.integrations.googleSheets.activeTitle}</p>
                        <p>{t.settings.integrations.googleSheets.lastExport.replace('{time}', 'Aujourd\'hui à 14:30')}</p>
                        <p className="text-green-600 underline mt-1 cursor-pointer">{t.settings.integrations.googleSheets.viewSheet}</p>
                    </div>
                </div>
            )
        },
        {
            id: 'mobile_money',
            title: 'Mobile Money',
            desc: 'Paiement instantané des acomptes et salaires via Orange Money, MTN, Wave ou Airtel.',
            icon: CreditCard,
            category: 'finance',
            enabled: false,
            color: 'orange',
            initials: 'Mm',
            comingSoon: true
        },
        {
            id: 'sage_paie',
            title: t.settings.integrations.sage.title,
            desc: t.settings.integrations.sage.desc,
            icon: Calculator,
            category: 'finance',
            enabled: true, // Simulating enabled
            color: 'green',
            initials: 'Sa',
            renderDetails: () => (
                <div className="mt-3 bg-gray-50 p-3 rounded-lg text-xs text-gray-700 border border-gray-100">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold text-gray-900">{t.settings.integrations.sage.version}</span>
                        <span>SAGE 100c V8</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold text-gray-900">{t.settings.integrations.sage.lastExport}</span>
                        <span>30 Nov 2024</span>
                    </div>
                </div>
            )
        },
        {
            id: 'excel_csv',
            title: t.settings.integrations.excel.title,
            desc: t.settings.integrations.excel.desc,
            icon: FileText,
            category: 'productivity',
            enabled: true, // Toujours actif
            color: 'green',
            initials: 'Ex',
            alwaysActive: true
        },
        {
            id: 'cegid_xrp',
            title: t.settings.integrations.cegid.title,
            desc: t.settings.integrations.cegid.desc,
            icon: Calculator,
            category: 'finance',
            enabled: false,
            color: 'gray',
            initials: 'Ce',
            comingSoon: true
        },
        {
            id: 'odoo_rh',
            title: t.settings.integrations.odoo.title,
            desc: t.settings.integrations.odoo.desc,
            icon: Briefcase,
            category: 'productivity',
            enabled: false,
            color: 'purple',
            initials: 'Od',
            comingSoon: true
        },
        {
            id: 'sms_gateway',
            title: t.settings.integrations.sms.title,
            desc: t.settings.integrations.sms.desc,
            icon: MessageSquare,
            category: 'communication',
            enabled: true, // Simulating enabled
            color: 'blue',
            initials: 'Sms',
            renderDetails: () => (
                <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">{t.settings.integrations.sms.balance}</span>
                        <span className="text-sm font-bold text-blue-600">4,250 SMS</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>
            )
        },
        {
            id: 'power_bi',
            title: t.settings.integrations.powerbi.title,
            desc: t.settings.integrations.powerbi.desc,
            icon: BarChart3,
            category: 'productivity',
            enabled: false,
            color: 'yellow',
            initials: 'Pb',
            comingSoon: true
        },
        {
            id: 'google_drive',
            title: t.settings.integrations.googleDrive.title,
            desc: t.settings.integrations.googleDrive.desc,
            icon: CloudLightning,
            category: 'productivity',
            enabled: true, // Simulating enabled
            color: 'blue',
            initials: 'Gd',
            renderDetails: () => (
                <div className="mt-3 bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                    <p className="font-bold flex items-center gap-2">
                        <CheckCircle size={12} className="text-blue-600" />
                        {t.settings.integrations.googleDrive.connectedTo.replace('{name}', 'RH / Archives 2024')}
                    </p>
                    <p className="mt-1 pl-5 opacity-80">{t.settings.integrations.googleDrive.syncCount.replace('{count}', '124')}</p>
                </div>
            )
        },
        {
            id: 'microsoft_teams',
            title: t.settings.integrations.teams.title,
            desc: t.settings.integrations.teams.desc,
            icon: Briefcase,
            category: 'communication',
            enabled: false,
            color: 'purple',
            initials: 'Mt',
            comingSoon: true
        },
        {
            id: 'timmy_hiring',
            title: 'Timmy Hiring',
            desc: 'Besoin de renforts ? Trouvez des profils qualifiés en 1 clic.',
            icon: UserPlus,
            category: 'productivity', // Special category?
            enabled: false,
            color: 'teal',
            initials: 'Th',
            comingSoon: true
        },
        {
            id: 'google_calendar',
            title: 'Google Calendar',
            desc: 'Synchronisation automatique des shifts de l\'équipe directement dans les agendas Google personnels.',
            icon: Calendar,
            category: 'productivity',
            enabled: integrations?.calendar?.enabled ?? true, // Simulating enabled defaults if undefined
            color: 'blue',
            initials: 'Gc'
        },
        {
            id: 'outlook_calendar',
            title: t.settings.integrations.outlook.title,
            desc: t.settings.integrations.outlook.desc,
            icon: Calendar,
            category: 'productivity',
            enabled: true, // Simulating enabled
            color: 'blue',
            initials: 'Oc',
            renderDetails: () => (
                <div className="mt-3 bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="font-medium">{t.settings.integrations.outlook.syncActive}</span>
                </div>
            )
        }
    ];

    const filteredIntegrations = allIntegrations.filter(integration => {
        const matchesSearch = integration.title.toLowerCase().includes(searchQuery.toLowerCase()) || integration.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || integration.category === activeCategory;
        // Hiring is special, maybe show it everywhere or specific
        return matchesSearch && matchesCategory;
    });

    const categories: { id: IntegrationCategory, label: string }[] = [
        { id: 'all', label: t.settings.integrations.categories.all },
        { id: 'communication', label: t.settings.integrations.categories.communication },
        { id: 'productivity', label: t.settings.integrations.categories.productivity },
        { id: 'finance', label: t.settings.integrations.categories.finance },
        { id: 'developer', label: t.settings.integrations.categories.developer },
    ];

    const getColorClass = (color: string) => {
        switch (color) {
            case 'green': return 'bg-green-500';
            case 'blue': return 'bg-blue-500';
            case 'orange': return 'bg-orange-500';
            case 'teal': return 'bg-[#0F4C5C]';
            case 'purple': return 'bg-purple-600';
            case 'yellow': return 'bg-yellow-500 text-black'; // Added yellow for PowerBI
            default: return 'bg-gray-700';
        }
    };

    return (
        <div className="max-w-full space-y-8 p-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header / Actions - Styled like mockup */}
            <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-[#0F4C5C]">{t.settings.integrations.title}</h2>
                <p className="text-gray-500 mt-2 text-lg">{t.settings.integrations.subtitle}</p>
            </div>

            {/* Filters & Search - Styled like mockup */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t.settings.integrations.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F4C5C] outline-none text-sm shadow-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                ${activeCategory === cat.id
                                    ? "bg-[#0F4C5C] text-white shadow-md"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Integrations Grid - Styled like mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200 flex flex-col h-full group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            {/* Logo Placeholder - Using Initials & Specific Color */}
                            <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${getColorClass(item.color)}`}
                            >
                                {item.initials}
                            </div>

                            {item.enabled || item.alwaysActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    {t.settings.integrations.status.active}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                                    {t.settings.integrations.status.inactive}
                                </span>
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.desc}</p>
                        </div>

                        {item.renderDetails && item.renderDetails()}

                        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                            {item.alwaysActive ? (
                                <span className="text-xs text-slate-400 font-medium italic animate-pulse">
                                    {t.settings.integrations.status.alwaysActive}
                                </span>
                            ) : item.comingSoon ? (
                                <span className="text-sm font-medium text-gray-400 cursor-not-allowed flex items-center gap-2">
                                    {t.settings.integrations.status.comingSoon}
                                </span>
                            ) : (
                                <button
                                    onClick={() => toggleIntegration(item.id as any)}
                                    className={`text-sm font-medium flex items-center gap-2 transition-colors ${item.enabled ? 'text-[#0F4C5C] hover:text-[#0a3641]' : 'text-gray-600 hover:text-[#0F4C5C]'}`}
                                >
                                    {item.enabled ? (
                                        <>
                                            <Settings size={16} />
                                            {t.settings.integrations.actions.configure}
                                        </>
                                    ) : (
                                        <>
                                            <ExternalLink size={16} />
                                            {t.settings.integrations.actions.learnMore}
                                        </>
                                    )}
                                </button>
                            )}

                            {!item.comingSoon && !item.alwaysActive && (
                                <button
                                    onClick={() => toggleIntegration(item.id as any)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:ring-offset-2 ${item.enabled ? 'bg-[#0F4C5C]' : 'bg-gray-200'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* "Request Integration" Card */}
                <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center h-full min-h-[240px] hover:border-[#FFC107] hover:bg-yellow-50/10 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <div className="text-slate-400 group-hover:text-[#FFC107]">
                            <CloudLightning size={24} />
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-700 mb-2">{t.settings.integrations.missingTool.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{t.settings.integrations.missingTool.desc}</p>
                    <span className="text-sm font-bold text-[#0F4C5C] group-hover:underline">{t.settings.integrations.missingTool.action}</span>
                </div>
            </div>

            {/* API Access Section */}
            <div className="bg-[#0F4C5C] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl mt-12">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Database size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-[#FFC107] p-1.5 rounded text-[#0F4C5C]">
                                <Lock size={18} />
                            </div>
                            <h3 className="text-xl font-bold">{t.settings.integrations.api.title}</h3>
                        </div>
                        <p className="text-slate-300 max-w-xl">
                            {t.settings.integrations.api.desc}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors border border-white/20 whitespace-nowrap">
                            {t.settings.integrations.api.docs}
                        </button>
                        <button className="px-6 py-3 bg-[#FFC107] hover:bg-[#FFD54F] text-[#0F4C5C] rounded-xl font-bold transition-colors shadow-lg whitespace-nowrap">
                            {t.settings.integrations.api.generateKey}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
