import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CGU() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-slate-600 hover:text-[#0F4C5C] transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Retour à l'accueil
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-8">Conditions Générales d'Utilisation (CGU)</h1>

                    <div className="space-y-6 text-slate-600">
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">1. Objet</h2>
                            <p>
                                Les présentes CGU ont pour objet de définir les modalités de mise à disposition des services de l'application Timmy, logiciel de gestion RH et de pointage.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">2. Accès au service</h2>
                            <p>
                                Le service est accessible via le site web et l'application mobile. Timmy SAS s'efforce de maintenir le service accessible 24h/24, 7j/7, mais n'est tenu qu'à une obligation de moyens.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">3. Responsabilité de l'utilisateur</h2>
                            <p>
                                L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Il s'engage à utiliser le service conformément aux lois en vigueur et à ne pas perturber son fonctionnement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">4. Propriété intellectuelle</h2>
                            <p>
                                Tous les éléments de l'application (logiciel, design, textes) sont la propriété exclusive de Timmy SAS. Toute utilisation non autorisée est interdite.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">5. Modification des CGU</h2>
                            <p>
                                Timmy SAS se réserve le droit de modifier les présentes CGU à tout moment. L'utilisateur sera informé des modifications substantielles.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">6. Droit applicable</h2>
                            <p>
                                Les présentes conditions sont régies par le droit en vigueur en Côte d'Ivoire. En cas de litige, les tribunaux d'Abidjan seront seuls compétents.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
