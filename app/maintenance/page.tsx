"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useState } from "react";
import { RefreshCw, ArrowLeft, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { PinPad } from "@/components/PinPad";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { logAppEvent } from "@/app/actions/sync";

function AdminContent() {
    const logs = useLiveQuery(() => db.local_logs.reverse().toArray());
    const [syncing, setSyncing] = useState(false);
    const searchParams = useSearchParams();
    const [showPendingOnly, setShowPendingOnly] = useState(searchParams.get("filter") === "pending");

    const filteredLogs = showPendingOnly
        ? logs?.filter(l => l.status === 'PENDING')
        : logs;

    // Lock Screen State
    const [isLocked, setIsLocked] = useState(true);
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);

    const handleDigitPress = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
            setError(false);
            if (newPin.length === 4) {
                if (newPin === "0000") {
                    setIsLocked(false);
                } else {
                    setError(true);
                    setPin("");
                }
            }
        }
    };

    const handleDelete = () => {
        setPin((prev) => prev.slice(0, -1));
        setError(false);
    };

    const handlePurgeLogs = async () => {
        if (window.confirm("ATTENTION : Vous êtes sur le point de supprimer TOUS les pointages de ce terminal.\n\nCette action est irréversible et sert à nettoyer les données de test.\n\nContiuner ?")) {
            try {
                const count = await db.local_logs.count();
                await db.local_logs.clear();

                // Log this action to the server
                const orgIdConfig = await db.local_config.get("organization_id");
                const kioskIdConfig = await db.local_config.get("kiosk_id");

                if (orgIdConfig?.value) {
                    await logAppEvent(orgIdConfig.value as string, "KIOSK_PURGE_LOGS", {
                        kiosk_id: kioskIdConfig?.value || 'unknown',
                        deleted_count: count,
                        reason: "User requested maintenance purge"
                    });
                }

                alert(`${count} pointages supprimés avec succès.`);
            } catch (e) {
                console.error("Purge failed", e);
                alert("Erreur lors de la suppression des données.");
            }
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        // Simulation of sync
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update status locally to simulate sync success
        if (logs) {
            const ids = logs.filter(l => l.status === 'PENDING').map(l => l.id!);
            if (ids.length > 0) {
                await db.local_logs.bulkUpdate(ids.map(id => ({ key: id, changes: { status: 'SYNCED' } })));
            }
        }

        setSyncing(false);
        alert("Synchronisation terminée (Simulation)");
    };

    const handleDisconnect = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir réinitialiser COMPLÈTEMENT ce terminal ? Tous les sites appairés et les données locales seront supprimés.")) {
            await db.local_config.clear();
            await db.terminals.clear();
            await db.local_employees.clear();
            window.location.href = "/site-setup";
        }
    };

    if (isLocked) {
        return (
            <main className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 text-white">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Admin Access</h1>
                    <p className="opacity-70">Enter PIN to unlock</p>
                </div>

                <div className="mb-8 flex justify-center gap-4 h-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "w-4 h-4 rounded-full transition-all",
                                i < pin.length ? "bg-secondary" : "bg-white/20",
                                error && "bg-error animate-pulse"
                            )}
                        />
                    ))}
                </div>

                <PinPad onDigitPress={handleDigitPress} onDelete={handleDelete} />

                <Link href="/kiosk" className="mt-8 text-white/50 hover:text-white text-sm">
                    Retour au Kiosque
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/kiosk" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-3xl font-bold text-primary">Maintenance Terminal</h1>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handlePurgeLogs}
                            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
                        >
                            <Trash2 size={20} />
                            Purger Données
                        </button>
                        <button
                            onClick={() => setShowPendingOnly(!showPendingOnly)}
                            className={clsx(
                                "px-4 py-2 rounded-md font-medium transition-colors border",
                                showPendingOnly
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {showPendingOnly ? "Voir tous les logs" : "Voir logs en attente"}
                        </button>
                        <button
                            onClick={handleDisconnect}
                            className="px-4 py-2 rounded-md font-medium text-error hover:bg-error/10 transition-colors border border-error/20"
                        >
                            Déconnecter
                        </button>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={20} className={clsx(syncing && "animate-spin")} />
                            {syncing ? "Synchro..." : "Simuler Synchro"}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">Employé</th>
                                <th className="p-4 font-medium text-gray-500">Heure</th>
                                <th className="p-4 font-medium text-gray-500">Type</th>
                                <th className="p-4 font-medium text-gray-500">Photo</th>
                                <th className="p-4 font-medium text-gray-500">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredLogs?.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{log.employee_name}</td>
                                    <td className="p-4">
                                        {new Date(log.timestamp).toLocaleString("fr-FR")}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={clsx(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                log.type === "IN"
                                                    ? "bg-success/10 text-success"
                                                    : "bg-error/10 text-error"
                                            )}
                                        >
                                            {log.type === "IN" ? "ARRIVÉE" : "DÉPART"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={log.photo}
                                                alt="Log"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={clsx(
                                                "flex items-center gap-1 text-sm",
                                                log.status === "SYNCED"
                                                    ? "text-success"
                                                    : "text-orange-500"
                                            )}
                                        >
                                            <div
                                                className={clsx(
                                                    "w-2 h-2 rounded-full",
                                                    log.status === "SYNCED"
                                                        ? "bg-success"
                                                        : "bg-orange-500"
                                                )}
                                            />
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        {showPendingOnly ? "Aucun log en attente." : "Aucun pointage enregistré."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminContent />
        </Suspense>
    );
}
