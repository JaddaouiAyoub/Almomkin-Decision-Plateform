"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

type Option = { id?: string; label: string; text: string; order: number };

export function QuestionOptionsEditor({ initialOptions = [], allowEmpty = false }: { initialOptions?: Option[]; allowEmpty?: boolean }) {
  const [options, setOptions] = useState<Option[]>(initialOptions.length ? initialOptions : allowEmpty ? [] : [{ label: "A", text: "", order: 1 }, { label: "B", text: "", order: 2 }]);
  const update = (index: number, changes: Partial<Option>) => setOptions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item));
  const move = (index: number, direction: -1 | 1) => setOptions((items) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return next.map((item, itemIndex) => ({ ...item, order: itemIndex + 1 }));
  });

  return <div className="space-y-3">
    <input type="hidden" name="options" value={JSON.stringify(options.map((option, index) => ({ ...option, order: index + 1 })))} />
    {options.map((option, index) => <div key={`${option.id || "new"}-${index}`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <input value={option.label} onChange={(event) => update(index, { label: event.target.value })} maxLength={20} aria-label={`Libellé de l'option ${index + 1}`} className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" />
      <input value={option.text} onChange={(event) => update(index, { text: event.target.value })} required={!allowEmpty} placeholder="Texte de l'option" aria-label={`Texte de l'option ${index + 1}`} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800" />
      <button type="button" onClick={() => move(index, -1)} disabled={index === 0} title="Monter" className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-indigo-600 disabled:opacity-30"><ArrowUp size={16} /></button>
      <button type="button" onClick={() => move(index, 1)} disabled={index === options.length - 1} title="Descendre" className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-indigo-600 disabled:opacity-30"><ArrowDown size={16} /></button>
      <button type="button" onClick={() => setOptions((items) => items.filter((_, itemIndex) => itemIndex !== index))} disabled={!allowEmpty && options.length <= 2} title="Supprimer" className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-600 disabled:opacity-30"><Trash2 size={16} /></button>
    </div>)}
    <button type="button" onClick={() => setOptions((items) => [...items, { label: String.fromCharCode(65 + items.length), text: "", order: items.length + 1 }])} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"><Plus size={16} /> Ajouter une option</button>
  </div>;
}
