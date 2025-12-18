"use client";

import { useState, useEffect } from "react";
import {
    Building2, Users, Bell, CreditCard, Puzzle, User, FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";

import GeneralSettings from "./components/GeneralSettings";
import TeamSettings from "./components/TeamSettings";
import NotificationSettings from "./components/NotificationSettings";
import BillingSettings from "./components/BillingSettings";
import IntegrationSettings from "./components/IntegrationSettings";
import SystemLogs from "./components/SystemLogs";
import ProfileSettings from "./components/ProfileSettings";

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
                <div className="flex-1 overflow-y-auto p-8 w-full">
                    <div className="w-full h-full"> {/* Ensure children can take full width */}
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
        </div>
    );
}
