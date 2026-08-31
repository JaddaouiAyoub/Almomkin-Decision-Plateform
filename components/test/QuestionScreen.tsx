"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import { formatTimerDisplay } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  text: string;
}

interface QuestionScreenProps {
  questionText: string;
  options: Option[];
  selectedOptionId?: string;
  onSelectOption: (id: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  seconds: number;
}

export function QuestionScreen({
  questionText,
  options,
  selectedOptionId,
  onSelectOption,
  onSubmit,
  isLoading,
  seconds,
}: QuestionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="test-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug flex-1">
          {questionText}
        </h2>
        
        {/* Timer UI */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 self-start sm:shrink-0">
          <Clock size={14} className="text-slate-400" />
          <span className="timer-display text-slate-700 text-sm">
            {formatTimerDisplay(seconds)}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(option.id)}
            className={cn(
              "answer-option group",
              selectedOptionId === option.id && "selected"
            )}
          >
            <span className="answer-label group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {option.label}
            </span>
            <span className="text-slate-700 font-medium leading-snug">
              {option.text}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={!selectedOptionId || isLoading}
          className="btn-primary w-full sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Validation...
            </span>
          ) : (
            <>
              Valider ma décision
              <CheckCircle2 size={18} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
