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
      checklist_steps: {
        Row: {
          body_md: string | null
          doc_names: string[]
          guide_id: string
          id: string
          is_optional: boolean
          step_no: number
          title_en: string
        }
        Insert: {
          body_md?: string | null
          doc_names?: string[]
          guide_id: string
          id?: string
          is_optional?: boolean
          step_no: number
          title_en: string
        }
        Update: {
          body_md?: string | null
          doc_names?: string[]
          guide_id?: string
          id?: string
          is_optional?: boolean
          step_no?: number
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_steps_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          hero_note: string | null
          id: string
          is_published: boolean
          name_de: string
          name_en: string
          official_portal_url: string | null
          population: number | null
          slug: string
          state_id: string
        }
        Insert: {
          hero_note?: string | null
          id?: string
          is_published?: boolean
          name_de: string
          name_en: string
          official_portal_url?: string | null
          population?: number | null
          slug: string
          state_id: string
        }
        Update: {
          hero_note?: string | null
          id?: string
          is_published?: boolean
          name_de?: string
          name_en?: string
          official_portal_url?: string | null
          population?: number | null
          slug?: string
          state_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      city_step_overrides: {
        Row: {
          action: string
          base_step_id: string | null
          body_md: string | null
          id: string
          insert_after_step_no: number | null
          title_en: string | null
          variant_id: string
        }
        Insert: {
          action: string
          base_step_id?: string | null
          body_md?: string | null
          id?: string
          insert_after_step_no?: number | null
          title_en?: string | null
          variant_id: string
        }
        Update: {
          action?: string
          base_step_id?: string | null
          body_md?: string | null
          id?: string
          insert_after_step_no?: number | null
          title_en?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_step_overrides_base_step_id_fkey"
            columns: ["base_step_id"]
            isOneToOne: false
            referencedRelation: "checklist_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_step_overrides_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "city_task_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      city_task_variants: {
        Row: {
          appointment_required: boolean | null
          booking_url: string | null
          city_id: string
          city_notes_md: string | null
          fees_eur: number | null
          fees_note: string | null
          generated_by: string | null
          id: string
          last_verified_at: string | null
          locale: string
          office_address: string | null
          office_hours: string | null
          office_name: string | null
          online_possible: boolean | null
          reviewed_by: string | null
          sources: Json
          status: Database["public"]["Enums"]["content_status"]
          task_id: string
          typical_wait_time: string | null
          walk_in_possible: boolean | null
        }
        Insert: {
          appointment_required?: boolean | null
          booking_url?: string | null
          city_id: string
          city_notes_md?: string | null
          fees_eur?: number | null
          fees_note?: string | null
          generated_by?: string | null
          id?: string
          last_verified_at?: string | null
          locale?: string
          office_address?: string | null
          office_hours?: string | null
          office_name?: string | null
          online_possible?: boolean | null
          reviewed_by?: string | null
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          task_id: string
          typical_wait_time?: string | null
          walk_in_possible?: boolean | null
        }
        Update: {
          appointment_required?: boolean | null
          booking_url?: string | null
          city_id?: string
          city_notes_md?: string | null
          fees_eur?: number | null
          fees_note?: string | null
          generated_by?: string | null
          id?: string
          last_verified_at?: string | null
          locale?: string
          office_address?: string | null
          office_hours?: string | null
          office_name?: string | null
          online_possible?: boolean | null
          reviewed_by?: string | null
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          task_id?: string
          typical_wait_time?: string | null
          walk_in_possible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "city_task_variants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_task_variants_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      commuter_areas: {
        Row: {
          city_id: string
          commute_line: string | null
          commute_minutes: string | null
          commute_note: string
          cost_note: string
          has_own_office: boolean | null
          id: string
          last_verified_at: string | null
          locale: string
          name: string
          office_note: string | null
          rent_note: string | null
          sort_order: number
          sources: Json
          status: Database["public"]["Enums"]["content_status"]
          why_md: string | null
        }
        Insert: {
          city_id: string
          commute_line?: string | null
          commute_minutes?: string | null
          commute_note: string
          cost_note: string
          has_own_office?: boolean | null
          id?: string
          last_verified_at?: string | null
          locale?: string
          name: string
          office_note?: string | null
          rent_note?: string | null
          sort_order?: number
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          why_md?: string | null
        }
        Update: {
          city_id?: string
          commute_line?: string | null
          commute_minutes?: string | null
          commute_note?: string
          cost_note?: string
          has_own_office?: boolean | null
          id?: string
          last_verified_at?: string | null
          locale?: string
          name?: string
          office_note?: string | null
          rent_note?: string | null
          sort_order?: number
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          why_md?: string | null
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          definition_md: string
          id: string
          locale: string
          related_task_ids: string[]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          term_de: string
          term_en: string
        }
        Insert: {
          definition_md: string
          id?: string
          locale?: string
          related_task_ids?: string[]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          term_de: string
          term_en: string
        }
        Update: {
          definition_md?: string
          id?: string
          locale?: string
          related_task_ids?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          term_de?: string
          term_en?: string
        }
        Relationships: []
      }
      guides: {
        Row: {
          after_md: string | null
          documents_md: string | null
          generated_by: string | null
          id: string
          intro_md: string
          last_verified_at: string | null
          legal_basis: string | null
          locale: string
          reviewed_by: string | null
          sources: Json
          status: Database["public"]["Enums"]["content_status"]
          task_id: string
        }
        Insert: {
          after_md?: string | null
          documents_md?: string | null
          generated_by?: string | null
          id?: string
          intro_md: string
          last_verified_at?: string | null
          legal_basis?: string | null
          locale?: string
          reviewed_by?: string | null
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          task_id: string
        }
        Update: {
          after_md?: string | null
          documents_md?: string | null
          generated_by?: string | null
          id?: string
          intro_md?: string
          last_verified_at?: string | null
          legal_basis?: string | null
          locale?: string
          reviewed_by?: string | null
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_phases: {
        Row: {
          name_en: string
          slug: string
          sort_order: number
          subtitle_en: string | null
        }
        Insert: {
          name_en: string
          slug: string
          sort_order: number
          subtitle_en?: string | null
        }
        Update: {
          name_en?: string
          slug?: string
          sort_order?: number
          subtitle_en?: string | null
        }
        Relationships: []
      }
      journey_steps: {
        Row: {
          applies_to: string[]
          city_specific: boolean
          details_md: string | null
          documents: string[]
          icon: string | null
          id: string
          locale: string
          note_md: string | null
          persona: string
          phase: string
          phase_order: number
          runs_parallel_with: string[]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          task_id: string | null
          tips: string[]
          title_de: string | null
          title_en: string | null
        }
        Insert: {
          applies_to?: string[]
          city_specific?: boolean
          details_md?: string | null
          documents?: string[]
          icon?: string | null
          id?: string
          locale?: string
          note_md?: string | null
          persona?: string
          phase: string
          phase_order: number
          runs_parallel_with?: string[]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          task_id?: string | null
          tips?: string[]
          title_de?: string | null
          title_en?: string | null
        }
        Update: {
          applies_to?: string[]
          city_specific?: boolean
          details_md?: string | null
          documents?: string[]
          icon?: string | null
          id?: string
          locale?: string
          note_md?: string | null
          persona?: string
          phase?: string
          phase_order?: number
          runs_parallel_with?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          task_id?: string | null
          tips?: string[]
          title_de?: string | null
          title_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_steps_phase_fkey"
            columns: ["phase"]
            isOneToOne: false
            referencedRelation: "journey_phases"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "journey_steps_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      letters: {
        Row: {
          deadline_note: string | null
          generated_by: string | null
          id: string
          last_verified_at: string | null
          locale: string
          looks_like_md: string | null
          related_task_id: string | null
          reviewed_by: string | null
          sender: string | null
          slug: string
          sources: Json
          status: Database["public"]["Enums"]["content_status"]
          title_de: string
          title_en: string
          urgency: string
          what_it_means_md: string
          what_to_do_md: string
        }
        Insert: {
          deadline_note?: string | null
          generated_by?: string | null
          id?: string
          last_verified_at?: string | null
          locale?: string
          looks_like_md?: string | null
          related_task_id?: string | null
          reviewed_by?: string | null
          sender?: string | null
          slug: string
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title_de: string
          title_en: string
          urgency?: string
          what_it_means_md: string
          what_to_do_md: string
        }
        Update: {
          deadline_note?: string | null
          generated_by?: string | null
          id?: string
          last_verified_at?: string | null
          locale?: string
          looks_like_md?: string | null
          related_task_id?: string | null
          reviewed_by?: string | null
          sender?: string | null
          slug?: string
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title_de?: string
          title_en?: string
          urgency?: string
          what_it_means_md?: string
          what_to_do_md?: string
        }
        Relationships: [
          {
            foreignKeyName: "letters_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_offers: {
        Row: {
          blurb_md: string | null
          cta_label: string
          id: string
          kind: string
          locale: string
          name: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          task_slugs: string[]
          url: string
        }
        Insert: {
          blurb_md?: string | null
          cta_label?: string
          id?: string
          kind: string
          locale?: string
          name: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          task_slugs?: string[]
          url: string
        }
        Update: {
          blurb_md?: string | null
          cta_label?: string
          id?: string
          kind?: string
          locale?: string
          name?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          task_slugs?: string[]
          url?: string
        }
        Relationships: []
      }
      problems: {
        Row: {
          category_id: string | null
          description_md: string
          generated_by: string | null
          id: string
          last_verified_at: string | null
          locale: string
          related_task_ids: string[]
          reviewed_by: string | null
          severity: string | null
          slug: string
          sources: Json
          status: Database["public"]["Enums"]["content_status"]
          title_en: string
        }
        Insert: {
          category_id?: string | null
          description_md: string
          generated_by?: string | null
          id?: string
          last_verified_at?: string | null
          locale?: string
          related_task_ids?: string[]
          reviewed_by?: string | null
          severity?: string | null
          slug: string
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title_en: string
        }
        Update: {
          category_id?: string | null
          description_md?: string
          generated_by?: string | null
          id?: string
          last_verified_at?: string | null
          locale?: string
          related_task_ids?: string[]
          reviewed_by?: string | null
          severity?: string | null
          slug?: string
          sources?: Json
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "problems_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          audience: string | null
          created_at: string
          home_city_id: string | null
          user_id: string
        }
        Insert: {
          audience?: string | null
          created_at?: string
          home_city_id?: string | null
          user_id: string
        }
        Update: {
          audience?: string | null
          created_at?: string
          home_city_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_home_city_id_fkey"
            columns: ["home_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          body_md: string
          city_id: string | null
          effectiveness: string
          id: string
          problem_id: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          title_en: string
        }
        Insert: {
          body_md: string
          city_id?: string | null
          effectiveness?: string
          id?: string
          problem_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title_en: string
        }
        Update: {
          body_md?: string
          city_id?: string | null
          effectiveness?: string
          id?: string
          problem_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "solutions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solutions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          code: string
          id: string
          name_de: string
          name_en: string
          slug: string
        }
        Insert: {
          code: string
          id?: string
          name_de: string
          name_en: string
          slug: string
        }
        Update: {
          code?: string
          id?: string
          name_de?: string
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      support_resources: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          id: string
          name: string
          region: string | null
          source: string
          url: string
          verified_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          description: string
          id?: string
          name: string
          region?: string | null
          source: string
          url: string
          verified_at: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          region?: string | null
          source?: string
          url?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_resources_region_fk"
            columns: ["region"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["slug"]
          },
        ]
      }
      task_categories: {
        Row: {
          id: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          audience: string[]
          category_id: string
          id: string
          locale: string
          slug: string
          sort_order: number
          summary: string | null
          title_de: string
          title_en: string
        }
        Insert: {
          audience?: string[]
          category_id: string
          id?: string
          locale?: string
          slug: string
          sort_order?: number
          summary?: string | null
          title_de: string
          title_en: string
        }
        Update: {
          audience?: string[]
          category_id?: string
          id?: string
          locale?: string
          slug?: string
          sort_order?: number
          summary?: string | null
          title_de?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_task_progress: {
        Row: {
          city_id: string
          completed_override_ids: string[]
          completed_step_ids: string[]
          id: string
          notes: string | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city_id: string
          completed_override_ids?: string[]
          completed_step_ids?: string[]
          id?: string
          notes?: string | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city_id?: string
          completed_override_ids?: string[]
          completed_step_ids?: string[]
          id?: string
          notes?: string | null
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_progress_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_task_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_content: {
        Args: { q: string }
        Returns: {
          kind: string
          rank: number
          slug: string
          snippet: string
          title: string
        }[]
      }
    }
    Enums: {
      content_status: "draft" | "reviewed" | "published" | "archived"
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
    Enums: {
      content_status: ["draft", "reviewed", "published", "archived"],
    },
  },
} as const
