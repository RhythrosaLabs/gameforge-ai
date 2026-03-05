# GameForge AI 🎮

> AI-powered 2D game creation tool by **Rhythrosa Labs**  
> *From idea to playable game in seconds.*

![GameForge AI banner](https://img.shields.io/badge/GameForge_AI-v1.0.0-6366f1?style=for-the-badge&logo=gamepad)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)
![OpenAI](https://img.shields.io/badge/powered_by-OpenAI-0ea5e9?style=for-the-badge&logo=openai)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Game Plan** | Full game concept, world, characters, and plot generated from one sentence |
| 🖼️ **Asset Generation** | DALL-E 3 concept art for characters, enemies, backgrounds, and objects |
| 📝 **Unity Scripts** | Ready-to-use C# scripts: player controller, AI enemies, game objects, backgrounds |
| 🎮 **Playable Game** | Instantly playable 2D platformer built from your generated plan |
| 🌍 **World Creator** | 3D world editor with AI-generated textures (Stability AI) |
| 🎵 **Music Generation** | Background and action music tracks (experimental) |
| 📦 **Download Pack** | Export all assets as a ZIP: images, scripts, 3D models, and audio |
| 💾 **Project Library** | Save, load, and manage multiple game projects locally |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 (for the local dev server)
- An **OpenAI API key** — [get one here](https://platform.openai.com/api-keys)
- *(Optional)* A **Stability AI key** for world-creator textures — [get one here](https://platform.stability.ai/account/keys)

### Run locally

```bash
# 1. Clone the repo
git clone https://github.com/rhythrosa-labs/gameforge-ai.git
cd gameforge-ai

# 2. Install the dev server (one-time)
npm install

# 3. Start the server
npm run dev
# → opens at http://localhost:3000
```

> ⚠️ **You must serve the files through a local server** (not open `index.html` directly) because the app uses ES modules which require HTTP.

### First run

1. Open `http://localhost:3000` in your browser.
2. Click **Settings** in the sidebar.
3. Paste your **OpenAI API key** and click **Save Settings**.
4. Go to **Create**, describe your game, and click **Generate Game Plan**!

---

## 🗂️ Project Structure

```
gameforge-ai/
├── index.html              # App entry point
├── api-client.js           # OpenAI API shim (replaces WebSim globals)
├── app.js                  # Main application coordinator
├── config.js               # Global configuration & AI prompts
├── utils.js                # Shared utilities
│
├── template-loader.js      # Dynamic template injection
├── ui-manager.js           # DOM / UI interactions
├── file-manager.js         # localStorage project & settings management
├── project-settings-manager.js  # Settings UI + project CRUD
├── download-manager.js     # ZIP export of all assets
│
├── game-plan-generator.js  # Orchestrates all AI generation steps
├── image-generator.js      # DALL-E 3 image generation
├── script-generator.js     # GPT-4o Unity C# script generation
├── audio-generator.js      # Music / TTS generation
├── asset-analyzer.js       # Deep AI analysis for gameplay integration
│
├── world-creator.js        # Interactive 3D world editor (Three.js)
├── world-generator.js      # Procedural world generation helpers
├── game-player.js          # 2D platformer engine (Three.js ortho)
├── game-terrain.js         # Terrain/chunk management
├── player-controller.js    # Player input & physics
├── object-factory.js       # Scene object factory
├── texture-service.js      # AI texture loading & caching
│
├── templates/              # HTML templates (injected at runtime)
│   ├── sidebar-template.js
│   ├── dashboard-template.js
│   ├── my-projects-template.js
│   ├── world-creation-template.js
│   ├── play-template.js
│   ├── settings-template.js
│   ├── about-template.js
│   └── modals-template.js
│
├── base.css                # CSS reset & variables
├── components.css          # Reusable UI components
├── layout.css              # Page layout
├── themes.css              # Light/dark theme definitions
├── world-creator.css       # World editor styles
├── game-player.css         # Game player styles
└── styles.css              # Additional overrides
```

---

## 🔑 API Keys

| Key | Where to Get | Required? |
|---|---|---|
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | ✅ Yes — powers GPT-4o + DALL-E 3 |
| **Stability AI** | [platform.stability.ai/account/keys](https://platform.stability.ai/account/keys) | ⚪ Optional — world textures |

Keys are stored **exclusively in your browser's `localStorage`**; they are never sent anywhere except the respective API.

---

## 🛠️ Tech Stack

- **Frontend** — Vanilla JS (ES Modules), HTML5, CSS3
- **AI** — [OpenAI GPT-4o](https://platform.openai.com/) (text), [DALL-E 3](https://platform.openai.com/docs/guides/images) (images)
- **3D Engine** — [Three.js r132](https://threejs.org/)
- **Fonts / Icons** — Google Fonts (Poppins, Fira Code), Font Awesome 6
- **Storage** — Browser `localStorage` (no backend required)
- **Dev Server** — [serve](https://github.com/vercel/serve)

---

## 🧩 How Generation Works

```
User prompt
    │
    ▼
Game Concept (GPT-4o)
    │
    ├─► World Concept (GPT-4o)
    ├─► Character Concepts (GPT-4o)
    ├─► Plot / Narrative (GPT-4o)
    ├─► Image Assets (DALL-E 3)
    ├─► Unity C# Scripts (GPT-4o)
    └─► Background Music (TTS / Web Audio fallback)
           │
           ▼
    Deep Asset Analysis (GPT-4o)
           │
           ▼
    Level Spec Generation (GPT-4o)
           │
           ▼
    Playable 2D Game (Three.js)
```

---

## ⌨️ Controls (Playable Game)

| Key | Action |
|---|---|
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `W` / `Space` / `↑` | Jump |

---

## 🗺️ Roadmap

- [ ] Export as HTML5 game bundle
- [ ] Multiplayer support (WebRTC)
- [ ] Custom tileset editor
- [ ] In-browser script editor
- [ ] Mobile / touch controls
- [ ] Share games via URL
- [ ] Voice-to-game prompt support

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT © 2024 [Daniel Sheils](https://www.linkedin.com/in/danielsheils/) / Rhythrosa Labs

---

## 🙏 Acknowledgements

- [OpenAI](https://openai.com/) for GPT-4o and DALL-E 3
- [Three.js](https://threejs.org/) for the 3D/2D rendering engine
- [Stability AI](https://stability.ai/) for world texture generation
- [Font Awesome](https://fontawesome.com/) for icons
- Originally prototyped on [WebSim](https://websim.ai/)
