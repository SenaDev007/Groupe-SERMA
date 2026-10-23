import prisma from "@/lib/prisma";
import { BoPageHeader } from "@/components/back-office/BoKit";
import { ArticlesView, type ArticleRow } from "@/components/back-office/ArticlesView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles — Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
  });

  const rows: ArticleRow[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    legacyId: a.legacyId,
    excerpt: a.excerpt,
    category: a.category,
    readTime: a.readTime,
    status: a.status,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    content: a.content,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <BoPageHeader
        eyebrow="Contenus du site"
        title="Articles du blog & ressources"
        description="Les articles publiés alimentent la page Blog du site public — conseils du cabinet et de l'Academy sur la fiscalité, les normes OHADA et l'entrepreneuriat."
      />
      <ArticlesView articles={rows} />
    </div>
  );
}
