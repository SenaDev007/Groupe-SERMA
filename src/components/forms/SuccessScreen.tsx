"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, RotateCcw, Video } from "lucide-react";

const FEDAPAY_URL = "https://me.fedapay.com/eUT2Wc_i";

interface SuccessScreenProps {
  name: string;
  onReset: () => void;
}

export default function SuccessScreen({ name, onReset }: SuccessScreenProps) {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#F59B1E", "#2BA96B", "#FFFFFF"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#F59B1E", "#2BA96B", "#FFFFFF"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="text-center py-6 xs:py-8 px-2 xs:px-4"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-green-serma/20 border-2 border-green-serma mx-auto mb-5 xs:mb-6 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
        >
          <Check
            className="w-10 h-10 xs:w-12 xs:h-12 text-green-serma"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="font-syne text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-2 xs:mb-3">
          Candidature envoyée !
        </h2>
        <p className="text-slate-300 text-sm xs:text-base mb-2">
          Félicitations{" "}
          <span className="text-orange font-semibold">{name}</span> !
        </p>
        <p className="text-muted text-xs xs:text-sm leading-relaxed max-w-sm xs:max-w-md mx-auto mb-5">
          Votre dossier a bien été reçu. Pour confirmer définitivement votre
          place, effectuez le paiement de{" "}
          <strong className="text-white">2 000 FCFA</strong> ci-dessous.
        </p>

        {/* ── Payment CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-orange/10 border border-orange rounded-2xl p-4 xs:p-5 mb-6 max-w-sm xs:max-w-md mx-auto"
        >
          <p className="text-orange text-xs xs:text-sm font-bold uppercase tracking-wider mb-1">
            Étape suivante
          </p>
          <p className="text-white text-base xs:text-lg font-extrabold mb-3">
            Payez 2 000 FCFA pour réserver votre place
          </p>
          <a
            href={FEDAPAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 xs:py-3.5 rounded-xl bg-orange text-navy font-bold text-sm xs:text-base hover:bg-orange-hover active:scale-[0.98] transition-all duration-200 shadow-orange"
          >
            Payer maintenant via FedaPay
          </a>
          <p className="text-muted text-[10px] xs:text-xs mt-2">
            Paiement sécurisé · Mobile Money · Carte bancaire
          </p>
        </motion.div>

        {/* Info boxes */}
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-3 text-left max-w-sm xs:max-w-lg mx-auto mb-4">
          <div className="bg-navy-light rounded-xl p-3 border border-orange/20">
            <p className="text-orange text-[9px] xs:text-[10px] font-semibold uppercase tracking-wider mb-1">
              Dates
            </p>
            <p className="text-white text-[10px] xs:text-xs font-bold leading-tight">
              07 · 08 · 09 Mai
            </p>
            <p className="text-muted text-[9px] xs:text-[10px]">2026</p>
          </div>
          <div className="bg-navy-light rounded-xl p-3 border border-green-serma/30">
            <p className="text-green-serma text-[9px] xs:text-[10px] font-semibold uppercase tracking-wider mb-1">
              Formation
            </p>
            <p className="text-white text-[10px] xs:text-xs font-bold leading-tight">
              100% Gratuit
            </p>
            <p className="text-muted text-[9px] xs:text-[10px]">0 FCFA</p>
          </div>
          <div className="bg-navy-light rounded-xl p-3 border border-orange/20">
            <p className="text-orange text-[9px] xs:text-[10px] font-semibold uppercase tracking-wider mb-1">
              Attestation
            </p>
            <p className="text-white text-[10px] xs:text-xs font-bold leading-tight">
              3 000 FCFA
            </p>
            <p className="text-muted text-[9px] xs:text-[10px]">optionnelle</p>
          </div>
          <div className="bg-navy-light rounded-xl p-3 border border-orange/20">
            <p className="text-orange text-[9px] xs:text-[10px] font-semibold uppercase tracking-wider mb-1">
              Contact
            </p>
            <p className="text-white text-[10px] xs:text-xs font-bold leading-tight">
              01 40 37 71 99
            </p>
            <p className="text-muted text-[9px] xs:text-[10px]">WhatsApp</p>
          </div>
        </div>

        {/* Zoom info */}
        <div className="inline-flex items-center gap-2 bg-navy-light border border-orange/20 rounded-xl px-4 py-2.5 mb-5">
          <Video className="w-4 h-4 text-orange flex-shrink-0" aria-hidden="true" />
          <p className="text-slate-300 text-[10px] xs:text-xs">
            Lien <strong className="text-white">Zoom / Google Meet</strong> envoyé après confirmation du paiement
          </p>
        </div>

        <p className="text-muted text-[10px] xs:text-xs px-2 mb-6">
          Places limitées à 10 participants · Zongo 2, axe BENI CHIC – PRESIDO
        </p>

        {/* Reset */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-orange/30 text-orange text-sm font-semibold hover:bg-orange/10 active:bg-orange/20 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Nouvelle inscription
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
