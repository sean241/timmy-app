import { useState, useEffect } from "react";
import { Download, Puzzle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/app/context/LanguageContext";

export default function SystemLogs() {
    const { t } = useLanguage();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('app_logs')
                .select('*, profiles(first_name, last_name, email)')
                .order('created_at', { ascending: false })
                .limit(100); // Increased limit for better search

            if (error) {
                console.error("Error fetching logs:", error);
            } else {
                setLogs(data || []);
            }
            setIsLoading(false);
        };

        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const searchLower = searchQuery.toLowerCase();
        return (
            log.action.toLowerCase().includes(searchLower) ||
            log.level.toLowerCase().includes(searchLower) ||
            (log.profiles?.first_name?.toLowerCase() || "").includes(searchLower) ||
            (log.profiles?.last_name?.toLowerCase() || "").includes(searchLower) ||
            (log.profiles?.email?.toLowerCase() || "").includes(searchLower)
        );
    });

    const handleExport = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(filteredLogs, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `system_logs_${new Date().toISOString()}.json`;
        link.click();
    };

    const toggleDetails = (id: string) => {
        if (expandedLogId === id) {
            setExpandedLogId(null);
        } else {
            setExpandedLogId(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t.systemLogs.title}</h2>
                    <p className="text-sm text-gray-500">{t.systemLogs.desc}</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <Download size={16} />
                    {t.systemLogs.export}
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Puzzle size={18} className="text-gray-400" /> {/* Using Puzzle as generic search icon if Search not imported, or replace with Search */}
                </div>
                <input
                    type="text"
                    placeholder={t.systemLogs.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#0F4C5C] focus:border-[#0F4C5C] sm:text-sm transition duration-150 ease-in-out"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.systemLogs.table.date}</th>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.systemLogs.table.level}</th>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.systemLogs.table.action}</th>
                                <th className="px-6 py-3 font-medium text-gray-500">{t.systemLogs.table.user}</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-center">{t.systemLogs.table.details}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                                        {t.common.loading}
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {t.systemLogs.empty}
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <>
                                        <tr key={log.id} className={`hover:bg-gray-50/50 transition-colors ${expandedLogId === log.id ? "bg-gray-50" : ""}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${log.level === 'ERROR' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    log.level === 'WARN' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {log.action}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {log.profiles ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs">{log.profiles.first_name} {log.profiles.last_name}</span>
                                                        <span className="text-[10px] text-gray-400">{log.profiles.email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Système</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => toggleDetails(log.id)}
                                                    className={`p-2 rounded-full transition-colors ${expandedLogId === log.id ? "bg-[#0F4C5C] text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
                                                    title={expandedLogId === log.id ? t.systemLogs.hideDetails : t.systemLogs.viewDetails}
                                                >
                                                    <AlertCircle size={18} className="rotate-180" /> {/* Using AlertCircle as Info icon substitute */}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedLogId === log.id && (
                                            <tr className="bg-gray-50 animate-in fade-in duration-200">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                                        <pre className="text-xs text-green-400 font-mono">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
