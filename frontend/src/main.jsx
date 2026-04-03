import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ActorProvider } from "@/context/actorContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ActorProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ActorProvider>
  </StrictMode>,
)
