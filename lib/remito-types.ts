export type RemitoPDFData = {
  orden: {
    id: string;
    numero: number;
    fecha_salida: string | null;
    tecnico: string | null;
    moneda: string;
    aplica_iva: boolean;
    mostrar_cotizacion: boolean;
    cotizacion: number | null;
    marca: string | null;
    modelo: string | null;
    numero_serie: string | null;
    estacion: string | null;
  };
  cliente: {
    razon_social: string;
    direccion: string | null;
    localidad: string | null;
    provincia: string | null;
    telefono1: string | null;
  };
  items: {
    cantidad: number | null;
    detalle: string | null;
    precio: number | null;
    importe: number | null;
  }[];
  config: {
    nombre_empresa: string | null;
    direccion: string | null;
    cuit: string | null;
  } | null;
};
