"use strict";

import React from "react";
import { getFormById } from "@/lib/db";
import { notFound } from "next/navigation";
import ClientFormRenderer from "./ClientFormRenderer";
import type { Metadata } from "next";

interface Props {
  params: {
    id: string;
  };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const form = await getFormById(params.id);
  if (!form) {
    return {
      title: "Formulaire non trouvé - Groupe SERMA",
    };
  }

  const entityName = form.entity === "academy" ? "SERMA Academy" : "Cabinet SERMA";
  return {
    title: `${form.title} - ${entityName}`,
    description: form.description || `Inscrivez-vous à la formation ${form.title} proposée par le Groupe SERMA.`,
    openGraph: {
      title: `${form.title} - ${entityName}`,
      description: form.description,
      type: "website",
    },
  };
}

export default async function DynamicFormPage({ params }: Props) {
  const form = await getFormById(params.id);

  if (!form) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#05091a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d1a3a] via-[#05091a] to-[#030611] py-12 px-4 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F59B1E]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#2BA96B]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto relative z-10 my-auto">
        <ClientFormRenderer form={form} />
      </div>

      {/* Small footer */}
      <footer className="w-full text-center py-6 relative z-10 text-xs text-gray-500 border-t border-white/5 mt-12">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 px-4">
          <p>© 2026 Groupe SERMA. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="/academy" className="hover:text-white transition-colors">Academy</a>
            <a href="/cabinet" className="hover:text-white transition-colors">Cabinet</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
