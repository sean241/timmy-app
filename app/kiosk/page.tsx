"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { Employee } from "@/types";
import Webcam from "react-webcam";
import { LogOut, LogIn, UserCheck, RefreshCw, List, LayoutDashboard, CheckCircle, Users, X, Search, Wifi, WifiOff, Building2, Monitor, ArrowLeftRight, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { fetchOrganizationEmployees, fetchKioskConfig, pushKioskLogs } from "@/app/actions/sync";

export default function KioskPage() {
    const router = useRouter();
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
    const [kioskName, setKioskName] = useState("");
    const [requirePhoto, setRequirePhoto] = useState(true);
    const [orgLogo, setOrgLogo] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [pairedTerminals, setPairedTerminals] = useState<any[]>([]);
    const [showTerminalSwitcher, setShowTerminalSwitcher] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [employeeStatuses, setEmployeeStatuses] = useState<Record<string, { isPresent: boolean; time: string | null }>>({});
    const [isValidating, setIsValidating] = useState(true);

    const webcamRef = useRef<Webcam>(null);
    const isSyncingRef = useRef(false);

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
            const storedKioskName = await db.local_config.get("kiosk_name");
            const storedRequirePhoto = await db.local_config.get("require_photo");

            if (storedOrgName?.value && typeof storedOrgName.value === 'string') setOrgName(storedOrgName.value);
            if (storedSiteName?.value && typeof storedSiteName.value === 'string') setSiteName(storedSiteName.value);
            if (storedOrgLogo?.value && typeof storedOrgLogo.value === 'string') setOrgLogo(storedOrgLogo.value);
            if (storedKioskName?.value && typeof storedKioskName.value === 'string') setKioskName(storedKioskName.value);
            if (storedRequirePhoto && typeof storedRequirePhoto.value === 'boolean') setRequirePhoto(storedRequirePhoto.value);

            // SELF-HEALING: If we have an active kiosk but it's not in the terminals table, add it.
            const currentKioskId = (await db.local_config.get("kiosk_id"))?.value as string;
            if (currentKioskId) {
                const existing = await db.terminals.get(currentKioskId);
                if (!existing && storedOrgName?.value && storedSiteName?.value) {
                    await db.terminals.put({
                        id: currentKioskId,
                        name: "Terminal",
                        site_id: (await db.local_config.get("site_id"))?.value as string || "",
                        site_name: storedSiteName.value as string,
                        organization_id: (await db.local_config.get("organization_id"))?.value as string || "",
                        organization_name: storedOrgName.value as string,
                        logo_url: storedOrgLogo?.value as string || ""
                    });
                }
            }

            // Fetch all paired terminals
            const terminals = await db.terminals.toArray();
            setPairedTerminals(terminals);
        };
        loadConfig();
    }, []);

    const handleSwitchTerminal = async (terminalId: string) => {
        setSyncing(true);
        try {
            const term = await db.terminals.get(terminalId);
            if (term) {
                // Update active kiosk IN BULK in local_config
                await db.local_config.bulkPut([
                    { key: "kiosk_id", value: terminalId },
                    { key: "organization_id", value: term.organization_id },
                    { key: "site_id", value: term.site_id },
                    { key: "org_name", value: term.organization_name },
                    { key: "site_name", value: term.site_name },
                    { key: "org_logo", value: term.logo_url || "" },
                    { key: "kiosk_name", value: term.name }
                ]);

                // Update state immediately for visual feedback
                setOrgName(term.organization_name);
                setSiteName(term.site_name);
                setKioskName(term.name);
                setOrgLogo(term.logo_url || null);

                // Close switcher
                setShowTerminalSwitcher(false);

                // Trigger a full sync for the new terminal
                await handleSync(false);
            }
        } catch (err) {
            console.error("Error switching terminal:", err);
        } finally {
            setSyncing(false);
        }
    };

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
        if (requirePhoto && webcamRef.current) {
            const screenshot = webcamRef.current.getScreenshot();
            if (screenshot) photo = screenshot;
        }

        try {
            const timestamp = new Date().toISOString();

            // Get current IDs for tracking
            const orgId = (await db.local_config.get("organization_id"))?.value as string;
            const siteId = (await db.local_config.get("site_id"))?.value as string;
            const kioskId = (await db.local_config.get("kiosk_id"))?.value as string;

            // 1. Save locally first (Optimistic UI)
            const logId = await db.local_logs.add({
                employee_id: employee.id,
                employee_name: `${employee.first_name} ${employee.last_name}`,
                organization_id: orgId || "",
                site_id: siteId || "",
                kiosk_id: kioskId || "",
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
        const checkPairing = async () => {
            try {
                let kioskId = (await db.local_config.get("kiosk_id"))?.value;

                // RESTORE IDENTITY: If IndexedDB is wiped, try to recover from LocalStorage
                if (!kioskId) {
                    const backupId = localStorage.getItem("kiosk_id");
                    if (backupId) {
                        console.log("Restoring Kiosk ID from LocalStorage backup");
                        await db.local_config.put({ key: "kiosk_id", value: backupId });
                        kioskId = backupId;
                    }
                }
                const terms = await db.terminals.toArray();

                if (!kioskId && terms.length === 0) {
                    console.log("No terminal paired, redirecting to setup...");
                    router.replace("/site-setup");
                    return;
                }

                setIsValidating(false);
                handleSync(true); // Initial sync on mount
            } catch (e) {
                console.error("Kiosk Boot Error:", e);
                // Force UI unlock to allow retry or debugging
                setIsValidating(false);
            }
        };

        checkPairing();

        // Listen for online status to trigger sync
        const handleOnline = () => {
            console.log("Device online - triggering sync...");
            handleSync(true);
        };
        window.addEventListener('online', handleOnline);

        const interval = setInterval(() => {
            if (navigator.onLine) {
                handleSync(true);
            }
        }, 60000); // Every 60 seconds

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    const handleSync = async (silent = false) => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;

        if (!silent) setSyncing(true);
        let hasSuccess = false;
        try {
            // 1. Get Cached IDs
            const kioskId = (await db.local_config.get("kiosk_id"))?.value as string;
            const cachedOrgId = (await db.local_config.get("organization_id"))?.value as string;
            const cachedSiteId = (await db.local_config.get("site_id"))?.value as string;

            if (!kioskId) return;

            // 2. Push Pending Logs
            // 2. Push Pending Logs (Batched)
            const pendingLogs = await db.local_logs.where("status").equals("PENDING").toArray();

            if (pendingLogs.length > 0) {
                const BATCH_SIZE = 5; // Photos are heavy (~100KB), limit batch size

                for (let i = 0; i < pendingLogs.length; i += BATCH_SIZE) {
                    const batch = pendingLogs.slice(i, i + BATCH_SIZE);

                    const logsPayload = batch.map(log => ({
                        employee_id: log.employee_id,
                        organization_id: log.organization_id || cachedOrgId,
                        site_id: log.site_id || cachedSiteId || null,
                        kiosk_id: log.kiosk_id || kioskId || null,
                        type: log.type,
                        timestamp: log.timestamp,
                        photo: log.photo
                    })).filter(log => !!log.organization_id);

                    if (logsPayload.length === 0) continue;

                    const pushResult = await pushKioskLogs(logsPayload);

                    if (pushResult.success) {
                        await db.local_logs.bulkPut(batch.map(l => ({ ...l, status: 'SYNCED' })));
                        hasSuccess = true;
                        console.log(`Synced batch ${i / BATCH_SIZE + 1}: ${batch.length} logs`);
                    } else {
                        console.error("Log push failed:", pushResult.error);
                        // Stop processing next batches if one fails to preserve order/avoid gaps
                        break;
                    }
                }
            }

            // 3. Fetch/Update Kiosk Config
            const configResult = await fetchKioskConfig(kioskId);

            if (configResult.success && configResult.config) {
                const { organization_id, site_id, organization_name, site_name, kiosk_name, organization_logo, require_photo } = configResult.config;
                hasSuccess = true;

                // Update Local Config
                await db.local_config.bulkPut([
                    { key: "organization_id", value: organization_id },
                    { key: "site_id", value: site_id },
                    { key: "org_name", value: organization_name },
                    { key: "org_logo", value: organization_logo || "" },
                    { key: "site_name", value: site_name },
                    { key: "kiosk_name", value: kiosk_name },
                    { key: "require_photo", value: require_photo ?? true },
                    { key: "last_sync", value: new Date().toISOString() }
                ]);

                // Ensure this kiosk is in the terminals table
                await db.terminals.put({
                    id: kioskId,
                    name: kiosk_name,
                    site_id: site_id,
                    site_name: site_name,
                    organization_id: organization_id,
                    organization_name: organization_name,
                    logo_url: organization_logo
                });

                // Update UI State
                setOrgName(organization_name || "Organization");
                setSiteName(site_name || "Site");
                setKioskName(kiosk_name || "Terminal");
                setRequirePhoto(require_photo ?? true);
                if (organization_logo) setOrgLogo(organization_logo);

                // Refresh pairings list
                const terms = await db.terminals.toArray();
                setPairedTerminals(terms);

                // 4. Update Employees
                const empResult = await fetchOrganizationEmployees(organization_id);
                if (empResult.success && empResult.employees) {
                    await db.transaction('rw', db.local_employees, async () => {
                        await db.local_employees.clear();
                        await db.local_employees.bulkAdd(empResult.employees as Employee[]);
                    });
                    if (showEmployeeList) await handleOpenEmployeeList();
                }
            }

            // Final feedback
            if (!silent && hasSuccess) {
                setMsg("SYNCHRONISATION RÉUSSIE");
                setTimeout(() => setMsg(null), 2000);
            }

        } catch (error) {
            console.error("Sync error:", error);
        } finally {
            isSyncingRef.current = false;
            if (!silent) setSyncing(false);
        }
    };


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

    if (isValidating) {
        return (
            <div className="min-h-screen bg-[#0B3B46] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#4FD1C5] animate-spin" />
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[#4FD1C5] font-bold tracking-[0.3em] text-sm animate-pulse">TIMMY TERMINAL</p>
                    <p className="text-white/20 text-[10px] font-mono uppercase">Initialisation du système...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="h-screen bg-[#0B3B46] relative font-sans overflow-hidden select-none">

            {/* ACTION VIEW Container */}
            <div className={clsx(
                "absolute inset-0 z-0 bg-[#0B3B46] transition-opacity duration-500",
                step === "ACTION" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div className="h-full flex flex-col items-center justify-center p-4 text-white">
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{currentT.hello}, <span className="text-[#4FD1C5]">{employee?.first_name}</span></h2>



                        <div className="relative w-full aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-[#1E5562] mb-4 sm:mb-6">
                            {requirePhoto ? (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "user" }}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white relative overflow-hidden">
                                    {employee?.avatar_url ? (
                                        <div className="absolute inset-0">
                                            <img
                                                src={employee.avatar_url}
                                                alt={employee.first_name}
                                                className="w-full h-full object-cover opacity-90"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B46]/80 via-transparent to-transparent"></div>
                                        </div>
                                    ) : (
                                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#4FD1C5] to-[#0B3B46] flex items-center justify-center font-bold text-7xl text-white shadow-2xl border-4 border-white/20 mb-4 z-10">
                                            {employee?.first_name?.charAt(0)}
                                        </div>
                                    )}

                                    <div className="z-10 mt-auto mb-6 text-center">
                                        <p className="text-white/60 font-medium text-sm tracking-widest uppercase mb-1">Mode Rapide</p>
                                        <p className="text-white font-bold text-xl">Photo non requise</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!msg && (
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={() => handleClock("IN")}
                                    className="h-16 sm:h-20 rounded-2xl bg-[#10B981] hover:bg-[#059669] active:scale-95 transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-[#10B981]/20"
                                >
                                    <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                                    <span className="font-bold text-sm sm:text-base">{currentT.arrival}</span>
                                </button>

                                <button
                                    onClick={() => handleClock("OUT")}
                                    className="h-16 sm:h-20 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] active:scale-95 transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-[#EF4444]/20"
                                >
                                    <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                                    <span className="font-bold text-sm sm:text-base">{currentT.departure}</span>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => { setEmployee(null); setStep("PIN"); }}
                            className="mt-6 text-white/50 hover:text-white text-xs"
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
                "h-full flex flex-col items-center justify-center p-4 sm:p-6 text-white transition-opacity duration-300",
                step === "PIN" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none absolute inset-0 z-0"
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

                {/* Kiosk Name Badge - Bottom Left */}
                <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                        <Monitor size={14} className="text-[#4FD1C5]" />
                        <span className="text-[10px] font-bold text-white tracking-widest uppercase truncate max-w-[150px]">
                            {kioskName || "TERMINAL"}
                        </span>
                    </div>
                </div>

                {/* Admin Controls */}
                <div className="absolute top-6 right-6 flex gap-3 z-20">
                    {/* Terminal Switcher */}
                    {pairedTerminals.length > 1 && (
                        <button
                            onClick={() => setShowTerminalSwitcher(true)}
                            className="flex items-center gap-2 px-3 py-1 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-all text-xs font-bold"
                            title="Changer de terminal"
                        >
                            <ArrowLeftRight size={14} />
                            <span className="hidden sm:inline">Changer</span>
                        </button>
                    )}

                    <button
                        onClick={() => router.push('/site-setup')}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all"
                        title="Ajouter un terminal"
                    >
                        <Plus size={18} />
                    </button>

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
                                                                <img src={emp.avatar_url} alt={emp.first_name || "Emp"} className="w-full h-full object-cover" />
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

                {/* Terminal Switcher Modal */}
                {showTerminalSwitcher && (
                    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-[#1E5562] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-white/10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Changer de Terminal</h2>
                                    <p className="text-[#4FD1C5] text-sm opacity-80 mt-1">Sélectionnez le site pour ce terminal</p>
                                </div>
                                <button
                                    onClick={() => setShowTerminalSwitcher(false)}
                                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto max-h-[60vh] space-y-3">
                                {pairedTerminals.map((term) => {
                                    const isActive = orgName === term.organization_name && siteName === term.site_name;
                                    return (
                                        <button
                                            key={term.id}
                                            onClick={() => handleSwitchTerminal(term.id)}
                                            className={clsx(
                                                "w-full flex items-center gap-4 p-5 rounded-3xl transition-all border-2",
                                                isActive
                                                    ? "bg-[#4FD1C5] border-[#4FD1C5] text-[#0B3B46] shadow-lg scale-[1.02]"
                                                    : "bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/10"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                                                isActive ? "bg-white/20" : "bg-white/10 text-[#4FD1C5]"
                                            )}>
                                                {term.logo_url ? (
                                                    <img src={term.logo_url} className="w-full h-full object-cover rounded-2xl" alt="" />
                                                ) : (
                                                    <Building2 size={24} />
                                                )}
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-bold text-lg truncate">{term.site_name}</h4>
                                                    <span className={clsx(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                                        isActive ? "bg-[#0B3B46]/20 border-[#0B3B46]/30 text-[#0B3B46]" : "bg-white/10 border-white/10 text-[#4FD1C5]"
                                                    )}>
                                                        {term.name}
                                                    </span>
                                                </div>
                                                <p className={clsx("text-sm font-medium opacity-80 truncate", isActive ? "" : "text-[#4FD1C5]")}>
                                                    {term.organization_name}
                                                </p>
                                            </div>
                                            {isActive && <CheckCircle size={24} />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-6 bg-black/20 flex justify-center">
                                <button
                                    onClick={() => router.push('/site-setup')}
                                    className="flex items-center gap-2 text-[#4FD1C5] font-bold py-2 px-4 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    <Plus size={20} />
                                    <span>Pairer une nouvelle borne</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center w-full max-w-sm py-2">
                    {/* Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#1E5562] flex items-center justify-center mb-3 bg-white/50 overflow-hidden relative">
                        {orgLogo ? (
                            <Image src={orgLogo} alt="Logo" fill className="object-cover" />
                        ) : (
                            <Building2 size={40} className="text-[#FBBF24]" />
                        )}
                    </div>

                    {/* Site & Org Name */}
                    <div className="text-center mb-4 leading-tight">
                        <h2 className="text-lg sm:text-xl font-bold text-white leading-none mb-0.5">{siteName}</h2>
                        <p className="text-[#4FD1C5] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">{orgName}</p>
                    </div>

                    {/* Clock */}
                    <div className="text-center mb-4">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-0.5 font-mono">{time}</h1>
                        <p className="text-[#4FD1C5] text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase">{date}</p>
                    </div>

                    {/* PIN Indicators */}
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={clsx(
                                        "w-4 h-4 rounded-full border-2 transition-all duration-300",
                                        i < pin.length ? "bg-[#FBBF24] border-[#FBBF24]" : "border-[#4FD1C5] bg-transparent",
                                        error && "border-red-500 bg-red-500/20 animate-pulse"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="h-4">
                            {error && (
                                <p className="text-red-400 font-bold text-[10px] uppercase tracking-wider animate-pulse">{currentT.pinError}</p>
                            )}
                        </div>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-2.5 w-full max-w-[320px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleDigitPress(num.toString())}
                                className="h-14 sm:h-16 bg-[#0E4C5B] rounded-2xl text-2xl font-bold text-white hover:bg-[#165f70] active:scale-95 transition-all shadow-lg border border-white/5"
                            >
                                {num}
                            </button>
                        ))}

                        <button
                            onClick={handleClear}
                            className="h-14 sm:h-16 bg-white/5 rounded-2xl text-xs font-bold text-red-400 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center uppercase tracking-[0.1em]"
                        >
                            EFFACER
                        </button>

                        <button
                            onClick={() => handleDigitPress("0")}
                            className="h-14 sm:h-16 bg-[#0E4C5B] rounded-2xl text-2xl font-bold text-white hover:bg-[#165f70] active:scale-95 transition-all shadow-lg border border-white/5"
                        >
                            0
                        </button>

                        <button
                            onClick={handleValidate}
                            className="h-14 sm:h-16 bg-[#FBBF24] rounded-2xl flex items-center justify-center text-[#0B3B46] hover:bg-[#F59E0B] active:scale-95 transition-all shadow-lg shadow-[#FBBF24]/10"
                        >
                            <UserCheck size={28} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-[#4FD1C5]/30 text-[9px] font-mono tracking-[0.2em] uppercase">
                        {currentT.systemReady}
                    </div>
                </div>
            </div>
        </main>
    );
}
