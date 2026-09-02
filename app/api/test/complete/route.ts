import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ sessionId: z.string().uuid() });

export async function PATCH(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    await prisma.testSession.update({
      where: { id: parsed.data.sessionId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /test/complete]", error);
    return NextResponse.json({ error: "Erreur lors de la clôture du cas" }, { status: 500 });
  }
}
