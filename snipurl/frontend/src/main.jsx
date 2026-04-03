import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Application Entry Point
 * This file initializes the React application and mounts it to the DOM
 */

// Get the root DOM element where the React app will be mounted
const rootElement = document.getElementById('root')

// Create a React root and render the main App component
// React.StrictMode is disabled for better development experience
const reactRoot = ReactDOM.createRoot(rootElement)
reactRoot.render(<App />)
