"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tables } from "@/lib/database.types";
import { deleteCliente } from "@/app/clientes/actions";

type Props = {
  clientes: Tables<"clientes">[];
};

export default function ClientesTable({ clientes }: Props) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = clientes.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.razon_social.toLowerCase().includes(q) ||
      (c.contacto ?? "").toLowerCase().includes(q)
    );
  });

  function handleDelete(id: string, razonSocial: string) {
    if (!confirm(`¿Eliminar "${razonSocial}"?\nEsta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteCliente(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Buscar por razón social o contacto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {search ? "No se encontraron resultados para tu búsqueda." : "No hay clientes cargados todavía."}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Razón social
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Localidad
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-gray-50 transition-colors ${isPending ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{c.razon_social}</td>
                  <td className="px-4 py-3 text-gray-500">{c.localidad ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.telefono1 ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.contacto ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/clientes/${c.id}/editar`}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, c.razon_social)}
                        disabled={isPending}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {clientes.length > 0 && (
        <p className="text-xs text-gray-400">
          {filtered.length} de {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
