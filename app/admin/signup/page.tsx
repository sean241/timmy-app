"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, User, CheckCircle, Eye, EyeOff, Loader2, AlertCircle, MessageSquare, ChevronDown } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";

const COUNTRIES = [
    { code: "GA", name: "Gabon", dialCode: "+241", flag: "🇬🇦", placeholder: "074 00 00 00" },
    { code: "SN", name: "Sénégal", dialCode: "+221", flag: "🇸🇳", placeholder: "77 000 00 00" },
    { code: "CM", name: "Cameroun", dialCode: "+237", flag: "🇨🇲", placeholder: "6 00 00 00 00" },
    { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", flag: "🇨🇮", placeholder: "07 00 00 00 00" },
    { code: "CG", name: "Congo", dialCode: "+242", flag: "🇨🇬", placeholder: "06 000 00 00" },
    { code: "CD", name: "RDC", dialCode: "+243", flag: "🇨🇩", placeholder: "80 000 00 00" },
    { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", placeholder: "06 00 00 00 00" },
];

export default function SignupPage() {
    const { t } = useLanguage();
    const [role, setRole] = useState<"manager" | "employee" | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    });
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to Gabon
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [isOtpLoading, setIsOtpLoading] = useState(false);

    const handleSendOtp = () => {
        if (!formData.phone) {
            setError(t.signup.otp.phoneRequired);
            return;
        }
        setError("");
        setIsOtpLoading(true);

        // Simulate sending OTP
        setTimeout(() => {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);
            setOtpSent(true);
            setIsOtpLoading(false);
            alert(`Timmy verification code for ${selectedCountry.dialCode}${formData.phone}: ${code} `); // For testing purposes
        }, 1500);
    };

    const handleVerifyOtp = () => {
        if (otpCode === generatedOtp) {
            setOtpVerified(true);
            setError("");
        } else {
            setError(t.signup.otp.error);
        }
    };

    const handleManagerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!otpVerified) {
            setError(t.signup.otp.verifyFirst);
            return;
        }

        if (formData.password.length < 6) {
            setError(t.signup.errors.passwordLength);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError(t.signup.errors.passwordMatch);
            return;
        }

        setIsLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        phone: formData.phone,
                        role: 'MANAGER', // Initial role, will become OWNER after creating org
                    }
                }
            });

            if (signUpError) {
                throw signUpError;
            }

            if (data.user) {
                setIsSubmitted(true);
            }
        } catch (err: unknown) {
            console.error("Signup error:", err);
            const message = err instanceof Error ? err.message : t.signup.errors.default;
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex bg-white">
            {/* Left Column: Form */}
            <div className="w-full lg:w-1/3 flex flex-col justify-center p-8 lg:p-12 xl:p-16 shadow-2xl z-10 relative">

                {/* Back Link */}
                <div className="absolute top-8 left-8">
                    {role ? (
                        <button onClick={() => setRole(null)} className="flex items-center gap-2 text-gray-500 hover:text-[#0F4C5C] transition-colors font-medium text-sm">
                            <ArrowLeft size={16} />
                            {t.common.back}
                        </button>
                    ) : (
                        <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-[#0F4C5C] transition-colors font-medium text-sm">
                            <ArrowLeft size={16} />
                            {t.common.login}
                        </Link>
                    )}
                </div>

                {/* Logo */}
                <div className="mt-12 mb-8 flex justify-center items-center">
                    <Image
                        src="/images/timmy_logo_dark.png"
                        width={180}
                        height={60}
                        alt="Timmy"
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="w-full max-w-sm mx-auto">
                    {!role ? (
                        // Step 1: Role Selection
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-extrabold text-[#0F4C5C] mb-2 text-center">{t.signup.welcome}</h2>
                            <p className="text-gray-500 mb-8 text-center text-sm">
                                {t.signup.subtitle}
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setRole("manager")}
                                    style={{ backgroundColor: "#f3da8d33" }}
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#0F4C5C] transition-all group flex items-center gap-4 text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center group-hover:bg-[#0F4C5C] group-hover:text-white transition-colors">
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{t.signup.manager.title}</h3>
                                        <p className="text-xs text-gray-500">{t.signup.manager.desc}</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setRole("employee")}
                                    style={{ backgroundColor: "#94dff930" }}
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#0F4C5C] transition-all group flex items-center gap-4 text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-[#0F4C5C] group-hover:text-white transition-colors">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{t.signup.employee.title}</h3>
                                        <p className="text-xs text-gray-500">{t.signup.employee.desc}</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : role === "manager" ? (
                        // Step 2: Manager Form
                        !isSubmitted ? (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-2xl font-extrabold text-[#0F4C5C] mb-2 text-center">{t.signup.manager.createTitle}</h2>
                                <div className="bg-[#FFB700]/10 text-[#b38000] px-4 py-2 rounded-lg text-xs font-bold text-center mb-6">
                                    {t.signup.manager.trial}
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleManagerSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all placeholder-gray-400"
                                                placeholder={t.common.firstName}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all placeholder-gray-400"
                                                placeholder={t.common.lastName}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all placeholder-gray-400"
                                            placeholder={t.signup.manager.workEmail}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Phone Verification Section */}
                                    <div className="space-y-2">
                                        <div className={`relative flex w-full rounded-lg border transition-all ${otpVerified
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 focus-within:ring-2 focus-within:ring-[#0F4C5C] focus-within:border-transparent'
                                            }`}>
                                            {/* Country Selector */}
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                    className={`h-full px-3 py-3 rounded-l-lg bg-gray-50 flex items-center gap-2 hover:bg-gray-100 transition-colors border-r border-gray-300 ${otpVerified ? 'bg-green-50 border-green-200' : ''}`}
                                                    disabled={isLoading || otpVerified || otpSent}
                                                >
                                                    <span className="text-lg">{selectedCountry.flag}</span>
                                                    <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
                                                    <ChevronDown size={14} className="text-gray-400" />
                                                </button>

                                                {showCountryDropdown && (
                                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                                        {COUNTRIES.map((country) => (
                                                            <button
                                                                key={country.code}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedCountry(country);
                                                                    setShowCountryDropdown(false);
                                                                }}
                                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                            >
                                                                <span className="text-lg">{country.flag}</span>
                                                                <span className="flex-1 text-sm text-gray-700">{country.name}</span>
                                                                <span className="text-xs text-gray-400 font-mono">{country.dialCode}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Phone Input */}
                                            <div className="relative flex-1">
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className={`w-full px-4 py-3 rounded-r-lg bg-transparent outline-none placeholder-gray-400 ${otpVerified ? 'text-green-900' : 'text-gray-900'}`}
                                                    placeholder={selectedCountry.placeholder}
                                                    required
                                                    disabled={isLoading || otpVerified || otpSent}
                                                />
                                                {otpVerified && (
                                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
                                                )}
                                            </div>
                                        </div>

                                        {!otpVerified && !otpSent && (
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={isOtpLoading || !formData.phone}
                                                className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {isOtpLoading ? <Loader2 className="animate-spin" size={16} /> : <MessageSquare size={16} />}
                                                {t.signup.manager.verifyPhone}
                                            </button>
                                        )}

                                        {otpSent && !otpVerified && (
                                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                                                <input
                                                    type="text"
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none text-center tracking-widest font-mono"
                                                    placeholder={t.signup.otp.placeholder}
                                                    maxLength={6}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyOtp}
                                                    className="px-4 py-2 bg-[#0F4C5C] text-white rounded-lg font-bold text-sm hover:bg-[#0F4C5C]/90"
                                                >
                                                    {t.common.validate}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all placeholder-gray-400"
                                            placeholder={t.common.password}
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all placeholder-gray-400"
                                            placeholder={t.common.confirmPassword}
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <div className="flex items-start pt-2">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="terms"
                                                type="checkbox"
                                                checked={formData.acceptTerms}
                                                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-[#0F4C5C]/30"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="ml-2 text-sm">
                                            <label htmlFor="terms" className="text-gray-600">
                                                {t.common.terms}
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !otpVerified}
                                        className="w-full bg-[#FFB700] text-[#0F4C5C] py-3 rounded-lg font-bold text-lg hover:bg-[#FFC107] transition-colors shadow-sm mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" size={24} />
                                        ) : (
                                            t.signup.manager.startTrial
                                        )}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-[#0F4C5C] mb-4">{t.signup.success.title}</h2>
                                <p className="text-gray-500 mb-8 text-sm">
                                    {t.signup.success.message}, <strong>{formData.firstName}</strong>!<br />
                                    {t.signup.success.emailSent} <strong>{formData.email}</strong>.
                                </p>
                                <button
                                    onClick={() => {
                                        setIsLoading(true);
                                        // Save data for onboarding
                                        if (typeof window !== 'undefined') {
                                            localStorage.setItem('timmy_onboarding_data', JSON.stringify({
                                                firstName: formData.firstName,
                                                lastName: formData.lastName,
                                                phone: formData.phone
                                            }));
                                        }
                                        // Simulate delay for "something is happening"
                                        setTimeout(() => {
                                            window.location.href = "/admin/onboarding";
                                        }, 800);
                                    }}
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center gap-2 bg-[#0F4C5C] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0F4C5C]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : t.signup.success.setup}
                                </button>
                            </div>
                        )
                    ) : (
                        // Step 2: Employee Placeholder
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <User size={40} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-[#0F4C5C] mb-4">{t.signup.employee.areaTitle}</h2>
                            <p className="text-gray-500 mb-8 text-sm">
                                {t.signup.employee.instruction}
                            </p>
                            <button
                                onClick={() => setRole(null)}
                                className="text-[#0F4C5C] font-bold hover:underline"
                            >
                                {t.signup.employee.chooseOther}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 flex justify-center text-gray-400 text-xs">
                    &copy; {new Date().getFullYear()} {t.common.copyright}
                </div>
            </div>

            {/* Right Column: Hero (Minimal) */}
            <div className="hidden lg:flex w-2/3 bg-[#0F4C5C] relative overflow-hidden flex-col items-center justify-center text-center p-12 text-white">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/login-hero-minimal.png"
                        alt="Background"
                        fill
                        className="object-cover opacity-40 mix-blend-overlay"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-4xl px-4">
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                        <span className="text-4xl font-bold">t:</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-6 leading-tight tracking-tight">
                        {role === "manager" ? t.signup.hero.managerTitle : t.signup.hero.employeeTitle}
                    </h1>

                    <p className="text-lg opacity-90 font-light max-w-xl mx-auto leading-relaxed">
                        {role === "manager"
                            ? t.signup.hero.managerDesc
                            : t.signup.hero.employeeDesc}
                    </p>
                </div>
            </div>
        </main>
    );
}
