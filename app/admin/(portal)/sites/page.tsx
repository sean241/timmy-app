"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, MapPin, MoreVertical, Users, Tablet, ArrowRight, Building2, X, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Toast from "@/components/Toast";
import { useLanguage } from "@/app/context/LanguageContext";

interface Site {
    id: string;
    organization_id: string;
    name: string;
    city: string | null;
    address: string | null;
    is_active: boolean;
    activation_code?: string;
    employees?: { id: string }[];
    kiosks?: { status: string }[];
}

export default function SitesPage() {
    const { t } = useLanguage();
    // Data
    const [sites, setSites] = useState<Site[]>([]);
    const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        city: "Libreville",
        address: "",
        timezone: "Africa/Libreville",
        geofencing: false
    });

    // Fetch User & Organization
    useEffect(() => {
        const fetchOrg = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .single();

                if (profile?.organization_id) {
                    setOrgId(profile.organization_id);
                }
            }
        };
        fetchOrg();
    }, []);

    // Fetch Sites
    useEffect(() => {
        if (orgId) {
            fetchSites();
        }
    }, [orgId]);

    const fetchSites = async () => {
        setIsFetching(true);
        try {
            const { data, error } = await supabase
                .from('sites')
                .select('*, employees(id), kiosks(status)')
                .eq('organization_id', orgId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Add mock activation code for UI
                const sitesWithCode = data.map(site => ({
                    ...site,
                    activation_code: site.id.substring(0, 8).toUpperCase()
                }));
                setSites(sitesWithCode);
            }
        } catch (error) {
            console.error("Error fetching sites:", error);
            setToast({ message: t.sites.toast.fetchError, type: "error" });
        } finally {
            setIsFetching(false);
        }
    };

    const filteredSites = sites.filter(site => {
        if (activeTab === "active") return site.is_active;
        return !site.is_active;
    });

    const handleOpenCreate = () => {
        setEditingSiteId(null);
        setFormData({ name: "", city: "Libreville", address: "", timezone: "Africa/Libreville", geofencing: false });
        setShowModal(true);
        setActiveMenuId(null);
    };

    const handleOpenEdit = (site: Site) => {
        setEditingSiteId(site.id);
        setFormData({
            name: site.name,
            city: site.city || "Libreville",
            address: site.address || "",
            timezone: "Africa/Libreville", // Default as it's not in DB
            geofencing: false // Default as it's not in DB
        });
        setShowModal(true);
        setActiveMenuId(null);
    };

    const handleArchive = (site: Site) => {
        setConfirmModal({
            isOpen: true,
            title: site.is_active ? t.sites.confirm.archiveTitle : t.sites.confirm.restoreTitle,
            message: site.is_active
                ? t.sites.confirm.archiveMsg.replace("{name}", site.name)
                : t.sites.confirm.restoreMsg.replace("{name}", site.name),
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('sites')
                        .update({ is_active: !site.is_active })
                        .eq('id', site.id);

                    if (error) throw error;
                    fetchSites();
                    setActiveMenuId(null);
                    setToast({ message: site.is_active ? t.sites.toast.archiveSuccess : t.sites.toast.restoreSuccess, type: "success" });
                } catch (error) {
                    console.error("Error updating site:", error);
                    setToast({ message: t.sites.toast.statusError, type: "error" });
                } finally {
                    setConfirmModal(null);
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId) return;

        setIsLoading(true);
        try {
            if (editingSiteId) {
                // Update
                const { error } = await supabase
                    .from('sites')
                    .update({
                        name: formData.name,
                        city: formData.city,
                        address: formData.address,
                        // gps_lat/lng would go here if we had geofencing
                    })
                    .eq('id', editingSiteId);

                if (error) throw error;
                setToast({ message: t.sites.toast.updateSuccess, type: "success" });
            } else {
                // Create
                const { error } = await supabase
                    .from('sites')
                    .insert({
                        organization_id: orgId,
                        name: formData.name,
                        city: formData.city,
                        address: formData.address,
                        is_active: true
                    });

                if (error) throw error;
                setToast({ message: t.sites.toast.createSuccess, type: "success" });
            }
            setShowModal(false);
            fetchSites();
        } catch (error) {
            console.error("Failed to save site", error);
            setToast({ message: t.sites.toast.saveError, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8" onClick={() => setActiveMenuId(null)}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t.sites.title}</h1>
                    <p className="text-gray-500 mt-1">{t.sites.desc}</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); handleOpenCreate(); }}
                    className="bg-[#FFC107] text-[#0F4C5C] px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-[#FFD54F] transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    {t.sites.newSite}
                </button>
            </div>

            {/* Tabs & Filters */}
            <div className="border-b border-gray-200 flex items-center gap-8">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "active"
                        ? "border-[#0F4C5C] text-[#0F4C5C]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    {t.sites.active}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "active" ? "bg-[#0F4C5C]/10 text-[#0F4C5C]" : "bg-gray-100 text-gray-600"
                        }`}>
                        {sites.filter(s => s.is_active).length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("archived")}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === "archived"
                        ? "border-[#0F4C5C] text-[#0F4C5C]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    {t.sites.archived}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === "archived" ? "bg-[#0F4C5C]/10 text-[#0F4C5C]" : "bg-gray-100 text-gray-600"
                        }`}>
                        {sites.filter(s => !s.is_active).length}
                    </span>
                </button>
            </div>

            {/* Sites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isFetching && Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 animate-pulse">
                        <div className="bg-gray-200 p-4 h-[88px]"></div>
                        <div className="p-5 space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="w-4 h-4 bg-gray-200 rounded shrink-0"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}

                {/* Create New Site Card (Only in Active Tab) */}
                {!isFetching && activeTab === "active" && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleOpenCreate(); }}
                        className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0F4C5C] hover:bg-gray-50 transition-all group cursor-pointer bg-gray-50/30"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#0F4C5C]/10 group-hover:text-[#0F4C5C] transition-colors mb-4">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold text-gray-500 group-hover:text-[#0F4C5C] transition-colors">{t.sites.createCard}</span>
                    </button>
                )}

                {!isFetching && filteredSites.map((site) => (
                    <div key={site.id} className="bg-white rounded-xl overflow-visible shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative flex flex-col h-full">
                        {/* Card Header */}
                        <div className="bg-[#0F4C5C] p-4 flex items-start justify-between rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white backdrop-blur-sm">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-tight">{site.name}</h3>
                                    {(site.city || site.address) && (
                                        <p className="text-xs text-teal-200 font-medium mt-0.5 truncate max-w-[150px]">
                                            {site.city || site.address}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === site.id ? null : site.id);
                                    }}
                                    className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {/* Dropdown Menu */}
                                {activeMenuId === site.id && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(site); }}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            {t.sites.edit}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleArchive(site); }}
                                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            {site.is_active ? t.sites.archive : t.sites.restore}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-6 flex-1">
                            {/* Address */}
                            <div className="flex items-start gap-3 text-gray-600">
                                <MapPin size={18} className="mt-0.5 text-gray-400 shrink-0" />
                                <p className="text-sm leading-relaxed">
                                    {site.address || t.sites.noAddress}
                                    {site.city && site.address && `, ${site.city}`}
                                    {site.city && !site.address && site.city}
                                </p>
                            </div>

                            {/* Indicators */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                    <Users size={14} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {site.employees?.length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                    <Tablet size={14} className="text-gray-400" />
                                    <div className={`w-2 h-2 rounded-full ${site.kiosks?.some(k => k.status === 'ONLINE') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {site.kiosks?.some(k => k.status === 'ONLINE') ? 'Online' : t.sites.offline}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                            <Link href={`/admin/planning?siteId=${site.id}`} className="flex items-center gap-2 text-sm font-bold text-[#0F4C5C] hover:underline">
                                {t.sites.viewSchedule} <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State (Only for Archived tab) */}
                {!isFetching && filteredSites.length === 0 && activeTab !== "active" && (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{t.sites.noArchived}</h3>
                        <p className="text-gray-500 mb-6">
                            {t.sites.archivedDesc}
                        </p>
                    </div>
                )}
            </div>

            {/* Add/Edit Site Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingSiteId ? t.sites.modal.editTitle : t.sites.modal.newTitle}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">{t.sites.modal.name} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                    placeholder={t.sites.modal.namePlaceholder}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">{t.sites.modal.city} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                    placeholder={t.sites.modal.cityPlaceholder}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">{t.sites.modal.address} <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all resize-none h-24"
                                    placeholder={t.sites.modal.addressPlaceholder}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">{t.sites.modal.timezone}</label>
                                    <select
                                        value={formData.timezone}
                                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 outline-none"
                                    >
                                        <option value="Africa/Libreville">Gabon (GMT+1)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">{t.sites.modal.geofencing}</label>
                                    <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-between cursor-not-allowed">
                                        <span className="text-sm">{t.sites.modal.disabled}</span>
                                        <span className="text-[10px] font-bold bg-gray-200 px-2 py-1 rounded text-gray-500">{t.sites.modal.soon}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {t.sites.modal.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-[#0F4C5C] text-white rounded-lg font-bold hover:bg-[#0a3641] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                                    {isLoading ? t.sites.modal.saving : (editingSiteId ? t.sites.modal.update : t.sites.modal.create)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal?.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-gray-500 mb-6">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {t.sites.confirm.cancel}
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 px-4 py-3 bg-[#0F4C5C] text-white rounded-lg font-bold hover:bg-[#0a3641] transition-colors shadow-sm"
                                >
                                    {t.sites.confirm.confirm}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
