"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  RemitoPrintCoords,
  RemitoCampo,
} from "@/lib/remitoPrintConfig";
import {
  saveRemitoCoords,
  CoordsState,
} from "@/app/(protected)/remitos/actions";
import type { RemitoImpresion } from "@/app/(protected)/remitos/actions";

const CAMPO_LABELS: Record<RemitoCampo, string> = {
  fecha: "Fecha",
  razonSocial: "Razón social",
  domicilio: "Domicilio",
  condicionIva: "Condición de IVA",
  cuit: "CUIT",
};

const CAMPOS: RemitoCampo[] = [
  "fecha",
  "razonSocial",
  "domicilio",
  "condicionIva",
  "cuit",
];

// Datos de ejemplo para la hoja de prueba (solo para ver alineación).
const SAMPLE: RemitoImpresion = {
  razon_social: "EJEMPLO S.A.",
  domicilio: "Av. Siempreviva 742",
  condicion_iva: "Responsable Inscripto",
  cuit: "30-12345678-9",
  fecha: new Date().toISOString().slice(0, 10),
  items: [
    { cantidad: "2", detalle: "Reparación de equipo (ejemplo)" },
    { cantidad: "1", detalle: "Cambio de fuente" },
    { cantidad: "3", detalle: "Service general" },
  ],
};

export default function CalibracionForm({
  initial,
}: {
  initial: RemitoPrintCoords;
}) {
  const [coords, setCoords] = useState<RemitoPrintCoords>(initial);
  const [state, setState] = useState<CoordsState>(null);
  const [isSaving, startSaving] = useTransition();
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  function setCampo(campo: RemitoCampo, key: "x_mm" | "y_mm" | "maxWidth_mm", v: number) {
    setCoords((c) => ({
      ...c,
      campos: { ...c.campos, [campo]: { ...c.campos[campo], [key]: v } },
    }));
  }
  function setTabla(key: "y_mm" | "filaAltura_mm" | "filasMax", v: number) {
    setCoords((c) => ({ ...c, tabla: { ...c.tabla, [key]: v } }));
  }
  function setTablaCol(
    col: "cantidad" | "detalle",
    key: "x_mm" | "maxWidth_mm",
    v: number
  ) {
    setCoords((c) => ({
      ...c,
      tabla: { ...c.tabla, [col]: { ...c.tabla[col], [key]: v } },
    }));
  }

  function handleGuardar() {
    setState(null);
    startSaving(async () => {
      const res = await saveRemitoCoords(coords);
      setState(res);
    });
  }

  async function handleImprimirPrueba() {
    setPrinting(true);
    setPrintError(null);
    try {
      const [{ pdf }, { RemitoPrintPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/remitos/RemitoPrintPDF"),
      ]);
      const blob = await pdf(
        <RemitoPrintPDF data={SAMPLE} coords={coords} calibration />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      setPrintError((e as Error).message);
    } finally {
      setPrinting(false);
    }
  }

  const inputCls =
    "w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calibración de impresión
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Coordenadas en milímetros desde la esquina superior izquierda de la
            hoja A4. Ajustá, imprimí la hoja de prueba y superponela contra un
            remito real hasta que las marcas calcen.
          </p>
        </div>
        <Link href="/remitos" className="text-sm text-gray-500 hover:text-gray-800">
          ← Volver
        </Link>
      </div>

      {state && "error" in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}
      {state && "success" in state && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
          Calibración guardada correctamente.
        </div>
      )}

      {/* ── Campos del encabezado ── */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Campos del encabezado
        </h2>

        <div className="grid grid-cols-[1fr_repeat(3,5rem)] gap-2 items-center">
          <span />
          <span className="text-xs font-semibold text-gray-400 text-center">x</span>
          <span className="text-xs font-semibold text-gray-400 text-center">y</span>
          <span className="text-xs font-semibold text-gray-400 text-center">ancho</span>

          {CAMPOS.map((campo) => (
            <FieldRow key={campo} label={CAMPO_LABELS[campo]}>
              <input
                type="number"
                step="0.5"
                value={coords.campos[campo].x_mm}
                onChange={(e) => setCampo(campo, "x_mm", Number(e.target.value))}
                className={inputCls}
              />
              <input
                type="number"
                step="0.5"
                value={coords.campos[campo].y_mm}
                onChange={(e) => setCampo(campo, "y_mm", Number(e.target.value))}
                className={inputCls}
              />
              <input
                type="number"
                step="0.5"
                value={coords.campos[campo].maxWidth_mm}
                onChange={(e) =>
                  setCampo(campo, "maxWidth_mm", Number(e.target.value))
                }
                className={inputCls}
              />
            </FieldRow>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          Todos los valores en mm. (No se usa alto máximo en estos campos: son
          de una sola línea.)
        </p>
      </section>

      {/* ── Tabla de ítems ── */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tabla de ítems (cantidad + detalle por renglón)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LabeledNumber
            label="Y primera fila (mm)"
            value={coords.tabla.y_mm}
            onChange={(v) => setTabla("y_mm", v)}
          />
          <LabeledNumber
            label="Alto de fila (mm)"
            value={coords.tabla.filaAltura_mm}
            onChange={(v) => setTabla("filaAltura_mm", v)}
          />
          <LabeledNumber
            label="Renglones máx."
            value={coords.tabla.filasMax}
            step={1}
            onChange={(v) => setTabla("filasMax", v)}
          />
        </div>

        <div className="grid grid-cols-[1fr_repeat(2,5rem)] gap-2 items-center pt-2 border-t border-gray-100">
          <span />
          <span className="text-xs font-semibold text-gray-400 text-center">x</span>
          <span className="text-xs font-semibold text-gray-400 text-center">ancho</span>

          <FieldRow label="Columna Cantidad">
            <input
              type="number"
              step="0.5"
              value={coords.tabla.cantidad.x_mm}
              onChange={(e) => setTablaCol("cantidad", "x_mm", Number(e.target.value))}
              className={inputCls}
            />
            <input
              type="number"
              step="0.5"
              value={coords.tabla.cantidad.maxWidth_mm}
              onChange={(e) =>
                setTablaCol("cantidad", "maxWidth_mm", Number(e.target.value))
              }
              className={inputCls}
            />
          </FieldRow>

          <FieldRow label="Columna Detalle">
            <input
              type="number"
              step="0.5"
              value={coords.tabla.detalle.x_mm}
              onChange={(e) => setTablaCol("detalle", "x_mm", Number(e.target.value))}
              className={inputCls}
            />
            <input
              type="number"
              step="0.5"
              value={coords.tabla.detalle.maxWidth_mm}
              onChange={(e) =>
                setTablaCol("detalle", "maxWidth_mm", Number(e.target.value))
              }
              className={inputCls}
            />
          </FieldRow>
        </div>
      </section>

      {/* ── Acciones ── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGuardar}
          disabled={isSaving}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? "Guardando..." : "Guardar calibración"}
        </button>
        <button
          type="button"
          onClick={handleImprimirPrueba}
          disabled={printing}
          className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {printing ? "Generando..." : "Imprimir hoja de prueba con marcas"}
        </button>
        {printError && <span className="text-xs text-red-600">{printError}</span>}
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        La hoja de prueba usa las coordenadas de esta pantalla (sin necesidad de
        guardar) y datos de ejemplo.
      </p>
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <span className="text-sm text-gray-700">{label}</span>
      {children}
    </>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
  step = 0.5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
