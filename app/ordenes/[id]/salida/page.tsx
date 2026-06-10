import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrdenParaSalida } from "../../actions";
import SalidaForm from "@/components/ordenes/SalidaForm";
import DescargaComprobanteButton from "@/components/pdf/DescargaComprobanteButton";
import DescargaRemitoButton from "@/components/pdf/DescargaRemitoButton";

type Props = {
  params: Promise<{ id: string }>;
};

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value || "—"}</dd>
    </div>
  );
}

export default async function SalidaPage({ params }: Props) {
  const { id } = await params;
  const datos = await getOrdenParaSalida(id);
  if (!datos) notFound();

  const { orden, config, tecnicos, items } = datos;
  const yaEntregada = orden.estado === "entregado";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/ordenes" className="hover:text-gray-600 transition-colors">
          Órdenes
        </Link>
        <span>/</span>
        <span className="text-gray-600 font-medium">N° {orden.numero}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orden N° {orden.numero}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ingreso: {fmtDate(orden.fecha_ingreso)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {yaEntregada && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              Entregado
            </span>
          )}
          <DescargaComprobanteButton ordenId={id} numero={orden.numero} variant="outline" label="Reimprimir Orden de Ingreso" />
          {yaEntregada && (
            <DescargaRemitoButton ordenId={id} numero={orden.numero} />
          )}
        </div>
      </div>

      {/* Datos del ingreso (solo lectura) */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Datos del ingreso
        </h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          <div className="col-span-2 sm:col-span-4">
            <dt className="text-xs text-gray-400 uppercase tracking-wide">Cliente</dt>
            <dd className="text-base font-bold text-gray-900 mt-0.5">
              {orden.cliente.razon_social}
            </dd>
          </div>
          <Campo label="Marca" value={orden.marca} />
          <Campo label="Modelo" value={orden.modelo} />
          <Campo label="N° de serie" value={orden.numero_serie} />
          <Campo label="Estación" value={orden.estacion} />
          {orden.deficiencia && (
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-xs text-gray-400 uppercase tracking-wide">
                Problema reportado
              </dt>
              <dd className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
                {orden.deficiencia}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Formulario de salida o vista solo lectura */}
      {yaEntregada ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-md">
            Esta orden ya fue entregada. Se muestran los trabajos registrados.
          </div>
          {items.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Trabajos realizados
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500">
                    <th className="px-4 py-2 text-right w-16">Cant.</th>
                    <th className="px-4 py-2 text-left">Detalle</th>
                    <th className="px-4 py-2 text-right w-32">Precio USD</th>
                    <th className="px-4 py-2 text-right w-32">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2 text-right tabular-nums">{item.cantidad}</td>
                      <td className="px-4 py-2">{item.detalle}</td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {item.precio != null ? `$ ${Number(item.precio).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-right font-medium tabular-nums">
                        {item.importe != null ? `$ ${Number(item.importe).toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <SalidaForm
          ordenId={id}
          tecnicoInicial={orden.tecnico}
          tecnicos={tecnicos}
          config={config}
          itemsIniciales={items}
          monedaInicial={orden.moneda}
          aplicaIvaInicial={orden.aplica_iva}
          mostrarCotizacionInicial={orden.mostrar_cotizacion}
          cotizacionInicial={orden.cotizacion}
        />
      )}
    </div>
  );
}
