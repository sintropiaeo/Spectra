"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useActionState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tables } from "@/lib/database.types";
import {
  createRemito,
  updateRemito,
  RemitoState,
} from "@/app/(protected)/remitos/actions";
import { estimateItemsCapacity, RemitoItem } from "@/lib/remitoPrintConfig";
import { CONDICIONES_IVA } from "@/lib/constants";
import NuevoClienteModal from "@/components/ingresos/NuevoClienteModal";
import ImprimirRemitoButton from "./ImprimirRemitoButton";

type Props = {
  clientes: Tables<"clientes">[];
  remito?: Tables<"remitos_manuales">;
};


const hoy = () => new Date().toISOString().slice(0, 10);

function itemsIniciales(remito?: Tables<"remitos_manuales">): RemitoItem[] {
  const arr = Array.isArray(remito?.items)
    ? (remito!.items as unknown as RemitoItem[])
    : [];
  const limpios = arr.map((it) => ({
    cantidad: String(it?.cantidad ?? ""),
    detalle: String(it?.detalle ?? ""),
  }));
  return limpios.length > 0 ? limpios : [{ cantidad: "", detalle: "" }];
}

export default function RemitoForm({ clientes: initialClientes, remito }: Props) {
  const isEdit = !!remito;
  const router = useRouter();

  const action = isEdit
    ? updateRemito.bind(null, remito!.id)
    : createRemito;
  const [state, formAction, isPending] = useActionState<RemitoState, FormData>(
    action,
    null
  );

  // ── Estado de campos (controlados, para poder autocompletar) ──
  const [clientes, setClientes] = useState(initialClientes);
  const [clienteId, setClienteId] = useState(remito?.cliente_id ?? "");
  const [razonSocial, setRazonSocial] = useState(remito?.razon_social ?? "");
  const [domicilio, setDomicilio] = useState(remito?.domicilio ?? "");
  const [condicionIva, setCondicionIva] = useState(remito?.condicion_iva ?? "");
  const [cuit, setCuit] = useState(remito?.cuit ?? "");
  const [fecha, setFecha] = useState(remito?.fecha ?? hoy());
  const [numeroFisico, setNumeroFisico] = useState(remito?.numero_fisico ?? "");
  const [items, setItems] = useState<RemitoItem[]>(() => itemsIniciales(remito));

  function updateItem(i: number, campo: keyof RemitoItem, valor: string) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it))
    );
  }
  function addItem() {
    setItems((prev) => [...prev, { cantidad: "", detalle: "" }]);
  }
  function removeItem(i: number) {
    setItems((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev
    );
  }

  // ── Buscador de cliente (misma lógica que ClienteAutocomplete) ──
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions =
    query.length > 0
      ? clientes
          .filter((c) =>
            c.razon_social.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8)
      : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Al seleccionar cliente: autocompletar snapshots (editables después).
  // clientes no guarda CUIT ni condición IVA, así que esos quedan manuales.
  function seleccionarCliente(c: Tables<"clientes">) {
    setClienteId(c.id);
    setRazonSocial(c.razon_social);
    setDomicilio(c.direccion ?? "");
    setQuery(c.razon_social);
    setOpen(false);
  }

  const handleClienteCreado = useCallback(
    (nuevo: Tables<"clientes">) => {
      setClientes((prev) =>
        [...prev, nuevo].sort((a, b) =>
          a.razon_social.localeCompare(b.razon_social)
        )
      );
      seleccionarCliente(nuevo);
      setShowModal(false);
    },
    []
  );

  // ── Redirigir a edición tras CREAR (para habilitar impresión) ──
  useEffect(() => {
    if (!isEdit && state && "success" in state) {
      router.push(`/remitos/${state.id}/editar`);
    }
  }, [state, isEdit, router]);

  const capacidad = estimateItemsCapacity(items);
  const guardadoOk = isEdit && state && "success" in state;

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Editar remito" : "Nuevo remito"}
        </h1>
        <Link
          href="/remitos"
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Volver al listado
        </Link>
      </div>

      {state && "error" in state && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}
      {guardadoOk && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
          Cambios guardados correctamente.
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Campos ocultos que van al FormData */}
        <input type="hidden" name="cliente_id" value={clienteId} />
        <input type="hidden" name="items" value={JSON.stringify(items)} />

        {/* ── Cliente ── */}
        <section className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Cliente
          </h2>

          <div ref={wrapperRef} className="relative">
            <input
              type="text"
              placeholder="Buscar cliente por razón social..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setClienteId("");
                setOpen(true);
              }}
              onFocus={() => query && setOpen(true)}
              autoComplete="off"
              className={`${inputCls} ${
                clienteId ? "border-indigo-400 bg-indigo-50" : ""
              }`}
            />
            {clienteId && (
              <button
                type="button"
                onClick={() => {
                  setClienteId("");
                  setQuery("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                title="Desvincular cliente"
              >
                ×
              </button>
            )}

            {open && suggestions.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-auto text-sm">
                {suggestions.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => seleccionarCliente(c)}
                      className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">
                        {c.razon_social}
                      </span>
                      {c.localidad && (
                        <span className="text-gray-400 ml-2 text-xs">
                          {c.localidad}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {open && query.length > 1 && suggestions.length === 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg px-4 py-3 text-sm text-gray-500">
                Sin resultados.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setShowModal(true);
                  }}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Crear &ldquo;{query}&rdquo;
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            + Crear cliente nuevo
          </button>
          <p className="text-xs text-gray-400">
            Podés dejar sin vincular y cargar los datos a mano. Al seleccionar un
            cliente se completan razón social y domicilio (editables); CUIT y
            condición de IVA se cargan a mano.
          </p>
        </section>

        {/* ── Datos del destinatario (snapshot editable) ── */}
        <section className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Datos del destinatario
          </h2>

          <div>
            <label htmlFor="razon_social" className={labelCls}>
              Razón social <span className="text-red-500">*</span>
            </label>
            <input
              id="razon_social"
              name="razon_social"
              required
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="domicilio" className={labelCls}>
              Domicilio
            </label>
            <input
              id="domicilio"
              name="domicilio"
              value={domicilio}
              onChange={(e) => setDomicilio(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="condicion_iva" className={labelCls}>
                Condición de IVA
              </label>
              <input
                id="condicion_iva"
                name="condicion_iva"
                list="condiciones-iva"
                value={condicionIva}
                onChange={(e) => setCondicionIva(e.target.value)}
                className={inputCls}
              />
              <datalist id="condiciones-iva">
                {CONDICIONES_IVA.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="cuit" className={labelCls}>
                CUIT
              </label>
              <input
                id="cuit"
                name="cuit"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* ── Comprobante ── */}
        <section className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Comprobante
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className={labelCls}>
                Fecha
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="numero_fisico" className={labelCls}>
                N° de remito (papel físico)
              </label>
              <input
                id="numero_fisico"
                name="numero_fisico"
                value={numeroFisico}
                onChange={(e) => setNumeroFisico(e.target.value)}
                placeholder="Solo para búsqueda interna"
                className={inputCls}
              />
            </div>
          </div>

          {/* Ítems: una fila por renglón del papel físico */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={labelCls + " mb-0"}>Ítems (filas)</label>
              <span className="text-xs text-gray-400">
                {capacidad.filasUsadas} de ~{capacidad.filasMax} renglones
              </span>
            </div>

            {/* Cabecera de columnas */}
            <div className="flex gap-2 px-1">
              <span className="w-28 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Cantidad
              </span>
              <span className="flex-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Detalle
              </span>
              <span className="w-8 shrink-0" />
            </div>

            {items.map((it, i) => {
              const detalleLargo = (it.detalle?.length ?? 0) > capacidad.charsPorLinea;
              return (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-28 shrink-0">
                    <input
                      aria-label={`Cantidad fila ${i + 1}`}
                      value={it.cantidad}
                      onChange={(e) => updateItem(i, "cantidad", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      aria-label={`Detalle fila ${i + 1}`}
                      value={it.detalle}
                      onChange={(e) => updateItem(i, "detalle", e.target.value)}
                      className={`${inputCls} ${
                        detalleLargo ? "border-amber-400" : ""
                      }`}
                    />
                    {detalleLargo && (
                      <p className="mt-0.5 text-xs text-amber-600">
                        Puede no entrar en el ancho del renglón (~
                        {capacidad.charsPorLinea} caracteres).
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    title="Eliminar fila"
                    className="w-8 shrink-0 h-[38px] flex items-center justify-center text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addItem}
              className="mt-1 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              + Agregar fila
            </button>

            {capacidad.filasUsadas > capacidad.filasMax && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠ Cargaste {capacidad.filasUsadas} filas y el papel admite ~
                {capacidad.filasMax}. Las últimas pueden no entrar; revisá la
                calibración o usá otro remito.
              </p>
            )}
          </div>
        </section>

        {/* ── Acciones ── */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar"}
          </button>

          {isEdit ? (
            <ImprimirRemitoButton remitoId={remito!.id} showCalibration />
          ) : (
            <span className="text-xs text-gray-400">
              Guardá el remito para habilitar la impresión.
            </span>
          )}
        </div>
      </form>

      {showModal && (
        <NuevoClienteModal
          onCreado={handleClienteCreado}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
