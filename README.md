# KidsSafeBrowser 🧒🔒

KidsSafeBrowser is a cross-platform desktop application built with Electron that provides a safe and customizable browsing experience for children. It integrates a React-based renderer (via Vite) and supports backend AI features through KidBot.

## ✨ Features

- 🚀 Electron-based desktop app (Windows, macOS, Linux)
- 🎨 Custom renderer built with React + Vite
- 🔧 Live reload during development with electronmon
- 📦 Cross-platform builds using electron-builder
- 🌐 Separate build:web script for building the renderer only
- 🖼️ Optional KidBot background artwork integration
- 🔒 Safe browsing environment tailored for kids

## 📂 Project Structure

```
kids-browser/
├── main.js              # Electron main process
├── preload.js           # Preload scripts
├── dist/                # Compiled renderer output
├── browserStyle/        # React + Vite renderer source
├── assets/              # Icons and build resources
└── package.json         # Project configuration
```

## ⚙️ Installation & Setup

### 1. Backend Setup (KidBot)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # On Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Optional - Choose a model:

```bash
export KIDBOT_MODEL="google/flan-t5-small"
```

Start backend server:

```bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Renderer Setup

**Option A: Build web renderer only**

```bash
npm run build:web
```

**Option B: Standard build inside browserStyle**

```bash
cd browserStyle
npm install
npm run build
```

### 3. Electron App Setup

```bash
cd ..
npm install
npm start        # Run in development
npm run devLive  # Run with live reload
npm run build    # Build distributable packages
```

## 🎨 KidBot Artwork

To enable KidBot background artwork:

1. Place your image at `browserStyle/public/image.png`
2. Run the dev server or rebuild the renderer:

```bash
npm run dev
# or
npm run build:web
```

## 🖥️ Build Targets

- Windows → NSIS installer
- macOS → App category: Utilities
- Linux → AppImage

For the latest release, see [Releases](https://github.com/yourusername/kids-browser/releases/latest)

## 📜 License

This project is licensed under the MIT License.