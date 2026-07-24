export type NavItem = {
  label: string;
  href: string;
  roles?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Equipos", href: "/equipos" },
  { label: "Clientes", href: "/clientes" },
  { label: "Remitos", href: "/remitos" },
  { label: "Configuración", href: "/configuracion", roles: ["admin", "superadmin"] },
];

// Ítems OCULTOS de la navegación (mismo criterio que Alertas: rutas y
// componentes intactos, solo salen del menú). "Entradas Equipos",
// "Salidas Equipos" y "Consultas" quedaron fusionados en "Equipos".
// Para reactivar alguno, volver a agregarlo al array de arriba:
//   { label: "Entradas Equipos", href: "/ingresos" },
//   { label: "Salidas Equipos", href: "/ordenes" },
//   { label: "Consultas", href: "/consultas" },
//   { label: "Alertas", href: "/alertas" },
