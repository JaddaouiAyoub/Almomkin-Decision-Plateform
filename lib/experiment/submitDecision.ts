import { prisma } from "@/lib/prisma";
import type { SubmitDecisionResponse } from "@/types";

interface SubmitDecisionInput {
  sessionId: string;
  participantId: string;
  questionId: string;
  answerOptionId?: string;
  responseText?: string;
  questionShownAt: Date; // Stored server-side
  clientTimeMs?: number; // From client (for audit only)
}

/**
 * Submits the participant's decision.
 * Decision time is calculated SERVER-SIDE using the stored questionShownAt timestamp.
 */
export async function submitDecision(
  input: SubmitDecisionInput
): Promise<SubmitDecisionResponse> {
  const answeredAt = new Date();

  // Calculate decision time server-side (trustworthy)
  const decisionTimeMs =
    answeredAt.getTime() - input.questionShownAt.getTime();

  // Validate the session
  const session = await prisma.testSession.findUnique({
    where: { id: input.sessionId },
    include: { group: true, studyCase: true },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.status === "COMPLETED") {
    throw new Error("Session already completed");
  }

  const question = await prisma.question.findFirst({
    where: { id: input.questionId, studyCaseId: session.studyCaseId, isActive: true },
  });

  if (!question) {
    throw new Error("Invalid question");
  }

  if (question.type === "FREE_TEXT" && !input.responseText?.trim()) {
    throw new Error("Text response is required");
  }

  let selectedOption: { label: string } | null = null;
  if (question.type !== "FREE_TEXT") {
    selectedOption = await prisma.answerOption.findFirst({
      where: { id: input.answerOptionId, questionId: input.questionId },
      select: { label: true },
    });
    if (!selectedOption) {
      throw new Error("Invalid answer option");
    }
  }

  // Create response
  const response = await prisma.response.create({
    data: {
      sessionId: input.sessionId,
      participantId: input.participantId,
      groupId: session.groupId,
      studyCaseId: session.studyCaseId,
      questionId: input.questionId,
      answerOptionId: input.answerOptionId,
      responseText: input.responseText?.trim() || null,
      confidenceScore: question.type === "SCALE" ? Number(selectedOption?.label) : null,
      decisionTimeMs,
      questionShownAt: input.questionShownAt,
      answeredAt,
      clientTimeMs: input.clientTimeMs,
    },
  });

  // Update session status
  await prisma.testSession.update({
    where: { id: input.sessionId },
    data: { status: "ANSWERED" },
  });

  return {
    responseId: response.id,
    decisionTimeMs,
  };
}

/**
 * Updates the confidence score.
 * Only marks session as COMPLETED if this is the last question.
 */
export async function saveConfidence(
  responseId: string,
  sessionId: string,
  confidenceScore: number,
  isLastQuestion: boolean
): Promise<void> {
  if (confidenceScore < 1 || confidenceScore > 5) {
    throw new Error("Confidence score must be between 1 and 5");
  }

  await prisma.response.update({
    where: { id: responseId },
    data: { confidenceScore },
  });

  if (isLastQuestion) {
    await prisma.testSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });
  }
}

/**
 * Records when the question was shown to the participant (server timestamp).
 * This is the authoritative start time for decision measurement.
 */
export async function markQuestionShown(sessionId: string): Promise<Date> {
  const shownAt = new Date();

  await prisma.testSession.update({
    where: { id: sessionId },
    data: { status: "QUESTION_SHOWN" },
  });

  return shownAt;
}
