document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('edit-request-form');
    const requestInput = document.getElementById('request-input');
    const repoUrl = document.getElementById('repo-url');
    const submitBtn = document.getElementById('submit-btn');
    const statusOutput = document.getElementById('status-output');
    const resultsContainer = document.getElementById('results-container');
    const analysisOutput = document.getElementById('analysis-output');
    const codeDiff = document.getElementById('code-diff');
    const prDetails = document.getElementById('pr-details');

    // Process the user's request
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate inputs
        if (!requestInput.value.trim()) {
            alert('Please enter a request!');
            return;
        }
        
        if (!repoUrl.value.trim()) {
            alert('Please enter a GitHub repository URL!');
            return;
        }
        
        // Update UI to show processing
        submitBtn.disabled = true;
        statusOutput.textContent = 'Processing your request...';
        resultsContainer.style.display = 'none';

        try {
            // Send request to backend
            const response = await processRequest(requestInput.value, repoUrl.value);
            
            // Display results
            displayResults(response);
            
            // Update status
            statusOutput.textContent = 'Request processed successfully!';
        } catch (error) {
            console.error('Error:', error);
            statusOutput.textContent = `Error: ${error.message || 'Something went wrong'}`;
        } finally {
            submitBtn.disabled = false;
        }
    });

    // Function to send request to backend
    async function processRequest(request, repoUrl) {
        try {
            const response = await fetch('/api/process-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    request,
                    repoUrl
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process request');
            }
            
            const data = await response.json();
            
            // Normalize response properties (handle different naming conventions between Node/Python)
            return {
                analysis: data.analysis || {},
                codeChanges: data.codeChanges || data.code_changes || {},
                prDetails: data.prDetails || data.pr_details || {}
            };
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    }

    // Function to display results
    function displayResults(response) {
        const analysis = response.analysis || {};
        const targetElements = analysis.targetElements || analysis.target_elements || [];
        const properties = analysis.properties || [];
        const values = analysis.values || [];
        
        // Display analysis
        analysisOutput.innerHTML = `
            <p><strong>Request Type:</strong> ${analysis.requestType || analysis.request_type || 'Unknown'}</p>
            <p><strong>Target Elements:</strong> ${Array.isArray(targetElements) ? targetElements.join(', ') : targetElements || 'None'}</p>
            <p><strong>Properties to Change:</strong> ${Array.isArray(properties) ? properties.join(', ') : properties || 'None'}</p>
            <p><strong>New Values:</strong> ${Array.isArray(values) ? values.join(', ') : values || 'None'}</p>
        `;
        
        const codeChanges = response.codeChanges || {};
        
        // Display code diff
        codeDiff.innerHTML = `
            <strong>Original:</strong>\n${codeChanges.original || 'No changes'}\n\n
            <strong>Modified:</strong>\n${codeChanges.modified || 'No changes'}
        `;
        
        const prDetails = response.prDetails || {};
        
        // Display PR details
        prDetails.innerHTML = `
            <p><strong>PR URL:</strong> <a href="${prDetails.url || '#'}" target="_blank">${prDetails.url || 'Not available'}</a></p>
            <p><strong>Title:</strong> ${prDetails.title || 'Not available'}</p>
            <p><strong>Branch:</strong> ${prDetails.branchName || prDetails.branch_name || 'Not available'}</p>
        `;
        
        // Show results container
        resultsContainer.style.display = 'block';
    }
});