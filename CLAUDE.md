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
--go-blue: EA FC blue theme
--go-cyan: Vibrant cyan
--go-purple: Premium purple
--go-green: Field green
--go-gold: Premium gold
--go-orange: Legend orange
--go-red: Competitive red
--go-pink: Special pink

/* Rating Colors (Card-specific) */
--rating-bronze, --rating-silver, --rating-gold
--rating-inform, --rating-special, --rating-icon, --rating-legend
```

### Animation System
- Custom keyframes for card interactions, field glow, particle effects
- Hover animations with scale and shadow effects
- Smooth transitions with custom easing functions

### Component Patterns
- Consistent barrel exports (`index.ts` files)
- Scoped styling with SCSS
- TailwindCSS utility classes with custom design tokens
- Quasar components integration

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
- Formation-based positioning
- Bench management
- Budget constraints
- Team chemistry visualization

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

### Component Structure
```vue
<template>
  <!-- Template with Quasar components and TailwindCSS -->
</template>

<script setup lang="ts">
// Imports (types first, then composables, then components)
// Composables usage
// Component logic
</script>

<style lang="scss" scoped>
// Component-specific styles
</style>
```

### State Management
- Pinia stores for global state
- Composables for shared logic
- Local reactive state for component-specific data

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

## Common Tasks

### Adding New Modules
1. Create module directory in `/src/modules/`
2. Follow DDD structure (domain/, components/, pages/)
3. Add route in `/src/router/routes.ts`
4. Create barrel exports with `index.ts` files

### Player Entity Work
- Entity class in `/src/modules/players/domain/entities/player.entity.ts`
- Rich domain methods for Kings League-specific logic
- Type-safe enums for positions, wildcard types, preferred foot

### Styling Components
- Use TailwindCSS utilities with custom design tokens
- Leverage Quasar components for complex UI elements
- Apply custom animations for enhanced UX

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