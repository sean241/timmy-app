"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MapPin,
    Users,
    Settings,
    LogOut,
    Calendar,
    List,
    Tablet,
    FileText,
    Smartphone,
    HelpCircle,
    MessageSquare,
    ThumbsUp,
    Heart
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";
import { useState } from "react";
import FeedbackModal from "./FeedbackModal";
import SupportModal from "./SupportModal";

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    // Import lazily or just at top
    // For this context we'll assume it's imported at top, but we need to add the import statement
    // handled by a separate edit if needed, or I can add it if I replaced the whole file. 
    // Since this is replace_file_content for a block, I will assume I can't add imports at the top easily 
    // unless I view the whole file or assume imports. 
    const DAILY_ITEMS = [
        { name: t.sidebar.nav.dashboard, href: "/admin/dashboard", icon: LayoutDashboard },
        { name: t.sidebar.nav.schedule, href: "/admin/planning", icon: Calendar },
        { name: t.sidebar.nav.timeEntries, href: "/admin/time-entries", icon: List },
    ];

    const RESOURCE_ITEMS = [
        { name: t.sidebar.nav.team, href: "/admin/employees", icon: Users },
        { name: t.sidebar.nav.kiosks, href: "/admin/terminals", icon: Tablet },
        { name: t.sidebar.nav.sites, href: "/admin/sites", icon: MapPin },
        { name: t.sidebar.nav.payroll, href: "/admin/reports", icon: FileText, disabled: true, badge: "SOON" },
    ];

    const SYSTEM_ITEMS = [
        { name: t.sidebar.nav.launchKiosk, href: "/kiosk", icon: Smartphone, external: true },
        { name: t.sidebar.nav.settings, href: "/admin/settings", icon: Settings },
    ];

    const SUPPORT_ITEMS = [
        { name: t.sidebar.nav.help, href: "/admin/help", icon: HelpCircle },
        { name: t.sidebar.nav.support, href: "#", icon: MessageSquare, action: () => setIsSupportOpen(true) },
        { name: t.sidebar.nav.feedback, href: "#", icon: ThumbsUp, action: () => setIsFeedbackOpen(true) },
        { name: t.sidebar.nav.refer, href: "/admin/refer", icon: Heart },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderNavItem = (item: { name: string; href: string; icon: any; external?: boolean; disabled?: boolean; badge?: string; action?: () => void }) => {
        const isActive = !item.disabled && item.href !== "#" && pathname.startsWith(item.href);
        const isExternal = item.external;

        if (item.action) {
            return (
                <button
                    key={item.name}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all group text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
                >
                    <item.icon size={18} className="text-gray-400 group-hover:text-gray-600" />
                    <span>{item.name}</span>
                </button>
            );
        }

        if (item.disabled) {
            return (
                <div key={item.href} className="flex items-center justify-between gap-3 px-3 py-2 rounded-md text-gray-500 cursor-not-allowed group hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3 opacity-70">
                        <item.icon size={18} />
                        <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                        <span className="text-[10px] font-extrabold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide shadow-sm animate-pulse">
                            🚀 {item.badge}
                        </span>
                    )}
                </div>
            )
        }

        return (
            <Link
                key={item.href}
                href={item.href}
                target={isExternal ? "_blank" : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all group text-sm font-medium ${isActive && !isExternal
                    ? "bg-[#E0F2F1] text-[#0F4C5C]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
            >
                <item.icon size={18} className={isActive && !isExternal ? "text-[#0F4C5C]" : "text-gray-400 group-hover:text-gray-600"} />
                <span>{item.name}</span>
            </Link>
        );
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-50 overflow-y-auto font-sans">
            {/* Logo */}
            <div className="p-6 shrink-0">
                <Link href="/admin/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <span className="font-bold text-2xl tracking-tight text-[#0F4C5C]">Timmy</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2F1] text-[#0F4C5C] uppercase tracking-wider">PRO</span>
                </Link>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 px-4 space-y-8 py-4">
                {/* Block A: Le Quotidien */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.sidebar.groups.home}</h3>
                    <div className="space-y-0.5">
                        {DAILY_ITEMS.map(renderNavItem)}
                    </div>
                </div>

                {/* Block B: La Gestion */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.sidebar.groups.people}</h3>
                    <div className="space-y-0.5">
                        {RESOURCE_ITEMS.map(renderNavItem)}
                    </div>
                </div>

                {/* Block C: Le Système */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.sidebar.groups.system}</h3>
                    <div className="space-y-0.5">
                        {SYSTEM_ITEMS.map(renderNavItem)}
                    </div>
                </div>

                {/* Block D: Support & Experience */}
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t.sidebar.groups.support}</h3>
                    <div className="space-y-0.5">
                        {SUPPORT_ITEMS.map(renderNavItem)}
                    </div>
                </div>
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = "/admin";
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all text-sm font-medium text-left"
                >
                    <LogOut size={16} />
                    <span>{t.sidebar.logout}</span>
                </button>
            </div>

            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        </aside>
    );
}
