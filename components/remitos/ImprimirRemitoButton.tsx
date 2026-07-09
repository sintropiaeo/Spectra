"use client";

import { useState } from "react";
import { getRemitoParaImpresion } from "@/app/(protected)/remitos/actions";

type Props = {
  remitoId: string;
  /** Botón chico para la fila de la tabla (solo impresión normal). */
  compact?: boolean;
  /** Muestra el checkbox de marcas de calibración (vista de formulario). */
  showCalibration?: boolean;
};

export default function ImprimirRemitoButton({
  remitoId,
  compact = false,
  showCalibration = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calibration, setCalibration] = useState(false);

  async function generar(cal: boolean) {
    setLoading(true);
    setError(null);
    try {
      const data = await getRemitoParaImpresion(remitoId);
      if (!data) throw new Error("No se encontró el remito.");

      const [{ pdf }, { RemitoPrintPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/remitos/RemitoPrintPDF"),
      ]);

      const blob = await pdf(
        <RemitoPrintPDF data={data} calibration={cal} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => generar(false)}
        disabled={loading}
        title="Imprimir remito"
        className="px-2.5 py-1.5 text-xs font-medium text-green-700 border border-green-200 rounded-md hover:bg-green-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "…" : "Imprimir"}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => generar(calibration)}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Generando PDF...
          </>
        ) : calibration ? (
          "Imprimir marcas de calibración"
        ) : (
          "Imprimir"
        )}
      </button>

      {showCalibration && (
        <label className="flex items-center gap-2 text-xs text-gray-600 select-none">
          <input
            type="checkbox"
            checked={calibration}
            onChange={(e) => setCalibration(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Imprimir con marcas de calibración
        </label>
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
