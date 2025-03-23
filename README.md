# Frontend Edit Agent

A tool that allows users to request frontend code changes using natural language, which are then analyzed by an AI agent that modifies the code and submits pull requests to GitHub.

## Features

- Input box for natural language requests about frontend edits
- AI-powered analysis of edit requests
- Automated code modifications based on the analysis
- GitHub integration for PR creation
- Visual feedback of code changes and PR details

## Setup Instructions

### Prerequisites

- Node.js and npm OR Python 3.7+
- GitHub account
- (Optional) OpenAI API key for enhanced request analysis

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/frontend-edit-agent.git
   cd frontend-edit-agent
   ```

#### Option 1: Node.js Setup

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Create an environment file:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file and add your GitHub token and OpenAI API key (if available).

#### Option 2: Python Setup

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create an environment file:
   ```
   cp .env.example.python .env
   ```

4. Edit the `.env` file and add your GitHub token and OpenAI API key (if available).

### Running the Application

#### Node.js Version

1. Start the server:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

#### Python Version

1. Start the server:
   ```
   python server.py
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter your frontend edit request and GitHub repository URL

## Usage Examples

- "Make the header background blue"
- "Increase the font size of all paragraphs"
- "Change the button color to green"
- "Add a shadow to the navigation bar"

## Technical Details

The application consists of:

1. **Frontend**: HTML, CSS, and JavaScript for the user interface
2. **Backend**: Either Node.js with Express OR Python with Flask for handling requests
3. **Integration**:
   - GitHub API (via Octokit for Node.js or PyGithub for Python) for repository interactions and PR creation
   - (Optional) OpenAI API for analyzing user requests

## Current Limitations

- The current version supports basic style changes only
- The GitHub PR creation is simulated in the demo
- For a full implementation, you would need to clone repositories, modify code, and commit changes

## Future Improvements

- Support more complex frontend modifications
- Add user authentication
- Provide templates for common edit patterns
- Add visual previews of changes before submission

## License

MIT