import { redirect } from "next/navigation";

// La pantalla vieja de "Salida de equipos" quedó fusionada en "Equipos".
// Se redirige para que no sea accesible; las sub-rutas (/ordenes/registrar,
// /ordenes/[id]/salida, /ordenes/[id]) siguen funcionando porque son rutas propias.
export default function OrdenesIndexRedirect() {
  redirect("/equipos");
}
