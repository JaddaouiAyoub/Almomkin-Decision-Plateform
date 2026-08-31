import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createStudyCase } from "@/actions/admin.actions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Nouveau Cas d'Étude | ALMOMKIN TEST V1",
  description: "Créer un nouveau cas d'étude",
};

export default function NewCasePage() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const isActive = formData.get("isActive") === "true";
    const order = parseInt(formData.get("order") as string, 10);
    const contentA = formData.get("contentA") as string;
    const contentB = formData.get("contentB") as string;

    await createStudyCase({ title, isActive, order, contentA, contentB });
    redirect("/admin/cases");
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/cases"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Nouveau Cas d'Étude
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Créer un nouveau cas et définir son contenu pour les deux groupes.
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Titre du cas</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="Ex: Cas d'étude sur l'anxiété..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="order" className="block text-sm font-medium text-slate-700">Ordre d'affichage</label>
            <input
              type="number"
              id="order"
              name="order"
              required
              defaultValue={0}
              min={0}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="true"
              defaultChecked
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
              Activer ce cas d'étude (visible par les participants)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Group A Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="badge-group-a px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700">Groupe A</span>
              <label htmlFor="contentA" className="text-sm font-medium text-slate-700">Contenu</label>
            </div>
            <textarea
              id="contentA"
              name="contentA"
              required
              rows={12}
              className="w-full px-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors resize-y"
              placeholder="Saisissez le contenu du cas pour le groupe A..."
            />
          </div>

          {/* Group B Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="badge-group-b px-2 py-0.5 rounded text-xs font-semibold bg-cyan-100 text-cyan-700">Groupe B</span>
              <label htmlFor="contentB" className="text-sm font-medium text-slate-700">Contenu</label>
            </div>
            <textarea
              id="contentB"
              name="contentB"
              required
              rows={12}
              className="w-full px-4 py-3 bg-cyan-50/30 border border-cyan-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors resize-y"
              placeholder="Saisissez le contenu du cas pour le groupe B..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            href="/admin/cases"
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Créer le cas
          </button>
        </div>
      </form>
    </div>
  );
}
