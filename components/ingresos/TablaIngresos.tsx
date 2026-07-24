"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteIngreso } from "@/app/(protected)/ingresos/actions";
import DescargaComprobanteButton from "@/components/pdf/DescargaComprobanteButton";

type IngresoRow = {
  id: string;
  numero: number;
  fecha_ingreso: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  clientes: { razon_social: string } | { razon_social: string }[] | null;
};

type SearchParams = Record<string, string | undefined>;

type Props = {
  ingresos: IngresoRow[];
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

function razonSocial(c: IngresoRow["clientes"]): string {
  if (!c) return "—";
  const cli = Array.isArray(c) ? c[0] : c;
  return cli?.razon_social ?? "—";
}

function buildUrl(params: SearchParams, overrides: SearchParams = {}): string {
  const p = new URLSearchParams();
  const merged = { ...params, ...overrides };
  Object.entries(merged).forEach(([k, v]) => {
    if (v) p.set(k, v);
  });
  return `/ingresos?${p.toString()}`;
}

export default function TablaIngresos({
  ingresos,
  page,
  totalPages,
  total,
  searchParams,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(id: string, numero: number) {
    if (
      !confirm(
        `¿Eliminar la entrada N° ${numero}?\nSe ocultará del listado (borrado lógico, reversible desde la base).`
      )
    )
      return;
    startTransition(async () => {
      await deleteIngreso(id);
      router.refresh();
    });
  }

  if (ingresos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-lg border border-gray-200">
        No hay entradas de equipo con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N°</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingreso</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N° serie</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ingresos.map((o) => (
              <tr key={o.id} className="hover:bg-indigo-50/50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/ingresos/${o.id}/editar`} className="font-bold text-indigo-600 hover:underline">
                    #{o.numero}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 tabular-nums whitespace-nowrap">
                  {fmtDate(o.fecha_ingreso)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link href={`/ingresos/${o.id}/editar`} className="hover:text-indigo-600">
                    {razonSocial(o.clientes)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {[o.marca, o.modelo].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                  {o.numero_serie || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <DescargaComprobanteButton ordenId={o.id} numero={o.numero} compact />
                    <Link
                      href={`/ingresos/${o.id}/editar`}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(o.id, o.numero)}
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
          {total} entrada{total !== 1 ? "s" : ""} · página {page} de {totalPages}
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
