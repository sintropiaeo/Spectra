import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { OrdenPDFData } from "@/lib/pdf-types";
import { LOGO_COSTARELLI } from "@/lib/logoCostarelli";

// ── Helpers ──────────────────────────────────────────────────
function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

const ACC_LABELS: Record<string, string> = {
  microfono: "Micrófono",
  fuente: "Fuente",
  cable: "Cable",
  pack: "Pack",
  antena: "Antena",
  cargador: "Cargador",
  crem: "Crem",
};

function accesoriosList(acc: OrdenPDFData["accesorios"]): string {
  if (!acc) return "—";
  const activos = Object.entries(acc)
    .filter(([k, v]) => v && k in ACC_LABELS)
    .map(([k]) => ACC_LABELS[k]);
  return activos.length ? activos.join(", ") : "Ninguno";
}

// ── Estilos ───────────────────────────────────────────────────
const C = {
  border: "#d1d5db",
  bg: "#f9fafb",
  text: "#111827",
  muted: "#4b5563",
  light: "#6b7280",
  accent: "#1e3a5f",
} as const;

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: C.text,
    paddingHorizontal: 28,
    paddingVertical: 22,
  },

  // ── Logo ──
  logo: {
    width: 132,
    height: 28,
    marginBottom: 3,
    objectFit: "contain",
  },

  // ── Encabezado ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: C.accent,
    paddingBottom: 6,
    marginBottom: 6,
  },
  empresa: {
    flex: 1,
  },
  empresaSub: {
    fontSize: 7,
    color: C.muted,
    marginTop: 2,
  },
  ordenBox: {
    alignItems: "flex-end",
  },
  ordenNumero: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.accent,
  },
  ordenSub: {
    fontSize: 7,
    color: C.muted,
    marginTop: 2,
  },

  // ── Copia label ──
  copiaLabel: {
    fontSize: 6,
    color: "#9ca3af",
    textAlign: "right",
    marginBottom: 5,
  },

  // ── Dos columnas ──
  row2: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 5,
  },
  col: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 2,
    overflow: "hidden",
  },

  // ── Sección genérica ──
  section: {
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 5,
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
  sectionBody: {
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  // ── Fila clave-valor ──
  kv: {
    flexDirection: "row",
    marginBottom: 2,
  },
  key: {
    fontSize: 7,
    color: C.light,
    width: 62,
    paddingTop: 1,
  },
  val: {
    fontSize: 8,
    color: C.text,
    flex: 1,
    fontFamily: "Helvetica-Bold",
    marginLeft: 2,
  },

  // ── Aviso legal ──
  legal: {
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 4,
    marginTop: 3,
  },
  legalText: {
    fontSize: 6.5,
    color: C.light,
    lineHeight: 1.4,
  },

  // ── Línea de corte (pegada al aviso) ──
  separator: {
    alignItems: "center",
    marginTop: 3,
    marginBottom: 5,
  },
  separatorLine: {
    fontSize: 7,
    color: "#9ca3af",
    letterSpacing: 1.5,
  },

  // ── Parte inferior (taller) ──
  bottom: {
    flex: 1,
  },
  bottomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottomWidth: 0.75,
    borderBottomColor: C.text,
    paddingBottom: 4,
    marginBottom: 6,
  },
  bottomNumero: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.text,
  },
  bottomFecha: {
    fontSize: 8,
    color: C.muted,
  },

  // ── Firma ──
  firmaWrap: {
    marginTop: 30,
  },
  firmaLine: {
    borderTopWidth: 0.75,
    borderTopColor: C.text,
    width: 240,
  },
  firmaLegend: {
    fontSize: 7,
    color: C.muted,
    marginTop: 3,
    lineHeight: 1.35,
    maxWidth: 380,
  },
});

// ── Fila clave-valor ─────────────────────────────────────────
function KV({ k, v }: { k: string; v?: string | null }) {
  return (
    <View style={s.kv}>
      <Text style={s.key}>{k}:</Text>
      <Text style={s.val}>{v || "—"}</Text>
    </View>
  );
}

// ── Bloques reutilizados (mismos datos arriba y abajo) ───────
function ClienteEquipo({ data }: { data: OrdenPDFData }) {
  const { orden, cliente } = data;
  return (
    <View style={s.row2}>
      <View style={s.col}>
        <Text style={s.sectionTitle}>Cliente</Text>
        <View style={s.sectionBody}>
          <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.text, marginBottom: 5 }}>
            {cliente.razon_social}
          </Text>
          {cliente.direccion ? <KV k="Dirección" v={cliente.direccion} /> : null}
          <KV
            k="Localidad"
            v={[cliente.localidad, cliente.provincia, cliente.codigo_postal]
              .filter(Boolean)
              .join(", ")}
          />
          <KV k="Teléfono" v={cliente.telefono1} />
          <KV k="Contacto" v={cliente.contacto} />
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
  );
}

function Accesorios({ data }: { data: OrdenPDFData }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Accesorios entregados</Text>
      <View style={s.sectionBody}>
        <Text style={{ fontSize: 8, color: C.text }}>
          {accesoriosList(data.accesorios)}
        </Text>
      </View>
    </View>
  );
}

function ProblemaObs({ data }: { data: OrdenPDFData }) {
  const { orden } = data;
  return (
    <View style={s.row2}>
      <View style={s.col}>
        <Text style={s.sectionTitle}>Problema reportado</Text>
        <View style={[s.sectionBody, { minHeight: 32 }]}>
          <Text style={{ fontSize: 8, color: C.text, lineHeight: 1.4 }}>
            {orden.deficiencia || "—"}
          </Text>
        </View>
      </View>
      <View style={s.col}>
        <Text style={s.sectionTitle}>Observaciones</Text>
        <View style={[s.sectionBody, { minHeight: 32 }]}>
          <Text style={{ fontSize: 8, color: C.text, lineHeight: 1.4 }}>
            {orden.observaciones || "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Parte superior (se la lleva el cliente) — contenido actual ─
function CopiaSuperior({ data }: { data: OrdenPDFData }) {
  const { orden, config } = data;

  return (
    <View>
      <Text style={s.copiaLabel}>COPIA CLIENTE</Text>

      {/* Encabezado con logo */}
      <View style={s.header}>
        <View style={s.empresa}>
          <Image src={LOGO_COSTARELLI} style={s.logo} />
          {config?.direccion ? (
            <Text style={s.empresaSub}>{config.direccion}</Text>
          ) : null}
          {config?.cuit ? (
            <Text style={s.empresaSub}>CUIT: {config.cuit}</Text>
          ) : null}
        </View>
        <View style={s.ordenBox}>
          <Text style={s.ordenNumero}>ORDEN N° {orden.numero}</Text>
          <Text style={s.ordenSub}>
            Fecha de ingreso: {fmtDate(orden.fecha_ingreso)}
          </Text>
          {orden.tecnico ? (
            <Text style={s.ordenSub}>Técnico: {orden.tecnico}</Text>
          ) : null}
        </View>
      </View>

      <ClienteEquipo data={data} />
      <Accesorios data={data} />
      <ProblemaObs data={data} />

      {/* Recepción */}
      <View style={[s.section, { marginBottom: 4 }]}>
        <Text style={s.sectionTitle}>Recepción</Text>
        <View style={[s.sectionBody, { flexDirection: "row" }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <KV k="Entregó" v={orden.entrego} />
          </View>
          <View style={{ flex: 1 }}>
            <KV k="Recibió" v={orden.quien_recibio} />
          </View>
        </View>
      </View>

      {/* Aviso legal */}
      <View style={s.legal}>
        <Text style={s.legalText}>
          AVISO: Los equipos que no sean retirados dentro de los 60 (sesenta)
          días corridos desde la fecha de notificación de presupuesto o
          finalización del servicio pasarán a ser considerados abandonados, de
          conformidad con la normativa vigente. La empresa no se responsabiliza
          por deterioro, extravío o daños ocurridos pasado dicho plazo.
        </Text>
      </View>
    </View>
  );
}

// ── Parte inferior (queda en el taller) — sin membrete ────────
function CopiaInferior({ data }: { data: OrdenPDFData }) {
  const { orden } = data;

  return (
    <View style={s.bottom}>
      {/* Header sin logo: N° de orden + fecha de ingreso */}
      <View style={s.bottomHeader}>
        <Text style={s.bottomNumero}>ORDEN N° {orden.numero}</Text>
        <Text style={s.bottomFecha}>
          Fecha de ingreso: {fmtDate(orden.fecha_ingreso)}
        </Text>
      </View>

      <ClienteEquipo data={data} />
      <Accesorios data={data} />
      <ProblemaObs data={data} />

      {/* Firma del cliente + leyenda */}
      <View style={s.firmaWrap}>
        <View style={s.firmaLine} />
        <Text style={s.firmaLegend}>
          Firmo conforme la recepción del comprobante adjunto que deberá ser
          presentado indefectiblemente para el retiro del equipo
        </Text>
      </View>

      {/* El resto de la hoja queda en blanco para el informe técnico a mano */}
    </View>
  );
}

// ── Documento PDF ─────────────────────────────────────────────
export function OrdenPDF({ data }: { data: OrdenPDFData }) {
  return (
    <Document
      title={`Orden N° ${data.orden.numero}`}
      author={data.config?.nombre_empresa ?? "SPECTRA"}
    >
      <Page size="A4" style={s.page}>
        <CopiaSuperior data={data} />

        <View style={s.separator}>
          <Text style={s.separatorLine}>
            {"✂  -  -  -  -  -  -  -  -  -  -  -  -  -  LÍNEA DE CORTE  -  -  -  -  -  -  -  -  -  -  -  -  -  ✂"}
          </Text>
        </View>

        <CopiaInferior data={data} />
      </Page>
    </Document>
  );
}
