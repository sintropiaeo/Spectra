import { notFound } from "next/navigation";
import { getOrdenCompleto } from "@/app/(protected)/consultas/actions";
import OrdenDetalle from "@/components/ordenes/OrdenDetalle";

type Props = { params: Promise<{ id: string }> };

export default async function EquipoDetallePage({ params }: Props) {
  const { id } = await params;
  const datos = await getOrdenCompleto(id);
  if (!datos) notFound();

  return <OrdenDetalle datos={datos} basePath="/equipos" basePathLabel="Equipos" />;
}
