import { Metadata } from "next";
import Link from "next/link";
import { deleteStudyCase } from "@/actions/admin.actions";
import { 
  Plus, 
  FileText, 
  MessageSquare, 
  Users, 
  Edit, 
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ListOrdered
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestion des Cas d'Étude | ALMOMKIN TEST V1",
  description: "Gérer les cas d'étude et leurs variantes de contenu",
};

export default async function CasesPage() {
  const cases = await prisma.studyCase.findMany({
    orderBy: {
      order: 'asc'
    },
    include: {
      groupContents: true,
      _count: {
        select: {
          questions: true,
          sessions: true,
          responses: true,
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Cas d'Étude
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les cas, leurs questions et leurs contenus par groupe.
          </p>
        </div>
        <Link href="/admin/cases/new" className="btn-primary flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nouveau Cas
        </Link>
      </div>

      {/* Cases List */}
      <div className="space-y-6">
        {cases.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Aucun cas d'étude</h3>
            <p className="text-slate-500 mb-4">Commencez par créer votre premier cas d'étude.</p>
            <Link href="/admin/cases/new" className="btn-primary inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
              Nouveau Cas
            </Link>
          </div>
        ) : (
          cases.map((studyCase) => {
            const groupA = studyCase.groupContents.find(g => g.groupLabel === "A");
            const groupB = studyCase.groupContents.find(g => g.groupLabel === "B");

            return (
              <div 
                key={studyCase.id} 
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Case Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {studyCase.title}
                      </h3>
                      {studyCase.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <XCircle className="w-3.5 h-3.5" />
                          Inactif
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <ListOrdered className="w-3.5 h-3.5" />
                        Ordre: {studyCase.order}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Créé le {formatDate(studyCase.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/cases/${studyCase.id}/edit`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Modifier">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <form action={async () => {
                      "use server";
                      await deleteStudyCase(studyCase.id);
                    }}>
                      <button type="submit" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Case Stats */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-semibold text-slate-900">{studyCase._count.questions}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Questions
                    </span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-semibold text-slate-900">{studyCase._count.sessions}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Sessions
                    </span>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-semibold text-slate-900">{studyCase._count.responses}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Réponses
                    </span>
                  </div>
                </div>

                {/* Case Content Variants */}
                <div className="p-5">
                  <h4 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    Variantes de contenu
                  </h4>
                  
                  {studyCase.groupContents.length === 0 ? (
                    <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
                      Aucun contenu n'a encore été défini pour ce cas.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Group A Content */}
                      <div className="border border-indigo-100 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100 flex items-center gap-2">
                          <span className="badge-group-a px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">Groupe A</span>
                        </div>
                        <div className="p-4 bg-white text-sm text-slate-700 whitespace-pre-wrap flex-grow">
                          {groupA ? (
                            <p className="line-clamp-4">{groupA.content}</p>
                          ) : (
                            <span className="text-slate-400 italic">Contenu non défini</span>
                          )}
                        </div>
                      </div>

                      {/* Group B Content */}
                      <div className="border border-cyan-100 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-cyan-50/50 px-4 py-2 border-b border-cyan-100 flex items-center gap-2">
                          <span className="badge-group-b px-2 py-0.5 rounded text-xs font-semibold bg-cyan-100 text-cyan-700">Groupe B</span>
                        </div>
                        <div className="p-4 bg-white text-sm text-slate-700 whitespace-pre-wrap flex-grow">
                          {groupB ? (
                            <p className="line-clamp-4">{groupB.content}</p>
                          ) : (
                            <span className="text-slate-400 italic">Contenu non défini</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
