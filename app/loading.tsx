import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white/80 backdrop-blur-sm z-50 fixed inset-0">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-[#0F4C5C]" />
                <p className="text-[#0F4C5C] font-medium animate-pulse">Chargement...</p>
            </div>
        </div>
    );
}
