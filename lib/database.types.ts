export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string
          empresa_id: string
          razon_social: string
          direccion: string | null
          provincia: string | null
          localidad: string | null
          codigo_postal: string | null
          telefono1: string | null
          telefono2: string | null
          telefono3: string | null
          contacto: string | null
          cuit: string | null
          email: string | null
          condicion_iva: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          razon_social: string
          direccion?: string | null
          provincia?: string | null
          localidad?: string | null
          codigo_postal?: string | null
          telefono1?: string | null
          telefono2?: string | null
          telefono3?: string | null
          contacto?: string | null
          cuit?: string | null
          email?: string | null
          condicion_iva?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          razon_social?: string
          direccion?: string | null
          provincia?: string | null
          localidad?: string | null
          codigo_postal?: string | null
          telefono1?: string | null
          telefono2?: string | null
          telefono3?: string | null
          contacto?: string | null
          cuit?: string | null
          email?: string | null
          condicion_iva?: string | null
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      ordenes: {
        Row: {
          id: string
          empresa_id: string
          numero: number
          cliente_id: string
          marca: string | null
          modelo: string | null
          numero_serie: string | null
          estacion: string | null
          deficiencia: string | null
          observaciones: string | null
          entrego: string | null
          quien_recibio: string | null
          tecnico: string | null
          fecha_ingreso: string
          fecha_salida: string | null
          estado: string
          moneda: string
          aplica_iva: boolean
          mostrar_cotizacion: boolean
          cotizacion: number | null
          diagnostico: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          numero: number
          cliente_id: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          estacion?: string | null
          deficiencia?: string | null
          observaciones?: string | null
          entrego?: string | null
          quien_recibio?: string | null
          tecnico?: string | null
          fecha_ingreso?: string
          fecha_salida?: string | null
          estado?: string
          moneda?: string
          aplica_iva?: boolean
          mostrar_cotizacion?: boolean
          cotizacion?: number | null
          diagnostico?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          numero?: number
          cliente_id?: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          estacion?: string | null
          deficiencia?: string | null
          observaciones?: string | null
          entrego?: string | null
          quien_recibio?: string | null
          tecnico?: string | null
          fecha_ingreso?: string
          fecha_salida?: string | null
          estado?: string
          moneda?: string
          aplica_iva?: boolean
          mostrar_cotizacion?: boolean
          cotizacion?: number | null
          diagnostico?: string | null
          activo?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      accesorios_orden: {
        Row: {
          orden_id: string
          microfono: boolean
          fuente: boolean
          cable: boolean
          pack: boolean
          antena: boolean
          cargador: boolean
          crem: boolean
          created_at: string
        }
        Insert: {
          orden_id: string
          microfono?: boolean
          fuente?: boolean
          cable?: boolean
          pack?: boolean
          antena?: boolean
          cargador?: boolean
          crem?: boolean
          created_at?: string
        }
        Update: {
          orden_id?: string
          microfono?: boolean
          fuente?: boolean
          cable?: boolean
          pack?: boolean
          antena?: boolean
          cargador?: boolean
          crem?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accesorios_orden_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: true
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
      items_trabajo: {
        Row: {
          id: string
          orden_id: string
          cantidad: number
          detalle: string | null
          precio: number | null
          importe: number | null
          created_at: string
        }
        Insert: {
          id?: string
          orden_id: string
          cantidad?: number
          detalle?: string | null
          precio?: number | null
          importe?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          orden_id?: string
          cantidad?: number
          detalle?: string | null
          precio?: number | null
          importe?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_trabajo_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
      tecnicos: {
        Row: {
          id: string
          empresa_id: string
          nombre: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          empresa_id: string
          nombre: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string
          nombre?: string
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      empresas: {
        Row: {
          id: string
          nombre: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          created_at?: string
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          id: string
          empresa_id: string | null
          nombre: string | null
          rol: string
          created_at: string
        }
        Insert: {
          id: string
          empresa_id?: string | null
          nombre?: string | null
          rol?: string
          created_at?: string
        }
        Update: {
          id?: string
          empresa_id?: string | null
          nombre?: string | null
          rol?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      config: {
        Row: {
          empresa_id: string
          nombre_empresa: string | null
          direccion: string | null
          cuit: string | null
          cotizacion_dolar: number | null
          iva: number | null
          created_at: string
        }
        Insert: {
          empresa_id: string
          nombre_empresa?: string | null
          direccion?: string | null
          cuit?: string | null
          cotizacion_dolar?: number | null
          iva?: number | null
          created_at?: string
        }
        Update: {
          empresa_id?: string
          nombre_empresa?: string | null
          direccion?: string | null
          cuit?: string | null
          cotizacion_dolar?: number | null
          iva?: number | null
          created_at?: string
        }
        Relationships: []
      }
      remitos_manuales: {
        Row: {
          id: string
          empresa_id: string
          cliente_id: string | null
          razon_social: string | null
          domicilio: string | null
          condicion_iva: string | null
          cuit: string | null
          fecha: string
          numero_fisico: string | null
          cantidad: string | null
          detalle: string | null
          items: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          cliente_id?: string | null
          razon_social?: string | null
          domicilio?: string | null
          condicion_iva?: string | null
          cuit?: string | null
          fecha?: string
          numero_fisico?: string | null
          cantidad?: string | null
          detalle?: string | null
          items?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          cliente_id?: string | null
          razon_social?: string | null
          domicilio?: string | null
          condicion_iva?: string | null
          cuit?: string | null
          fecha?: string
          numero_fisico?: string | null
          cantidad?: string | null
          detalle?: string | null
          items?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      remito_print_config: {
        Row: {
          empresa_id: string
          coords: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          empresa_id: string
          coords?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          empresa_id?: string
          coords?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      crear_orden_con_accesorios: {
        Args: {
          p_empresa_id:    string
          p_cliente_id:    string
          p_marca:         string
          p_modelo:        string
          p_numero_serie:  string
          p_estacion:      string
          p_deficiencia:   string
          p_observaciones: string
          p_entrego:       string
          p_quien_recibio: string
          p_tecnico:       string
          p_fecha_ingreso: string
          p_microfono:     boolean
          p_fuente:        boolean
          p_cable:         boolean
          p_pack:          boolean
          p_antena:        boolean
          p_cargador:      boolean
          p_crem:          boolean
        }
        Returns: { orden_id: string; numero: number }
      }
      confirmar_salida_orden: {
        Args: {
          p_orden_id:     string
          p_tecnico:      string
          p_fecha_salida: string
          p_items:        Json
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Helpers para extraer tipos de filas individuales
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
