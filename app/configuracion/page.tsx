import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EmpresaForm from "@/components/configuracion/EmpresaForm";
import TecnicosPanel from "@/components/configuracion/TecnicosPanel";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!perfil || !["admin", "superadmin"].includes(perfil.rol)) {
    redirect("/dashboard");
  }

  let empresa_id = perfil.empresa_id;
  if (!empresa_id) {
    const { data: empresa } = await supabase
      .from("empresas")
      .select("id")
      .limit(1)
      .single();
    empresa_id = empresa?.id ?? null;
  }

  if (!empresa_id) redirect("/dashboard");

  const [{ data: config }, { data: tecnicos }] = await Promise.all([
    supabase.from("config").select("*").eq("empresa_id", empresa_id).single(),
    supabase
      .from("tecnicos")
      .select("*")
      .eq("empresa_id", empresa_id)
      .order("nombre"),
  ]);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ajustá los datos y preferencias de tu empresa.
        </p>
      </div>

      <EmpresaForm config={config ?? null} empresaId={empresa_id} />

      <TecnicosPanel tecnicos={tecnicos ?? []} />
    </div>
  );
}
