"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { Heart, Copy, CheckCircle, Mail, Linkedin, Share2, Users, Gift, Loader2 } from "lucide-react";
import Toast from "@/components/Toast";

export default function ReferPage() {
    const { t } = useLanguage();
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
                if (profile?.organization_id) {
                    setOrganizationId(profile.organization_id);
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const referralLink = organizationId ? `https://timmy.app/signup?ref=${organizationId}` : "";
    const emailSubject = t.referral.emailSubject;
    const emailBody = `${t.referral.emailBody} ${referralLink}`;

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareEmail = () => {
        window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
    };

    const handleShareLinkedin = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
    };

    if (loading) {
        return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

            {/* HERO SECTION */}
            <div className="bg-gradient-to-r from-[#0F4C5C] to-[#1a6b7e] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 text-[#FFC107] font-bold tracking-wider text-sm mb-4">
                        <Heart className="fill-current" size={16} />
                        {t.referral.header.toUpperCase()}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight whitespace-nowrap">
                        {t.referral.heroTitle}
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 leading-relaxed mb-8">
                        {t.referral.heroDesc}
                    </p>
                </div>

                {/* Decorative Icon */}
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
                    <Gift size={300} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LINK CARD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <Share2 size={20} className="text-[#0F4C5C]" />
                        {t.referral.linkTitle}
                    </h3>

                    <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-600 font-mono text-sm truncate select-all">
                            {referralLink || "Generating..."}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${copied
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-[#0F4C5C] text-white hover:bg-[#0a3844]"
                                }`}
                        >
                            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                            {copied ? t.referral.copied : t.referral.copyLink}
                        </button>
                    </div>

                    <div className="mt-6 space-y-3">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">{t.referral.shareTitle}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleShareEmail}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors whitespace-nowrap"
                            >
                                <Mail size={18} className="shrink-0" />
                                {t.referral.shareEmail}
                            </button>
                            <button
                                onClick={handleShareLinkedin}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0077b5] hover:bg-[#006097] text-white rounded-xl font-bold transition-colors"
                            >
                                <Linkedin size={18} />
                                LinkedIn
                            </button>
                        </div>
                    </div>
                </div>

                {/* STATS CARD (Static for now) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <Users size={20} className="text-[#0F4C5C]" />
                        {t.referral.statsTitle}
                    </h3>

                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                            <Gift size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium mb-1">{t.referral.emptyState}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">0</div>
                            <div className="text-xs text-slate-500 font-medium uppercase">{t.referral.totalReferred}</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-500">0</div>
                            <div className="text-xs text-slate-500 font-medium uppercase">{t.referral.pending}</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-emerald-600">0€</div>
                            <div className="text-xs text-slate-500 font-medium uppercase">{t.referral.earned}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
