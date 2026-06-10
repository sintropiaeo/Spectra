import { getOrdenesIngresadas } from "./actions";
import BuscadorOrdenes from "@/components/ordenes/BuscadorOrdenes";

export default async function OrdenesPage() {
  const ordenes = await getOrdenesIngresadas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Órdenes pendientes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Seleccioná una orden para registrar la salida del equipo.
        </p>
      </div>
      <BuscadorOrdenes ordenes={ordenes as Parameters<typeof BuscadorOrdenes>[0]["ordenes"]} />
    </div>
  );
}
