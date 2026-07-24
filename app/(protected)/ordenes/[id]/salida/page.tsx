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
        <Link href="/equipos" className="hover:text-gray-600 transition-colors">
          Equipos
        </Link>
        <span>/</span>
        <span className="text-gray-600 font-medium">N° {orden.numero}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {yaEntregada ? "Editar salida" : "Registrar salida"} — N° {orden.numero}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ingreso: {fmtDate(orden.fecha_ingreso)}
            {yaEntregada && orden.fecha_salida
              ? ` · Salida: ${fmtDate(orden.fecha_salida)}`
              : ""}
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

      {/* Datos del ingreso (solo lectura; se editan en Entrada de equipos) */}
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

      {yaEntregada && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-md">
          Estás editando una salida ya registrada. Al guardar se actualizan los
          trabajos y la facturación, conservando la fecha de salida original.
        </div>
      )}

      {/* Formulario de salida (registro o edición) */}
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
        modoEdicion={yaEntregada}
        fechaSalidaInicial={orden.fecha_salida}
        diagnosticoInicial={orden.diagnostico}
      />
    </div>
  );
}
