import Link from "next/link";
import { getAlertas } from "./actions";

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export default async function AlertasPage() {
  const alertas = await getAlertas();

  const rojas   = alertas.filter((a) => a.nivel === "rojo");
  const naranjas = alertas.filter((a) => a.nivel === "naranja");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alertas de plazos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Órdenes ingresadas que no fueron retiradas.
        </p>
      </div>

      {/* Resumen */}
      {alertas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-orange-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{naranjas.length}</p>
              <p className="text-sm text-orange-600">Entre 60 y 120 días sin retirar</p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-red-700">{rojas.length}</p>
              <p className="text-sm text-red-600">Más de 120 días sin retirar</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {alertas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 text-gray-400 text-sm">
          No hay órdenes con más de 60 días sin retirar.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">N°</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N° serie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingreso</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Días</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alertas.map((a) => {
                const isRojo = a.nivel === "rojo";
                return (
                  <tr
                    key={a.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isRojo ? "bg-red-50/40" : "bg-orange-50/30"
                    }`}
                  >
                    {/* Indicador de color */}
                    <td className="px-4 py-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mx-auto ${
                          isRojo ? "bg-red-500" : "bg-orange-400"
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/consultas/${a.id}`}
                        className="font-bold text-indigo-600 hover:underline"
                      >
                        #{a.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/consultas/${a.id}`} className="hover:text-indigo-600">
                        {a.cliente}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {[a.marca, a.modelo].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {a.numero_serie ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 tabular-nums">
                      {fmtDate(a.fecha_ingreso)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full tabular-nums ${
                          isRojo
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {a.dias} días
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
