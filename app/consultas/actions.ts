"use server";

import { createClient } from "@/lib/supabase/server";

const ACC_LABELS: Record<string, string> = {
  microfono: "Micrófono",
  fuente: "Fuente",
  cable: "Cable",
  pack: "Pack",
  antena: "Antena",
  cargador: "Cargador",
  crem: "Crem",
};

export async function getOrdenCompleto(ordenId: string) {
  const supabase = await createClient();

  const { data: orden, error } = await supabase
    .from("ordenes")
    .select(`
      id, numero, estado, marca, modelo, numero_serie, estacion,
      deficiencia, observaciones, entrego, quien_recibio, tecnico,
      fecha_ingreso, fecha_salida,
      moneda, aplica_iva, mostrar_cotizacion, cotizacion,
      empresa_id, cliente_id,
      clientes:cliente_id (
        id, razon_social, direccion, localidad, provincia,
        codigo_postal, telefono1, contacto
      ),
      accesorios_orden (
        microfono, fuente, cable, pack, antena, cargador, crem
      ),
      items_trabajo (
        cantidad, detalle, precio, importe
      )
    `)
    .eq("id", ordenId)
    .single();

  if (error || !orden) return null;

  const clienteId = orden.cliente_id as string;
  const numeroSerie = orden.numero_serie;

  const [{ data: historialCliente }, historialEquipoRes] = await Promise.all([
    supabase
      .from("ordenes")
      .select("id, numero, estado, marca, modelo, fecha_ingreso, fecha_salida")
      .eq("cliente_id", clienteId)
      .neq("id", ordenId)
      .order("numero", { ascending: false })
      .limit(10),
    numeroSerie
      ? supabase
          .from("ordenes")
          .select("id, numero, estado, tecnico, fecha_ingreso, fecha_salida")
          .eq("numero_serie", numeroSerie)
          .neq("id", ordenId)
          .order("numero", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as { id: string; numero: number; estado: string; tecnico: string | null; fecha_ingreso: string; fecha_salida: string | null }[] }),
  ]);

  const cliente = orden.clientes as {
    id: string; razon_social: string; direccion: string | null;
    localidad: string | null; provincia: string | null;
    codigo_postal: string | null; telefono1: string | null; contacto: string | null;
  };

  const accesorios = orden.accesorios_orden as Record<string, boolean> | null;
  const accesActivos = accesorios
    ? Object.entries(accesorios)
        .filter(([k, v]) => v && k in ACC_LABELS)
        .map(([k]) => ACC_LABELS[k])
    : [];

  return {
    orden: {
      id: orden.id,
      numero: orden.numero,
      estado: orden.estado,
      marca: orden.marca,
      modelo: orden.modelo,
      numero_serie: orden.numero_serie,
      estacion: orden.estacion,
      deficiencia: orden.deficiencia,
      observaciones: orden.observaciones,
      entrego: orden.entrego,
      quien_recibio: orden.quien_recibio,
      tecnico: orden.tecnico,
      fecha_ingreso: orden.fecha_ingreso,
      fecha_salida: orden.fecha_salida,
      moneda: (orden.moneda as string) ?? "USD",
      aplica_iva: (orden.aplica_iva as boolean) ?? false,
      cotizacion: orden.cotizacion as number | null,
    },
    cliente,
    accesorios: accesActivos,
    items: orden.items_trabajo as {
      cantidad: number | null; detalle: string | null;
      precio: number | null; importe: number | null;
    }[],
    historialCliente: historialCliente ?? [],
    historialEquipo: historialEquipoRes.data ?? [],
  };
}
