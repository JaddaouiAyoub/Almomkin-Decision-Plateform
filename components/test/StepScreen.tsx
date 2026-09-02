"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, MessageSquare, ShieldCheck } from "lucide-react";
import { formatTimerDisplay } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types";

interface StepScreenProps {
  questionText: string;
  type: QuestionType;
  options: Array<{ id: string; label: string; text: string }>;
  selectedOptionId?: string;
  responseText?: string;
  onSelectOption: (id: string) => void;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  seconds: number;
}

export function StepScreen({
  questionText,
  type,
  options,
  selectedOptionId,
  responseText,
  onSelectOption,
  onChangeText,
  onSubmit,
  isLoading,
  seconds,
}: StepScreenProps) {
  const isScale = type === "SCALE";
  const isFreeText = type === "FREE_TEXT";
  const canSubmit = isFreeText ? Boolean(responseText?.trim()) : Boolean(selectedOptionId);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.28 }}
      className="test-card"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isFreeText ? "bg-amber-50 text-amber-600" : isScale ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
          )}>
            {isFreeText ? <MessageSquare size={19} /> : isScale ? <ShieldCheck size={19} /> : <CheckCircle2 size={19} />}
          </div>
          <h2 className="text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">{questionText}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
          <Clock size={14} className="text-slate-400" />
          {formatTimerDisplay(seconds)}
        </div>
      </div>

      {isFreeText ? (
        <textarea
          value={responseText ?? ""}
          onChange={(event) => onChangeText(event.target.value)}
          rows={6}
          maxLength={5000}
          placeholder="Écrivez votre réponse ici..."
          className="mb-8 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
        />
      ) : (
        <div className={cn("mb-8 grid gap-3", isScale ? "grid-cols-5" : "grid-cols-1")}>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className={cn(
                "group flex min-h-14 items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                selectedOptionId === option.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-950 shadow-sm ring-2 ring-indigo-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50",
                isScale && "justify-center p-2 text-center"
              )}
            >
              {!isScale && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700">{option.label}</span>}
              <span className={cn("font-medium leading-snug", isScale && "text-lg")}>{option.text}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || isLoading}
        className="btn-primary w-full sm:ml-auto sm:w-auto"
      >
        {isLoading ? "Enregistrement..." : "Continuer"}
        {!isLoading && <ArrowRight size={18} />}
      </button>
    </motion.section>
  );
}
