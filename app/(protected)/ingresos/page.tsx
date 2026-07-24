import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosIngresos from "@/components/ingresos/FiltrosIngresos";
import TablaIngresos from "@/components/ingresos/TablaIngresos";

type SP = { [k: string]: string | undefined };

const PAGE_SIZE = 30;

export default async function IngresosPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const params = await searchParams;
  const { q, desde, hasta, page = "1" } = params;

  const supabase = await createClient();
  const pageNum = Math.max(1, parseInt(page));

  let query = supabase
    .from("ordenes")
    .select(
      `id, numero, fecha_ingreso, marca, modelo, numero_serie,
       clientes:cliente_id ( razon_social )`,
      { count: "exact" }
    )
    .eq("estado", "ingresado")
    .eq("activo", true);

  // Búsqueda general (mismo criterio que Consultas)
  if (q?.trim()) {
    const t = q.trim();
    if (/^\d+$/.test(t)) {
      query = query.eq("numero", parseInt(t));
    } else {
      const { data: matchClientes } = await supabase
        .from("clientes")
        .select("id")
        .ilike("razon_social", `%${t}%`);
      const ids = matchClientes?.map((c) => c.id) ?? [];
      const orParts = [
        `marca.ilike.%${t}%`,
        `modelo.ilike.%${t}%`,
        `numero_serie.ilike.%${t}%`,
      ];
      if (ids.length > 0) orParts.push(`cliente_id.in.(${ids.join(",")})`);
      query = query.or(orParts.join(","));
    }
  }

  if (desde) query = query.gte("fecha_ingreso", desde);
  if (hasta) query = query.lte("fecha_ingreso", hasta);

  query = query
    .order("numero", { ascending: false })
    .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1);

  const { data: ingresos, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Entrada de equipos</h1>
        <Link
          href="/ingresos/nuevo"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          Registrar entrada de equipo
        </Link>
      </div>

      <p className="text-sm text-gray-500 -mt-2">
        Equipos ingresados pendientes de salida. Registrá una nueva entrada,
        editá o imprimí el comprobante de las existentes.
      </p>

      <FiltrosIngresos defaults={{ q, desde, hasta }} />

      <TablaIngresos
        ingresos={ingresos ?? []}
        page={pageNum}
        totalPages={totalPages}
        total={count ?? 0}
        searchParams={params}
      />
    </div>
  );
}
