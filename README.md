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

See [DOCKER.md](DOCKER.md) for full Docker documentation.

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

### Implemented
- **Klondike** - The classic solitaire game

### Planned
- Spider
- FreeCell
- Pyramid
- Golf
- And more...

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 🙏 Credits

- Architecture based on [mah](https://github.com/ffalt/mah) by ffalt
- Card styling inspired by [PySolFC](https://github.com/shlomif/PySolFC)
- Created by [smingolelli](https://github.com/slmingol)

## 🛠️ Development

### Project Structure

\`\`\`
src/
├── app/
│   ├── components/     # UI components
│   ├── models/         # Game models (Card, Deck, Stack, etc.)
│   ├── services/       # Game services
│   └── games/          # Game implementations (Klondike, etc.)
├── assets/             # Images, sounds, etc.
└── styles/             # Global styles
\`\`\`

### Adding a New Game

1. Create game rules in \`src/app/games/\`
2. Define card stack layouts
3. Implement game logic and validation
4. Add to game selector

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.
