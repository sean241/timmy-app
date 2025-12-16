"use client";

import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { X, MessageSquare, Bug, Lightbulb, Heart, Send, Loader2, Star } from "lucide-react";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const { t } = useLanguage();
    const [type, setType] = useState<'bug' | 'idea' | 'other'>('idea');
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(5);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // TODO: Actually save to Supabase or send email
        console.log("Feedback Submitted:", { type, message, rating });

        setStatus('success');
        setTimeout(() => {
            onClose();
            setStatus('idle');
            setMessage("");
            setRating(5);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-[#0F4C5C] px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-[#FFC107]" size={20} />
                        <h3 className="font-bold text-lg">{t.feedback.title}</h3>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {status === 'success' ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Heart size={32} fill="currentColor" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t.feedback.success}</h3>
                        <p className="text-slate-500">Votre avis est précieux pour nous.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">{t.feedback.type}</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setType('bug')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'bug' ? 'bg-red-50 border-red-200 text-red-600 ring-1 ring-red-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <Bug size={20} />
                                    <span className="text-xs font-bold">{t.feedback.types.bug}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('idea')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'idea' ? 'bg-amber-50 border-amber-200 text-amber-600 ring-1 ring-amber-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <Lightbulb size={20} />
                                    <span className="text-xs font-bold">{t.feedback.types.idea}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('other')}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'other' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <Heart size={20} />
                                    <span className="text-xs font-bold">{t.feedback.types.other}</span>
                                </button>
                            </div>
                        </div>

                        {/* Rating (NPS style) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">{t.feedback.nps}</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={28}
                                            className={star <= rating ? "text-[#FFC107] fill-[#FFC107]" : "text-slate-200 fill-slate-100"}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block">{t.feedback.message}</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t.feedback.placeholder}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#0F4C5C] focus:ring-1 focus:ring-[#0F4C5C] outline-none min-h-[100px] resize-none text-sm"
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                {t.feedback.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={status === 'sending' || !message.trim()}
                                className="flex-1 px-4 py-3 bg-[#0F4C5C] hover:bg-[#0a3844] text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {status === 'sending' ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {t.feedback.submit}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
}
