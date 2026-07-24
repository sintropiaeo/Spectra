"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { confirmarSalida } from "@/app/(protected)/ordenes/actions";

// ── Tipos ─────────────────────────────────────────────────────
type ItemRow = {
  id: string;
  cantidad: string;
  detalle: string;
  precio: string;
  importe: number;
};

type ItemInicial = {
  cantidad: number | null;
  detalle: string | null;
  precio: number | null;
  importe: number | null;
};

type Tecnico = { id: string; nombre: string };

type Props = {
  ordenId: string;
  tecnicoInicial: string | null;
  tecnicos: Tecnico[];
  config: { cotizacion_dolar: number | null; iva: number | null } | null;
  itemsIniciales: ItemInicial[];
  monedaInicial: string;
  aplicaIvaInicial: boolean;
  mostrarCotizacionInicial: boolean;
  cotizacionInicial: number | null;
  /** Edición de una salida ya registrada (preserva la fecha original). */
  modoEdicion?: boolean;
  fechaSalidaInicial?: string | null;
  diagnosticoInicial?: string | null;
};

// ── Helpers ───────────────────────────────────────────────────
function newRow(): ItemRow {
  return { id: crypto.randomUUID(), cantidad: "1", detalle: "", precio: "", importe: 0 };
}

const fmt2 = (n: number) => n.toFixed(2);
const fmtARS = (n: number) =>
  n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Componentes internos ──────────────────────────────────────
function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function SalidaForm({
  ordenId,
  tecnicoInicial,
  tecnicos,
  config,
  itemsIniciales,
  monedaInicial,
  aplicaIvaInicial,
  mostrarCotizacionInicial,
  cotizacionInicial,
  modoEdicion = false,
  fechaSalidaInicial = null,
  diagnosticoInicial = null,
}: Props) {
  const [tecnico, setTecnico] = useState(tecnicoInicial ?? "");
  const [diagnostico, setDiagnostico] = useState(diagnosticoInicial ?? "");
  const [moneda, setMoneda] = useState<"USD" | "ARS">(
    (monedaInicial as "USD" | "ARS") ?? "USD"
  );
  const [aplicaIva, setAplicaIva] = useState(aplicaIvaInicial);
  const [mostrarCotizacion, setMostrarCotizacion] = useState(mostrarCotizacionInicial);
  const [cotizacionStr, setCotizacionStr] = useState(
    String(cotizacionInicial ?? config?.cotizacion_dolar ?? "")
  );

  const [items, setItems] = useState<ItemRow[]>(() =>
    itemsIniciales.length > 0
      ? itemsIniciales.map((i) => ({
          id: crypto.randomUUID(),
          cantidad: String(i.cantidad ?? 1),
          detalle: i.detalle ?? "",
          precio: String(i.precio ?? ""),
          importe: i.importe ?? 0,
        }))
      : [newRow()]
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Cálculos ─────────────────────────────────────────────────
  function updateItem(id: string, field: "cantidad" | "detalle" | "precio", value: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.importe = (parseFloat(updated.cantidad) || 0) * (parseFloat(updated.precio) || 0);
        return updated;
      })
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.importe, 0);
  const ivaPct = config?.iva ?? 21;
  const ivaAmount = aplicaIva ? subtotal * (ivaPct / 100) : 0;
  const totalFinal = subtotal + ivaAmount;
  const cotizacionNum = parseFloat(cotizacionStr) || 0;
  const totalEnPesos =
    moneda === "USD" && mostrarCotizacion && cotizacionNum > 0
      ? totalFinal * cotizacionNum
      : null;

  // ── Confirmar ────────────────────────────────────────────────
  function handleConfirmar() {
    const payload = items
      .filter((i) => i.detalle.trim())
      .map((i) => ({
        cantidad: parseFloat(i.cantidad) || 1,
        detalle: i.detalle.trim(),
        precio: parseFloat(i.precio) || 0,
        importe: i.importe,
      }));

    if (payload.length === 0) {
      setError("Agregá al menos un ítem de trabajo antes de confirmar.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await confirmarSalida(
        ordenId,
        tecnico,
        payload,
        {
          moneda,
          aplica_iva: aplicaIva,
          mostrar_cotizacion: mostrarCotizacion,
          cotizacion: cotizacionNum > 0 ? cotizacionNum : null,
          diagnostico: diagnostico.trim() || null,
        },
        // Al editar, preservar la fecha original; al registrar, usa hoy
        modoEdicion ? fechaSalidaInicial : undefined
      );
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  // ── Éxito ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-md bg-white rounded-xl border border-green-200 p-8 text-center space-y-4">
        <div className="text-4xl text-green-500">✓</div>
        <div>
          <p className="text-lg font-semibold text-gray-900">
            {modoEdicion ? "Cambios guardados" : "Equipo entregado"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {modoEdicion
              ? "La salida fue actualizada."
              : "La orden fue marcada como entregada."}
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-1">
          <Link
            href="/equipos"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Volver a Equipos
          </Link>
        </div>
      </div>
    );
  }

  // ── Formulario ───────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* ── Detalle / diagnóstico (texto libre, opcional) ──── */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Detalle
        </h2>
        <textarea
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
          rows={4}
          placeholder="Diagnóstico / descripción libre del trabajo realizado..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* ── Tabla de trabajos ──────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Trabajos realizados
          </h2>
          <button
            type="button"
            onClick={() => setItems((p) => [...p, newRow()])}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            + Agregar fila
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              <th className="px-3 py-2 text-right w-16">Cant.</th>
              <th className="px-3 py-2 text-left">Detalle</th>
              <th className="px-3 py-2 text-right w-32">Precio ({moneda})</th>
              <th className="px-3 py-2 text-right w-32">Importe</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-0">
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.cantidad}
                    onChange={(e) => updateItem(item.id, "cantidad", e.target.value)}
                    className="w-full text-right px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={item.detalle}
                    onChange={(e) => updateItem(item.id, "detalle", e.target.value)}
                    placeholder="Descripción del trabajo o repuesto..."
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precio}
                    onChange={(e) => updateItem(item.id, "precio", e.target.value)}
                    placeholder="0.00"
                    className="w-full text-right px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-3 py-1.5 text-right font-medium text-gray-900 tabular-nums">
                  {item.importe > 0 ? `$ ${fmt2(item.importe)}` : "—"}
                </td>
                <td className="px-1 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      items.length > 1 &&
                      setItems((p) => p.filter((i) => i.id !== item.id))
                    }
                    disabled={items.length === 1}
                    title="Quitar fila"
                    className="text-gray-300 hover:text-red-500 disabled:opacity-20 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {aplicaIva && (
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={3} className="px-4 py-1.5 text-right text-xs text-gray-500">
                  Subtotal {moneda}
                </td>
                <td className="px-3 py-1.5 text-right text-sm text-gray-700 tabular-nums">
                  $ {fmt2(subtotal)}
                </td>
                <td />
              </tr>
            )}
            {aplicaIva && (
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-4 py-1.5 text-right text-xs text-gray-500">
                  IVA ({ivaPct}%)
                </td>
                <td className="px-3 py-1.5 text-right text-sm text-gray-700 tabular-nums">
                  $ {fmt2(ivaAmount)}
                </td>
                <td />
              </tr>
            )}
            <tr className="bg-gray-50 border-t-2 border-gray-300">
              <td
                colSpan={3}
                className="px-4 py-2.5 text-right text-sm font-semibold text-gray-600 uppercase tracking-wide"
              >
                Total {moneda}
              </td>
              <td className="px-3 py-2.5 text-right text-base font-bold text-gray-900 tabular-nums">
                $ {fmt2(totalFinal)}
              </td>
              <td />
            </tr>
            {totalEnPesos !== null && (
              <tr className="bg-indigo-50 border-t border-indigo-100">
                <td colSpan={3} className="px-4 py-2 text-right text-xs text-indigo-600">
                  Equivalente ARS (× ${fmtARS(cotizacionNum)})
                </td>
                <td className="px-3 py-2 text-right text-sm font-bold text-indigo-700 tabular-nums">
                  $ {fmtARS(totalEnPesos)}
                </td>
                <td />
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* ── Opciones de facturación + técnico ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Facturación */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Facturación
          </h2>

          {/* Moneda */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 w-16">Moneda</span>
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              {(["USD", "ARS"] as const).map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoneda(m)}
                  className={`px-5 py-1.5 text-sm font-medium transition-colors ${
                    i > 0 ? "border-l border-gray-300" : ""
                  } ${
                    moneda === m
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-5">
            <Checkbox checked={aplicaIva} onChange={setAplicaIva} label="Aplica IVA" />
            <Checkbox
              checked={mostrarCotizacion}
              onChange={setMostrarCotizacion}
              label="Mostrar cotización"
            />
          </div>

          {/* Cotización editable (solo si USD + mostrar) */}
          {moneda === "USD" && mostrarCotizacion && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Cotización ARS/USD</span>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <span className="px-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-300 select-none">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={cotizacionStr}
                  onChange={(e) => setCotizacionStr(e.target.value)}
                  placeholder="0"
                  className="w-28 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Técnico */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Técnico
          </h2>
          <select
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">— Sin asignar —</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.nombre}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Confirmar ──────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={handleConfirmar}
          disabled={isPending}
          className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isPending
            ? "Guardando..."
            : modoEdicion
            ? "Guardar cambios"
            : "Confirmar salida / Entregar equipo"}
        </button>
      </div>
    </div>
  );
}
