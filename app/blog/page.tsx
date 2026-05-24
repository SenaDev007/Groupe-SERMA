import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import { ArrowRight, BookOpen, Clock, Calendar } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Blog & Ressources — Groupe SERMA",
  description: "Retrouvez les conseils de nos experts comptables et formateurs sur la fiscalité béninoise, les normes OHADA et l'entrepreneuriat à Parakou.",
};

const POSTS = [
  {
    id: 1,
    title: "Comprendre le SYSCOHADA Révisé : ce qui change pour les PME en 2026",
    desc: "Le système comptable ouest-africain évolue. Découvrez les nouvelles obligations comptables et de présentation des comptes pour rester en règle.",
    category: "Cabinet & Fiscalité",
    date: "14 Mai 2026",
    readTime: "6 min",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: 2,
    title: "Comment utiliser WhatsApp Business pour doubler ses ventes locales",
    desc: "WhatsApp n'est pas qu'un outil de chat. Apprenez à configurer vos catalogues de produits, automatiser vos réponses et attirer des clients à Parakou.",
    category: "Entrepreneuriat",
    date: "08 Mai 2026",
    readTime: "4 min",
    color: "bg-green-500/10 text-green-500",
  },
  {
    id: 3,
    title: "5 compétences à maîtriser pour devenir caissier professionnel",
    desc: "Vous postulez en banque ou microfinance ? Voici les compétences pratiques (journaux de caisse, arrêtés, prévention de fraude) qui feront la différence.",
    category: "Formations & Carrière",
    date: "29 Avril 2026",
    readTime: "5 min",
    color: "bg-orange-logo/10 text-orange-logo",
  },
  {
    id: 4,
    title: "Le guide pratique de la Déclaration Fiscale Unique (DFU) au Bénin",
    desc: "Évitez les redressements et pénalités de retard. Retrouvez le calendrier, les pièces justificatives requises et nos conseils d'optimisation légale.",
    category: "Cabinet & Fiscalité",
    date: "12 Avril 2026",
    readTime: "8 min",
    color: "bg-blue-500/10 text-blue-500",
  },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 text-marine-profond pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-left max-w-2xl mb-16">
            <span className="text-orange-contrast font-mono text-xs uppercase tracking-widest font-extrabold block mb-3">
              RESSOURCES
            </span>
            <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Blog & Conseils Pratiques
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Retrouvez les articles et guides de nos comptables et formateurs pour vous aider à structurer vos finances et acquérir de nouvelles compétences.
            </p>
          </div>

          {/* Categories bar */}
          <div className="flex flex-wrap gap-2.5 mb-10 border-b border-slate-200 pb-6 text-sm font-semibold">
            {["Tous les articles", "Cabinet & Fiscalité", "Formations & Carrière", "Entrepreneuriat"].map((cat, idx) => (
              <button
                key={idx}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  idx === 0
                    ? "bg-marine-profond text-white"
                    : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {POSTS.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 hover:shadow-xl hover:border-orange-logo/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Category and Read time */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.color}`}>
                      {post.category}
                    </span>
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <h2 className="font-playfair text-xl sm:text-2xl font-bold text-marine-profond mb-3 hover:text-orange-logo transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {post.desc}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-marine-profond hover:text-orange-logo uppercase tracking-wider group"
                  >
                    Lire l&apos;article
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Empty newsletter section */}
          <div className="mt-20 bg-marine-profond rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient opacity-10 pointer-events-none" />
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <BookOpen className="w-8 h-8 text-orange-logo mx-auto" />
              <h3 className="font-playfair text-2xl font-bold">Abonnez-vous à notre lettre d&apos;actualité</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Recevez directement chaque mois par e-mail nos fiches de conseils fiscaux et les dates des prochaines formations gratuites à Parakou.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="flex-grow px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-logo/40 text-sm"
                />
                <button className="px-6 py-3 rounded-xl bg-orange-logo hover:bg-orange-sature text-white text-sm font-bold uppercase tracking-wider transition-colors">
                  S&apos;abonner
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
