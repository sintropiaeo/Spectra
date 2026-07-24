import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getIngresoParaEditar } from "@/app/(protected)/ingresos/actions";
import IngresoForm from "@/components/ingresos/IngresoForm";

export default async function EditarIngresoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [orden, { data: clientes }, { data: tecnicos }] = await Promise.all([
    getIngresoParaEditar(id),
    supabase.from("clientes").select("*").eq("activo", true).order("razon_social"),
    supabase.from("tecnicos").select("id, nombre").eq("activo", true).order("nombre"),
  ]);

  if (!orden) notFound();

  const today = new Date().toISOString().split("T")[0];

  return (
    <IngresoForm
      clientes={clientes ?? []}
      tecnicos={tecnicos ?? []}
      nombreUsuario={null}
      today={today}
      orden={orden}
    />
  );
}
