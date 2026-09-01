import { prisma } from "@/lib/prisma";
import { calculateStats, getDecisionTimeDistribution, getConfidenceDistribution } from "@/lib/statistics/calculateStats";
import { formatDecisionTime } from "@/lib/utils";
import { Users, Clock, ShieldCheck, CheckCircle2, Filter, ArrowUpRight } from "lucide-react";
import { DashboardCharts } from "@/components/charts/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const params = await searchParams;
  const selectedCaseId = params.caseId || "";

  const experiment = await prisma.experiment.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      studyCases: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!experiment) {
    return (
      <div className="p-8 text-center text-slate-500">
        Aucune expérience active trouvée.
      </div>
    );
  }

  const [stats, timeDistribution, confidenceDistribution] = await Promise.all([
    calculateStats(experiment.id, selectedCaseId || undefined),
    getDecisionTimeDistribution(experiment.id),
    getConfidenceDistribution(experiment.id),
  ]);

  const selectedCase = experiment.studyCases.find((studyCase) => studyCase.id === selectedCaseId);

  const kpis = [
    {
      label: "Participants",
      value: String(stats.totalParticipants),
      helper: `${stats.totalResponses} réponses enregistrées`,
      icon: Users,
      accent: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Taux de complétion",
      value: `${stats.completionRate}%`,
      helper: `${stats.completedSessions} sessions terminées`,
      icon: CheckCircle2,
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Temps moyen",
      value: formatDecisionTime(stats.avgDecisionTimeMs),
      helper: "décision globale",
      icon: Clock,
      accent: "text-amber-600 bg-amber-50",
    },
    {
      label: "Confiance moyenne",
      value: `${stats.avgConfidence} / 10`,
      helper: "niveau de confiance",
      icon: ShieldCheck,
      accent: "text-cyan-600 bg-cyan-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">Vue d’ensemble</h1>
          <p className="mt-2 text-slate-500">
            Expérience : <span className="font-semibold text-slate-700">{experiment.name}</span>
          </p>
        </div>

        <form method="GET" action="/admin" className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <Filter size={15} className="text-slate-400" />
            <select
              name="caseId"
              defaultValue={selectedCaseId}
              className="bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="">Tous les cas</option>
              {experiment.studyCases.map((studyCase) => (
                <option key={studyCase.id} value={studyCase.id}>
                  {studyCase.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Appliquer
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Focus</p>
            <h2 className="mt-1 text-xl font-semibold">
              {selectedCase ? selectedCase.title : "Vue globale de l’expérience"}
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
            <ArrowUpRight size={14} />
            {selectedCase ? "Cas sélectionné" : "Tous les cas"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, helper, icon: Icon, accent }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2 ${accent}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-2 text-xs text-slate-400">{helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Comparaison</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Répartition par groupe</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="badge-group-a">Groupe A</span>
                <span className="text-sm text-slate-500">{stats.groupA.participantCount} participants</span>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Temps moyen</span>
                  <strong className="text-slate-900">{formatDecisionTime(stats.groupA.avgDecisionTimeMs)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confiance</span>
                  <strong className="text-slate-900">{stats.groupA.avgConfidence} / 10</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Réponses</span>
                  <strong className="text-slate-900">{stats.groupA.responseCount}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="badge-group-b">Groupe B</span>
                <span className="text-sm text-slate-500">{stats.groupB.participantCount} participants</span>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Temps moyen</span>
                  <strong className="text-slate-900">{formatDecisionTime(stats.groupB.avgDecisionTimeMs)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confiance</span>
                  <strong className="text-slate-900">{stats.groupB.avgConfidence} / 10</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Réponses</span>
                  <strong className="text-slate-900">{stats.groupB.responseCount}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Synthèse</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Points clés</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">Groupe A</p>
              <p className="mt-2 text-sm text-slate-700">
                Temps moyen : <strong>{formatDecisionTime(stats.groupA.avgDecisionTimeMs)}</strong>
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-600">Groupe B</p>
              <p className="mt-2 text-sm text-slate-700">
                Temps moyen : <strong>{formatDecisionTime(stats.groupB.avgDecisionTimeMs)}</strong>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Réponses</p>
              <p className="mt-2 text-sm text-slate-700">
                {stats.totalResponses} réponses collectées pour {selectedCase ? selectedCase.title : "tous les cas"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 space-y-6">
        {stats.perQuestion.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            Aucune question n’est disponible pour ce filtre.
          </div>
        ) : (
          stats.perQuestion.map((q, idx) => (
            <div key={q.questionId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Question {idx + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{q.questionText}</h3>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {q.caseTitle}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="badge-group-a">Groupe A</span>
                    <span className="text-xs text-slate-500">{q.totalResponses} réponses</span>
                  </div>
                  <div className="space-y-3">
                    {q.groupA.answerDistribution.map((ans) => (
                      <div key={ans.optionId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{ans.label}. {ans.text}</span>
                          <span className="text-slate-500">{ans.percentage}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${ans.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="badge-group-b">Groupe B</span>
                    <span className="text-xs text-slate-500">{q.totalResponses} réponses</span>
                  </div>
                  <div className="space-y-3">
                    {q.groupB.answerDistribution.map((ans) => (
                      <div key={ans.optionId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{ans.label}. {ans.text}</span>
                          <span className="text-slate-500">{ans.percentage}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-cyan-500" style={{ width: `${ans.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Graphiques</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Analyse comportementale</h3>
        </div>
        <DashboardCharts stats={stats} timeDistribution={timeDistribution} confidenceDistribution={confidenceDistribution} />
      </div>
    </div>
  );
}
