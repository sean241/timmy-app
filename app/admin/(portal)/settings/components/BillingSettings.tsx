import { useState } from "react";
import { CreditCard, Users, Smartphone, Cloud, ArrowRight, Download, Plus, Pencil, Mail, Settings, Tablet, Upload, Check, X, Phone, Clock, FileText, Smartphone as MobileIcon, Loader2, PlayCircle, Building2, ShieldCheck, Plug, Headphones, GraduationCap, Star, CheckCircle } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import Toast from "@/components/Toast";

/**
 * Reusable Components
 */
const Badge = ({ children, color = "green" }: { children: React.ReactNode; color?: "green" | "yellow" | "gray" | "blue" }) => {
    const styles = {
        green: "bg-emerald-100 text-emerald-700 border-emerald-200",
        yellow: "bg-amber-100 text-amber-700 border-amber-200",
        gray: "bg-slate-100 text-slate-600 border-slate-200",
        blue: "bg-blue-100 text-blue-700 border-blue-200"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[color] || styles.gray}`}>
            {children}
        </span>
    );
};

const UsageBar = ({ label, current, max, icon: IconComponent }: { label: string; current: number; max: number; icon: React.ElementType }) => {
    // Logic for "Unlimited"
    const isUnlimited = max === Infinity;
    const percentage = isUnlimited ? 10 : (current / max) * 100;

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5 text-sm">
                <span className="text-slate-600 font-medium flex items-center gap-2">
                    <IconComponent size={16} className="text-[#0F4C5C]" /> {label}
                </span>
                <span className="text-slate-900 font-bold">
                    {current} <span className="text-slate-400 font-normal">/ {isUnlimited ? '∞' : max}</span>
                </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#0F4C5C] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const InvoiceRow = ({ date, amount, id, status }: { date: string; amount: string; id: string; status: 'Payée' | 'En attente' | 'Validation' }) => (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
        <td className="py-4 pl-4 text-sm font-medium text-slate-900">{date}</td>
        <td className="py-4 text-sm text-slate-500">Facture #{id}</td>
        <td className="py-4 text-sm font-mono text-slate-700">{amount} FCFA</td>
        <td className="py-4">
            <Badge color={status === 'Payée' ? 'green' : status === 'Validation' ? 'blue' : 'yellow'}>{status}</Badge>
        </td>
        <td className="py-4 pr-4 text-right">
            <button className="text-[#0F4C5C] hover:bg-slate-100 p-2 rounded-lg transition-colors" title="Télécharger PDF">
                <Download size={18} />
            </button>
        </td>
    </tr>
);

export default function BillingSettings() {
    const { t } = useLanguage();

    // States
    const [showAirtelModal, setShowAirtelModal] = useState(false);
    const [showBillingModal, setShowBillingModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [isAnnual, setIsAnnual] = useState(true);

    // Airtel Form
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [transId, setTransId] = useState("");

    // Billing Info Form (Simulated DB Data)
    const [billingInfo, setBillingInfo] = useState({
        companyName: "BTP Gabon Construction",
        address: "BP 1234, Zone Industrielle Oloumi",
        city: "Libreville, Gabon",
        nif: "123456-A",
        rccm: "LBV-2020-B-123",
        email: "finance@btp-gabon.com"
    });
    // Temp state for editing
    const [tempBillingInfo, setTempBillingInfo] = useState(billingInfo);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const handleSubmitProof = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccess(true);
            setShowAirtelModal(false);
            setToast({ message: t.settings.billing.toasts.paymentSuccess, type: "success" });

            // Clean up details
            setTransId("");
            setPaymentProof(null);
        }, 1500);
    };

    const handleOpenBillingModal = () => {
        setTempBillingInfo(billingInfo);
        setShowBillingModal(true);
    };

    const handleSaveBilling = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setBillingInfo(tempBillingInfo);
            setIsSubmitting(false);
            setShowBillingModal(false);
            setToast({ message: t.settings.billing.toasts.billingUpdated, type: "success" });
        }, 1000);
    };

    return (
        <div className="w-full font-sans relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-[#0F4C5C]">{t.settings.billing.title}</h2>
                <p className="text-gray-500 mt-2 text-lg">{t.settings.billing.subtitle}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: PLAN & USAGE */}
                <div className="lg:col-span-2 space-y-8">

                    {/* ACTIVE PLAN CARD */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-[#0F4C5C] p-6 text-white flex justify-between items-start relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold">Timmy PRO</h2>
                                    <span className="bg-[#FFC107] text-slate-900 text-xs font-bold px-2 py-0.5 rounded uppercase">{t.settings.billing.annual} {t.settings.billing.annualDiscount}</span>
                                </div>
                                <p className="text-emerald-100 text-sm opacity-90">{t.settings.billing.renewalDate.replace('{date}', '14 Déc. 2025')}</p>
                            </div>
                            <div className="text-right relative z-10">
                                <p className="text-3xl font-bold">24.000 <span className="text-base font-normal opacity-70">{t.settings.billing.currencyPerMonth}</span></p>
                            </div>
                            {/* Pattern */}
                            <div className="absolute right-0 top-0 p-4 opacity-10">
                                <CreditCard size={100} />
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t.settings.billing.usageTitle}</h3>
                                    <UsageBar label={t.settings.billing.activeEmployees} current={12} max={30} icon={Users} />
                                    <UsageBar label={t.settings.billing.connectedKiosks} current={3} max={6} icon={Tablet} />
                                    <UsageBar label={t.settings.billing.locationsCount} current={3} max={3} icon={Building2} />
                                    <p className="mt-4 text-sm text-orange-600 font-semibold">{t.settings.billing.needMore} <a href="#" className="underline">{t.settings.billing.upgradePrompt}</a></p>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t.settings.billing.nextPayment}</h3>
                                        <p className="text-slate-600 text-sm mb-4">
                                            {t.settings.billing.renewalDesc}
                                        </p>
                                    </div>
                                    {/* BUTTONS */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowPlanModal(true)}
                                            className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                                        >
                                            {t.settings.billing.changePlan}
                                        </button>
                                    </div>

                                    {/* PLAN CHANGE MODAL */}
                                    {showPlanModal && (
                                        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">

                                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden relative animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">

                                                {/* CLOSE BUTTON */}
                                                <button
                                                    onClick={() => setShowPlanModal(false)}
                                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors z-[110]"
                                                >
                                                    <X size={24} />
                                                </button>

                                                {/* HEADER */}
                                                <div className="text-center pt-10 pb-8 px-6 bg-slate-50 border-b border-slate-100 shrink-0">
                                                    <h2 className="text-3xl font-extrabold text-[#0F4C5C] mb-3">{t.settings.billing.modalTitle}</h2>
                                                    <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
                                                        {t.settings.billing.modalSubtitle}
                                                    </p>

                                                    {/* TOGGLE */}
                                                    <div className="flex justify-center items-center gap-4">
                                                        <span className={`text-sm font-bold ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>{t.settings.billing.monthly}</span>
                                                        <button
                                                            onClick={() => setIsAnnual(!isAnnual)}
                                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:ring-offset-2 ${isAnnual ? 'bg-[#0F4C5C]' : 'bg-slate-300'}`}
                                                        >
                                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
                                                        </button>
                                                        <span className={`text-sm font-bold flex items-center gap-2 ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
                                                            {t.settings.billing.annual}
                                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-extrabold">{t.settings.billing.annualDiscount}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* CARDS CONTAINER */}
                                                <div className="p-8 bg-slate-50 grid lg:grid-cols-3 gap-6 items-start overflow-y-auto custom-scrollbar">

                                                    {/* 1. STARTER */}
                                                    <div className="bg-white rounded-xl p-6 border border-slate-200 opacity-70 hover:opacity-100 transition-opacity">
                                                        <div className="mb-4">
                                                            <h3 className="text-lg font-bold text-slate-700">{t.settings.billing.planStarter.name}</h3>
                                                            <div className="mt-2 flex items-baseline gap-1">
                                                                <span className="text-2xl font-bold text-slate-900">{t.settings.billing.planStarter.price}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1">{t.settings.billing.planStarter.desc}</p>
                                                        </div>
                                                        <ul className="space-y-3 mb-6 text-sm text-slate-600">
                                                            {t.settings.billing.planStarter.features.map((feature, i) => (
                                                                <li key={i} className="flex gap-2"><Check size={16} className="text-slate-400 shrink-0" /> {feature}</li>
                                                            ))}
                                                        </ul>
                                                        <button className="w-full py-2.5 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 text-sm transition-colors">
                                                            {t.settings.billing.planStarter.action}
                                                        </button>
                                                    </div>

                                                    {/* 2. PRO (Plan Actuel) */}
                                                    <div className="bg-white rounded-xl p-6 border-2 border-[#0F4C5C] relative ring-4 ring-[#0F4C5C]/5">
                                                        <div className="absolute top-0 right-0 left-0 bg-[#0F4C5C] text-white text-[10px] font-bold uppercase tracking-widest text-center py-1">
                                                            {t.settings.billing.currentPlan}
                                                        </div>
                                                        <div className="mt-4 mb-4">
                                                            <h3 className="text-lg font-bold text-[#0F4C5C]">{t.settings.billing.planPro.name}</h3>
                                                            <div className="mt-2 flex items-baseline gap-1">
                                                                <span className="text-3xl font-bold text-slate-900">{isAnnual ? '2.000' : '2.500'}</span>
                                                                <span className="text-sm font-medium text-slate-500">{t.settings.billing.currencyPerMonth}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1">{t.settings.billing.perActiveEmployee}</p>
                                                        </div>
                                                        <ul className="space-y-3 mb-6 text-sm text-slate-700">
                                                            {t.settings.billing.planPro.features.map((feature, i) => (
                                                                <li key={i} className="flex gap-2"><div className="bg-emerald-100 p-0.5 rounded-full text-emerald-600"><Check size={12} /></div> {feature}</li>
                                                            ))}
                                                        </ul>
                                                        <button className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold rounded-lg cursor-default text-sm flex items-center justify-center gap-2">
                                                            <CheckCircle size={16} /> {t.settings.billing.activePlan}
                                                        </button>
                                                    </div>

                                                    {/* 3. ENTREPRISE */}
                                                    <div className="bg-white rounded-xl p-6 border border-[#FFC107] shadow-xl relative transform lg:scale-105 z-10">
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFC107] text-slate-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm flex items-center gap-1 whitespace-nowrap">
                                                            <Star size={12} fill="currentColor" /> {t.settings.billing.planEnterprise.recommended}
                                                        </div>
                                                        <div className="mb-4">
                                                            <h3 className="text-lg font-bold text-slate-900">{t.settings.billing.planEnterprise.name}</h3>
                                                            <div className="mt-2 flex items-baseline gap-1">
                                                                <span className="text-3xl font-bold text-slate-900">{t.settings.billing.planEnterprise.price}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-1">{t.settings.billing.planEnterprise.desc}</p>
                                                        </div>

                                                        <div className="mb-4">
                                                            <p className="text-xs font-bold text-[#0F4C5C] uppercase tracking-wide mb-3">{t.settings.billing.planEnterprise.featuresTitle}</p>
                                                            <ul className="space-y-3 text-sm text-slate-700">
                                                                <li className="flex gap-2 items-start">
                                                                    <ShieldCheck size={18} className="text-[#FFC107] shrink-0 mt-0.5" />
                                                                    <span><strong>{t.settings.billing.planEnterprise.features[0].split('(')[0]}</strong>({t.settings.billing.planEnterprise.features[0].split('(')[1]}</span>
                                                                </li>
                                                                <li className="flex gap-2 items-start">
                                                                    <Plug size={18} className="text-[#FFC107] shrink-0 mt-0.5" />
                                                                    <span><strong>{t.settings.billing.planEnterprise.features[1].split('(')[0]}</strong>({t.settings.billing.planEnterprise.features[1].split('(')[1]}</span>
                                                                </li>
                                                                <li className="flex gap-2 items-start">
                                                                    <Headphones size={18} className="text-[#FFC107] shrink-0 mt-0.5" />
                                                                    <span><strong>{t.settings.billing.planEnterprise.features[2].split(' ')[0]} {t.settings.billing.planEnterprise.features[2].split(' ')[1]}</strong> {t.settings.billing.planEnterprise.features[2].split(' ').slice(2).join(' ')}</span>
                                                                </li>
                                                                <li className="flex gap-2 items-start">
                                                                    <GraduationCap size={18} className="text-[#FFC107] shrink-0 mt-0.5" />
                                                                    <span><strong>{t.settings.billing.planEnterprise.features[3].split(' ')[0]}</strong> {t.settings.billing.planEnterprise.features[3].split(' ').slice(1).join(' ')}</span>
                                                                </li>
                                                            </ul>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                setShowPlanModal(false);
                                                                setToast({ message: t.settings.billing.toasts.planEnterpriseSent, type: "success" });
                                                            }}
                                                            className="w-full py-3 bg-[#FFC107] hover:bg-[#FFD54F] text-slate-900 font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 group"
                                                        >
                                                            {t.settings.billing.planEnterprise.action} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                        <p className="text-[10px] text-center text-slate-400 mt-3">{t.settings.billing.planEnterprise.responseTime}</p>
                                                    </div>

                                                </div>

                                                {/* FOOTER */}
                                                <div className="bg-slate-100 p-4 text-center text-xs text-slate-500 border-t border-slate-200 shrink-0">
                                                    <p className="flex items-center justify-center gap-4">
                                                        <span className="flex items-center gap-1"><CreditCard size={12} /> {t.settings.billing.securePayment}</span>
                                                        <span>•</span>
                                                        <span>{t.settings.billing.needHelp} <a href="mailto:support@timmy.app" className="text-[#0F4C5C] underline">support@timmy.app</a></span>
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INVOICE HISTORY */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">{t.settings.billing.invoiceHistory}</h3>
                            <button className="text-[#0F4C5C] text-sm font-medium hover:underline flex items-center gap-1">
                                {t.settings.billing.viewAll} <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase border-b border-slate-100">
                                        <th className="pl-4 pb-3 font-semibold">{t.settings.billing.table.date}</th>
                                        <th className="pb-3 font-semibold">{t.settings.billing.table.reference}</th>
                                        <th className="pb-3 font-semibold">{t.settings.billing.table.amount}</th>
                                        <th className="pb-3 font-semibold">{t.settings.billing.table.status}</th>
                                        <th className="pr-4 pb-3 text-right font-semibold">{t.settings.billing.table.action}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {showSuccess && (
                                        <InvoiceRow date={t.settings.billing.status.today} id="PENDING" amount="24.000" status={t.settings.billing.status.validation as any} />
                                    )}
                                    <InvoiceRow date="14 Nov. 2024" id="INV-2024-012" amount="24.000" status={t.settings.billing.status.paid as any} />
                                    <InvoiceRow date="14 Oct. 2024" id="INV-2024-008" amount="24.000" status={t.settings.billing.status.paid as any} />
                                    <InvoiceRow date="14 Sept. 2024" id="INV-2024-003" amount="24.000" status={t.settings.billing.status.paid as any} />
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: PAYMENT METHODS & INFO */}
                <div className="space-y-8">

                    {/* PAYMENT METHOD */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-bold text-lg text-slate-900 mb-4">{t.settings.billing.paymentMethod}</h3>

                        {/* VISA Card - Editable */}
                        <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl mb-4 bg-slate-50 relative group">
                            <div className="w-12 h-8 bg-white rounded border border-slate-200 flex items-center justify-center">
                                <span className="font-bold text-blue-800 italic text-xs">VISA</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">•••• 4242</p>
                                <p className="text-xs text-slate-500">Expire le 12/28</p>
                            </div>
                            <Badge color="green">{t.settings.billing.default}</Badge>
                            <button className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-[#0F4C5C] opacity-0 group-hover:opacity-100 transition-opacity">
                                <Pencil size={14} />
                            </button>
                        </div>

                        {/* Airtel Display / Action */}
                        <div className="border border-slate-200 rounded-xl mb-6 overflow-hidden">
                            <div className="flex items-center gap-4 p-4 bg-white">
                                <div className="w-12 h-8 bg-orange-100 rounded border border-orange-200 flex items-center justify-center text-orange-600">
                                    <Smartphone size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-800">Airtel Money</p>
                                    <p className="text-xs text-slate-500">{t.settings.billing.manualPayment}</p>
                                </div>
                                <button className="p-1.5 text-gray-400 hover:text-[#0F4C5C]">
                                    <Pencil size={14} />
                                </button>
                            </div>
                            <div className="bg-gray-50 p-3 border-t border-gray-100">
                                <button
                                    onClick={() => setShowAirtelModal(true)}
                                    className="w-full text-xs font-bold text-[#0F4C5C] hover:underline flex items-center justify-center gap-1"
                                >
                                    {t.settings.billing.declarePayment}
                                </button>
                            </div>
                        </div>


                        <button className="w-full border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm flex items-center justify-center gap-2">
                            <Plus size={16} /> {t.settings.billing.addMethod}
                        </button>
                    </div>

                    {/* BILLING DETAILS (MERGED) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-slate-900">{t.settings.billing.billingDetails}</h3>
                            <button
                                onClick={handleOpenBillingModal}
                                className="text-[#0F4C5C] hover:bg-slate-50 p-1.5 rounded transition-colors"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm text-slate-600">
                            <p className="font-bold text-slate-900 text-base">{billingInfo.companyName}</p>
                            <p>{billingInfo.address}</p>
                            <p>{billingInfo.city}</p>
                            <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
                                <p><span className="text-slate-400 w-16 inline-block">{t.settings.billing.nif} :</span> <span className="font-mono text-slate-700">{billingInfo.nif}</span></p>
                                <p><span className="text-slate-400 w-16 inline-block">{t.settings.billing.rccm} :</span> <span className="font-mono text-slate-700">{billingInfo.rccm}</span></p>
                            </div>

                            {/* Merged Email Section */}
                            <div className="pt-3 border-t border-slate-100 mt-3">
                                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 font-bold">{t.settings.billing.billingEmail}</p>
                                <div className="flex items-center gap-2 text-slate-800 font-medium">
                                    <Mail size={14} className="text-slate-400" />
                                    {billingInfo.email}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* AIRTEL MODAL */}
            {showAirtelModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        {/* HEADER */}
                        <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-[#FFC107]" />
                                <h3 className="text-lg font-bold text-white tracking-wide">
                                    {t.settings.billing.airtelModal.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAirtelModal(false)}
                                className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="airtel-payment-form" onSubmit={handleSubmitProof} className="space-y-5">

                                {/* Instructions */}
                                <div className="bg-orange-50 text-orange-900 text-sm p-4 rounded-xl space-y-3 border border-orange-100">
                                    <h4 className="font-bold text-orange-800 uppercase tracking-wide text-xs mb-2">{t.settings.billing.airtelModal.instructions}</h4>

                                    <div className="flex items-start gap-3">
                                        <div className="bg-orange-100 p-2 rounded-full shrink-0">
                                            <MobileIcon size={18} className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{t.settings.billing.airtelModal.sendTo}</p>
                                            <p className="text-lg font-mono font-bold text-orange-700 bg-orange-100 w-fit px-2 py-0.5 rounded mt-0.5">074 00 00 00</p>
                                            <p className="text-xs mt-1 opacity-80">{t.settings.billing.airtelModal.name}</p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-orange-200/50 w-full my-2"></div>

                                    <div className="flex items-start gap-3 opacity-90">
                                        <span className="font-bold bg-white w-5 h-5 rounded-full flex items-center justify-center text-orange-600 shrink-0 border border-orange-200 text-xs shadow-sm mt-0.5">2</span>
                                        <p>{t.settings.billing.airtelModal.step2}</p>
                                    </div>
                                    <div className="flex items-start gap-3 opacity-90">
                                        <span className="font-bold bg-white w-5 h-5 rounded-full flex items-center justify-center text-orange-600 shrink-0 border border-orange-200 text-xs shadow-sm mt-0.5">3</span>
                                        <p>{t.settings.billing.airtelModal.step3}</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.billing.airtelModal.transactionId} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={transId}
                                            onChange={(e) => setTransId(e.target.value)}
                                            placeholder="Ex: PP230912.1542.G21312"
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium placeholder:font-normal"
                                        />
                                        <p className="text-xs text-slate-400 mt-1.5">{t.settings.billing.airtelModal.idDesc}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.billing.airtelModal.proof}</label>
                                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[#0F4C5C] hover:bg-[#0F4C5C]/5 transition-colors text-center cursor-pointer relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {paymentProof ? (
                                                        <FileText size={24} className="text-[#0F4C5C]" />
                                                    ) : (
                                                        <Upload size={24} className="text-slate-400" />
                                                    )}
                                                </div>

                                                {paymentProof ? (
                                                    <div className="text-sm font-bold text-[#0F4C5C]">{paymentProof.name}</div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-700">{t.settings.billing.airtelModal.uploadDesc}</p>
                                                        <p className="text-xs text-slate-400">{t.settings.billing.airtelModal.uploadLimit}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* FOOTER */}
                        <div className="p-6 pt-2 bg-white rounded-b-xl shrink-0">
                            <button
                                type="submit"
                                form="airtel-payment-form"
                                disabled={isSubmitting}
                                className="w-full bg-[#FFC107] hover:bg-[#e0a800] text-[#0F4C5C] font-extrabold text-base py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" /> Validation...
                                    </>
                                ) : (
                                    "Confirmer le paiement"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BILLING INFO MODAL */}
            {showBillingModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        {/* HEADER */}
                        <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-[#FFC107]" />
                                <h3 className="text-lg font-bold text-white tracking-wide">
                                    {t.settings.billing.editModal.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowBillingModal(false)}
                                className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="billing-info-form" onSubmit={handleSaveBilling} className="space-y-4">

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.billing.editModal.companyName}</label>
                                    <input
                                        type="text"
                                        required
                                        value={tempBillingInfo.companyName}
                                        onChange={(e) => setTempBillingInfo({ ...tempBillingInfo, companyName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.billing.editModal.address}</label>
                                    <input
                                        type="text"
                                        required
                                        value={tempBillingInfo.address}
                                        onChange={(e) => setTempBillingInfo({ ...tempBillingInfo, address: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.billing.editModal.city}</label>
                                    <input
                                        type="text"
                                        required
                                        value={tempBillingInfo.city}
                                        onChange={(e) => setTempBillingInfo({ ...tempBillingInfo, city: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.billing.nif}</label>
                                        <input
                                            type="text"
                                            required
                                            value={tempBillingInfo.nif}
                                            onChange={(e) => setTempBillingInfo({ ...tempBillingInfo, nif: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.billing.rccm}</label>
                                        <input
                                            type="text"
                                            required
                                            value={tempBillingInfo.rccm}
                                            onChange={(e) => setTempBillingInfo({ ...tempBillingInfo, rccm: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-sm font-bold text-slate-800 mb-1.5">{t.settings.billing.billingEmail}</label>
                                    <input
                                        type="email"
                                        required
                                        value={tempBillingInfo.email}
                                        onChange={(e) => setTempBillingInfo({ ...tempBillingInfo, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none bg-white font-medium"
                                        placeholder="ex: finance@entreprise.com"
                                    />
                                    <p className="text-xs text-slate-400 mt-1.5">{t.settings.billing.emailDesc}</p>
                                </div>
                            </form>
                        </div>

                        {/* FOOTER */}
                        <div className="p-6 pt-2 bg-white rounded-b-xl shrink-0">
                            <button
                                type="submit"
                                form="billing-info-form"
                                disabled={isSubmitting}
                                className="w-full bg-[#FFC107] hover:bg-[#e0a800] text-[#0F4C5C] font-extrabold text-base py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" /> {t.settings.billing.editModal.saving}
                                    </>
                                ) : (
                                    t.settings.billing.editModal.save
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
