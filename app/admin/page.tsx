
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Linkedin, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Logger } from "@/lib/logger";
import { useLanguage } from "@/app/context/LanguageContext";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            // Check if user has an organization
            // Check if user has an organization
            if (data.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    Logger.error("LOGIN_PROFILE_ERROR", { error: profileError });
                    console.error("Error fetching profile:", profileError);
                    router.push("/admin/dashboard?welcome=true");
                } else {
                    // Log success with organization ID
                    Logger.info("LOGIN_SUCCESS", {
                        email,
                        orgId: profile?.organization_id
                    });

                    if (!profile?.organization_id) {
                        router.push("/admin/onboarding");
                    } else {
                        router.push("/admin/dashboard?welcome=true");
                    }
                }
            }
        } catch (err) {
            Logger.error("LOGIN_FAILED", { email, error: err });
            console.error("Login error:", err);
            const errorMessage = (err as Error).message || t.login.errors.default;

            // Map Supabase error to user friendly message
            if (errorMessage === "Invalid login credentials") {
                setError(t.login.errors.invalid_credentials);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex bg-white">
            {/* Left Column: Form */}
            <div className="w-full lg:w-1/3 flex flex-col justify-between p-8 lg:p-12 xl:p-16 shadow-2xl z-10 relative">

                {/* Logo */}
                <div className="mt-12 mb-12 flex justify-center items-center gap-3">
                    <div className="w-10 h-10 bg-[#0F4C5C] rounded-md flex items-center justify-center text-white font-bold text-xl">T</div>
                    <span className="text-2xl font-bold text-[#0F4C5C] tracking-tight">Timmy</span>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-sm mx-auto">
                    <h2 className="text-2xl font-extrabold text-[#0F4C5C] mb-2 text-center whitespace-nowrap">{t.login.title}</h2>
                    <p className="text-gray-500 mb-8 text-center text-sm">
                        {t.login.noAccount}{" "}
                        <Link href="/admin/signup" className="text-[#0F4C5C] font-bold hover:underline">
                            {t.common.signup}
                        </Link>
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder={t.common.email}
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder={t.common.password}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="flex items-center">
                            <div className="relative flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary/30"
                                    />
                                </div>
                                <div className="ml-2 text-sm">
                                    <label htmlFor="remember" className="text-gray-600 select-none cursor-pointer">{t.login.rememberMe}</label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FFB700] text-[#0F4C5C] py-3 rounded-lg font-bold text-lg hover:bg-[#FFC107] transition-colors shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                t.common.login
                            )}
                        </button>
                    </form>

                    <div className="mt-8 relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative bg-white px-4 text-sm text-gray-500">{t.login.orLoginWith}</div>
                    </div>

                    <div className="mt-6 flex justify-center gap-4">
                        {/* Social Buttons */}
                        <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors bg-white shadow-sm">
                            <span className="font-bold text-xl text-gray-700">G</span>
                        </button>
                        <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors bg-white shadow-sm text-[#0077b5]">
                            <Linkedin size={20} />
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/admin/forgot-password" className="text-[#0F4C5C] font-bold hover:underline text-sm border-b-2 border-[#0F4C5C] pb-0.5">
                            {t.login.forgotPassword}
                        </Link>
                    </div>
                </div>

                {/* Footer Language Selector */}
                <div className="mt-8 flex justify-center">
                    <div className="relative group">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as "fr" | "en")}
                            className="appearance-none bg-transparent pl-8 pr-8 py-2 text-gray-600 font-medium text-sm cursor-pointer hover:text-gray-900 outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 rounded-full transition-colors"
                        >
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                        </select>
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-lg">{language === 'en' ? '🇺🇸' : '🇫🇷'}</span>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
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
                        <span className="text-4xl font-bold">T</span>
                    </div>

                    <h1 className="text-5xl xl:text-5xl font-bold mb-8 leading-tight tracking-tight">
                        {t.login.heroTitle}
                    </h1>

                    <p className="text-xl xl:text-2xl opacity-90 font-light max-w-2xl mx-auto leading-relaxed">
                        {t.login.heroSubtitle}
                    </p>
                </div>
            </div>
        </main>
    );
}
