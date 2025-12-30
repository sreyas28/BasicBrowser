import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {HashRouter, Routes, Route} from 'react-router-dom'
import KidsHome from './components/KidsHome.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>

      <Routes>

        <Route path="/" element={<KidsHome />} />
      
      </Routes>

    </HashRouter>

  </StrictMode>,
)
