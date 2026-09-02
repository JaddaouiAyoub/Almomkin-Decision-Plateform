import { NextRequest, NextResponse } from "next/server";
import { submitDecision } from "@/lib/experiment/submitDecision";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerOptionId: z.string().uuid().optional(),
  responseText: z.string().trim().min(1).max(5000).optional(),
  clientTimeMs: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Get the questionShownAt from session
    const session = await prisma.testSession.findUnique({
      where: { id: parsed.data.sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session introuvable" },
        { status: 404 }
      );
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Session déjà terminée" },
        { status: 409 }
      );
    }

    // Use session updatedAt as questionShownAt proxy if status is QUESTION_SHOWN
    // Or fall back to startedAt
    const questionShownAt =
      session.status === "QUESTION_SHOWN" ? session.updatedAt : session.startedAt;

    const result = await submitDecision({
      sessionId: parsed.data.sessionId,
      participantId: parsed.data.participantId,
      questionId: parsed.data.questionId,
      answerOptionId: parsed.data.answerOptionId,
      responseText: parsed.data.responseText,
      questionShownAt,
      clientTimeMs: parsed.data.clientTimeMs,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /test/submit]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}
