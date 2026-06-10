"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  tecnicos: string[];
  defaults: {
    q?: string;
    estado?: string;
    tecnico?: string;
    desde?: string;
    hasta?: string;
  };
};

export default function FiltrosConsultas({ tecnicos, defaults }: Props) {
  const [q, setQ] = useState(defaults.q ?? "");
  const [estado, setEstado] = useState(defaults.estado ?? "");
  const [tecnico, setTecnico] = useState(defaults.tecnico ?? "");
  const [desde, setDesde] = useState(defaults.desde ?? "");
  const [hasta, setHasta] = useState(defaults.hasta ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function buildParams(overrides: Record<string, string> = {}) {
    const p = new URLSearchParams();
    const all: Record<string, string> = { q, estado, tecnico, desde, hasta, ...overrides };
    Object.entries(all).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString();
  }

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => router.push(`/consultas?${buildParams({ page: "1" })}`));
  }

  function handleLimpiar() {
    setQ(""); setEstado(""); setTecnico(""); setDesde(""); setHasta("");
    startTransition(() => router.push("/consultas"));
  }

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form
      onSubmit={handleBuscar}
      className="bg-white rounded-lg border border-gray-200 p-5 space-y-4"
    >
      {/* Búsqueda general */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Buscar
        </label>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="N° orden, cliente, marca, modelo o número de serie..."
          className={inputCls}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estado */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className={inputCls}
          >
            <option value="">Todas</option>
            <option value="ingresado">Ingresado</option>
            <option value="entregado">Entregado</option>
          </select>
        </div>

        {/* Técnico */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Técnico
          </label>
          <select
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            className={inputCls}
          >
            <option value="">Todos</option>
            {tecnicos.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Ingreso desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Ingreso hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Buscando..." : "Buscar"}
        </button>
        <button
          type="button"
          onClick={handleLimpiar}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
