import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PeerCont from './Context/PeerContext.jsx'

createRoot(document.getElementById('root')).render(

  <PeerCont>
        <App />
  </PeerCont>


    
)
