import { prisma } from "@/lib/prisma";
import { assignGroup } from "./assignGroup";
import type { StartSessionResponse } from "@/types";

/**
 * Starts a new test session for an anonymous participant.
 * Creates Participant, assigns Group, creates TestSession.
 */
export async function startSession(
  experimentId: string
): Promise<StartSessionResponse> {
  // 1. Get the active study case
  const studyCase = await prisma.studyCase.findFirst({
    where: { experimentId, isActive: true },
    include: {
      groupContents: true,
      questions: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  if (!studyCase) {
    throw new Error("No active study case found");
  }

  if (studyCase.questions.length === 0) {
    throw new Error("No active questions found for this study case");
  }

  // 2. Assign group (server-side)
  const { groupId, groupLabel } = await assignGroup(experimentId);

  // 3. Get case content for the assigned group
  const groupContent = studyCase.groupContents.find(
    (c) => c.groupLabel === groupLabel
  );

  if (!groupContent) {
    throw new Error(`No content found for group ${groupLabel}`);
  }

  // 4. Create participant
  const participant = await prisma.participant.create({ data: {} });

  // 5. Create test session
  const session = await prisma.testSession.create({
    data: {
      participantId: participant.id,
      experimentId,
      groupId,
      studyCaseId: studyCase.id,
      status: "STARTED",
    },
  });

  // 6. Return data needed for the test flow (NO group label exposed)
  return {
    participantId: participant.id,
    sessionId: session.id,
    studyCase: {
      id: studyCase.id,
      title: studyCase.title,
      content: groupContent.content,
    },
    questions: studyCase.questions.map((q) => ({
      id: q.id,
      text: q.text,
      order: q.order,
      options: q.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        text: opt.text,
        order: opt.order,
      })),
    })),
  };
}
