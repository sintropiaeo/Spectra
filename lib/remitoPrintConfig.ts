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
