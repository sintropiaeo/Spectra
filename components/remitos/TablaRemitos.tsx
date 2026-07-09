"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRemito } from "@/app/(protected)/remitos/actions";
import ImprimirRemitoButton from "./ImprimirRemitoButton";

type RemitoRow = {
  id: string;
  fecha: string;
  razon_social: string | null;
  cuit: string | null;
  numero_fisico: string | null;
  cantidad: string | null;
  detalle: string | null;
};

type SearchParams = Record<string, string | undefined>;

type Props = {
  remitos: RemitoRow[];
  page: number;
  totalPages: number;
  total: number;
  searchParams: SearchParams;
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function truncate(s: string | null, n = 60) {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

function buildUrl(params: SearchParams, overrides: SearchParams = {}): string {
  const p = new URLSearchParams();
  const merged = { ...params, ...overrides };
  Object.entries(merged).forEach(([k, v]) => {
    if (v) p.set(k, v);
  });
  return `/remitos?${p.toString()}`;
}

export default function TablaRemitos({
  remitos,
  page,
  totalPages,
  total,
  searchParams,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(id: string, nombre: string | null) {
    if (
      !confirm(
        `¿Eliminar el remito de "${nombre || "sin nombre"}"?\nEsta acción no se puede deshacer.`
      )
    )
      return;
    startTransition(async () => {
      await deleteRemito(id);
      router.refresh();
    });
  }

  if (remitos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-lg border border-gray-200">
        No hay remitos cargados con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Razón social</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N° físico</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalle</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {remitos.map((r) => (
              <tr key={r.id} className="hover:bg-indigo-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-500 tabular-nums whitespace-nowrap">
                  {fmtDate(r.fecha)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link href={`/remitos/${r.id}/editar`} className="hover:text-indigo-600">
                    {r.razon_social || "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                  {r.numero_fisico || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">{r.cantidad || "—"}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs">{truncate(r.detalle)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <ImprimirRemitoButton remitoId={r.id} compact />
                    <Link
                      href={`/remitos/${r.id}/editar`}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.razon_social)}
                      disabled={isPending}
                      className="px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
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

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {total} remito{total !== 1 ? "s" : ""} · página {page} de {totalPages}
        </span>
        <div className="flex gap-1">
          {page > 1 && (
            <Link
              href={buildUrl(searchParams, { page: String(page - 1) })}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ← Anterior
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={buildUrl(searchParams, { page: String(page + 1) })}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Siguiente →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
