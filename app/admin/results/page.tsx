import { Suspense } from "react";
import { getResponsesForTable } from "@/lib/statistics/calculateStats";
import { formatDecisionTime, formatDate } from "@/lib/utils";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; group?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const groupLabel = params.group || undefined;
  
  const { responses, total, totalPages } = await getResponsesForTable({
    page,
    pageSize: 20,
    groupLabel,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Résultats & Export</h1>
          <p className="text-slate-500 mt-1">
            Total : <span className="font-medium text-slate-700">{total}</span> réponses enregistrées
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <form method="GET" action="/admin/results" className="flex items-center gap-2">
            <select 
              name="group"
              defaultValue={groupLabel || ""}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">Tous les groupes</option>
              <option value="A">Groupe A</option>
              <option value="B">Groupe B</option>
            </select>
            <button type="submit" className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
              Filtrer
            </button>
          </form>
          
          <a
            href="/api/admin/export"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            download
          >
            <Download size={16} />
            Export CSV
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="hidden sm:table-cell">Participant</th>
                <th>Groupe</th>
                <th>Cas</th>
                <th>Question</th>
                <th>Réponse</th>
                <th>Temps</th>
                <th>Confiance</th>
                <th className="hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {responses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    Aucune réponse trouvée.
                  </td>
                </tr>
              ) : (
                responses.map((res) => (
                  <tr key={res.responseId}>
                    <td className="hidden sm:table-cell font-mono text-xs text-slate-500" title={res.participantId}>
                      {res.participantId.substring(0, 8)}...
                    </td>
                    <td>
                      <span className={res.groupLabel === "A" ? "badge-group-a" : "badge-group-b"}>
                        {res.groupName}
                      </span>
                    </td>
                    <td className="text-slate-700 text-sm font-medium">
                      {res.caseTitle}
                    </td>
                    <td className="text-slate-600 text-sm max-w-[250px]">
                      <div className="font-medium text-slate-900 mb-1">
                        Q{res.questionOrder}
                      </div>
                      <details className="cursor-pointer group">
                        <summary className="truncate text-slate-500 group-hover:text-slate-700 transition-colors list-none">
                          <span className="underline decoration-slate-300 decoration-dashed underline-offset-4">Voir la question</span>
                        </summary>
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-wrap">
                          {res.questionText}
                        </div>
                      </details>
                    </td>
                    <td>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {res.answerLabel}
                        </span>
                        <details className="cursor-pointer group">
                          <summary className="truncate max-w-[120px] sm:max-w-[180px] list-none">
                            {res.answerText}
                          </summary>
                          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-wrap">
                            {res.answerText}
                          </div>
                        </details>
                      </div>
                    </td>
                    <td className="font-medium text-slate-700">
                      {formatDecisionTime(res.decisionTimeMs)}
                    </td>
                    <td>
                      {res.confidenceScore !== null ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-slate-700">{res.confidenceScore}</span>
                          <span className="text-slate-400 text-xs">/10</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="hidden md:table-cell text-slate-500 text-xs">
                      {formatDate(res.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Page {page} sur {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={page > 1 ? `/admin/results?page=${page - 1}${groupLabel ? `&group=${groupLabel}` : ''}` : '#'}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${page > 1 ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                Précédent
              </a>
              <a
                href={page < totalPages ? `/admin/results?page=${page + 1}${groupLabel ? `&group=${groupLabel}` : ''}` : '#'}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${page < totalPages ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
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
