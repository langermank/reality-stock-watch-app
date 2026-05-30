/** Generated types for the Reality Stock Watch database.
 *  Run `supabase gen types typescript` to regenerate after schema changes.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SeasonStatus = "setup" | "pre_season" | "active" | "ended" | "results_published";
export type ContestantStatus = "active" | "evicted" | "winner" | "runner_up";
export type TradeType = "buy" | "sell";
export type TradeState = "pending" | "filled" | "failed";
export type BadgeType = "top_3" | "top_10";
export type SurveyStatus = "draft" | "active" | "closed" | "results_published";
export type QuestionType = "ranking" | "multiple_choice" | "single_choice";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
        };
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          status: SeasonStatus;
          start_date: string | null;
          end_date: string | null;
          starting_balance: string;
          k_constant: string;
          base_price: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["seasons"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seasons"]["Insert"]>;
      };
      contestants: {
        Row: {
          id: string;
          season_id: string;
          name: string;
          photo_url: string | null;
          bio: string | null;
          status: ContestantStatus;
          is_hoh: boolean;
          is_nominated: boolean;
          has_veto: boolean;
          total_shares_outstanding: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contestants"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contestants"]["Insert"]>;
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          season_id: string;
          cash_balance: string;
          net_worth: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["portfolios"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["portfolios"]["Insert"]>;
      };
      holdings: {
        Row: {
          id: string;
          portfolio_id: string;
          user_id: string;
          contestant_id: string;
          shares_held: string;
          average_purchase_price: string;
          updated_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["holdings"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["holdings"]["Insert"]>;
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          contestant_id: string;
          season_id: string;
          type: TradeType;
          dollar_amount: string;
          shares: string;
          price_at_execution: string;
          fee_amount: string;
          state: TradeState;
          failed_reason: string | null;
          created_at: string;
          filled_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["trades"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trades"]["Insert"]>;
      };
      season_results: {
        Row: {
          id: string;
          user_id: string;
          season_id: string;
          final_rank: number;
          final_net_worth: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["season_results"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
      badges: {
        Row: {
          id: string;
          user_id: string;
          season_id: string;
          type: BadgeType;
          awarded_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["badges"]["Row"], "id"> & {
          id?: string;
        };
        Update: never;
      };
      surveys: {
        Row: {
          id: string;
          season_id: string;
          title: string;
          week_number: number;
          status: SurveyStatus;
          closes_at: string | null;
          published_at: string | null;
          results_published_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["surveys"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["surveys"]["Insert"]>;
      };
      survey_questions: {
        Row: {
          id: string;
          survey_id: string;
          text: string;
          type: QuestionType;
          display_order: number;
          options: Json | null;
          uses_contestants: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["survey_questions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["survey_questions"]["Insert"]>;
      };
      survey_responses: {
        Row: {
          id: string;
          survey_id: string;
          user_id: string | null;
          answers: Json;
          is_anonymous: boolean;
          submitted_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["survey_responses"]["Row"], "id" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: never;
      };
      survey_aggregate_rankings: {
        Row: {
          survey_id: string;
          contestant_id: string;
          rank: number;
          score: string;
        };
        Insert: Database["public"]["Tables"]["survey_aggregate_rankings"]["Row"];
        Update: Partial<Database["public"]["Tables"]["survey_aggregate_rankings"]["Row"]>;
      };
      survey_reveal_state: {
        Row: {
          season_id: string;
          selected_survey_id: string | null;
          reveal_count: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["survey_reveal_state"]["Row"], "reveal_count" | "updated_at"> & {
          reveal_count?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["survey_reveal_state"]["Insert"]>;
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["push_subscriptions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_subscriptions"]["Insert"]>;
      };
    };
    Functions: {
      place_trade: {
        Args: {
          p_contestant_id: string;
          p_type: TradeType;
          p_dollar_amount: number;
        };
        Returns: {
          trade_id: string;
          state: TradeState;
          shares: number;
          price_at_execution: number;
          fee_amount: number;
          failed_reason: string | null;
        };
      };
    };
  };
};
