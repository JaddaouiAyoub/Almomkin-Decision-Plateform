import { prisma } from "@/lib/prisma";
import { updateGroup } from "@/actions/admin.actions";
import { redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await prisma.experimentGroup.findUnique({ where: { id } });
  
  if (!group) return redirect("/admin/groups");

  async function handleSubmit(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "true";

    await updateGroup(id, { name, description, isActive });
    redirect("/admin/groups");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/groups" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Modifier le Groupe {group.label}</h1>
          <p className="text-slate-500 mt-1">Gérez les informations du groupe expérimental</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nom du groupe</label>
            <input 
              type="text" 
              id="name"
              name="name" 
              defaultValue={group.name} 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
            <textarea 
              id="description"
              name="description" 
              defaultValue={group.description || ""} 
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center h-5">
              <input 
                id="isActive"
                name="isActive" 
                type="checkbox" 
                value="true"
                defaultChecked={group.isActive}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="isActive" className="text-sm font-medium text-slate-900">Groupe actif</label>
              <p className="text-xs text-slate-500">Si décoché, ce groupe ne sera plus attribué aux nouveaux participants.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/admin/groups" className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
              Annuler
            </Link>
            <button type="submit" className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
              <Save size={16} />
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
