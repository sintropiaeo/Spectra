import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { RemitoPDFData } from "@/lib/remito-types";

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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: C.accent,
    paddingBottom: 6,
    marginBottom: 8,
  },
  empresaNombre: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.accent },
  empresaSub: { fontSize: 7, color: C.muted, marginTop: 2 },
  remitoBox: { alignItems: "flex-end" },
  remitoTitulo: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.accent },
  remitoSub: { fontSize: 7, color: C.muted, marginTop: 2 },

  // Sección genérica
  section: {
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    backgroundColor: C.bg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  sectionBody: { paddingHorizontal: 7, paddingVertical: 5 },

  // Dos columnas
  row2: { flexDirection: "row", gap: 6, marginBottom: 6 },
  col: { flex: 1, borderWidth: 0.5, borderColor: C.border, borderRadius: 2, overflow: "hidden" },

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
  tableLastRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  thCant:   { width: 32, fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", textAlign: "right" },
  thDetalle:{ flex: 1, fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", paddingLeft: 8 },
  thPrecio: { width: 72, fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", textAlign: "right" },
  thImporte:{ width: 72, fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold", textAlign: "right" },
  tdCant:   { width: 32, fontSize: 8, textAlign: "right" },
  tdDetalle:{ flex: 1, fontSize: 8, paddingLeft: 8 },
  tdPrecio: { width: 72, fontSize: 8, textAlign: "right" },
  tdImporte:{ width: 72, fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "right" },

  // Totales
  totalesBox: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 3,
    paddingTop: 4,
    paddingHorizontal: 7,
  },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 },
  totalLabel: { fontSize: 7, color: C.muted, width: 130, textAlign: "right" },
  totalVal: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 75, textAlign: "right" },
  totalFinalLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.accent, width: 130, textAlign: "right" },
  totalFinalVal: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.accent, width: 75, textAlign: "right" },
  cotizacionBox: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },

  // Footer
  footer: {
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  noValida: {
    fontSize: 7,
    color: C.light,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  tecnicoLabel: { fontSize: 7, color: C.muted },
  tecnicoVal: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.text },
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
  const ivaPct = 21; // from config ideally, but not in remito-types; use hardcoded default
  const subtotal = items.reduce((s, i) => s + (i.importe ?? 0), 0);
  const ivaAmount = orden.aplica_iva ? subtotal * (ivaPct / 100) : 0;
  const total = subtotal + ivaAmount;
  const cotizacionNum = orden.cotizacion ?? 0;
  const totalEnPesos =
    moneda === "USD" && orden.mostrar_cotizacion && cotizacionNum > 0
      ? total * cotizacionNum
      : null;

  return (
    <Document
      title={`Remito N° ${orden.numero}`}
      author={config?.nombre_empresa ?? "SPECTRA"}
    >
      <Page size="A4" style={s.page}>
        {/* ── Encabezado ── */}
        <View style={s.header}>
          <View>
            <Text style={s.empresaNombre}>{config?.nombre_empresa ?? "SPECTRA"}</Text>
            {config?.direccion ? <Text style={s.empresaSub}>{config.direccion}</Text> : null}
            {config?.cuit ? <Text style={s.empresaSub}>CUIT: {config.cuit}</Text> : null}
          </View>
          <View style={s.remitoBox}>
            <Text style={s.remitoTitulo}>REMITO N° {orden.numero}</Text>
            <Text style={s.remitoSub}>Fecha de salida: {fmtDate(orden.fecha_salida)}</Text>
          </View>
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

        {/* ── Tabla de items ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Trabajos realizados</Text>

          {/* Cabecera */}
          <View style={s.tableHeader}>
            <Text style={s.thCant}>Cant.</Text>
            <Text style={s.thDetalle}>Detalle</Text>
            <Text style={s.thPrecio}>Precio {moneda}</Text>
            <Text style={s.thImporte}>Importe</Text>
          </View>

          {/* Filas */}
          {items.map((item, i) => (
            <View
              key={i}
              style={i === items.length - 1 ? s.tableLastRow : s.tableRow}
            >
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

        {/* ── Pie ── */}
        <View style={s.footer}>
          <Text style={s.noValida}>DOCUMENTO NO VÁLIDO COMO FACTURA</Text>
          {orden.tecnico ? (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.tecnicoLabel}>Técnico</Text>
              <Text style={s.tecnicoVal}>{orden.tecnico}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
