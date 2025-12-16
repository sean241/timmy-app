"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 5000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    let bgClass = "bg-[#0F4C5C] border-[#0F4C5C]"; // success
    if (type === "error") bgClass = "bg-red-600 border-red-600";
    if (type === "info") bgClass = "bg-blue-600 border-blue-600";

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border transition-all duration-300 animate-in slide-in-from-top-2 fade-in text-white ${bgClass}`}>
            <div className={`p-1 rounded-full bg-white/20 text-white`}>
                {type === "success" ? <CheckCircle size={20} /> : type === "error" ? <XCircle size={20} /> : <CheckCircle size={20} />}
            </div>
            <p className="font-bold text-base">{message}</p>
            <button onClick={() => setIsVisible(false)} className="text-white/70 hover:text-white ml-2 transition-colors">
                <X size={18} />
            </button>
        </div>
    );
}
