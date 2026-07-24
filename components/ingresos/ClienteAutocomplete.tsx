"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Tables } from "@/lib/database.types";
import NuevoClienteModal from "./NuevoClienteModal";

type Cliente = Pick<Tables<"clientes">, "id" | "razon_social" | "localidad" | "telefono1">;

type Props = {
  clientes: Tables<"clientes">[];
  initialSelected?: { id: string; razon_social: string } | null;
};

export default function ClienteAutocomplete({
  clientes: initialClientes,
  initialSelected = null,
}: Props) {
  const [clientes, setClientes] = useState<Tables<"clientes">[]>(initialClientes);
  const [query, setQuery] = useState(initialSelected?.razon_social ?? "");
  const [selected, setSelected] = useState<Cliente | null>(
    initialSelected
      ? {
          id: initialSelected.id,
          razon_social: initialSelected.razon_social,
          localidad: null,
          telefono1: null,
        }
      : null
  );
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = query.length > 0
    ? clientes
        .filter((c) => c.razon_social.toLowerCase().includes(query.toLowerCase()))
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

  function handleSelect(c: Tables<"clientes">) {
    setSelected(c);
    setQuery(c.razon_social);
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setSelected(null);
    setOpen(true);
  }

  const handleClienteCreado = useCallback((nuevoCliente: Tables<"clientes">) => {
    setClientes((prev) =>
      [...prev, nuevoCliente].sort((a, b) =>
        a.razon_social.localeCompare(b.razon_social)
      )
    );
    handleSelect(nuevoCliente);
    setShowModal(false);
  }, []);

  return (
    <>
      <div ref={wrapperRef} className="relative">
        {/* Hidden input que va al FormData */}
        <input type="hidden" name="cliente_id" value={selected?.id ?? ""} />

        <input
          type="text"
          placeholder="Buscar por razón social..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setOpen(true)}
          autoComplete="off"
          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            selected ? "border-indigo-400 bg-indigo-50" : "border-gray-300"
          }`}
        />

        {selected && (
          <button
            type="button"
            onClick={() => { setSelected(null); setQuery(""); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            title="Limpiar selección"
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
                  onClick={() => handleSelect(c)}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{c.razon_social}</span>
                  {c.localidad && (
                    <span className="text-gray-400 ml-2 text-xs">{c.localidad}</span>
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
              onClick={() => { setOpen(false); setShowModal(true); }}
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
        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
      >
        + Crear nuevo cliente
      </button>

      {showModal && (
        <NuevoClienteModal
          onCreado={handleClienteCreado}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
