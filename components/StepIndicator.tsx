"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-px bg-white/[0.06] z-0" />
        <motion.div
          className="absolute top-4 left-0 h-px bg-orange/50 z-0"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div key={step} className="flex flex-col items-center z-10">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted
                    ? "rgba(43,169,107,0.12)"
                    : isActive
                    ? "rgba(245,155,30,0.12)"
                    : "rgba(255,255,255,0.03)",
                  borderColor: isCompleted
                    ? "#2BA96B"
                    : isActive
                    ? "#F59B1E"
                    : "rgba(255,255,255,0.12)",
                  boxShadow: isActive ? "0 0 16px rgba(245,155,30,0.3)" : "none",
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ color: isCompleted ? "#2BA96B" : isActive ? "#F59B1E" : "#475569" }}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                ) : (
                  step
                )}
              </motion.div>

              <span
                className={`mt-2 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-center hidden sm:block w-16 leading-tight truncate
                  ${isActive ? "text-orange" : isCompleted ? "text-green-serma/70" : "text-slate-600"}`}
              >
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 sm:hidden text-center">
        <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-500">
          Étape <span className="text-orange">{currentStep}</span>/{totalSteps}
          <span className="text-slate-400 normal-case tracking-normal font-normal"> — {labels[currentStep - 1]}</span>
        </span>
      </div>
    </div>
  );
}
