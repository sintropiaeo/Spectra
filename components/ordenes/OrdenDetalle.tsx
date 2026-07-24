import Link from "next/link";
import { getOrdenCompleto } from "@/app/(protected)/consultas/actions";
import DescargaComprobanteButton from "@/components/pdf/DescargaComprobanteButton";
import DescargaRemitoButton from "@/components/pdf/DescargaRemitoButton";

type Datos = NonNullable<Awaited<ReturnType<typeof getOrdenCompleto>>>;

type Props = {
  datos: Datos;
  /** Ruta base para breadcrumb e historial (default /equipos). */
  basePath?: string;
  basePathLabel?: string;
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function EstadoBadge({ estado }: { estado: string }) {
  const entregado = estado === "entregado";
  const cls = entregado ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${cls}`}>
      {entregado ? "Entregado" : "Pendiente"}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value || "—"}</dd>
    </div>
  );
}

function HistBadge({ estado }: { estado: string }) {
  const entregado = estado === "entregado";
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${entregado ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
      {entregado ? "Entregado" : "Pendiente"}
    </span>
  );
}

export default function OrdenDetalle({
  datos,
  basePath = "/equipos",
  basePathLabel = "Equipos",
}: Props) {
  const { orden, cliente, accesorios, items, historialCliente, historialEquipo } = datos;

  const isEntregada = orden.estado === "entregado";
  const subtotal = items.reduce((s, i) => s + (i.importe ?? 0), 0);
  const ivaPct = 21;
  const ivaAmount = orden.aplica_iva ? subtotal * (ivaPct / 100) : 0;
  const total = subtotal + ivaAmount;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Volver */}
      <Link
        href={basePath}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a {basePathLabel}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Orden N° {orden.numero}</h1>
            <EstadoBadge estado={orden.estado} />
          </div>
          <p className="text-sm text-gray-500">
            Ingreso: {fmtDate(orden.fecha_ingreso)}
            {isEntregada && ` · Salida: ${fmtDate(orden.fecha_salida)}`}
            {orden.tecnico && ` · Técnico: ${orden.tecnico}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DescargaComprobanteButton
            ordenId={orden.id}
            numero={orden.numero}
            variant="outline"
            label="Reimprimir Orden de Ingreso"
          />
          {isEntregada && (
            <DescargaRemitoButton ordenId={orden.id} numero={orden.numero} />
          )}
        </div>
      </div>

      {/* Cliente + Equipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Section title="Cliente">
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Razón social</dt>
              <dd className="text-base font-bold text-gray-900 mt-0.5">{cliente.razon_social}</dd>
            </div>
            <Field label="Dirección" value={cliente.direccion} />
            <Field
              label="Localidad"
              value={[cliente.localidad, cliente.provincia, cliente.codigo_postal]
                .filter(Boolean)
                .join(", ")}
            />
            <Field label="Teléfono" value={cliente.telefono1} />
            <Field label="Contacto" value={cliente.contacto} />
          </dl>
        </Section>

        <Section title="Equipo">
          <dl className="space-y-2">
            <Field label="Marca" value={orden.marca} />
            <Field label="Modelo" value={orden.modelo} />
            <Field label="N° de serie" value={orden.numero_serie} />
            <Field label="Estación" value={orden.estacion} />
          </dl>
        </Section>
      </div>

      {/* Accesorios */}
      <Section title="Accesorios entregados">
        {accesorios.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {accesorios.map((a) => (
              <span key={a} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sin accesorios</p>
        )}
      </Section>

      {/* Deficiencia + Observaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Section title="Problema reportado">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{orden.deficiencia || "—"}</p>
        </Section>
        <Section title="Observaciones">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{orden.observaciones || "—"}</p>
        </Section>
      </div>

      {/* Recepción */}
      <Section title="Recepción">
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
          <Field label="Entregó" value={orden.entrego} />
          <Field label="Recibió" value={orden.quien_recibio} />
          <Field label="Técnico" value={orden.tecnico} />
        </dl>
      </Section>

      {/* Trabajos (solo si entregada) */}
      {isEntregada && items.length > 0 && (
        <Section title="Trabajos realizados">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="pb-2 text-right w-12">Cant.</th>
                <th className="pb-2 text-left px-4">Detalle</th>
                <th className="pb-2 text-right w-28">Precio {orden.moneda}</th>
                <th className="pb-2 text-right w-28">Importe</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 text-right tabular-nums">{item.cantidad ?? 1}</td>
                  <td className="py-1.5 px-4">{item.detalle}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {item.precio != null ? `$ ${Number(item.precio).toFixed(2)}` : "—"}
                  </td>
                  <td className="py-1.5 text-right font-medium tabular-nums">
                    {item.importe != null ? `$ ${Number(item.importe).toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {orden.aplica_iva && (
                <>
                  <tr className="border-t border-gray-200 text-xs text-gray-500">
                    <td colSpan={3} className="pt-2 text-right">Subtotal {orden.moneda}</td>
                    <td className="pt-2 text-right tabular-nums">$ {subtotal.toFixed(2)}</td>
                  </tr>
                  <tr className="text-xs text-gray-500">
                    <td colSpan={3} className="text-right">IVA ({ivaPct}%)</td>
                    <td className="text-right tabular-nums">$ {ivaAmount.toFixed(2)}</td>
                  </tr>
                </>
              )}
              <tr className="border-t-2 border-gray-300 font-bold">
                <td colSpan={3} className="pt-2 text-right text-sm text-gray-700 uppercase tracking-wide">
                  Total {orden.moneda}
                </td>
                <td className="pt-2 text-right text-base text-gray-900 tabular-nums">
                  $ {total.toFixed(2)}
                </td>
              </tr>
              {orden.moneda === "USD" && orden.cotizacion && orden.cotizacion > 0 && (
                <tr className="text-xs text-indigo-600">
                  <td colSpan={3} className="pt-1.5 text-right">
                    Equivalente ARS (× ${orden.cotizacion.toLocaleString("es-AR")})
                  </td>
                  <td className="pt-1.5 text-right font-bold tabular-nums">
                    $ {(total * orden.cotizacion).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </Section>
      )}

      {/* Historial del cliente */}
      {historialCliente.length > 0 && (
        <Section title={`Historial del cliente (${historialCliente.length} orden${historialCliente.length !== 1 ? "es" : ""} más)`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="pb-2 text-left">N°</th>
                <th className="pb-2 text-left">Equipo</th>
                <th className="pb-2 text-left">Estado</th>
                <th className="pb-2 text-left">Ingreso</th>
                <th className="pb-2 text-left">Salida</th>
              </tr>
            </thead>
            <tbody>
              {historialCliente.map((h) => (
                <tr key={h.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-1.5">
                    <Link href={`${basePath}/${h.id}`} className="font-bold text-indigo-600 hover:underline">
                      #{h.numero}
                    </Link>
                  </td>
                  <td className="py-1.5 text-gray-500">
                    {[h.marca, h.modelo].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="py-1.5"><HistBadge estado={h.estado} /></td>
                  <td className="py-1.5 text-gray-500 tabular-nums">{fmtDate(h.fecha_ingreso)}</td>
                  <td className="py-1.5 text-gray-500 tabular-nums">{fmtDate(h.fecha_salida)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Historial del equipo (por número de serie) */}
      {historialEquipo.length > 0 && (
        <Section title={`Historial del equipo — serie ${orden.numero_serie} (${historialEquipo.length} orden${historialEquipo.length !== 1 ? "es" : ""} más)`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="pb-2 text-left">N°</th>
                <th className="pb-2 text-left">Técnico</th>
                <th className="pb-2 text-left">Estado</th>
                <th className="pb-2 text-left">Ingreso</th>
                <th className="pb-2 text-left">Salida</th>
              </tr>
            </thead>
            <tbody>
              {historialEquipo.map((h) => (
                <tr key={h.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-1.5">
                    <Link href={`${basePath}/${h.id}`} className="font-bold text-indigo-600 hover:underline">
                      #{h.numero}
                    </Link>
                  </td>
                  <td className="py-1.5 text-gray-500">{h.tecnico ?? "—"}</td>
                  <td className="py-1.5"><HistBadge estado={h.estado} /></td>
                  <td className="py-1.5 text-gray-500 tabular-nums">{fmtDate(h.fecha_ingreso)}</td>
                  <td className="py-1.5 text-gray-500 tabular-nums">{fmtDate(h.fecha_salida)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
    </div>
  );
}
