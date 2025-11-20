from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='.')
# Configure CORS to allow all origins (for Railway deployment)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global error handler to ensure JSON responses
@app.errorhandler(404)
def not_found(error):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    return send_from_directory('.', 'index.html')

@app.errorhandler(500)
def internal_error(error):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Internal server error', 'details': str(error)}), 500
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    try:
        # Check if this is an API request
        if hasattr(request, 'path') and request.path.startswith('/api/'):
            print(f"API Error: {str(e)}")
            print(traceback.format_exc())
            return jsonify({'error': str(e)}), 500
    except:
        # If we can't access request, just return a generic error
        pass
    # Re-raise for non-API routes to let Flask handle it
    raise e

# Initialize xAI Grok API client using OpenAI SDK
# Note: API key can be provided via frontend settings (stored in localStorage)
# Environment variable is optional - frontend will send API key in request
api_key = os.getenv('XAI_API_KEY')
if api_key:
    # Initialize OpenAI client with xAI endpoint if env var is set
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.x.ai/v1"
    )
else:
    # API key will be provided by frontend via request body
    client = None

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'API is working'}), 200

@app.route('/api/mix-names', methods=['POST'])
def mix_names():
    try:
        print(f"API Route hit: /api/mix-names")
        print(f"Request method: {request.method}")
        print(f"Content-Type: {request.content_type}")
        
        # Check if request has JSON content
        if not request.is_json:
            print("Request is not JSON")
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        data = request.json
        if not data:
            print("No data in request")
            return jsonify({'error': 'Invalid JSON in request body'}), 400
        
        print(f"Received data: {data}")
        
        # Extract names from request with proper None handling
        # Use 'or' to handle None values explicitly set in JSON
        left_first = (data.get('leftFirstName') or '').strip()
        left_last = (data.get('leftLastName') or '').strip()
        right_first = (data.get('rightFirstName') or '').strip()
        right_last = (data.get('rightLastName') or '').strip()
        
        # Validate input
        if not all([left_first, left_last, right_first, right_last]):
            return jsonify({'error': 'All name fields are required'}), 400
        
        # Get API key from request or use environment variable
        request_api_key = (data.get('apiKey') or '').strip()
        active_api_key = request_api_key if request_api_key else api_key
        
        # Check if API key is available
        if not active_api_key:
            return jsonify({'error': 'API key not configured. Please set your Grok API key in the settings (gear icon) in the application.'}), 500
        
        # Create client with the active API key
        active_client = client if (not request_api_key and client) else OpenAI(
            api_key=active_api_key,
            base_url="https://api.x.ai/v1"
        )
        
        # Craft the prompt for Grok
        prompt = f"""You are a name mixing expert. Your task is to intelligently mix two names based on specific rules and correlation patterns.

RULES:
1. Take the first 3 letters from the RIGHT side's first name and add them as a prefix to the LEFT side's first name
2. CRITICAL: The LEFT side's first name MUST be preserved COMPLETELY, including ALL middle names and spaces. 
   - If the left first name is "Dinh Thi", the mixed result must preserve the FULL "Dinh Thi" 
   - The result should be "matdinh thi" (combining the prefix with the complete first name including middle name)
   - DO NOT split or separate the left side's first name - keep it intact as one unit
3. For the last name, take the first 3 letters from the RIGHT side's last name and add them as a prefix to the LEFT side's last name
4. IMPORTANT: Find correlations and overlapping patterns between names to create natural-sounding combinations
5. When there are matching letters or patterns, merge them intelligently so that removing letters from the mixed name reveals the original left name

EXAMPLES:
Example 1:
- Left: John Doe
- Right: Kelly Connor
- Mixed First Name: kelJohn (kel + John)
- Mixed Last Name: conDoe (con + Doe)

Example 2:
- Left: John Doe
- Right: Kelly Dong
- Mixed First Name: kelJohn (kel + John)
- Mixed Last Name: Done (do + ne, where 'do' from Dong matches the start of 'Doe', creating correlation - when you remove 'n' from 'Done' you get 'Doe')

Example 3 (with middle name - CRITICAL):
- Left: Dinh Thi Hoang (where "Dinh Thi" is the first name with middle name)
- Right: Mat Tran
- Mixed First Name: matdinh thi (mat + "Dinh Thi" - preserving the COMPLETE first name "Dinh Thi" with space)
- Mixed Last Name: traHoang (tra + Hoang)

Example 4 (another middle name example):
- Left: Nguyen Van An (where "Nguyen Van" is the first name with middle name)
- Right: Le Tran
- Mixed First Name: lenNguyen Van (le + "Nguyen Van" - preserving the COMPLETE first name "Nguyen Van" with space)
- Mixed Last Name: traAn (tra + An)

Now mix these names:
Left side (real passenger): {left_first} {left_last}
Right side (name to mix with): {right_first} {right_last}

IMPORTANT: Preserve the COMPLETE first name from the left side (including all middle names) in the mixed result.

Respond ONLY with a JSON object in this exact format:
{{"mixedFirstName": "...", "mixedLastName": "..."}}"""
        
        # Call Grok API using OpenAI-compatible interface
        response = active_client.chat.completions.create(
            model="grok-4-1-fast-non-reasoning",  # Latest Grok 4.1 model
            messages=[
                {"role": "system", "content": "You are a helpful assistant that always responds with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )
        
        # Parse the response
        result = json.loads(response.choices[0].message.content)
        
        return jsonify(result)
        
    except json.JSONDecodeError as e:
        return jsonify({'error': 'Failed to parse Grok response', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Static file routes - must be after API routes to avoid conflicts
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Don't serve API routes as static files
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    return send_from_directory('.', path)

if __name__ == '__main__':
    # Get port from environment variable (Railway provides this) or default to 5001 for local
    port = int(os.environ.get('PORT', 5001))
    # Bind to 0.0.0.0 to accept connections from Railway
    host = os.environ.get('HOST', '0.0.0.0')
    # Disable debug mode in production
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, port=port, host=host)

