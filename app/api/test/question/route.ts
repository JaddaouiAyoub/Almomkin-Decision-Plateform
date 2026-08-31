import { NextRequest, NextResponse } from "next/server";
import { markQuestionShown } from "@/lib/experiment/submitDecision";
import { z } from "zod";

const schema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const questionShownAt = await markQuestionShown(parsed.data.sessionId);

    return NextResponse.json({
      questionShownAt: questionShownAt.toISOString(),
    });
  } catch (error) {
    console.error("[API /test/question]", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
