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

// Recharts components for data visualization
// Each component has a specific purpose - we'll use them below
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

// Our component styles
import './App.css'

// -----------------------------------------------------------------------------
// STEP 2: CONSTANTS
// -----------------------------------------------------------------------------

// Backend API URL - change this when deploying
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
  
  // State for storing fleet data from API
  // Initial value is empty array []
  const [fleetData, setFleetData] = useState([])
  
  // State for storing summary statistics
  const [summaryData, setSummaryData] = useState([])
  
  // State for loading indicator
  const [loading, setLoading] = useState(true)
  
  // State for error handling
  const [error, setError] = useState(null)

  // ---------------------------------------------------------------------------
  // STEP 3b: DATA FETCHING WITH useEffect
  // ---------------------------------------------------------------------------
  // useEffect runs AFTER the component renders
  // The empty array [] means "run only once when component mounts"
  
  useEffect(() => {
    // Define async function inside useEffect
    // (useEffect callback itself can't be async)
    async function fetchData() {
      try {
        // fetch() makes HTTP requests
        // await pauses until the request completes
        
        // Fetch all fleet data
        const fleetResponse = await fetch(`${API_URL}/api/fleet-data`)
        
        // Check if request was successful
        if (!fleetResponse.ok) {
          throw new Error('Failed to fetch fleet data')
        }
        
        // Parse JSON response into JavaScript object
        const fleetJson = await fleetResponse.json()
        
        // Fetch summary data
        const summaryResponse = await fetch(`${API_URL}/api/fleet-summary`)
        
        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch summary data')
        }
        
        const summaryJson = await summaryResponse.json()
        
        // Update state with fetched data
        // This triggers a re-render with the new data
        setFleetData(fleetJson)
        setSummaryData(summaryJson)
        setLoading(false)
        
      } catch (err) {
        // If anything fails, store the error
        setError(err.message)
        setLoading(false)
      }
    }
    
    // Call the async function
    fetchData()
    
  }, [])  // Empty dependency array = run once on mount

  // ---------------------------------------------------------------------------
  // STEP 3c: CONDITIONAL RENDERING
  // ---------------------------------------------------------------------------
  // Show different UI based on state
  
  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="loading">
        <p>Loading dashboard...</p>
      </div>
    )
  }
  
  // Show error message if something went wrong
  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <p>Make sure the Flask backend is running on port 5000</p>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // STEP 3d: PREPARE DATA FOR CHARTS
  // ---------------------------------------------------------------------------
  
  // For the line chart, we need data grouped by month with each fleet as a series
  // Current format: [{fleet_id: 'F-18', month: 'Jan', availability: 85}, ...]
  // Needed format: [{month: 'Jan', 'F-18': 85, 'CH-147': 72, ...}, ...]
  
  // Get unique months
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
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Fleet Performance Dashboard</h1>
        <p>Aircraft availability and maintenance metrics</p>
      </header>

      {/* Main content area */}
      <main className="dashboard-content">
        
        {/* Summary Cards Row */}
        <section className="summary-cards">
          {summaryData.map((fleet, index) => (
            // Key prop is required when rendering lists
            // It helps React identify which items changed
            <div key={fleet.fleet_id} className="card">
              <h3>{fleet.fleet_id}</h3>
              <div className="card-stat">
                <span className="stat-value">{fleet.avg_availability}%</span>
                <span className="stat-label">Avg Availability</span>
              </div>
              <div className="card-stat">
                <span className="stat-value">{fleet.total_missions}</span>
                <span className="stat-label">Total Missions</span>
              </div>
            </div>
          ))}
        </section>

        {/* Charts Row */}
        <section className="charts-row">
          
          {/* Line Chart: Availability Trend */}
          <div className="chart-container">
            <h2>Fleet Availability Trend</h2>
            {/* ResponsiveContainer makes chart resize with parent */}
            {/* width="100%" and height={300} set dimensions */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                {/* Grid lines in background */}
                <CartesianGrid strokeDasharray="3 3" />
                
                {/* X axis - shows months */}
                {/* dataKey tells it which property to use for labels */}
                <XAxis dataKey="month" />
                
                {/* Y axis - shows percentage values */}
                {/* domain sets min/max range */}
                <YAxis domain={[60, 100]} />
                
                {/* Tooltip shows values on hover */}
                <Tooltip />
                
                {/* Legend shows which color is which fleet */}
                <Legend />
                
                {/* Create a Line for each fleet */}
                {fleetIds.map((fleetId, index) => (
                  <Line
                    key={fleetId}
                    type="monotone"        // Smooth curve between points
                    dataKey={fleetId}      // Which property to plot
                    stroke={COLORS[index]} // Line color
                    strokeWidth={2}        // Line thickness
                    dot={{ r: 4 }}         // Point radius
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Missions Completed */}
          <div className="chart-container">
            <h2>Total Missions by Fleet</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fleet_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_missions" fill="#0088FE">
                  {/* Map cells to apply different colors to each bar */}
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Second Charts Row */}
        <section className="charts-row">
          
          {/* Pie Chart: Maintenance Hours Distribution */}
          <div className="chart-container">
            <h2>Maintenance Hours Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summaryData}
                  dataKey="total_maintenance_hours"  // Value for slice size
                  nameKey="fleet_id"                 // Label for each slice
                  cx="50%"                           // Center X (percentage)
                  cy="50%"                           // Center Y (percentage)
                  outerRadius={100}                  // Pie radius in pixels
                  label                             // Show labels on slices
                >
                  {/* Custom colors for each slice */}
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Maintenance Hours */}
          <div className="chart-container">
            <h2>Total Maintenance Hours</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryData} layout="vertical">
                {/* layout="vertical" makes bars horizontal */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="fleet_id" type="category" />
                <Tooltip />
                <Bar dataKey="total_maintenance_hours" fill="#00C49F">
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Data Table */}
        <section className="data-table-section">
          <h2>Detailed Fleet Data</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fleet</th>
                <th>Month</th>
                <th>Availability %</th>
                <th>Missions</th>
                <th>Maintenance Hours</th>
              </tr>
            </thead>
            <tbody>
              {fleetData.map((row, index) => (
                <tr key={index}>
                  <td>{row.fleet_id}</td>
                  <td>{row.month}</td>
                  <td>{row.availability}%</td>
                  <td>{row.missions_completed}</td>
                  <td>{row.maintenance_hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Fleet Performance Dashboard • Built with React + Flask + Pandas</p>
      </footer>
    </div>
  )
}

// Export the component so main.jsx can import it
export default App