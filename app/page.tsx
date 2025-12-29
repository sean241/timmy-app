"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, Globe, Shield, Smartphone, Zap, Users, BarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-white selection:bg-[#0F4C5C] selection:text-white">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0F4C5C] to-[#0a3641] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-900/10">
              T
            </div>
            <span className="text-xl font-bold text-[#0F4C5C] tracking-tight">Timmy</span>
          </div>
          <nav className="flex items-center gap-8">
            <Link
              href="/admin"
              className="hidden md:block text-sm font-medium text-gray-600 hover:text-[#0F4C5C] transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="mailto:demo@timmy.app?subject=Demande de démo Timmy"
              className="bg-[#FFB703] text-[#023047] hover:bg-[#ffc529] px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              Réserver une démo
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10 opacity-70" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0F4C5C]/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4" />

          <div className="container mx-auto px-6 text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0F4C5C] text-sm font-semibold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB703] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFB703]"></span>
              </span>
              La nouvelle référence RH 2025
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-5xl mx-auto leading-[1.1] mb-6">
              Gérez vos équipes terrain <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F4C5C] to-[#2a9d8f]">
                sans le chaos administratif.
              </span>
            </h1>

            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
              Fini les feuilles de présence papier et les erreurs de paie.
              Timmy centralise le pointage, la planification et la gestion RH dans une plateforme tout-en-un, simple et sécurisée.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="mailto:demo@timmy.app?subject=Demande de démo Timmy"
                className="group w-full sm:w-auto bg-[#0F4C5C] text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-[#0F4C5C]/20 hover:shadow-[#0F4C5C]/30 hover:bg-[#0a3641] flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                Demander une démo
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/kiosk"
                className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-full text-lg font-bold transition-all hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-2"
              >
                Voir le mode Kiosk
              </Link>
            </div>
          </div>
        </section>

        {/* Features Tabs Grid */}
        <section className="py-24 bg-gray-50/50 border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Une suite complète pour les opérations
              </h2>
              <p className="text-gray-500 text-lg">
                Que vous soyez sur le terrain ou au bureau, Timmy vous donne les super-pouvoirs pour tout gérer avec précision.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1: Kiosk */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className="md:-mt-12 mb-6 inline-flex p-4 bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-12 h-12 bg-blue-50 text-[#0F4C5C] rounded-xl flex items-center justify-center">
                    <Smartphone size={28} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Pointeuse Kiosk</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Transformez n&apos;importe quelle tablette en pointeuse intelligente et sécurisée.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle size={18} className="text-[#2a9d8f] mt-0.5 shrink-0" />
                    <span>Preuve par photo (anti-fraude)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle size={18} className="text-[#2a9d8f] mt-0.5 shrink-0" />
                    <span>Fonctionne hors-ligne (Offline First)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle size={18} className="text-[#2a9d8f] mt-0.5 shrink-0" />
                    <span>Mode Code PIN ou Badge QR</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2: Smart Planning */}
              <div className="bg-[#0F4C5C] p-8 rounded-3xl shadow-xl shadow-[#0F4C5C]/20 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-3 bg-[#FFB703] text-[#023047] text-xs font-extra-bold rounded-bl-2xl z-20 font-bold tracking-wider">
                  POPULAIRE
                </div>
                <div className="md:-mt-12 mb-6 inline-flex p-4 bg-[#0a3641] rounded-2xl shadow-lg ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-12 h-12 bg-white/10 text-[#FFB703] rounded-xl flex items-center justify-center">
                    <Clock size={28} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Smart Planning</h3>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Créez des plannings complexes en quelques clics, pas en quelques heures.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-blue-50 font-medium">
                    <CheckCircle size={18} className="text-[#FFB703] mt-0.5 shrink-0" />
                    <span>Interface Glisser-Déposer intuitive</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-blue-50 font-medium">
                    <CheckCircle size={18} className="text-[#FFB703] mt-0.5 shrink-0" />
                    <span>Détection automatique des conflits</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-blue-50 font-medium">
                    <CheckCircle size={18} className="text-[#FFB703] mt-0.5 shrink-0" />
                    <span>Envoi par WhatsApp en un clic</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3: HR & Payroll */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 group">
                <div className="md:-mt-12 mb-6 inline-flex p-4 bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <Users size={28} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">RH & Paie</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Préparez la paie sans maux de tête. Tout est calculé automatiquement.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle size={18} className="text-orange-500 mt-0.5 shrink-0" />
                    <span>Calcul auto des heures sup & pauses</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle size={18} className="text-orange-500 mt-0.5 shrink-0" />
                    <span>Exports Excel prêts pour le comptable</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                    <CheckCircle size={18} className="text-orange-500 mt-0.5 shrink-0" />
                    <span>Dossiers employés numériques</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits / Impact Section */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="w-full lg:w-1/2 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    Pourquoi les managers choisissent Timmy ?
                  </h2>
                  <p className="text-xl text-gray-500 leading-relaxed">
                    Nous avons conçu Timmy pour remplacer les processus fragiles (Excel, Papier, WhatsApp) par une solution robuste qui vous fait gagner du temps.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                      <Zap size={28} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">Gain de temps immédiat</h4>
                      <p className="text-gray-500 leading-relaxed">Divisez par 4 le temps passé sur la gestion des plannings et la vérification des heures. Concentrez-vous sur votre métier.</p>
                    </div>
                  </div>

                  <div className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Shield size={28} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">Fiabilité des données</h4>
                      <p className="text-gray-500 leading-relaxed">Supprimez les contestations de paie grâce aux preuves photos et logs horodatés infalsifiables.</p>
                    </div>
                  </div>

                  <div className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                      <Globe size={28} className="text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">Visibilité Multi-site</h4>
                      <p className="text-gray-500 leading-relaxed">Pilotez tous vos chantiers ou agences depuis un seul écran, en temps réel, où que vous soyez.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 relative">
                {/* Abstract Representation of Dashboard */}
                <div className="relative rounded-3xl bg-[#0F172A] p-6 shadow-2xl rotate-1 hover:rotate-0 transition-all duration-700 border border-gray-800 scale-100 hover:scale-[1.02]">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FFB703] rounded-full blur-[80px] opacity-10"></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#0F4C5C] rounded-full blur-[80px] opacity-20"></div>

                  {/* Fake UI Header */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 flex items-center justify-between border border-gray-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="h-2 w-24 bg-gray-700 rounded-full"></div>
                  </div>

                  {/* Fake UI Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/50 p-6 rounded-2xl h-40 animate-pulse border border-gray-700"></div>
                    <div className="bg-gray-800/50 p-6 rounded-2xl h-40 animate-pulse delay-75 border border-gray-700"></div>
                  </div>
                  <div className="bg-gray-800/50 p-6 rounded-2xl h-32 w-full animate-pulse delay-150 border border-gray-700 mb-2"></div>

                  {/* Floating Elements on top of UI */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
                    <p className="text-white font-bold text-2xl mb-1">98%</p>
                    <p className="text-gray-400 text-sm">Taux de présence</p>
                  </div>
                </div>

                {/* Floating Badge - Trusted */}
                <div className="absolute -bottom-10 -left-4 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 border border-gray-100 animate-[bounce_3s_infinite]">
                  <div className="bg-green-100 p-3 rounded-xl text-green-600">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Paie validée</p>
                    <p className="font-bold text-gray-900 text-lg">100% Conforme</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-[#0F4C5C] relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FFB703]/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"></div>

          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Prêt à moderniser votre gestion ?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12 leading-relaxed">
              Rejoignez les entreprises qui ont choisi la tranquillité d&apos;esprit.
              Une démo de 20 minutes suffit pour vous convaincre.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="mailto:demo@timmy.app?subject=Demande de démo Timmy"
                className="bg-[#FFB703] text-[#023047] px-12 py-5 rounded-full text-xl font-bold hover:bg-[#ffc529] transition-all shadow-xl shadow-yellow-900/10 hover:scale-105 hover:shadow-2xl"
              >
                Réserver ma démo
              </Link>
              <Link
                href="/kiosk"
                className="bg-transparent border-2 border-white/20 text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Tester le Kiosk
              </Link>
            </div>
            <p className="mt-8 text-sm text-blue-200/60 font-medium">
              Sans engagement • Mise en place en 24h • Support 7j/7
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0F4C5C] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  T
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Timmy</span>
              </div>
              <span className="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-500 font-medium border border-gray-700">v0.9.0 (Beta)</span>
            </div>

            <div className="flex gap-8 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a>
              <a href="mailto:contact@timmy.app" className="hover:text-white transition-colors">Nous contacter</a>
            </div>

            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Timmy App. Fait avec passion.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
