import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClienteForm from "@/components/clientes/ClienteForm";
import { updateCliente } from "../../actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .single();

  if (!cliente) notFound();

  const action = updateCliente.bind(null, cliente.id) as (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ error: string } | null>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Clientes
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">{cliente.razon_social}</h1>
      </div>
      <ClienteForm cliente={cliente} action={action} />
    </div>
  );
}
