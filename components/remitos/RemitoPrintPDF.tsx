import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  REMITO_COORDS,
  RemitoCampo,
  CampoCoord,
  mmToPt,
  PRINT_FONT_SIZE,
  DETALLE_FONT_SIZE,
  DETALLE_LINE_HEIGHT,
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
    width: 6,
    backgroundColor: "#9ca3af",
  },
  calibLineV: {
    position: "absolute",
    width: 0.5,
    height: 6,
    backgroundColor: "#9ca3af",
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

// Marca "+" centrada exactamente en (xPt, yPt) + etiqueta del campo.
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
      {/* Caja del área disponible (gris muy claro, punteada) */}
      <View
        style={[
          s.calibBox,
          { left: xPt, top: yPt, width: widthPt, height: heightPt },
        ]}
      />
      {/* Crucecita en el ancla (top-left del texto) */}
      <View style={[s.calibLineH, { left: xPt - 3, top: yPt }]} />
      <View style={[s.calibLineV, { left: xPt, top: yPt - 3 }]} />
      <Text style={[s.calibLabel, { left: xPt + 4, top: yPt - 4 }]}>{label}</Text>
    </>
  );
}

export function RemitoPrintPDF({
  data,
  calibration = false,
}: {
  data: RemitoImpresion;
  calibration?: boolean;
}) {
  // Valor de texto por campo
  const valores: Record<RemitoCampo, string> = {
    fecha: fmtDate(data.fecha),
    razonSocial: data.razon_social ?? "",
    domicilio: data.domicilio ?? "",
    condicionIva: data.condicion_iva ?? "",
    cuit: data.cuit ?? "",
    cantidad: data.cantidad ?? "",
    detalle: data.detalle ?? "",
  };

  const campos = Object.keys(REMITO_COORDS) as RemitoCampo[];

  return (
    <Document title="Remito (impresión)">
      <Page size="A4" style={s.page}>
        {campos.map((campo) => {
          const c: CampoCoord = REMITO_COORDS[campo];
          const xPt = mmToPt(c.x_mm);
          const yPt = mmToPt(c.y_mm);
          const widthPt = mmToPt(c.maxWidth_mm);
          const esDetalle = campo === "detalle";
          const heightPt = mmToPt(c.maxHeight_mm ?? (esDetalle ? 150 : 8));

          return (
            <View key={campo}>
              <Text
                style={[
                  s.campo,
                  {
                    left: xPt,
                    top: yPt,
                    width: widthPt,
                    fontSize: esDetalle ? DETALLE_FONT_SIZE : PRINT_FONT_SIZE,
                    ...(esDetalle
                      ? {
                          height: heightPt,
                          lineHeight: DETALLE_LINE_HEIGHT,
                          overflow: "hidden",
                        }
                      : {}),
                  },
                ]}
              >
                {valores[campo]}
              </Text>

              {calibration && (
                <CalibMark
                  xPt={xPt}
                  yPt={yPt}
                  label={campo}
                  widthPt={widthPt}
                  heightPt={heightPt}
                />
              )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}
