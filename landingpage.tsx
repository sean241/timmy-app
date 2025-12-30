import React, { useState, useEffect } from 'react';
import {
    Calendar, MapPin, Banknote, Check, Menu, X, ArrowRight,
    Smartphone, Star, Clock, HardHat, Utensils, ShoppingBag,
    ShieldAlert, ChevronDown, PhoneCall, Stethoscope, Calculator,
    TrendingUp, MessageCircle, AlertTriangle, Users, FileSpreadsheet,
    Zap, Copy, Move, QrCode, Mail, CreditCard, Layers,
    Linkedin, Facebook, Twitter, Lock, LifeBuoy, Monitor, Tablet, Activity, Smile, Coffee, HelpCircle, ChevronUp, User, Briefcase, Mail as MailIcon, ArrowLeft,
    WifiOff, Image as ImageIcon, KeyRound, LayoutDashboard, Globe, Sparkles, Loader2, Send
} from 'lucide-react';

// --- API CONFIGURATION ---
const apiKey = ""; // La clé API sera injectée par l'environnement d'exécution

// --- COMPOSANTS UI RÉUTILISABLES ---

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

// Composant Assistant IA
const AIAssistantSection = () => {
    const [employeeName, setEmployeeName] = useState('');
    const [situation, setSituation] = useState('retard');
    const [tone, setTone] = useState('strict');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateMessage = async () => {
        if (!employeeName) {
            setError("Veuillez entrer un prénom.");
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedMessage('');

        const prompt = `Agis comme un manager RH professionnel. Rédige un message WhatsApp court et clair pour un employé nommé "${employeeName}".
    Contexte : ${situation}.
    Ton : ${tone}.
    Le message doit être adapté au contexte du travail en Afrique francophone (courtois mais direct). Inclus des emojis pertinents. Ne mets pas de guillemets.`;

        try {
            // Retry logic with exponential backoff
            const fetchWithRetry = async (retries = 3, delay = 1000) => {
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }]
                        })
                    });

                    if (!response.ok) throw new Error('API Error');
                    return await response.json();
                } catch (err) {
                    if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return fetchWithRetry(retries - 1, delay * 2);
                    }
                    throw err;
                }
            };

            const data = await fetchWithRetry();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            setGeneratedMessage(text || "Désolé, je n'ai pas pu générer le message. Veuillez réessayer.");
        } catch (err) {
            setGeneratedMessage("Erreur de connexion à l'assistant. Vérifiez votre connexion.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="py-24 bg-gradient-to-br from-slate-900 to-[#0F4C5C] text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-[#FFC107] rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm text-[#FFC107]">
                        <Sparkles size={14} /> Nouvelle fonctionnalité
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                        L'IA Timmy rédige vos messages <span className="text-[#FFC107]">en 1 clic.</span>
                    </h2>
                    <p className="text-slate-200 text-lg mb-8 leading-relaxed">
                        Ne perdez plus de temps à chercher vos mots pour recadrer un retard ou annoncer un changement. Notre assistant IA génère le message WhatsApp parfait pour chaque situation.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3">
                            <div className="bg-[#FFC107] text-slate-900 p-1 rounded-full"><Check size={14} strokeWidth={3} /></div>
                            <span className="font-medium">Adapté au contexte local</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="bg-[#FFC107] text-slate-900 p-1 rounded-full"><Check size={14} strokeWidth={3} /></div>
                            <span className="font-medium">Ton professionnel garanti</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="bg-[#FFC107] text-slate-900 p-1 rounded-full"><Check size={14} strokeWidth={3} /></div>
                            <span className="font-medium">Prêt à copier-coller</span>
                        </li>
                    </ul>
                </div>

                {/* AI TOOL INTERFACE */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-slate-900">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 bg-gradient-to-tr from-[#0F4C5C] to-teal-400 rounded-lg flex items-center justify-center text-white">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Assistant de Com'</h3>
                            <p className="text-xs text-slate-500">Générateur de messages manager</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employé</label>
                            <input
                                type="text"
                                placeholder="Ex: Mamadou, Sarah..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] outline-none transition-all"
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Situation</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] outline-none transition-all appearance-none"
                                    value={situation}
                                    onChange={(e) => setSituation(e.target.value)}
                                >
                                    <option value="retard">Retard ce matin</option>
                                    <option value="absence">Absence injustifiée</option>
                                    <option value="planning">Changement planning</option>
                                    <option value="felicitations">Félicitations</option>
                                    <option value="rappel">Rappel sécurité</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ton</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0F4C5C] outline-none transition-all appearance-none"
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                >
                                    <option value="strict">Ferme & Strict</option>
                                    <option value="bienveillant">Bienveillant</option>
                                    <option value="neutre">Neutre & Factuel</option>
                                    <option value="motivant">Motivant</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={generateMessage}
                            disabled={isLoading}
                            className="w-full bg-[#0F4C5C] hover:bg-teal-900 text-white py-3 rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                            {isLoading ? "Rédaction en cours..." : "Générer le message"}
                        </button>

                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                        {/* Result Area */}
                        <div className={`mt-6 transition-all duration-500 ${generatedMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="bg-[#DCF8C6] p-4 rounded-xl rounded-tr-none shadow-inner border border-green-100 relative">
                                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{generatedMessage}</p>
                                <div className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 text-green-600">
                                    <MessageCircle size={16} fill="currentColor" />
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => { navigator.clipboard.writeText(generatedMessage) }}
                                    className="text-xs font-bold text-slate-400 hover:text-[#0F4C5C] flex items-center gap-1 transition-colors"
                                >
                                    <Copy size={12} /> Copier le texte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Composant Mockup Hero (Desktop + Tablet + Phone)
const HeroComposition = () => (
    <div className="relative w-full max-w-2xl mx-auto h-[300px] md:h-[450px] mt-8 lg:mt-0">
        {/* Desktop Dashboard (Back) */}
        <div className="absolute top-0 right-0 w-[85%] h-[80%] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10">
            <div className="h-6 bg-slate-100 border-b border-slate-200 flex items-center px-2 gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            <div className="p-3">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">Tableau de bord</div>
                        <div className="text-lg font-bold text-[#0F4C5C]">Vue d'ensemble</div>
                    </div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">En direct</div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100"><div className="text-xl font-bold text-slate-800">42</div><div className="text-[10px] text-slate-500">Présents</div></div>
                    <div className="bg-red-50 p-2 rounded border border-red-100"><div className="text-xl font-bold text-red-600">3</div><div className="text-[10px] text-red-500">Retards</div></div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100"><div className="text-xl font-bold text-slate-800">160h</div><div className="text-[10px] text-slate-500">Total sem.</div></div>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-2 border-b border-slate-50 pb-2">
                            <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 h-2 bg-slate-100 rounded"></div>
                            <div className="w-10 h-2 bg-green-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Tablet Kiosk (Middle Left) */}
        <div className="absolute bottom-8 left-0 w-[45%] h-[60%] bg-slate-800 rounded-xl shadow-2xl border-[6px] border-slate-900 overflow-hidden z-20">
            <div className="w-full h-full bg-white relative flex flex-col items-center justify-center p-4 text-center">
                <div className="absolute top-2 w-12 h-1 bg-slate-200 rounded-full"></div>
                <div className="w-12 h-12 bg-[#0F4C5C] rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">T</div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-4">Pointeuse Chantier A</p>
                <div className="grid grid-cols-3 gap-2 w-full max-w-[120px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <div key={n} className="aspect-square bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">{n}</div>
                    ))}
                </div>
            </div>
        </div>

        {/* Phone WhatsApp (Front Right) */}
        <div className="absolute bottom-0 right-8 w-[25%] h-[70%] bg-slate-900 rounded-[20px] shadow-2xl border-[4px] border-slate-900 overflow-hidden z-30">
            <div className="w-full h-full bg-[#E5DDD5] relative">
                <div className="h-8 bg-[#075E54] w-full flex items-center px-2">
                    <div className="w-12 h-1 bg-white/20 rounded"></div>
                </div>
                <div className="p-2 space-y-2">
                    <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm text-[8px]">
                        <span className="font-bold text-[#075E54]">Timmy</span><br />
                        Planning de demain :<br />08:00 - 17:00
                    </div>
                    <div className="bg-[#DCF8C6] p-2 rounded-lg rounded-tr-none shadow-sm text-[8px] ml-auto w-fit">
                        Bien reçu chef 👍
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- BOOKING MODAL COMPONENT ---
const BookingModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', company: '', companyType: '', employeeCount: ''
    });

    const today = new Date();
    const dates = [0, 1, 2].map(offset => {
        const d = new Date(today);
        d.setDate(today.getDate() + offset + 1);
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

    const handleBack = () => { if (step > 1) setStep(step - 1); };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep(1); setSelectedDate(null); setSelectedTime(null);
                setFormData({ name: '', email: '', phone: '', company: '', companyType: '', employeeCount: '' });
            }, 300);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                    {step > 1 && step < 3 ? (
                        <button onClick={handleBack} className="text-slate-400 hover:text-[#0F4C5C] flex items-center gap-1 text-sm font-semibold transition-colors"><ArrowLeft size={16} /> Retour</button>
                    ) : <div className="w-16"></div>}
                    <div className="flex gap-2">
                        {[1, 2, 3].map(s => <div key={s} className={`h-2 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-[#0F4C5C]' : 'w-2 bg-slate-200'}`}></div>)}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-full p-1.5 transition-colors"><X size={18} /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3"><Calendar size={24} /></div>
                                <h3 className="text-xl font-bold text-slate-900">Quand êtes-vous disponible ?</h3>
                                <p className="text-sm text-slate-500">Choisissez un créneau pour une démo de 15 min.</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">1. Choisissez le jour</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {dates.map((d, i) => (
                                        <button key={i} onClick={() => setSelectedDate(i)} className={`py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${selectedDate === i ? 'border-[#0F4C5C] bg-[#0F4C5C] text-white shadow-lg' : 'border-slate-100 bg-white text-slate-600 hover:border-[#0F4C5C]/30'}`}>
                                            <span className="text-xs font-medium uppercase opacity-80">{d.day}</span>
                                            <span className="text-lg font-bold">{d.date}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={`transition-all duration-500 ${selectedDate !== null ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">2. Choisissez l'heure</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {timeSlots.map((time, i) => (
                                        <button key={i} onClick={() => setSelectedTime(time)} className={`py-2 rounded-lg text-sm font-bold border transition-all ${selectedTime === time ? 'bg-[#FFC107] border-[#FFC107] text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-slate-300'}`}>{time}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3"><User size={24} /></div>
                                <h3 className="text-xl font-bold text-slate-900">À propos de vous</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F4C5C]" placeholder="Prénom" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F4C5C]" placeholder="Société" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F4C5C]" value={formData.companyType} onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}>
                                        <option value="" disabled>Secteur...</option>
                                        <option value="btp">BTP</option>
                                        <option value="restauration">Restauration</option>
                                        <option value="retail">Commerce</option>
                                        <option value="sante">Santé</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F4C5C]" value={formData.employeeCount} onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}>
                                        <option value="" disabled>Effectif...</option>
                                        <option value="1-10">1-10</option>
                                        <option value="11-50">11-50</option>
                                        <option value="50+">50+</option>
                                    </select>
                                </div>
                                <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F4C5C]" placeholder="Email Pro" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                <input type="tel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0F4C5C]" placeholder="WhatsApp (+225...)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="text-center py-8 animate-fadeIn">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} strokeWidth={4} /></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">C'est confirmé !</h3>
                            <p className="text-slate-600 mb-8">RDV le <span className="font-bold text-[#0F4C5C]">{dates[selectedDate]?.date} à {selectedTime}</span>.</p>
                            <button onClick={onClose} className="w-full bg-[#0F4C5C] text-white py-3 rounded-xl font-bold">Fermer</button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step < 3 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
                        <button onClick={handleNext} disabled={step === 1 ? (!selectedDate || !selectedTime) : (!formData.name || !formData.email || !formData.companyType || !formData.employeeCount)} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${(step === 1 ? (selectedDate !== null && selectedTime) : (formData.name && formData.email && formData.companyType && formData.employeeCount)) ? 'bg-[#FFC107] hover:bg-[#e0a800] text-slate-900' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                            {step === 1 ? 'Valider le créneau' : 'Confirmer le RDV'} <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN APP ---

const App = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openBooking = () => setIsModalOpen(true);
    const [employees, setEmployees] = useState(15);
    const [hourlyRate, setHourlyRate] = useState(2000);
    const monthlyLoss = Math.floor(((employees * 30 * 20 * hourlyRate) / 60));

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="font-sans text-slate-900 bg-white min-h-screen flex flex-col relative pb-20 md:pb-0">

            <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Navigation */}
            <nav className={`sticky top-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3' : 'bg-white border-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#0F4C5C] text-white font-black text-xl shadow-md">T</div>
                            <span className="text-2xl font-bold tracking-tight text-[#0F4C5C]">Timmy</span>
                        </div>
                        <div className="hidden md:flex gap-6 items-center">
                            <button onClick={openBooking} className="bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 px-6 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-yellow-500/30 active:scale-95">
                                Démarrer l'essai gratuit
                            </button>
                        </div>
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#0F4C5C]"><Menu size={28} /></button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* BLOC 1: HERO (LA VITRINE) */}
            <section className="relative pt-10 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider mb-6">
                                🇬🇦 LE N°1 DE LA GESTION RH AU GABON
                            </span>
                            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900">
                                La fin des retards et des <span className="text-[#0F4C5C]">heures fictives.</span>
                            </h1>
                            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                                Planifiez les horaires, contrôlez les présences par photo et automatisez la paie. Fonctionne avec ou sans Internet.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button onClick={openBooking} className="bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:-translate-y-1 transition-all">
                                    Démarrer l'essai gratuit
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-8 py-4 rounded-xl font-bold text-lg transition-all">
                                    <Activity size={20} /> Voir la démo (1 min)
                                </button>
                            </div>
                            <div className="mt-6 flex items-center justify-center lg:justify-start gap-1 text-sm text-slate-500 font-medium">
                                <Star size={16} className="text-[#FFC107] fill-[#FFC107]" />
                                <Star size={16} className="text-[#FFC107] fill-[#FFC107]" />
                                <Star size={16} className="text-[#FFC107] fill-[#FFC107]" />
                                <Star size={16} className="text-[#FFC107] fill-[#FFC107]" />
                                <Star size={16} className="text-[#FFC107] fill-[#FFC107]" />
                                <span className="ml-2">Déjà adopté par +200 chantiers et bureaux.</span>
                            </div>
                        </div>

                        {/* Composition Visuelle Hero */}
                        <HeroComposition />
                    </div>
                </div>
            </section>

            {/* BLOC 2: PREUVE SOCIALE */}
            <div className="bg-slate-50 py-10 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Ils font confiance à Timmy pour gérer leurs équipes</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="text-xl font-black text-slate-800 flex items-center gap-2"><HardHat /> BTP CONSTRUCT</div>
                        <div className="text-xl font-black text-slate-800 flex items-center gap-2"><Utensils /> MAQUIS 225</div>
                        <div className="text-xl font-black text-slate-800 flex items-center gap-2"><ShoppingBag /> SUPER CASH</div>
                        <div className="text-xl font-black text-slate-800 flex items-center gap-2"><Briefcase /> SECURIGROUP</div>
                    </div>
                </div>
            </div>

            {/* BLOC 3: DIAGNOSTIC (AVANT/APRÈS) - NOUVEAU DESIGN ATTRAYANT */}
            <section className="py-24 bg-white relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                    <div className="absolute -left-20 top-20 w-72 h-72 bg-red-100 rounded-full blur-[80px]"></div>
                    <div className="absolute -right-20 bottom-20 w-72 h-72 bg-teal-100 rounded-full blur-[80px]"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-[#0F4C5C] font-bold tracking-wider text-sm uppercase">Diagnostic</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Gérez-vous encore vos équipes "à l'ancienne" ?</h2>
                        <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">La méthode traditionnelle vous coûte du temps et de l'argent. Passez au digital.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">

                        {/* CARD 1: THE OLD WAY (Chaos) */}
                        <div className="bg-slate-50 p-8 lg:p-10 rounded-3xl border border-slate-200 relative group hover:border-red-200 transition-all duration-300">
                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white text-red-600 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-red-100 shadow-sm flex items-center gap-2">
                                <AlertTriangle size={14} /> La méthode Risquée
                            </div>

                            <div className="mt-4 space-y-6">
                                <div className="flex items-start gap-4 opacity-70">
                                    <div className="bg-red-100 p-2 rounded-lg text-red-600 mt-1"><FileSpreadsheet size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-700">Cahiers & Excel</h4>
                                        <p className="text-sm text-slate-500">Données illisibles, fichiers perdus, ressaisies interminables.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 opacity-70">
                                    <div className="bg-red-100 p-2 rounded-lg text-red-600 mt-1"><Users size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-700">"Buddy Punching"</h4>
                                        <p className="text-sm text-slate-500">Un ami pointe pour un absent. Impossible à vérifier.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 opacity-70">
                                    <div className="bg-red-100 p-2 rounded-lg text-red-600 mt-1"><Activity size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-700">Stress fin de mois</h4>
                                        <p className="text-sm text-slate-500">Erreurs de paie, conflits avec les employés, perte de confiance.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: THE NEW WAY (Timmy) */}
                        <div className="bg-[#0F4C5C] p-8 lg:p-10 rounded-3xl shadow-2xl relative transform md:scale-105 z-10 border border-teal-800 text-white">
                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#FFC107] text-slate-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                                <Star size={14} fill="currentColor" /> La méthode Timmy
                            </div>

                            <div className="mt-4 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/10 p-2 rounded-lg text-[#FFC107] mt-1"><Tablet size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-white">Pointage Sécurisé</h4>
                                        <p className="text-sm text-teal-100">Tablette Kiosque avec photo preuve. Impossible de tricher.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/10 p-2 rounded-lg text-[#FFC107] mt-1"><Calculator size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-white">Paie Automatique</h4>
                                        <p className="text-sm text-teal-100">Calcul instantané des heures, retards et primes. 0 erreur.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/10 p-2 rounded-lg text-[#FFC107] mt-1"><Smile size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-white">Sérénité Totale</h4>
                                        <p className="text-sm text-teal-100">Tout est tracé, transparent et équitable pour tout le monde.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Glow */}
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px]"></div>
                        </div>

                    </div>
                </div>
            </section>

            {/* BLOC 4: SOLUTION 1 (TERRAIN) */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 transform -rotate-1 hover:rotate-0 transition-all duration-500">
                            <img src="https://placehold.co/600x400/0F4C5C/FFF?text=Photo+Tablette+Kiosque+sur+Mur" alt="Tablette Kiosque sur Mur" className="w-full rounded-lg" />
                            <div className="mt-4 flex items-center justify-between px-2">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Borne Active • Chantier A</span>
                                </div>
                                <WifiOff size={16} className="text-slate-400" />
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-6"><Tablet size={24} /></div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Transformez n'importe quelle tablette en pointeuse blindée.</h2>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><ImageIcon size={18} className="text-[#0F4C5C]" /> Photo-Preuve</h4>
                                <p className="text-slate-600 text-sm">Timmy prend une photo à chaque arrivée et départ. Vous savez qui pointe et quand. Fini la triche.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><WifiOff size={18} className="text-[#0F4C5C]" /> Mode 100% Hors-Ligne</h4>
                                <p className="text-slate-600 text-sm">Pas de 4G ? Pas de Wifi ? Timmy continue d'enregistrer. Tout se synchronise quand la connexion revient.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><KeyRound size={18} className="text-[#0F4C5C]" /> Code PIN Personnel</h4>
                                <p className="text-slate-600 text-sm">Chaque employé a son code unique. Simple et rapide, même pour ceux qui ne sont pas à l'aise avec la technologie.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOC 5: SOLUTION 2 (BUREAU) */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-6"><LayoutDashboard size={24} /></div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Votre Tour de Contrôle RH.</h2>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Activity size={18} className="text-[#0F4C5C]" /> Vue en temps réel</h4>
                                <p className="text-slate-600 text-sm">Sachez instantanément qui est sur site et qui est en retard, sans appeler personne.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Calculator size={18} className="text-[#0F4C5C]" /> Paie Automatisée</h4>
                                <p className="text-slate-600 text-sm">Heures supp', retards, absences... L'IA calcule tout pour vous. Exportez vers Excel ou Sage en un clic.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Globe size={18} className="text-[#0F4C5C]" /> Multi-sites</h4>
                                <p className="text-slate-600 text-sm">Gérez Libreville, Port-Gentil et Franceville depuis le même bureau. Centralisez tout.</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <img src="https://placehold.co/600x450/f8fafc/0F4C5C?text=Capture+Dashboard+Manager" alt="Dashboard Manager" className="w-full rounded-2xl shadow-2xl border border-slate-100" />
                    </div>
                </div>
            </section>

            {/* BLOC 6: SOLUTION 3 (EMPLOYÉ) */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 flex justify-center">
                        <div className="w-[280px] h-[550px] bg-slate-900 rounded-[35px] border-[8px] border-slate-900 shadow-2xl overflow-hidden relative">
                            <div className="w-full h-full bg-[#E5DDD5]">
                                <div className="h-14 bg-[#075E54] flex items-center px-4 text-white font-bold">Timmy Bot</div>
                                <div className="p-4 space-y-4">
                                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow text-xs">
                                        📅 <strong>Planning Semaine 12</strong><br />
                                        Lundi : 08h - 17h<br />Mardi : 08h - 17h...
                                    </div>
                                    <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow text-xs ml-auto w-fit">
                                        Merci, c'est noté 👍
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-6"><MessageCircle size={24} /></div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">L'info arrive là où vos employés sont : sur WhatsApp.</h2>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Calendar size={18} className="text-[#0F4C5C]" /> Plannings instantanés</h4>
                                <p className="text-slate-600 text-sm">Dès que vous validez les horaires, l'équipe reçoit une notif WhatsApp. Fini les "je ne savais pas".</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Check size={18} className="text-[#0F4C5C]" /> Transparence totale</h4>
                                <p className="text-slate-600 text-sm">L'employé voit ses heures validées chaque semaine. Moins de conflits, plus de confiance.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOC 7: CALCULATEUR ROI (REVISITÉ) */}
            <section className="py-24 bg-[#0F4C5C] text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl lg:text-5xl font-extrabold mb-4">L'approximation vous coûte des millions.</h2>
                    <p className="text-teal-100 mb-12 text-lg">Entrez votre nombre d'employés et découvrez combien Timmy vous fait économiser dès le premier mois.</p>

                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 inline-block w-full max-w-2xl">
                        <div className="mb-8">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold">Nombre d'employés</span>
                                <span className="text-[#FFC107] font-bold text-xl">{employees}</span>
                            </div>
                            <input type="range" min="5" max="100" value={employees} onChange={(e) => setEmployees(parseInt(e.target.value))} className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-[#FFC107]" />
                        </div>
                        <div className="mb-8">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold">Salaire moyen (FCFA/h)</span>
                                <span className="text-[#FFC107] font-bold text-xl">{hourlyRate}</span>
                            </div>
                            <input type="range" min="1000" max="5000" step="500" value={hourlyRate} onChange={(e) => setHourlyRate(parseInt(e.target.value))} className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-[#FFC107]" />
                        </div>
                        <div className="py-6 border-t border-white/10">
                            <p className="text-sm uppercase tracking-widest opacity-70 mb-2">Économie mensuelle estimée</p>
                            <div className="text-5xl font-black text-[#FFC107] mb-6">{monthlyLoss.toLocaleString()} FCFA</div>
                            <button onClick={openBooking} className="bg-white text-[#0F4C5C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg w-full md:w-auto">
                                Arrêter de perdre cet argent
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOC 8: ROADMAP */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Opérationnel en 24h chrono.</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-slate-100 -z-10"></div>

                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-lg text-center relative">
                            <div className="w-10 h-10 bg-[#0F4C5C] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 border-4 border-white">1</div>
                            <h3 className="font-bold text-lg mb-2">Créez votre compte</h3>
                            <p className="text-sm text-slate-500">Importez vos employés via Excel en quelques clics.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-lg text-center relative">
                            <div className="w-10 h-10 bg-[#0F4C5C] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 border-4 border-white">2</div>
                            <h3 className="font-bold text-lg mb-2">Installez l'App</h3>
                            <p className="text-sm text-slate-500">Téléchargez Timmy Kiosk sur une simple tablette Android.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-lg text-center relative">
                            <div className="w-10 h-10 bg-[#FFC107] text-slate-900 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 border-4 border-white">3</div>
                            <h3 className="font-bold text-lg mb-2">C'est parti !</h3>
                            <p className="text-sm text-slate-500">Vos équipes pointent, vous pilotez depuis votre canapé.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: AI ASSISTANT SECTION */}
            <AIAssistantSection />

            {/* BLOC 9: FAQ */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Questions Fréquentes</h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-2">
                        <FAQItem q="Faut-il acheter du matériel spécial ?" a="Non ! Une simple tablette Android (Samsung, Tecno, etc.) ou un iPad suffit. Pas besoin de pointeuse biométrique coûteuse." />
                        <FAQItem q="Et si on vole la tablette ?" a="Vous pouvez bloquer l'accès à distance instantanément. Les données sont sur le Cloud, pas dans la tablette, donc vous ne perdez rien." />
                        <FAQItem q="Est-ce compliqué pour les employés ?" a="S'ils savent taper un code sur un téléphone, ils savent utiliser Timmy. C'est conçu pour être ultra-simple." />
                        <FAQItem q="Est-ce que ça marche sans internet ?" a="Oui, la tablette enregistre tout hors-ligne et envoie les données dès que le réseau revient." />
                    </div>
                </div>
            </section>

            {/* BLOC 10: FOOTER & DERNIER APPEL */}
            <footer className="bg-white py-20 border-t border-slate-200 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Prêt à passer au niveau supérieur ?</h2>
                    <p className="text-xl text-slate-600 mb-10">Rejoignez les managers modernes qui ont dit adieu au papier.</p>
                    <button onClick={openBooking} className="bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 px-10 py-5 rounded-xl font-bold text-xl shadow-xl transition-all hover:-translate-y-1 mb-6">
                        Commencer mon essai gratuit
                    </button>
                    <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                        <Lock size={14} /> Sans carte bancaire • Annulable à tout moment
                    </p>
                    <div className="mt-16 text-xs text-slate-300 border-t border-slate-100 pt-8">
                        © 2024 Timmy SAS. Fait pour l'Afrique.
                    </div>
                </div>
            </footer>

            {/* MOBILE STICKY CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 md:hidden z-[60] shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex items-center gap-3 safe-area-pb">
                <div className="flex-1 pl-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Offre Découverte</p>
                    <p className="text-sm font-bold text-[#0F4C5C] leading-none">Essai Gratuit</p>
                </div>
                <button
                    onClick={openBooking}
                    className="bg-[#FFC107] text-slate-900 px-5 py-3 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm"
                >
                    Commencer
                </button>
            </div>

        </div>
    );
};

export default App;