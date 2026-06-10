import Link from "next/link";

type OrdenRow = {
  id: string;
  numero: number;
  estado: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  fecha_ingreso: string;
  fecha_salida: string | null;
  tecnico: string | null;
  clientes: { razon_social: string } | null;
};

type SearchParams = Record<string, string | undefined>;

type Props = {
  ordenes: OrdenRow[];
  sort: string;
  dir: string;
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

function buildUrl(params: SearchParams, overrides: SearchParams = {}): string {
  const p = new URLSearchParams();
  const merged = { ...params, ...overrides };
  Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v); });
  return `/consultas?${p.toString()}`;
}

function EstadoBadge({ estado }: { estado: string }) {
  const cls =
    estado === "entregado"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {estado}
    </span>
  );
}

function SortTh({
  label,
  col,
  sort,
  dir,
  params,
}: {
  label: string;
  col: string;
  sort: string;
  dir: string;
  params: SearchParams;
}) {
  const active = sort === col;
  const newDir = active && dir === "desc" ? "asc" : "desc";
  const href = buildUrl(params, { sort: col, dir: newDir, page: "1" });
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
      <Link href={href} className="flex items-center gap-1 hover:text-gray-800 transition-colors">
        {label}
        <span className={`text-xs ${active ? "text-indigo-600" : "text-gray-300"}`}>
          {active ? (dir === "desc" ? "↓" : "↑") : "↕"}
        </span>
      </Link>
    </th>
  );
}

export default function TablaOrdenes({
  ordenes,
  sort,
  dir,
  page,
  totalPages,
  total,
  searchParams,
}: Props) {
  if (ordenes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-lg border border-gray-200">
        No se encontraron órdenes con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortTh label="N°" col="numero" sort={sort} dir={dir} params={searchParams} />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N° serie</th>
              <SortTh label="Estado" col="estado" sort={sort} dir={dir} params={searchParams} />
              <SortTh label="Ingreso" col="fecha_ingreso" sort={sort} dir={dir} params={searchParams} />
              <SortTh label="Salida" col="fecha_salida" sort={sort} dir={dir} params={searchParams} />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Técnico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordenes.map((o) => (
              <tr
                key={o.id}
                className="hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link href={`/consultas/${o.id}`} className="font-bold text-indigo-600 hover:underline">
                    #{o.numero}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link href={`/consultas/${o.id}`} className="block hover:text-indigo-600">
                    {o.clientes?.razon_social ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  <Link href={`/consultas/${o.id}`} className="block">
                    {[o.marca, o.modelo].filter(Boolean).join(" ") || "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  <Link href={`/consultas/${o.id}`} className="block">
                    {o.numero_serie ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/consultas/${o.id}`} className="block">
                    <EstadoBadge estado={o.estado} />
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 tabular-nums">
                  <Link href={`/consultas/${o.id}`} className="block">
                    {fmtDate(o.fecha_ingreso)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500 tabular-nums">
                  <Link href={`/consultas/${o.id}`} className="block">
                    {fmtDate(o.fecha_salida)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  <Link href={`/consultas/${o.id}`} className="block">
                    {o.tecnico ?? "—"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {total} resultado{total !== 1 ? "s" : ""} ·{" "}
          página {page} de {totalPages}
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
