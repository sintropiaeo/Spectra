"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FormState = { error: string } | { success: true } | null;

// ─── Helper: empresa_id del usuario actual ────────────────────
async function resolveEmpresaId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (perfil?.empresa_id) return { supabase, empresa_id: perfil.empresa_id };

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id")
    .limit(1)
    .single();

  if (!empresa) throw new Error("No hay empresas registradas.");
  return { supabase, empresa_id: empresa.id };
}

// ─── Config de empresa ────────────────────────────────────────
export async function upsertConfig(
  empresaId: string,
  _prev: unknown,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  const cotizacion = formData.get("cotizacion_dolar") as string;
  const iva = formData.get("iva") as string;

  const { error } = await supabase.from("config").upsert({
    empresa_id:      empresaId,
    nombre_empresa:  (formData.get("nombre_empresa") as string)?.trim() || null,
    direccion:       (formData.get("direccion") as string)?.trim() || null,
    cuit:            (formData.get("cuit") as string)?.trim() || null,
    cotizacion_dolar: cotizacion ? parseFloat(cotizacion) : null,
    iva:              iva ? parseFloat(iva) : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { success: true };
}

// ─── Técnicos ─────────────────────────────────────────────────
export async function createTecnico(
  nombre: string
): Promise<FormState> {
  if (!nombre.trim()) return { error: "El nombre es obligatorio." };
  try {
    const { supabase, empresa_id } = await resolveEmpresaId();
    const { error } = await supabase.from("tecnicos").insert({
      empresa_id,
      nombre: nombre.trim(),
    });
    if (error) return { error: error.message };
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/configuracion");
  revalidatePath("/ingresos");
  return { success: true };
}

export async function updateTecnico(
  id: string,
  nombre: string
): Promise<FormState> {
  if (!nombre.trim()) return { error: "El nombre es obligatorio." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("tecnicos")
    .update({ nombre: nombre.trim() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  revalidatePath("/ingresos");
  return { success: true };
}

export async function toggleTecnico(
  id: string,
  activo: boolean
): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tecnicos")
    .update({ activo })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/configuracion");
  revalidatePath("/ingresos");
  return { success: true };
}
