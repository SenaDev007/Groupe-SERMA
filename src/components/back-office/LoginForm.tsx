"use client";

import { useActionState } from "react";
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { loginAction, type LoginState } from "@/app/back-office/actions";
import { BoLogo } from "@/components/back-office/BoLogo";
import { PwaControls } from "@/components/back-office/pwa/PwaControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-marine-profond text-white flex flex-col relative overflow-hidden">
      {/* Texture grain statique + halo discret — aucun mouvement */}
      <div className="absolute inset-0 bg-grain opacity-[0.35] pointer-events-none" aria-hidden />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-orange-logo/[0.07] blur-[130px] pointer-events-none" aria-hidden />

      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* En-tête */}
          <div className="flex flex-col items-center text-center mb-10">
            <BoLogo variant="light" size="lg" />
            <h1 className="mt-8 font-playfair text-3xl font-black tracking-tight">
              Back-Office Groupe SERMA
            </h1>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-xs">
              Votre cockpit digital : gestion du cabinet comptable et de
              SERMA HUB Impact Academy, en un seul espace sécurisé.
            </p>
          </div>

          {/* Carte de connexion */}
          <div className="glass-panel-bo rounded-2xl p-8">
            <form action={formAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                  Adresse e-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="vous@sermagroupe.bj"
                    className="pl-10 h-11 bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-orange-logo/60 focus-visible:border-orange-logo/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••"
                    className="pl-10 pr-11 h-11 bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-orange-logo/60 focus-visible:border-orange-logo/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white/80 transition-colors"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {state?.error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                  <span>{state.error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-11 bg-orange-logo hover:bg-orange-sature text-white font-semibold text-sm shadow-orange"
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                    Connexion en cours…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Se connecter
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-white/40 leading-relaxed">
            Accès réservé aux collaborateurs du Groupe SERMA.
            <br />
            Cabinet SERMA SARL &middot; SERMA HUB Impact Academy &middot; Parakou, Bénin
          </p>
        </div>
      </div>

      {/* Enregistrement du service worker : application installable,
          fonctionnement hors-ligne et synchro automatique. */}
      <PwaControls variant="boot" />
    </main>
  );
}
