import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { exportResultsToCSV } from "@/lib/csv/exportResults";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const csv = await exportResultsToCSV();
    const filename = `almomkin-results-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[API /admin/export]", error);
    return NextResponse.json({ error: "Erreur d'export" }, { status: 500 });
  }
}
