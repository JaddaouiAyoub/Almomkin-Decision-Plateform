"use client";

import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";

interface CaseScreenProps {
  title: string;
  content: string;
  onContinue: () => void;
  isLoading: boolean;
}

export function CaseScreen({ title, content, onContinue, isLoading }: CaseScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="test-card"
    >
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <FileText size={20} />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="prose prose-slate max-w-none mb-8 text-slate-700 leading-relaxed text-base sm:text-lg">
        <p>{content}</p>
      </div>

      <button
        onClick={onContinue}
        disabled={isLoading}
        className="btn-primary w-full sm:w-auto sm:px-12 sm:ml-auto sm:block"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Chargement...
          </span>
        ) : (
          <>
            Continuer
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </motion.div>
  );
}
