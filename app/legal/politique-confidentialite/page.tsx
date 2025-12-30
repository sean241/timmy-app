import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PolitiqueConfidentialite() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-slate-600 hover:text-[#0F4C5C] transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Retour à l'accueil
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-8">Politique de Confidentialité</h1>

                    <div className="space-y-6 text-slate-600">
                        <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">1. Collecte des données</h2>
                            <p>
                                Dans le cadre de l'utilisation de l'application Timmy, nous sommes amenés à collecter les données suivantes :
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Informations d'entreprise (Nom, secteur, effectif).</li>
                                <li>Données des employés (Nom, fonction) pour le pointage.</li>
                                <li>Données de pointage (Heures d'arrivée/départ, localisation GPS si activée).</li>
                                <li>Coordonnées de contact (Email, téléphone).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">2. Utilisation des données</h2>
                            <p>Ces données sont utilisées exclusivement pour :</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Le fonctionnement du service de pointage et de gestion RH.</li>
                                <li>L'élaboration des fiches de paie et rapports de présence.</li>
                                <li>La communication avec le client (support, mises à jour).</li>
                            </ul>
                            <p className="mt-2 font-semibold">Vos données ne sont jamais vendues à des tiers.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">3. Sécurité des données</h2>
                            <p>
                                Nous mettons en œuvre toutes les mesures techniques nécessaires pour garantir la sécurité de vos données (Chiffrement SSL, bases de données sécurisées, accès restreints).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">4. Vos droits</h2>
                            <p>
                                Conformément aux lois en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ce droit, contactez-nous à : <strong>contact@timmy.africa</strong>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
