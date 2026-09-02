"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function InformationScreen({ information, onContinue, isLoading }: { information: string; onContinue: () => void; isLoading: boolean }) {
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="test-card">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Sparkles size={19} /></div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Nouvelle information</p>
      </div>
      <p className="whitespace-pre-line text-lg leading-relaxed text-slate-700">{information}</p>
      <button type="button" onClick={onContinue} disabled={isLoading} className="btn-primary mt-8 w-full sm:ml-auto sm:w-auto">
        Continuer <ArrowRight size={18} />
      </button>
    </motion.section>
  );
}
