# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# 1) Create & activate venv
cd C:\work\BasicBrowser\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2) Install dependencies
pip install -r requirements.txt

# 3) (Optional) choose a model (env var). Example:
$env:KIDBOT_MODEL = 'google/flan-t5-small'

# 4) Start the backend
uvicorn app:app --host 127.0.0.1 --port 8000 --reload

# 1) Build renderer
cd browserStyle
npm install
% npm run build

# 2) Start Electron from project root
cd ..
npm install
npm run dist 
% npm start

Important: to enable the KidBot background artwork, place the provided `image.png` file into `browserStyle/public/image.png`.
Then run the dev server (`npm run dev`) or rebuild the renderer so the image is served at `/image.png`.