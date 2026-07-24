"use client";

import { useState } from "react";
import { getOrdenForPDF } from "@/app/(protected)/ordenes/actions";

type Props = {
  ordenId: string;
  numero: number;
  variant?: "primary" | "outline";
  label?: string;
  /** Botón chico para filas de tabla (solo ícono + "Imprimir"). */
  compact?: boolean;
};

export default function DescargaComprobanteButton({
  ordenId,
  numero,
  variant = "primary",
  label = "Reimprimir Orden de Ingreso",
  compact = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrdenForPDF(ordenId);
      if (!data) throw new Error("No se encontró la orden.");

      // Importes dinámicos: solo se cargan en el cliente, nunca en SSR
      const [{ pdf }, { OrdenPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/OrdenPDF"),
      ]);

      const blob = await pdf(<OrdenPDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);

      // Abre en pestaña nueva → el usuario imprime o descarga desde el visor del navegador
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.click();
      // Liberar memoria después de un momento
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
        title="Imprimir comprobante de ingreso"
        className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-50 disabled:opacity-50 transition-colors"
      >
        {loading ? "…" : "Imprimir"}
      </button>
    );
  }

  const base =
    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50";
  const cls =
    variant === "primary"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {label}
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
