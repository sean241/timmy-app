"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import clsx from "clsx";

export const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <div
            className={clsx(
                "absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                isOnline
                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                    : "bg-red-500/20 text-red-200 border border-red-500/30"
            )}
        >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
        </div>
    );
};
