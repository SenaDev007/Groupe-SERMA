"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/back-office/login");
  return session;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}
function optStr(formData: FormData, key: string): string | undefined {
  const v = str(formData, key);
  return v || undefined;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Rafraîchit les pages publiques alimentées par ces contenus. */
function revalidatePublic(kind: "formations" | "blog" | "temoignages") {
  revalidatePath("/academy");
  revalidatePath("/blog");
  revalidatePath("/");
  if (kind === "formations") revalidatePath("/academy/inscription");
  if (kind === "blog") revalidatePath("/blog/[id]", "page");
}

// ═════════════════════════════════════════════════════════════
// FORMATIONS
// ═════════════════════════════════════════════════════════════

export interface FormationFormState {
  error?: string;
}

export async function saveFormationAction(
  _prev: FormationFormState,
  formData: FormData
): Promise<FormationFormState> {
  await requireSession();
  const id = optStr(formData, "id");
  const title = str(formData, "title");
  if (!title) return { error: "Le titre de la formation est obligatoire." };

  const skills = formData.getAll("skills")
    .map((s) => String(s).trim())
    .filter(Boolean);

  const data = {
    title,
    hook: optStr(formData, "hook"),
    description: optStr(formData, "description"),
    category: str(formData, "category") || "FORMATION_COURTE",
    duration: optStr(formData, "duration"),
    price: optStr(formData, "price"),
    level: optStr(formData, "level"),
    skills: JSON.stringify(skills),
    outcome: optStr(formData, "outcome"),
    status: str(formData, "status") || "PUBLIE",
    order: Number(str(formData, "order") || "99"),
  };

  if (id) {
    await prisma.formation.update({ where: { id }, data });
  } else {
    await prisma.formation.create({ data });
  }

  revalidatePath("/back-office/academy/formations");
  revalidatePublic("formations");
  return {};
}

export async function deleteFormationAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.formation.delete({ where: { id } });
  revalidatePath("/back-office/academy/formations");
  revalidatePublic("formations");
}

export async function toggleFormationStatusAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  const formation = await prisma.formation.findUnique({ where: { id } });
  if (formation) {
    await prisma.formation.update({
      where: { id },
      data: { status: formation.status === "PUBLIE" ? "BROUILLON" : "PUBLIE" },
    });
  }
  revalidatePath("/back-office/academy/formations");
  revalidatePublic("formations");
}

// ═════════════════════════════════════════════════════════════
// ARTICLES DU BLOG
// ═════════════════════════════════════════════════════════════

export interface ArticleFormState {
  error?: string;
}

export async function saveArticleAction(
  _prev: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  await requireSession();
  const id = optStr(formData, "id");
  const title = str(formData, "title");
  if (!title) return { error: "Le titre de l'article est obligatoire." };

  const status = str(formData, "status") || "BROUILLON";
  const slug = str(formData, "slug") || slugify(title);
  const legacyRaw = str(formData, "legacyId");
  const legacyId = legacyRaw ? Number(legacyRaw) : null;

  const duplicate = await prisma.article.findFirst({
    where: { slug, ...(id ? { id: { not: id } } : {}) },
  });
  if (duplicate) return { error: "Un autre article utilise déjà ce slug." };

  const data = {
    title,
    slug,
    legacyId,
    excerpt: optStr(formData, "excerpt"),
    content: optStr(formData, "content"),
    category: optStr(formData, "category"),
    readTime: optStr(formData, "readTime"),
    status,
    publishedAt: status === "PUBLIE" ? new Date() : null,
  };

  if (id) {
    const existing = await prisma.article.findUnique({ where: { id } });
    await prisma.article.update({
      where: { id },
      data: { ...data, publishedAt: existing?.publishedAt ?? data.publishedAt },
    });
  } else {
    await prisma.article.create({ data });
  }

  revalidatePath("/back-office/academy/articles");
  revalidatePublic("blog");
  return {};
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.article.delete({ where: { id } });
  revalidatePath("/back-office/academy/articles");
  revalidatePublic("blog");
}

export async function toggleArticleStatusAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  const article = await prisma.article.findUnique({ where: { id } });
  if (article) {
    const publish = article.status !== "PUBLIE";
    await prisma.article.update({
      where: { id },
      data: {
        status: publish ? "PUBLIE" : "BROUILLON",
        publishedAt: publish ? (article.publishedAt ?? new Date()) : article.publishedAt,
      },
    });
  }
  revalidatePath("/back-office/academy/articles");
  revalidatePublic("blog");
}

// ═════════════════════════════════════════════════════════════
// TÉMOIGNAGES
// ═════════════════════════════════════════════════════════════

export interface TestimonialFormState {
  error?: string;
}

export async function saveTestimonialAction(
  _prev: TestimonialFormState,
  formData: FormData
): Promise<TestimonialFormState> {
  await requireSession();
  const id = optStr(formData, "id");
  const name = str(formData, "name");
  const content = str(formData, "content");
  if (!name || !content) {
    return { error: "Le nom de l'auteur et le témoignage sont obligatoires." };
  }

  const rating = Math.min(5, Math.max(1, Number(str(formData, "rating") || "5")));

  const data = {
    name,
    role: optStr(formData, "role"),
    entity: str(formData, "entity") === "ACADEMY" ? "ACADEMY" : "CABINET",
    content,
    rating,
    status: str(formData, "status") || "PUBLIE",
  };

  if (id) {
    await prisma.testimonial.update({ where: { id }, data });
  } else {
    await prisma.testimonial.create({ data });
  }

  revalidatePath("/back-office/academy/temoignages");
  revalidatePublic("temoignages");
  return {};
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/back-office/academy/temoignages");
  revalidatePublic("temoignages");
}

export async function toggleTestimonialStatusAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = str(formData, "id");
  if (!id) return;
  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (t) {
    await prisma.testimonial.update({
      where: { id },
      data: { status: t.status === "PUBLIE" ? "BROUILLON" : "PUBLIE" },
    });
  }
  revalidatePath("/back-office/academy/temoignages");
  revalidatePublic("temoignages");
}
