"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTimer } from "@/hooks/useTimer";
import { LandingScreen } from "@/components/test/LandingScreen";
import { CaseScreen } from "@/components/test/CaseScreen";
import { CompletionScreen } from "@/components/test/CompletionScreen";
import { InformationScreen } from "@/components/test/InformationScreen";
import { StepScreen } from "@/components/test/StepScreen";
import type { StartSessionResponse, TestState } from "@/types";

const stageLabels = ["Situation", "Décision", "Analyse", "Nouvelle information", "Résultat"];

export default function TestPage() {
  const [state, setState] = useState<TestState>({ step: "landing", currentQuestionIndex: 0, currentCaseIndex: 0, questions: [], cases: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useTimer();
  const currentCase = state.cases[state.currentCaseIndex];
  const currentQuestion = currentCase?.questions[state.currentQuestionIndex];
  const progressIndex = currentQuestion?.stage === "ALMOMKIN_ANALYSIS" ? 2 : currentQuestion?.stage === "FINAL_DECISION" || currentQuestion?.stage === "FINAL_CONFIDENCE" || currentQuestion?.stage === "ALMOMKIN_HELPED" ? 4 : 1;

  const handleStart = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch("/api/test/start", { method: "POST" });
      if (!response.ok) throw new Error("Failed to start session");
      const data: StartSessionResponse = await response.json();
      setState({ step: "case", participantId: data.participantId, sessionId: data.sessionId, studyCase: data.studyCase, questions: data.questions, cases: data.cases, currentCaseIndex: 0, currentQuestionIndex: 0 });
    } catch { setError("Une erreur est survenue. Veuillez réessayer."); } finally { setIsLoading(false); }
  };

  const showQuestion = async (questionIndex: number) => {
    if (!currentCase) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/test/question", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: currentCase.sessionId }) });
      if (!response.ok) throw new Error("Failed to record question shown");
      const data = await response.json();
      setState((previous) => ({ ...previous, step: "question", currentQuestionIndex: questionIndex, questionShownAt: data.questionShownAt, selectedOptionId: undefined, responseText: undefined }));
      timer.start();
    } catch { setError("Une erreur est survenue."); } finally { setIsLoading(false); }
  };

  const handleSubmitStep = async () => {
    if (!currentQuestion || !currentCase || (!state.selectedOptionId && !state.responseText?.trim())) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/test/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: currentCase.sessionId, participantId: state.participantId, questionId: currentQuestion.id, answerOptionId: state.selectedOptionId, responseText: state.responseText, clientTimeMs: timer.stop() }) });
      if (!response.ok) throw new Error("Failed to submit step");
      const nextIndex = state.currentQuestionIndex + 1;
      if (currentQuestion.stage === "ALMOMKIN_ANALYSIS" && currentCase.studyCase.newInformation) {
        setState((previous) => ({ ...previous, step: "information", selectedOptionId: undefined, responseText: undefined }));
      } else if (nextIndex < currentCase.questions.length) {
        await showQuestion(nextIndex);
      } else {
        await fetch("/api/test/complete", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: currentCase.sessionId }) });
        const nextCaseIndex = state.currentCaseIndex + 1;
        if (nextCaseIndex >= state.cases.length) setState((previous) => ({ ...previous, step: "completed" }));
        else setState((previous) => ({ ...previous, currentCaseIndex: nextCaseIndex, currentQuestionIndex: 0, step: "case", sessionId: state.cases[nextCaseIndex].sessionId, studyCase: state.cases[nextCaseIndex].studyCase, questions: state.cases[nextCaseIndex].questions, selectedOptionId: undefined, responseText: undefined }));
      }
    } catch { setError("Erreur lors de l'enregistrement de votre réponse."); } finally { setIsLoading(false); }
  };

  return <main className="test-container">
    {error && <div className="fixed inset-x-0 top-4 z-50 flex justify-center"><div className="rounded-xl border border-red-100 bg-red-50 px-5 py-3 font-medium text-red-600 shadow-sm">{error}</div></div>}
    {state.step !== "landing" && state.step !== "completed" && currentCase && <div className="mb-5 w-full max-w-2xl px-1"><div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-600"><span>Cas {state.currentCaseIndex + 1} / {state.cases.length}</span><span>{stageLabels[progressIndex]}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${((state.currentCaseIndex + (progressIndex + 1) / stageLabels.length) / state.cases.length) * 100}%` }} /></div><div className="mt-2 hidden justify-between text-[11px] text-slate-400 sm:flex">{stageLabels.map((label) => <span key={label}>{label}</span>)}</div></div>}
    <AnimatePresence mode="wait">
      {state.step === "landing" && <LandingScreen key="landing" onStart={handleStart} isLoading={isLoading} />}
      {state.step === "case" && currentCase && <CaseScreen key={`case-${currentCase.studyCase.id}`} title={currentCase.studyCase.title} content={currentCase.studyCase.content} onContinue={() => showQuestion(0)} isLoading={isLoading} />}
      {state.step === "question" && currentQuestion && <StepScreen key={currentQuestion.id} questionText={currentQuestion.text} type={currentQuestion.type} options={currentQuestion.options} selectedOptionId={state.selectedOptionId} responseText={state.responseText} onSelectOption={(id) => setState((previous) => ({ ...previous, selectedOptionId: id }))} onChangeText={(value) => setState((previous) => ({ ...previous, responseText: value }))} onSubmit={handleSubmitStep} isLoading={isLoading} seconds={timer.seconds} />}
      {state.step === "information" && currentCase?.studyCase.newInformation && <InformationScreen key="information" information={currentCase.studyCase.newInformation} onContinue={() => showQuestion(state.currentQuestionIndex + 1)} isLoading={isLoading} />}
      {state.step === "completed" && <CompletionScreen key="completed" />}
    </AnimatePresence>
  </main>;
}
