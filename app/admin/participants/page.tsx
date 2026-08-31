import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const pageSize = 20;
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [participants, totalParticipants] = await Promise.all([
    prisma.participant.findMany({
      include: {
        sessions: {
          include: {
            group: true,
            studyCase: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.participant.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalParticipants / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Participants</h1>
          <p className="text-slate-500 mt-1">
            Total : <span className="font-medium text-slate-700">{totalParticipants}</span> participants
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Page {page} sur {totalPages}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="hidden lg:table-cell">ID Participant</th>
                <th className="hidden sm:table-cell">Date de création</th>
                <th>Sessions</th>
                <th>Groupe Assigné</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Aucun participant trouvé.
                  </td>
                </tr>
              ) : (
                participants.map((p) => {
                  const session = p.sessions[0];
                  return (
                    <tr key={p.id}>
                      <td className="hidden lg:table-cell font-mono text-xs text-slate-400" title={p.id}>{p.id.substring(0, 12)}…</td>
                      <td className="hidden sm:table-cell text-slate-700 text-sm">{formatDate(p.createdAt)}</td>
                      <td className="text-slate-700">{p.sessions.length}</td>
                      <td>
                        {session ? (
                          <span className={session.group.label === "A" ? "badge-group-a" : "badge-group-b"}>
                            {session.group.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td>
                        {session ? (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            session.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {session.status}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Page {page} sur {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={page > 1 ? `/admin/participants?page=${page - 1}` : "#"}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  page > 1
                    ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Précédent
              </a>
              <a
                href={page < totalPages ? `/admin/participants?page=${page + 1}` : "#"}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  page < totalPages
                    ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Suivant
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
