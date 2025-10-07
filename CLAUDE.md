# 🤖 Claude Code Assistant Instructions

This document provides essential guidance for working with the Golazo Kings web application codebase.

## Project Overview

**Golazo Kings** is a Vue.js web application for creating football lineups inspired by the Kings League. Users can build lineups, explore players, and manage football teams with an EA FC-inspired design.

### Tech Stack

- **Frontend Framework**: Vue 3 with Composition API + TypeScript
- **UI Framework**: Quasar Framework (Vue-based component library)
- **Styling**: TailwindCSS with custom design system
- **State Management**: Pinia
- **Routing**: Vue Router 4 (history mode)
- **Build Tool**: Vite (via Quasar CLI)
- **Internationalization**: Vue I18n
- **HTTP Client**: Axios
- **Package Manager**: pnpm
- **Deployment**: Railway (Nixpacks)

## Development Commands

### Core Commands

```bash
# Install dependencies
pnpm install

# Start development server (auto-opens browser)
pnpm dev
# or
quasar dev

# Build for production
pnpm build
# or
quasar build

# Lint code
pnpm lint

# Format code
pnpm format

# Start production server (Railway deployment)
pnpm start
```

### Environment Setup

- **Node**: ^28 || ^26 || ^24 || ^22 || ^20 || ^18
- **Package Manager**: pnpm (preferred), yarn >= 1.21.1, or npm >= 6.13.4
- Development server automatically opens browser on `http://localhost:9000`

## Project Architecture

### Module-Based Organization

The project follows a modular architecture under `/src/modules/`:

```
src/modules/
├── home/                    # Landing page and demo builder
├── lineup-builder/          # Team lineup creation
├── players/                 # Player management and exploration
├── teams/                   # Team entities and management
├── leagues/                 # League and season management
├── budget/                  # Salary division and budget features
├── guess-roster/            # Guessing game functionality
└── shared/                  # Shared utilities, components, and services
```

### Domain-Driven Design Pattern

Each module follows DDD principles:

```
module/
├── components/             # UI components specific to module
├── pages/                  # Page components
├── composables/           # Vue composables for business logic
├── domain/
│   ├── entities/          # Business entities (classes)
│   ├── value-objects/     # Enums and value objects
│   └── enums/             # Domain-specific enums
├── dtos/                  # Data Transfer Objects
├── mappers/               # Entity-DTO mapping
└── dialogs/               # Modal components
```

### Key Entities

- **Player**: Core entity with Kings League-specific properties (wildcards, ratings, positions)
- **Team**: Team management and lineup organization
- **League/Season**: Competition structure
- **PlayerStats**: Performance tracking

### Routing Structure

- `/` - Home page with demo builder
- `/lineups` - Lineup builder tool
- `/explore-players` - Player database browser
- `/guess-roster` - Guessing game
- `/budget` - Salary division tool

## UI/UX Design System

### Color Scheme (Football/EA FC Inspired)

```css
/* Primary Colors */
--go-blue:
  EA FC blue theme --go-cyan: Vibrant cyan --go-purple: Premium purple --go-green: Field green
    --go-gold: Premium gold --go-orange: Legend orange --go-red: Competitive red --go-pink: Special
    pink /* Rating Colors (Card-specific) */ --rating-bronze,
  --rating-silver, --rating-gold --rating-inform, --rating-special, --rating-icon, --rating-legend;
```

### Animation System

- Custom keyframes for card interactions, field glow, particle effects
- Hover animations with scale and shadow effects
- Smooth transitions with custom easing functions

### Component Patterns

- **Consistent barrel exports** (`index.ts` files)
- **Scoped styling** with SCSS + TailwindCSS classes
- **TailwindCSS utility classes** with custom design tokens
- **Quasar components** integration (q-btn, q-btn-dropdown, q-img, etc.)
- **Smart component architecture**: Dumb components emit events, smart containers handle logic
- **Canvas + Vue hybrid**: SoccerField uses Canvas for field rendering with Vue components overlaid

## Key Features & Components

### Demo Builder (Home)

- Interactive lineup formation
- Drag-and-drop player positioning
- Real-time formation preview
- Player search and filtering

### Player Management

- Comprehensive player database
- Search engine with position filtering
- Player cards with ratings and stats
- Kings League-specific categories (wildcards, draft players)

### Lineup Builder

- Formation-based positioning with visual soccer field
- Drag-and-drop player positioning on canvas
- Field and bench player management
- Budget constraints with real-time calculation
- Team chemistry visualization
- Player modification system (custom market values, positions, etc.)
- Persistent state with Pinia store
- Intelligent player adding with split dropdown buttons
- Dynamic player status (in field, in bench, not in lineup)

## Configuration Files

### Key Configs

- **quasar.config.ts**: Main build and framework configuration
- **tailwind.config.ts**: Custom design system and animations
- **eslint.config.js**: TypeScript + Vue linting rules
- **postcss.config.js**: TailwindCSS and autoprefixer setup
- **railway.json**: Deployment configuration

### Boot Files

- `boot/i18n.ts`: Internationalization setup
- `boot/axios.ts`: HTTP client configuration

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- Vue 3 Composition API preferred
- Consistent type imports (`@typescript-eslint/consistent-type-imports`)
- Prettier formatting enforced

### User Notifications Pattern

**Priority Order for Notifications:**

1. **Domain-specific composables** (preferred)
   - Use `useLineupFeedback` for lineup-related actions
   - Use `usePlayerFeedback` for player-related actions (if exists)
   - Domain composables provide context-aware messages and consistent UX

2. **Generic feedback composable** (fallback)
   - Use `useFeedback` for general notifications
   - Provides `success()`, `error()`, `warning()`, `info()`, `loading()`
   - Consistent styling and positioning across the app

3. **Quasar Notify** (last resort)
   - Only use directly when domain composables don't exist
   - Consider creating a domain composable if multiple notifications needed
   - Import: `import { Notify } from 'quasar'`

**Example:**
```typescript
// ✅ GOOD: Use domain-specific composable
const lineupFeedback = useLineupFeedback();
lineupFeedback.playerAddedToField(playerName);

// ✅ GOOD: Use generic composable for non-domain actions
const feedback = useFeedback();
feedback.success('Datos guardados correctamente');

// ⚠️ ACCEPTABLE: Direct Quasar Notify when no composable exists
Notify.create({ type: 'positive', message: 'Acción completada' });

// ❌ BAD: Direct Quasar Notify when composable exists
Notify.create({ type: 'positive', message: 'Jugador añadido' }); // Use useLineupFeedback instead!
```

### Component Structure

```vue
<template>
  <!-- Template with Quasar components and TailwindCSS -->
</template>

<script setup lang="ts">
// Imports (types first, then composables, then components, then helpers)
// Composables usage
// Component logic
</script>

<style lang="scss" scoped>
// Component-specific styles
</style>
```

### Code Organization & Reusability

**Shared Components Location:**
- **Module-specific components**: Place in `src/modules/{module}/components/`
  - Example: `TeamSelector` → `src/modules/lineup-builder/components/TeamSelector/`
  - Used only within that module's domain
- **Truly shared components**: Place in `src/modules/shared/components/`
  - Example: `ImageUploader` → `src/modules/shared/components/ImageUploader/`
  - Reusable across multiple modules

**Utility Functions:**
- Extract reusable logic to `src/modules/shared/utils/`
- Example: `imageUpload.util.ts` for image validation and conversion
- Create typed interfaces for configuration options
- Include JSDoc comments for better DX

**Helper Functions:**
- Extract reusable business logic to `src/modules/{module}/helpers/`
- One helper file per responsibility (single responsibility principle)
- Example: `swapPlayer.helper.ts`, `movePlayer.helper.ts`, `removePlayer.helper.ts`
- Use typed parameter interfaces for better type safety
- Export from central `index.ts` for clean imports
- **Benefits:**
  - Eliminates code duplication between components
  - Centralized business logic for easier testing
  - Consistent behavior across components
  - Better separation of concerns (components focus on rendering)

**Helper Pattern Example:**
```typescript
// swapPlayer.helper.ts
import type { useLineupStore } from 'stores/useLineupStore';
import type { useLineupDialogs } from '@/composables/useLineupDialogs';
import type { useLineupFeedback } from '@/composables/useLineupFeedback';

interface SwapPlayerParams {
  currentPlayerId: number;
  lineupStore: ReturnType<typeof useLineupStore>;
  lineupDialogs: ReturnType<typeof useLineupDialogs>;
  lineupFeedback: ReturnType<typeof useLineupFeedback>;
  allPlayersInSlots: PlayerSlot[];
}

export const handleSwapPlayer = (params: SwapPlayerParams): void => {
  // Centralized swap logic used by multiple components
};

// Component usage with wrapper
const onSwapPlayer = (playerId: number) => {
  handleSwapPlayer({
    currentPlayerId: playerId,
    lineupStore,
    lineupDialogs,
    lineupFeedback,
    allPlayersInSlots: allPlayersInSlots.value,
  });
};
```

**Dialog Management:**
- Centralize dialog opening logic in composables
- Pattern: `useModuleDialogs.ts` (e.g., `useLineupDialogs.ts`)
- Benefits:
  - Single source of truth for dialog logic
  - Consistent dialog behavior across components
  - Easy to test and maintain
  - Reusable across multiple components

**Example Structure:**
```typescript
// ✅ GOOD: Composable for dialog management
export function useLineupDialogs() {
  const $q = useQuasar();
  
  const openTeamDialog = () => {
    return $q.dialog({ component: TeamLineupDialog })
      .onOk(handleResult)
      .onCancel(handleCancel);
  };
  
  return { openTeamDialog };
}

// Component uses composable
const { openTeamDialog } = useLineupDialogs();
```

### State Management

- **Pinia stores** for global state (with persistence)
  - `useLineupStore`: Lineup management, player modifications, budget tracking
  - Computed properties for derived state (field/bench players, budget calculations)
  - Reactive lineup player management
  - **Store Usage Pattern**: Components should read from store using `storeToRefs()` for reactivity
  ```typescript
  // ✅ GOOD: Reactive store access
  const lineupStore = useLineupStore();
  const { lineupTeam } = storeToRefs(lineupStore);
  const teamLogo = computed(() => lineupTeam.value?.logo || null);
  
  // ❌ BAD: Direct destructuring loses reactivity
  const { lineupTeam } = useLineupStore();
  ```
- **Composables** for shared logic
  - `useLineupFeedback`: User notifications for lineup actions
  - `useLineupDialogs`: Dialog management
  - `useSharedPlayerSearch`: Search and filtering logic
- **Local reactive state** for component-specific data

### API Integration

- Axios instance configured in boot files
- Domain entities with mappers for API responses
- Type-safe DTOs for data transfer

## Deployment

### Railway Configuration

- **Build**: `pnpm install && pnpm run build`
- **Start**: `npx serve dist/spa -s -l 8080`
- **Platform**: Nixpacks
- **Port**: 8080 (production)

### Build Output

- SPA mode builds to `/dist/spa/`
- Static assets optimized and bundled
- Progressive Web App ready

## Testing & Quality

### Current Status

- No test suite currently configured (`echo "No test specified"`)
- ESLint + Prettier for code quality
- TypeScript type checking via vue-tsc

### Recommendations for Testing Setup

- Consider Vitest for unit testing
- Cypress or Playwright for E2E testing
- Component testing with Vue Test Utils

## Recent Features & Implementation Details

### Soccer Field Component Architecture

**Location**: `src/modules/lineup-builder/components/SoccerField/`

- **SoccerField.vue**: Main component with dual-canvas architecture
  - Canvas for field rendering (with optional 3D tilt effect)
  - Canvas for player rendering (no rotation, overlaid)
  - Vue components (TeamSlot, CoachSlot) positioned absolutely for UI elements
- **TeamSlot.vue**: Team info display (logo + name) with Tailwind styling
- **CoachSlot.vue**: Coach info display (photo + name) with Tailwind styling
- **Drag & Drop**: Mouse event handling for player repositioning
- **Responsive**: Auto-resize with `useResizeObserver`

### Lineup Player Management System

**Store**: `src/stores/useLineupStore.ts`

#### State Structure
```typescript
- lineupPlayers: LineupPlayer[] // Players in lineup (field + bench)
- playersModified: PlayerDto[]   // Players with custom modifications
- budget: number                 // Total budget
- formation: FormationOption     // Current formation
```

#### Key Methods
```typescript
// Lineup Management
- addLineupPlayer(player, isBench)    // Add player to field or bench
- removeLineupPlayer(playerId)         // Remove from lineup
- moveLineupPlayer(playerId, toBench)  // Move between field and bench
- getPlayerLineupStatus(playerId)      // Get player's current status
- swapPlayers(playerId1, playerId2)    // Swap two players (field-field, bench-bench, field-bench)

// Player Modifications
- modifyPlayer(playerId, modifications) // Update player properties
- removePlayerModification(playerId)    // Reset to original
- syncLineupPlayers()                   // Auto-sync modifications

// Slot Position Management
- updateSlotPosition(slotId, x, y)     // Update player position on field
- resetSlotPositions()                 // Reset to formation defaults
- movePlayerToSlot(playerId, slotId)   // Move player to specific field slot
```

#### Computed Properties
```typescript
- fieldPlayers / benchPlayers          // Filtered by location
- fieldPlayersCount / benchPlayersCount // Counts
- spent / remaining / percentage       // Budget calculations
```

### Smart Button System (PlayerCardMini)

**Location**: `src/modules/players/components/PlayerCard/PlayerCardMini.vue`

- **Dynamic q-btn-dropdown** that changes based on player status:
  - **Not in lineup**: "Añadir" button (blue) → Add to field or bench
  - **In field**: "En campo" button (green) → Move to bench or remove
  - **In bench**: "En banca" button (orange) → Move to field or remove
- **Props pattern**: Receives `getPlayerStatus` function for reactive status
- **Event-driven**: Emits actions, parent handles logic
- **Visual feedback**: Icons and colors indicate current state

### Feedback System

**Composable**: `src/modules/lineup-builder/composables/useLineupFeedback.ts`

- Centralized user notifications using Quasar Notify
- Specific methods for each action:
  - `playerAddedToField()` / `playerAddedToBench()`
  - `playerMoved(name, toBench)`
  - `playersSwapped(player1Name, player2Name)` - Shows swap success with both names
  - `swapError()` - Shows swap failure message
  - `playerRemoved(name)`
- Consistent icons and styling across all notifications
- Built on top of `useFeedback` for reusability

### Helper System

**Location**: `src/modules/lineup-builder/helpers/`

- **Purpose**: Eliminate code duplication between components
- **Pattern**: One helper file per responsibility
- **Usage**: Import from central `index.ts` barrel export

**Available Helpers:**
- `handleSwapPlayer` - Swap players between positions (field ↔ field, bench ↔ bench, field ↔ bench)
- `handleViewPlayerDetails` - Open player details dialog
- `handleEditPlayerValue` - Open player value edit dialog
- `handleMovePlayerToBench` - Move player from field to bench
- `handleMovePlayerToField` - Move player from bench to field
- `handleRemovePlayer` - Remove player from lineup

**Helper Benefits:**
- Centralized business logic (DRY principle)
- Type-safe parameter interfaces
- Consistent behavior across components
- Easier testing and maintenance
- Components focus on rendering, not business logic

**Used By:**
- `SoccerField.vue` - Main field component
- `BenchSlot.vue` - Bench management component
- Other components that manage player actions

### Advertising Integration

**Components**:
- `AdBanner.vue`: Google AdSense banner with configurable heights
- `AdInFeed.vue`: In-feed ads for player lists
- `CookieConsent.vue`: Cookie consent management

**Features**:
- Environment-based ad display (production only)
- Cookie consent integration
- Configurable sizes (small, medium, large, auto)
- Sticky positioning for better visibility

## Common Tasks

### Adding New Modules

1. Create module directory in `/src/modules/`
2. Follow DDD structure (domain/, components/, pages/)
3. Add route in `/src/router/routes.ts`
4. Create barrel exports with `index.ts` files

### Refactoring Components

**When to Extract Code:**

1. **Validation Logic** → Extract to utilities
   - File size validation, format validation, URL validation
   - Create typed interfaces for options
   - Place in `src/modules/shared/utils/`

2. **Image/File Processing** → Extract to utilities
   - Base64 conversion, file reading, image manipulation
   - Return typed results (success/error objects)
   - Reusable across uploader components

3. **Repeated UI Patterns** → Create shared components
   - Team selectors, image uploaders, form inputs
   - Make configurable with props
   - Support v-model for two-way binding

4. **Dialog Opening Logic** → Move to composables
   - Centralize in `useModuleDialogs` composable
   - Keep components clean and focused on rendering
   - Easy to test and maintain

**Component Simplification Pattern:**
```typescript
// Before: 150+ lines with inline logic
<script setup>
const uploadFactory = async (files) => {
  // 50+ lines of validation, conversion, error handling
};
</script>

// After: ~50 lines using utilities and composables
<script setup>
import { validateImageFile, fileToBase64 } from '@/utils/imageUpload.util';
import { useLineupDialogs } from '@/composables/useLineupDialogs';

const { openTeamDialog } = useLineupDialogs();
const validation = validateImageFile(file);
const base64 = await fileToBase64(file);
</script>
```

**Benefits:**
- Reduced code duplication
- Improved testability
- Better separation of concerns
- Easier maintenance
- Consistent behavior across components

### Player Entity Work

- Entity class in `/src/modules/players/domain/entities/player.entity.ts`
- Rich domain methods for Kings League-specific logic
- Type-safe enums for positions, wildcard types, preferred foot

### Styling Components

- Use TailwindCSS utilities with custom design tokens
- Leverage Quasar components for complex UI elements
- **Animation Rule**: Always use Quasar's built-in transitions instead of custom CSS
  ```vue
  <!-- ✅ GOOD: Use Quasar transitions -->
  <q-slide-transition>
    <div v-if="showContent">Content</div>
  </q-slide-transition>
  
  <!-- ❌ BAD: Custom CSS transitions -->
  <transition name="fade">
    <div v-if="showContent">Content</div>
  </transition>
  <style>
  .fade-enter-active { transition: opacity 0.3s; }
  </style>
  ```
  **Available Quasar Transitions:**
  - `<q-slide-transition>` - Slide animations
  - `<q-fade-transition>` - Fade in/out
  - `<q-scale-transition>` - Scale effects
  - Benefits: Optimized performance, consistent behavior, less code

### Internationalization

- Add translations in `/src/i18n/en-US/`
- Use `$t()` function in templates
- Configure new locales in boot files

## Troubleshooting

### Common Issues

- **Node version**: Ensure compatible Node.js version (18-28)
- **Package manager**: Use pnpm for consistency
- **Hot reload**: Quasar dev server includes auto-refresh
- **Build errors**: Check TypeScript strict mode compliance

### Performance Optimization

- Lazy-loaded routes for code splitting
- Component-level code splitting
- TailwindCSS purging for optimal bundle size
- Vite's optimized bundling

## Resources

- [Quasar Framework Docs](https://v2.quasar.dev/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Railway Deployment](https://railway.app/docs)

---

This is a well-structured, modern Vue.js application with a strong focus on football/soccer team management, following current best practices for scalable frontend development.
