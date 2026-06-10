export type NavItem = {
  label: string;
  href: string;
  roles?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clientes", href: "/clientes" },
  { label: "Ingresos", href: "/ingresos" },
  { label: "Órdenes", href: "/ordenes" },
  { label: "Alertas", href: "/alertas" },
  { label: "Consultas", href: "/consultas" },
  { label: "Configuración", href: "/configuracion", roles: ["admin", "superadmin"] },
];
