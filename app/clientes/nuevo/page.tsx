import Link from "next/link";
import ClienteForm from "@/components/clientes/ClienteForm";
import { createCliente } from "../actions";

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Clientes
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo cliente</h1>
      </div>
      <ClienteForm action={createCliente} />
    </div>
  );
}
