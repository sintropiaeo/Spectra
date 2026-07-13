// =============================================================
// SPECTRA — Configuración de impresión de remitos manuales
//
// Coordenadas (en milímetros) de cada dato variable sobre el papel
// físico pre-impreso con CAI. El origen (0,0) es la esquina SUPERIOR
// IZQUIERDA de la hoja A4. x crece hacia la derecha, y hacia abajo.
//
// IMPORTANTE: estos valores son PLACEHOLDERS aproximados sacados a ojo
// de una foto. Hay que calibrarlos imprimiendo con "marcas de
// calibración" activadas y superponiendo contra un remito real.
// Ajustar acá y volver a imprimir hasta que calce. No hardcodear
// posiciones dentro del componente PDF.
// =============================================================

export type CampoCoord = {
  x_mm: number;
  y_mm: number;
  maxWidth_mm: number;
  maxHeight_mm?: number;
};

// -------------------------------------------------------------
// Campos del encabezado (uno solo por remito)
// -------------------------------------------------------------
export const REMITO_COORDS = {
  fecha: { x_mm: 150, y_mm: 40, maxWidth_mm: 40 },
  razonSocial: { x_mm: 45, y_mm: 62, maxWidth_mm: 90 },
  domicilio: { x_mm: 140, y_mm: 62, maxWidth_mm: 60 },
  condicionIva: { x_mm: 45, y_mm: 78, maxWidth_mm: 60 },
  cuit: { x_mm: 150, y_mm: 78, maxWidth_mm: 50 },
} satisfies Record<string, CampoCoord>;

export type RemitoCampo = keyof typeof REMITO_COORDS;

// -------------------------------------------------------------
// Tabla de ítems (varias filas: cantidad + detalle por fila).
// `y_mm` es la Y de la PRIMERA fila. Cada fila siguiente baja
// `filaAltura_mm`. `filasMax` = cuántos renglones tiene el papel.
// -------------------------------------------------------------
export const REMITO_TABLA = {
  y_mm: 100, // Y de la primera fila
  filaAltura_mm: 8, // separación vertical entre filas
  filasMax: 12, // renglones disponibles en el papel físico
  cantidad: { x_mm: 20, maxWidth_mm: 25 },
  detalle: { x_mm: 55, maxWidth_mm: 130 },
};

export type RemitoItem = { cantidad: string; detalle: string };

// -------------------------------------------------------------
// Shape serializable de la calibración (lo que se guarda en jsonb
// en remito_print_config.coords). Combina los campos del encabezado
// con la configuración de la tabla de ítems.
// -------------------------------------------------------------
export type ColCoord = { x_mm: number; maxWidth_mm: number };

export type RemitoTablaCoords = {
  y_mm: number;
  filaAltura_mm: number;
  filasMax: number;
  cantidad: ColCoord;
  detalle: ColCoord;
};

export type RemitoPrintCoords = {
  campos: Record<RemitoCampo, CampoCoord>;
  tabla: RemitoTablaCoords;
};

// Defaults = los placeholders actuales (fuente de verdad si no hay
// fila guardada para la empresa).
export const DEFAULT_REMITO_COORDS: RemitoPrintCoords = {
  campos: { ...REMITO_COORDS },
  tabla: { ...REMITO_TABLA },
};

function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Fusiona lo guardado (jsonb, posiblemente parcial o inválido) sobre
// los defaults, garantizando siempre un objeto completo y numérico.
export function mergeCoords(saved: unknown): RemitoPrintCoords {
  if (!saved || typeof saved !== "object") return DEFAULT_REMITO_COORDS;
  const s = saved as {
    campos?: Record<string, Partial<CampoCoord>>;
    tabla?: Partial<RemitoTablaCoords> & {
      cantidad?: Partial<ColCoord>;
      detalle?: Partial<ColCoord>;
    };
  };

  const campos = {} as Record<RemitoCampo, CampoCoord>;
  (Object.keys(DEFAULT_REMITO_COORDS.campos) as RemitoCampo[]).forEach((k) => {
    const d = DEFAULT_REMITO_COORDS.campos[k];
    const sv = s.campos?.[k] ?? {};
    campos[k] = {
      x_mm: num(sv.x_mm, d.x_mm),
      y_mm: num(sv.y_mm, d.y_mm),
      maxWidth_mm: num(sv.maxWidth_mm, d.maxWidth_mm),
    };
  });

  const dt = DEFAULT_REMITO_COORDS.tabla;
  const st = s.tabla ?? {};
  const tabla: RemitoTablaCoords = {
    y_mm: num(st.y_mm, dt.y_mm),
    filaAltura_mm: num(st.filaAltura_mm, dt.filaAltura_mm),
    filasMax: Math.max(1, Math.round(num(st.filasMax, dt.filasMax))),
    cantidad: {
      x_mm: num(st.cantidad?.x_mm, dt.cantidad.x_mm),
      maxWidth_mm: num(st.cantidad?.maxWidth_mm, dt.cantidad.maxWidth_mm),
    },
    detalle: {
      x_mm: num(st.detalle?.x_mm, dt.detalle.x_mm),
      maxWidth_mm: num(st.detalle?.maxWidth_mm, dt.detalle.maxWidth_mm),
    },
  };

  return { campos, tabla };
}

// -------------------------------------------------------------
// Conversión mm → puntos PDF (react-pdf trabaja en pt).
// 1 mm = 2.83465 pt (72 pt por pulgada, 25.4 mm por pulgada).
// -------------------------------------------------------------
export const MM_TO_PT = 2.83465;

export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

// -------------------------------------------------------------
// Tipografía de impresión.
// -------------------------------------------------------------
export const PRINT_FONT_SIZE = 10; // pt, para todos los campos

// -------------------------------------------------------------
// Estimación (aproximada) de si los ítems entran en el espacio.
// Sirve para avisar en pantalla ANTES de imprimir. Heurística:
// asume ancho de caracter promedio en Helvetica.
// -------------------------------------------------------------
const AVG_CHAR_WIDTH_RATIO = 0.5; // ancho medio de char ≈ 0.5 × fontSize

export function charsPorLineaDetalle(): number {
  const maxWidthPt = mmToPt(REMITO_TABLA.detalle.maxWidth_mm);
  const charWidthPt = PRINT_FONT_SIZE * AVG_CHAR_WIDTH_RATIO;
  return Math.max(1, Math.floor(maxWidthPt / charWidthPt));
}

export function estimateItemsCapacity(items: RemitoItem[]): {
  filasUsadas: number;
  filasMax: number;
  charsPorLinea: number;
  algunoLargo: boolean;
  fits: boolean;
} {
  const charsPorLinea = charsPorLineaDetalle();
  const conContenido = items.filter(
    (it) => (it.cantidad?.trim() || it.detalle?.trim())
  );
  const algunoLargo = conContenido.some(
    (it) => (it.detalle?.length ?? 0) > charsPorLinea
  );
  const filasUsadas = conContenido.length;
  return {
    filasUsadas,
    filasMax: REMITO_TABLA.filasMax,
    charsPorLinea,
    algunoLargo,
    fits: filasUsadas <= REMITO_TABLA.filasMax && !algunoLargo,
  };
}
