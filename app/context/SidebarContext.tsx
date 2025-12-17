"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    expandSidebar: () => void;
    collapseSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Function to handle resize
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true);
            }
        };

        // Initial check
        const savedState = localStorage.getItem("sidebar_collapsed");
        if (window.innerWidth < 768) {
            // Priority to mobile collapse
            setIsCollapsed(true);
        } else if (savedState) {
            // Restore user preference if desktop
            setIsCollapsed(savedState === "true");
        }

        // Add event listener
        window.addEventListener("resize", handleResize);

        setIsInitialized(true);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar_collapsed", String(newState));
    };

    const expandSidebar = () => {
        setIsCollapsed(false);
        localStorage.setItem("sidebar_collapsed", "false");
    };

    const collapseSidebar = () => {
        setIsCollapsed(true);
        localStorage.setItem("sidebar_collapsed", "true");
    };

    // Helper to prevent flash of wrong state (optional, can be improved)
    if (!isInitialized) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                toggleSidebar,
                expandSidebar,
                collapseSidebar,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
