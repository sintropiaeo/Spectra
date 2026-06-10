export type OrdenPDFData = {
  orden: {
    id: string;
    numero: number;
    fecha_ingreso: string;
    marca: string | null;
    modelo: string | null;
    numero_serie: string | null;
    estacion: string | null;
    deficiencia: string | null;
    observaciones: string | null;
    entrego: string | null;
    quien_recibio: string | null;
    tecnico: string | null;
  };
  cliente: {
    razon_social: string;
    direccion: string | null;
    localidad: string | null;
    provincia: string | null;
    codigo_postal: string | null;
    telefono1: string | null;
    contacto: string | null;
  };
  accesorios: {
    microfono: boolean;
    fuente: boolean;
    cable: boolean;
    pack: boolean;
    antena: boolean;
    cargador: boolean;
    crem: boolean;
  } | null;
  config: {
    nombre_empresa: string | null;
    direccion: string | null;
    cuit: string | null;
  } | null;
};
