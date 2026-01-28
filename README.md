# Plants vs Zombies Clone

A Plants vs Zombies style tower defense game built with Phaser 3.

## 🚀 How to Run

1. **Open VS Code**
2. **Install Live Server Extension** (one-time):
   - Click Extensions (Ctrl+Shift+X)
   - Search "Live Server"
   - Install by Ritwick Dey
3. **Open this folder in VS Code**
4. **Right-click `index.html`** → "Open with Live Server"
5. **Game opens in your browser!** 🎮

## ✅ What's Working (Phases 0-2)

### Phase 1: Grid System
- Green lawn with grass texture
- 5×9 visible grid with green lines
- Interactive cells (hover = yellow highlight)
- Click detection

### Phase 2: Sun System ⭐ NEW!
- ☀️ Sun falls from sky every 8 seconds
- Click sun to collect it (+25 sun)
- Sun flies to counter with animation
- Sun disappears after 8 seconds if not collected
- Sun counter updates with pulse effect
- Starting sun: 50

## 📁 File Structure

```
plants-vs-zombies/
├── index.html              # Main file - open this!
├── src/
│   ├── entities/
│   │   └── Sun.js          # Sun collectible entity
│   ├── config/
│   │   └── GameConfig.js   # Phaser settings
│   ├── scenes/
│   │   └── GameScene.js    # Main game logic
│   └── systems/
│       ├── GridSystem.js   # Grid management
│       └── SunManager.js   # Sun spawning system
└── assets/                 # Images/sounds (empty for now)
```

## 🎮 Testing

### Grid System
- **Hover** over grid cells → they highlight yellow
- **Click** on cells → red circle appears for 1 second

### Sun System
- **Wait** 3 seconds → first sun falls from sky
- **Click** on falling sun → it flies to counter
- **Watch** sun counter → increases by +25
- **Ignore** sun → it disappears after 8 seconds
- **Collect** multiple suns → counter keeps adding up!

## 📝 Next Steps

- Phase 3: Plant System 🌻
- Phase 4: Zombie System 🧟
- Phase 5: Combat ⚔️

Made with ❤️ for learning game development!
