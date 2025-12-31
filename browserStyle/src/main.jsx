import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {HashRouter, Routes, Route} from 'react-router-dom'
import KidsHome from './components/KidsHome.jsx'
import AskChat from './components/AskChat.jsx'
import WebViewPage from './components/WebView.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>

      <Routes>

        <Route path="/" element={<KidsHome />} />
        <Route path="/ask" element={<AskChat />} />
        <Route path="/open" element={<WebViewPage />} />
      
      </Routes>

    </HashRouter>

  </StrictMode>,
)
