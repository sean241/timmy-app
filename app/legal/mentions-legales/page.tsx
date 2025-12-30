import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MentionsLegales() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-slate-600 hover:text-[#0F4C5C] transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Retour à l'accueil
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-8">Mentions Légales</h1>

                    <div className="space-y-6 text-slate-600">
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">1. Éditeur du site</h2>
                            <p>
                                Le site Timmy est édité par la société <strong>Timmy SAS</strong>, société par actions simplifiée au capital de 1 000 000 FCFA.<br />
                                <strong>Siège social :</strong> Abidjan, Côte d'Ivoire.<br />
                                <strong>RCS :</strong> En cours d'immatriculation.<br />
                                <strong>Email :</strong> contact@timmy.africa
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">2. Directeur de la publication</h2>
                            <p>Le directeur de la publication est l'équipe de direction de Timmy SAS.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">3. Hébergement</h2>
                            <p>
                                Le site est hébergé par <strong>Vercel Inc.</strong><br />
                                340 S Lemon Ave #4133 Walnut, CA 91789, USA.
                            </p>
                            <p className="mt-2">
                                Les données sont stockées de manière sécurisée via <strong>Supabase</strong> sur des serveurs conformes aux normes de sécurité internationales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">4. Propriété intellectuelle</h2>
                            <p>
                                L'ensemble de ce site relève de la législation internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
