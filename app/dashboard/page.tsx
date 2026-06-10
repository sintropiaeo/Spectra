import Link from "next/link";
import { getDashboardData } from "./actions";
import OrdenesBarChart from "@/components/dashboard/OrdenesBarChart";

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

type StatCardProps = {
  label: string;
  value: number;
  valueClass?: string;
  href?: string;
  sub?: string;
};

function StatCard({ label, value, valueClass = "text-gray-900", href, sub }: StatCardProps) {
  const inner = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col justify-between gap-3 hover:border-gray-300 transition-colors">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-snug">
        {label}
      </p>
      <div>
        <p className={`text-4xl font-bold tabular-nums leading-none ${valueClass}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{inner}</Link>;
  }
  return inner;
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const mesActual = new Date().toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5 capitalize">{mesActual}</p>
      </div>

      {/* ── Tarjetas de resumen ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="En el taller ahora"
          value={data.enTaller}
          valueClass="text-indigo-600"
          href="/ordenes"
        />
        <StatCard
          label="Sin retirar +60 días"
          value={data.naranja}
          valueClass={data.naranja > 0 ? "text-orange-500" : "text-gray-900"}
          href="/alertas"
          sub="entre 60 y 120 días"
        />
        <StatCard
          label="Sin retirar +120 días"
          value={data.rojo}
          valueClass={data.rojo > 0 ? "text-red-600" : "text-gray-900"}
          href="/alertas"
          sub="más de 120 días"
        />
        <StatCard
          label="Ingresos este mes"
          value={data.ingresadasEsteMes}
          valueClass="text-gray-900"
        />
        <StatCard
          label="Entregas este mes"
          value={data.entregadasEsteMes}
          valueClass="text-emerald-600"
        />
      </div>

      {/* ── Gráfico + últimas órdenes ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de barras */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Órdenes ingresadas — últimos 12 meses
            </h2>
          </div>
          <OrdenesBarChart data={data.barData} />
        </div>

        {/* Últimas 5 órdenes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Últimos ingresos</h2>
            <Link
              href="/consultas"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Ver todos
            </Link>
          </div>

          {data.ultimasOrdenes.length === 0 ? (
            <p className="text-sm text-gray-400">Sin órdenes registradas.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.ultimasOrdenes.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/consultas/${o.id}`}
                    className="flex items-start justify-between gap-2 py-3 hover:bg-gray-50 -mx-1 px-1 rounded transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {o.cliente}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {[o.marca, o.modelo].filter(Boolean).join(" ") || "Sin equipo"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-indigo-600">
                        N° {o.numero}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmtDate(o.fecha_ingreso)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
