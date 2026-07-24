"use client";

import { useState } from "react";
import { getOrdenParaRemito } from "@/app/(protected)/ordenes/actions";

type Props = {
  ordenId: string;
  numero: number;
  variant?: "primary" | "outline" | "blue";
  label?: string;
  /** Botón chico para filas de tabla. */
  compact?: boolean;
};

export default function DescargaRemitoButton({
  ordenId,
  numero,
  variant = "primary",
  label = "Generar Orden de Salida",
  compact = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrdenParaRemito(ordenId);
      if (!data) throw new Error("No se encontró la orden.");

      const [{ pdf }, { RemitoPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/RemitoPDF"),
      ]);

      const blob = await pdf(<RemitoPDF data={data} />).toBlob();
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
        onClick={handleClick}
        disabled={loading}
        title="Imprimir remito de salida"
        className="px-2.5 py-1.5 text-xs font-medium text-green-700 border border-green-200 rounded-md hover:bg-green-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "…" : "Imprimir"}
      </button>
    );
  }

  const base =
    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50";
  const cls =
    variant === "primary"
      ? `${base} bg-green-600 text-white hover:bg-green-700`
      : variant === "blue"
      ? `${base} bg-indigo-600 text-white hover:bg-indigo-700`
      : `${base} border border-gray-300 text-gray-700 hover:bg-gray-50`;

  return (
    <div className="space-y-1">
      <button onClick={handleClick} disabled={loading} className={cls}>
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {label}
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
