"use client";

import { useState } from "react";
import Link from "next/link";

type OrdenRow = {
  id: string;
  numero: number;
  fecha_ingreso: string;
  marca: string | null;
  modelo: string | null;
  clientes: { razon_social: string } | null;
};

type Props = {
  ordenes: OrdenRow[];
};

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export default function BuscadorOrdenes({ ordenes }: Props) {
  const [search, setSearch] = useState("");

  const filtered = ordenes.filter((o) => {
    const q = search.toLowerCase();
    return (
      String(o.numero).includes(q) ||
      (o.clientes?.razon_social ?? "").toLowerCase().includes(q) ||
      (o.marca ?? "").toLowerCase().includes(q) ||
      (o.modelo ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Buscar por número de orden, cliente o equipo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        autoFocus
      />

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {search
            ? "No se encontraron órdenes con ese criterio."
            : "No hay órdenes pendientes de entrega."}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                  N°
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ingreso
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-indigo-600">
                    #{o.numero}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {o.clientes?.razon_social ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {[o.marca, o.modelo].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {fmtDate(o.fecha_ingreso)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/ordenes/${o.id}/salida`}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400">
        {filtered.length} de {ordenes.length} orden
        {ordenes.length !== 1 ? "es" : ""} pendiente
        {ordenes.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
