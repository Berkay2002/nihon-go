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
      exercises: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          japanese: string | null
          lesson_id: string
          options: Json
          order_index: number
          question: string
          romaji: string | null
          type: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          japanese?: string | null
          lesson_id: string
          options: Json
          order_index: number
          question: string
          romaji?: string | null
          type: string
          updated_at?: string
          xp_reward: number
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          japanese?: string | null
          lesson_id?: string
          options?: Json
          order_index?: number
          question?: string
          romaji?: string | null
          type?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_patterns: {
        Row: {
          created_at: string
          difficulty: number
          example_sentences: Json
          explanation: string
          id: string
          pattern: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty?: number
          example_sentences: Json
          explanation: string
          id?: string
          pattern: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          example_sentences?: Json
          explanation?: string
          id?: string
          pattern?: string
          updated_at?: string
        }
        Relationships: []
      }
      hiragana: {
        Row: {
          character: string
          created_at: string
          example_word: string
          example_word_meaning: string
          group_name: string
          id: string
          order_index: number
          romaji: string
          stroke_order: string
          updated_at: string
        }
        Insert: {
          character: string
          created_at?: string
          example_word: string
          example_word_meaning: string
          group_name: string
          id?: string
          order_index: number
          romaji: string
          stroke_order: string
          updated_at?: string
        }
        Update: {
          character?: string
          created_at?: string
          example_word?: string
          example_word_meaning?: string
          group_name?: string
          id?: string
          order_index?: number
          romaji?: string
          stroke_order?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          description: string
          estimated_time: string
          id: string
          order_index: number
          title: string
          unit_id: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description: string
          estimated_time: string
          id?: string
          order_index: number
          title: string
          unit_id: string
          updated_at?: string
          xp_reward: number
        }
        Update: {
          created_at?: string
          description?: string
          estimated_time?: string
          id?: string
          order_index?: number
          title?: string
          unit_id?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string
          description: string
          id: string
          is_locked: boolean
          name: string
          order_index: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_locked?: boolean
          name: string
          order_index: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_locked?: boolean
          name?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          accuracy: number
          created_at: string
          id: string
          is_completed: boolean
          last_attempted_at: string | null
          lesson_id: string | null
          updated_at: string
          user_id: string | null
          xp_earned: number
        }
        Insert: {
          accuracy?: number
          created_at?: string
          id?: string
          is_completed?: boolean
          last_attempted_at?: string | null
          lesson_id?: string | null
          updated_at?: string
          user_id?: string | null
          xp_earned?: number
        }
        Update: {
          accuracy?: number
          created_at?: string
          id?: string
          is_completed?: boolean
          last_attempted_at?: string | null
          lesson_id?: string | null
          updated_at?: string
          user_id?: string | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          daily_goal: number
          daily_xp: number
          id: string
          last_activity_date: string
          level: number
          longest_streak: number
          total_xp: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_streak?: number
          daily_goal?: number
          daily_xp?: number
          id?: string
          last_activity_date?: string
          level?: number
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_streak?: number
          daily_goal?: number
          daily_xp?: number
          id?: string
          last_activity_date?: string
          level?: number
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vocabulary: {
        Row: {
          category: string
          created_at: string
          difficulty: number
          english: string
          example_sentence: string | null
          hiragana: string
          id: string
          japanese: string
          lesson_id: string | null
          romaji: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          difficulty?: number
          english: string
          example_sentence?: string | null
          hiragana: string
          id?: string
          japanese: string
          lesson_id?: string | null
          romaji: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: number
          english?: string
          example_sentence?: string | null
          hiragana?: string
          id?: string
          japanese?: string
          lesson_id?: string | null
          romaji?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
