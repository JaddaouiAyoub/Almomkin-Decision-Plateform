import { prisma } from "@/lib/prisma";
import { Edit, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await prisma.experimentGroup.findMany({
    include: {
      _count: {
        select: { sessions: true, responses: true },
      },
    },
    orderBy: { label: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Groupes Expérimentaux</h1>
          <p className="text-slate-500 mt-1">Gestion des groupes A/B</p>
        </div>
        <div className="text-right hidden sm:block">
          <button disabled className="btn-primary w-full sm:w-auto text-sm px-4 py-2 opacity-50 cursor-not-allowed">
            <Plus size={16} />
            Nouveau Groupe
          </button>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Les groupes A/B sont fixes pour ce modèle d'expérience.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={group.label === "A" ? "badge-group-a" : "badge-group-b"}>
                    Label {group.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${group.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {group.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{group.name}</h3>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/groups/${group.id}/edit`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Edit size={16} />
                </Link>
              </div>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 h-10">{group.description}</p>
            
            <div className="flex gap-6 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Sessions</p>
                <p className="font-semibold text-slate-900">{group._count.sessions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Réponses</p>
                <p className="font-semibold text-slate-900">{group._count.responses}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
