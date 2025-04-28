import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Starting app...')

const root = document.getElementById('root')
if (!root) {
  console.error('Root element not found!')
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('App rendered successfully')
} catch (error) {
  console.error('Error rendering app:', error)
}
