"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarOrden } from "@/app/(protected)/equipos/actions";

type Props = {
  ordenId: string;
  numero: number;
  /** true si el trabajo ya tiene salida (para el texto de confirmación). */
  entregada?: boolean;
};

export default function EliminarOrdenButton({ ordenId, numero, entregada = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    const detalle = entregada
      ? "Se elimina el trabajo completo: entrada y salida juntas."
      : "Se elimina la orden de entrada.";
    if (!confirm(`¿Eliminar la orden N° ${numero}?\n${detalle}`)) return;

    setError(null);
    startTransition(async () => {
      const res = await eliminarOrden(ordenId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/equipos");
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {isPending ? "Eliminando..." : "Eliminar orden"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
