"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity } from "lucide-react";

interface LandingScreenProps {
  onStart: () => void;
  isLoading: boolean;
}

export function LandingScreen({ onStart, isLoading }: LandingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="test-card text-center"
    >
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Activity size={32} />
        </div>
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
        ALMOMKIN TEST
      </h1>
      
      <p className="text-slate-600 mb-10 leading-relaxed max-w-md mx-auto">
        Vous allez être confronté à une situation nécessitant une prise de décision.
        Prenez le temps nécessaire puis choisissez l'option qui vous paraît la plus appropriée.
      </p>

      <button
        onClick={onStart}
        disabled={isLoading}
        className="btn-primary max-w-xs mx-auto"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Création de la session...
          </span>
        ) : (
          <>
            Commencer le test
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </motion.div>
  );
}
