"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BlogPost {
  id: number | string;
  title: string;
  desc: string;
  category: string;
  date: string;
  readTime: string;
}

const CATEGORIES = [
  "Tous les articles",
  "Cabinet & Fiscalité",
  "Formations & Carrière",
  "Entrepreneuriat",
];

/**
 * Grille d'articles avec filtres par catégorie — fonctionnels.
 */
export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);

  const filtered =
    activeCat === CATEGORIES[0]
      ? posts
      : posts.filter((p) => p.category === activeCat);

  const catColor = (category: string) => {
    switch (category) {
      case "Cabinet & Fiscalité":
        return "bg-marine-profond/[0.07] text-marine-profond border border-marine-profond/15";
      case "Formations & Carrière":
        return "bg-orange-logo/[0.09] text-orange-contrast border border-orange-logo/25";
      case "Entrepreneuriat":
        return "bg-vert-tech/[0.09] text-vert-tech border border-vert-tech/25";
      default:
        return "bg-marine-profond/[0.07] text-marine-profond";
    }
  };

  return (
    <>
      {/* Barre de catégories */}
      <div className="flex flex-wrap gap-2.5 mb-10 border-b border-marine-profond/[0.08] pb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            aria-pressed={activeCat === cat}
            className={cn(
              "px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-200",
              activeCat === cat
                ? "bg-marine-profond text-white shadow-[0_6px_20px_rgba(12,25,61,0.25)]"
                : "bg-white border border-marine-profond/[0.12] hover:bg-gris-bleute hover:border-orange-logo/40 text-gris-texte"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grille d'articles */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeCat}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-7"
        >
          {filtered.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 * i }}
              className="group bg-white border border-marine-profond/[0.1] rounded-3xl p-6 sm:p-8 hover:shadow-[0_18px_48px_rgba(12,25,61,0.12)] hover:border-orange-logo/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-[11px] font-bold",
                      catColor(post.category)
                    )}
                  >
                    {post.category}
                  </span>
                  <span className="text-gris-texte/60 text-xs font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="font-playfair text-xl sm:text-[1.35rem] font-bold text-marine-profond mb-3 leading-snug group-hover:text-orange-contrast transition-colors">
                  {post.title}
                </h2>
                <p className="text-gris-texte text-sm leading-relaxed mb-6">
                  {post.desc}
                </p>
              </div>

              <div className="border-t border-marine-profond/[0.07] pt-5 flex items-center justify-between">
                <span className="text-gris-texte/60 text-xs font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.date}
                </span>
                <Link
                  href={`/blog/${post.id}`}
                  className="group/cta inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-orange-contrast hover:text-orange-logo transition-colors"
                >
                  Lire l&apos;article
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="text-center text-gris-texte py-16">
          Aucun article dans cette catégorie pour le moment.
        </p>
      )}
    </>
  );
}
