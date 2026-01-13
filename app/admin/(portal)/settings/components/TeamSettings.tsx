import { useState, useEffect } from "react";
import { Plus, Loader2, Mail, Shield, Users, FileText, Clock, CheckCircle, Send, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";
import Toast from "@/components/Toast";
import { inviteUser } from "@/app/actions/invite";

export default function TeamSettings({ organizationId }: { organizationId: string | null }) {
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
                        {/* HEADER */}
                        <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <Plus className="h-5 w-5 text-[#FFC107]" strokeWidth={3} />
                                <h3 className="text-lg font-bold text-white tracking-wide">
                                    {t.settings.team.inviteModal.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleInvite}>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.team.inviteModal.email}</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="collegue@entreprise.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium placeholder:font-normal"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.team.inviteModal.role}</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                                            <input type="radio" name="role" value="MANAGER" defaultChecked className="mt-1 text-[#0F4C5C] focus:ring-[#0F4C5C] w-4 h-4" />
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm mb-0.5">{t.settings.team.roles.manager}</div>
                                                <div className="text-xs text-slate-500 leading-relaxed">{t.settings.team.roles.managerDesc}</div>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                                            <input type="radio" name="role" value="ACCOUNTANT" className="mt-1 text-[#0F4C5C] focus:ring-[#0F4C5C] w-4 h-4" />
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm mb-0.5">{t.settings.team.roles.accountant}</div>
                                                <div className="text-xs text-slate-500 leading-relaxed">{t.settings.team.roles.accountantDesc}</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="p-6 pt-0 bg-white rounded-b-xl shrink-0 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="flex-1 px-4 py-3.5 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    {t.settings.team.inviteModal.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviteStatus === "sending"}
                                    className="flex-[2] bg-[#FFC107] hover:bg-[#e0a800] text-[#0F4C5C] font-extrabold text-base py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                                >
                                    {inviteStatus === "sending" ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            {t.settings.team.inviteModal.sending}
                                        </>
                                    ) : inviteStatus === "success" ? (
                                        <>
                                            <CheckCircle size={18} />
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
