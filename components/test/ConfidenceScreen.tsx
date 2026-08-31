"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceScreenProps {
  score: number | null;
  onSelectScore: (score: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ConfidenceScreen({
  score,
  onSelectScore,
  onSubmit,
  isLoading,
}: ConfidenceScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="test-card text-center"
    >
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
          <ShieldCheck size={24} />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
        Quel est votre niveau de confiance dans votre décision ?
      </h2>
      <p className="text-slate-500 mb-10 text-sm sm:text-base">
        Évaluez de 0 (aucune confiance) à 10 (certitude absolue).
      </p>

      <div className="mb-10">
        <div className="grid grid-cols-6 sm:flex sm:flex-wrap sm:justify-center gap-2 px-1">
          {Array.from({ length: 11 }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectScore(i)}
              className={cn(
                "confidence-btn aspect-square min-w-0 text-base sm:text-sm",
                score === i && "selected"
              )}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs font-medium text-slate-400 mt-3 px-1 uppercase tracking-wide">
          <span>Aucune certitude</span>
          <span>Certitude absolue</span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={score === null || isLoading}
        className="btn-primary w-full sm:w-64 mx-auto"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Enregistrement...
          </span>
        ) : (
          <>
            Confirmer
            <CheckCircle2 size={18} />
          </>
        )}
      </button>
    </motion.div>
  );
}
