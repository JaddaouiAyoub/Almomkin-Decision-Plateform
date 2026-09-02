import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createQuestion } from "@/actions/admin.actions";
import { redirect } from "next/navigation";
import { QuestionOptionsEditor } from "@/components/admin/QuestionOptionsEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouvelle Question | ALMOMKIN TEST V1",
};

export default async function NewQuestionPage() {
  const activeCases = await prisma.studyCase.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  async function handleSubmit(formData: FormData) {
    "use server";
    const studyCaseId = formData.get("studyCaseId") as string;
    const text = formData.get("text") as string;
    const isActive = formData.get("isActive") === "true";
    const order = parseInt(formData.get("order") as string, 10);
    const type = formData.get("type") as "SINGLE_CHOICE" | "FREE_TEXT" | "SCALE";
    const stage = formData.get("stage") as "INITIAL_DECISION" | "JUSTIFICATION" | "INITIAL_CONFIDENCE" | "ALMOMKIN_ANALYSIS" | "FINAL_DECISION" | "FINAL_CONFIDENCE" | "ALMOMKIN_HELPED";
    const options = JSON.parse((formData.get("options") as string) || "[]");

    await createQuestion({ studyCaseId, text, isActive, order, type, stage, options });
    redirect("/admin/questions");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/questions" 
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Nouvelle Question
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Créez une nouvelle question et définissez ses options de réponse.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <form action={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="studyCaseId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Cas d'étude associé
              </label>
              <select
                id="studyCaseId"
                name="studyCaseId"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              >
                <option value="">Sélectionnez un cas d'étude...</option>
                {activeCases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="text" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Texte de la question
              </label>
              <textarea
                id="text"
                name="text"
                required
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                placeholder="Ex: Quelle est la principale cause de..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type de question</label>
              <select id="type" name="type" defaultValue="SINGLE_CHOICE" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
                <option value="SINGLE_CHOICE">Choix unique</option><option value="FREE_TEXT">Texte libre</option><option value="SCALE">Échelle</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="stage" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Étape du parcours</label>
              <select id="stage" name="stage" defaultValue="INITIAL_DECISION" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
                <option value="INITIAL_DECISION">Décision initiale</option><option value="JUSTIFICATION">Pourquoi ?</option><option value="INITIAL_CONFIDENCE">Confiance initiale</option><option value="ALMOMKIN_ANALYSIS">Analyse ALMOMKIN</option><option value="FINAL_DECISION">Nouvelle décision</option><option value="FINAL_CONFIDENCE">Nouvelle confiance</option><option value="ALMOMKIN_HELPED">ALMOMKIN a-t-il aidé ?</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="order" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ordre d'affichage
              </label>
              <input
                type="number"
                id="order"
                name="order"
                defaultValue={0}
                required
                min={0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-center">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Statut
              </label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  value="true"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:ring-offset-slate-800"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                  Question active (visible)
                </label>
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                Options de réponse
              </h3>
              
              <QuestionOptionsEditor />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
            <Link
              href="/admin/questions"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
