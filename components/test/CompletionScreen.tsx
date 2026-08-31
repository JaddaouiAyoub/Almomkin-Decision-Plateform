"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function CompletionScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="test-card text-center py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="flex justify-center mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
          <CheckCircle size={32} />
        </div>
      </motion.div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
        Merci pour votre participation.
      </h2>
      
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">
        Vos réponses ont été enregistrées avec succès. Vous pouvez maintenant fermer cette page.
      </p>
    </motion.div>
  );
}
