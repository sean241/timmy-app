"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import Image from "next/image";
import { verifyKioskCode } from "@/app/actions/kiosk";
import clsx from "clsx";
import { FileText, ChevronDown, Delete } from "lucide-react";

export default function SiteSetupPage() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState<"fr" | "en">("fr");
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    // Clock for left side
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
            setTime(now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false }));
            setDate(now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, [lang]);

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase();
        // Allow only alphanumeric
        if (val.length <= 6 && /^[A-Z0-9]*$/.test(val)) {
            setOtp(val);
            setError(false);
        }
    };

    const handleDelete = () => {
        setOtp(prev => prev.slice(0, -1));
        setError(false);
        inputRef.current?.focus();
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (otp.length !== 6) return;

        setLoading(true);
        setError(false);

        try {
            const result = await verifyKioskCode(otp);

            if (result.error) {
                console.error(result.error);
                setError(true);
                setLoading(false);
                return;
            }

            if (result.success && result.config) {
                // Store in Dexie Terminals table
                const { config } = result;
                await db.terminals.put({
                    id: config.kiosk_id,
                    name: config.kiosk_name,
                    site_id: config.site_id,
                    site_name: config.site_name,
                    organization_id: config.organization_id,
                    organization_name: config.organization_name,
                    logo_url: config.organization_logo
                });

                // Set as active terminal
                await db.local_config.bulkPut([
                    { key: "kiosk_id", value: config.kiosk_id },
                    { key: "device_id", value: config.device_id },
                    { key: "organization_id", value: config.organization_id },
                    { key: "site_id", value: config.site_id },
                    { key: "org_name", value: config.organization_name },
                    { key: "site_name", value: config.site_name },
                    { key: "org_logo", value: config.organization_logo || "" }
                ]);

                // BACKUP: Persist ID in LocalStorage for redundancy
                localStorage.setItem("kiosk_id", config.kiosk_id);

                router.push("/kiosk");
            }
        } catch (err) {
            console.error("Pairing error:", err);
            setError(true);
            setLoading(false);
        }
    };

    const handleReset = async () => {
        try {
            // Delete the entire database for a 100% clean state
            await db.delete();
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/site-setup";
        } catch (err) {
            console.error("Reset error:", err);
            // Fallback: clear tables one by one if delete fails
            await Promise.all([
                db.local_config.clear(),
                db.terminals.clear(),
                db.local_employees.clear(),
                db.local_logs.clear(),
                db.cloud_employees.clear(),
                db.cloud_sites.clear(),
                db.cloud_kiosks.clear()
            ]);
            window.location.reload();
        }
    };

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const toggleLang = (newLang: "fr" | "en") => {
        setLang(newLang);
        setIsLangMenuOpen(false);
    };

    const t = {
        fr: {
            title: "Activation Terminal",
            desc: "Entrez le code d'activation généré depuis votre interface Manager (Onglet Lieux).",
            button: "Activer ce Terminal",
            verifying: "Vérification...",
            error: "Code invalide. Veuillez réessayer.",
            help: "Besoin d'aide ? 01 23 45 67 89",
            manager: "Accès Manager"
        },
        en: {
            title: "Terminal Activation",
            desc: "Enter the activation code generated from your Manager interface (Sites tab).",
            button: "Activate Terminal",
            verifying: "Verifying...",
            error: "Invalid code. Please try again.",
            help: "Need help? 01 23 45 67 89",
            manager: "Manager Access"
        }
    };

    return (
        <main className="flex min-h-screen w-full font-sans">
            {/* Left Side - Dark Teal with Image Background */}
            <div className="w-1/3 bg-[#0F3A44] text-white p-12 flex flex-col justify-between relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/login-hero-minimal.png"
                        alt="Background"
                        fill
                        className="object-cover opacity-40 mix-blend-overlay"
                        priority
                    />
                    {/* Gradient Overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0F4C5C]/90 to-[#082f36]/90 mix-blend-multiply" />
                </div>

                {/* Content Container (z-10 to sit above image) */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <span className="font-bold tracking-widest text-sm opacity-90">TIMMY APP</span>
                    </div>

                    {/* Clock */}
                    <div className="mb-20">
                        <h1 className="text-[8rem] leading-none font-bold tracking-tighter">{time}</h1>
                        <p className="text-2xl text-[#4FD1C5] font-medium capitalize mt-2">{date}</p>
                    </div>

                    {/* Footer */}
                    <div className="font-mono text-xs tracking-widest text-[#4FD1C5] opacity-80 space-y-1">
                        <p>TIMMY TIME CLOCK</p>
                        <p>V1.0.8</p>
                    </div>
                </div>
            </div>

            {/* Right Side - White */}
            <div className="flex-1 bg-white p-12 flex flex-col justify-center items-center relative">

                {/* Language Dropdown - Top Right */}
                <div className="absolute top-8 right-8 z-20">
                    <div className="relative">
                        <button
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-xl">{lang === 'fr' ? '🇫🇷' : '🇺🇸'}</span>
                            <span className="text-sm font-medium text-gray-700 uppercase">{lang}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {isLangMenuOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-lg py-1 overflow-hidden">
                                <button
                                    onClick={() => toggleLang('fr')}
                                    className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-xl">🇫🇷</span>
                                    <span className="text-sm text-gray-700">Français</span>
                                </button>
                                <button
                                    onClick={() => toggleLang('en')}
                                    className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-xl">🇺🇸</span>
                                    <span className="text-sm text-gray-700">English</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full max-w-lg">
                    <h2 className="text-4xl font-bold text-primary mb-6">{t[lang].title}</h2>
                    <p className="text-gray-500 mb-10 text-base leading-relaxed max-w-md">
                        {t[lang].desc}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex items-center gap-3">
                            {/* Custom OTP Input */}
                            <div className="relative flex-1" onClick={focusInput}>
                                <div className="flex gap-3 justify-between">
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={clsx(
                                                "w-14 h-16 border-2 rounded-lg flex items-center justify-center text-3xl font-bold transition-all",
                                                otp[i]
                                                    ? "border-[#0F4C5C] text-[#0F4C5C] bg-white"
                                                    : "border-gray-200 bg-gray-50",
                                                i === otp.length && !otp[i] ? "border-[#0F4C5C] ring-2 ring-[#0F4C5C]/20" : "", // Highlight current
                                                error ? "border-red-500 bg-red-50" : ""
                                            )}
                                        >
                                            {otp[i] || ""}
                                        </div>
                                    ))}
                                </div>

                                {/* Hidden Input */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>

                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="h-16 w-16 flex items-center justify-center rounded-lg border-2 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                title="Effacer"
                            >
                                <Delete className="w-6 h-6" />
                            </button>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 font-medium text-center">{t[lang].error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={otp.length !== 6 || loading}
                            className={clsx(
                                "w-full h-14 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3",
                                otp.length === 6
                                    ? "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg"
                                    : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <span>{t[lang].verifying}</span>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    <span>{t[lang].button}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">{t[lang].help}</p>
                    </div>
                </div>

                {/* Bottom Right Manager Access */}
                <div className="fixed bottom-4 right-4 flex gap-4 z-[100] bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-gray-200 shadow-xl">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowResetModal(true);
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100 hover:bg-red-100 transition-all"
                    >
                        DANGER: RESET
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            router.push('/admin');
                        }}
                        className="bg-[#E2E8F0] text-[#64748B] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#CBD5E1] transition-colors"
                    >
                        {t[lang].manager}
                    </button>
                </div>

                {/* Custom Reset Modal */}
                {showResetModal && (
                    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-red-100">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Delete size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Réinitialisation</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    Voulez-vous vraiment TOUT réinitialiser ? Cette action supprimera tous les terminaux et employés de cet appareil.
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 flex gap-3">
                                <button
                                    onClick={() => setShowResetModal(false)}
                                    className="flex-1 py-4 px-6 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 py-4 px-6 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
