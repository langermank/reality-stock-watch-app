/** Database types generated from the live schema.
 *
 *  Regenerate after every migration (local stack must be running):
 *    supabase gen types typescript --local > lib/supabase/types.ts
 *  …then re-append the named enum aliases at the bottom of this file
 *  (or just regenerate and restore them from git).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      badges: {
        Row: {
          awarded_at: string
          id: string
          season_id: string
          type: Database["public"]["Enums"]["badge_type"]
          user_id: string
        }
        Insert: {
          awarded_at?: string
          id?: string
          season_id: string
          type: Database["public"]["Enums"]["badge_type"]
          user_id: string
        }
        Update: {
          awarded_at?: string
          id?: string
          season_id?: string
          type?: Database["public"]["Enums"]["badge_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contestants: {
        Row: {
          bio: string | null
          created_at: string
          has_veto: boolean
          id: string
          is_hoh: boolean
          is_nominated: boolean
          name: string
          photo_url: string | null
          season_id: string
          status: Database["public"]["Enums"]["contestant_status"]
          total_shares_outstanding: number
        }
        Insert: {
          bio?: string | null
          created_at?: string
          has_veto?: boolean
          id?: string
          is_hoh?: boolean
          is_nominated?: boolean
          name: string
          photo_url?: string | null
          season_id: string
          status?: Database["public"]["Enums"]["contestant_status"]
          total_shares_outstanding?: number
        }
        Update: {
          bio?: string | null
          created_at?: string
          has_veto?: boolean
          id?: string
          is_hoh?: boolean
          is_nominated?: boolean
          name?: string
          photo_url?: string | null
          season_id?: string
          status?: Database["public"]["Enums"]["contestant_status"]
          total_shares_outstanding?: number
        }
        Relationships: [
          {
            foreignKeyName: "contestants_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          average_purchase_price: number
          contestant_id: string
          created_at: string
          id: string
          portfolio_id: string
          shares_held: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_purchase_price: number
          contestant_id: string
          created_at?: string
          id?: string
          portfolio_id: string
          shares_held?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_purchase_price?: number
          contestant_id?: string
          created_at?: string
          id?: string
          portfolio_id?: string
          shares_held?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holdings_contestant_id_fkey"
            columns: ["contestant_id"]
            isOneToOne: false
            referencedRelation: "contestants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          cash_balance: number
          created_at: string
          id: string
          net_worth: number
          season_id: string
          user_id: string
        }
        Insert: {
          cash_balance: number
          created_at?: string
          id?: string
          net_worth: number
          season_id: string
          user_id: string
        }
        Update: {
          cash_balance?: number
          created_at?: string
          id?: string
          net_worth?: number
          season_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_admin: boolean
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          is_admin?: boolean
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          username?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      season_results: {
        Row: {
          created_at: string
          final_net_worth: number
          final_rank: number
          id: string
          season_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          final_net_worth: number
          final_rank: number
          id?: string
          season_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          final_net_worth?: number
          final_rank?: number
          id?: string
          season_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "season_results_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          base_price: number
          created_at: string
          end_date: string | null
          id: string
          k_constant: number
          name: string
          start_date: string | null
          starting_balance: number
          status: Database["public"]["Enums"]["season_status"]
        }
        Insert: {
          base_price: number
          created_at?: string
          end_date?: string | null
          id?: string
          k_constant: number
          name: string
          start_date?: string | null
          starting_balance: number
          status?: Database["public"]["Enums"]["season_status"]
        }
        Update: {
          base_price?: number
          created_at?: string
          end_date?: string | null
          id?: string
          k_constant?: number
          name?: string
          start_date?: string | null
          starting_balance?: number
          status?: Database["public"]["Enums"]["season_status"]
        }
        Relationships: []
      }
      survey_aggregate_rankings: {
        Row: {
          contestant_id: string
          rank: number
          score: number
          survey_id: string
        }
        Insert: {
          contestant_id: string
          rank: number
          score: number
          survey_id: string
        }
        Update: {
          contestant_id?: string
          rank?: number
          score?: number
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_aggregate_rankings_contestant_id_fkey"
            columns: ["contestant_id"]
            isOneToOne: false
            referencedRelation: "contestants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_aggregate_rankings_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          display_order: number
          id: string
          options: Json | null
          survey_id: string
          text: string
          type: Database["public"]["Enums"]["question_type"]
          uses_contestants: boolean
        }
        Insert: {
          created_at?: string
          display_order: number
          id?: string
          options?: Json | null
          survey_id: string
          text: string
          type: Database["public"]["Enums"]["question_type"]
          uses_contestants?: boolean
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          options?: Json | null
          survey_id?: string
          text?: string
          type?: Database["public"]["Enums"]["question_type"]
          uses_contestants?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answers: Json
          id: string
          is_anonymous: boolean
          submitted_at: string
          survey_id: string
          user_id: string | null
        }
        Insert: {
          answers: Json
          id?: string
          is_anonymous?: boolean
          submitted_at?: string
          survey_id: string
          user_id?: string | null
        }
        Update: {
          answers?: Json
          id?: string
          is_anonymous?: boolean
          submitted_at?: string
          survey_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_reveal_state: {
        Row: {
          reveal_count: number
          season_id: string
          selected_survey_id: string | null
          updated_at: string
        }
        Insert: {
          reveal_count?: number
          season_id: string
          selected_survey_id?: string | null
          updated_at?: string
        }
        Update: {
          reveal_count?: number
          season_id?: string
          selected_survey_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_reveal_state_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: true
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_reveal_state_selected_survey_id_fkey"
            columns: ["selected_survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          closes_at: string | null
          created_at: string
          id: string
          published_at: string | null
          results_published_at: string | null
          season_id: string
          status: Database["public"]["Enums"]["survey_status"]
          title: string
          week_number: number
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          results_published_at?: string | null
          season_id: string
          status?: Database["public"]["Enums"]["survey_status"]
          title: string
          week_number: number
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          results_published_at?: string | null
          season_id?: string
          status?: Database["public"]["Enums"]["survey_status"]
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "surveys_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          contestant_id: string
          created_at: string
          dollar_amount: number
          failed_reason: string | null
          fee_amount: number
          filled_at: string | null
          id: string
          price_at_execution: number
          season_id: string
          shares: number
          state: Database["public"]["Enums"]["trade_state"]
          type: Database["public"]["Enums"]["trade_type"]
          user_id: string
        }
        Insert: {
          contestant_id: string
          created_at?: string
          dollar_amount: number
          failed_reason?: string | null
          fee_amount?: number
          filled_at?: string | null
          id?: string
          price_at_execution: number
          season_id: string
          shares: number
          state?: Database["public"]["Enums"]["trade_state"]
          type: Database["public"]["Enums"]["trade_type"]
          user_id: string
        }
        Update: {
          contestant_id?: string
          created_at?: string
          dollar_amount?: number
          failed_reason?: string | null
          fee_amount?: number
          filled_at?: string | null
          id?: string
          price_at_execution?: number
          season_id?: string
          shares?: number
          state?: Database["public"]["Enums"]["trade_state"]
          type?: Database["public"]["Enums"]["trade_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_contestant_id_fkey"
            columns: ["contestant_id"]
            isOneToOne: false
            referencedRelation: "contestants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_liquidation_value: {
        Args: {
          p_base_price: number
          p_contestant_shares: number
          p_k: number
          p_shares_held: number
          p_total_all_shares: number
        }
        Returns: number
      }
      get_leaderboard: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_season_id: string
        }
        Returns: {
          avatar_url: string
          badges: Json
          is_self: boolean
          net_worth: number
          rank: number
          user_id: string
          username: string
        }[]
      }
      get_user_rank: {
        Args: { p_season_id: string }
        Returns: {
          avatar_url: string
          badges: Json
          is_self: boolean
          net_worth: number
          rank: number
          user_id: string
          username: string
        }[]
      }
      leaderboard_badges: { Args: { p_user_id: string }; Returns: Json }
      place_trade: {
        Args: {
          p_contestant_id: string
          p_dollar_amount: number
          p_type: Database["public"]["Enums"]["trade_type"]
          p_user_id: string
        }
        Returns: Json
      }
      publish_season_results: {
        Args: { p_season_id: string }
        Returns: undefined
      }
      refresh_net_worth: { Args: never; Returns: undefined }
    }
    Enums: {
      badge_type: "top_3" | "top_10"
      contestant_status: "active" | "evicted" | "winner" | "runner_up"
      question_type: "ranking" | "multiple_choice" | "single_choice"
      season_status:
        | "setup"
        | "pre_season"
        | "active"
        | "ended"
        | "results_published"
      survey_status: "draft" | "active" | "closed" | "results_published"
      trade_state: "pending" | "filled" | "failed"
      trade_type: "buy" | "sell"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      badge_type: ["top_3", "top_10"],
      contestant_status: ["active", "evicted", "winner", "runner_up"],
      question_type: ["ranking", "multiple_choice", "single_choice"],
      season_status: [
        "setup",
        "pre_season",
        "active",
        "ended",
        "results_published",
      ],
      survey_status: ["draft", "active", "closed", "results_published"],
      trade_state: ["pending", "filled", "failed"],
      trade_type: ["buy", "sell"],
    },
  },
} as const


// ─────────────────────────────────────────────────────────────────────────
// Named enum aliases — the single source of truth for domain unions.
// Import these instead of redeclaring string unions per module.
// ─────────────────────────────────────────────────────────────────────────
export type SeasonStatus = Database["public"]["Enums"]["season_status"];
export type ContestantStatus = Database["public"]["Enums"]["contestant_status"];
export type TradeType = Database["public"]["Enums"]["trade_type"];
export type TradeState = Database["public"]["Enums"]["trade_state"];
export type BadgeType = Database["public"]["Enums"]["badge_type"];
export type SurveyStatus = Database["public"]["Enums"]["survey_status"];
export type QuestionType = Database["public"]["Enums"]["question_type"];
