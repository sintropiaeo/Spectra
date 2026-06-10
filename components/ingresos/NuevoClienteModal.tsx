"use client";

import { useActionState, useEffect } from "react";
import { createClienteRapido, ClienteRapidoState } from "@/app/ingresos/actions";
import { Tables } from "@/lib/database.types";

type Props = {
  onCreado: (cliente: Tables<"clientes">) => void;
  onClose: () => void;
};

export default function NuevoClienteModal({ onCreado, onClose }: Props) {
  const [state, formAction, isPending] = useActionState<ClienteRapidoState, FormData>(
    createClienteRapido,
    null
  );

  useEffect(() => {
    if (state && "cliente" in state) {
      onCreado(state.cliente);
    }
  }, [state, onCreado]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo cliente</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {state && "error" in state && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="modal-razon" className="block text-sm font-medium text-gray-700 mb-1">
              Razón social <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-razon"
              name="razon_social"
              required
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="modal-tel" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                id="modal-tel"
                name="telefono1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="modal-loc" className="block text-sm font-medium text-gray-700 mb-1">
                Localidad
              </label>
              <input
                id="modal-loc"
                name="localidad"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal-contacto" className="block text-sm font-medium text-gray-700 mb-1">
              Contacto
            </label>
            <input
              id="modal-contacto"
              name="contacto"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Guardando..." : "Crear cliente"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
