export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      notifications: {
        Row: {
          created_at: string
          email_pending: boolean
          id: string
          message: string
          order_id: string | null
          read_at: string | null
          recipient_id: string
          title: string
        }
        Insert: {
          created_at?: string
          email_pending?: boolean
          id?: string
          message?: string
          order_id?: string | null
          read_at?: string | null
          recipient_id: string
          title: string
        }
        Update: {
          created_at?: string
          email_pending?: boolean
          id?: string
          message?: string
          order_id?: string | null
          read_at?: string | null
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          actor_id: string | null
          created_at: string
          details: string
          event_type: string
          id: string
          metadata: Json
          order_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          details?: string
          event_type: string
          id?: string
          metadata?: Json
          order_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          details?: string
          event_type?: string
          id?: string
          metadata?: Json
          order_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_files: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          order_id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_name: string
          file_size?: number
          id?: string
          mime_type?: string
          order_id: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          order_id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          attachment_path: string | null
          body: string
          created_at: string
          from_admin: boolean
          id: string
          order_id: string
          sender_id: string
        }
        Insert: {
          attachment_path?: string | null
          body: string
          created_at?: string
          from_admin?: boolean
          id?: string
          order_id: string
          sender_id?: string
        }
        Update: {
          attachment_path?: string | null
          body?: string
          created_at?: string
          from_admin?: boolean
          id?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_visualizations: {
        Row: {
          created_at: string
          created_by: string
          decided_at: string | null
          id: string
          name: string
          order_id: string
          sent_at: string | null
          state: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          decided_at?: string | null
          id?: string
          name: string
          order_id: string
          sent_at?: string | null
          state?: string
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string
          decided_at?: string | null
          id?: string
          name?: string
          order_id?: string
          sent_at?: string | null
          state?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_visualizations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          configuration: Json
          courier_name: string | null
          created_at: string
          delivery_label: string
          delivery_price: number
          estimated_end: string | null
          estimated_start: string | null
          figurine_price: number
          id: string
          order_number: string
          paid_revision_unlocked: boolean
          product_type: string
          revision_rounds_used: number
          status: string
          tracking_number: string | null
          tracking_url: string | null
          user_id: string
        }
        Insert: {
          configuration?: Json
          courier_name?: string | null
          created_at?: string
          delivery_label?: string
          delivery_price?: number
          estimated_end?: string | null
          estimated_start?: string | null
          figurine_price?: number
          id?: string
          order_number: string
          paid_revision_unlocked?: boolean
          product_type?: string
          revision_rounds_used?: number
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
          user_id?: string
        }
        Update: {
          configuration?: Json
          courier_name?: string | null
          created_at?: string
          delivery_label?: string
          delivery_price?: number
          estimated_end?: string | null
          estimated_start?: string | null
          figurine_price?: number
          id?: string
          order_number?: string
          paid_revision_unlocked?: boolean
          product_type?: string
          revision_rounds_used?: number
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          email?: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      revision_requests: {
        Row: {
          attachment_path: string | null
          created_at: string
          id: string
          is_paid: boolean
          message: string
          order_id: string
          round_number: number
          status: string
          user_id: string
          visualization_id: string | null
        }
        Insert: {
          attachment_path?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean
          message: string
          order_id: string
          round_number: number
          status?: string
          user_id?: string
          visualization_id?: string | null
        }
        Update: {
          attachment_path?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean
          message?: string
          order_id?: string
          round_number?: number
          status?: string
          user_id?: string
          visualization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revision_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_requests_visualization_id_fkey"
            columns: ["visualization_id"]
            isOneToOne: false
            referencedRelation: "order_visualizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visualization_images: {
        Row: {
          created_at: string
          file_name: string
          id: string
          sort_order: number
          storage_path: string
          visualization_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          sort_order?: number
          storage_path: string
          visualization_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          sort_order?: number
          storage_path?: string
          visualization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visualization_images_visualization_id_fkey"
            columns: ["visualization_id"]
            isOneToOne: false
            referencedRelation: "order_visualizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_order_visualization: {
        Args: { _visualization_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      publish_order_visualization: {
        Args: { _visualization_id: string }
        Returns: undefined
      }
      request_order_revision: {
        Args: {
          _attachment_path?: string
          _message: string
          _visualization_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
