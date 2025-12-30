"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar, MapPin, Banknote, Check, Menu, X, ArrowRight,
  Smartphone, Star, Clock, HardHat as HardHatIcon, Utensils as UtensilsIcon, ShoppingBag as ShoppingBagIcon,
  ChevronDown, PhoneCall, Calculator,
  TrendingUp, MessageCircle, Users, FileSpreadsheet,
  Zap, Copy, Move, QrCode, Mail, CreditCard, Layers,
  Linkedin, Facebook, Twitter, Lock, LifeBuoy, Monitor, Tablet, Activity, Smile, Coffee, HelpCircle, ChevronUp, User, Briefcase, Mail as MailIcon, ArrowLeft,
  WifiOff, Image as ImageIcon, KeyRound, LayoutDashboard, Globe, ArrowDown, Factory, Stethoscope, BedDouble
} from 'lucide-react';

// --- COMPOSANTS UI RÉUTILISABLES (INCHANGÉS) ---

const COUNTRIES = [
  { code: "GA", name: "Gabon", dialCode: "+241", flag: "🇬🇦", placeholder: "074 00 00 00" },
  { code: "SN", name: "Sénégal", dialCode: "+221", flag: "🇸🇳", placeholder: "77 000 00 00" },
  { code: "CM", name: "Cameroun", dialCode: "+237", flag: "🇨🇲", placeholder: "6 00 00 00 00" },
  { code: "CI", name: "Côte d'Ivoire", dialCode: "+225", flag: "🇨🇮", placeholder: "07 00 00 00 00" },
  { code: "CG", name: "Congo", dialCode: "+242", flag: "🇨🇬", placeholder: "06 000 00 00" },
  { code: "CD", name: "RDC", dialCode: "+243", flag: "🇨🇩", placeholder: "80 000 00 00" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", placeholder: "06 00 00 00 00" },
];

const PartnerLogo = ({ name, color }) => (
  <div className="flex items-center gap-2 font-bold text-slate-600 opacity-70 hover:opacity-100 transition-opacity select-none group bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm cursor-default">
    <div className={`w-6 h-6 rounded bg-${color}-100 flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}>
      <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
    </div>
    <span className="text-sm tracking-tight">{name}</span>
  </div>
);

const FAQItem = ({ q, a }: { q: string; a: string }) => {
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


// --- FULL BOOKING EXPERIENCE COMPONENT (MAJOR UPGRADE) ---
const BookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Info, 3: Success
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    companyType: '',
    employeeCount: ''
  });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

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
    if (step === 1 && selectedDate !== null && selectedTime) setStep(2);
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
                  <div className="relative flex w-full rounded-lg border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-[#0F4C5C] focus-within:border-transparent transition-all">
                    {/* Country Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className="h-full px-3 py-3 rounded-l-lg bg-slate-100 flex items-center gap-2 hover:bg-slate-200 transition-colors border-r border-slate-200"
                      >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium text-slate-700">{selectedCountry.dialCode}</span>
                        <ChevronDown size={14} className="text-slate-400" />
                      </button>

                      {showCountryDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                          {COUNTRIES.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setShowCountryDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors"
                            >
                              <span className="text-lg">{country.flag}</span>
                              <span className="flex-1 text-sm text-slate-700">{country.name}</span>
                              <span className="text-xs text-slate-400 font-mono">{country.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Phone Input */}
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-r-lg bg-transparent outline-none placeholder-slate-400 text-slate-900"
                      placeholder={selectedCountry.placeholder}
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
                  {selectedDate !== null && dates[selectedDate]?.day} {selectedDate !== null && dates[selectedDate]?.date} à {selectedTime}
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
              disabled={step === 1 ? (selectedDate === null || !selectedTime) : (!formData.name || !formData.email || !formData.companyType || !formData.employeeCount)}
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



  const faqs = [
    {
      q: "Faut-il acheter du matériel spécial ?",
      a: "Non ! Une simple tablette Android (Samsung, Tecno, etc.) ou un iPad suffit. Pas besoin de pointeuse biométrique coûteuse qui tombe en panne. Vous pouvez utiliser une tablette que vous possédez déjà ou en acheter une entrée de gamme à moins de 80 000 FCFA."
    },
    {
      q: "Et si on vole la tablette ?",
      a: "Vous ne perdez aucune donnée. Tout est sauvegardé en temps réel sur le Cloud sécurisé. De plus, vous pouvez bloquer l'accès à l'application à distance instantanément. Le voleur se retrouve avec une coquille vide, et vos plannings restent accessibles depuis votre ordinateur."
    },
    {
      q: "Est-ce compliqué pour les employés ?",
      a: "S'ils savent taper un code sur un téléphone, ils savent utiliser Timmy. C'est conçu pour être ultra-simple : un gros pavé numérique, une photo, et c'est tout. Aucune formation n'est nécessaire pour l'employé, ça prend 5 secondes matin et soir."
    },
    {
      q: "Est-ce que ça marche sans internet ?",
      a: "Oui, c'est prévu pour l'Afrique. La tablette enregistre tout en mode hors-ligne (pointages, photos) et envoie les données dès que le réseau revient (wifi ou 3G). Vous ne perdez jamais une minute de travail, même en zone blanche."
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
              <a href="/" className="flex items-center gap-3 group">
                {/* LOGO SWITCH: White when transparent, Dark when Scrolled */}
                <div className="relative h-12 w-32 transition-all duration-300">
                  <div className={`absolute inset-0 transition-opacity duration-300 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
                    <Image
                      src="/images/timmy_logo_white.png"
                      alt="Timmy Logo White"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className={`absolute inset-0 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
                    <Image
                      src="/images/timmy_logo_dark.png"
                      alt="Timmy Logo Dark"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </a>
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <div className="flex gap-6 text-sm font-medium">
                <a href="#probleme" className={`transition-colors hover:text-[#FFC107] ${scrolled ? 'text-slate-600' : 'text-slate-100'}`}>Problème</a>
                <a href="#fonctionnalites" className={`transition-colors hover:text-[#FFC107] ${scrolled ? 'text-slate-600' : 'text-slate-100'}`}>Solutions</a>
                <a href="#industries" className={`transition-colors hover:text-[#FFC107] ${scrolled ? 'text-slate-600' : 'text-slate-100'}`}>Métiers</a>
                <a href="#tarifs" className={`transition-colors hover:text-[#FFC107] ${scrolled ? 'text-slate-600' : 'text-slate-100'}`}>Rentabilité</a>
                <a href="#faq" className={`transition-colors hover:text-[#FFC107] ${scrolled ? 'text-slate-600' : 'text-slate-100'}`}>FAQ</a>
              </div>
              <button onClick={openBooking} className="bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 px-6 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-yellow-500/30 active:scale-95">
                Démarrer l'essai gratuit
              </button>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`${scrolled ? 'text-slate-800' : 'text-white'}`}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
            <a href="#probleme" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-2 border-b border-slate-50">Problème</a>
            <a href="#fonctionnalites" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-2 border-b border-slate-50">Solutions</a>
            <a href="#industries" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-2 border-b border-slate-50">Métiers</a>
            <a href="#tarifs" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-2 border-b border-slate-50">Rentabilité</a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-2 border-b border-slate-50">FAQ</a>
            <button onClick={() => { setIsMenuOpen(false); openBooking(); }} className="bg-[#FFC107] text-slate-900 py-3 rounded-lg font-bold w-full mt-2">
              Démarrer l'essai gratuit
            </button>
          </div>
        )}
      </nav>

      {/* HERO & SOCIAL PROOF WRAPPER - FULL HEIGHT */}
      <div className="flex flex-col min-h-[calc(100vh-74px)]">
        {/* Hero Section */}
        <section className="relative flex-grow flex flex-col justify-center overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-8 lg:py-0">
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
        <div className="bg-slate-50 py-8 border-y border-slate-100 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Ils font confiance à Timmy pour gérer leurs équipes</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="text-xl font-black text-slate-800 flex items-center gap-2"><HardHatIcon /> BTP CONSTRUCT</div>
              <div className="text-xl font-black text-slate-800 flex items-center gap-2"><UtensilsIcon /> MAQUIS 225</div>
              <div className="text-xl font-black text-slate-800 flex items-center gap-2"><ShoppingBagIcon /> SUPER CASH</div>
              <div className="text-xl font-black text-slate-800 flex items-center gap-2"><Briefcase /> SECURIGROUP</div>
            </div>
          </div>
        </div>
      </div>



      {/* NOUVEAU BLOC: PAIN POINTS (Ça vous dit quelque chose ?) - PREMIUM DESIGN */}
      <section id="probleme" className="py-24 bg-white relative overflow-hidden">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0F4C5C]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
              Ça vous dit quelque chose ?
            </h2>
            <p className="text-slate-500 text-lg max-w-4xl mx-auto">
              Si vous vivez l'une de ces situations, c'est qu'il est temps de moderniser vos process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Card 1: Excel */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group text-center">
              <div className="w-20 h-20 mx-auto bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileSpreadsheet size={36} />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">L'Enfer Excel</h3>
              <p className="text-base text-slate-500 leading-relaxed">
                "Mes plannings ne sont jamais à jour, difficiles à partager et pleins d'erreurs de saisie."
              </p>
            </div>

            {/* Card 2: Documents */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group text-center">
              <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Layers size={36} />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Chaos Administratif</h3>
              <p className="text-base text-slate-500 leading-relaxed">
                "Impossible de remettre la main sur le contrat ou la demande de congé au moment crucial."
              </p>
            </div>

            {/* Card 3: Terrain */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group text-center">
              <div className="w-20 h-20 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin size={36} />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Angle Mort</h3>
              <p className="text-base text-slate-500 leading-relaxed">
                "Je ne sais pas ce qui se passe réellement sur mes chantiers quand je n'y suis pas."
              </p>
            </div>

            {/* Card 4: Paie */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group text-center">
              <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Banknote size={36} />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Stress de la Paie</h3>
              <p className="text-base text-slate-500 leading-relaxed">
                "Chaque fin de mois est une course contre la montre pour calculer les salaires sans erreurs."
              </p>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto mt-20">
            <h3 className="font-bold text-slate-800 text-2xl mb-3">Vous n'êtes pas seul.</h3>
            <p className="text-slate-500 text-lg mb-8">
              Mais rassurez-vous : il existe une meilleure façon de faire.
            </p>
            <div className="flex justify-center">
              <ArrowDown className="text-slate-300 animate-bounce" size={32} />
            </div>
          </div>
        </div>
      </section>



      {/* BLOC 4: SOLUTION 1 (TERRAIN) */}
      <section id="fonctionnalites" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-200 transform -rotate-1 hover:rotate-0 transition-all duration-500 relative group">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-100">
                <Image
                  src="/images/kiosk-mockup.png"
                  alt="Tablette Kiosque sur Mur"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Borne Active • Chantier A</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                  <WifiOff size={14} /> <span>Mode Hors-ligne</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-6"><Tablet size={24} /></div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Transformez n'importe quelle tablette en pointeuse digitale.</h2>
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
                <p className="text-slate-600 text-sm">Heures supp', retards, absences... Timmy calcule tout pour vous. Exportez vers Excel ou Sage en un clic.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Globe size={18} className="text-[#0F4C5C]" /> Multi-sites</h4>
                <p className="text-slate-600 text-sm">Gérez Libreville, Abidjan et Dakar depuis le même bureau. Centralisez tout.</p>
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

      {/* BLOC 7: SOLUTION 4 (PLANNING) */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mb-6"><Calendar size={24} /></div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Planifiez vos équipes en un clin d'œil.</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Copy size={18} className="text-[#0F4C5C]" /> Duplication Intelligente</h4>
                <p className="text-slate-600 text-sm">Ne repartez pas de zéro. Créez une semaine type et appliquez-la à tout le mois en un clic.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Users size={18} className="text-[#0F4C5C]" /> Disponibilités Claires</h4>
                <p className="text-slate-600 text-sm">Visualisez instantanément qui est disponible, en congé ou déjà affecté sur un autre chantier.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Layers size={18} className="text-[#0F4C5C]" /> Filtres par Chantier</h4>
                <p className="text-slate-600 text-sm">Affichez uniquement l'équipe "Maçonnerie" ou le chantier "Libreville Centre" pour plus de clarté.</p>
              </div>
            </div>
          </div>
          <div>
            <img src="https://placehold.co/600x450/f8fafc/0F4C5C?text=Planning+Hebdomadaire+Intuitif" alt="Planning Interface" className="w-full rounded-2xl shadow-2xl border border-slate-100" />
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR (Restored Dark Mode) */}
      <section id="tarifs" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0F4C5C] rounded-full filter blur-[100px] opacity-30 -mr-20 -mt-20"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">L'approximation vous coûte des millions.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Entrez votre nombre d'employés et découvrez combien Timmy vous fait économiser dès le premier mois.
            </p>
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
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Économie Mensuelle Estimée</p>
                <div className="text-5xl font-black text-white mb-2 tracking-tight relative z-10">
                  {monthlyLoss.toLocaleString('fr-FR').replace(/\s/g, '\u00A0')} <span className="text-lg font-medium text-slate-500">FCFA</span>
                </div>
                <p className="text-xs text-slate-500 mb-6 relative z-10">Soit {Math.floor(monthlyLoss * 12).toLocaleString('fr-FR').replace(/\s/g, '\u00A0')} FCFA par an.</p>
                <button
                  onClick={openBooking}
                  className="w-full bg-[#0F4C5C] hover:bg-[#0a3540] text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 relative z-20"
                >
                  Arrêter de perdre cet argent <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <p className="text-slate-500 text-xs text-center mt-8 italic">
              * Calcul basé sur 30 min perdues/jour (retard + départ anticipé + pauses étendues).
            </p>
          </div>
        </div>
      </section>

      {/* 30 DAYS ROADMAP */}
      <section className="py-24 bg-slate-50 relative border-t border-slate-100">
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

      {/* BLOC INDUSTRIES */}
      <section id="industries" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Une solution qui s'adapte à votre métier</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">Peu importe votre industrie, Timmy simplifie la gestion de vos équipes terrain.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* BTP */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[#0F4C5C] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HardHatIcon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">BTP & Construction</h3>
              <p className="text-slate-500 text-sm">Suivez les heures par chantier et sécurisez l'accès à vos sites dispersés.</p>
            </div>

            {/* Restauration */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[#0F4C5C] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UtensilsIcon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">Restauration</h3>
              <p className="text-slate-500 text-sm">Planifiez votre équipe pour les heures de pointe sans stress.</p>
            </div>

            {/* Hôtellerie */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[#0F4C5C] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BedDouble size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">Hôtellerie</h3>
              <p className="text-slate-500 text-sm">Assurez un service 24/7 impeccable avec une gestion fluide des roulements.</p>
            </div>

            {/* Production */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[#0F4C5C] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Factory size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">Production</h3>
              <p className="text-slate-500 text-sm">Optimisez vos cycles de production (3x8) avec un suivi précis des présences.</p>
            </div>

            {/* Retail */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[#0F4C5C] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBagIcon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">Retail</h3>
              <p className="text-slate-500 text-sm">Gérez facilement les plannings de vos vendeurs sur plusieurs boutiques.</p>
            </div>

            {/* Centre de Santé */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[#0F4C5C] hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">Centre de Santé</h3>
              <p className="text-slate-500 text-sm">Garantissez la continuité des soins en s'assurant que le personnel est bien là.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOC INTEGRATION */}
      <section id="integrations" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Il s'intègre parfaitement à vos outils</h2>
            <p className="text-slate-600 text-lg mb-8">
              Timmy connecte enfin le terrain à vos logiciels de bureau. Fini les ressaisies manuelles et les erreurs de copier-coller.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Sage Paie & RH", "Excel / CSV",
                "Google Drive", "Outlook Calendar",
                "WhatsApp Business", "Mobile Money"
              ].map((tool, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{tool}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
              <img
                src="/images/integrations.png"
                alt="Intégrations Timmy"
                className="w-full object-cover"
              />
              {/* Decorative Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0F4C5C]/10 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT WHATSAPP */}
      <section className="py-20 bg-white border-t border-slate-100">
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
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
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

      {/* BLOC 10: DERNIER APPEL */}
      <section className="bg-white py-20 border-t border-slate-200 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Prêt à passer au niveau supérieur ?</h2>
          <p className="text-xl text-slate-600 mb-10">Rejoignez les managers modernes qui ont dit adieu au papier.</p>
          <button onClick={openBooking} className="bg-[#FFC107] hover:bg-[#e0a800] text-slate-900 px-10 py-5 rounded-xl font-bold text-xl shadow-xl transition-all hover:-translate-y-1 mb-6">
            Commencer mon essai gratuit
          </button>
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <Lock size={14} /> Sans carte bancaire • Annulable à tout moment
          </p>
        </div>
      </section>

      {/* FOOTER SAAS (Light Theme) */}
      <footer className="bg-slate-50 text-slate-600 py-16 border-t border-slate-200 text-sm">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <div className="relative h-10 w-32">
                <Image
                  src="/images/timmy_logo_dark.png"
                  alt="Timmy Logo"
                  fill
                  className="object-contain left-0"
                />
              </div>
            </h3>
            <p className="max-w-xs">
              La solution de gestion RH terrain conçue pour l'Afrique. Simple, hors-ligne et fiable.
            </p>
          </div>

          {/* Col 2: Produit */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Produit</h4>
            <ul className="space-y-3">
              <li><a href="#fonctionnalites" className="hover:text-[#0F4C5C] transition-colors">Fonctionnalités</a></li>
              <li><a href="#industries" className="hover:text-[#0F4C5C] transition-colors">Métiers</a></li>
              <li><a href="#tarifs" className="hover:text-[#0F4C5C] transition-colors">Rentabilité</a></li>
              <li><a href="#faq" className="hover:text-[#0F4C5C] transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Col 3: Légal */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Légal</h4>
            <ul className="space-y-3">
              <li><a href="/legal/mentions-legales" className="hover:text-[#0F4C5C] transition-colors">Mentions légales</a></li>
              <li><a href="/legal/politique-confidentialite" className="hover:text-[#0F4C5C] transition-colors">Politique de confidentialité</a></li>
              <li><a href="/legal/cgu" className="hover:text-[#0F4C5C] transition-colors">CGU</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} Timmy SAS. Tous droits réservés.</div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Systèmes opérationnels
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

      {/* BOOKING MODAL */}
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div >
  );
};

export default App;