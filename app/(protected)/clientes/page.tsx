import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ClientesTable from "@/components/clientes/ClientesTable";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("razon_social");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link
          href="/clientes/nuevo"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          Nuevo cliente
        </Link>
      </div>
      <ClientesTable clientes={clientes ?? []} />
    </div>
  );
}
