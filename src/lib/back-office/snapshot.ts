/**
 * Construit l'instantané complet du back-office (toutes entités).
 * Utilisé par GET /api/back-office/snapshot ET par les layouts cabinet /
 * academy pour amorcer le moteur offline côté client.
 */

import prisma from "@/lib/prisma";
import type { BoSnapshot } from "@/lib/offline/types";

const iso = (d: Date | null | undefined): string | null => (d ? d.toISOString() : null);

export async function buildBoSnapshot(): Promise<BoSnapshot> {
  const [clients, folders, workItems, documents, submissions, formations, articles, testimonials] =
    await Promise.all([
      prisma.client.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.folder.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.workItem.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.document.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.submission.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.formation.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
      prisma.article.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

  return {
    clients: clients.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      sector: c.sector,
      contactName: c.contactName,
      email: c.email,
      phone: c.phone,
      address: c.address,
      taxId: c.taxId,
      status: c.status,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    folders: folders.map((f) => ({
      id: f.id,
      clientId: f.clientId,
      parentId: f.parentId,
      name: f.name,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
    workItems: workItems.map((w) => ({
      id: w.id,
      clientId: w.clientId,
      title: w.title,
      category: w.category,
      status: w.status,
      priority: w.priority,
      dueDate: iso(w.dueDate),
      notes: w.notes,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    })),
    documents: documents.map((d) => ({
      id: d.id,
      name: d.name,
      kind: d.kind,
      entity: d.entity,
      mimeType: d.mimeType,
      size: d.size,
      content: d.content,
      filePath: d.filePath,
      source: d.source,
      version: d.version,
      folderId: d.folderId,
      workItemId: d.workItemId,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
    submissions: submissions.map((s) => ({
      id: s.id,
      source: s.source,
      entity: s.entity,
      name: s.name,
      email: s.email,
      phone: s.phone,
      payload: s.payload,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    formations: formations.map((f) => ({
      id: f.id,
      title: f.title,
      hook: f.hook,
      description: f.description,
      category: f.category,
      duration: f.duration,
      price: f.price,
      level: f.level,
      skills: f.skills,
      outcome: f.outcome,
      status: f.status,
      order: f.order,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    })),
    articles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      legacyId: a.legacyId,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category,
      readTime: a.readTime,
      status: a.status,
      publishedAt: iso(a.publishedAt),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    testimonials: testimonials.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      entity: t.entity,
      content: t.content,
      result: t.result,
      rating: t.rating,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  };
}
