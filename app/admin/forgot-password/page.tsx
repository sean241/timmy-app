"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/app/context/LanguageContext";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsLoading(true);
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/admin/update-password`,
                });
                if (error) throw error;
                setIsSubmitted(true);
            } catch (error) {
                console.error("Error sending password reset email:", error);
                // Optionally handle error state here
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <main className="min-h-screen flex bg-white">
            {/* Left Column: Form */}
            <div className="w-full lg:w-1/3 flex flex-col justify-center p-8 lg:p-12 xl:p-16 shadow-2xl z-10 relative">

                {/* Back Link */}
                <div className="absolute top-8 left-8">
                    <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-[#0F4C5C] transition-colors font-medium text-sm">
                        <ArrowLeft size={16} />
                        {t.common.back}
                    </Link>
                </div>

                {/* Logo */}
                <div className="mt-12 mb-12 flex justify-center items-center">
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
                    {!isSubmitted ? (
                        <>
                            <h2 className="text-2xl font-extrabold text-[#0F4C5C] mb-4 text-center">{t.forgotPassword.title}</h2>
                            <p className="text-gray-500 mb-8 text-center text-sm">
                                {t.forgotPassword.desc}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.common.email}</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all placeholder-gray-400"
                                            placeholder={t.forgotPassword.placeholder}
                                            required
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                                        t.forgotPassword.submit
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-[#0F4C5C] mb-4">{t.forgotPassword.successTitle}</h2>
                            <p className="text-gray-500 mb-8 text-sm">
                                {t.forgotPassword.successDesc} <strong>{email}</strong>, {t.forgotPassword.successDesc2}
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-[#0F4C5C] font-bold hover:underline text-sm"
                            >
                                {t.forgotPassword.resend}
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
                    <div className="absolute inset-0 bg-[#0F4C5C]" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-4xl px-4">
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                        <span className="text-4xl font-bold">t:</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-6 leading-tight tracking-tight">
                        {t.forgotPassword.heroTitle}
                    </h1>

                    <p className="text-lg opacity-90 font-light max-w-xl mx-auto leading-relaxed">
                        {t.forgotPassword.heroDesc}
                    </p>
                </div>
            </div>
        </main>
    );
}
