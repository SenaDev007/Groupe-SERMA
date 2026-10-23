"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  createSessionToken,
  BO_SESSION_COOKIE,
  BO_ENTITY_COOKIE,
  getSession,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { BO_PATHS } from "@/lib/back-office/constants";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Veuillez renseigner votre e-mail et votre mot de passe." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Identifiants incorrects. Vérifiez votre e-mail et votre mot de passe." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Identifiants incorrects. Vérifiez votre e-mail et votre mot de passe." };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const store = await cookies();
  store.set(BO_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  // L'espace de travail est choisi après le login — on repart d'une sélection propre.
  store.delete(BO_ENTITY_COOKIE);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  redirect(BO_PATHS.selection);
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(BO_SESSION_COOKIE);
  store.delete(BO_ENTITY_COOKIE);
  redirect(BO_PATHS.login);
}

export async function selectEntityAction(entity: "cabinet" | "academy"): Promise<void> {
  const session = await getSession();
  if (!session) redirect(BO_PATHS.login);

  const store = await cookies();
  store.set(BO_ENTITY_COOKIE, entity, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(entity === "cabinet" ? BO_PATHS.cabinet : BO_PATHS.academy);
}
