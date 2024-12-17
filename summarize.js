const axios = require('axios');
const { performance } = require('perf_hooks');

async function summarizeText(text) {
    // Validate input
    if (!text || text.trim().length < 200) {
        throw new Error('Input text is too short. Minimum 200 characters required.');
    }

    const startTime = performance.now();
    console.log(`Summarizing text (${text.length} chars)`);

    const data = JSON.stringify({
        "inputs": text,
        "parameters": {
            "max_length": 150,
            "min_length": 50,
            "do_sample": false
        }
    });

    const config = {
        method: 'post',
        url: 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        data: data,
        timeout: 10000 // 10 seconds timeout
    };

    try {
        const response = await axios.request(config);
        
        // Detailed logging
        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', response.headers);
        console.log('API Response Data:', JSON.stringify(response.data, null, 2));

        if (!response.data || response.data.length === 0) {
            throw new Error('No summary generated');
        }

        const summary = response.data[0].summary_text;
        const endTime = performance.now();
        
        console.log(`Summarization completed in ${(endTime - startTime).toFixed(2)}ms`);
        
        return summary;
    } catch (err) {
        // Even more detailed error logging
        console.error('Full Error Object:', err);
        
        // Detailed error logging
        console.error('Detailed Error Information:');
        console.error('Error Message:', err.message);
        
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
            console.error('Response Headers:', err.response.headers);
            
            throw new Error(`API Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
            console.error('No response received. Request details:', err.request);
            throw new Error('No response received from summarization service');
        } else {
            console.error('Error setting up request:', err.message);
            throw new Error('Error in summarization process');
        }
    }
}

module.exports = summarizeText;