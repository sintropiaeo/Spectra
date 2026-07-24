import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { RemitoPDFData } from "@/lib/remito-types";
import { LOGO_COSTARELLI } from "@/lib/logoCostarelli";

// ── Helpers ──────────────────────────────────────────────────
function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function fmt2(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toFixed(2);
}

function fmtLocal(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Paleta ───────────────────────────────────────────────────
const C = {
  accent: "#1e3a5f",
  border: "#d1d5db",
  bg: "#f9fafb",
  text: "#111827",
  muted: "#4b5563",
  light: "#6b7280",
} as const;

// ── Estilos ───────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: C.text,
    paddingHorizontal: 28,
    paddingVertical: 22,
  },

  // Encabezado
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
  },
  empresa: { flex: 1 },
  empresaLogo: { width: 152, height: 32, marginBottom: 3, objectFit: "contain" },
  empresaSub: { fontSize: 7, color: C.muted, marginTop: 2.5 },

  // Caja "X" (comprobante no fiscal) — centrada en la hoja
  xWrap: { alignItems: "center", paddingHorizontal: 10 },
  xBox: {
    width: 42,
    height: 40,
    borderWidth: 1,
    borderColor: C.text,
    alignItems: "center",
    justifyContent: "center",
  },
  xLetter: { fontSize: 26, fontFamily: "Helvetica-Bold", color: C.text },

  // flex:1 en ambos lados → la caja X queda centrada en la página
  ordenBox: { flex: 1, alignItems: "flex-end" },
  ordenTitulo: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.accent },
  ordenSub: { fontSize: 7, color: C.muted, marginTop: 2.5 },

  // Banda "no válido como factura"
  noValidaBand: {
    borderTopWidth: 1.5,
    borderTopColor: C.accent,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingVertical: 6,
    marginTop: 4,
    marginBottom: 20,
    alignItems: "center",
  },
  noValidaText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.text,
    letterSpacing: 1,
  },

  // Dos columnas
  row2: { flexDirection: "row", gap: 6, marginBottom: 8 },
  col: { flex: 1, borderWidth: 0.5, borderColor: C.border, borderRadius: 2, overflow: "hidden" },

  // Sección
  section: {
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    backgroundColor: C.bg,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  sectionBody: { paddingHorizontal: 7, paddingVertical: 5 },

  // KV
  kv: { flexDirection: "row", marginBottom: 2 },
  kvKey: { fontSize: 7, color: C.light, width: 58, paddingTop: 1 },
  kvVal: { fontSize: 8, color: C.text, flex: 1, fontFamily: "Helvetica-Bold", marginLeft: 2 },

  // Tabla de items
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.bg,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  tableLastRow: { flexDirection: "row", paddingVertical: 3, paddingHorizontal: 7 },
  thCant:   { width: 32, fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", textAlign: "right" },
  thDetalle:{ flex: 1, fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", paddingLeft: 8 },
  thPrecio: { width: 72, fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", textAlign: "right" },
  thImporte:{ width: 72, fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", textAlign: "right" },
  tdCant:   { width: 32, fontSize: 8, textAlign: "right" },
  tdDetalle:{ flex: 1, fontSize: 8, paddingLeft: 8 },
  tdPrecio: { width: 72, fontSize: 8, textAlign: "right" },
  tdImporte:{ width: 72, fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "right" },

  // Totales
  totalesBox: { borderTopWidth: 1, borderTopColor: C.border, marginTop: 3, paddingTop: 4, paddingHorizontal: 7 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 },
  totalLabel: { fontSize: 7, color: C.muted, width: 130, textAlign: "right" },
  totalVal: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 75, textAlign: "right" },
  totalFinalLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.accent, width: 130, textAlign: "right" },
  totalFinalVal: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.accent, width: 75, textAlign: "right" },
  cotizacionBox: { marginTop: 4, paddingTop: 4, borderTopWidth: 0.5, borderTopColor: C.border },

  // Leyendas debajo del cuadro, alineadas a la derecha
  leyendas: { marginTop: 8, alignItems: "flex-end" },
  leyendaText: {
    fontSize: 7.5,
    color: C.text,
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
    textAlign: "right",
  },
});

// ── KV helper ─────────────────────────────────────────────────
function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <View style={s.kv}>
      <Text style={s.kvKey}>{k}:</Text>
      <Text style={s.kvVal}>{v || "—"}</Text>
    </View>
  );
}

// ── Documento ─────────────────────────────────────────────────
export function RemitoPDF({ data }: { data: RemitoPDFData }) {
  const { orden, cliente, items, config } = data;

  const moneda = orden.moneda ?? "USD";
  const ivaPct = 21;
  const subtotal = items.reduce((sum, i) => sum + (i.importe ?? 0), 0);
  const ivaAmount = orden.aplica_iva ? subtotal * (ivaPct / 100) : 0;
  const total = subtotal + ivaAmount;
  const cotizacionNum = orden.cotizacion ?? 0;
  const totalEnPesos =
    moneda === "USD" && orden.mostrar_cotizacion && cotizacionNum > 0
      ? total * cotizacionNum
      : null;

  // Leyendas al pie (según campos de la orden)
  const leyendaIva = orden.aplica_iva
    ? "Los precios incluyen I.V.A."
    : "Los precios no incluyen I.V.A.";
  const leyendaMoneda =
    moneda === "USD"
      ? "Los precios están expresados en dólares"
      : "Los precios están expresados en pesos";

  return (
    <Document
      title={`Orden N° ${orden.numero}`}
      author={config?.nombre_empresa ?? "SPECTRA"}
    >
      <Page size="A4" style={s.page}>
        {/* ── Encabezado estilo factura X ── */}
        <View style={s.header}>
          <View style={s.empresa}>
            <Image src={LOGO_COSTARELLI} style={s.empresaLogo} />
            {config?.direccion ? <Text style={s.empresaSub}>{config.direccion}</Text> : null}
            {config?.cuit ? <Text style={s.empresaSub}>CUIT: {config.cuit}</Text> : null}
          </View>

          <View style={s.xWrap}>
            <View style={s.xBox}>
              <Text style={s.xLetter}>X</Text>
            </View>
          </View>

          <View style={s.ordenBox}>
            <Text style={s.ordenTitulo}>ORDEN N° {orden.numero}</Text>
            <Text style={s.ordenSub}>Fecha de salida: {fmtDate(orden.fecha_salida)}</Text>
            {orden.tecnico ? <Text style={s.ordenSub}>Técnico: {orden.tecnico}</Text> : null}
          </View>
        </View>

        {/* Banda: no válido como factura */}
        <View style={s.noValidaBand}>
          <Text style={s.noValidaText}>DOCUMENTO NO VÁLIDO COMO FACTURA</Text>
        </View>

        {/* ── Cliente + Equipo ── */}
        <View style={s.row2}>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Cliente</Text>
            <View style={s.sectionBody}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.text, marginBottom: 4 }}>
                {cliente.razon_social}
              </Text>
              {cliente.direccion ? <KV k="Dirección" v={cliente.direccion} /> : null}
              <KV k="Localidad" v={[cliente.localidad, cliente.provincia].filter(Boolean).join(", ")} />
              <KV k="Teléfono" v={cliente.telefono1} />
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Equipo</Text>
            <View style={s.sectionBody}>
              <KV k="Marca" v={orden.marca} />
              <KV k="Modelo" v={orden.modelo} />
              <KV k="N° de serie" v={orden.numero_serie} />
              <KV k="Estación" v={orden.estacion} />
            </View>
          </View>
        </View>

        {/* ── Problema reportado + Observaciones (traídos de la entrada) ── */}
        <View style={s.row2}>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Problema reportado</Text>
            <View style={[s.sectionBody, { minHeight: 28 }]}>
              <Text style={{ fontSize: 8, color: C.text, lineHeight: 1.4 }}>
                {orden.deficiencia || "—"}
              </Text>
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Observaciones</Text>
            <View style={[s.sectionBody, { minHeight: 28 }]}>
              <Text style={{ fontSize: 8, color: C.text, lineHeight: 1.4 }}>
                {orden.observaciones || "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Trabajos realizados ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Trabajos realizados</Text>

          <View style={s.tableHeader}>
            <Text style={s.thCant}>Cant.</Text>
            <Text style={s.thDetalle}>Detalle</Text>
            <Text style={s.thPrecio}>Precio {moneda}</Text>
            <Text style={s.thImporte}>Importe</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={i === items.length - 1 ? s.tableLastRow : s.tableRow}>
              <Text style={s.tdCant}>{item.cantidad ?? 1}</Text>
              <Text style={s.tdDetalle}>{item.detalle ?? ""}</Text>
              <Text style={s.tdPrecio}>{fmt2(item.precio)}</Text>
              <Text style={s.tdImporte}>$ {fmt2(item.importe)}</Text>
            </View>
          ))}

          {/* Totales */}
          <View style={s.totalesBox}>
            {orden.aplica_iva && (
              <>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Subtotal {moneda}</Text>
                  <Text style={s.totalVal}>$ {fmt2(subtotal)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>IVA ({ivaPct}%)</Text>
                  <Text style={s.totalVal}>$ {fmt2(ivaAmount)}</Text>
                </View>
              </>
            )}
            <View style={s.totalRow}>
              <Text style={s.totalFinalLabel}>TOTAL {moneda}</Text>
              <Text style={s.totalFinalVal}>$ {fmt2(total)}</Text>
            </View>

            {totalEnPesos !== null && (
              <View style={s.cotizacionBox}>
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Cotización (ARS/USD)</Text>
                  <Text style={s.totalVal}>$ {fmtLocal(cotizacionNum)}</Text>
                </View>
                <View style={s.totalRow}>
                  <Text style={s.totalFinalLabel}>EQUIVALENTE ARS</Text>
                  <Text style={s.totalFinalVal}>$ {fmtLocal(totalEnPesos)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Dos leyendas debajo del cuadro, alineadas a la derecha */}
        <View style={s.leyendas}>
          <Text style={s.leyendaText}>{leyendaIva}</Text>
          <Text style={s.leyendaText}>{leyendaMoneda}</Text>
        </View>
      </Page>
    </Document>
  );
}
