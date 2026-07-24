import { redirect } from "next/navigation";

// La pantalla vieja de "Entrada de equipos" quedó fusionada en "Equipos".
// Se redirige para que no sea accesible; las sub-rutas (/ingresos/nuevo y
// /ingresos/[id]/editar) siguen funcionando porque son rutas propias.
export default function IngresosIndexRedirect() {
  redirect("/equipos");
}
