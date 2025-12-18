import { useState, useRef, useEffect } from "react";
import { Loader2, Save, CheckCircle, Smartphone, Mail, LockIcon, Eye, EyeOff, Camera, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";
import Toast from "@/components/Toast";

export default function ProfileSettings() {
    const { t, language, setLanguage } = useLanguage();
    const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
    const [profile, setProfile] = useState({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        phoneCode: "+241",
        role: "",
        avatarUrl: ""
    });

    // Password change state
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Avatar upload state
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile({
                        id: data.id,
                        firstName: data.first_name || "",
                        lastName: data.last_name || "",
                        email: data.email || user.email || "",
                        phone: data.phone || "",
                        phoneCode: data.phone_code || "+241",
                        role: data.role || "",
                        avatarUrl: data.avatar_url || ""
                    });
                }
            }
        };
        fetchProfile();
    }, []);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setIsUploadingAvatar(true);

        try {
            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', profile.id);

            if (updateError) {
                throw updateError;
            }

            // 4. Update Local State
            setProfile(prev => ({ ...prev, avatarUrl: publicUrl }));
            window.dispatchEvent(new Event('profile-updated')); // Notify TopNav
            setToast({ message: "Photo de profil mise à jour !", type: "success" });

        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            setToast({ message: "Erreur lors de l'upload. Vérifiez que le bucket 'avatars' existe et est public.", type: "error" });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("saving");

        try {
            // 1. Update Profile Data
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    first_name: profile.firstName,
                    last_name: profile.lastName,
                    phone: profile.phone,
                    phone_code: profile.phoneCode
                    // Email is usually managed via Auth, updating it here in profiles is fine for display but doesn't change auth email
                })
                .eq('id', profile.id);

            if (profileError) throw profileError;

            // 2. Update Password (if provided)
            if (newPassword) {
                if (newPassword.length < 6) {
                    throw new Error(t.updatePassword?.errors?.length || "Le mot de passe doit contenir au moins 6 caractères");
                }
                if (newPassword !== confirmPassword) {
                    throw new Error(t.updatePassword?.errors?.match || "Les mots de passe ne correspondent pas");
                }

                const { error: passwordError } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (passwordError) throw passwordError;
            }

            setStatus("success");
            setToast({ message: t.settings.general.saved, type: "success" });
            window.dispatchEvent(new Event('profile-updated')); // Notify TopNav

            // Clear password fields
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => setStatus("idle"), 2000);

        } catch (error: any) {
            console.error("Error saving profile:", error);
            setToast({ message: error.message || "Erreur lors de la sauvegarde", type: "error" });
            setStatus("idle");
        }
    };

    const getInitials = () => {
        return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || <User size={32} />;
    };

    return (
        <div className="max-w-2xl space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t.settings.profile.title}</h2>
                <button
                    onClick={handleSave}
                    disabled={status !== "idle"}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${status === "success"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-[#0F4C5C] text-white hover:bg-[#0a3641]"
                        }`}
                >
                    {status === "saving" ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {t.settings.general.saving}
                        </>
                    ) : status === "success" ? (
                        <>
                            <CheckCircle size={16} />
                            {t.settings.general.saved}
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            {t.settings.general.save}
                        </>
                    )}
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-[#0F4C5C] text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg overflow-hidden relative">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                getInitials()
                            )}

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>

                        <button
                            type="button"
                            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#0F4C5C] shadow-sm transition-colors z-10"
                        >
                            {isUploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={16} />}
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                            {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {profile.role === 'OWNER' ? t.settings.team.roles.owner :
                                profile.role === 'MANAGER' ? t.settings.team.roles.manager :
                                    profile.role === 'ACCOUNTANT' ? t.settings.team.roles.accountant :
                                        profile.role}
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-[#0F4C5C] font-bold mt-1 hover:underline"
                        >
                            Modifier la photo
                        </button>
                    </div>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.firstName}</label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.lastName}</label>
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                                    title="L'email ne peut pas être modifié ici"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.phone}</label>
                            <div className="flex gap-2">
                                <select
                                    value={profile.phoneCode}
                                    onChange={(e) => setProfile({ ...profile, phoneCode: e.target.value })}
                                    className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none bg-white"
                                >
                                    <option value="+241">🇬🇦 +241</option>
                                    <option value="+33">🇫🇷 +33</option>
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+221">🇸🇳 +221</option>
                                    <option value="+225">🇨🇮 +225</option>
                                    <option value="+237">🇨🇲 +237</option>
                                </select>
                                <div className="relative flex-1">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                        placeholder="074 00 00 00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Password Change Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">{t.settings.profile.security}</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.newPassword}</label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1">{t.settings.profile.confirmPassword}</label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                        Laissez vide si vous ne souhaitez pas modifier votre mot de passe.
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">{t.settings.profile.preferences}</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-gray-900">{t.settings.profile.language}</div>
                            <div className="text-xs text-gray-500">{t.settings.profile.languageDesc}</div>
                        </div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                            className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F4C5C] outline-none text-sm font-medium"
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
