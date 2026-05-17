# Getting Started with Swarlehtaire

Welcome to Swarlehtaire! This guide will help you get the app running quickly.

## 🐳 Quick Start with Docker (Recommended)

The easiest way to run Swarlehtaire is using Docker:

```bash
# Clone the repository
git clone https://github.com/slmingol/swarlehtaire.git
cd swarlehtaire

# Start the app
make up

# Or without make:
docker compose up -d web

# Access at http://localhost:8080
```

That's it! The app will build and start automatically.

## 🛠️ Development Mode

Want to make changes and see them live?

```bash
# Start development server with hot reload
make dev

# Or:
docker compose --profile dev up -d dev

# Access at http://localhost:4200
# Changes to src/ files will auto-reload
```

## 📦 Local Development (Without Docker)

If you prefer to run locally:

```bash
# Install dependencies (requires Node.js 22+)
npm install

# Start dev server
npm start

# Access at http://localhost:4200
```

## 🎮 Playing the Game

Once running, open your browser to:
- **Production**: http://localhost:8080
- **Development**: http://localhost:4200

Currently available game:
- **Klondike Solitaire** - The classic solitaire game

### Game Controls

- **Mouse**: Click and drag cards to move them
- **Double-click**: Auto-move cards to foundation (when possible)
- **Undo**: Undo last move
- **New Game**: Start a fresh game with reshuffled deck

## 🔧 Useful Commands

### Docker Commands

```bash
make build      # Build production image
make up         # Start production container
make down       # Stop all containers
make dev        # Start development server
make logs       # View container logs
make shell      # Shell into running container
make clean      # Remove containers and images
make rebuild    # Clean rebuild from scratch
```

### NPM Commands

```bash
npm start               # Development server
npm run build:prod      # Production build
npm test                # Run tests
npm run lint            # Lint code
npm run lint:fix        # Fix lint issues
```

## 📁 Project Structure

```
swarlehtaire/
├── src/
│   └── app/
│       ├── model/              # Game models
│       │   ├── card.ts         # Card definitions
│       │   ├── deck.ts         # Deck management
│       │   ├── card-stack.ts   # Stack/pile logic
│       │   └── klondike-game.ts # Klondike implementation
│       ├── components/         # UI components (TBD)
│       └── services/           # Angular services (TBD)
├── docker/                     # Docker configs
├── Dockerfile                  # Production build
├── Dockerfile.dev              # Development build
├── docker-compose.yml          # Compose config
└── Makefile                    # Common commands
```

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 is already taken:

```bash
# Edit docker-compose.yml and change:
ports:
  - "9090:80"  # Use port 9090 instead
```

### Docker Build Fails

Try a clean rebuild:

```bash
make clean
make rebuild
```

### Can't Access the App

Check if container is running:

```bash
docker compose ps
docker compose logs web
```

## 🚀 Next Steps

1. **Play the game** - Test out Klondike solitaire
2. **Explore the code** - Check out the TypeScript models in `src/app/model/`
3. **Read the docs** - See [DOCKER.md](DOCKER.md) for detailed Docker info
4. **Contribute** - Help add more solitaire games!

## 📚 Documentation

- [DOCKER.md](DOCKER.md) - Comprehensive Docker documentation
- [README.md](README.md) - Project overview and features
- [.github/workflows/README.md](.github/workflows/README.md) - CI/CD documentation

## 💡 Tips

- Use **development mode** when making changes to see instant updates
- The **production build** is optimized and much smaller (~50MB)
- Check `make help` for all available commands
- View logs with `make logs` if something isn't working

Happy playing! 🎴
