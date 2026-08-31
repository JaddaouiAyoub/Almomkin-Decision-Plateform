"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { OverallStats } from "@/types";

interface ChartProps {
  stats: OverallStats;
  timeDistribution: { label: string; groupA: number; groupB: number; total: number }[];
  confidenceDistribution: { score: number; groupA: number; groupB: number; total: number }[];
}

export function DashboardCharts({ stats, timeDistribution, confidenceDistribution }: ChartProps) {
  // Data for Average Comparison
  const avgData = [
    {
      name: "Temps Moyen (s)",
      GroupA: Math.round(stats.groupA.avgDecisionTimeMs / 1000),
      GroupB: Math.round(stats.groupB.avgDecisionTimeMs / 1000),
    },
    {
      name: "Confiance (/10)",
      GroupA: stats.groupA.avgConfidence,
      GroupB: stats.groupB.avgConfidence,
    }
  ];

  // Data for Answers Distribution
  const answerData = stats.groupA.answerDistribution.map((ans, idx) => ({
    name: `Option ${ans.label}`,
    GroupA: ans.percentage,
    GroupB: stats.groupB.answerDistribution[idx]?.percentage || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
          <p className="font-medium mb-2 text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Chart 1: Répartition des Réponses */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">
          Répartition des réponses (%)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={answerData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="GroupA" fill="#6366f1" radius={[4, 4, 0, 0]} name="Groupe A" />
              <Bar dataKey="GroupB" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Groupe B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Comparaison des Moyennes */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">
          Comparaison Temps / Confiance
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={avgData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="GroupA" fill="#6366f1" radius={[4, 4, 0, 0]} name="Groupe A" maxBarSize={60} />
              <Bar dataKey="GroupB" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Groupe B" maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Distribution des temps de décision */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">
          Distribution des temps de décision
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="groupA" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Groupe A" />
              <Line type="monotone" dataKey="groupB" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} name="Groupe B" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Distribution Confiance */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">
          Distribution Niveau de Confiance
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={confidenceDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="score" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="groupA" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Groupe A" />
              <Line type="monotone" dataKey="groupB" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} name="Groupe B" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
