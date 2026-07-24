import Link from "next/link";
import { getOrdenesIngresadas } from "../actions";
import BuscadorOrdenes from "@/components/ordenes/BuscadorOrdenes";

export default async function RegistrarSalidaPage() {
  const ordenes = await getOrdenesIngresadas();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar salida</h1>
          <p className="text-sm text-gray-500 mt-1">
            Elegí la orden pendiente cuyo equipo vas a entregar.
          </p>
        </div>
        <Link href="/ordenes" className="text-sm text-gray-500 hover:text-gray-800">
          ← Volver al listado
        </Link>
      </div>
      <BuscadorOrdenes ordenes={ordenes as Parameters<typeof BuscadorOrdenes>[0]["ordenes"]} />
    </div>
  );
}
