import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosConsultas from "@/components/consultas/FiltrosConsultas";
import TablaOrdenes from "@/components/consultas/TablaOrdenes";

type SP = { [k: string]: string | undefined };

const PAGE_SIZE = 25;
const VALID_SORT = ["numero", "fecha_ingreso", "fecha_salida", "estado"];

export default async function EquiposPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const params = await searchParams;
  const {
    q,
    estado,
    tecnico,
    desde,
    hasta,
    sort = "numero",
    dir = "desc",
    page = "1",
  } = params;

  const supabase = await createClient();
  const pageNum = Math.max(1, parseInt(page));
  const sortCol = VALID_SORT.includes(sort) ? sort : "numero";
  const ascending = dir === "asc";

  // Técnicos para el filtro
  const { data: tecnicosRows } = await supabase
    .from("tecnicos")
    .select("nombre")
    .eq("activo", true)
    .order("nombre");

  // Una fila por trabajo (orden). El estado ingresado/entregado distingue
  // Pendiente/Entregado. activo=true excluye las entradas eliminadas.
  let query = supabase
    .from("ordenes")
    .select(
      `id, numero, estado, marca, modelo, numero_serie,
       fecha_ingreso, fecha_salida, tecnico,
       clientes:cliente_id (razon_social)`,
      { count: "exact" }
    )
    .eq("activo", true);

  // Búsqueda general
  if (q?.trim()) {
    const qTrim = q.trim();
    if (/^\d+$/.test(qTrim)) {
      query = query.eq("numero", parseInt(qTrim));
    } else {
      const { data: matchClientes } = await supabase
        .from("clientes")
        .select("id")
        .ilike("razon_social", `%${qTrim}%`);
      const ids = matchClientes?.map((c) => c.id) ?? [];
      const orParts = [
        `marca.ilike.%${qTrim}%`,
        `modelo.ilike.%${qTrim}%`,
        `numero_serie.ilike.%${qTrim}%`,
      ];
      if (ids.length > 0) orParts.push(`cliente_id.in.(${ids.join(",")})`);
      query = query.or(orParts.join(","));
    }
  }

  if (estado) query = query.eq("estado", estado);
  if (tecnico?.trim()) query = query.ilike("tecnico", `%${tecnico.trim()}%`);
  if (desde) query = query.gte("fecha_ingreso", desde);
  if (hasta) query = query.lte("fecha_ingreso", hasta);

  query = query
    .order(sortCol, { ascending })
    .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1);

  const { data: ordenes, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Equipos</h1>

      {/* Botones grandes de alta (reutilizan los formularios existentes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/ingresos/nuevo"
          className="flex items-center justify-center gap-2 px-6 py-5 bg-indigo-600 text-white text-base font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Registrar entrada de equipo
        </Link>
        <Link
          href="/ordenes/registrar"
          className="flex items-center justify-center gap-2 px-6 py-5 bg-green-600 text-white text-base font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Registrar salida de equipo
        </Link>
      </div>

      {/* Buscador / filtro (reutilizado de Consultas) */}
      <FiltrosConsultas
        tecnicos={tecnicosRows?.map((t) => t.nombre) ?? []}
        defaults={{ q, estado, tecnico, desde, hasta }}
        basePath="/equipos"
      />

      {/* Listado: una fila por trabajo con estado */}
      <TablaOrdenes
        ordenes={(ordenes as Parameters<typeof TablaOrdenes>[0]["ordenes"]) ?? []}
        sort={sortCol}
        dir={dir}
        page={pageNum}
        totalPages={totalPages}
        total={count ?? 0}
        searchParams={params}
        basePath="/equipos"
      />
    </div>
  );
}
