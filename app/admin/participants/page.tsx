import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const participants = await prisma.participant.findMany({
    include: {
      sessions: {
        include: {
          group: true,
          studyCase: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Participants</h1>
        <p className="text-slate-500 mt-1">Liste des 50 derniers participants</p>
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
              {participants.map((p) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
