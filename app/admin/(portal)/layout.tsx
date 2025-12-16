import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import PageContainer from "@/components/PageContainer";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex print:bg-white print:block">
            {/* Sidebar */}
            <div className="print:hidden">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen print:ml-0 print:h-auto print:block">
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
