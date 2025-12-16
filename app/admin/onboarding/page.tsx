"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, MapPin, User, CheckCircle, Loader2, Smartphone, Lock, ChevronDown, AlertCircle } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sector Autocomplete State
    const [sectorQuery, setSectorQuery] = useState("");
    const [showSectorDropdown, setShowSectorDropdown] = useState(false);
    const sectorDropdownRef = useRef<HTMLDivElement>(null);

    // Form Data
    const [formData, setFormData] = useState({
        // Step 1: Company
        companyName: "",
        sector: "",
        country: "Gabon",

        // Step 2: Site
        siteName: "",
        siteAddress: "",

        // Step 3: Manager
        firstName: "",
        lastName: "",
        whatsapp: "",
        pin: "1111"
    });

    // Pre-fill data from signup (localStorage) and check Auth
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, redirect to login
                router.push("/admin?error=auth_required");
                return;
            }
        };
        checkAuth();

        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem('timmy_onboarding_data');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({
                    ...prev,
                    firstName: parsed.firstName || "",
                    lastName: parsed.lastName || "",
                    whatsapp: parsed.phone || ""
                }));
            }
        }

        // Click outside listener for sector dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(event.target as Node)) {
                setShowSectorDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [router]);

    const filteredSectors = t.onboarding.sectors.filter(s =>
        s.toLowerCase().includes(sectorQuery.toLowerCase())
    );

    const handleSectorSelect = (sector: string) => {
        setFormData({ ...formData, sector });
        setSectorQuery(sector);
        setShowSectorDropdown(false);
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.rpc('create_organization_for_user', {
                org_name: formData.companyName,
                org_sector: formData.sector,
                org_country: formData.country,
                site_name: formData.siteName,
                site_address: formData.siteAddress,
                manager_pin: formData.pin
            });

            if (error) throw error;

            // Clear temp data
            if (typeof window !== 'undefined') {
                localStorage.removeItem('timmy_onboarding_data');
            }
            // Redirect to Dashboard with success flag
            router.push("/admin/dashboard?new_account=true&welcome=true");
        } catch (err: any) {
            console.error("Onboarding error:", err);
            setError(err.message || "Une erreur est survenue lors de la création de votre espace.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-12 space-x-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === i
                        ? "bg-[#0F4C5C] text-white ring-4 ring-[#0F4C5C]/20"
                        : step > i
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                        {step > i ? <CheckCircle size={20} /> : i}
                    </div>
                    {i < 3 && (
                        <div className={`w-12 h-1 mx-2 rounded-full transition-all ${step > i ? "bg-green-500" : "bg-gray-100"}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

            {/* Logo */}
            <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0F4C5C] rounded-md flex items-center justify-center text-white font-bold text-xl">T</div>
                <span className="text-2xl font-bold text-[#0F4C5C] tracking-tight">Timmy</span>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12 relative overflow-visible">

                {renderStepIndicator()}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Step 1: Company Info */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#0F4C5C]/10 text-[#0F4C5C] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 size={32} />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.onboarding.step1.title}</h1>
                            <p className="text-gray-500">{t.onboarding.step1.desc}</p>
                        </div>

                        <div className="space-y-6 max-w-md mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.onboarding.step1.companyName}</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                    placeholder={t.onboarding.step1.companyPlaceholder}
                                    autoFocus
                                />
                            </div>

                            <div className="relative" ref={sectorDropdownRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.onboarding.step1.sector}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={sectorQuery}
                                        onChange={(e) => {
                                            setSectorQuery(e.target.value);
                                            setFormData({ ...formData, sector: "" }); // Clear selection on type
                                            setShowSectorDropdown(true);
                                        }}
                                        onFocus={() => setShowSectorDropdown(true)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                        placeholder={t.onboarding.step1.sectorPlaceholder}
                                    />
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>

                                {showSectorDropdown && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                        {filteredSectors.length > 0 ? (
                                            filteredSectors.map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => handleSectorSelect(s)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                                                >
                                                    {s}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-gray-400 text-sm">{t.onboarding.noResult}</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.onboarding.step1.country}</label>
                                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 flex items-center gap-2 cursor-not-allowed">
                                    <span>🇬🇦</span>
                                    <span>Gabon (XAF)</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{t.onboarding.step1.countryDesc}</p>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!formData.companyName || !formData.sector}
                                className="w-full bg-[#0F4C5C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0F4C5C]/90 transition-all shadow-lg shadow-[#0F4C5C]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                            >
                                {t.common.continue} <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: First Site */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#FFB700]/10 text-[#b38000] rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin size={32} />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.onboarding.step2.title}</h1>
                            <p className="text-gray-500">{t.onboarding.step2.desc}</p>
                        </div>

                        <div className="space-y-6 max-w-md mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.onboarding.step2.siteName}</label>
                                <input
                                    type="text"
                                    value={formData.siteName}
                                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                    placeholder={t.onboarding.step2.sitePlaceholder}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.onboarding.step2.address} ({t.common.optional})</label>
                                <input
                                    type="text"
                                    value={formData.siteAddress}
                                    onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                    placeholder={t.onboarding.step2.addressPlaceholder}
                                />
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!formData.siteName}
                                className="w-full bg-[#0F4C5C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0F4C5C]/90 transition-all shadow-lg shadow-[#0F4C5C]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                            >
                                {t.common.continue} <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Manager Profile */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User size={32} />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.onboarding.step3.title}</h1>
                            <p className="text-gray-500">{t.onboarding.step3.desc}</p>
                        </div>

                        <div className="space-y-6 max-w-md mx-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.common.firstName}</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.common.lastName}</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.onboarding.step3.whatsapp}</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                        placeholder={t.onboarding.step3.whatsappPlaceholder}
                                        autoFocus
                                    />
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t.onboarding.step3.whatsappNote}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.onboarding.step3.pin}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.pin}
                                        onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all font-mono tracking-widest text-lg"
                                        maxLength={4}
                                    />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.whatsapp || formData.pin.length < 4}
                                className="w-full bg-[#FFB700] text-[#0F4C5C] py-4 rounded-xl font-bold text-lg hover:bg-[#FFC107] transition-all shadow-lg shadow-[#FFB700]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : t.onboarding.step3.submit}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
