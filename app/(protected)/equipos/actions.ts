"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Elimina un trabajo (soft delete). Como entrada y salida son la misma
// fila de `ordenes`, marcar activo=false oculta el trabajo completo
// (entrada + salida + items) de todas las listas, que filtran activo=true.
// Reversible; no deja huérfanos. RLS limita a la empresa en sesión.
export type EliminarResult = { ok: true } | { ok: false; error: string };

export async function eliminarOrden(id: string): Promise<EliminarResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ordenes")
    .update({ activo: false })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/equipos");
  return { ok: true };
}
