"use server";

import { createClient } from "@/lib/supabase/server";

export type BarPoint = { mes: string; ingresadas: number };

export type UltimaOrden = {
  id: string;
  numero: number;
  fecha_ingreso: string;
  marca: string | null;
  modelo: string | null;
  cliente: string;
};

export type DashboardData = {
  enTaller: number;
  naranja: number;
  rojo: number;
  ingresadasEsteMes: number;
  entregadasEsteMes: number;
  barData: BarPoint[];
  ultimasOrdenes: UltimaOrden[];
};

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function getLast12Months(): { key: string; label: string }[] {
  const result = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    result.push({ key, label });
  }
  return result;
}

function cutoff(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  // Determinar si filtrar por empresa o no (superadmin ve todo)
  let empresa_id: string | null = null;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("empresa_id, rol")
      .eq("id", user.id)
      .single();
    if (perfil && perfil.rol !== "superadmin") {
      empresa_id = perfil.empresa_id;
    }
  }

  // Helper: agrega filtro de empresa si corresponde
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emp = (q: any) => (empresa_id ? q.eq("empresa_id", empresa_id) : q);

  const now = new Date();
  const primerDiaMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const corte60  = cutoff(60);
  const corte120 = cutoff(120);
  const months   = getLast12Months();
  const startBar = months[0].key + "-01";

  const [r_taller, r_naranja, r_rojo, r_ingresos, r_entregas, r_bar, r_ultimas] =
    await Promise.all([
      // En taller ahora
      emp(supabase.from("ordenes").select("id", { count: "exact", head: true }).eq("estado", "ingresado")),
      // Sin retirar +60d y -120d
      emp(supabase.from("ordenes").select("id", { count: "exact", head: true }).eq("estado", "ingresado").lte("fecha_ingreso", corte60).gt("fecha_ingreso", corte120)),
      // Sin retirar +120d
      emp(supabase.from("ordenes").select("id", { count: "exact", head: true }).eq("estado", "ingresado").lte("fecha_ingreso", corte120)),
      // Ingresadas este mes
      emp(supabase.from("ordenes").select("id", { count: "exact", head: true }).gte("fecha_ingreso", primerDiaMes)),
      // Entregadas este mes
      emp(supabase.from("ordenes").select("id", { count: "exact", head: true }).eq("estado", "entregado").gte("fecha_salida", primerDiaMes)),
      // Fechas de ingreso de los últimos 12 meses (para el gráfico)
      emp(supabase.from("ordenes").select("fecha_ingreso").gte("fecha_ingreso", startBar)),
      // Últimas 5 órdenes ingresadas
      emp(supabase.from("ordenes").select("id, numero, fecha_ingreso, marca, modelo, clientes:cliente_id(razon_social)").order("created_at", { ascending: false }).limit(5)),
    ]);

  // Agrupar por mes para el gráfico
  const countByMonth: Record<string, number> = {};
  for (const row of (r_bar.data ?? []) as { fecha_ingreso: string }[]) {
    const k = row.fecha_ingreso.slice(0, 7);
    countByMonth[k] = (countByMonth[k] ?? 0) + 1;
  }
  const barData: BarPoint[] = months.map(({ key, label }) => ({
    mes: label,
    ingresadas: countByMonth[key] ?? 0,
  }));

  const ultimasOrdenes: UltimaOrden[] = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r_ultimas.data ?? []) as any[]
  ).map((o) => ({
    id: o.id,
    numero: o.numero,
    fecha_ingreso: o.fecha_ingreso,
    marca: o.marca ?? null,
    modelo: o.modelo ?? null,
    cliente: (o.clientes as { razon_social: string } | null)?.razon_social ?? "—",
  }));

  return {
    enTaller:          r_taller.count  ?? 0,
    naranja:           r_naranja.count ?? 0,
    rojo:              r_rojo.count    ?? 0,
    ingresadasEsteMes: r_ingresos.count ?? 0,
    entregadasEsteMes: r_entregas.count ?? 0,
    barData,
    ultimasOrdenes,
  };
}
