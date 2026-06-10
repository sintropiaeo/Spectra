"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTecnico,
  updateTecnico,
  toggleTecnico,
} from "@/app/configuracion/actions";
import { Tables } from "@/lib/database.types";

type Tecnico = Tables<"tecnicos">;

type Props = {
  tecnicos: Tecnico[];
};

export default function TecnicosPanel({ tecnicos }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Nuevo técnico
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // Edición inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddError(null);
    startTransition(async () => {
      const result = await createTecnico(newName.trim());
      if (result && "error" in result) {
        setAddError(result.error);
      } else {
        setNewName("");
        refresh();
      }
    });
  }

  function startEdit(t: Tecnico) {
    setEditingId(t.id);
    setEditName(t.nombre);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    setEditError(null);
    startTransition(async () => {
      const result = await updateTecnico(id, editName.trim());
      if (result && "error" in result) {
        setEditError(result.error);
      } else {
        setEditingId(null);
        refresh();
      }
    });
  }

  async function handleToggle(id: string, activo: boolean) {
    startTransition(async () => {
      await toggleTecnico(id, activo);
      refresh();
    });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Técnicos
      </h2>

      {/* Lista */}
      {tecnicos.length === 0 ? (
        <p className="text-sm text-gray-400">No hay técnicos cargados todavía.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {tecnicos.map((t) => (
            <li key={t.id} className={`py-3 flex items-center gap-3 ${isPending ? "opacity-60" : ""}`}>
              {editingId === t.id ? (
                // Modo edición
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(t.id)}
                    autoFocus
                    className="flex-1 px-2 py-1 border border-indigo-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(t.id)}
                    disabled={isPending}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  {editError && <p className="text-xs text-red-600">{editError}</p>}
                </div>
              ) : (
                // Modo normal
                <>
                  <div className="flex-1 flex items-center gap-2">
                    <span className={`text-sm font-medium ${t.activo ? "text-gray-900" : "text-gray-400 line-through"}`}>
                      {t.nombre}
                    </span>
                    {!t.activo && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        inactivo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(t.id, !t.activo)}
                      disabled={isPending}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors disabled:opacity-40 ${
                        t.activo
                          ? "text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                          : "text-green-600 hover:text-green-800 hover:bg-green-50"
                      }`}
                    >
                      {t.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Agregar técnico */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Agregar técnico
        </p>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre del técnico"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isPending || !newName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "..." : "Agregar"}
          </button>
        </form>
        {addError && <p className="text-xs text-red-600 mt-1">{addError}</p>}
      </div>
    </div>
  );
}
