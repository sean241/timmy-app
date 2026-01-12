"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Tablet, MoreVertical, Wifi, WifiOff, X, Loader2, RefreshCw, Trash2, Smartphone, AlertTriangle, Camera, CreditCard, PenTool, Info } from "lucide-react";
import Toast from "@/components/Toast";
import Tooltip from "@/components/Tooltip";
import { useLanguage } from "@/app/context/LanguageContext";

interface Kiosk {
    id: string;
    organization_id: string;
    site_id: string | null;
    name: string;
    device_id: string | null;
    pairing_code: string | null;
    require_photo: boolean;
    require_badge_scan: boolean;
    require_signature: boolean;
    status: "ONLINE" | "OFFLINE" | "PENDING" | "REVOKED";
    last_heartbeat_at: string | null;
    created_at: string;
    sites?: {
        name: string;
    };
}

interface Site {
    id: string;
    name: string;
    is_active: boolean;
}

export default function KiosksPage() {
    const { t } = useLanguage();
    const [kiosks, setKiosks] = useState<Kiosk[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingKioskId, setEditingKioskId] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [pairingModal, setPairingModal] = useState<{ isOpen: boolean; kiosk: Kiosk | null }>({ isOpen: false, kiosk: null });
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        site_id: "",
        require_photo: true,
        require_badge_scan: false,
        require_signature: false
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

    // Fetch Data
    useEffect(() => {
        if (orgId) {
            fetchKiosks();
            fetchSites();
        }
    }, [orgId]);

    const fetchKiosks = async () => {
        setIsFetching(true);
        try {
            const { data, error } = await supabase
                .from('kiosks')
                .select('*, sites(name)')
                .eq('organization_id', orgId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setKiosks(data || []);
        } catch (error) {
            console.error("Error fetching kiosks:", error);
            setToast({ message: t.kiosks.toast.fetchError, type: "error" });
        } finally {
            setIsFetching(false);
        }
    };

    const fetchSites = async () => {
        try {
            const { data, error } = await supabase
                .from('sites')
                .select('id, name, is_active')
                .eq('organization_id', orgId)
                .order('name', { ascending: true });

            if (error) throw error;
            setSites(data || []);
        } catch (error) {
            console.error("Error fetching sites:", error);
        }
    };

    const handleOpenCreate = () => {
        setEditingKioskId(null);
        setFormData({
            name: "",
            site_id: sites.length > 0 ? sites[0].id : "",
            require_photo: true,
            require_badge_scan: false,
            require_signature: false
        });
        setShowModal(true);
        setActiveMenuId(null);
    };

    const handleOpenEdit = (kiosk: Kiosk) => {
        setEditingKioskId(kiosk.id);
        setFormData({
            name: kiosk.name,
            site_id: kiosk.site_id || "",
            require_photo: kiosk.require_photo,
            require_badge_scan: kiosk.require_badge_scan,
            require_signature: kiosk.require_signature
        });
        setShowModal(true);
        setActiveMenuId(null);
    };

    const handleOpenPairing = (kiosk: Kiosk) => {
        setPairingModal({ isOpen: true, kiosk });
    };

    const generatePairingCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId) return;

        setIsLoading(true);
        try {
            if (editingKioskId) {
                // Update
                const { error } = await supabase
                    .from('kiosks')
                    .update({
                        name: formData.name,
                        site_id: formData.site_id || null,
                        require_photo: formData.require_photo,
                        require_badge_scan: formData.require_badge_scan,
                        require_signature: formData.require_signature
                    })
                    .eq('id', editingKioskId);

                if (error) throw error;
                setToast({ message: t.kiosks.toast.updateSuccess, type: "success" });
                setShowModal(false);
            } else {
                // Create
                const newCode = generatePairingCode();
                const { data, error } = await supabase
                    .from('kiosks')
                    .insert({
                        organization_id: orgId,
                        name: formData.name,
                        site_id: formData.site_id || null,
                        require_photo: formData.require_photo,
                        require_badge_scan: formData.require_badge_scan,
                        require_signature: formData.require_signature,
                        pairing_code: newCode,
                        status: 'PENDING'
                    })
                    .select()
                    .single();

                if (error) throw error;
                setToast({ message: t.kiosks.toast.createSuccess, type: "success" });
                setShowModal(false);

                // Open Pairing Modal with the new kiosk
                if (data) {
                    setPairingModal({ isOpen: true, kiosk: data as Kiosk });
                }
            }
            fetchKiosks();
        } catch (error) {
            console.error("Failed to save kiosk", error);
            setToast({ message: t.kiosks.toast.error, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async (id?: string) => {
        setIsFetching(true);
        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchKiosks();
        setToast({
            message: id ? "Terminal synchronisé avec succès" : "Tous les terminaux ont été synchronisés",
            type: "success"
        });
        setIsFetching(false);
        setActiveMenuId(null);
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: t.kiosks.confirm.deleteTitle,
            message: t.kiosks.confirm.deleteMsg,
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('kiosks')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    setToast({ message: t.kiosks.toast.deleteSuccess, type: "success" });
                    fetchKiosks();
                } catch (error) {
                    console.error("Error deleting kiosk:", error);
                    setToast({ message: t.kiosks.toast.error, type: "error" });
                } finally {
                    setConfirmModal(null);
                }
            }
        });
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

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t.kiosks.title}</h1>
                    <p className="text-gray-500 mt-1">{t.kiosks.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleSync(); }}
                        className="p-3 rounded-lg border-2 border-[#0F4C5C] text-[#0F4C5C] hover:bg-[#0F4C5C]/5 transition-colors"
                        title={t.kiosks.syncAll}
                    >
                        <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleOpenCreate(); }}
                        className="bg-[#FFB703] text-[#023047] px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-[#ffc529] transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        {t.kiosks.newKiosk}
                    </button>
                </div>
            </div>

            {/* Kiosks Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                {kiosks.length === 0 && !isFetching ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Tablet size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{t.kiosks.noKiosks}</h3>
                        <p className="text-gray-500 mb-6">{t.kiosks.startAdding}</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleOpenCreate(); }}
                            className="text-[#0F4C5C] font-bold hover:underline"
                        >
                            {t.kiosks.createKiosk}
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                    <th className="px-6 py-4">{t.kiosks.modal.name}</th>
                                    <th className="px-6 py-4">{t.kiosks.table.pairingCode}</th>
                                    <th className="px-6 py-4">{t.kiosks.modal.security}</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Synchro</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {kiosks.map((kiosk) => {
                                    // Status Logic: Offline if > 5min silence, unless Pending/Revoked
                                    const isRecent = kiosk.last_heartbeat_at && (new Date().getTime() - new Date(kiosk.last_heartbeat_at).getTime() < 5 * 60 * 1000);
                                    let displayStatus: "ONLINE" | "OFFLINE" | "PENDING" | "REVOKED" = kiosk.status;
                                    if (kiosk.status !== 'PENDING' && kiosk.status !== 'REVOKED') {
                                        // Trust heartbeat for Online/Offline availability
                                        displayStatus = isRecent ? 'ONLINE' : 'OFFLINE';
                                    }

                                    return (
                                        <tr key={kiosk.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${displayStatus === 'ONLINE' ? 'bg-green-100 text-green-600' :
                                                        displayStatus === 'OFFLINE' ? 'bg-gray-100 text-gray-500' :
                                                            'bg-yellow-100 text-yellow-600'
                                                        }`}>
                                                        <Tablet size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{kiosk.name}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Smartphone size={12} />
                                                            {kiosk.sites?.name || "No Site"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors group/code"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenPairing(kiosk); }}
                                                    title="Cliquez pour afficher le code de jumelage"
                                                >
                                                    <span className="font-mono font-bold text-gray-700 tracking-widest text-sm">
                                                        ••••••
                                                    </span>
                                                    <Wifi size={14} className="text-gray-400 group-hover/code:text-[#0F4C5C] transition-colors" />
                                                </div>
                                            </td>


                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {kiosk.require_photo && (
                                                        <Tooltip content={t.kiosks.modal.requirePhoto}>
                                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md cursor-default">
                                                                <Camera size={16} />
                                                            </div>
                                                        </Tooltip>
                                                    )}
                                                    {kiosk.require_badge_scan && (
                                                        <Tooltip content={t.kiosks.modal.requireBadge}>
                                                            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md cursor-default">
                                                                <CreditCard size={16} />
                                                            </div>
                                                        </Tooltip>
                                                    )}
                                                    {kiosk.require_signature && (
                                                        <Tooltip content={t.kiosks.modal.requireSignature}>
                                                            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md cursor-default">
                                                                <PenTool size={16} />
                                                            </div>
                                                        </Tooltip>
                                                    )}
                                                    {!kiosk.require_photo && !kiosk.require_badge_scan && !kiosk.require_signature && (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${displayStatus === 'ONLINE' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    displayStatus === 'OFFLINE' ? 'bg-gray-50 text-gray-600 border-gray-100' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${displayStatus === 'ONLINE' ? 'bg-green-500' :
                                                        displayStatus === 'OFFLINE' ? 'bg-gray-400' :
                                                            'bg-yellow-500'
                                                        }`}></span>
                                                    {displayStatus === 'ONLINE' ? t.kiosks.status.ONLINE :
                                                        displayStatus === 'PENDING' ? t.kiosks.status.PENDING :
                                                            t.kiosks.status.OFFLINE}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {kiosk.last_heartbeat_at ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(kiosk.last_heartbeat_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(kiosk.last_heartbeat_at).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                ) : "--:--"}
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === kiosk.id ? null : kiosk.id);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeMenuId === kiosk.id && (
                                                    <div className="absolute right-8 top-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleSync(kiosk.id); }}
                                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <RefreshCw size={16} />
                                                            {t.kiosks.sync}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(kiosk); }}
                                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <PenTool size={16} />
                                                            {t.kiosks.modal.update}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(kiosk.id); }}
                                                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={16} />
                                                            {t.kiosks.status.REVOKED}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pairing Modal */}
            {pairingModal.isOpen && pairingModal.kiosk && (
                <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setPairingModal({ isOpen: false, kiosk: null })}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Connectez votre appareil</h2>
                            <button onClick={() => setPairingModal({ isOpen: false, kiosk: null })} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <Tablet size={32} />
                            </div>

                            <div>
                                <p className="text-gray-600 mb-4">
                                    Sur votre tablette, téléchargez l&apos;app <strong>Timmy Kiosk</strong> ou allez sur <span className="font-mono bg-gray-100 px-1 rounded">kiosk.timmy.io</span>
                                </p>
                            </div>

                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 relative overflow-hidden">
                                <span className="text-5xl font-mono font-bold text-[#0F4C5C] tracking-widest relative z-10">
                                    {pairingModal.kiosk.pairing_code}
                                </span>
                                <div className="absolute inset-0 bg-[#0F4C5C]/5 z-0"></div>
                            </div>

                            <p className="text-sm text-gray-500 font-medium">
                                Utilisez ce code pour lier la tablette <strong>{pairingModal.kiosk.name}</strong>
                            </p>

                            <button
                                onClick={() => setPairingModal({ isOpen: false, kiosk: null })}
                                className="w-full px-4 py-3 bg-[#0F4C5C] text-white rounded-lg font-bold hover:bg-[#0a3641] transition-colors shadow-sm"
                            >
                                Terminé
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal?.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                            <p className="text-gray-500 mb-6">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {t.kiosks.confirm.cancel}
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    {t.kiosks.confirm.confirm}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* HEADER */}
                        <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                                    {editingKioskId ? <PenTool size={16} className="text-[#FFC107]" /> : <Plus size={20} className="text-[#FFC107]" strokeWidth={3} />}
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-wide">
                                    {editingKioskId ? t.kiosks.modal.editTitle : t.kiosks.modal.newTitle}
                                </h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="kiosk-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.kiosks.modal.name} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                            placeholder={t.kiosks.modal.namePlaceholder}
                                        />
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Info size={12} />
                                            Ce nom s&apos;affichera sur l&apos;écran d&apos;accueil et les rapports.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-1">{t.kiosks.modal.site} <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={formData.site_id}
                                            onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#0F4C5C] transition-all"
                                        >
                                            <option value="" disabled>{t.kiosks.modal.sitePlaceholder}</option>
                                            {sites.map(site => (
                                                <option key={site.id} value={site.id}>
                                                    {site.name} {!site.is_active ? `(${t.sites.archived})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t.kiosks.modal.security}</h3>

                                    {/* Photo Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <Camera size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{t.kiosks.modal.requirePhoto}</p>
                                                <p className="text-xs text-gray-500">Caméra active à chaque pointage</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.require_photo}
                                                onChange={(e) => setFormData({ ...formData, require_photo: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F4C5C]"></div>
                                        </label>
                                    </div>

                                    {/* Badge Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{t.kiosks.modal.requireBadge}</p>
                                                <p className="text-xs text-gray-500">QR Code ou NFC sans PIN</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.require_badge_scan}
                                                onChange={(e) => setFormData({ ...formData, require_badge_scan: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F4C5C]"></div>
                                        </label>
                                    </div>

                                    {/* Signature Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                                <PenTool size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{t.kiosks.modal.requireSignature}</p>
                                                <p className="text-xs text-gray-500">Signature tactile requise</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.require_signature}
                                                onChange={(e) => setFormData({ ...formData, require_signature: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F4C5C]"></div>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* FOOTER */}
                        <div className="p-6 pt-2 bg-white rounded-b-xl shrink-0">
                            <button
                                type="submit"
                                form="kiosk-form"
                                disabled={isLoading}
                                className="w-full bg-[#FFC107] hover:bg-[#e0a800] text-[#0F4C5C] font-extrabold text-base py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isLoading && <Loader2 size={20} className="animate-spin" />}
                                {isLoading ? t.kiosks.modal.saving : (editingKioskId ? t.kiosks.modal.update : t.kiosks.modal.create)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
