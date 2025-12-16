"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { X, HelpCircle, Send, Loader2, LifeBuoy, AlertCircle, ShieldCheck, User } from "lucide-react";

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ProblemType = 'technical' | 'billing' | 'feature' | 'account' | 'other';
type Priority = 'low' | 'medium' | 'high';

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const { t } = useLanguage();
    const [type, setType] = useState<ProblemType>('technical');
    const [subType, setSubType] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    // Context Info
    const [userInfo, setUserInfo] = useState<{ name: string, company: string, email: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchInfo = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Try to get more details
                    const { data: profile } = await supabase.from('profiles').select('first_name, last_name, organization:organizations(name)').eq('id', user.id).single();
                    setUserInfo({
                        name: profile ? `${profile.first_name} ${profile.last_name}` : user.email || "Unknown",
                        company: (profile?.organization as any)?.name || "Unknown Company",
                        email: user.email || ""
                    });
                }
            };
            fetchInfo();
        }
    }, [isOpen]);

    // Reset subType when type changes
    useEffect(() => {
        setSubType('');
    }, [type]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log("Support Request:", {
            type,
            subType,
            priority,
            message,
            context: userInfo
        });

        setStatus('success');
        setTimeout(() => {
            onClose();
            setStatus('idle');
            setMessage("");
            setType("technical");
            setSubType("");
            setPriority("medium");
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-[#1e293b] px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700/50 rounded-lg">
                            <LifeBuoy className="text-sky-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{t.support.title}</h3>
                            {userInfo && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                                    <span className="font-medium text-sky-200">{userInfo.company}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="opacity-80">{userInfo.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {status === 'success' ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t.support.success}</h3>
                        <p className="text-slate-500">{t.support.successDesc}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        {/* Type Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">{t.support.type}</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as ProblemType)}
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-all"
                                >
                                    <option value="technical">{t.support.types.technical}</option>
                                    <option value="billing">{t.support.types.billing}</option>
                                    <option value="account">{t.support.types.account}</option>
                                    <option value="feature">{t.support.types.feature}</option>
                                    <option value="other">{t.support.types.other}</option>
                                </select>
                            </div>

                            {/* Sub Type Selection - Dynamic */}
                            {t.support.subTypes[type as keyof typeof t.support.subTypes] && (
                                <div className="space-y-2 animate-in slide-in-from-left-2 duration-200">
                                    <label className="text-sm font-bold text-slate-700 block">{t.support.subType}</label>
                                    <select
                                        required
                                        value={subType}
                                        onChange={(e) => setSubType(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-all"
                                    >
                                        <option value="" disabled>-- Sélectionner --</option>
                                        {Object.entries((t.support.subTypes as any)[type] || {}).map(([key, label]) => (
                                            <option key={key} value={key}>{label as string}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Priority Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">{t.support.priority}</label>
                            <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-all ${priority === p
                                            ? p === 'high' ? 'bg-red-50 border-red-200 text-red-700' : p === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {t.support.priorities[p]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">{t.support.message}</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t.support.placeholder}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none min-h-[120px] resize-none text-sm"
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors whitespace-nowrap"
                            >
                                {t.support.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={status === 'sending' || !message.trim()}
                                className="flex-1 px-4 py-3 bg-[#1e293b] hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {status === 'sending' ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {t.support.submit}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
