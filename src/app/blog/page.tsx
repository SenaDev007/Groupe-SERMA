import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/shared/WhatsAppFAB";
import BlogGrid, { type BlogPost } from "@/components/blog/BlogGrid";
import Reveal from "@/components/shared/Reveal";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { getPublicPosts } from "@/lib/back-office/public-content";

export const metadata: Metadata = {
  title: "Blog & Ressources — Groupe SERMA",
  description:
    "Retrouvez les conseils de nos experts comptables et formateurs sur la fiscalité béninoise, les normes OHADA et l'entrepreneuriat à Parakou.",
  openGraph: {
    title: "Blog & Ressources — Groupe SERMA",
    description:
      "Conseils d'experts : fiscalité béninoise, normes OHADA, entrepreneuriat à Parakou.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  // Articles pilotés depuis le back-office (repli statique intégré)
  const publicPosts = await getPublicPosts();
  const POSTS: BlogPost[] = publicPosts.map((p) => ({
    id: p.id,
    title: p.title,
    desc: p.desc,
    category: p.category,
    date: p.date,
    readTime: p.readTime,
  }));

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gris-bleute/50 text-marine-profond pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" aria-hidden />
        <div className="absolute -top-24 right-1/4 w-80 h-80 rounded-full bg-orange-logo/[0.06] blur-[110px] pointer-events-none" aria-hidden />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête éditorial */}
          <Reveal className="max-w-2xl mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] bg-orange-logo/[0.08] text-orange-contrast border border-orange-logo/20 mb-5">
              <BookOpen className="w-3.5 h-3.5" />
              Ressources
            </span>
            <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight mb-5 leading-[1.1]">
              Blog & Conseils{" "}
              <span className="text-orange-contrast">Pratiques.</span>
            </h1>
            <div className="h-1 w-16 bg-orange-logo rounded-full mb-6" />
            <p className="text-gris-texte text-sm sm:text-base leading-relaxed">
              Retrouvez les articles et guides de nos comptables et formateurs
              pour vous aider à structurer vos finances et acquérir de
              nouvelles compétences.
            </p>
          </Reveal>

          {/* Grille + filtres fonctionnels */}
          <Reveal delay={0.1}>
            <BlogGrid posts={POSTS} />
          </Reveal>
        </div>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
