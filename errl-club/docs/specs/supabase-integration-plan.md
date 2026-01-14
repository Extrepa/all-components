# Supabase Integration Plan

This document outlines the step-by-step plan for integrating Supabase as the backend for Errl Club Simulator's multiplayer functionality.

## Overview

Supabase will provide:
- **Real-time multiplayer** via Supabase Realtime
- **User authentication** for player accounts
- **Data persistence** for player profiles, achievements, and settings
- **Room state synchronization** for multiplayer rooms

## Current State

### ✅ Already Implemented
- `@supabase/supabase-js` package is installed (v2.47.0)
- `NetworkClient` has placeholder for Supabase transport
- `NetworkConfig` checks for Supabase environment variables
- Network infrastructure (MultiplayerManager, StateSync, MessageHandler) is ready
- Event bus system for decoupled communication

### ⚠️ Needs Implementation
- Supabase client initialization
- Realtime channel subscription
- Database schema design
- Authentication flow
- Player state synchronization
- Room state management

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase Project
- [ ] Create new Supabase project at https://supabase.com
- [ ] Note project URL and anon key
- [ ] Set up environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SUPABASE_CHANNEL` (optional, defaults to 'errl_room_main')

### 1.2 Database Schema Design

#### Tables Needed:

**`players`**
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  avatar_variant TEXT DEFAULT 'classic_purple',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**`player_stats`**
```sql
CREATE TABLE player_stats (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  drips_collected INTEGER DEFAULT 0,
  bubbles_collected INTEGER DEFAULT 0,
  fragments_collected INTEGER DEFAULT 0,
  glow_balls_collected INTEGER DEFAULT 0,
  rare_collectibles INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**`player_achievements`**
```sql
CREATE TABLE player_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, achievement_id)
);
```

**`room_sessions`**
```sql
CREATE TABLE room_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  position_x REAL,
  position_y REAL,
  position_z REAL,
  rotation_y REAL,
  state TEXT DEFAULT 'idle',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**`room_state`**
```sql
CREATE TABLE room_state (
  room_id TEXT PRIMARY KEY,
  current_players INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 1.3 Row Level Security (RLS) Policies

```sql
-- Players can read all player profiles
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players can read all profiles" ON players
  FOR SELECT USING (true);

-- Players can update their own profile
CREATE POLICY "Players can update own profile" ON players
  FOR UPDATE USING (auth.uid() = id);

-- Similar policies for other tables...
```

## Phase 2: Supabase Client Implementation

### 2.1 Create Supabase Client Module

**File**: `src/network/SupabaseClient.js` (new)

```javascript
import { createClient } from '@supabase/supabase-js';

export class SupabaseClient {
  constructor(url, anonKey) {
    this.client = createClient(url, anonKey);
    this.realtime = null;
    this.channel = null;
  }

  // Authentication methods
  async signIn(email, password) { }
  async signUp(email, password, username) { }
  async signOut() { }
  async getCurrentUser() { }

  // Realtime subscription
  async subscribeToChannel(channelName, callbacks) { }
  async unsubscribeFromChannel() { }

  // Database operations
  async getPlayerProfile(playerId) { }
  async updatePlayerProfile(playerId, data) { }
  async getPlayerStats(playerId) { }
  async updatePlayerStats(playerId, stats) { }
}
```

### 2.2 Implement NetworkClient.connectSupabase()

**File**: `src/network/NetworkClient.js`

Update the `connectSupabase()` method to:
1. Initialize Supabase client
2. Subscribe to Realtime channel
3. Set up message handlers
4. Handle connection state

## Phase 3: Authentication Integration

### 3.1 Authentication UI

**File**: `src/ui/AuthScreen.js` (new)

Create authentication screen with:
- Sign in form
- Sign up form
- Username/password fields
- Error handling
- Loading states

### 3.2 Authentication Flow

1. Check for existing session on app load
2. If no session, show auth screen
3. After sign in, store user ID in StateManager
4. Load player profile and stats
5. Initialize multiplayer connection

## Phase 4: Player State Synchronization

### 4.1 Player Position Sync

**File**: `src/network/StateSync.js` (update)

Implement:
- Periodic position updates (every 100-200ms)
- Throttling to prevent spam
- Delta compression for efficiency
- Interpolation for smooth remote player movement

### 4.2 Remote Player Rendering

**File**: `src/entities/RemotePlayer.js` (update)

Update to:
- Receive position updates from Supabase
- Interpolate between updates
- Handle player join/leave events
- Sync avatar appearance

## Phase 5: Room State Management

### 5.1 Room State Sync

**File**: `src/systems/RoomManager.js` (update)

Add:
- Room state persistence
- Player count tracking
- Room metadata updates
- Room cleanup on empty

### 5.2 Collectible Synchronization

**File**: `src/collectibles/CollectibleManager.js` (update)

Implement:
- Mark collectibles as collected in database
- Prevent duplicate collection
- Sync rare collectible spawns
- Track collection stats per player

## Phase 6: Real-time Events

### 6.1 Event Types

Define event types for Realtime:
- `player:join` - Player enters room
- `player:leave` - Player leaves room
- `player:move` - Player position update
- `player:collect` - Player collects item
- `player:emote` - Player performs emote
- `room:update` - Room state change

### 6.2 Event Handlers

**File**: `src/network/MessageHandler.js` (update)

Implement handlers for each event type:
- Parse incoming messages
- Update local state
- Trigger UI updates
- Emit local events via EventBus

## Phase 7: Data Persistence

### 7.1 Player Profile Persistence

- Save avatar variant selection
- Save color preferences
- Save settings (camera, audio, etc.)
- Auto-save on changes

### 7.2 Achievement Persistence

- Save unlocked achievements
- Track achievement progress
- Sync across devices

### 7.3 Collection Progress

- Save fragment count
- Save collectible counts
- Save streaks
- Sync on login

## Phase 8: Testing & Optimization

### 8.1 Load Testing

- Test with multiple concurrent players
- Measure message throughput
- Optimize update frequency
- Test reconnection handling

### 8.2 Error Handling

- Network disconnection recovery
- Message queue on disconnect
- Automatic reconnection
- Error logging and reporting

## Implementation Order

1. **Phase 1**: Set up Supabase project and database schema
2. **Phase 2**: Implement Supabase client and NetworkClient integration
3. **Phase 3**: Add authentication UI and flow
4. **Phase 4**: Implement player position synchronization
5. **Phase 5**: Add room state management
6. **Phase 6**: Implement real-time events
7. **Phase 7**: Add data persistence
8. **Phase 8**: Testing and optimization

## Environment Variables

Add to `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_CHANNEL=errl_room_main
```

## Dependencies

Already installed:
- `@supabase/supabase-js@^2.47.0`

May need to add:
- `@supabase/realtime-js` (if using Realtime directly)

## Notes

- Start with a single room (main nightclub) before adding multiple rooms
- Use Supabase Realtime for real-time updates
- Use Supabase Database for persistent data
- Consider using Supabase Storage for avatar images in the future
- Implement rate limiting to prevent abuse
- Add analytics to track usage patterns

## Future Enhancements

- Voice chat integration
- Friend system
- Private rooms
- Room moderation
- Player reporting system
- Leaderboards
- Seasonal events

