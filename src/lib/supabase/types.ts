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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          state: string
          status: string
          tagline: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          state: string
          status?: string
          tagline?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          state?: string
          status?: string
          tagline?: string | null
        }
        Relationships: []
      }
      city_steps: {
        Row: {
          address: string | null
          city_id: string
          contact: Json
          content_md: string
          created_at: string
          id: string
          last_verified: string | null
          links: Json
          method: string | null
          method_note: string | null
          step_id: string
          tips: Json
          updated_at: string
        }
        Insert: {
          address?: string | null
          city_id: string
          contact?: Json
          content_md: string
          created_at?: string
          id?: string
          last_verified?: string | null
          links?: Json
          method?: string | null
          method_note?: string | null
          step_id: string
          tips?: Json
          updated_at?: string
        }
        Update: {
          address?: string | null
          city_id?: string
          contact?: Json
          content_md?: string
          created_at?: string
          id?: string
          last_verified?: string | null
          links?: Json
          method?: string | null
          method_note?: string | null
          step_id?: string
          tips?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_steps_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_steps_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
      glossary_terms: {
        Row: {
          created_at: string
          definition_md: string
          english: string | null
          id: string
          slug: string
          term: string
        }
        Insert: {
          created_at?: string
          definition_md: string
          english?: string | null
          id?: string
          slug: string
          term: string
        }
        Update: {
          created_at?: string
          definition_md?: string
          english?: string | null
          id?: string
          slug?: string
          term?: string
        }
        Relationships: []
      }
      letters: {
        Row: {
          created_at: string
          german_name: string | null
          id: string
          name: string
          sender: string | null
          slug: string
          sort_order: number
          urgency: string
          what_it_is_md: string
          what_to_do_md: string
        }
        Insert: {
          created_at?: string
          german_name?: string | null
          id?: string
          name: string
          sender?: string | null
          slug: string
          sort_order?: number
          urgency?: string
          what_it_is_md: string
          what_to_do_md: string
        }
        Update: {
          created_at?: string
          german_name?: string | null
          id?: string
          name?: string
          sender?: string | null
          slug?: string
          sort_order?: number
          urgency?: string
          what_it_is_md?: string
          what_to_do_md?: string
        }
        Relationships: []
      }
      phases: {
        Row: {
          created_at: string
          id: string
          slug: string
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          sort_order: number
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      problems: {
        Row: {
          city_id: string | null
          created_at: string
          id: string
          problem_md: string
          slug: string
          solution_md: string
          sort_order: number
          title: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          id?: string
          problem_md: string
          slug: string
          solution_md: string
          sort_order?: number
          title: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          id?: string
          problem_md?: string
          slug?: string
          solution_md?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "problems_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city_slug: string | null
          created_at: string
          id: string
          persona: string | null
          stage: string | null
          updated_at: string
        }
        Insert: {
          city_slug?: string | null
          created_at?: string
          id: string
          persona?: string | null
          stage?: string | null
          updated_at?: string
        }
        Update: {
          city_slug?: string | null
          created_at?: string
          id?: string
          persona?: string | null
          stage?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      steps: {
        Row: {
          applies_to: string
          city_variable: boolean
          content_md: string
          created_at: string
          documents: Json
          id: string
          official_links: Json
          phase_id: string
          slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          applies_to?: string
          city_variable?: boolean
          content_md: string
          created_at?: string
          documents?: Json
          id?: string
          official_links?: Json
          phase_id: string
          slug: string
          sort_order: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          applies_to?: string
          city_variable?: boolean
          content_md?: string
          created_at?: string
          documents?: Json
          id?: string
          official_links?: Json
          phase_id?: string
          slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "steps_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          status: string
          step_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          status?: string
          step_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          status?: string
          step_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
