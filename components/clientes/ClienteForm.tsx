"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Tables } from "@/lib/database.types";
import { CONDICIONES_IVA } from "@/lib/constants";

type State = { error: string } | null;
type FormAction = (prevState: unknown, formData: FormData) => Promise<State>;

type Props = {
  cliente?: Tables<"clientes">;
  action: FormAction;
};

function Field({
  label,
  name,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string | null;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

export default function ClienteForm({ cliente, action }: Props) {
  const [state, formAction, isPending] = useActionState<State, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}

      <Field
        label="Razón social"
        name="razon_social"
        required
        defaultValue={cliente?.razon_social}
      />

      <Field label="Dirección" name="direccion" defaultValue={cliente?.direccion} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Provincia" name="provincia" defaultValue={cliente?.provincia} />
        <Field label="Localidad" name="localidad" defaultValue={cliente?.localidad} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Código postal" name="codigo_postal" defaultValue={cliente?.codigo_postal} />
        <Field label="Contacto" name="contacto" defaultValue={cliente?.contacto} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Teléfono 1" name="telefono1" defaultValue={cliente?.telefono1} />
        <Field label="Teléfono 2" name="telefono2" defaultValue={cliente?.telefono2} />
      </div>

      {/* ── Datos fiscales ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="CUIT" name="cuit" defaultValue={cliente?.cuit} />
        <Field label="E-mail" name="email" defaultValue={cliente?.email} />
      </div>

      <div>
        <label htmlFor="condicion_iva" className="block text-sm font-medium text-gray-700 mb-1">
          Condición frente al IVA
        </label>
        <select
          id="condicion_iva"
          name="condicion_iva"
          defaultValue={cliente?.condicion_iva ?? ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Seleccionar —</option>
          {CONDICIONES_IVA.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Guardando..." : cliente ? "Guardar cambios" : "Crear cliente"}
        </button>
        <Link
          href="/clientes"
          className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
