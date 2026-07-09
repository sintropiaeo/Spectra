import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RemitoForm from "@/components/remitos/RemitoForm";

export default async function EditarRemitoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: remito }, { data: clientes }] = await Promise.all([
    supabase.from("remitos_manuales").select("*").eq("id", id).single(),
    supabase.from("clientes").select("*").eq("activo", true).order("razon_social"),
  ]);

  if (!remito) notFound();

  return <RemitoForm clientes={clientes ?? []} remito={remito} />;
}
