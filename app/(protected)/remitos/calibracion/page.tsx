import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRemitoCoords } from "@/app/(protected)/remitos/actions";
import CalibracionForm from "@/components/remitos/CalibracionForm";

export default async function CalibracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!perfil || !["admin", "superadmin"].includes(perfil.rol)) {
    redirect("/remitos");
  }

  const coords = await getRemitoCoords();

  return <CalibracionForm initial={coords} />;
}
