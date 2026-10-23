"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, RotateCcw, Video, Mail } from "lucide-react";

interface PaymentSuccessScreenProps {
  name: string;
  onReset: () => void;
}

export default function PaymentSuccessScreen({ name, onReset }: PaymentSuccessScreenProps) {
  useEffect(() => {
    const duration = 4000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#F59B1E", "#2BA96B", "#FFFFFF"] });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#F59B1E", "#2BA96B", "#FFFFFF"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="text-center py-6 xs:py-8 px-2 xs:px-4"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 14 }}
        className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-green-serma/15 border-2 border-green-serma/60 mx-auto mb-5 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.35 }}
        >
          <CheckCircle2 className="w-10 h-10 xs:w-12 xs:h-12 text-green-serma" strokeWidth={1.5} aria-hidden="true" />
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-serma/10 border border-green-serma/30 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-serma animate-pulse" />
          <span className="text-green-serma text-[11px] font-semibold uppercase tracking-wider">Paiement confirmé</span>
        </div>

        <h2 className="font-syne text-2xl xs:text-3xl font-bold text-white mb-2 tracking-tight">
          Bienvenue, <span className="text-orange">{name}</span> !
        </h2>
        <p className="text-slate-400 text-sm xs:text-base mb-6 max-w-sm mx-auto leading-relaxed">
          Votre place est réservée. Un e-mail de confirmation vient d'être envoyé à notre équipe.
        </p>

        {/* Email sent notice */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2.5 bg-navy-elevated border border-white/[0.07] rounded-xl px-4 py-3 mb-6"
        >
          <Mail className="w-4 h-4 text-orange flex-shrink-0" aria-hidden="true" />
          <p className="text-slate-300 text-xs text-left">
            Notification envoyée à notre équipe —{" "}
            <strong className="text-white">nous vous contacterons sur WhatsApp</strong> pour confirmer les détails.
          </p>
        </motion.div>

        {/* Info grid */}
        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 xs:gap-3 max-w-sm xs:max-w-lg mx-auto mb-4">
          {[
            { label: "Dates", value: "07 · 08 · 09 Mai", sub: "2026" },
            { label: "Formation", value: "100% Gratuit", sub: "0 FCFA" },
            { label: "Attestation", value: "3 000 FCFA", sub: "optionnelle" },
            { label: "Contact", value: "01 40 37 71 99", sub: "WhatsApp" },
          ].map((item) => (
            <div key={item.label} className="bg-navy-light rounded-xl p-3 border border-white/[0.06] text-left">
              <p className="text-[9px] xs:text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">{item.label}</p>
              <p className="text-white text-[10px] xs:text-xs font-bold leading-tight">{item.value}</p>
              <p className="text-slate-600 text-[9px] xs:text-[10px]">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Format */}
        <div className="inline-flex items-center gap-2.5 bg-navy-light border border-white/[0.06] rounded-xl px-4 py-2.5 mb-6">
          <Video className="w-4 h-4 text-orange flex-shrink-0" aria-hidden="true" />
          <p className="text-slate-300 text-[10px] xs:text-xs">
            Présentiel + <strong className="text-white">Zoom / Google Meet</strong> — lien envoyé sous peu
          </p>
        </div>

        <p className="text-slate-600 text-[10px] xs:text-xs mb-6">
          Places limitées à 10 · Zongo 2, axe BENI CHIC – PRESIDO
        </p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:border-white/20 hover:text-white transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Nouvelle inscription
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
