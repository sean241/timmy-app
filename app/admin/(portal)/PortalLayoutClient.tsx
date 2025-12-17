"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import PageContainer from "@/components/PageContainer";
import { SidebarProvider, useSidebar } from "@/app/context/SidebarContext";

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-gray-50 flex print:bg-white print:block">
            {/* Sidebar */}
            <div className="print:hidden">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out print:ml-0 print:h-auto print:block ${isCollapsed ? "ml-20" : "ml-64"
                    }`}
            >
                <div className="print:hidden">
                    <TopNav />
                </div>

                <main className="flex-1 p-8 overflow-y-auto print:p-0 print:overflow-visible">
                    <PageContainer>
                        {children}
                    </PageContainer>
                </main>
            </div>
        </div>
    );
}

export default function PortalLayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <PortalLayoutContent>{children}</PortalLayoutContent>
        </SidebarProvider>
    );
}
