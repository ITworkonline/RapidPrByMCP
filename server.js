require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Octokit } = require('octokit');
const OpenAI = require('openai');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI client (if OPENAI_API_KEY is set in .env)
let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

// Initialize GitHub client (if GITHUB_TOKEN is set in .env)
let octokit;
if (process.env.GITHUB_TOKEN) {
    octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from root directory

// Routes
app.post('/api/process-request', async (req, res) => {
    try {
        const { request, repoUrl } = req.body;
        
        if (!request || !repoUrl) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // 1. Parse the GitHub repo URL to extract owner and repo name
        const repoInfo = parseRepoUrl(repoUrl);
        if (!repoInfo) {
            return res.status(400).json({ error: 'Invalid GitHub repository URL' });
        }
        
        // 2. Analyze the request using AI or rule-based system
        const analysis = await analyzeRequest(request);
        
        // 3. Clone/fetch the repository
        // (For a real implementation, you'd use a Git library here)
        
        // 4. Modify the code based on the analysis
        const codeChanges = await generateCodeChanges(analysis);
        
        // 5. Create a new branch, commit changes, and push
        // (For a real implementation, this would use Git commands)
        
        // 6. Create a Pull Request
        // (For a real implementation, this would use Octokit)
        const prDetails = await simulateCreatePullRequest(repoInfo, analysis);
        
        // Return the results
        res.json({
            analysis,
            codeChanges,
            prDetails
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
    }
});

// Helper functions

// Parse GitHub repository URL to extract owner and repo name
function parseRepoUrl(url) {
    try {
        const regex = /github\.com\/([^\/]+)\/([^\/\.]+)/;
        const match = url.match(regex);
        
        if (match && match.length === 3) {
            return {
                owner: match[1],
                repo: match[2]
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error parsing repo URL:', error);
        return null;
    }
}

// Analyze the user's request using AI or rule-based system
async function analyzeRequest(request) {
    // For a real implementation, this would use OpenAI or another AI service
    // to understand the user's request and determine what needs to be changed
    
    // For our demo, we'll use a simple rule-based approach
    const requestLower = request.toLowerCase();
    
    let analysis = {
        requestType: 'unknown',
        targetElements: [],
        properties: [],
        values: []
    };
    
    // Simple rule-based parsing (in a real system, this would be more sophisticated)
    if (requestLower.includes('background') || requestLower.includes('color')) {
        analysis.requestType = 'style change';
        
        if (requestLower.includes('header')) {
            analysis.targetElements.push('header');
        } else if (requestLower.includes('button')) {
            analysis.targetElements.push('button');
        } else if (requestLower.includes('body')) {
            analysis.targetElements.push('body');
        }
        
        if (requestLower.includes('background')) {
            analysis.properties.push('background-color');
        } else if (requestLower.includes('color')) {
            analysis.properties.push('color');
        }
        
        // Extract color values
        const colorKeywords = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple'];
        for (const color of colorKeywords) {
            if (requestLower.includes(color)) {
                analysis.values.push(color);
                break;
            }
        }
    } else if (requestLower.includes('font') || requestLower.includes('size')) {
        analysis.requestType = 'font change';
        analysis.properties.push('font-size');
        
        if (requestLower.includes('increase')) {
            analysis.values.push('larger');
        } else if (requestLower.includes('decrease')) {
            analysis.values.push('smaller');
        }
    }
    
    return analysis;
}

// Generate code changes based on the analysis
async function generateCodeChanges(analysis) {
    // For a real implementation, this would actually modify the code
    // Here, we'll just return a simple example
    
    let original = '';
    let modified = '';
    
    if (analysis.targetElements.includes('header')) {
        original = 'header { color: black; }';
        if (analysis.properties.includes('background-color') && analysis.values.length > 0) {
            modified = `header { color: black; background-color: ${analysis.values[0]}; }`;
        } else if (analysis.properties.includes('color') && analysis.values.length > 0) {
            modified = `header { color: ${analysis.values[0]}; }`;
        }
    } else if (analysis.targetElements.includes('button')) {
        original = 'button { background-color: blue; color: white; }';
        if (analysis.properties.includes('background-color') && analysis.values.length > 0) {
            modified = `button { background-color: ${analysis.values[0]}; color: white; }`;
        } else if (analysis.properties.includes('color') && analysis.values.length > 0) {
            modified = `button { background-color: blue; color: ${analysis.values[0]}; }`;
        }
    }
    
    return {
        original,
        modified
    };
}

// Simulate creating a pull request (for demo purposes)
async function simulateCreatePullRequest(repoInfo, analysis) {
    // In a real implementation, this would create a real PR using Octokit
    // For our demo, we'll just return simulated data
    
    const prTitle = generatePrTitle(analysis);
    const branchName = generateBranchName(analysis);
    
    return {
        url: `https://github.com/${repoInfo.owner}/${repoInfo.repo}/pull/123`,
        title: prTitle,
        branchName: branchName
    };
}

// Generate a PR title based on the analysis
function generatePrTitle(analysis) {
    if (analysis.requestType === 'style change' && analysis.targetElements.length > 0 && analysis.properties.length > 0 && analysis.values.length > 0) {
        return `Update ${analysis.targetElements[0]} ${analysis.properties[0]} to ${analysis.values[0]}`;
    }
    
    return 'Frontend UI update';
}

// Generate a branch name based on the analysis
function generateBranchName(analysis) {
    if (analysis.targetElements.length > 0 && analysis.properties.length > 0) {
        const element = analysis.targetElements[0];
        const property = analysis.properties[0].replace('-', '-');
        
        return `update-${element}-${property}`;
    }
    
    return 'frontend-update-' + Date.now();
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});