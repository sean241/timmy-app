"use client";

import { usePathname } from "next/navigation";

export default function PageContainer({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isFullWidth = pathname === "/admin/planning" || pathname === "/admin/settings";

    return (
        <div className={isFullWidth ? "w-full" : "max-w-6xl mx-auto"}>
            {children}
        </div>
    );
}
