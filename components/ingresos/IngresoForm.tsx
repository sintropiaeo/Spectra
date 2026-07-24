"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createIngreso,
  updateIngreso,
  IngresoState,
  IngresoEdit,
} from "@/app/(protected)/ingresos/actions";
import ClienteAutocomplete from "./ClienteAutocomplete";
import DescargaComprobanteButton from "@/components/pdf/DescargaComprobanteButton";
import { Tables } from "@/lib/database.types";

type Tecnico = Pick<Tables<"tecnicos">, "id" | "nombre">;

type Props = {
  clientes: Tables<"clientes">[];
  tecnicos: Tecnico[];
  nombreUsuario: string | null;
  today: string;
  /** Si viene, el formulario está en modo edición. */
  orden?: IngresoEdit;
};

const ESTACIONES = ["HANDY", "BASE", "MÓVIL", "OTRO"];

const ACCESORIOS: { name: keyof IngresoEdit["accesorios"]; label: string }[] = [
  { name: "microfono", label: "Micrófono" },
  { name: "fuente",    label: "Fuente" },
  { name: "cable",     label: "Cable" },
  { name: "pack",      label: "Pack" },
  { name: "antena",    label: "Antena" },
  { name: "cargador",  label: "Cargador" },
  { name: "crem",      label: "Crem" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const textareaCls = `${inputCls} resize-none`;

export default function IngresoForm({ clientes, tecnicos, nombreUsuario, today, orden }: Props) {
  const isEdit = !!orden;
  const action = isEdit ? updateIngreso.bind(null, orden!.id) : createIngreso;
  const [state, formAction, isPending] = useActionState<IngresoState, FormData>(action, null);

  // ── Pantalla de éxito de ALTA (muestra el N° asignado) ───────
  if (state && "success" in state && state.numero != null) {
    return (
      <div className="max-w-xl bg-white rounded-xl border border-green-200 p-8 text-center space-y-5">
        <div className="text-4xl text-green-500">✓</div>
        <div>
          <p className="text-lg font-semibold text-gray-900">Entrada registrada</p>
          <p className="text-5xl font-bold text-indigo-600 mt-1">N° {state.numero}</p>
        </div>
        <div className="flex flex-col items-center gap-3 pt-1">
          {state.orden_id && (
            <DescargaComprobanteButton ordenId={state.orden_id} numero={state.numero} />
          )}
          <div className="flex gap-3">
            <Link
              href="/ingresos/nuevo"
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Nueva entrada
            </Link>
            <Link
              href="/ingresos"
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Ver entradas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const a = orden?.accesorios;

  // ── Formulario (alta o edición) ──────────────────────────────
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? `Editar entrada N° ${orden!.numero}` : "Registrar entrada de equipo"}
        </h1>
        <Link href="/ingresos" className="text-sm text-gray-500 hover:text-gray-800">
          ← Volver al listado
        </Link>
      </div>

      {state && "error" in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}
      {isEdit && state && "success" in state && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
          Cambios guardados correctamente.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* ── Cliente ── */}
        <Section title="Cliente">
          <div>
            <Label htmlFor="cliente-input" required>Razón social</Label>
            <ClienteAutocomplete
              clientes={clientes}
              initialSelected={orden?.cliente ?? null}
            />
          </div>
        </Section>

        {/* ── Equipo ── */}
        <Section title="Equipo">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="marca">Marca</Label>
              <input id="marca" name="marca" defaultValue={orden?.marca ?? ""} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <input id="modelo" name="modelo" defaultValue={orden?.modelo ?? ""} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="numero_serie">N° de serie</Label>
              <input id="numero_serie" name="numero_serie" defaultValue={orden?.numero_serie ?? ""} className={inputCls} />
            </div>
          </div>

          <div className="sm:w-48">
            <Label htmlFor="estacion">Estación</Label>
            <select id="estacion" name="estacion" defaultValue={orden?.estacion ?? ""} className={inputCls}>
              <option value="">— Seleccionar —</option>
              {ESTACIONES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </Section>

        {/* ── Accesorios ── */}
        <Section title="Accesorios entregados">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {ACCESORIOS.map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name={name}
                  defaultChecked={a ? a[name] : false}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* ── Problema reportado ── */}
        <Section title="Problema reportado">
          <div>
            <Label htmlFor="deficiencia">Deficiencia</Label>
            <textarea
              id="deficiencia"
              name="deficiencia"
              rows={3}
              defaultValue={orden?.deficiencia ?? ""}
              placeholder="Describí el problema que reporta el cliente..."
              className={textareaCls}
            />
          </div>
        </Section>

        {/* ── Observaciones ── */}
        <Section title="Observaciones">
          <textarea
            id="observaciones"
            name="observaciones"
            rows={2}
            defaultValue={orden?.observaciones ?? ""}
            placeholder="Observaciones internas..."
            className={textareaCls}
          />
        </Section>

        {/* ── Recepción ── */}
        <Section title="Recepción">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entrego">Entregó</Label>
              <input id="entrego" name="entrego" defaultValue={orden?.entrego ?? ""} placeholder="Nombre de quien trajo el equipo" className={inputCls} />
            </div>
            <div>
              <Label htmlFor="quien_recibio">Recibió</Label>
              <input
                id="quien_recibio"
                name="quien_recibio"
                defaultValue={isEdit ? orden?.quien_recibio ?? "" : nombreUsuario ?? ""}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tecnico">Técnico asignado</Label>
              <select id="tecnico" name="tecnico" defaultValue={orden?.tecnico ?? ""} className={inputCls}>
                <option value="">— Sin asignar —</option>
                {tecnicos.map((t) => (
                  <option key={t.id} value={t.nombre}>{t.nombre}</option>
                ))}
                {/* Si el técnico guardado ya no está activo, preservar el valor */}
                {orden?.tecnico && !tecnicos.some((t) => t.nombre === orden.tecnico) && (
                  <option value={orden.tecnico}>{orden.tecnico}</option>
                )}
              </select>
            </div>
            <div>
              <Label htmlFor="fecha_ingreso" required>Fecha de ingreso</Label>
              <input
                id="fecha_ingreso"
                name="fecha_ingreso"
                type="date"
                defaultValue={orden?.fecha_ingreso ?? today}
                required
                className={inputCls}
              />
            </div>
          </div>
        </Section>

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar entrada"}
          </button>
          <Link
            href="/ingresos"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
