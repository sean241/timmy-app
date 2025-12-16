"use client";

import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import { useLanguage } from "@/app/context/LanguageContext";
import {
    Search,
    ChevronDown,
    HelpCircle,
    MessageSquare,
    LifeBuoy,
    Calendar,
    Users,
    Clock,
    Tablet,
    CreditCard,
    Settings,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import SupportModal from "@/components/SupportModal";

export default function HelpPage() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    const categories = [
        { id: 'general', icon: Settings, label: t.help?.categories.general },
        { id: 'planning', icon: Calendar, label: t.help?.categories.planning },
        { id: 'tracking', icon: Clock, label: t.help?.categories.tracking },
        { id: 'employees', icon: Users, label: t.help?.categories.employees },
        { id: 'kiosks', icon: Tablet, label: t.help?.categories.kiosks },
        { id: 'billing', icon: CreditCard, label: t.help?.categories.billing },
    ];

    // Combine all FAQs into a flat list for search, or structured for categorical view
    const allFaqs = Object.entries(t.help?.faq || {}).flatMap(([catId, questions]) =>
        (questions as any[]).map((q, idx) => ({ ...q, id: `${catId}-${idx}`, category: catId }))
    );

    const filteredFaqs = allFaqs.filter(item => {
        const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <PageContainer title={t.help?.title} subtitle={t.help?.subtitle}>

            {/* Search Header */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-4xl mx-auto text-center space-y-6">
                <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LifeBuoy size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Comment pouvons-nous vous aider ?</h2>
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder={t.help?.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-base transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">

                {/* Sidebar Categories */}
                <div className="lg:col-span-3 space-y-2">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group ${activeCategory === 'all'
                            ? 'bg-[#0F4C5C] text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        <span>Tout voir</span>
                        {activeCategory === 'all' && <ChevronRight size={16} />}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group ${activeCategory === cat.id
                                ? 'bg-[#0F4C5C] text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <cat.icon size={18} className={activeCategory === cat.id ? 'text-sky-200' : 'text-slate-400 group-hover:text-slate-600'} />
                                <span>{cat.label}</span>
                            </div>
                            {activeCategory === cat.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>

                {/* FAQ Content */}
                <div className="lg:col-span-9 space-y-4">
                    {filteredFaqs.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-500">
                            <HelpCircle size={48} className="mx-auto text-slate-200 mb-4" />
                            <p>Aucun résultat trouvé pour "{searchQuery}".</p>
                        </div>
                    ) : (
                        filteredFaqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-white rounded-xl border border-slate-100 overflow-hidden transition-all hover:border-[#0F4C5C]/20"
                            >
                                <button
                                    onClick={() => setOpenQuestion(openQuestion === faq.id ? null : faq.id)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <span className="font-semibold text-slate-800">{faq.q}</span>
                                    <ChevronDown
                                        size={20}
                                        className={`text-slate-400 transition-transform duration-200 ${openQuestion === faq.id ? 'rotate-180 text-[#0F4C5C]' : ''}`}
                                    />
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openQuestion === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-50 bg-slate-50/50">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Contact Support CTA */}
                    <div className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <MessageSquare size={24} className="text-sky-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{t.help?.contactTitle}</h3>
                                <p className="text-slate-300 text-sm">{t.help?.contactDesc}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSupportOpen(true)}
                            className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-sky-50 transition-colors whitespace-nowrap shadow-lg flex items-center gap-2"
                        >
                            <span>{t.help?.contactBtn}</span>
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        </PageContainer>
    );
}
