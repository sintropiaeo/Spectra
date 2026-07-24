import { createClient } from "@/lib/supabase/server";
import IngresoForm from "@/components/ingresos/IngresoForm";

export default async function NuevoIngresoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: clientes }, { data: tecnicos }, { data: perfil }] =
    await Promise.all([
      supabase.from("clientes").select("*").eq("activo", true).order("razon_social"),
      supabase.from("tecnicos").select("id, nombre").eq("activo", true).order("nombre"),
      user
        ? supabase.from("perfiles").select("nombre").eq("id", user.id).single()
        : Promise.resolve({ data: null }),
    ]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <IngresoForm
      clientes={clientes ?? []}
      tecnicos={tecnicos ?? []}
      nombreUsuario={perfil?.nombre ?? null}
      today={today}
    />
  );
}
