import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { calculateStats, getDecisionTimeDistribution, getConfidenceDistribution } from "@/lib/statistics/calculateStats";
import { formatDecisionTime } from "@/lib/utils";
import { Users, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DashboardCharts } from "@/components/charts/DashboardCharts";

// Forcing dynamic rendering to always show fresh stats
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Get active experiment
  const experiment = await prisma.experiment.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!experiment) {
    return (
      <div className="p-8 text-center text-slate-500">
        Aucune expérience active trouvée.
      </div>
    );
  }

  const [stats, timeDistribution, confidenceDistribution] = await Promise.all([
    calculateStats(experiment.id),
    getDecisionTimeDistribution(experiment.id),
    getConfidenceDistribution(experiment.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">
          Statistiques en temps réel pour l'expérience : <span className="font-medium text-slate-700">{experiment.name}</span>
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <Users size={18} />
            <h3 className="text-sm font-medium">Total Participants</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalParticipants}</div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <CheckCircle2 size={18} />
            <h3 className="text-sm font-medium">Taux de complétion</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.completionRate}%</div>
          <p className="text-xs text-slate-400 mt-1">{stats.completedSessions} sessions terminées</p>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <Clock size={18} />
            <h3 className="text-sm font-medium">Temps de décision moyen</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatDecisionTime(stats.avgDecisionTimeMs)}</div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-2 text-slate-500">
            <ShieldCheck size={18} />
            <h3 className="text-sm font-medium">Confiance moyenne</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.avgConfidence} <span className="text-lg font-normal text-slate-400">/ 10</span></div>
        </div>
      </div>

      {/* A/B Comparison */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight uppercase text-sm">Comparaison A/B</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Group A Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-indigo-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge-group-a">GROUP A</span>
                <span className="font-medium text-slate-700">{stats.groupA.groupName}</span>
              </div>
              <span className="text-sm font-medium text-slate-500">{stats.groupA.participantCount} participants</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Temps moyen</p>
                  <p className="text-xl font-semibold text-slate-900">{formatDecisionTime(stats.groupA.avgDecisionTimeMs)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Confiance</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.groupA.avgConfidence} <span className="text-sm text-slate-400 font-normal">/ 10</span></p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Distribution des réponses</p>
                <div className="space-y-3">
                  {stats.groupA.answerDistribution.map(ans => (
                    <div key={ans.optionId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 font-medium text-sm flex items-center justify-center shrink-0">
                        {ans.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="truncate text-slate-600" title={ans.text}>{ans.text}</span>
                          <span className="font-medium text-slate-900 ml-2">{ans.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${ans.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Group B Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-cyan-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge-group-b">GROUP B</span>
                <span className="font-medium text-slate-700">{stats.groupB.groupName}</span>
              </div>
              <span className="text-sm font-medium text-slate-500">{stats.groupB.participantCount} participants</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Temps moyen</p>
                  <p className="text-xl font-semibold text-slate-900">{formatDecisionTime(stats.groupB.avgDecisionTimeMs)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Confiance</p>
                  <p className="text-xl font-semibold text-slate-900">{stats.groupB.avgConfidence} <span className="text-sm text-slate-400 font-normal">/ 10</span></p>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Distribution des réponses</p>
                <div className="space-y-3">
                  {stats.groupB.answerDistribution.map(ans => (
                    <div key={ans.optionId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 font-medium text-sm flex items-center justify-center shrink-0">
                        {ans.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="truncate text-slate-600" title={ans.text}>{ans.text}</span>
                          <span className="font-medium text-slate-900 ml-2">{ans.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${ans.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardCharts 
        stats={stats} 
        timeDistribution={timeDistribution} 
        confidenceDistribution={confidenceDistribution} 
      />
    </div>
  );
}
