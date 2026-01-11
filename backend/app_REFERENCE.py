# =============================================================================
# FILE: backend/app.py
# PURPOSE: Flask API server that serves fleet performance data
# =============================================================================

# -----------------------------------------------------------------------------
# STEP 1: IMPORTS
# -----------------------------------------------------------------------------
# Flask: The web framework - handles HTTP requests/responses
# jsonify: Converts Python dictionaries to JSON (what APIs return)
# CORS: Cross-Origin Resource Sharing - lets React (port 5173) talk to Flask (port 5000)
from flask import Flask, jsonify
from flask_cors import CORS

# Pandas: Data analysis library - we'll use it to process our fleet data
import pandas as pd

# -----------------------------------------------------------------------------
# STEP 2: CREATE FLASK APP INSTANCE
# -----------------------------------------------------------------------------
# __name__ tells Flask where to find resources (templates, static files)
# It's a Python variable that equals the current module name
app = Flask(__name__)

# Enable CORS for all routes
# Without this, your browser blocks React from calling this API
# (security feature called "Same-Origin Policy")
CORS(app)

# -----------------------------------------------------------------------------
# STEP 3: CREATE SAMPLE DATA
# -----------------------------------------------------------------------------
# In a real app, this would come from a database (PostgreSQL)
# We're simulating fleet availability data like ACF would track

def get_fleet_data():
    """
    Creates a pandas DataFrame with sample fleet performance data.
    
    Why pandas here?
    - Real ACF work involves processing CSVs, database exports, etc.
    - Pandas makes filtering, grouping, calculating averages easy
    - This simulates what you'd do with real maintenance data
    """
    
    # Raw data as a dictionary
    # Each key becomes a column, each list item becomes a row
    data = {
        'fleet_id': ['F-18', 'F-18', 'F-18', 'F-18', 
                     'CH-147', 'CH-147', 'CH-147', 'CH-147',
                     'CP-140', 'CP-140', 'CP-140', 'CP-140'],
        'month': ['Jan', 'Feb', 'Mar', 'Apr'] * 3,  # Repeat for each fleet
        'availability': [85, 87, 82, 88,    # F-18 percentages
                        72, 75, 78, 80,     # CH-147 percentages  
                        90, 88, 92, 91],    # CP-140 percentages
        'missions_completed': [45, 52, 38, 55,
                              28, 32, 35, 40,
                              62, 58, 65, 63],
        'maintenance_hours': [320, 280, 360, 250,
                             450, 420, 380, 350,
                             180, 210, 160, 175]
    }
    
    # Create DataFrame from dictionary
    # DataFrame = 2D table (like Excel spreadsheet)
    df = pd.DataFrame(data)
    
    return df

# -----------------------------------------------------------------------------
# STEP 4: API ROUTES (ENDPOINTS)
# -----------------------------------------------------------------------------

# Route 1: Health check
# Purpose: Verify the API is running (useful for deployment)
@app.route('/')
def home():
    """
    @app.route('/') is a decorator - it tells Flask:
    "When someone visits the root URL, run this function"
    
    Decorators modify/extend function behavior without changing the function
    """
    return jsonify({
        'status': 'online',
        'message': 'Fleet Dashboard API'
    })



# Route 2: Get all fleet data
@app.route('/api/fleet-data')
def get_all_fleet_data():
    """
    Returns all fleet performance data as JSON.
    
    Why this endpoint?
    - React frontend will call this to get data for charts
    - API returns JSON, React converts to JavaScript objects
    """
    # Get our pandas DataFrame
    df = get_fleet_data()
    
    # Convert DataFrame to list of dictionaries
    # orient='records' means each row becomes a dictionary
    # Example: [{'fleet_id': 'F-18', 'month': 'Jan', ...}, {...}]
    data = df.to_dict(orient='records')
    
    # jsonify converts Python dict/list to JSON response
    return jsonify(data)


# Route 3: Get summary statistics per fleet
@app.route('/api/fleet-summary')
def get_fleet_summary():
    """
    Returns aggregated statistics per fleet.
    
    This demonstrates pandas groupby - very common in data analysis.
    ACF would use this to show "average availability by fleet" etc.
    """
    df = get_fleet_data()
    
    # Group by fleet_id and calculate aggregates
    # .agg() lets you apply multiple functions to multiple columns
    summary = df.groupby('fleet_id').agg({
        'availability': 'mean',           # Average availability
        'missions_completed': 'sum',      # Total missions
        'maintenance_hours': 'sum'        # Total maintenance hours
    }).round(1)  # Round to 1 decimal place
    
    # reset_index() converts fleet_id from index back to column
    # This makes it easier to convert to JSON
    summary = summary.reset_index()
    
    # Rename columns to be more descriptive
    summary.columns = ['fleet_id', 'avg_availability', 'total_missions', 'total_maintenance_hours']
    
    return jsonify(summary.to_dict(orient='records'))


# Route 4: Get data for a specific fleet
@app.route('/api/fleet/<fleet_id>')
def get_single_fleet(fleet_id):
    """
    Returns data for one specific fleet.
    
    <fleet_id> in the route is a URL parameter.
    Example: /api/fleet/F-18 → fleet_id = "F-18"
    
    This pattern is common in REST APIs:
    - /api/users/123 → get user with ID 123
    - /api/products/abc → get product with ID abc
    """
    df = get_fleet_data()
    
    # Filter DataFrame to only rows where fleet_id matches
    # df['fleet_id'] == fleet_id creates a boolean Series (True/False for each row)
    # df[boolean_series] keeps only True rows
    fleet_df = df[df['fleet_id'] == fleet_id]
    
    # Check if fleet exists
    if fleet_df.empty:
        # Return 404 error if fleet not found
        # Tuple format: (response_data, status_code)
        return jsonify({'error': 'Fleet not found'}), 404
    
    return jsonify(fleet_df.to_dict(orient='records'))


# -----------------------------------------------------------------------------
# STEP 5: RUN THE APPLICATION
# -----------------------------------------------------------------------------
if __name__ == '__main__':
    """
    __name__ == '__main__' means:
    "Only run this if the file is executed directly"
    (Not when imported as a module)
    
    app.run() starts the Flask development server
    - debug=True: Auto-reloads when you save changes, shows detailed errors
    - host='0.0.0.0': Accepts connections from any IP (needed for Docker)
    - port=5000: The port number to listen on
    """
    app.run(debug=True, host='0.0.0.0', port=5000)