"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Calendar, Gift, ChevronDown, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";

export default function TopNav() {
    const { t } = useLanguage();
    const [profile, setProfile] = useState<{
        firstName: string;
        lastName: string;
        role: string;
        organizationId: string;
        avatarUrl: string;
    } | null>(null);

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
                        firstName: data.first_name || "",
                        lastName: data.last_name || "",
                        role: data.role || "",
                        organizationId: data.organization_id || "",
                        avatarUrl: data.avatar_url || ""
                    });
                }
            }
        };

        fetchProfile();

        const handleProfileUpdate = () => {
            fetchProfile();
        };

        window.addEventListener('profile-updated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate);
        };
    }, []);

    const getInitials = () => {
        if (!profile) return "";
        return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'OWNER': return t.settings.team.roles.owner;
            case 'MANAGER': return t.settings.team.roles.manager;
            case 'ACCOUNTANT': return t.settings.team.roles.accountant;
            default: return role;
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0F4C5C] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search for shortcuts, help, and people..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0F4C5C] focus:border-[#0F4C5C] transition-all placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-4">
                <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                    <Calendar size={20} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                    <Gift size={20} />
                </button>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                <Link href="/admin/settings" className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition-colors">
                    <div className="text-right hidden md:block">
                        {profile ? (
                            <>
                                <p className="text-sm font-bold text-gray-900">{profile.firstName} {profile.lastName}</p>
                                <p className="text-xs text-gray-500">{getRoleLabel(profile.role)}</p>
                            </>
                        ) : (
                            <div className="space-y-1">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                            </div>
                        )}
                    </div>

                    <div className="w-9 h-9 rounded-full bg-[#0F4C5C] flex items-center justify-center text-white font-bold text-xs shadow-sm border-2 border-white ring-1 ring-gray-100 overflow-hidden">
                        {profile ? (
                            profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                getInitials()
                            )
                        ) : (
                            <User size={16} />
                        )}
                    </div>

                    <ChevronDown size={16} className="text-gray-400" />
                </Link>
            </div>
        </header>
    );
}
