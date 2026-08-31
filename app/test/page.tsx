"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTimer } from "@/hooks/useTimer";
import { LandingScreen } from "@/components/test/LandingScreen";
import { CaseScreen } from "@/components/test/CaseScreen";
import { QuestionScreen } from "@/components/test/QuestionScreen";
import { ConfidenceScreen } from "@/components/test/ConfidenceScreen";
import { CompletionScreen } from "@/components/test/CompletionScreen";
import type { TestState, StartSessionResponse } from "@/types";

export default function TestPage() {
  const [state, setState] = useState<TestState>({ step: "landing" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timer = useTimer();

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/test/start", { method: "POST" });
      if (!res.ok) throw new Error("Failed to start session");
      
      const data: StartSessionResponse = await res.json();
      setState({
        step: "case",
        participantId: data.participantId,
        sessionId: data.sessionId,
        studyCase: data.studyCase,
        question: data.question,
      });
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToQuestion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/test/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: state.sessionId }),
      });
      if (!res.ok) throw new Error("Failed to record question shown");
      
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        step: "question",
        questionShownAt: data.questionShownAt,
      }));
      timer.start();
    } catch (err) {
      setError("Une erreur est survenue.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    setState((prev) => ({ ...prev, selectedOptionId: optionId }));
  };

  const handleSubmitDecision = async () => {
    if (!state.selectedOptionId) return;
    
    const clientTimeMs = timer.stop();
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          participantId: state.participantId,
          questionId: state.question?.id,
          answerOptionId: state.selectedOptionId,
          clientTimeMs,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit decision");
      
      const data = await res.json();
      setState((prev) => ({
        ...prev,
        step: "confidence",
        responseId: data.responseId,
        decisionTimeMs: data.decisionTimeMs,
      }));
    } catch (err) {
      setError("Erreur lors de l'enregistrement de votre décision.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitConfidence = async (score: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/test/confidence", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responseId: state.responseId,
          sessionId: state.sessionId,
          confidenceScore: score,
        }),
      });
      if (!res.ok) throw new Error("Failed to save confidence");
      
      setState((prev) => ({ ...prev, step: "completed" }));
    } catch (err) {
      setError("Erreur lors de l'enregistrement.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="test-container">
      {error && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-50">
          <div className="bg-red-50 text-red-600 px-6 py-3 rounded-lg shadow-sm border border-red-100 font-medium">
            {error}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {state.step === "landing" && (
          <LandingScreen
            key="landing"
            onStart={handleStart}
            isLoading={isLoading}
          />
        )}
        
        {state.step === "case" && state.studyCase && (
          <CaseScreen
            key="case"
            title={state.studyCase.title}
            content={state.studyCase.content}
            onContinue={handleContinueToQuestion}
            isLoading={isLoading}
          />
        )}
        
        {state.step === "question" && state.question && (
          <QuestionScreen
            key="question"
            questionText={state.question.text}
            options={state.question.options}
            selectedOptionId={state.selectedOptionId}
            onSelectOption={handleSelectOption}
            onSubmit={handleSubmitDecision}
            isLoading={isLoading}
            seconds={timer.seconds}
          />
        )}
        
        {state.step === "confidence" && (
          <ConfidenceScreen
            key="confidence"
            score={state.confidenceScore ?? null}
            onSelectScore={(score) => setState(prev => ({ ...prev, confidenceScore: score }))}
            onSubmit={() => {
              if (state.confidenceScore !== undefined) {
                handleSubmitConfidence(state.confidenceScore);
              }
            }}
            isLoading={isLoading}
          />
        )}
        
        {state.step === "completed" && (
          <CompletionScreen key="completed" />
        )}
      </AnimatePresence>
    </main>
  );
}
