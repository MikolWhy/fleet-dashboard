// =============================================================================
// FILE: frontend/src/App.jsx
// PURPOSE: Main dashboard component - contains all charts and data
// =============================================================================

// -----------------------------------------------------------------------------
// STEP 1: IMPORTS
// -----------------------------------------------------------------------------

// useState: Hook to manage component state (data that changes)
// useEffect: Hook to perform side effects (API calls, timers, etc.)
import { useState, useEffect } from 'react'

// our component styles
import './App.css'


// Recharts components for data visualization
// Each component has a specific purpose - we'll use them below
// NOTE: could install using wildcard: import * as Recharts from 'recharts' then use eg: Recharts.Line
import {
  LineChart,      // Chart type: lines connecting data points
  Line,           // Individual line in the chart
  BarChart,       // Chart type: vertical/horizontal bars
  Bar,            // Individual bar series
  XAxis,          // Horizontal axis (categories)
  YAxis,          // Vertical axis (values)
  CartesianGrid,  // Background grid lines
  Tooltip,        // Popup showing values on hover
  Legend,         // Shows what each color means
  ResponsiveContainer,  // Makes charts resize with container
  PieChart,       // Chart type: circular pie/donut
  Pie,            // The actual pie
  Cell            // Individual pie slice (for custom colors)
} from 'recharts'

// -----------------------------------------------------------------------------
// STEP 2: CONSTANTS
// -----------------------------------------------------------------------------

//backend API URL - change this when deploying, port was set in backend
const API_URL = 'http://localhost:5000'

// Colors for charts - professional palette
// These will be used for different fleets/metrics
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']



// -----------------------------------------------------------------------------
// STEP 3: MAIN COMPONENT
// -----------------------------------------------------------------------------


function App() {
  // ---------------------------------------------------------------------------
  // STEP 3a: STATE DECLARATIONS
  // ---------------------------------------------------------------------------
  // useState returns [currentValue, setterFunction]
  // When you call the setter, React re-renders the component
  
  //state for storing fleet data from API
  //initial value is empty array []
  const [fleetData, setFleetData] = useState([])
  
  // State for storing summary statistics
  const [summaryData, setSummaryData] = useState([])
  
  // State for loading indicator
  const [loading, setLoading] = useState(true)
  
  // State for error handling. Could have intialized as empty string but null preferred
  const [error, setError] = useState(null)



  
  // ---------------------------------------------------------------------------
  // STEP 3b: DATA FETCHING WITH useEffect
  // ---------------------------------------------------------------------------
  // useEffect runs AFTER the component renders
  // The empty array [] means "run only once when component mounts"
useEffect (() => {
    // Define async function inside useEffect since useEffect callback itself can't be async
    async function fetchData (){
      try {
        // fetch() makes HTTP requests
        // await pauses until the request completes

        //==========================================================
        //fetch all fleet data
        const fleetResponse = await fetch (`${API_URL}/api/fleet-data`)

        // check if the request was successful
        if (!fleetResponse.ok){
          throw new Error ('Failed to fetch fleet data')
        }
        
        //if passed then it was success
        // Parse JSON response into JavaScript Object with .json()
        const fleetJson = await fleetResponse.json()

        //===========================================================
        //Now we do same thign for the other routes in the backend 
        const summaryResponse = await fetch(`${API_URL}/api/fleet-summary`)
        
        if (!summaryResponse.ok){
          return new Error ('Failed to fetch summary data')
        }

        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch summary data')
        }
        
        const summaryJson = await summaryResponse.json()
        //===========================================================
         // Update state with fetched data with previous declared setters
        // This triggers a re-render with the new data
        setFleetData(fleetJson)
        setSummaryData(summaryJson)
        setLoading(false)

      } catch (err){
        //if anything fails store the error and update the error state
        setError(err.message)
        setLoading(false)
      }
    }

}, []) // empty dependency array = run once on mount / intial render NOT again when state/props change

//OPTIONS for useEffect dependency arrays:
// current one above, Empty Array: runs once on component mounting - intial data fetching, setup
// NO Array: runs on every render (can cause infinite loops), AVOID unless need in niche cases
// Array WITH dependencies [user_id]: runs when user_id changes or updates (props/state)
// can do Multiple dependencies like above
// Clean up Function: something something yeah. mostly just adding a timer and return statements, then runs once more



  // ---------------------------------------------------------------------------
  // STEP 3c: CONDITIONAL RENDERING
  // ---------------------------------------------------------------------------
  // Show different UI based on state
  

  //show loading spinner while fetching
  if (loading){
    return (
      <div className="loading">
        <p>Loading Dashboard...</p>
      </div>
    )
  }

  //show error message if something went wrong
  if (error){
    return (
      <div className="error">
        <p>Error: {error}</p>
        <p>Make sure the flask backend is running on port 5000</p>
      </div>
    )
  }

  
  // ---------------------------------------------------------------------------
  // STEP 3d: PREPARE DATA FOR CHARTS
  // ---------------------------------------------------------------------------
  
  // For the line chart, we need data grouped by month with each fleet as a series
  // Current format: [{fleet_id: 'F-18', month: 'Jan', availability: 85}, ...]
  // Needed format: [{month: 'Jan', 'F-18': 85, 'CH-147': 72, ...}, ...]

  // Get unique months. "..." is the Spread Operator. expands an iterable array/set/etc into individual elements
  const months = [...new Set(fleetData.map(item => item.month))]
  
  // Transform data for line chart
  const lineChartData = months.map(month => {
    // Start with just the month
    const dataPoint = { month }
    
    // Add each fleet's availability for this month
    fleetData
      .filter(item => item.month === month)
      .forEach(item => {
        dataPoint[item.fleet_id] = item.availability
      })
    
    return dataPoint
  })
  
  // Get unique fleet IDs for creating lines
  const fleetIds = [...new Set(fleetData.map(item => item.fleet_id))]



  // ---------------------------------------------------------------------------
  // STEP 3e: RENDER THE DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
