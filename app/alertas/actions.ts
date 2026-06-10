"use server";

import { createClient } from "@/lib/supabase/server";

function cutoffDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function calcDias(fechaIngreso: string): number {
  const ingreso = new Date(fechaIngreso);
  const hoy = new Date();
  // Comparar solo fechas (sin hora) para evitar desfase de timezone
  ingreso.setHours(0, 0, 0, 0);
  hoy.setHours(0, 0, 0, 0);
  return Math.floor((hoy.getTime() - ingreso.getTime()) / (1000 * 60 * 60 * 24));
}

type NivelAlerta = "naranja" | "rojo";

function nivelAlerta(dias: number): NivelAlerta {
  return dias > 120 ? "rojo" : "naranja";
}

// Cuenta eficiente (solo HEAD) para el badge del sidebar y el dashboard
export async function getAlertasResumen() {
  const supabase = await createClient();
  const corte60  = cutoffDate(60);
  const corte120 = cutoffDate(120);

  const [{ count: naranja }, { count: rojo }] = await Promise.all([
    supabase
      .from("ordenes")
      .select("id", { count: "exact", head: true })
      .eq("estado", "ingresado")
      .lte("fecha_ingreso", corte60)
      .gt("fecha_ingreso", corte120),
    supabase
      .from("ordenes")
      .select("id", { count: "exact", head: true })
      .eq("estado", "ingresado")
      .lte("fecha_ingreso", corte120),
  ]);

  return {
    naranja: naranja ?? 0,
    rojo: rojo ?? 0,
    total: (naranja ?? 0) + (rojo ?? 0),
  };
}

// Lista completa para la página /alertas
export async function getAlertas() {
  const supabase = await createClient();
  const corte60 = cutoffDate(60);

  const { data } = await supabase
    .from("ordenes")
    .select(`
      id, numero, fecha_ingreso, marca, modelo, numero_serie,
      clientes:cliente_id (razon_social)
    `)
    .eq("estado", "ingresado")
    .lte("fecha_ingreso", corte60)
    .order("fecha_ingreso", { ascending: true });

  return (data ?? []).map((o) => {
    const dias = calcDias(o.fecha_ingreso);
    return {
      id: o.id,
      numero: o.numero,
      fecha_ingreso: o.fecha_ingreso,
      marca: o.marca,
      modelo: o.modelo,
      numero_serie: o.numero_serie,
      cliente: (o.clientes as { razon_social: string } | null)?.razon_social ?? "—",
      dias,
      nivel: nivelAlerta(dias),
    };
  });
}
