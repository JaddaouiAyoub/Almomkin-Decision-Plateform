import { prisma } from "@/lib/prisma";
import type { SubmitDecisionResponse } from "@/types";

interface SubmitDecisionInput {
  sessionId: string;
  participantId: string;
  questionId: string;
  answerOptionId: string;
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

  // Validate the answer option belongs to the question
  const option = await prisma.answerOption.findFirst({
    where: {
      id: input.answerOptionId,
      questionId: input.questionId,
    },
  });

  if (!option) {
    throw new Error("Invalid answer option");
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
 * Updates the confidence score and marks session as completed.
 */
export async function saveConfidence(
  responseId: string,
  sessionId: string,
  confidenceScore: number
): Promise<void> {
  if (confidenceScore < 0 || confidenceScore > 10) {
    throw new Error("Confidence score must be between 0 and 10");
  }

  await prisma.response.update({
    where: { id: responseId },
    data: { confidenceScore },
  });

  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
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
