"use client";

import { useState } from "react";
import {
    Calendar, ChevronDown, Download, Lock, CheckCircle,
    AlertTriangle, FileText, Search, Filter, Printer
} from "lucide-react";

// --- Types ---
interface PayrollEntry {
    id: string;
    employeeName: string;
    employeeRole: string;
    avatar: string;
    normalHours: number;
    overtimeHours: number;
    absences: number; // hours
    advances: number; // FCFA
    status: "pending" | "paid";
    hourlyRate: number;
}

// --- Mock Data ---
const INITIAL_ENTRIES: PayrollEntry[] = [
    { id: "1", employeeName: "Moussa Diop", employeeRole: "Site Manager", avatar: "MD", normalHours: 160, overtimeHours: 12, absences: 0, advances: 50000, status: "pending", hourlyRate: 5000 },
    { id: "2", employeeName: "Jean Kouassi", employeeRole: "Mason", avatar: "JK", normalHours: 150, overtimeHours: 0, absences: 8, advances: 0, status: "pending", hourlyRate: 3000 },
    { id: "3", employeeName: "Sophie Nguema", employeeRole: "Architect", avatar: "SN", normalHours: 160, overtimeHours: 20, absences: 0, advances: 0, status: "paid", hourlyRate: 8000 },
    { id: "4", employeeName: "Ibrahim Diallo", employeeRole: "Electrician", avatar: "ID", normalHours: 160, overtimeHours: 5, absences: 0, advances: 20000, status: "pending", hourlyRate: 4000 },
];

export default function ReportsPage() {
    const [entries, setEntries] = useState<PayrollEntry[]>(INITIAL_ENTRIES);
    const [isPeriodClosed, setIsPeriodClosed] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("November 2025");
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    // --- Calculations ---
    const calculateGross = (entry: PayrollEntry) => {
        return (entry.normalHours * entry.hourlyRate) + (entry.overtimeHours * entry.hourlyRate * 1.5);
    };

    const calculateNet = (entry: PayrollEntry) => {
        const gross = calculateGross(entry);
        return gross - entry.advances;
    };

    const totalHours = entries.reduce((acc, curr) => acc + curr.normalHours + curr.overtimeHours, 0);
    const totalOvertime = entries.reduce((acc, curr) => acc + curr.overtimeHours, 0);
    const estimatedPayroll = entries.reduce((acc, curr) => acc + calculateNet(curr), 0);

    // --- Handlers ---
    const handleAdvanceChange = (id: string, value: string) => {
        if (isPeriodClosed) return;
        const numValue = parseInt(value) || 0;
        setEntries(prev => prev.map(e => e.id === id ? { ...e, advances: numValue } : e));
    };

    const togglePeriodStatus = () => {
        setIsPeriodClosed(!isPeriodClosed);
    };

    const handleExport = (format: string) => {
        console.log(`Exporting ${format}...`);
        setIsExportMenuOpen(false);
        // Implement actual export logic here
    };

    return (
        <div className="max-w-6xl mx-auto w-full space-y-6">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll & Reports</h1>
                    <p className="text-gray-500">Verify hours, validate advances, and export for payment.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period Selector */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium hover:bg-gray-50">
                            <Calendar size={16} className="text-gray-500" />
                            {selectedPeriod}
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>
                        {/* Dropdown would go here */}
                    </div>

                    {/* Close Period Button */}
                    <button
                        onClick={togglePeriodStatus}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm ${isPeriodClosed
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                            }`}
                    >
                        {isPeriodClosed ? <Lock size={16} /> : <Lock size={16} />}
                        {isPeriodClosed ? "Period Closed" : "Close Period"}
                    </button>

                    {/* Export Button */}
                    <div className="relative">
                        <button
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0F4C5C] text-white rounded-lg text-sm font-bold hover:bg-[#0a3642] shadow-sm transition-colors"
                        >
                            <Download size={16} />
                            Export
                        </button>

                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="p-2">
                                    <button onClick={() => handleExport('excel')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                                        <FileText size={16} className="text-green-600" /> Excel (Full)
                                    </button>
                                    <button onClick={() => handleExport('pdf')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                                        <Printer size={16} className="text-gray-600" /> Payslip (PDF)
                                    </button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <button onClick={() => handleExport('mobile_money')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                                        <Download size={16} className="text-red-600" /> Airtel/Moov (.csv)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- KPIs --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Hours</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalHours}h</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Overtime Hours</p>
                    <h3 className={`text-2xl font-bold ${totalOvertime > 50 ? 'text-red-600' : 'text-orange-600'}`}>{totalOvertime}h</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Est. Payroll</p>
                    <h3 className="text-2xl font-bold text-[#0F4C5C]">{estimatedPayroll.toLocaleString()} FCFA</h3>
                </div>
            </div>

            {/* --- PRE-PAYROLL TABLE --- */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={18} className="text-gray-400" />
                        Pre-Payroll Details
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                            />
                        </div>
                        <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3 text-center">Normal Hours</th>
                                <th className="px-4 py-3 text-center">Overtime</th>
                                <th className="px-4 py-3 text-center">Absences</th>
                                <th className="px-4 py-3 text-right w-32">Advances (FCFA)</th>
                                <th className="px-4 py-3 text-right">Net to Pay</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {entry.avatar}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{entry.employeeName}</div>
                                                <div className="text-xs text-gray-500">{entry.employeeRole}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-mono text-gray-600">{entry.normalHours}h</td>
                                    <td className={`px-4 py-3 text-center font-mono font-bold ${entry.overtimeHours > 0 ? 'text-orange-600' : 'text-gray-300'}`}>
                                        {entry.overtimeHours > 0 ? `+${entry.overtimeHours}h` : '-'}
                                    </td>
                                    <td className={`px-4 py-3 text-center font-mono ${entry.absences > 0 ? 'text-red-600 font-bold' : 'text-gray-300'}`}>
                                        {entry.absences > 0 ? `${entry.absences}h` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            value={entry.advances}
                                            onChange={(e) => handleAdvanceChange(entry.id, e.target.value)}
                                            disabled={isPeriodClosed || entry.status === 'paid'}
                                            className={`w-24 text-right p-1 rounded border ${entry.advances > 0 ? 'border-orange-200 bg-orange-50 text-orange-800 font-bold' : 'border-gray-200 text-gray-500'
                                                } focus:outline-none focus:ring-1 focus:ring-[#0F4C5C] disabled:opacity-50 disabled:cursor-not-allowed`}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                        {calculateNet(entry).toLocaleString()} FCFA
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {entry.status === 'paid' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                <CheckCircle size={12} /> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                    <span>Showing 4 of 4 employees</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
