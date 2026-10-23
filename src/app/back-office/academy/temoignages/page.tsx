import prisma from "@/lib/prisma";
import { BoPageHeader } from "@/components/back-office/BoKit";
import { TestimonialsView, type TestimonialRow } from "@/components/back-office/TestimonialsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Témoignages — Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TemoignagesPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: TestimonialRow[] = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    entity: t.entity,
    content: t.content,
    rating: t.rating,
    status: t.status,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      <BoPageHeader
        eyebrow="Contenus du site"
        title="Témoignages clients & apprenants"
        description="Les témoignages publiés s'affichent sur les pages publiques du Groupe — résultats concrets du cabinet et parcours des diplômés de l'Academy."
      />
      <TestimonialsView testimonials={rows} />
    </div>
  );
}
