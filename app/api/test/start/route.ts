import { NextResponse } from "next/server";
import { startSession } from "@/lib/experiment/startSession";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Get the active experiment
    const experiment = await prisma.experiment.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!experiment) {
      return NextResponse.json(
        { error: "Aucune expérience active trouvée" },
        { status: 404 }
      );
    }

    const sessionData = await startSession(experiment.id);

    return NextResponse.json(sessionData, { status: 201 });
  } catch (error) {
    console.error("[API /test/start]", error);
    return NextResponse.json(
      { error: "Impossible de démarrer la session" },
      { status: 500 }
    );
  }
}
