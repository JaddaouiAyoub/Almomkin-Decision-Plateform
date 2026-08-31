import { Metadata } from "next";
import Link from "next/link";
import { Plus, Edit, Trash2, HelpCircle, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteQuestion } from "@/actions/admin.actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestion des Questions | ALMOMKIN TEST V1",
};

export default async function QuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: [
      { studyCase: { title: "asc" } },
      { order: "asc" }
    ],
    include: {
      studyCase: {
        select: {
          title: true,
        },
      },
      options: {
        orderBy: {
          order: "asc",
        },
      },
      _count: {
        select: {
          responses: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-600" />
            Questions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les questions et leurs options de réponse.
          </p>
        </div>
        
        <Link href="/admin/questions/new" className="btn-primary inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          <Plus className="h-4 w-4" />
          Nouvelle Question
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
            <div className="p-5 flex-grow">
              <div className="flex justify-between items-start gap-4 mb-3">
                <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {question.studyCase.title}
                </span>
                
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                  question.isActive 
                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-900/50" 
                    : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
                )}>
                  {question.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
              
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 line-clamp-3">
                {question.text}
              </h3>

              <div className="space-y-2 mt-4">
                {question.options.map((option) => (
                  <div key={option.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                      {option.label}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {option.text}
                    </span>
                  </div>
                ))}
                {question.options.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Aucune option de réponse</p>
                )}
              </div>
            </div>
            
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <MessageSquare className="h-4 w-4" />
                <span>{question._count.responses} réponse{question._count.responses !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={`/admin/questions/${question.id}/edit`} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Modifier">
                  <Edit className="h-4 w-4" />
                </Link>
                <form action={async () => {
                  "use server";
                  await deleteQuestion(question.id);
                }}>
                  <button type="submit" className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
            <HelpCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Aucune question</h3>
            <p className="text-slate-500 mt-1">Commencez par ajouter votre première question.</p>
            <Link href="/admin/questions/new" className="btn-primary mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
              <Plus className="h-4 w-4" />
              Nouvelle Question
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
