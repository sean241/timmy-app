"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/db";
import { Employee } from "@/types";
import Webcam from "react-webcam";
import { LogOut, LogIn, UserCheck, RefreshCw, List, LayoutDashboard, CheckCircle, Users, X, Search, Wifi, WifiOff, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { fetchOrganizationEmployees, fetchKioskConfig, pushKioskLogs } from "@/app/actions/sync";

export default function KioskPage() {
    const [step, setStep] = useState<"PIN" | "ACTION">("PIN");
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [msg, setMsg] = useState<string | null>(null);
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");
    const [syncing, setSyncing] = useState(false);
    const [showEmployeeList, setShowEmployeeList] = useState(false);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

    // Config state
    const [orgName, setOrgName] = useState("Organization");
    const [siteName, setSiteName] = useState("Site");
    const [orgLogo, setOrgLogo] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);

    const webcamRef = useRef<Webcam>(null);

    // Language State
    const [locale, setLocale] = useState<"fr" | "en">("fr");

    const t = {
        fr: {
            online: "En ligne",
            offline: "Hors ligne",
            staffOnSite: "Effectif sur site",
            present: "présents",
            total: "total",
            searchPlaceholder: "Rechercher un employé...",
            noEmployeeFound: "Aucun employé trouvé",
            presentBadge: "PRÉSENT",
            absentBadge: "ABSENT",
            since: "Depuis",
            outAt: "Sorti à",
            hello: "Bonjour",
            arrival: "ARRIVÉE",
            departure: "DÉPART",
            cancel: "Annuler",
            pinError: "Code PIN incorrect",
            systemReady: "Timmy Terminal V1.0 • Système Prêt",
            goodDay: "Bonne journée !",
            goodBye: "Au revoir !",
            employee: "Employé",
            listTitle: "Liste des employés",
            dateFormat: { weekday: "long", day: "numeric", month: "long" } as const
        },
        en: {
            online: "Online",
            offline: "Offline",
            staffOnSite: "Staff on site",
            present: "present",
            total: "total",
            searchPlaceholder: "Search employee...",
            noEmployeeFound: "No employee found",
            presentBadge: "PRESENT",
            absentBadge: "ABSENT",
            since: "Since",
            outAt: "Out at",
            hello: "Hello",
            arrival: "CHECK-IN",
            departure: "CHECK-OUT",
            cancel: "Cancel",
            pinError: "Incorrect PIN Code",
            systemReady: "Timmy Terminal V1.0 • System Ready",
            goodDay: "Have a good day!",
            goodBye: "Goodbye!",
            employee: "Employee",
            listTitle: "Employee List",
            dateFormat: { weekday: "long", day: "numeric", month: "long" } as const
        }
    };

    const currentT = t[locale];

    // Network Status
    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Clock
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            // We use standard toLocaleString but using the current locale
            const localeStr = locale === 'fr' ? 'fr-FR' : 'en-US';
            setTime(now.toLocaleTimeString(localeStr, { hour: "2-digit", minute: "2-digit" }));
            setDate(now.toLocaleDateString(localeStr, currentT.dateFormat));
        }, 1000);
        return () => clearInterval(interval);
    }, [locale]);

    // Load Config
    useEffect(() => {
        const loadConfig = async () => {
            const storedOrgName = await db.local_config.get("org_name");
            const storedSiteName = await db.local_config.get("site_name");
            const storedOrgLogo = await db.local_config.get("org_logo");

            if (storedOrgName?.value && typeof storedOrgName.value === 'string') setOrgName(storedOrgName.value);
            if (storedSiteName?.value && typeof storedSiteName.value === 'string') setSiteName(storedSiteName.value);
            if (storedOrgLogo?.value && typeof storedOrgLogo.value === 'string') setOrgLogo(storedOrgLogo.value);
        };
        loadConfig();
    }, []);

    const handleValidate = () => {
        if (pin.length === 4) {
            checkPin(pin);
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const handleDigitPress = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
        }
    };

    const handleClear = () => {
        setPin("");
        setError(false);
    };

    const checkPin = async (code: string) => {
        try {
            const emp = await db.local_employees.where("pin_code").equals(code).first();
            if (emp) {
                setEmployee(emp);
                setStep("ACTION");
                setPin("");
                setError(false);
            } else {
                setError(true);
                setTimeout(() => {
                    setPin("");
                    setError(false);
                }, 500);
            }
        } catch (e) {
            console.error("Error checking pin", e);
            setError(true);
        }
    };

    const handleClock = async (type: "IN" | "OUT") => {
        if (!employee) return;

        let photo = "";
        if (webcamRef.current) {
            const screenshot = webcamRef.current.getScreenshot();
            if (screenshot) photo = screenshot;
        }

        try {
            const timestamp = new Date().toISOString();

            // 1. Save locally first (Optimistic UI)
            const logId = await db.local_logs.add({
                employee_id: employee.id,
                employee_name: `${employee.first_name} ${employee.last_name}`,
                type,
                timestamp,
                photo,
                status: 'PENDING'
            });

            setMsg(type === "IN" ? currentT.goodDay : currentT.goodBye);

            // 2. Attempt Immediate Sync (Background)
            (async () => {
                try {
                    const orgId = (await db.local_config.get("organization_id"))?.value as string;
                    const siteId = (await db.local_config.get("site_id"))?.value as string;
                    const kioskId = (await db.local_config.get("kiosk_id"))?.value as string;

                    if (orgId && kioskId) {
                        const pushResult = await pushKioskLogs([{
                            employee_id: employee.id,
                            organization_id: orgId,
                            site_id: siteId,
                            kiosk_id: kioskId,
                            type,
                            timestamp,
                            photo
                        }]);

                        if (pushResult.success) {
                            await db.local_logs.update(logId, { status: 'SYNCED' });
                            console.log("Immediate sync successful");
                        }
                    }
                } catch (syncErr) {
                    console.error("Immediate sync failed", syncErr);
                }
            })();

            setTimeout(() => {
                setMsg(null);
                setEmployee(null);
                setStep("PIN");
            }, 2000);

        } catch (e) {
            console.error("Error clocking", e);
            // Fallback
            setEmployee(null);
            setStep("PIN");
        }
    };

    // Background Sync Interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (navigator.onLine) {
                console.log("Running background sync...");
                handleSync(true);
            }
        }, 60000); // Every 60 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSync = async (silent = false) => {
        if (!silent) setSyncing(true);
        try {
            // 1. Get Kiosk ID
            let kioskId = (await db.local_config.get("kiosk_id"))?.value as string;

            // FALLBACK FOR USER REQUEST
            if (!kioskId) {
                kioskId = "f0f35cc5-3e3a-4956-9e8d-22ed2c83b65a";
                await db.local_config.put({ key: "kiosk_id", value: kioskId });
            }

            if (!silent) console.log("Syncing for Kiosk ID:", kioskId);

            // 2. Fetch Kiosk Config
            const configResult = await fetchKioskConfig(kioskId);

            if (configResult.success && configResult.config) {
                const { organization_id, site_id, organization_name, site_name, kiosk_name, organization_logo } = configResult.config;

                // Update Local Config
                await db.local_config.bulkPut([
                    { key: "organization_id", value: organization_id },
                    { key: "site_id", value: site_id },
                    { key: "org_name", value: organization_name },
                    { key: "org_logo", value: organization_logo || "" },
                    { key: "site_name", value: site_name },
                    { key: "kiosk_name", value: kiosk_name },
                    { key: "last_sync", value: new Date().toISOString() }
                ]);

                // Update State
                setOrgName(organization_name || "Organization");
                setSiteName(site_name || "Site");
                if (organization_logo) setOrgLogo(organization_logo);

                // 3. Fetch Employees for this Org
                const empResult = await fetchOrganizationEmployees(organization_id);

                if (empResult.success && empResult.employees) {
                    // Transaction to ensure atomicity
                    await db.transaction('rw', db.local_employees, async () => {
                        await db.local_employees.clear();
                        await db.local_employees.bulkAdd(empResult.employees as Employee[]);
                    });

                    // Refresh list if open
                    if (showEmployeeList) {
                        await handleOpenEmployeeList();
                    }

                    if (!silent) console.log("Employees synced:", empResult.employees.length);
                } else {
                    console.error("Employee sync failed:", empResult.error);
                }

                // 4. Push Pending Logs
                const pendingLogs = await db.local_logs.where("status").equals("PENDING").toArray();

                if (pendingLogs.length > 0) {
                    if (!silent) console.log(`Pushing ${pendingLogs.length} pending logs...`);

                    const logsPayload = pendingLogs.map(log => ({
                        ...log,
                        organization_id,
                        site_id,
                        kiosk_id: kioskId
                    }));

                    const pushResult = await pushKioskLogs(logsPayload);

                    if (pushResult.success) {
                        // Mark as synced
                        const ids = pendingLogs.map(l => l.id!);
                        await db.local_logs.bulkPut(pendingLogs.map(l => ({ ...l, status: 'SYNCED' })));
                        if (!silent) console.log("Logs pushed successfully");
                    } else {
                        console.error("Log push failed:", pushResult.error);
                    }
                }

            } else {
                console.error("Kiosk config sync failed:", configResult.error);
            }

        } catch (error) {
            console.error("Sync error:", error);
        } finally {
            if (!silent) setSyncing(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [employeeStatuses, setEmployeeStatuses] = useState<Record<string, { isPresent: boolean; time: string | null }>>({});

    const handleOpenEmployeeList = async () => {
        const employees = await db.local_employees
            .filter(emp => !!emp.first_name && emp.first_name.trim().length > 0)
            .toArray();
        setAllEmployees(employees);

        const statusPromises = employees.map(async (emp) => {
            const lastLog = await db.local_logs
                .where('employee_id')
                .equals(emp.id)
                .reverse()
                .first();

            return {
                id: emp.id,
                isPresent: lastLog?.type === 'IN',
                time: lastLog ? new Date(lastLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
            };
        });

        const results = await Promise.all(statusPromises);
        const newStatuses: Record<string, { isPresent: boolean; time: string | null }> = {};
        results.forEach(r => newStatuses[r.id] = { isPresent: r.isPresent, time: r.time });

        setEmployeeStatuses(newStatuses);
        setShowEmployeeList(true);
    };

    // Derived state for filtered employees
    const filteredEmployees = allEmployees.filter(emp => {
        const search = searchTerm.toLowerCase();
        return (emp.first_name?.toLowerCase() || "").includes(search) ||
            (emp.last_name?.toLowerCase() || "").includes(search) ||
            (emp.job_title && emp.job_title.toLowerCase().includes(search));
    });

    const presentCount = Object.values(employeeStatuses).filter(s => s.isPresent).length;

    return (
        <main className="min-h-screen bg-[#0B3B46] relative font-sans overflow-hidden">

            {/* ACTION VIEW Container */}
            <div className={clsx(
                "absolute inset-0 z-0 bg-[#0B3B46] transition-opacity duration-500",
                step === "ACTION" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
                    <div className="w-full max-w-md flex flex-col items-center">
                        <h2 className="text-3xl font-bold mb-8 text-center">{currentT.hello}, <span className="text-[#4FD1C5]">{employee?.first_name}</span></h2>

                        <div className="relative w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-[#1E5562] mb-8">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "user" }}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {!msg && (
                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={() => handleClock("IN")}
                                    className="h-24 rounded-2xl bg-[#10B981] hover:bg-[#059669] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20"
                                >
                                    <LogIn size={32} />
                                    <span className="font-bold text-lg">{currentT.arrival}</span>
                                </button>

                                <button
                                    onClick={() => handleClock("OUT")}
                                    className="h-24 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 shadow-lg shadow-[#EF4444]/20"
                                >
                                    <LogOut size={32} />
                                    <span className="font-bold text-lg">{currentT.departure}</span>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => { setEmployee(null); setStep("PIN"); }}
                            className="mt-8 text-white/50 hover:text-white text-sm"
                        >
                            {currentT.cancel}
                        </button>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN SUCCESS OVERLAY */}
            {msg && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#10B981] p-8 text-center animate-in fade-in zoom-in duration-300">
                    <CheckCircle size={120} className="text-white mb-8 animate-bounce" />
                    <h3 className="text-5xl font-bold text-white tracking-tight">{msg}</h3>
                </div>
            )}

            {/* PIN PAD SECTION */}
            <div className={clsx(
                "absolute inset-0 z-10 bg-[#0B3B46] flex flex-col items-center justify-center p-6 text-white transition-opacity duration-300",
                step === "PIN" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>

                {/* Network Status Indicator */}
                <div className="absolute top-6 left-6 z-20">
                    <div className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors",
                        isOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                    )}>
                        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                        <span className="text-xs font-medium uppercase tracking-wider">
                            {isOnline ? currentT.online : currentT.offline}
                        </span>
                    </div>
                </div>

                {/* Admin Controls */}
                <div className="absolute top-6 right-6 flex gap-3 z-20">
                    {/* Language Switcher */}
                    <button
                        onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-xs font-bold"
                    >
                        {locale.toUpperCase()}
                    </button>

                    <button onClick={handleOpenEmployeeList} className="text-white/20 hover:text-white/80 transition-colors" title={currentT.listTitle}>
                        <Users size={20} />
                    </button>
                    <button onClick={() => handleSync()} disabled={syncing} className="text-white/20 hover:text-white/80 transition-colors">
                        <RefreshCw size={20} className={clsx(syncing && "animate-spin")} />
                    </button>
                    <Link href="/maintenance" className="text-white/20 hover:text-white/80 transition-colors">
                        <LayoutDashboard size={20} />
                    </Link>
                </div>

                {/* Employee List Modal */}
                {showEmployeeList && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white text-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{currentT.staffOnSite}</h2>
                                    <p className="text-slate-500 font-medium mt-1">
                                        <span className="text-emerald-600 font-bold">{presentCount}</span> {currentT.present} / {allEmployees.length} {currentT.total}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowEmployeeList(false)}
                                    className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="p-4 bg-white">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder={currentT.searchPlaceholder}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-100 border-none rounded-xl py-4 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all"
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {filteredEmployees.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <p>{currentT.noEmployeeFound}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredEmployees.map((emp) => {
                                            const status = employeeStatuses[emp.id];
                                            const isPresent = status?.isPresent;

                                            return (
                                                <div key={emp.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        {/* Avatar */}
                                                        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 shrink-0 border-2 border-white shadow-sm overflow-hidden">
                                                            {emp.avatar_url ? (
                                                                <Image src={emp.avatar_url} alt={emp.first_name || "Emp"} width={56} height={56} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{(emp.first_name?.charAt(0) || "")}{(emp.last_name?.charAt(0) || "")}</span>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-lg leading-tight">
                                                                {emp.first_name} {emp.last_name}
                                                            </h3>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">
                                                                {emp.job_title || currentT.employee}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className={clsx(
                                                            "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2",
                                                            isPresent
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-slate-100 text-slate-500"
                                                        )}>
                                                            {isPresent && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                                            {isPresent ? currentT.presentBadge : currentT.absentBadge}
                                                        </div>
                                                        {status.time && (
                                                            <span className="text-[10px] font-medium text-slate-400">
                                                                {isPresent ? currentT.since : currentT.outAt} {status.time}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center w-full max-w-md">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-full border-2 border-[#1E5562] flex items-center justify-center mb-6 bg-white/50 overflow-hidden relative">
                        {orgLogo ? (
                            <Image src={orgLogo} alt="Logo" fill className="object-cover" />
                        ) : (
                            <Building2 size={40} className="text-[#FBBF24]" />
                        )}
                    </div>

                    {/* Site & Org Name */}
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-white mb-1">{siteName}</h2>
                        <p className="text-[#4FD1C5] text-sm font-bold uppercase tracking-wider">{orgName}</p>
                    </div>

                    {/* Clock */}
                    <div className="text-center mb-10">
                        <h1 className="text-7xl font-bold tracking-wider mb-2 font-mono">{time}</h1>
                        <p className="text-[#4FD1C5] text-sm font-medium tracking-widest">{date}</p>
                    </div>

                    {/* PIN Indicators */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="flex gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={clsx(
                                        "w-5 h-5 rounded-full border-2 transition-all duration-300",
                                        i < pin.length ? "bg-[#FBBF24] border-[#FBBF24]" : "border-[#4FD1C5] bg-transparent",
                                        error && "border-red-500 bg-red-500/20 animate-pulse"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="h-6">
                            {error && (
                                <p className="text-red-400 font-bold text-sm animate-pulse">{currentT.pinError}</p>
                            )}
                        </div>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-4 w-full">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleDigitPress(num.toString())}
                                className="h-20 bg-[#0E4C5B] rounded-xl text-3xl font-bold text-white hover:bg-[#165f70] active:scale-95 transition-all shadow-sm"
                            >
                                {num}
                            </button>
                        ))}

                        {/* Clear Button */}
                        <button
                            onClick={handleClear}
                            className="h-20 bg-[#2D3344] rounded-xl text-xl font-bold text-[#F87171] hover:bg-[#374151] active:scale-95 transition-all shadow-sm"
                        >
                            C
                        </button>

                        {/* Zero */}
                        <button
                            onClick={() => handleDigitPress("0")}
                            className="h-20 bg-[#0E4C5B] rounded-xl text-3xl font-bold text-white hover:bg-[#165f70] active:scale-95 transition-all shadow-sm"
                        >
                            0
                        </button>

                        {/* Action/User Button (Validate) */}
                        <button
                            onClick={handleValidate}
                            className="h-20 bg-[#FBBF24] rounded-xl flex items-center justify-center text-[#0B3B46] hover:bg-[#F59E0B] active:scale-95 transition-all shadow-sm"
                        >
                            <UserCheck size={32} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-[#4FD1C5]/40 text-[10px] font-mono tracking-[0.2em] uppercase">
                        {currentT.systemReady}
                    </div>
                </div>
            </div>
        </main>
    );
}
