// =============================================================================
// FILE: frontend/src/main.jsx
// PURPOSE: Entry point - mounts React app to the DOM
// =============================================================================

// -----------------------------------------------------------------------------
// STEP 1: IMPORTS
// -----------------------------------------------------------------------------
// React: The core library
import React from 'react'

// ReactDOM: Connects React to the browser's DOM
// createRoot is the modern way (React 18+) to render apps
import reactDOM from 'react-dom/client'

//import all our components from the current directory
// Our main App component in the current directory | "./" means the current directory
import App from './App.jsx'

//global styles
import './index.css'


//Step 2: Mount the App
// -----------------------------------------------------------------------------
// document.getElementById('root') finds the <div id="root"> in index.html
// createRoot() creates a React root for that element
// .render() puts our App component inside that div

reactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode helps catch bugs by running extra checks in development
  // it doesn't affect production builds
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)