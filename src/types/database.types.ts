export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      meetings: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          meeting_id: string;
          host_id: string;
          is_recurring: boolean | null;
          recurrence_pattern: string | null;
          start_time: string | null;
          duration: number | null;
          created_at: string | null;
          updated_at: string | null;
          settings: Json | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          meeting_id: string;
          host_id: string;
          is_recurring?: boolean | null;
          recurrence_pattern?: string | null;
          start_time?: string | null;
          duration?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          settings?: Json | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          meeting_id?: string;
          host_id?: string;
          is_recurring?: boolean | null;
          recurrence_pattern?: string | null;
          start_time?: string | null;
          duration?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          settings?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "meetings_host_id_fkey";
            columns: ["host_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      meeting_participants: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          status: string | null;
          joined_at: string | null;
          left_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id: string;
          status?: string | null;
          joined_at?: string | null;
          left_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          user_id?: string;
          status?: string | null;
          joined_at?: string | null;
          left_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey";
            columns: ["meeting_id"];
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meeting_participants_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      meeting_sessions: {
        Row: {
          id: string;
          meeting_id: string;
          started_at: string | null;
          ended_at: string | null;
          is_active: boolean | null;
          participant_count: number | null;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          started_at?: string | null;
          ended_at?: string | null;
          is_active?: boolean | null;
          participant_count?: number | null;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          started_at?: string | null;
          ended_at?: string | null;
          is_active?: boolean | null;
          participant_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "meeting_sessions_meeting_id_fkey";
            columns: ["meeting_id"];
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          credits: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          image: string | null;
          name: string | null;
          subscription: string | null;
          token_identifier: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          credits?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
          subscription?: string | null;
          token_identifier: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          credits?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
          subscription?: string | null;
          token_identifier?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
