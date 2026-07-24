"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type FormState = { error: string } | null;

function str(formData: FormData, key: string): string | null {
  const val = (formData.get(key) as string)?.trim();
  return val || null;
}

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

  // superadmin: usar la única empresa existente por ahora
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id")
    .limit(1)
    .single();

  if (!empresa) throw new Error("No hay empresas registradas. Creá una desde Supabase.");
  return { supabase, empresa_id: empresa.id };
}

export async function createCliente(
  _prev: unknown,
  formData: FormData
): Promise<FormState> {
  const razon_social = str(formData, "razon_social");
  if (!razon_social) return { error: "La razón social es obligatoria." };

  try {
    const { supabase, empresa_id } = await resolveEmpresaId();

    const { error } = await supabase.from("clientes").insert({
      empresa_id,
      razon_social,
      direccion:     str(formData, "direccion"),
      provincia:     str(formData, "provincia"),
      localidad:     str(formData, "localidad"),
      codigo_postal: str(formData, "codigo_postal"),
      telefono1:     str(formData, "telefono1"),
      telefono2:     str(formData, "telefono2"),
      contacto:      str(formData, "contacto"),
      cuit:          str(formData, "cuit"),
      email:         str(formData, "email"),
      condicion_iva: str(formData, "condicion_iva"),
    });

    if (error) return { error: error.message };
  } catch (e) {
    return { error: (e as Error).message };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCliente(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<FormState> {
  const razon_social = str(formData, "razon_social");
  if (!razon_social) return { error: "La razón social es obligatoria." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("clientes")
    .update({
      // telefono3 NO se incluye a propósito: el campo se ocultó del form,
      // así no se pisa el valor que puedan tener clientes viejos.
      razon_social,
      direccion:     str(formData, "direccion"),
      provincia:     str(formData, "provincia"),
      localidad:     str(formData, "localidad"),
      codigo_postal: str(formData, "codigo_postal"),
      telefono1:     str(formData, "telefono1"),
      telefono2:     str(formData, "telefono2"),
      contacto:      str(formData, "contacto"),
      cuit:          str(formData, "cuit"),
      email:         str(formData, "email"),
      condicion_iva: str(formData, "condicion_iva"),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteCliente(id: string) {
  const supabase = await createClient();
  await supabase.from("clientes").update({ activo: false }).eq("id", id);
  revalidatePath("/clientes");
}
