"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

export default function UpdatePasswordPage() {
    const { t } = useLanguage();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Session state
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session && session.user) {
                    setIsAuthenticated(true);
                    setUserEmail(session.user.email || null);

                    // Pre-fill name if available (e.g. if just updating password, not first login)
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('first_name, last_name')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        if (profile.first_name) setFirstName(profile.first_name);
                        if (profile.last_name) setLastName(profile.last_name);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("Session check error:", err);
                setIsAuthenticated(false);
            } finally {
                setIsCheckingSession(false);
            }
        };

        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError(t.updatePassword.errors.length);
            return;
        }

        if (password !== confirmPassword) {
            setError(t.updatePassword.errors.match);
            return;
        }

        setIsLoading(true);

        try {
            // 1. Update Password
            const { error: passwordError } = await supabase.auth.updateUser({
                password: password
            });

            if (passwordError) throw passwordError;

            // 2. Update Profile (First Name & Last Name)
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        first_name: firstName,
                        last_name: lastName
                    })
                    .eq('id', user.id);

                if (profileError) {
                    console.error("Profile update error:", profileError);
                    // We don't block success if password worked but profile failed, 
                    // but ideally we should handle it. For now, let's log it.
                }
            }

            setIsSuccess(true);
            setTimeout(() => {
                router.push("/admin");
            }, 3000);

        } catch (err: unknown) {
            console.error("Update password error:", err);
            const message = err instanceof Error ? err.message : t.updatePassword.errors.default;
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#0F4C5C]" size={32} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide ou expiré</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Ce lien de réinitialisation n'est plus valide ou vous n'êtes pas connecté.
                        Veuillez demander une nouvelle invitation ou réinitialisation.
                    </p>
                    <Link href="/admin" className="text-[#0F4C5C] font-bold hover:underline">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-[#0F4C5C] rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">T</div>
                    <h1 className="text-2xl font-bold text-gray-900">{t.updatePassword.title}</h1>
                    <p className="text-gray-500 text-sm mt-2">{t.updatePassword.desc}</p>
                    {userEmail && (
                        <div className="mt-4 p-2 bg-blue-50 text-blue-800 text-xs font-medium rounded-lg inline-block">
                            Compte : {userEmail}
                        </div>
                    )}
                </div>

                {isSuccess ? (
                    <div className="text-center animate-in fade-in zoom-in">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.updatePassword.successTitle}</h3>
                        <p className="text-gray-500 text-sm mb-6">{t.updatePassword.successDesc}</p>
                        <Link href="/admin" className="text-[#0F4C5C] font-bold hover:underline">
                            {t.updatePassword.goToLogin}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.common.firstName}</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                    placeholder="Jean"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.common.lastName}</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                    placeholder="Dupont"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.updatePassword.newPassword}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.updatePassword.confirmPassword}</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#FFB700] text-[#0F4C5C] py-3 rounded-lg font-bold hover:bg-[#FFC107] transition-colors flex items-center justify-center disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : t.updatePassword.submit}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
