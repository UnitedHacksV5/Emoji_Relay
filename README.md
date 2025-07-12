# Emoji Relay - Multiplayer Storytelling Game

## Project Overview

Emoji Relay is a real-time multiplayer web game where players take turns adding emojis to create a collaborative story. The game uses React, TypeScript, Tailwind CSS, and Supabase for real-time functionality.

## Current Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **@emoji-mart/react** for emoji picker
- **Vite** as build tool

### Backend Stack
- **Supabase** for database and real-time subscriptions
- **PostgreSQL** database with Row Level Security (RLS)

### Database Schema

#### Games Table
```sql
- id (uuid, primary key)
- room_code (text, unique) - 6-character game identifier
- current_player_index (integer) - tracks whose turn it is
- emoji_story (jsonb) - array of emojis in the story
- game_phase (text) - 'waiting', 'playing', or 'finished'
- created_at, updated_at (timestamps)
```

#### Players Table
```sql
- id (uuid, primary key)
- game_id (uuid, foreign key to games)
- name (text) - player display name
- is_host (boolean) - true for game creator
- is_ready (boolean) - player readiness status
- player_order (integer) - turn order in game
- created_at (timestamp)
```

## Game Flow

### 1. Home Page (`HomePage.tsx`)
- Player enters their name
- Can create a new game or join existing game with room code
- Generates unique player ID and room code

### 2. Waiting Lobby (`WaitingLobby.tsx`)
- Shows room code for sharing
- Displays all joined players
- Host can start game when ≥2 players
- Real-time updates when players join/leave

### 3. Gameplay (`GameplayPage.tsx`)
- Players take turns adding emojis to story
- 30-second timer per turn
- Shows current story and whose turn it is
- Real-time updates for emoji additions

### 4. Final Story (`FinalStoryPage.tsx`)
- Displays completed emoji story
- Shows all contributors
- Options to share, play again, or start new game

## State Management

### GameContext (`src/context/GameContext.tsx`)
Central state management using React Context with:

```typescript
interface AppState {
  playerName: string;
  playerId: string;
  currentGame: GameState | null;
  currentPage: 'home' | 'lobby' | 'game' | 'story';
}

interface GameState {
  roomCode: string;
  players: Player[];
  currentPlayerIndex: number;
  emojiStory: string[];
  gamePhase: 'waiting' | 'playing' | 'finished';
  timeLeft: number;
}
```

### Key Functions
- `createGame()` - Creates new game and adds host player
- `joinGame(roomCode)` - Joins existing game
- `startGame()` - Transitions from waiting to playing phase
- `addEmoji(emoji)` - Adds emoji to story and advances turn
- `subscribeToGame()` - Sets up real-time subscriptions

## Real-time Implementation

### Supabase Real-time Subscriptions
The app uses Supabase's real-time features to sync game state across all players:

```typescript
const channel = supabase
  .channel(`game-${roomCode}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'games',
    filter: `room_code=eq.${roomCode}`
  }, handleGameUpdate)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'players',
    filter: `game_id=eq.${gameId}`
  }, handlePlayersUpdate)
  .subscribe();
```

## Current Issues & Debugging

### Real-time Synchronization Problem
**Issue**: Players joining games are not visible to existing players in real-time, preventing game start.

**Symptoms**:
- New players can see existing players
- Existing players cannot see new players join
- Host cannot start game due to outdated player count
- "Start Game" button remains disabled

**Debugging Steps Taken**:
1. ✅ Added proper gameId filtering to player subscriptions
2. ✅ Pass gameId directly to subscribeToGame function
3. 🔄 Added comprehensive logging to track real-time events

**Current Debugging Logs**:
- `🔄 Setting up real-time subscription` - Confirms subscription setup
- `👥 Fetched players data` - Shows what players are retrieved
- `Players update:` - Indicates real-time player events received
- `🔄 Updating app state` - Tracks state updates

### Testing Protocol
1. Open two browser windows with dev console
2. Create game in window 1, observe logs
3. Join game in window 2, observe logs in BOTH windows
4. Check if "Players update:" appears in both consoles
5. Compare "Fetched players data:" between windows

## Environment Setup

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Create Supabase project
2. Run migration: `supabase/migrations/20250712085300_solitary_cloud.sql`
3. Enable Row Level Security on both tables
4. Set up RLS policies for anonymous access

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## File Structure

```
src/
├── components/
│   ├── HomePage.tsx          # Landing page with create/join options
│   ├── WaitingLobby.tsx      # Pre-game lobby
│   ├── GameplayPage.tsx      # Main game interface
│   ├── FinalStoryPage.tsx    # Story completion screen
│   └── EmojiPicker.tsx       # Emoji selection component
├── context/
│   └── GameContext.tsx       # Global state management
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── types/
│   └── game.ts              # TypeScript type definitions
├── App.tsx                  # Main app component
└── main.tsx                 # App entry point
```

## Next Steps for Debugging

1. **Verify Real-time Events**: Check console logs to confirm if "Players update:" events are received by all clients
2. **Database Triggers**: Ensure database triggers are firing correctly for player inserts
3. **Subscription Filters**: Verify gameId filtering is working correctly
4. **Network Issues**: Check if WebSocket connections are stable
5. **State Updates**: Confirm React state updates are triggering re-renders

## Known Working Features

✅ Game creation and room code generation  
✅ Player name input and validation  
✅ Database operations (insert/update)  
✅ Basic navigation between pages  
✅ Emoji picker integration  
✅ Story display and progression  
✅ Turn-based gameplay logic  

## Issues to Resolve

❌ Real-time player synchronization  
❌ Game start functionality  
❌ Live player count updates  
❌ Cross-client state consistency  

## Technical Decisions Made

1. **No Authentication**: Uses anonymous access for simplicity
2. **Client-side State**: React Context for local state management
3. **Real-time Strategy**: Supabase subscriptions over WebSockets
4. **Room Codes**: 6-character alphanumeric codes for easy sharing
5. **Turn Timer**: 30-second limit per player turn
6. **Story Length**: 10 emojis maximum per story

This documentation should help any AI assistant understand the current state and continue debugging the real-time synchronization issues.