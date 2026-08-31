import { NextRequest, NextResponse } from "next/server";
import { saveConfidence } from "@/lib/experiment/submitDecision";
import { z } from "zod";

const schema = z.object({
  responseId: z.string().uuid(),
  sessionId: z.string().uuid(),
  confidenceScore: z.number().int().min(0).max(10),
  isLastQuestion: z.boolean().default(true),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.issues },
        { status: 400 }
      );
    }

    await saveConfidence(
      parsed.data.responseId,
      parsed.data.sessionId,
      parsed.data.confidenceScore,
      parsed.data.isLastQuestion
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /test/confidence]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la confiance" },
      { status: 500 }
    );
  }
}
