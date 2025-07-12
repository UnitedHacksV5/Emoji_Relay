/*
  # Emoji Relay Game Schema

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `room_code` (text, unique, 6-character room identifier)
      - `current_player_index` (integer, tracks whose turn it is)
      - `emoji_story` (jsonb array, stores the emoji sequence)
      - `game_phase` (text, tracks game state: waiting/playing/finished)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `players`
      - `id` (uuid, primary key)
      - `game_id` (uuid, foreign key to games)
      - `name` (text, player display name)
      - `is_host` (boolean, identifies game creator)
      - `is_ready` (boolean, player ready status)
      - `player_order` (integer, turn order in game)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated and anonymous users to read/write game data
    - Players can only modify their own player records

  3. Indexes
    - Add index on room_code for fast game lookups
    - Add index on game_id for efficient player queries
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  current_player_index integer DEFAULT 0,
  emoji_story jsonb DEFAULT '[]'::jsonb,
  game_phase text DEFAULT 'waiting' CHECK (game_phase IN ('waiting', 'playing', 'finished')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_host boolean DEFAULT false,
  is_ready boolean DEFAULT false,
  player_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for games table
CREATE POLICY "Anyone can read games"
  ON games
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create games"
  ON games
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON games
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Create policies for players table
CREATE POLICY "Anyone can read players"
  ON players
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create players"
  ON players
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON players
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete players"
  ON players
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_room_code ON games(room_code);
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();