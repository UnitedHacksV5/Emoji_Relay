import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string;
          room_code: string;
          current_player_index: number;
          emoji_story: string[];
          game_phase: 'waiting' | 'playing' | 'finished';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_code: string;
          current_player_index?: number;
          emoji_story?: string[];
          game_phase?: 'waiting' | 'playing' | 'finished';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_code?: string;
          current_player_index?: number;
          emoji_story?: string[];
          game_phase?: 'waiting' | 'playing' | 'finished';
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          game_id: string;
          name: string;
          is_host: boolean;
          is_ready: boolean;
          player_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          name: string;
          is_host?: boolean;
          is_ready?: boolean;
          player_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          name?: string;
          is_host?: boolean;
          is_ready?: boolean;
          player_order?: number;
          created_at?: string;
        };
      };
    };
  };
}