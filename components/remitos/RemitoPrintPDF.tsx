import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  DEFAULT_REMITO_COORDS,
  RemitoPrintCoords,
  RemitoCampo,
  CampoCoord,
  mmToPt,
  PRINT_FONT_SIZE,
} from "@/lib/remitoPrintConfig";
import type { RemitoImpresion } from "@/app/(protected)/remitos/actions";

function fmtDate(d: string | null) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: PRINT_FONT_SIZE,
    color: "#000000",
    // Sin padding: las coordenadas son absolutas desde la esquina de la hoja
  },
  campo: {
    position: "absolute",
    color: "#000000",
  },
  // Calibración
  calibLineH: {
    position: "absolute",
    height: 0.5,
    backgroundColor: "#9ca3af",
  },
  calibLineV: {
    position: "absolute",
    width: 0.5,
    backgroundColor: "#9ca3af",
  },
  calibRowLine: {
    position: "absolute",
    height: 0.3,
    backgroundColor: "#d1d5db",
  },
  calibLabel: {
    position: "absolute",
    fontSize: 5,
    color: "#9ca3af",
  },
  calibBox: {
    position: "absolute",
    borderWidth: 0.4,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
});

// Crucecita "+" centrada en (xPt,yPt) + etiqueta + caja del área.
function CalibMark({
  xPt,
  yPt,
  label,
  widthPt,
  heightPt,
}: {
  xPt: number;
  yPt: number;
  label: string;
  widthPt: number;
  heightPt: number;
}) {
  return (
    <>
      <View
        style={[s.calibBox, { left: xPt, top: yPt, width: widthPt, height: heightPt }]}
      />
      <View style={[s.calibLineH, { left: xPt - 3, top: yPt, width: 6 }]} />
      <View style={[s.calibLineV, { left: xPt, top: yPt - 3, height: 6 }]} />
      <Text style={[s.calibLabel, { left: xPt + 4, top: yPt - 4 }]}>{label}</Text>
    </>
  );
}

export function RemitoPrintPDF({
  data,
  coords = DEFAULT_REMITO_COORDS,
  calibration = false,
}: {
  data: RemitoImpresion;
  coords?: RemitoPrintCoords;
  calibration?: boolean;
}) {
  const { campos: campoCoords, tabla } = coords;

  // ── Campos del encabezado ──
  const valores: Record<RemitoCampo, string> = {
    fecha: fmtDate(data.fecha),
    razonSocial: data.razon_social ?? "",
    domicilio: data.domicilio ?? "",
    condicionIva: data.condicion_iva ?? "",
    cuit: data.cuit ?? "",
  };
  const campos = Object.keys(campoCoords) as RemitoCampo[];

  // ── Ítems (filas de la tabla) ──
  const items = (data.items ?? []).slice(0, tabla.filasMax);
  const cantCol = tabla.cantidad;
  const detCol = tabla.detalle;
  const tablaXPt = mmToPt(cantCol.x_mm);
  const tablaWidthPt =
    mmToPt(detCol.x_mm + detCol.maxWidth_mm) - mmToPt(cantCol.x_mm);
  const tablaTopPt = mmToPt(tabla.y_mm);
  const filaAltPt = mmToPt(tabla.filaAltura_mm);

  return (
    <Document title="Remito (impresión)">
      <Page size="A4" style={s.page}>
        {/* ── Encabezado ── */}
        {campos.map((campo) => {
          const c: CampoCoord = campoCoords[campo];
          const xPt = mmToPt(c.x_mm);
          const yPt = mmToPt(c.y_mm);
          const widthPt = mmToPt(c.maxWidth_mm);
          return (
            <View key={campo}>
              <Text style={[s.campo, { left: xPt, top: yPt, width: widthPt }]}>
                {valores[campo]}
              </Text>
              {calibration && (
                <CalibMark
                  xPt={xPt}
                  yPt={yPt}
                  label={campo}
                  widthPt={widthPt}
                  heightPt={mmToPt(6)}
                />
              )}
            </View>
          );
        })}

        {/* ── Filas de ítems ── */}
        {items.map((it, i) => {
          const yPt = mmToPt(tabla.y_mm + i * tabla.filaAltura_mm);
          return (
            <View key={`item-${i}`}>
              <Text
                style={[
                  s.campo,
                  { left: mmToPt(cantCol.x_mm), top: yPt, width: mmToPt(cantCol.maxWidth_mm) },
                ]}
              >
                {it.cantidad}
              </Text>
              <Text
                style={[
                  s.campo,
                  { left: mmToPt(detCol.x_mm), top: yPt, width: mmToPt(detCol.maxWidth_mm) },
                ]}
              >
                {it.detalle}
              </Text>
            </View>
          );
        })}

        {/* ── Calibración de la tabla ── */}
        {calibration && (
          <View>
            {/* Caja del área total de la tabla */}
            <View
              style={[
                s.calibBox,
                {
                  left: tablaXPt,
                  top: tablaTopPt,
                  width: tablaWidthPt,
                  height: filaAltPt * tabla.filasMax,
                },
              ]}
            />
            {/* Líneas de cada renglón */}
            {Array.from({ length: tabla.filasMax + 1 }).map((_, k) => (
              <View
                key={`rowline-${k}`}
                style={[
                  s.calibRowLine,
                  { left: tablaXPt, top: tablaTopPt + k * filaAltPt, width: tablaWidthPt },
                ]}
              />
            ))}
            {/* Cruces en las columnas (primera fila) */}
            <CalibMark
              xPt={mmToPt(cantCol.x_mm)}
              yPt={tablaTopPt}
              label="cantidad"
              widthPt={mmToPt(cantCol.maxWidth_mm)}
              heightPt={filaAltPt}
            />
            <CalibMark
              xPt={mmToPt(detCol.x_mm)}
              yPt={tablaTopPt}
              label="detalle"
              widthPt={mmToPt(detCol.maxWidth_mm)}
              heightPt={filaAltPt}
            />
          </View>
        )}
      </Page>
    </Document>
  );
}
