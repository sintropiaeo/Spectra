import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FiltrosRemitos from "@/components/remitos/FiltrosRemitos";
import TablaRemitos from "@/components/remitos/TablaRemitos";

type SP = { [k: string]: string | undefined };

const PAGE_SIZE = 30;

export default async function RemitosPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const params = await searchParams;
  const { q, desde, hasta, page = "1" } = params;

  const supabase = await createClient();
  const pageNum = Math.max(1, parseInt(page));

  let query = supabase
    .from("remitos_manuales")
    .select(
      "id, fecha, razon_social, cuit, numero_fisico, cantidad, detalle",
      { count: "exact" }
    );

  // Búsqueda por nombre (razón social snapshot), CUIT o N° físico
  if (q?.trim()) {
    const t = q.trim();
    query = query.or(
      `razon_social.ilike.%${t}%,cuit.ilike.%${t}%,numero_fisico.ilike.%${t}%`
    );
  }

  if (desde) query = query.gte("fecha", desde);
  if (hasta) query = query.lte("fecha", hasta);

  query = query
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1);

  const { data: remitos, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Remitos</h1>
        <Link
          href="/remitos/nuevo"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          Nuevo remito
        </Link>
      </div>

      <p className="text-sm text-gray-500 -mt-2">
        Impresión de datos variables sobre el papel pre-impreso con CAI. El N° de
        remito físico es solo para búsqueda interna y no se imprime.
      </p>

      <FiltrosRemitos defaults={{ q, desde, hasta }} />

      <TablaRemitos
        remitos={remitos ?? []}
        page={pageNum}
        totalPages={totalPages}
        total={count ?? 0}
        searchParams={params}
      />
    </div>
  );
}
