'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home, Wrench } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useLanguage();

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Captured Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#FFF5F5] flex items-center justify-center p-6 font-sans overflow-hidden relative">
            {/* Dynamic Red Glow background */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-100/50 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-2xl w-full text-center relative z-10">

                {/* Main Error Container */}
                <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-[0_30px_70px_rgba(220,38,38,0.12)] border border-red-50 relative overflow-hidden group animate-in zoom-in duration-500">

                    {/* Animated red stripe at the top */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>

                    <div className="relative z-10">
                        {/* Error Icon with pulse effect */}
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-red-100 rounded-3xl animate-ping opacity-25"></div>
                            <div className="relative bg-red-50 w-24 h-24 rounded-3xl flex items-center justify-center animate-bounce">
                                <AlertTriangle size={56} className="text-red-500" />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-[#0F4C5C] mb-4 tracking-tight leading-tight">
                            {t.errors.page500.title}
                        </h1>

                        <p className="text-xl text-slate-500 mb-12 max-w-md mx-auto leading-relaxed">
                            {t.errors.page500.desc}
                        </p>

                        {/* Actions Grid */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => reset()}
                                className="w-full sm:w-auto px-8 py-5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(220,38,38,0.25)] hover:shadow-[0_15px_35px_rgba(220,38,38,0.35)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group whitespace-nowrap"
                            >
                                <RefreshCcw size={22} className="group-hover:rotate-180 transition-transform duration-700" />
                                {t.errors.page500.retry}
                            </button>

                            <Link
                                href="/admin/dashboard"
                                className="w-full sm:w-auto px-8 py-5 bg-[#0F4C5C] hover:bg-[#0a3641] text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(15,76,92,0.15)] hover:shadow-[0_15px_35px_rgba(15,76,92,0.25)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group whitespace-nowrap"
                            >
                                <Home size={22} className="group-hover:-translate-x-1 transition-transform" />
                                {t.errors.page500.backHome}
                            </Link>
                        </div>
                    </div>

                    {/* Reference ID for tech support */}
                    {error.digest && (
                        <div className="mt-10 pt-8 border-t border-slate-50">
                            <span className="text-[10px] text-slate-300 font-mono tracking-widest uppercase block mb-1">Incident Token</span>
                            <code className="bg-slate-50 text-slate-400 text-xs px-3 py-1 rounded-full">{error.digest}</code>
                        </div>
                    )}
                </div>

                {/* Footer info decoration */}
                <div className="mt-12 flex items-center justify-center gap-6 opacity-30 grayscale saturate-0">
                    <div className="flex items-center gap-3">
                        <Wrench size={20} className="animate-spin duration-10000" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">Technical Support Dispatch in Progress</span>
                    </div>
                </div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
    );
}
