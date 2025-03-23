import os
import re
import time
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import openai
from github import Github

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__, static_folder='.')
CORS(app)

# Initialize OpenAI client (if OPENAI_API_KEY is set)
openai_client = None
if os.getenv('OPENAI_API_KEY'):
    openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Initialize GitHub client (if GITHUB_TOKEN is set)
github_client = None
if os.getenv('GITHUB_TOKEN'):
    github_client = Github(os.getenv('GITHUB_TOKEN'))

# Serve static files from the current directory
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# API route to process frontend edit requests
@app.route('/api/process-request', methods=['POST'])
def process_request():
    try:
        data = request.get_json()
        
        # Validate request data
        if not data or 'request' not in data or 'repoUrl' not in data:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        user_request = data['request']
        repo_url = data['repoUrl']
        
        # 1. Parse the GitHub repo URL
        repo_info = parse_repo_url(repo_url)
        if not repo_info:
            return jsonify({'error': 'Invalid GitHub repository URL'}), 400
        
        # 2. Analyze the request
        analysis = analyze_request(user_request)
        
        # 3. Generate code changes based on the analysis
        code_changes = generate_code_changes(analysis)
        
        # 4. Simulate creating a PR
        pr_details = simulate_create_pull_request(repo_info, analysis)
        
        # Return the results
        return jsonify({
            'analysis': analysis,
            'codeChanges': code_changes,
            'prDetails': pr_details
        })
    
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e) or 'An error occurred while processing your request'}), 500

# Helper functions

def parse_repo_url(url):
    """Parse GitHub repository URL to extract owner and repo name."""
    try:
        pattern = r'github\.com\/([^\/]+)\/([^\/\.]+)'
        match = re.search(pattern, url)
        
        if match and len(match.groups()) == 2:
            return {
                'owner': match.group(1),
                'repo': match.group(2)
            }
        
        return None
    except Exception as e:
        print(f"Error parsing repo URL: {str(e)}")
        return None

def analyze_request(request_text):
    """Analyze the user's request to determine what needs to be changed."""
    # For a production implementation, this would use OpenAI or another AI service
    # For our demo, we'll use a simple rule-based approach similar to the Node.js version
    
    request_lower = request_text.lower()
    
    analysis = {
        'requestType': 'unknown',
        'targetElements': [],
        'properties': [],
        'values': []
    }
    
    # Simple rule-based parsing
    if 'background' in request_lower or 'color' in request_lower:
        analysis['requestType'] = 'style change'
        
        if 'header' in request_lower:
            analysis['targetElements'].append('header')
        elif 'button' in request_lower:
            analysis['targetElements'].append('button')
        elif 'body' in request_lower:
            analysis['targetElements'].append('body')
        
        if 'background' in request_lower:
            analysis['properties'].append('background-color')
        elif 'color' in request_lower:
            analysis['properties'].append('color')
        
        # Extract color values
        color_keywords = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple']
        for color in color_keywords:
            if color in request_lower:
                analysis['values'].append(color)
                break
    
    elif 'font' in request_lower or 'size' in request_lower:
        analysis['requestType'] = 'font change'
        analysis['properties'].append('font-size')
        
        if 'increase' in request_lower:
            analysis['values'].append('larger')
        elif 'decrease' in request_lower:
            analysis['values'].append('smaller')
    
    return analysis

def generate_code_changes(analysis):
    """Generate code changes based on the analysis."""
    # For a real implementation, this would actually modify the code
    # Here, we'll just return a simple example
    
    original = ''
    modified = ''
    
    if 'header' in analysis['targetElements']:
        original = 'header { color: black; }'
        if 'background-color' in analysis['properties'] and analysis['values']:
            modified = f"header {{ color: black; background-color: {analysis['values'][0]}; }}"
        elif 'color' in analysis['properties'] and analysis['values']:
            modified = f"header {{ color: {analysis['values'][0]}; }}"
    
    elif 'button' in analysis['targetElements']:
        original = 'button { background-color: blue; color: white; }'
        if 'background-color' in analysis['properties'] and analysis['values']:
            modified = f"button {{ background-color: {analysis['values'][0]}; color: white; }}"
        elif 'color' in analysis['properties'] and analysis['values']:
            modified = f"button {{ background-color: blue; color: {analysis['values'][0]}; }}"
    
    return {
        'original': original,
        'modified': modified
    }

def generate_pr_title(analysis):
    """Generate a PR title based on the analysis."""
    if (analysis['requestType'] == 'style change' and analysis['targetElements'] 
            and analysis['properties'] and analysis['values']):
        return f"Update {analysis['targetElements'][0]} {analysis['properties'][0]} to {analysis['values'][0]}"
    
    return 'Frontend UI update'

def generate_branch_name(analysis):
    """Generate a branch name based on the analysis."""
    if analysis['targetElements'] and analysis['properties']:
        element = analysis['targetElements'][0]
        property_name = analysis['properties'][0]
        
        return f"update-{element}-{property_name}"
    
    return f"frontend-update-{int(time.time())}"

def simulate_create_pull_request(repo_info, analysis):
    """Simulate creating a pull request (for demo purposes)."""
    # In a real implementation, this would create a real PR using PyGithub
    # For our demo, we'll just return simulated data
    
    pr_title = generate_pr_title(analysis)
    branch_name = generate_branch_name(analysis)
    
    return {
        'url': f"https://github.com/{repo_info['owner']}/{repo_info['repo']}/pull/123",
        'title': pr_title,
        'branchName': branch_name
    }

# Run the app
if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'False').lower() == 'true')