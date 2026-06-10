"use client";

import { useActionState } from "react";
import { upsertConfig } from "@/app/(protected)/configuracion/actions";
import { Tables } from "@/lib/database.types";

type Props = {
  config: Partial<Tables<"config">> | null;
  empresaId: string;
};

type State = { error: string } | { success: true } | null;

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={type === "number" ? "any" : undefined}
        min={type === "number" ? "0" : undefined}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

export default function EmpresaForm({ config, empresaId }: Props) {
  const action = upsertConfig.bind(null, empresaId);
  const [state, formAction, isPending] = useActionState<State, FormData>(action, null);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">
        Datos de la empresa
      </h2>

      {state && "success" in state && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
          ConfiguraciÃ³n guardada correctamente.
        </div>
      )}
      {state && "error" in state && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Nombre de la empresa"
            name="nombre_empresa"
            defaultValue={config?.nombre_empresa}
            placeholder="Ej: Mi Empresa S.R.L."
          />
          <Field
            label="CUIT"
            name="cuit"
            defaultValue={config?.cuit}
            placeholder="Ej: 30-12345678-9"
          />
        </div>

        <Field
          label="DirecciÃ³n"
          name="direccion"
          defaultValue={config?.direccion}
          placeholder="Calle, nÃºmero, ciudad"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="CotizaciÃ³n dÃ³lar (ARS/USD)"
            name="cotizacion_dolar"
            type="number"
            defaultValue={config?.cotizacion_dolar ?? ""}
            placeholder="Ej: 1200"
          />
          <Field
            label="IVA (%)"
            name="iva"
            type="number"
            defaultValue={config?.iva ?? ""}
            placeholder="Ej: 21"
          />
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
