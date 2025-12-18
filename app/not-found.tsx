'use client';

import Link from 'next/link';
import { HardHat, Home, MessageCircle, Construction } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function NotFound() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans overflow-hidden relative">
            {/* Decorative background gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0F4C5C]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFC107]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="max-w-2xl w-full text-center relative z-10">

                {/* Animated Visual */}
                <div className="relative inline-block mb-12">
                    {/* Large background 404 */}
                    <div className="text-[12rem] md:text-[16rem] font-black text-[#0F4C5C]/5 select-none leading-none tracking-tighter">
                        404
                    </div>

                    {/* Foreground card */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            {/* Construction Tape Effect */}
                            <div className="absolute -top-6 -left-12 -right-12 h-6 bg-[#FFC107] shadow-lg transform -rotate-2 flex items-center justify-around overflow-hidden px-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="text-[#0F4C5C] font-black text-[10px] tracking-widest uppercase">Under Construction</div>
                                ))}
                            </div>

                            <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgba(15,76,92,0.15)] border border-slate-100 rotate-1 transform hover:rotate-0 transition-all duration-500 group">
                                <div className="bg-[#FFC107]/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <HardHat size={56} className="text-[#0F4C5C] animate-bounce" />
                                </div>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Construction size={20} className="text-[#FFC107]" />
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Zone Hors Services</span>
                                </div>
                            </div>

                            {/* Second Tape */}
                            <div className="absolute -bottom-4 -left-8 -right-8 h-8 bg-[#0F4C5C] shadow-lg transform rotate-3 flex items-center justify-around overflow-hidden px-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="text-[#FFC107] font-black text-[10px] tracking-widest uppercase">Timmy Solutions</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F4C5C] tracking-tight">
                        {t.errors.page404.title}
                    </h1>
                    <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
                        {t.errors.page404.desc}
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <Link
                        href="/admin/dashboard"
                        className="w-full sm:w-auto px-6 py-4 bg-[#0F4C5C] hover:bg-[#0a3641] text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(15,76,92,0.2)] hover:shadow-[0_15px_30px_rgba(15,76,92,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group whitespace-nowrap"
                    >
                        <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                        {t.errors.page404.backHome}
                    </Link>

                    <Link
                        href="/admin/help"
                        className="w-full sm:w-auto px-6 py-4 bg-white border-2 border-slate-200 hover:border-[#0F4C5C] text-[#0F4C5C] font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group whitespace-nowrap"
                    >
                        <Construction size={20} className="group-hover:rotate-12 transition-transform" />
                        {t.errors.page404.support}
                    </Link>
                </div>
            </div>

            {/* Background patterns */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-repeat-x opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, #FFC107 50%, transparent 50%)', backgroundSize: '100px 100%' }}></div>
        </div>
    );
}
