"use client";
import React, { useState, useEffect } from 'react';
import {
    Calendar, MapPin, Banknote, Check, Menu, X, ArrowRight,
    Smartphone, Star, Clock, HardHat, Utensils, ShoppingBag,
    ShieldAlert, ChevronDown, PhoneCall, Stethoscope, Calculator,
    TrendingUp, MessageCircle, AlertTriangle, Users, FileSpreadsheet,
    Zap, Copy, Move, QrCode, Mail, CreditCard, Layers,
    Linkedin, Facebook, Twitter, Lock, LifeBuoy, Monitor, Tablet, Activity, Smile, Coffee, HelpCircle, ChevronUp, User, Briefcase, Mail as MailIcon, ArrowLeft
} from 'lucide-react';

// --- COMPOSANTS UI RÉUTILISABLES (INCHANGÉS) ---

const PartnerLogo = ({ name, color }) => (
    <div className="flex items-center gap-2 font-bold text-slate-600 opacity-70 hover:opacity-100 transition-opacity select-none group bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm cursor-default">
        <div className={`w-6 h-6 rounded bg-${color}-100 flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}>
            <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
        </div>
        <span className="text-sm tracking-tight">{name}</span>
    </div>
);

const FAQItem = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-200 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left font-bold text-slate-800 hover:text-[#0F4C5C] transition-colors"
            >
                {q}
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isOpen && <div className="pb-4 text-slate-600 leading-relaxed animate-fadeIn text-sm">{a}</div>}
        </div>
    );
};

const PhoneMockup = ({ showNotification }) => (
    <div className="relative mx-auto w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-slate-700">
        <div className="w-full h-full bg-[#E5DDD5] relative flex flex-col font-sans">
            <div className="h-6 bg-[#075E54] w-full flex items-center justify-end px-4 space-x-1">
                <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
                <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
            </div>
            <div className="h-14 bg-[#075E54] w-full flex items-center px-4 gap-3 text-white shadow-md z-10">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold ring-1 ring-white/30">T</div>
                <div>
                    <div className="font-bold leading-tight">Timmy Bot</div>
                    <div className="text-[10px] opacity-80 leading-tight">En ligne</div>
                </div>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-hidden relative">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#075E54_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[90%] self-start animate-fadeIn text-sm text-slate-800 relative z-10">
                    <p className="font-bold text-[#075E54] text-xs mb-1">📅 Planning Hebdo</p>
                    Bonjour Mamadou. Voici ton service :<br />
                    📍 <strong>Chantier B</strong><br />
                    ⏰ <strong>08:00 - 17:00</strong>
                    <div className="text-[10px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">07:00</div>
                </div>

                <div className={`transition-all duration-700 transform ${showNotification ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} relative z-10`}>
                    <div className="bg-[#DCF8C6] p-2 rounded-lg rounded-tr-none shadow-sm ml-auto max-w-[90%] text-sm text-slate-800 border border-green-100">
                        <div className="flex gap-2">
                            <div className="w-16 h-20 bg-slate-200 rounded-md flex-shrink-0 overflow-hidden relative group">
                                <img src="https://placehold.co/100x120/555/fff?text=Photo" alt="Selfie" className="object-cover w-full h-full mix-blend-overlay" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <Check size={20} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="font-bold text-[#075E54] text-xs mb-1">✅ Pointage Validé</p>
                                <p className="text-xs leading-snug">Je suis arrivé chef !<br />Tout est OK.</p>
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-500 text-right mt-1 flex items-center justify-end gap-1">07:58 <span className="text-blue-500">✓✓</span></div>
                    </div>
                </div>
            </div>

            {/* Simulation Clavier/Input */}
            <div className="h-14 bg-[#F0F0F0] w-full flex items-center px-2 gap-2 border-t border-slate-300">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400">+</div>
                <div className="flex-1 h-9 bg-white rounded-full border border-slate-300 px-3 text-sm text-slate-400 flex items-center">Message...</div>
                <div className="w-9 h-9 rounded-full bg-[#075E54] flex items-center justify-center text-white"><Smartphone size={16} /></div>
            </div>
        </div>
    </div>
);

// --- FULL BOOKING EXPERIENCE COMPONENT (MAJOR UPGRADE) ---
const BookingModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Date/Time, 2: Info, 3: Success
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        companyType: '',
        employeeCount: ''
    });

    // Génération des 3 prochains jours ouvrés (Mock)
    const today = new Date();
    const dates = [0, 1, 2].map(offset => {
        const d = new Date(today);
        d.setDate(today.getDate() + offset + 1); // Start tomorrow
        return {
            day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
            date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            full: d
        };
    });

    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:30'];

    const handleNext = () => {
        if (step === 1 && selectedDate && selectedTime) setStep(2);
        if (step === 2 && formData.name && formData.email && formData.company && formData.companyType && formData.employeeCount) setStep(3);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Reset state on close
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep(1);
                setSelectedDate(null);
                setSelectedTime(null);
                setFormData({ name: '', email: '', phone: '', company: '', companyType: '', employeeCount: '' });
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">

                {/* Header Progress */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    {step > 1 && step < 3 ? (
                        <button onClick={handleBack} className="text-slate-400 hover:text-[#0F4C5C] flex items-center gap-1 text-sm font-semibold transition-colors">
                            <ArrowLeft size={16} /> Retour
                        </button>
                    ) : <div className="w-16"></div>}

                    <div className="flex gap-2">
                        <div className={`h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'w-8 bg-[#0F4C5C]' : 'w-2 bg-slate-200'}`}></div>
                        <div className={`h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'w-8 bg-[#0F4C5C]' : 'w-2 bg-slate-200'}`}></div>
                        <div className={`h-2 rounded-full transition-all duration-500 ${step >= 3 ? 'w-8 bg-[#0F4C5C]' : 'w-2 bg-slate-200'}`}></div>
                    </div>

                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-full p-1.5 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">

                    {/* STEP 1: DATE & TIME */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Quand êtes-vous disponible ?</h3>
                                <p className="text-sm text-slate-500">Choisissez un créneau pour une démo de 15 min.</p>
                            </div>

                            {/* Date Selector */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">1. Choisissez le jour</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {dates.map((d, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(i)}
                                            className={`py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${selectedDate === i ? 'border-[#0F4C5C] bg-[#0F4C5C] text-white shadow-lg scale-105' : 'border-slate-100 bg-white text-slate-600 hover:border-[#0F4C5C]/30'}`}
                                        >
                                            <span className="text-xs font-medium uppercase opacity-80">{d.day}</span>
                                            <span className="text-lg font-bold">{d.date}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Selector (Conditional) */}
                            <div className={`transition-all duration-500 ${selectedDate !== null ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">2. Choisissez l'heure</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {timeSlots.map((time, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-2 rounded-lg text-sm font-bold border transition-all ${selectedTime === time ? 'bg-[#FFC107] border-[#FFC107] text-slate-900 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-slate-300'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: INFO FORM */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">À propos de vous</h3>
                                <p className="text-sm text-slate-500">Pour préparer votre espace de démo personnalisé.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Prénom</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                            placeholder="Jean"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Nom de la Société</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                            placeholder="BTP Services"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Secteur d'activité</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all appearance-none"
                                            value={formData.companyType}
                                            onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                                        >
                                            <option value="" disabled>Choisir...</option>
                                            <option value="btp">BTP & Construction</option>
                                            <option value="restauration">Restauration & Hôtellerie</option>
                                            <option value="retail">Commerce & Retail</option>
                                            <option value="sante">Santé & Pharmacie</option>
                                            <option value="industrie">Industrie & Logistique</option>
                                            <option value="services">Services & Autre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Effectif</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all appearance-none"
                                            value={formData.employeeCount}
                                            onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                                        >
                                            <option value="" disabled>Choisir...</option>
                                            <option value="1-10">1 - 10 employés</option>
                                            <option value="11-50">11 - 50 employés</option>
                                            <option value="51-200">51 - 200 employés</option>
                                            <option value="201-500">201 - 500 employés</option>
                                            <option value="500+">500+ employés</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Pro</label>
                                    <div className="relative">
                                        <MailIcon size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="email"
                                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                            placeholder="jean@entreprise.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone (WhatsApp)</label>
                                    <div className="relative">
                                        <Smartphone size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                        <input
                                            type="tel"
                                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] focus:border-transparent outline-none transition-all"
                                            placeholder="+225 07..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 3 && (
                        <div className="text-center py-8 animate-fadeIn">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow shadow-lg shadow-green-100">
                                <Check size={40} strokeWidth={4} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">C'est confirmé !</h3>
                            <p className="text-slate-600 mb-8">
                                Votre rendez-vous est bloqué pour le <br />
                                <span className="font-bold text-[#0F4C5C] text-lg">
                                    {dates[selectedDate]?.day} {dates[selectedDate]?.date} à {selectedTime}
                                </span>.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left mb-6">
                                <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MailIcon size={16} /> Vérifiez vos emails</p>
                                <p className="text-xs text-slate-500">Un lien Google Meet vous a été envoyé à <strong>{formData.email}</strong>.</p>
                            </div>
                            <button onClick={onClose} className="w-full bg-[#0F4C5C] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#0a3540] transition-colors">
                                Fermer et retourner au site
                            </button>
                        </div>
                    )}

                </div>

                {/* Footer Actions (Steps 1 & 2 only) */}
                {step < 3 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
                        <button
                            onClick={handleNext}
                            disabled={step === 1 ? (!selectedDate || !selectedTime) : (!formData.name || !formData.email || !formData.companyType || !formData.employeeCount)}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${(step === 1 ? (selectedDate !== null && selectedTime) : (formData.name && formData.email && formData.companyType && formData.employeeCount))
                                    ? 'bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 transform hover:-translate-y-1'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {step === 1 ? 'Valider le créneau' : 'Confirmer le RDV'} <ArrowRight size={20} />
                        </button>
                        {step === 1 && (
                            <p className="text-xs text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                                <Lock size={10} /> Créneau réservé pendant 10 minutes
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const App = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('btp');
    const [scrolled, setScrolled] = useState(false);
    const [employees, setEmployees] = useState(15);
    const [hourlyRate, setHourlyRate] = useState(2000);
    const [showNotification, setShowNotification] = useState(false);

    // State pour la modale
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openBooking = () => setIsModalOpen(true);

    // Calcul ROI
    const monthlyLoss = Math.floor(((employees * 30 * 20 * hourlyRate) / 60));

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const timer = setInterval(() => {
            setShowNotification(prev => !prev);
        }, 4000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(timer);
        };
    }, []);

    const personas = {
        btp: {
            icon: <HardHat size={20} />,
            label: "BTP & Construction",
            pain: "« Impossible de surveiller 5 chantiers à la fois. »",
            subpain: "Feuilles d'heures remplies le vendredi soir 'au pif' ?",
            gain: "Géolocalisation forcée. Si l'employé n'est pas dans la zone (Geofence), le pointage est bloqué."
        },
        resto: {
            icon: <Utensils size={20} />,
            label: "Resto & Hôtellerie",
            pain: "« L'extra du samedi soir ne s'est pas réveillé. »",
            subpain: "Découverte de l'absence à 19h00 devant les clients ?",
            gain: "Alerte manager automatique 30 min avant le service si aucun pointage n'est détecté."
        },
        retail: {
            icon: <ShoppingBag size={20} />,
            label: "Retail & Commerce",
            pain: "« La boutique est censée ouvrir à 9h00 pile. »",
            subpain: "Le rideau est-il vraiment levé à l'heure ?",
            gain: "Notification 'Boutique Ouverte' avec photo obligatoire de la vitrine ou du rayon."
        },
        health: {
            icon: <Stethoscope size={20} />,
            label: "Santé & Pharmacie",
            pain: "« La garde de nuit est critique. Aucune erreur permise. »",
            subpain: "Comment prouver la présence nocturne ?",
            gain: "Pointages aléatoires de vérification pendant la nuit pour garantir la vigilance."
        }
    };

    const faqs = [
        {
            q: "Est-ce que ça fonctionne sans internet ?",
            a: "Oui, absolument. Notre pointeuse a un mode 'Hors Ligne'. Les données sont sauvegardées sur la tablette et envoyées dès que la connexion revient. C'est indispensable pour les chantiers isolés."
        },
        {
            q: "Mes employés n'ont pas de smartphone, c'est grave ?",
            a: "Non ! C'est vous (le manager) ou le chef d'équipe qui avez la tablette 'Kiosque'. Les employés tapent juste leur code PIN ou se prennent en photo sur la tablette unique."
        },
        {
            q: "Puis-je gérer les avances sur salaire ?",
            a: "Oui. Vous validez les demandes d'acomptes dans l'app, et Timmy les déduit automatiquement du calcul de paie en fin de mois. Plus d'erreurs ni d'oublis."
        },
        {
            q: "Puis-je gérer plusieurs sociétés ou chantiers ?",
            a: "Bien sûr. Timmy est multi-sites et multi-sociétés. Vous supervisez tout depuis un compte central, mais chaque chef de chantier ne voit que ce qui le concerne."
        },
        {
            q: "Mes données sont-elles en sécurité ?",
            a: "Vos données sont chiffrées (comme dans une banque). Nous respectons strictement les lois sur la protection des données personnelles en vigueur en Afrique."
        },
        {
            q: "Est-ce qu'il y a des coûts cachés (SMS, maintenance) ?",
            a: "Non. L'abonnement inclut tout : l'hébergement, les mises à jour, le support WhatsApp et les notifications illimitées (Push & WhatsApp)."
        },
        {
            q: "Comment se passe la formation de mes équipes ?",
            a: "L'outil est conçu pour être pris en main en 15 minutes. Nous fournissons des vidéos tutoriels très courtes que vous pouvez partager sur WhatsApp à vos chefs d'équipe."
        }
    ];

    return (
        <div className="font-sans text-slate-900 bg-slate-50 min-h-screen flex flex-col pb-20 md:pb-0 relative">

            {/* MODAL OVERLAY */}
            <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Navigation Pro */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3' : 'bg-[#0F4C5C] border-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-black text-xl shadow-md transition-colors ${scrolled ? 'bg-[#0F4C5C] text-white' : 'bg-white text-[#0F4C5C]'}`}>T</div>
                            <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-[#0F4C5C]' : 'text-white'}`}>Timmy</span>
                        </div>
                        <div className="hidden md:flex gap-6 items-center">
                            <a href="#" className={`text-sm font-semibold hover:underline ${scrolled ? 'text-slate-600' : 'text-slate-200'}`}>Tarifs</a>
                            <button
                                onClick={openBooking}
                                className="bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-yellow-500/30 flex items-center gap-2 transform active:scale-95"
                            >
                                <Calendar size={18} />
                                Audit Gratuit
                            </button>
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`${scrolled ? 'text-slate-800' : 'text-white'}`}>
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-[#0F4C5C]">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="text-white text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm shadow-sm">
                                <ShieldAlert size={12} />
                                Stop au vol d'heures
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] drop-shadow-sm">
                                Planifiez. Pointez.<br />
                                <span className="text-[#FFC107]">Payez le Réel.</span>
                            </h1>
                            <p className="text-xl text-slate-200 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 font-light">
                                La solution complète connectée à <strong>WhatsApp</strong> et <strong>Sage</strong>. Gérez shifts, retards et acomptes en gardant votre santé mentale.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    onClick={openBooking}
                                    className="flex items-center justify-center gap-3 bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-yellow-900/20 hover:scale-105"
                                >
                                    <Smartphone className="w-6 h-6" />
                                    Voir la démo WhatsApp
                                </button>
                                <button className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm">
                                    Comment ça marche ?
                                </button>
                            </div>
                        </div>
                        <div className="hidden lg:block transform hover:scale-105 transition duration-700">
                            <PhoneMockup showNotification={showNotification} />
                        </div>
                    </div>
                </div>
            </section>

            {/* PLATFORMS & INTEGRATIONS STRIP */}
            <div className="bg-slate-50 border-b border-slate-200 shadow-sm relative z-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    {/* Platforms */}
                    <div className="flex flex-col items-center lg:items-end justify-center px-4 gap-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Disponible partout</p>
                        <div className="flex items-center gap-6 opacity-70">
                            <div className="flex flex-col items-center gap-1"><Smartphone size={24} className="text-slate-600" /><span className="text-xs font-semibold">Mobile</span></div>
                            <div className="flex flex-col items-center gap-1"><Tablet size={24} className="text-slate-600" /><span className="text-xs font-semibold">Tablette</span></div>
                            <div className="flex flex-col items-center gap-1"><Monitor size={24} className="text-slate-600" /><span className="text-xs font-semibold">Web Admin</span></div>
                        </div>
                    </div>
                    {/* Integrations */}
                    <div className="flex flex-col items-center lg:items-start justify-center px-4 gap-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Intégrations Natives</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <PartnerLogo name="SAGE PAIE" color="green" />
                            <PartnerLogo name="Orange Money" color="orange" />
                            <PartnerLogo name="MTN MoMo" color="yellow" />
                            <PartnerLogo name="Excel" color="emerald" />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEGMENTATION */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-[#0F4C5C]">Votre métier, vos contraintes</h2>
                        <p className="text-slate-500 mt-2">Timmy s'adapte à votre réalité, pas l'inverse.</p>
                    </div>

                    <div className="flex justify-center flex-wrap gap-3 mb-12">
                        {Object.keys(personas).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all border-2 ${activeTab === key ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-lg transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                            >
                                {personas[key].icon} {personas[key].label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 lg:p-12 shadow-inner">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="bg-red-50 inline-block px-4 py-1.5 rounded-lg border border-red-100 mb-6">
                                    <p className="text-red-600 font-bold text-sm flex items-center gap-2"><ShieldAlert size={16} /> Le Problème</p>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">"{personas[activeTab].pain}"</h3>
                                <p className="text-slate-500 italic mb-8 border-l-4 border-slate-300 pl-4 py-1">{personas[activeTab].subpain}</p>

                                <div className="space-y-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 bg-[#0F4C5C] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-teal-900/20">
                                            <Check size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Solution Timmy</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed mt-1">{personas[activeTab].gain}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Illustration Contextuelle */}
                            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex items-center justify-center aspect-video relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>
                                <div className="absolute -right-10 -bottom-10 text-slate-200 opacity-50 transform rotate-12">
                                    {React.cloneElement(personas[activeTab].icon, { size: 200 })}
                                </div>
                                <div className="relative z-10 text-center">
                                    <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                        {React.cloneElement(personas[activeTab].icon, { size: 40, className: "text-[#0F4C5C]" })}
                                    </div>
                                    <p className="font-bold text-slate-800">Mode {personas[activeTab].label}</p>
                                    <p className="text-xs text-slate-400 mt-1">Configuration active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3 WAYS TO SAVE SANITY */}
            <section className="py-20 bg-[#f0f9ff] border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">3 façons dont Timmy vous sauve la vie</h2>
                        <p className="text-slate-600">Au-delà du gain d'argent, c'est votre tranquillité d'esprit qui compte.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                                <Activity size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">La Fin du "Parole contre Parole"</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                L'employé jure être arrivé à 8h. Vous dites 9h. La photo géolocalisée tranche le débat instantanément. Plus de conflits toxiques.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6">
                                <Coffee size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Le Vendredi Soir Libéré</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Ne passez plus vos week-ends à déchiffrer des carnets gribouillés. L'export paie est prêt le vendredi à 17h00. Rentrez chez vous l'esprit léger.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                <Smile size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">L'Équité Retrouvée</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Les employés sérieux sont frustrés quand les retardataires ne sont pas punis. Timmy remet tout le monde sur un pied d'égalité. L'ambiance s'améliore.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* L'ARSENAL DU MANAGER */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#0F4C5C] mb-4">L'Arsenal du Manager</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                            De la planification au virement de salaire, tout est connecté.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Planning */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <Calendar size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Planning Drag & Drop</h3>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                Notre interface intuitive centralise congés, absences et shifts. Glissez les horaires, dupliquez vos semaines types et notifiez instantanément vos équipes sur WhatsApp. Fini les erreurs de recopie Excel.
                            </p>
                            <div className="h-1 w-12 bg-blue-100 rounded group-hover:w-full transition-all duration-500"></div>
                        </div>

                        {/* Pointeuse */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                                <QrCode size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Pointeuse Kiosque</h3>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                Transformez une simple tablette Android en borne de pointage infalsifiable. Fonctionne hors-ligne, détecte les faux GPS et exige une photo (selfie) à chaque pointage pour garantir l'identité.
                            </p>
                            <div className="h-1 w-12 bg-purple-100 rounded group-hover:w-full transition-all duration-500"></div>
                        </div>

                        {/* Alertes */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Alertes Anti-Feu</h3>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                Ne soyez plus le dernier informé. Timmy veille 24/7. Recevez une alerte immédiate si une borne ne répond plus, si un employé clé est absent, ou si le quota d'heures sup est dépassé.
                            </p>
                            <div className="h-1 w-12 bg-red-100 rounded group-hover:w-full transition-all duration-500"></div>
                        </div>

                        {/* Paie & Avances - Featured Box */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group md:col-span-2 lg:col-span-3 flex flex-col md:flex-row gap-10 items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                        <Banknote size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Gestion Financière & Avances</h3>
                                </div>
                                <p className="text-slate-600 text-sm mb-6 leading-relaxed max-w-lg">
                                    Gérez les demandes d'acomptes au fil de l'eau directement dans l'app. En fin de mois, Timmy consolide tout automatiquement : heures normales, heures majorées, primes, absences et acomptes déjà versés. Plus aucun calcul manuel.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">Export Sage</span>
                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">Paiement Mobile Money</span>
                                </div>
                            </div>

                            {/* CSS-Only Fiche de Paie Mini-Mockup */}
                            <div className="w-full md:w-80 bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-inner font-mono text-xs">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                                    <span className="font-bold text-slate-700">PRÉPAIE AVRIL</span>
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">VALIDÉ</span>
                                </div>
                                <div className="space-y-2 opacity-80">
                                    <div className="flex justify-between"><span>Base (160h)</span><span>160.000 F</span></div>
                                    <div className="flex justify-between text-blue-600"><span>H. Sup (8h)</span><span>+12.000 F</span></div>
                                    <div className="flex justify-between text-red-500"><span>Avance 12/04</span><span>-20.000 F</span></div>
                                    <div className="flex justify-between text-red-500"><span>Retards (2h)</span><span>-2.000 F</span></div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-300 flex justify-between font-bold text-sm text-slate-900">
                                    <span>NET À PAYER</span>
                                    <span>150.000 F</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROI CALCULATOR (Restored Dark Mode) */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F4C5C] rounded-full filter blur-[100px] opacity-30 -mr-20 -mt-20"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Combien vous coûte l'approximation ?</h2>
                        <p className="text-slate-400">Calcul basé sur <span className="text-white font-bold">30 min perdues/jour</span> (retard + départ anticipé + pauses étendues).</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 md:p-12">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Effectif</label>
                                        <span className="text-2xl font-bold text-[#FFC107]">{employees}</span>
                                    </div>
                                    <input
                                        type="range" min="5" max="200" step="5"
                                        value={employees}
                                        onChange={(e) => setEmployees(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#FFC107]"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-300 uppercase tracking-wider block mb-3">Salaire Moyen (FCFA/h)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[1500, 2500, 5000].map(rate => (
                                            <button
                                                key={rate}
                                                onClick={() => setHourlyRate(rate)}
                                                className={`py-2 rounded-lg text-sm font-bold transition-all border ${hourlyRate === rate ? 'bg-[#FFC107] text-slate-900 border-[#FFC107]' : 'bg-transparent text-slate-400 border-slate-600 hover:border-slate-400'}`}
                                            >
                                                {rate}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Perte Mensuelle Estimée</p>
                                <div className="text-5xl font-black text-white mb-2 tracking-tight">
                                    {monthlyLoss.toLocaleString()} <span className="text-lg font-medium text-slate-500">FCFA</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-6">Soit {Math.floor(monthlyLoss * 12).toLocaleString()} FCFA par an.</p>
                                <button
                                    onClick={openBooking}
                                    className="w-full bg-[#0F4C5C] hover:bg-[#0a3540] text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105"
                                >
                                    Arrêter l'hémorragie <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 30 DAYS ROADMAP */}
            <section className="py-24 bg-white relative">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#0F4C5C] mb-4">Ce que vous allez accomplir en 30 jours</h2>
                        <p className="text-slate-600">Pas de bla-bla. Des résultats concrets.</p>
                    </div>

                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 transform md:-translate-x-1/2"></div>

                        {/* Step 1 */}
                        <div className="relative flex items-center justify-between mb-12 md:mb-24 group">
                            <div className="hidden md:block w-5/12 text-right pr-8">
                                <h3 className="text-xl font-bold text-[#0F4C5C]">Installation & Setup</h3>
                                <p className="text-slate-600 text-sm mt-2">Nous configurons vos sites, vos employés, et votre premier planning est publié.</p>
                            </div>
                            <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-white border-4 border-[#0F4C5C] rounded-full transform -translate-x-1/2 z-10 flex items-center justify-center font-bold text-xs text-[#0F4C5C]">J1</div>
                            <div className="pl-12 md:pl-8 w-full md:w-5/12">
                                <div className="md:hidden mb-2">
                                    <h3 className="text-xl font-bold text-[#0F4C5C]">Installation & Setup</h3>
                                    <p className="text-slate-600 text-sm mt-2">Premier planning publié.</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm text-xs font-mono text-slate-500">
                                    <span className="text-green-600">✓</span> 15 employés importés<br />
                                    <span className="text-green-600">✓</span> Tablette Kiosque activée<br />
                                    <span className="text-green-600">✓</span> Planning envoyé
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-center justify-between mb-12 md:mb-24">
                            <div className="hidden md:block w-5/12 text-right pr-8">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm text-xs font-mono text-slate-500 inline-block text-left">
                                    <span className="font-bold">Alerte :</span> Retard Moussa (Chantier A)<br />
                                    <span className="font-bold">Action :</span> Remplaçant trouvé
                                </div>
                            </div>
                            <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-white border-4 border-[#FFC107] rounded-full transform -translate-x-1/2 z-10 flex items-center justify-center font-bold text-xs text-slate-900">J7</div>
                            <div className="pl-12 md:pl-8 w-full md:w-5/12">
                                <h3 className="text-xl font-bold text-slate-900">Première Paie Juste</h3>
                                <p className="text-slate-600 text-sm mt-2">
                                    Vous générez votre premier rapport de paie fiable à 100%. Aucune réclamation d'employé, aucun doute.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-center justify-between">
                            <div className="hidden md:block w-5/12 text-right pr-8">
                                <h3 className="text-xl font-bold text-slate-900">Rentabilité Atteinte</h3>
                                <p className="text-slate-600 text-sm mt-2">La réduction des retards et des heures fictives a déjà remboursé l'abonnement. Vous vous demandez pourquoi vous n'avez pas changé plus tôt ?</p>
                            </div>
                            <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-[#0F4C5C] rounded-full transform -translate-x-1/2 z-10 flex items-center justify-center font-bold text-xs text-white">J30</div>
                            <div className="pl-12 md:pl-8 w-full md:w-5/12">
                                <div className="md:hidden">
                                    <h3 className="text-xl font-bold text-slate-900">Rentabilité Atteinte</h3>
                                    <p className="text-slate-600 text-sm mt-2">Vous vous demandez pourquoi vous n'avez pas changé plus tôt ?</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm text-center">
                                    <p className="text-3xl font-bold text-green-600">-20%</p>
                                    <p className="text-xs text-green-800 uppercase font-bold">de masse salariale</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SUPPORT WHATSAPP */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold mb-4">
                            <LifeBuoy size={14} /> Support VIP
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Un support qui vous répond vraiment. H24.</h2>
                        <p className="text-slate-600 mb-6 text-lg">
                            Pas de tickets, pas d'emails froids. Nous sommes disponibles sur <strong>WhatsApp</strong>, là où vous êtes déjà.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Check className="text-green-600 mt-1" size={18} />
                                <span className="text-slate-700 text-sm"><strong>Timmy Bot</strong> répond instantanément aux questions courantes (codes PIN oubliés, etc).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="text-green-600 mt-1" size={18} />
                                <span className="text-slate-700 text-sm">Escalade vers un <strong>humain expert</strong> en moins de 15 minutes si besoin.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Chat Simulation */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 relative">
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <div className="bg-green-100 text-green-900 p-3 rounded-lg rounded-tr-none text-sm max-w-[80%]">
                                    J'ai oublié comment ajouter un nouveau chantier 😅
                                    <div className="text-[10px] text-green-700 text-right opacity-70 mt-1">10:42</div>
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-slate-100 text-slate-800 p-3 rounded-lg rounded-tl-none text-sm max-w-[90%]">
                                    Pas de souci ! Voici une vidéo de 30 secondes qui montre comment faire 👇
                                    <br /><br />
                                    <i>[Vidéo: Ajout Chantier]</i>
                                    <br />
                                    Besoin d'autre chose ?
                                    <div className="text-[10px] text-slate-500 text-right opacity-70 mt-1">10:42</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-[#25D366] text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 text-sm animate-bounce">
                            <Smartphone size={16} /> Chat en direct
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-white border-t border-slate-200">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-[#0F4C5C]">Questions Fréquentes</h2>
                        <p className="text-slate-600">Tout ce que vous devez savoir avant de commencer.</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-2">
                        {faqs.map((item, i) => (
                            <FAQItem key={i} q={item.q} a={item.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA (Updated Dynamic) */}
            <section className="py-24 bg-white text-center pb-32">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Reprenez le contrôle.</h2>
                    <p className="text-xl text-slate-600 mb-10">L'audit de 15 minutes est gratuit. La tranquillité d'esprit n'a pas de prix.</p>

                    <button
                        onClick={openBooking}
                        className="w-full md:w-auto bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 px-10 py-5 rounded-xl font-bold text-xl transition-all shadow-xl hover:shadow-yellow-500/30 flex items-center justify-center gap-3 transform hover:-translate-y-1 hover:scale-105"
                    >
                        <Calendar size={24} />
                        Réserver mon créneau
                    </button>

                    <div className="mt-8 flex justify-center gap-8 text-sm text-slate-400 font-medium">
                        <span className="flex items-center gap-2"><Lock size={14} /> Données chiffrées</span>
                        <span className="flex items-center gap-2"><Check size={14} /> Support 7j/7</span>
                    </div>
                </div>
            </section>

            {/* PROFESSIONAL FOOTER */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded bg-[#0F4C5C] flex items-center justify-center text-white font-bold">T</div>
                            <span className="font-bold text-xl text-[#0F4C5C]">Timmy</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            La solution de gestion RH terrain n°1 en Afrique Francophone. Conçue pour la réalité locale.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#0F4C5C] hover:text-white transition-colors"><Linkedin size={16} /></a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#0F4C5C] hover:text-white transition-colors"><Twitter size={16} /></a>
                            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[#0F4C5C] hover:text-white transition-colors"><Facebook size={16} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Produit</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[#0F4C5C]">Fonctionnalités</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">Pointeuse Kiosque</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">Intégration Sage</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">Tarifs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Ressources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[#0F4C5C]">Blog Management</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">Guide Législation</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">Centre d'aide</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">Calculateur ROI</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Légal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-[#0F4C5C]">Mentions Légales</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">Confidentialité (RGPD)</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">CGU</a></li>
                            <li><a href="#" className="hover:text-[#0F4C5C]">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <p>&copy; 2024 Timmy SAS. Tous droits réservés.</p>
                    <p>Fait avec ❤️ à Abidjan & Dakar.</p>
                </div>
            </footer>

            {/* MOBILE STICKY BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 md:hidden z-[60] shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex items-center gap-3 safe-area-pb">
                <div className="flex-1 pl-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Audit Offert</p>
                    <p className="text-sm font-bold text-[#0F4C5C] leading-none">Stop aux pertes</p>
                </div>
                <button
                    onClick={openBooking}
                    className="bg-[#FFC107] text-slate-900 px-5 py-3 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm"
                >
                    <Calendar size={18} />
                    Réserver
                </button>
            </div>

        </div>
    );
};

export default App;