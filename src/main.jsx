import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { useStore } from './store/useStore.js'

// Apply dark mode on initial load
const { darkMode } = useStore.getState()
if (darkMode) document.documentElement.classList.add('dark')

// Initialize Auth
useStore.getState().initAuth()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
