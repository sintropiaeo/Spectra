"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/lib/types";
import { Tables } from "@/lib/database.types";
import { logout } from "@/app/login/actions";

type Props = {
  perfil: Tables<"perfiles"> | null;
  alertCount?: number;
  navItems: NavItem[];
};

const ROL_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  tecnico: "Técnico",
  lectura: "Lectura",
};

export default function Sidebar({ perfil, alertCount = 0, navItems }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-xl font-bold tracking-widest text-white">
          SPECTRA
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="flex-1">{item.label}</span>
              {item.href === "/alertas" && alertCount > 0 && (
                <span className="text-xs font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-tight">
                  {alertCount > 99 ? "99+" : alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700 space-y-3">
        {perfil && (
          <div className="px-1 space-y-0.5">
            <p className="text-sm font-medium text-white truncate">
              {perfil.nombre ?? "Sin nombre"}
            </p>
            <p className="text-xs text-gray-400">
              {ROL_LABELS[perfil.rol] ?? perfil.rol}
            </p>
          </div>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
