import { createClient } from "@/lib/supabase/server";
import RemitoForm from "@/components/remitos/RemitoForm";

export default async function NuevoRemitoPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("razon_social");

  return <RemitoForm clientes={clientes ?? []} />;
}
