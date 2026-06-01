# Swarlehtaire

A modern HTML5 card solitaire game collection built with Angular and TypeScript.

## 🎴 About

Swarlehtaire is a web-based solitaire game platform inspired by the classic PySolFC card game collection. It features:

- **Modern Tech Stack**: Angular 21 + TypeScript
- **Card Games**: Starting with Klondike, with plans to add more variants
- **Beautiful Cards**: Styling inspired by PySolFC
- **Cross-platform**: Web, Desktop (via Electron/Tauri), Mobile

## 🏗️ Architecture

This project is built on the excellent architecture from [mah](https://github.com/ffalt/mah), a modern Mahjong solitaire game. The core game engine, state management, and UI patterns are adapted for card-based solitaire games.

## 🚀 Quick Start

### Container (Recommended)

Requires Docker or Podman.

```bash
# Production - using Docker Compose
docker compose up -d web

# Access at http://localhost:8080

# Development - with hot reload
docker compose --profile dev up -d dev

# Or use Makefile shortcuts
make build      # Build image
make up         # Start production
make dev        # Start development
```

See [DOCKER.md](docs/DOCKER.md) for full Docker documentation.

### Traditional Build

Requires Node.js >= 22 and npm.

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:4200

# Production build
npm run build:prod
```

## 🎮 Games

- **Klondike** - Classic solitaire (Draw 1, Draw 3, Easthaven, Westcliff variants)
- **Spider** - Multi-suit patience game
- **FreeCell** - Skill-based solitaire with free cells
- **Pyramid** - Card-pairing solitaire
- **Scorpion** - 7-column tableau game
- **Yukon** - Move face-up sequences regardless of order
- **Baker's Dozen** - 13-column tableau, no empty columns

## � Documentation

- [Getting Started Guide](docs/GETTING_STARTED.md)
- [Docker Setup](docs/DOCKER.md)
- [Versioning Strategy](docs/VERSIONING.md)

## �📝 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Credits

- Architecture based on [mah](https://github.com/ffalt/mah) by ffalt
- Card styling inspired by [PySolFC](https://github.com/shlomif/PySolFC)
- Created by [smingolelli](https://github.com/slmingol)

## 🛠️ Development

### Project Structure

```
src/
├── app/
│   ├── components/         # UI components
│   │   ├── *-board/        # Per-game board components
│   │   ├── card/           # Playing card renderer
│   │   ├── stack/          # Card stack component
│   │   ├── icons/          # SVG icon components
│   │   └── ...             # Dialog, settings, help, tutorial, etc.
│   ├── directives/         # Angular directives
│   ├── model/              # Game logic and data models
│   │   ├── *-game.ts       # Game engines (one per game type)
│   │   ├── card.ts         # Card model
│   │   ├── card-stack.ts   # Card stack model
│   │   ├── deck.ts         # Deck model
│   │   └── solver/         # Solver engine (web worker)
│   ├── modules/
│   │   └── editor/         # Layout editor (Mahjong boards)
│   ├── pipes/              # Angular pipes
│   ├── service/            # State management services (one per game type)
│   ├── style/              # Shared component styles
│   └── worker/             # Web worker entry points
├── assets/
│   ├── data/               # Mahjong layout definitions
│   ├── i18n/               # Translations
│   ├── patterns/           # Background pattern definitions (JSON)
│   ├── sounds/             # Audio assets
│   └── svg/                # Tile/card SVG sets
├── environments/           # Build environment configs
├── fonts/                  # Bundled fonts
├── index.html
├── main.ts
└── styles.scss
```

### Adding a New Game

1. Add game engine to `src/app/model/<game>-game.ts`
2. Add state service to `src/app/service/<game>.service.ts`
3. Create board component in `src/app/components/<game>-board/`
4. Register in `app.component.ts` (`GameType` enum + selector switch)

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.
