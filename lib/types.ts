export type NavItem = {
  label: string;
  href: string;
  roles?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Entradas Equipos", href: "/ingresos" },
  { label: "Salidas Equipos", href: "/ordenes" },
  { label: "Clientes", href: "/clientes" },
  { label: "Remitos", href: "/remitos" },
  // Alertas OCULTO temporalmente (solo UI). La ruta /alertas y su lógica
  // siguen intactas; descomentar esta línea para reactivar el botón.
  // { label: "Alertas", href: "/alertas" },
  { label: "Consultas", href: "/consultas" },
  { label: "Configuración", href: "/configuracion", roles: ["admin", "superadmin"] },
];
