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

export const REMITO_COORDS = {
  fecha: { x_mm: 150, y_mm: 40, maxWidth_mm: 40 },
  razonSocial: { x_mm: 45, y_mm: 62, maxWidth_mm: 90 },
  domicilio: { x_mm: 140, y_mm: 62, maxWidth_mm: 60 },
  condicionIva: { x_mm: 45, y_mm: 78, maxWidth_mm: 60 },
  cuit: { x_mm: 150, y_mm: 78, maxWidth_mm: 50 },
  cantidad: { x_mm: 20, y_mm: 100, maxWidth_mm: 20 },
  detalle: { x_mm: 55, y_mm: 100, maxWidth_mm: 130, maxHeight_mm: 150 },
} satisfies Record<string, CampoCoord>;

export type RemitoCampo = keyof typeof REMITO_COORDS;

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
export const DETALLE_FONT_SIZE = 10; // pt, para el bloque de detalle
export const DETALLE_LINE_HEIGHT = 1.25; // multiplicador

// -------------------------------------------------------------
// Estimación (aproximada) de si el texto de `detalle` entra en el
// espacio disponible. Sirve para avisar en pantalla ANTES de imprimir.
// Es heurística: asume ancho de caracter promedio en Helvetica.
// -------------------------------------------------------------
const AVG_CHAR_WIDTH_RATIO = 0.5; // ancho medio de char ≈ 0.5 × fontSize (Helvetica)

export function estimateDetalleCapacity(detalle: string): {
  linesUsed: number;
  maxLines: number;
  fits: boolean;
} {
  const { maxWidth_mm, maxHeight_mm } = REMITO_COORDS.detalle;
  const maxWidthPt = mmToPt(maxWidth_mm);
  const maxHeightPt = mmToPt(maxHeight_mm ?? 150);

  const charWidthPt = DETALLE_FONT_SIZE * AVG_CHAR_WIDTH_RATIO;
  const charsPerLine = Math.max(1, Math.floor(maxWidthPt / charWidthPt));
  const lineHeightPt = DETALLE_FONT_SIZE * DETALLE_LINE_HEIGHT;
  const maxLines = Math.max(1, Math.floor(maxHeightPt / lineHeightPt));

  // Contar líneas considerando saltos manuales + wrap por ancho
  const paragraphs = (detalle ?? "").split("\n");
  let linesUsed = 0;
  for (const p of paragraphs) {
    linesUsed += Math.max(1, Math.ceil(p.length / charsPerLine));
  }

  return { linesUsed, maxLines, fits: linesUsed <= maxLines };
}
