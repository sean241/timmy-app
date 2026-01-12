'use client';

import { useState } from 'react';
import { getSignedUrlAction } from '@/app/actions/storage';

export default function TestStoragePage() {
    const [path, setPath] = useState("proofs/45113ae1-e03f-47a7-a39c-6e8ab7938a1b/b699cbef-6605-41bc-9516-5e513f95ebcd/1768244854226-323.jpg");
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        setResult(null);
        try {
            const url = await getSignedUrlAction(path);
            setResult(url || "ERROR: Server returned null (check server logs)");
        } catch (e) {
            setResult("EXCEPTION: " + String(e));
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Diagnostic Stockage</h1>

            <div className="mb-6 space-y-2">
                <label className="block text-sm font-bold text-slate-700">Chemin du fichier (Bucket: secure-logs)</label>
                <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg font-mono text-sm"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                />
            </div>

            <button
                onClick={runTest}
                disabled={loading}
                className="bg-[#0F4C5C] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0b3844] transition-colors disabled:opacity-50"
            >
                {loading ? 'Test en cours...' : 'Générer URL Signée'}
            </button>

            {result && (
                <div className={`mt-8 p-6 rounded-xl border ${result.startsWith('http') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <h3 className="font-bold mb-2">Résultat :</h3>
                    <p className="font-mono text-xs break-all text-slate-600 bg-white p-2 rounded border mb-4">
                        {result}
                    </p>

                    {result.startsWith('http') ? (
                        <div>
                            <p className="text-sm text-green-700 font-bold mb-2">Image chargée :</p>
                            <img
                                src={result}
                                alt="Test Result"
                                className="max-w-full h-auto rounded-lg shadow-sm border border-slate-200"
                            />
                        </div>
                    ) : (
                        <p className="text-red-600 font-bold">Échec de la génération.</p>
                    )}
                </div>
            )}
        </div>
    );
}
