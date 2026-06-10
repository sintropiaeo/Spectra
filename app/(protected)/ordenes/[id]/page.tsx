import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrdenForPDF, getOrden } from "../actions";
import DescargaComprobanteButton from "@/components/pdf/DescargaComprobanteButton";
import DescargaRemitoButton from "@/components/pdf/DescargaRemitoButton";

type Props = {
  params: Promise<{ id: string }>;
};

const ACC_LABELS: Record<string, string> = {
  microfono: "Micrófono",
  fuente: "Fuente",
  cable: "Cable",
  pack: "Pack",
  antena: "Antena",
  cargador: "Cargador",
  crem: "Crem",
};

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value || "—"}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default async function OrdenDetallePage({ params }: Props) {
  const { id } = await params;
  const [data, ordenBase] = await Promise.all([getOrdenForPDF(id), getOrden(id)]);
  if (!data) notFound();

  const { orden, cliente, accesorios, config } = data;
  const isEntregada = ordenBase?.estado === "entregado";

  const accActivos = accesorios
    ? Object.entries(accesorios)
        .filter(([k, v]) => v && k in ACC_LABELS)
        .map(([k]) => ACC_LABELS[k])
    : [];

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Breadcrumb + acciones */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/ordenes" className="hover:text-gray-600 transition-colors">
              Órdenes
            </Link>
            <span>/</span>
            <span className="text-gray-600">N° {orden.numero}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orden N° {orden.numero}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ingreso: {fmtDate(orden.fecha_ingreso)}
          </p>
        </div>
        <div className="shrink-0 pt-1 flex gap-2 flex-wrap">
          <DescargaComprobanteButton ordenId={id} numero={orden.numero} variant="outline" />
          {isEntregada && (
            <DescargaRemitoButton ordenId={id} numero={orden.numero} />
          )}
        </div>
      </div>

      {/* Cliente */}
      <Section title="Cliente">
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <div className="col-span-2 sm:col-span-3">
            <Field label="Razón social" value={cliente.razon_social} />
          </div>
          <Field label="Dirección" value={cliente.direccion} />
          <Field label="Localidad" value={cliente.localidad} />
          <Field label="Provincia" value={cliente.provincia} />
          <Field label="Teléfono" value={cliente.telefono1} />
          <Field label="Contacto" value={cliente.contacto} />
        </dl>
      </Section>

      {/* Equipo */}
      <Section title="Equipo">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          <Field label="Marca" value={orden.marca} />
          <Field label="Modelo" value={orden.modelo} />
          <Field label="N° de serie" value={orden.numero_serie} />
          <Field label="Estación" value={orden.estacion} />
        </dl>
      </Section>

      {/* Accesorios */}
      <Section title="Accesorios entregados">
        {accActivos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {accActivos.map((a) => (
              <span
                key={a}
                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
              >
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sin accesorios</p>
        )}
      </Section>

      {/* Problema + Observaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Section title="Problema reportado">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {orden.deficiencia || "—"}
          </p>
        </Section>
        <Section title="Observaciones">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {orden.observaciones || "—"}
          </p>
        </Section>
      </div>

      {/* Recepción */}
      <Section title="Recepción">
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <Field label="Entregó" value={orden.entrego} />
          <Field label="Recibió" value={orden.quien_recibio} />
          <Field label="Técnico" value={orden.tecnico} />
        </dl>
      </Section>
    </div>
  );
}
